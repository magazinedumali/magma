import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function RecentUsersWidget() {
  const [users, setUsers] = useState([]);
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
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 mb-8">
      <h2 className="text-lg font-bold mb-4 text-[#232b46]">Utilisateurs récents</h2>
      {loading ? (
        <div className="text-gray-400">Chargement…</div>
      ) : (
        <ul className="space-y-2">
          {users.map(u => (
            <li key={u.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#f5f7fa] flex items-center justify-center text-[#ff184e] font-bold text-lg">
                {u.name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <div className="font-medium text-[#232b46]">{u.name || u.email}</div>
                <div className="text-xs text-gray-400">{u.created_at ? new Date(u.created_at).toLocaleDateString() : ''}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 