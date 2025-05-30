import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useArticlesByCategory() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: articles, error } = await supabase
        .from('articles')
        .select('categorie');
      if (articles) {
        const counts = {};
        articles.forEach(a => {
          const cat = a.categorie || 'Inconnu';
          counts[cat] = (counts[cat] || 0) + 1;
        });
        setData(Object.entries(counts).map(([label, value]) => ({ label, value })));
      } else {
        setData([]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return { data, loading };
} 