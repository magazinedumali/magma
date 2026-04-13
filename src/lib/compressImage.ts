/**
 * Redimensionne et compresse les images raster côté client avant upload (poids réduit, chargement plus fluide).
 * SVG et GIF sont laissés tels quels.
 */

export type CompressImageOptions = {
  /** Largeur max en pixels (proportion conservée) */
  maxWidth?: number;
  /** Hauteur max en pixels */
  maxHeight?: number;
  /** Qualité JPEG/WebP (0–1) */
  quality?: number;
  /** Ne pas traiter les fichiers plus petits que ce seuil (octets) */
  skipBelowBytes?: number;
};

const DEFAULTS: Required<CompressImageOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.82,
  skipBelowBytes: 120 * 1024,
};

function baseName(filename: string): string {
  const i = filename.lastIndexOf('.');
  return i > 0 ? filename.slice(0, i) : filename || 'image';
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), type, quality);
  });
}

/**
 * Compresse un fichier image pour l’upload. En cas d’échec (navigateur, format), retourne le fichier d’origine.
 */
export async function compressImageFile(file: File, options: CompressImageOptions = {}): Promise<File> {
  const { maxWidth, maxHeight, quality, skipBelowBytes } = { ...DEFAULTS, ...options };

  if (!file.type.startsWith('image/')) return file;
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return file;
  if (file.size > 0 && file.size < skipBelowBytes) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  try {
    let { width, height } = bitmap;
    const scale = Math.min(maxWidth / width, maxHeight / height, 1);
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0, w, h);

    const name = baseName(file.name);

    let webpBlob = await canvasToBlob(canvas, 'image/webp', quality);
    if (webpBlob && webpBlob.size > 0 && webpBlob.size < file.size) {
      return new File([webpBlob], `${name}.webp`, { type: 'image/webp' });
    }

    const jpegBlob = await canvasToBlob(canvas, 'image/jpeg', quality);
    if (jpegBlob && jpegBlob.size > 0 && jpegBlob.size < file.size) {
      return new File([jpegBlob], `${name}.jpg`, { type: 'image/jpeg' });
    }

    if (webpBlob && webpBlob.size > 0) {
      return new File([webpBlob], `${name}.webp`, { type: 'image/webp' });
    }
    if (jpegBlob && jpegBlob.size > 0) {
      return new File([jpegBlob], `${name}.jpg`, { type: 'image/jpeg' });
    }

    return file;
  } finally {
    bitmap.close();
  }
}
