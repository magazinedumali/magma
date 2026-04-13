/**
 * URLs de transformation Supabase Storage (Image Transformations).
 * @see https://supabase.com/docs/guides/storage/serving/image-transformations
 *
 * Par défaut : désactivé (URLs `object/public` inchangées), car les transformations
 * nécessitent un projet Supabase avec Image Transformations (souvent Pro).
 *
 * Pour activer : dans `.env`
 *   VITE_SUPABASE_IMAGE_TRANSFORM=true
 */

const OBJECT_PUBLIC = '/storage/v1/object/public/';
const RENDER_PUBLIC = '/storage/v1/render/image/public/';

export type ImageDisplayPreset =
  | 'thumb'
  | 'card'
  | 'hero'
  | 'articleBody'
  /** Grille bibliothèque médias admin (~2× densité pour vignettes nettes) */
  | 'mediaLibrary';

const PRESETS: Record<
  ImageDisplayPreset,
  { width: number; height?: number; quality: number; resize: 'cover' | 'contain' | 'fill' }
> = {
  /** Listes, petites vignettes (~2x pour écrans retina) */
  thumb: { width: 420, quality: 78, resize: 'cover' },
  /** Cartes type ArticleCard */
  card: { width: 960, quality: 80, resize: 'cover' },
  /** Sélecteur d’images admin (WordPress-like) : largeur suffisante pour Retina */
  mediaLibrary: { width: 1024, quality: 92, resize: 'cover' },
  /** Slider / grandes bannières */
  hero: { width: 1920, quality: 82, resize: 'cover' },
  /** Image principale article (détail) */
  articleBody: { width: 1200, quality: 82, resize: 'contain' },
};

export type OptimiseImageOptions = {
  width?: number;
  height?: number;
  quality?: number;
  resize?: 'cover' | 'contain' | 'fill';
};

function isTransformEnabled(): boolean {
  return import.meta.env.VITE_SUPABASE_IMAGE_TRANSFORM === 'true';
}

function shouldSkip(src: string): boolean {
  if (!src.trim()) return true;
  if (src.startsWith('/') || src.startsWith('data:')) return true;
  if (src.includes('placeholder.svg')) return true;
  return false;
}

/**
 * URL `.../storage/v1/object/public/{bucket}/...` utilisable dans le navigateur :
 * encode chaque segment du chemin (espaces, accents dans les noms de fichiers).
 *
 * À utiliser pour la bibliothèque médias : ne passe **pas** par `/render/` (souvent 404
 * si Image Transformations n’est pas activé sur le projet Supabase).
 */
export function normalizeStoragePublicUrlForBrowser(url: string | null | undefined): string {
  if (url == null || url === '') return '';
  if (!url.includes(OBJECT_PUBLIC)) return url;
  try {
    const u = new URL(url);
    const path = u.pathname;
    const idx = path.indexOf(OBJECT_PUBLIC);
    if (idx === -1) return url;
    const base = path.slice(0, idx + OBJECT_PUBLIC.length);
    const rest = path.slice(idx + OBJECT_PUBLIC.length);
    const segments = rest.split('/').filter((s) => s.length > 0);
    const encoded = segments.map((seg) => {
      try {
        return encodeURIComponent(decodeURIComponent(seg));
      } catch {
        return encodeURIComponent(seg);
      }
    });
    u.pathname = base + encoded.join('/');
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * Si une URL `/render/` échoue au chargement, repasse à l’URL `object/public` équivalente.
 */
export function storageImageUrlOnImgError(failedSrc: string): string {
  if (!failedSrc?.trim() || failedSrc.includes('placeholder.svg')) return '/placeholder.svg';
  try {
    const u = new URL(failedSrc);
    if (u.pathname.includes(RENDER_PUBLIC)) {
      u.pathname = u.pathname.replace(RENDER_PUBLIC, OBJECT_PUBLIC);
      u.search = '';
      return normalizeStoragePublicUrlForBrowser(u.toString()) || '/placeholder.svg';
    }
  } catch {
    /* ignore */
  }
  return '/placeholder.svg';
}

/**
 * Pour `onError` sur une balise `<img>` : une tentative de repasser de `/render/` à `object/public`,
 * puis `fallbackSrc`. Évite les boucles via `data-img-fallback`.
 */
export function applyStorageImageFallback(el: HTMLImageElement, fallbackSrc = '/placeholder.svg'): void {
  if (!el.dataset.imgFallback) {
    el.dataset.imgFallback = '1';
    const next = storageImageUrlOnImgError(el.src);
    if (next && next !== el.src && !next.includes('placeholder')) {
      el.src = next;
      return;
    }
  }
  el.src = fallbackSrc;
}

/**
 * Remplace une URL `object/public` par `render/image/public` + paramètres **uniquement si**
 * `VITE_SUPABASE_IMAGE_TRANSFORM=true` et que le projet supporte les transformations.
 * Sinon : URL `object/public` normalisée (espaces et caractères spéciaux dans le chemin).
 */
export function optimiseSupabaseImageUrl(
  src: string | undefined | null,
  presetOrOptions: ImageDisplayPreset | OptimiseImageOptions = 'card'
): string {
  if (src == null || src === '') return '';
  if (shouldSkip(src)) return src;

  const normalized = normalizeStoragePublicUrlForBrowser(src) || src;

  if (!isTransformEnabled() || !normalized.includes(OBJECT_PUBLIC)) {
    return normalized;
  }

  let opts: { width: number; height?: number; quality: number; resize: 'cover' | 'contain' | 'fill' };
  if (typeof presetOrOptions === 'string') {
    opts = PRESETS[presetOrOptions];
  } else {
    opts = {
      width: presetOrOptions.width ?? PRESETS.card.width,
      height: presetOrOptions.height,
      quality: presetOrOptions.quality ?? PRESETS.card.quality,
      resize: presetOrOptions.resize ?? 'cover',
    };
  }

  try {
    const url = new URL(normalized);
    if (!url.pathname.includes(OBJECT_PUBLIC)) return normalized;

    const newPath = url.pathname.replace(OBJECT_PUBLIC, RENDER_PUBLIC);
    const w = Math.min(2500, Math.max(1, Math.round(opts.width)));
    const params = new URLSearchParams();
    params.set('width', String(w));
    if (opts.height != null) {
      const h = Math.min(2500, Math.max(1, Math.round(opts.height)));
      params.set('height', String(h));
    }
    const q = Math.min(100, Math.max(20, Math.round(opts.quality)));
    params.set('quality', String(q));
    params.set('resize', opts.resize);

    return `${url.origin}${newPath}?${params.toString()}`;
  } catch {
    return normalized;
  }
}
