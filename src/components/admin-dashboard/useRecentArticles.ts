import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

/** Lignes affichées sur le dashboard admin (tous statuts, les plus récents d’abord). */
export type DashboardArticleRow = {
  id: string;
  titre: string;
  slug?: string | null;
  image_url?: string | null;
  categorie?: string | null;
  auteur?: string | null;
  date_publication?: string | null;
  created_at?: string | null;
  statut?: string | null;
};

export function useRecentArticles(limit = 10) {
  const [articles, setArticles] = useState<DashboardArticleRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);
      const { data } = await supabase
        .from('articles')
        .select(
          'id, titre, slug, image_url, categorie, auteur, date_publication, created_at, statut'
        )
        .order('created_at', { ascending: false })
        .limit(limit);
      setArticles((data as DashboardArticleRow[]) || []);
      setLoading(false);
    }
    fetchArticles();
  }, [limit]);

  return { articles, loading };
} 