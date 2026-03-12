import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface Category {
  id: string;
  name: string;
  path: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true });
        
        if (error) throw error;
        
        const mapped = (data || []).map(c => ({
          id: c.id,
          name: c.name,
          // Generate a path from the name, e.g. "Actualités" -> "/category/actualites"
          path: `/category/${c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")}`
        }));
        
        // Always include some default ones if empty, but prefer DB
        if (mapped.length > 0) {
          setCategories(mapped);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  return { categories, loading };
};
