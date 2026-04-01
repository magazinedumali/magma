import type { SupabaseClient } from '@supabase/supabase-js';

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

  const q = () => client.from('articles').select('*').eq('statut', 'publie');

  let { data, error } = await q().eq('slug', slug).maybeSingle();
  if (data) return { data, error: null };

  ({ data, error } = await q().ilike('slug', slug).maybeSingle());
  if (data) return { data, error: null };

  if (slug.length === 36) {
    ({ data, error } = await q().eq('id', slug).maybeSingle());
    if (data) return { data, error: null };
  }

  const foldedParam = foldSlug(slug);

  const { data: containsRows } = await client
    .from('articles')
    .select('*')
    .eq('statut', 'publie')
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
    const { data: coreRows } = await client
      .from('articles')
      .select('*')
      .eq('statut', 'publie')
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
    const { data: prefRows, error: prefErr } = await client
      .from('articles')
      .select('*')
      .eq('statut', 'publie')
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
