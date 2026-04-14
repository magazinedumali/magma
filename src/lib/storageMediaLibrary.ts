import type { SupabaseClient } from '@supabase/supabase-js';
import { normalizeStoragePublicUrlForBrowser } from '@/lib/supabaseImageUrl';

export type MediaKind = 'image' | 'video' | 'audio';

export type UnifiedMediaItem = {
  id: string;
  kind: MediaKind;
  name: string;
  url: string;
  bucket?: string;
  path?: string;
  size: number;
  created_at: string | null;
  /** Emplacement lisible (bucket ou table) */
  sourceLabel: string;
  /** Si défini, suppression possible via Storage */
  deletableStorage: boolean;
};

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|bmp|svg|avif|heic)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|avi|mkv|m4v|ogv)$/i;
const AUDIO_EXT = /\.(mp3|wav|ogg|aac|m4a|flac|opus)$/i;

export function classifyMediaKind(
  fileName: string,
  mime?: string | null
): MediaKind | 'other' {
  if (mime) {
    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('video/')) return 'video';
    if (mime.startsWith('audio/')) return 'audio';
  }
  if (IMAGE_EXT.test(fileName)) return 'image';
  if (VIDEO_EXT.test(fileName)) return 'video';
  if (AUDIO_EXT.test(fileName)) return 'audio';
  return 'other';
}

const OBJECT_PUBLIC = '/storage/v1/object/public/';
const OBJECT_SIGN = '/storage/v1/object/sign/';
const RENDER_IMAGE_PUBLIC = '/storage/v1/render/image/public/';

function decodeStorageObjectPath(path: string): string {
  return path
    .split('/')
    .filter((s) => s.length > 0)
    .map((seg) => {
      try {
        return decodeURIComponent(seg.replace(/\+/g, ' '));
      } catch {
        return seg;
      }
    })
    .join('/');
}

/**
 * Extrait bucket + chemin objet depuis une URL Supabase Storage
 * (public, signée, ou transformation image `/render/`).
 */
export function resolveSupabaseStorageObject(
  url: string | null | undefined
): { bucket: string; path: string } | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const parsePathname = (pathname: string): { bucket: string; path: string } | null => {
    for (const marker of [OBJECT_PUBLIC, RENDER_IMAGE_PUBLIC, OBJECT_SIGN]) {
      const idx = pathname.indexOf(marker);
      if (idx === -1) continue;
      const rest = pathname.slice(idx + marker.length);
      const slash = rest.indexOf('/');
      if (slash === -1) continue;
      const bucket = rest.slice(0, slash);
      let objectPath = rest.slice(slash + 1);
      if (!bucket || !objectPath) continue;
      objectPath = decodeStorageObjectPath(objectPath);
      return { bucket, path: objectPath };
    }
    return null;
  };

  try {
    const u = new URL(trimmed);
    const fromPath = parsePathname(u.pathname);
    if (fromPath) return fromPath;
  } catch {
    /* URL relative ou invalide */
  }

  for (const marker of [OBJECT_PUBLIC, RENDER_IMAGE_PUBLIC, OBJECT_SIGN]) {
    const i = trimmed.indexOf(marker);
    if (i === -1) continue;
    const rest = trimmed.slice(i + marker.length).split('?')[0].split('#')[0];
    const slash = rest.indexOf('/');
    if (slash === -1) continue;
    const bucket = rest.slice(0, slash);
    let objectPath = decodeStorageObjectPath(rest.slice(slash + 1));
    if (bucket && objectPath) return { bucket, path: objectPath };
  }

  return null;
}

/** @deprecated Utiliser {@link resolveSupabaseStorageObject} (gère aussi /render/ et /sign/). */
export function parseSupabasePublicObjectUrl(
  url: string
): { bucket: string; path: string } | null {
  return resolveSupabaseStorageObject(url);
}

/**
 * Supprime l’objet dans le bucket Storage puis les lignes `medias` dont l’URL correspond.
 */
