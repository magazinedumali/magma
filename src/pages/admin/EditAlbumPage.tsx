import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { LoadingBar } from '@/components/ui/loading-bar';

interface Album {
  id: string;
  title: string;
  description: string;
  cover_url: string;
}

const EditAlbumPage = () => {
  const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<Album | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const { data, error } = await supabase
          .from('albums')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setAlbum(data);
        setTitle(data.title);
        setDescription(data.description);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbum();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      let coverUrl = album?.cover_url;

      if (coverFile) {
        // Upload new cover image
        const fileExt = coverFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('albums')
          .upload(filePath, coverFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('albums')
          .getPublicUrl(filePath);

        coverUrl = publicUrl;
      }

      // Update album
      const { error: updateError } = await supabase
        .from('albums')
        .update({
          title,
          description,
          cover_url: coverUrl
        })
        .eq('id', id);

      if (updateError) throw updateError;

      navigate('/admin/albums');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-[var(--text-primary)] max-w-2xl mx-auto py-8 space-y-6">
        <LoadingBar variant="full" />
        <div className="flex flex-col items-center gap-4 py-12">
          <LoadingBar variant="inline" className="w-64" />
          <span className="text-[var(--text-muted)]">Chargement de l'album...</span>
        </div>
      </div>
    );
  }

  if (!album) {
    return <div className="text-center text-red-400 py-10 text-lg">Album non trouvé</div>;
  }

  return (
    <div className="text-[var(--text-primary)] max-w-2xl mx-auto py-8">
      <h2 className="text-2xl font-bold admin-dashboard-title mb-8">Modifier l'album</h2>
      
      {error && (
        <div className="text-center text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-400/20 mb-8 animate-fadeIn">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="dark-card flex flex-col gap-6">
        <div>
          <label htmlFor="title" className="block mb-2 font-medium text-[var(--text-secondary)]">
            Titre de l'album
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-muted)]"
          />
        </div>

        <div>
          <label htmlFor="description" className="block mb-2 font-medium text-[var(--text-secondary)]">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-muted)] min-h-[120px] resize-y"
          />
        </div>

        <div>
          <label htmlFor="cover" className="block mb-2 font-medium text-[var(--text-secondary)]">
            Image de couverture
          </label>
          
          {album.cover_url && !coverFile && (
            <div className="mb-4 relative rounded-xl overflow-hidden border border-white/10 w-full h-48">
              <img
                src={album.cover_url}
                alt="Cover preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs backdrop-blur-sm">Image actuelle</div>
            </div>
          )}
          
          <input
            id="cover"
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--accent)] transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
          />
        </div>

        <div className="flex gap-4 mt-4">
          <button
            type="button"
            onClick={() => navigate('/admin/albums')}
            className="flex-1 bg-white/5 border border-white/10 text-[var(--text-primary)] px-6 py-3 rounded-xl hover:bg-white/10 transition-colors font-semibold"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-[var(--accent)] text-white px-6 py-3 rounded-xl hover:brightness-110 hover:-translate-y-0.5 transition-all shadow-[0_4px_16px_var(--accent-glow)] font-semibold"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAlbumPage;