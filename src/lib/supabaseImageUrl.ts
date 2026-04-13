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

export type ImageDisplayPreset = 'thumb' | 'card' | 'hero' | 'articleBody';

const PRESETS: Record<
  ImageDisplayPreset,
  { width: number; height?: number; quality: number; resize: 'cover' | 'contain' | 'fill' }
> = {
  /** Listes, petites vignettes (~2x pour écrans retina) */
  thumb: { width: 420, quality: 78, resize: 'cover' },
  /** Cartes type ArticleCard */
  card: { width: 960, quality: 80, resize: 'cover' },
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
 * Remplace une URL `object/public` par `render/image/public` + paramètres.
 * Les URLs non-Supabase ou déjà optimisées sont renvoyées telles quelles.
 */
export function optimiseSupabaseImageUrl(
  src: string | undefined | null,
  presetOrOptions: ImageDisplayPreset | OptimiseImageOptions = 'card'
): string {
  if (src == null || src === '') return '';
  if (!isTransformEnabled() || shouldSkip(src)) return src;
  if (!src.includes(OBJECT_PUBLIC)) return src;

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
    const url = new URL(src);
    if (!url.pathname.includes(OBJECT_PUBLIC)) return src;

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
    return src;
  }
}
