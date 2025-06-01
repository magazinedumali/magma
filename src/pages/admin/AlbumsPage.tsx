import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

interface Album {
  id: string;
  title: string;
  description: string;
  cover_url: string;
  created_at: string;
}

const AlbumsPage = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const { data, error } = await supabase
        .from('albums')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlbums(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet album ?')) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('albums')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchAlbums();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 32, textAlign: 'center' }}>Chargement...</div>;
  }

  return (
    <div style={{ padding: 32, fontFamily: 'Jost, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Gestion des albums</h2>
        <Link
          to="/admin/albums/add"
          style={{
            background: '#4f8cff',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 500
          }}
        >
          Ajouter un album
        </Link>
      </div>

      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
        {albums.map((album) => (
          <div
            key={album.id}
            style={{
              background: '#fff',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <img
              src={album.cover_url}
              alt={album.title}
              style={{ width: '100%', height: 200, objectFit: 'cover' }}
            />
            <div style={{ padding: 16 }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 18 }}>{album.title}</h3>
              <p style={{ color: '#666', margin: '0 0 16px 0', fontSize: 14 }}>
                {album.description}
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link
                  to={`/admin/albums/edit/${album.id}`}
                  style={{
                    background: '#e5e9f2',
                    color: '#23272f',
                    padding: '8px 16px',
                    borderRadius: 6,
                    textDecoration: 'none',
                    fontSize: 14,
                    flex: 1,
                    textAlign: 'center'
                  }}
                >
                  Éditer
                </Link>
                <button
                  onClick={() => handleDelete(album.id)}
                  style={{
                    background: '#ff4d4f',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: 14,
                    flex: 1
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlbumsPage; 