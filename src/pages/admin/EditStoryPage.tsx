import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAdminContext } from '@/hooks/use-admin-context';
import { Image as ImageIcon, Save, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingBar } from '@/components/ui/loading-bar';

interface Story {
  id: string;
  title: string;
  image_url: string;
  is_active: boolean;
}

const EditStoryPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getStoriesPath } = useAdminContext();
  const [story, setStory] = useState<Story | null>(null);
  const [title, setTitle] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const { data, error } = await supabase
          .from('stories')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setStory(data);
        setTitle(data.title);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!story) return;

    try {
      setSaving(true);
      setError(null);

      let imageUrl = story.image_url;

      if (imageFile) {
        // Upload new image
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

        imageUrl = publicUrl;
      }

      // Update story
      const { error: updateError } = await supabase
        .from('stories')
        .update({
          title,
          image_url: imageUrl
        })
        .eq('id', story.id);

      if (updateError) throw updateError;

      navigate(getStoriesPath());
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="font-jost text-[var(--text-primary)] max-w-3xl mx-auto py-8 space-y-6">
        <div className="mb-8">
          <Skeleton className="h-9 w-56 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="dark-card p-6 flex flex-col gap-6">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex gap-4 mt-6">
          <LoadingBar variant="inline" className="flex-1 max-w-xs" />
          <span className="text-[var(--text-muted)]">Chargement de la story...</span>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="dark-card text-center py-20 mt-8 mx-auto max-w-2xl font-jost">
        <div className="text-4xl mb-4">🔍</div>
        <h3 className="text-xl font-bold text-white mb-2">Story introuvable</h3>
        <p className="text-[var(--text-muted)] mb-6">Cette story n'existe pas ou a été supprimée.</p>
        <button onClick={() => navigate(getStoriesPath())} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors">
           Retour aux stories
        </button>
      </div>
    );
  }

  return (
    <div className="font-jost text-[var(--text-primary)] max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold admin-dashboard-title">Modifier la story</h2>
        <p className="text-[var(--text-muted)] mt-2">Mettez à jour le titre ou l'image de votre story.</p>
      </div>
      
      {error && (
        <div className="mb-6 flex flex-col gap-2 text-red-400 font-medium bg-red-500/10 p-4 rounded-xl border border-red-500/20 animate-fadeIn">
           {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="dark-card p-6 flex flex-col gap-6">
           <div>
             <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Titre de la story</label>
             <input
               type="text"
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               required
               className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder-[var(--text-muted)]"
               placeholder="Ex: Nouveautés d'été..."
             />
           </div>

           <div>
             <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2 w-full">Statut Actuel</label>
             <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${story.is_active ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/10 text-white/50 border-white/10'}`}>
                   {story.is_active ? 'Publiée' : 'Brouillon'}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                   La visibilité se gère directement depuis la liste des stories.
                </span>
             </div>
           </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
           {/* Section Image Actuelle */}
           <div className="dark-card p-6 flex-1 flex flex-col relative overflow-hidden">
             <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-[var(--accent)]" />
                <h3 className="font-bold text-lg text-white">Image Actuelle</h3>
             </div>
             
             <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/50 aspect-[9/16] w-full max-w-[280px] mx-auto flex items-center justify-center">
                 <img
                   src={story.image_url}
                   alt={story.title}
                   className="w-full h-full object-cover"
                   onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                 />
                 <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="font-medium text-white shadow-sm line-clamp-2 leading-tight">{title || 'Sans titre'}</p>
                 </div>
             </div>
           </div>

           {/* Section Remplacement */}
           <div className="dark-card p-6 flex-1 flex flex-col">
              <h3 className="font-bold text-lg text-white mb-4">Remplacer l'image</h3>
              <p className="text-sm text-[var(--text-muted)] mb-4">Sélectionnez une nouvelle image au format 9:16 (vertical) pour remplacer l'actuelle. Laissez vide pour la conserver.</p>
              
              <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center bg-black/20 hover:bg-black/40 hover:border-[var(--accent)]/50 transition-all group mt-auto mb-auto relative w-full aspect-[9/16] max-w-[280px] mx-auto flex items-center justify-center flex-col">
                 {imageFile ? (
                    <div className="absolute inset-0 w-full h-full pointer-events-none rounded-xl overflow-hidden p-1">
                      <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                         <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-xl">Nouvelle image sélectionnée</span>
                      </div>
                    </div>
                 ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[var(--accent)]/10 transition-all">
                        <ImageIcon className="w-8 h-8 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
                      </div>
                      <span className="font-medium text-white mb-1">Cliquer pour parcourir</span>
                      <span className="text-xs text-[var(--text-muted)]">PNG, JPG ou WEBP</span>
                    </>
                 )}
                 <input
                   type="file"
                   accept="image/*"
                   onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                 />
              </div>
           </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            type="button"
            onClick={() => navigate(getStoriesPath())}
            className="flex-1 bg-white/5 border border-white/10 text-[var(--text-primary)] px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
            disabled={saving}
          >
            <X className="w-5 h-5" />
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-[var(--accent)] shadow-[0_4px_16px_var(--accent-glow)] text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all hover:-translate-y-0.5"
          >
            {saving ? (
              <LoadingBar variant="inline" className="h-0.5 min-w-[60px] flex-1 max-w-16 bg-white/30" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditStoryPage;