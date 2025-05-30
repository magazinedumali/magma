import { useEffect, useState } from 'react';

export function useUsersCount() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCount() {
      setLoading(true);
      try {
        const res = await fetch('/api/users-count');
        const data = await res.json();
        setCount(data.count || 0);
      } catch {
        setCount(0);
      }
      setLoading(false);
    }
    fetchCount();
  }, []);

  return { count, loading };
} 