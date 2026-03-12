import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const AddAlbumPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverFile) {
      setError('Veuillez sélectionner une image de couverture');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Upload cover image
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

      // Create album
      const { error: insertError } = await supabase
        .from('albums')
        .insert([
          {
            title,
            description,
            cover_url: publicUrl
          }
        ]);

      if (insertError) throw insertError;

      navigate('/admin/albums');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-[var(--text-primary)] max-w-2xl mx-auto py-8">
      <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-8">Ajouter un album</h2>
      
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
            placeholder="Ex: Soirée de Lancement"
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
            placeholder="Courte description de l'événement..."
          />
        </div>

        <div>
          <label htmlFor="cover" className="block mb-2 font-medium text-[var(--text-secondary)]">
            Image de couverture
          </label>
          <input
            id="cover"
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            required
            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--accent)] transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[var(--accent)] file:text-white hover:file:brightness-110"
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
            disabled={loading}
            className="flex-1 bg-[var(--accent)] text-white px-6 py-3 rounded-xl hover:brightness-110 hover:-translate-y-0.5 transition-all shadow-[0_4px_16px_var(--accent-glow)] font-semibold"
          >
            {loading ? 'Création en cours...' : 'Créer l\'album'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAlbumPage;