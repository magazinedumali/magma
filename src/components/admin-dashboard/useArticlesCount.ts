import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useArticlesCount() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCount() {
      setLoading(true);
      const { count, error } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('statut', 'publie');
      setCount(count || 0);
      setLoading(false);
    }
    fetchCount();
  }, []);

  return { count, loading };
} 