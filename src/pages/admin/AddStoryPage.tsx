import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAdminContext } from '@/hooks/use-admin-context';
import { UploadCloud } from 'lucide-react';

const AddStoryPage = () => {
  const navigate = useNavigate();
  const { getStoriesPath } = useAdminContext();
  const [title, setTitle] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setError('Veuillez sélectionner une image');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Upload image
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('stories')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('stories')
        .getPublicUrl(fileName);

      // Create story
      const { error: insertError } = await supabase
        .from('stories')
        .insert([
          {
            title,
            image_url: publicUrl,
            is_active: true
          }
        ]);

      if (insertError) throw insertError;

      navigate(getStoriesPath());
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-[var(--text-primary)] max-w-2xl mx-auto py-8">
      <h2 className="text-2xl font-bold admin-dashboard-title mb-8">Ajouter une story</h2>
      
      {error && (
        <div className="text-center text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-400/20 mb-8 animate-fadeIn">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="dark-card flex flex-col gap-6">
        <div>
          <label className="block mb-2 font-medium text-[var(--text-secondary)]">Titre de la story</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-muted)]"
            placeholder="Titre accrocheur..."
          />
        </div>

        <div>
           <label className="block mb-2 font-medium text-[var(--text-secondary)]">Image (Format vertical recommandé)</label>
           <div className="w-full border-2 border-dashed border-white/10 rounded-xl bg-black/20 hover:bg-black/40 hover:border-white/20 transition-all duration-300 flex flex-col items-center justify-center py-10 relative">
              <UploadCloud className="w-10 h-10 mb-3 text-white/40" />
              <div className="text-sm font-semibold mb-1 text-[var(--text-primary)]">Sélectionner une image</div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                required
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {imageFile && (
                <div className="mt-4 text-[var(--accent)] font-medium text-sm bg-[var(--accent)]/10 px-3 py-1 rounded-full border border-[var(--accent)]/20">
                  {imageFile.name}
                </div>
              )}
           </div>
        </div>

        <div className="flex gap-4 mt-4">
          <button
            type="button"
            onClick={() => navigate(getStoriesPath())}
            className="flex-1 bg-white/5 border border-white/10 text-[var(--text-primary)] px-6 py-3 rounded-xl hover:bg-white/10 transition-colors font-semibold"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[var(--accent)] text-white px-6 py-3 rounded-xl hover:brightness-110 hover:-translate-y-0.5 transition-all shadow-[0_4px_16px_var(--accent-glow)] font-semibold"
          >
            {loading ? 'Création...' : 'Créer la story'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStoryPage;