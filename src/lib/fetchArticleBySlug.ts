import type { SupabaseClient } from '@supabase/supabase-js';

/** Variantes de statut « publié » encore présentes en base après d’anciennes saisies */
const PUBLISHED_STATUT_VALUES = [
  'publie',
  'published',
  'public',
  'publié',
  'Publié',
  'PUBLIE',
];

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HEX32_ID = /^[0-9a-f]{32}$/i;

function normalizeIdParam(segment: string): string | null {
  const t = segment.trim();
  if (UUID_RE.test(t)) return t.toLowerCase();
  if (HEX32_ID.test(t)) {
    const s = t.toLowerCase();
    return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20, 32)}`;
  }
  return null;
}

function publishedArticlesQuery(client: SupabaseClient) {
  return client.from('articles').select('*').in('statut', PUBLISHED_STATUT_VALUES);
}

/** Slug URL sans accents, minuscules — pour comparer à la BDD */
function foldSlug(s: string) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Récupère un article publié à partir du segment d’URL (slug ou UUID).
 * Plus tolérant que eq(slug) seul : décodage, casse, accents, préfixe si le slug a divergé.
 */
export async function fetchPublishedArticleBySlugParam(
  client: SupabaseClient,
  rawSlug: string | undefined
): Promise<{ data: Record<string, unknown> | null; error: Error | null }> {
  if (!rawSlug?.trim()) {
    return { data: null, error: null };
  }

  let slug = rawSlug.trim();
  try {
    slug = decodeURIComponent(slug);
  } catch {
    /* garder tel quel */
  }
  slug = slug.trim();

  const q = () => publishedArticlesQuery(client);

  let { data, error } = await q().eq('slug', slug).maybeSingle();
  if (data) return { data, error: null };

  ({ data, error } = await q().ilike('slug', slug).maybeSingle());
  if (data) return { data, error: null };

  const idParam = normalizeIdParam(slug);
  if (idParam) {
    ({ data, error } = await q().eq('id', idParam).maybeSingle());
    if (data) return { data, error: null };
  }

  const foldedParam = foldSlug(slug);

  const { data: containsRows } = await publishedArticlesQuery(client)
    .ilike('slug', `%${slug}%`)
    .limit(25);

  if (containsRows?.length) {
    const byFold = containsRows.find((r: { slug?: string }) => foldSlug(r.slug || '') === foldedParam);
    if (byFold) return { data: byFold, error: null };
    const byExact = containsRows.find((r: { slug?: string }) => r.slug === slug);
    if (byExact) return { data: byExact, error: null };
    if (containsRows.length === 1) return { data: containsRows[0], error: null };
  }

  const segments = slug.split('-').filter(Boolean);
  /* Slug BDD plus court que l’URL (suffixe en trop) : la BDD est préfixe de l’URL */
  if (segments.length >= 4) {
    const core = segments.slice(0, Math.min(8, segments.length)).join('-');
    const { data: coreRows } = await publishedArticlesQuery(client)
      .ilike('slug', `%${core}%`)
      .limit(40);
    if (coreRows?.length) {
      const prefixMatches = coreRows.filter(
        (r: { slug?: string }) => typeof r.slug === 'string' && slug.startsWith(r.slug as string)
      );
      if (prefixMatches.length) {
        prefixMatches.sort(
          (a: { slug?: string }, b: { slug?: string }) => (b.slug?.length || 0) - (a.slug?.length || 0)
        );
        return { data: prefixMatches[0], error: null };
      }
      const rev = coreRows.filter(
        (r: { slug?: string }) => typeof r.slug === 'string' && (r.slug as string).startsWith(slug)
      );
      if (rev.length === 1) return { data: rev[0], error: null };
      const foldMatch = coreRows.find(
        (r: { slug?: string }) =>
          typeof r.slug === 'string' && foldSlug(slug).startsWith(foldSlug(r.slug as string))
      );
      if (foldMatch) return { data: foldMatch, error: null };
    }
  }

  for (let n = Math.min(segments.length, 14); n >= 4; n--) {
    const prefix = segments.slice(0, n).join('-');
    const { data: prefRows, error: prefErr } = await publishedArticlesQuery(client)
      .ilike('slug', `${prefix}%`)
      .limit(25);

    if (prefErr) continue;
    if (!prefRows?.length) continue;

    const byFold = prefRows.find((r: { slug?: string }) => foldSlug(r.slug || '') === foldedParam);
    if (byFold) return { data: byFold, error: null };
    const byExact = prefRows.find((r: { slug?: string }) => r.slug === slug);
    if (byExact) return { data: byExact, error: null };
    if (prefRows.length === 1) return { data: prefRows[0], error: null };
  }

  return { data: null, error: error as Error | null };
}
