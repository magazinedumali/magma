import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function RecentUsersWidget() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      setUsers(data || []);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  return (
    <div className="dark-card" style={{ marginBottom: 0 }}>
      <h2>Utilisateurs récents</h2>
      {loading ? (
        <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font)' }}>Chargement…</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {users.map(u => {
            const initial = u.name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || '?';
            return (
              <li key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'rgba(255,24,78,0.1)',
                  color: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '1rem', flexShrink: 0,
                  border: '1px solid rgba(255,24,78,0.2)'
                }}>
                  {initial}
                </div>
                <div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>
                    {u.name || u.email}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 2 }}>
                    Rejoint le {u.created_at ? new Date(u.created_at).toLocaleDateString() : ''}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}