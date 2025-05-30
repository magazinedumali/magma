import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const COLORS = ['#4f8cff', '#ff184e', '#ffc107', '#22c55e', '#a855f7', '#f59e42', '#6ee7b7', '#818cf8', '#f472b6', '#facc15'];

export function useUsersByLocation() {
  const [locations, setLocations] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLocations() {
      setLoading(true);
      const { data, error } = await supabase.auth.admin.listUsers();
      if (!data?.users) {
        setLocations([]);
        setTotal(0);
        setLoading(false);
        return;
      }
      // On suppose que le pays est dans user_metadata.country
      const countryCounts = {};
      let hasCountry = false;
      data.users.forEach(u => {
        const country = u.user_metadata?.country;
        if (country) {
          hasCountry = true;
          countryCounts[country] = (countryCounts[country] || 0) + 1;
        }
      });
      let locArr = [];
      if (hasCountry) {
        locArr = Object.entries(countryCounts).map(([label, value], i) => ({
          label,
          value,
          color: COLORS[i % COLORS.length],
        }));
      } else {
        locArr = [{ label: 'Inconnu', value: data.users.length, color: COLORS[0] }];
      }
      setLocations(locArr);
      setTotal(data.users.length);
      setLoading(false);
    }
    fetchLocations();
  }, []);

  return { locations, total, loading };
} 