import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

function getMonthStartEnd() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function useActiveAuthorsCount() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCount() {
      setLoading(true);
      const { start, end } = getMonthStartEnd();
      const { data, error } = await supabase
        .from('articles')
        .select('author_id', { head: false })
        .neq('author_id', null)
        .gte('date_publication', start)
        .lt('date_publication', end);
      const uniqueAuthors = new Set((data || []).map(a => a.author_id));
      setCount(uniqueAuthors.size);
      setLoading(false);
    }
    fetchCount();
  }, []);

  return { count, loading };
} 