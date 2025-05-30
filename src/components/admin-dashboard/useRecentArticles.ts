import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useRecentArticles(limit = 5) {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('date_publication', { ascending: false })
        .limit(limit);
      setArticles(data || []);
      setLoading(false);
    }
    fetchArticles();
  }, [limit]);

  return { articles, loading };
} 