export async function deleteLibraryMediaFromSupabase(
  client: SupabaseClient,
  item: UnifiedMediaItem
): Promise<void> {
  const loc =
    resolveSupabaseStorageObject(item.url) ??
    (item.bucket && item.path ? { bucket: item.bucket, path: item.path } : null);

  if (!loc) {
    throw new Error(
      'Impossible de déterminer le bucket Storage pour cette URL. Suppression annulée.'
    );
  }

  const { error: rmErr } = await client.storage.from(loc.bucket).remove([loc.path]);
  if (rmErr) throw rmErr;

  const { data: pub } = client.storage.from(loc.bucket).getPublicUrl(loc.path);
  const canonical = (pub.publicUrl || '').split('?')[0];

  const urlVariants = new Set<string>();
  const raw = item.url.split('?')[0].split('#')[0];
  if (raw) urlVariants.add(raw);
  if (canonical) urlVariants.add(canonical);

  const normalized = normalizeStoragePublicUrlForBrowser(canonical);
  if (normalized) urlVariants.add(normalized.split('?')[0]);

  for (const u of urlVariants) {
    if (u) await client.from('medias').delete().eq('url', u);
  }

  if (item.id.startsWith('db-medias::')) {
    const rowId = item.id.replace('db-medias::', '');
    await client.from('medias').delete().eq('id', rowId);
  }
}

/** Indique si la suppression peut cibler un objet Storage Supabase pour cette entrée. */
export function canDeleteMediaFromLibrary(item: UnifiedMediaItem): boolean {
  return Boolean(
    resolveSupabaseStorageObject(item.url) ||
      (item.bucket && item.path)
  );
}

function isFileEntry(item: {
  metadata?: Record<string, unknown> | null;
}): boolean {
  const m = item.metadata;
  return m != null && typeof m.size === 'number';
}

async function listBucketMediaRecursive(
  client: SupabaseClient,
  bucket: string,
  prefix: string,
  options: {
    maxDepth: number;
    maxFiles: number;
    depth: number;
    out: UnifiedMediaItem[];
  }
): Promise<void> {
  if (options.depth > options.maxDepth || options.out.length >= options.maxFiles) {
    return;
  }

  const { data, error } = await client.storage.from(bucket).list(prefix, {
    limit: 1000,
    sortBy: { column: 'created_at', order: 'desc' },
  });

  if (error || !data?.length) return;

  const subPrefixes: string[] = [];

  for (const item of data) {
    if (options.out.length >= options.maxFiles) break;

    const rel = prefix ? `${prefix}/${item.name}` : item.name;

    if (isFileEntry(item)) {
      const kind = classifyMediaKind(
        item.name,
        (item.metadata as { mimetype?: string })?.mimetype ?? null
      );
      if (kind === 'other') continue;

      const { data: pub } = client.storage.from(bucket).getPublicUrl(rel);
      const size = (item.metadata as { size: number }).size;

      options.out.push({
        id: `${bucket}::${rel}`,
        kind,
        name: item.name,
        url: pub.publicUrl,
        bucket,
        path: rel,
        size,
        created_at: item.created_at ?? null,
        sourceLabel: bucket,
        deletableStorage: true,
      });
    } else {
      subPrefixes.push(rel);
    }
  }

  await Promise.all(
    subPrefixes.map((p) =>
      listBucketMediaRecursive(client, bucket, p, {
        ...options,
        depth: options.depth + 1,
      })
    )
  );
}

/** Buckets où les médias du site sont stockés (chemins parcourus récursivement). */
export const MEDIA_LIBRARY_BUCKETS = [
  'medias',
  'article-images',
  'article-audios',
  'videos',
  'images',
  'albums',
  'banners',
  'stories',
] as const;

