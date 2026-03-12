import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

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
    return (
      <div className="flex flex-col items-center justify-center text-[var(--text-muted)] py-20">
        <svg className="animate-spin h-8 w-8 mb-4 text-[var(--accent)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
        Chargement des albums...
      </div>
    );
  }

  return (
    <div className="text-[var(--text-primary)]">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Gestion des albums</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">Organisez vos médias en galeries (Non supporté complètement en mode clair avant, maintenant unifié).</p>
        </div>
        
        <Link
          to="/admin/albums/add"
          className="bg-[var(--accent)] text-white px-5 py-2.5 rounded-xl hover:brightness-110 hover:-translate-y-0.5 transition-all shadow-[0_4px_16px_var(--accent-glow)] flex items-center gap-2 font-semibold w-fit"
        >
          <PlusIcon className="w-5 h-5" /> Ajouter un album
        </Link>
      </div>

      {error && (
        <div className="text-center text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-400/20 mb-8 animate-fadeIn">
          {error}
        </div>
      )}

      {albums.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center text-[var(--text-muted)] py-20 dark-card">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <p className="text-lg font-medium">Aucun album trouvé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {albums.map((album) => (
            <div
              key={album.id}
              className="dark-card overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
              style={{ padding: 0 }}
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={album.cover_url}
                  alt={album.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
              </div>
              
              <div className="p-5">
                <h3 className="text-lg font-bold mb-2 truncate text-[var(--text-primary)]" title={album.title}>{album.title}</h3>
                <p className="text-[var(--text-muted)] text-sm mb-5 line-clamp-2 min-h-[40px]">
                  {album.description || 'Aucune description'}
                </p>
                
                <div className="flex gap-3">
                  <Link
                    to={`/admin/albums/edit/${album.id}`}
                    className="flex-1 bg-white/5 border border-white/10 text-[var(--text-primary)] px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <PencilSquareIcon className="w-4 h-4" /> Éditer
                  </Link>
                  <button
                    onClick={() => handleDelete(album.id)}
                    className="flex-1 bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <TrashIcon className="w-4 h-4" /> Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlbumsPage;