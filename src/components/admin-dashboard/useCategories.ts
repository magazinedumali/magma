import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
      if (error) setError(error.message);
      setCategories(data || []);
      setLoading(false);
    }
    fetchCategories();
  }, []);

  return { categories, loading, error };
} 