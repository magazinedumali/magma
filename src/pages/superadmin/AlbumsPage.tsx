import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

function useAlbums() {
  const [albums, setAlbums] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    async function fetchAlbums() {
      setLoading(true);
      const { data, error } = await supabase
        .from('albums')
        .select('*, songs(*)')
        .order('year', { ascending: false });
      setAlbums(data || []);
      setLoading(false);
    }
    fetchAlbums();
  }, []);
  return { albums, loading, setAlbums };
}

const AlbumsPage = () => {
  const { albums, loading, setAlbums } = useAlbums();
  const navigate = useNavigate();

  const handleEdit = (id: string) => {
    navigate(`/superadmin/albums/edit/${id}`);
  };
  const handleDelete = async (id: string) => {
    if (window.confirm('Supprimer cet album ?')) {
      await supabase.from('albums').delete().eq('id', id);
      setAlbums(albums.filter(a => a.id !== id));
    }
  };
  const handleAdd = () => {
    navigate('/superadmin/albums/add');
  };

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Gestion des albums</h1>
      <button onClick={handleAdd} style={{ marginBottom: 24, padding: '8px 20px', background: '#ff184e', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 16 }}>+ Ajouter un album</button>
      {loading ? (
        <div>Chargement…</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 12, overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: '#f9f9f9', textAlign: 'left' }}>
              <th style={{ padding: 12 }}>Cover</th>
              <th style={{ padding: 12 }}>Titre</th>
              <th style={{ padding: 12 }}>Année</th>
              <th style={{ padding: 12 }}>Morceaux</th>
              <th style={{ padding: 12 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {albums.map(album => (
              <tr key={album.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 12 }}><img src={album.cover} alt={album.title} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} /></td>
                <td style={{ padding: 12, fontWeight: 600 }}>{album.title}</td>
                <td style={{ padding: 12 }}>{album.year}</td>
                <td style={{ padding: 12 }}>{album.songs?.length || 0}</td>
                <td style={{ padding: 12 }}>
                  <button onClick={() => handleEdit(album.id)} style={{ marginRight: 12, background: '#eee', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 500 }}>Éditer</button>
                  <button onClick={() => handleDelete(album.id)} style={{ background: '#ff184e', color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 500 }}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AlbumsPage; 