import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useCommentsCount() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCount() {
      setLoading(true);
      const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true });
      setCount(count || 0);
      setLoading(false);
    }
    fetchCount();
  }, []);

  return { count, loading };
} 