export async function fetchAllStorageMedia(
  client: SupabaseClient,
  opts?: { maxFilesPerBucket?: number; maxDepth?: number }
): Promise<UnifiedMediaItem[]> {
  const maxFilesPerBucket = opts?.maxFilesPerBucket ?? 500;
  const maxDepth = opts?.maxDepth ?? 12;

  const lists = await Promise.all(
    MEDIA_LIBRARY_BUCKETS.map(async (bucket) => {
      const out: UnifiedMediaItem[] = [];
      try {
        await listBucketMediaRecursive(client, bucket, '', {
          maxDepth,
          maxFiles: maxFilesPerBucket,
          depth: 0,
          out,
        });
      } catch {
        /* bucket absent ou RLS */
      }
      return out;
    })
  );

  return lists.flat();
}

export async function fetchMediasTableRows(
  client: SupabaseClient
): Promise<UnifiedMediaItem[]> {
  const { data, error } = await client
    .from('medias')
    .select('id, name, url, type, created_at')
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data
    .map((row) => {
      const kind = row.type?.startsWith('image/')
        ? 'image'
        : row.type?.startsWith('video/')
          ? 'video'
          : row.type?.startsWith('audio/')
            ? 'audio'
            : classifyMediaKind(row.name || '', row.type);
      if (kind === 'other') {
        return null;
      }
      const parsed = resolveSupabaseStorageObject(row.url);
      return {
        id: `db-medias::${row.id}`,
        kind,
        name: row.name || 'Sans titre',
        url: row.url,
        bucket: parsed?.bucket,
        path: parsed?.path,
        size: 0,
        created_at: row.created_at ?? null,
        sourceLabel: 'medias (table)',
        deletableStorage: Boolean(parsed),
      } as UnifiedMediaItem;
    })
    .filter(Boolean) as UnifiedMediaItem[];
}

export async function fetchVideosTableAsMedia(
  client: SupabaseClient
): Promise<UnifiedMediaItem[]> {
  const { data, error } = await client
    .from('videos')
    .select('id, title, video_url, image')
    .order('date', { ascending: false });

  if (error || !data) return [];

  const out: UnifiedMediaItem[] = [];

  for (const row of data) {
    if (row.video_url) {
      const parsed = resolveSupabaseStorageObject(row.video_url);
      out.push({
        id: `db-videos::${row.id}::file`,
        kind: 'video',
        name: row.title ? `${row.title}` : `Vidéo ${String(row.id).slice(0, 8)}`,
        url: row.video_url,
        bucket: parsed?.bucket,
        path: parsed?.path,
        size: 0,
        created_at: null,
        sourceLabel: 'vidéos (contenu)',
        deletableStorage: Boolean(parsed),
      });
    }
    if (row.image) {
      const parsed = resolveSupabaseStorageObject(row.image);
      out.push({
        id: `db-videos::${row.id}::cover`,
        kind: 'image',
        name: row.title ? `Couverture — ${row.title}` : `Couverture ${String(row.id).slice(0, 8)}`,
        url: row.image,
        bucket: parsed?.bucket,
        path: parsed?.path,
        size: 0,
        created_at: null,
        sourceLabel: 'vidéos (aperçu)',
        deletableStorage: Boolean(parsed),
      });
    }
  }

  return out;
}

export function dedupeMediaByUrl(items: UnifiedMediaItem[]): UnifiedMediaItem[] {
  const seen = new Set<string>();
  const result: UnifiedMediaItem[] = [];
  for (const item of items) {
    const key = item.url.split('?')[0];
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

export async function loadUnifiedMediaLibrary(
  client: SupabaseClient
): Promise<UnifiedMediaItem[]> {
  const [fromStorage, fromMediasTable, fromVideosTable] = await Promise.all([
    fetchAllStorageMedia(client),
    fetchMediasTableRows(client),
    fetchVideosTableAsMedia(client),
  ]);

  const merged = [...fromStorage, ...fromMediasTable, ...fromVideosTable];
  const deduped = dedupeMediaByUrl(merged);

  deduped.sort((a, b) => {
    const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
    if (tb !== ta) return tb - ta;
    return b.name.localeCompare(a.name);
  });

  return deduped;
}
