import React, { useState, useRef, useEffect } from "react";
import { X, Edit2, Trash2, Plus, CheckCircle, Image as ImgIcon, Search, UploadCloud, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const BUCKET = 'stories';
const PAGE_SIZE = 8;

const StoriesPage = () => {
  const [search, setSearch] = useState("");
  const [stories, setStories] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editStory, setEditStory] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);
  const [lightbox, setLightbox] = useState<string|null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [page, setPage] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(null);

  // Fetch stories from Supabase
  const fetchStories = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from('stories').select('*').order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setStories(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchStories(); }, []);

  // Stats dynamiques
  const total = stories.length;
  const totalActive = stories.filter(s => s.is_active).length;
  const totalViews = stories.reduce((s, st) => s + (st.views || 0), 0);
  const badges = Array.from(new Set(stories.map(s => s.badge).filter(Boolean)));

  // Filtrage
  const filtered = stories.filter(s => !search || s.title.toLowerCase().includes(search.toLowerCase()) || (s.badge || '').toLowerCase().includes(search.toLowerCase()));
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Lightbox
  const openLightbox = (url: string) => setLightbox(url);
  const closeLightbox = () => setLightbox(null);

  // Ajout/édition story (avec upload image)
  const handleSave = async (story: any, file?: File) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    let imageUrl = story.image_url;
    try {
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `story-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(fileName, file, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }
      if (story.id) {
        // Update
        const { error: updateError } = await supabase.from('stories').update({
          title: story.title,
          image_url: imageUrl,
          badge: story.badge,
          views: story.views,
          is_active: story.is_active,
        }).eq('id', story.id);
        if (updateError) throw updateError;
        setSuccess('Story modifiée !');
      } else {
        // Insert
        const { error: insertError } = await supabase.from('stories').insert([{
          title: story.title,
          image_url: imageUrl,
          badge: story.badge,
          views: story.views,
          is_active: story.is_active,
        }]);
        if (insertError) throw insertError;
        setSuccess('Story ajoutée !');
      }
      setModalOpen(false);
      setEditStory(null);
      fetchStories();
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  // Suppression réelle (table + image storage)
  const handleDelete = async (story: any) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Supprime image du storage si présente
      if (story.image_url && story.image_url.includes('/storage/v1/object/public/stories/')) {
        const path = story.image_url.split('/storage/v1/object/public/stories/')[1];
        if (path) await supabase.storage.from(BUCKET).remove([path]);
      }
      const { error: delError } = await supabase.from('stories').delete().eq('id', story.id);
      if (delError) throw delError;
      setSuccess('Story supprimée !');
      fetchStories();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression.");
    } finally {
      setLoading(false);
      setConfirmDelete(null);
    }
  };

  // Activation/désactivation
  const handleToggleActive = async (id: string, isActive: boolean) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { error } = await supabase.from('stories').update({ is_active: !isActive }).eq('id', id);
      if (error) throw error;
      setSuccess('Story mise à jour !');
      fetchStories();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-[var(--text-primary)] font-jost">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Gestion des Stories</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">Gérez les visual stories de votre site</p>
          </div>
          <div className="flex flex-wrap gap-3 items-center w-full xl:w-auto">
            <div className="relative w-full xl:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                value={search} 
                onChange={e => { setSearch(e.target.value); setPage(1); }} 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[var(--accent)] outline-none text-sm text-white transition-colors"
               />
            </div>
            <button 
              onClick={() => { setEditStory(null); setModalOpen(true); }} 
              className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white font-bold shadow-[0_4px_16px_var(--accent-glow)] hover:brightness-110 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 w-full xl:w-auto"
            >
              <Plus className="w-5 h-5" /> Nouvelle Story
            </button>
          </div>
        </div>
        
        {/* Stats */}
        {(total > 0 || totalActive > 0 || totalViews > 0 || badges.length > 0) && (
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="dark-card !p-4 flex flex-col gap-1 w-full sm:w-auto min-w-[120px]">
              <div className="text-xs text-[var(--text-muted)] font-medium">Total</div>
              <div className="text-xl font-bold text-white">{total}</div>
            </div>
            <div className="dark-card !p-4 flex flex-col gap-1 w-full sm:w-auto min-w-[120px]">
              <div className="text-xs text-[var(--text-muted)] font-medium">Actives</div>
              <div className="text-xl font-bold text-blue-400">{totalActive}</div>
            </div>
            <div className="dark-card !p-4 flex flex-col gap-1 w-full sm:w-auto min-w-[120px]">
              <div className="text-xs text-[var(--text-muted)] font-medium">Vues Totales</div>
              <div className="text-xl font-bold text-emerald-400">{totalViews}</div>
            </div>
            {badges.length > 0 && (
              <div className="dark-card !p-4 flex flex-col gap-1 w-full sm:w-auto flex-1 md:flex-none">
                <div className="text-xs text-[var(--text-muted)] font-medium mb-1.5">Badges actifs</div>
                <div className="flex flex-wrap gap-1.5">
                  {badges.map(b => (
                    <span key={b} className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-2 py-0.5 rounded font-medium text-xs truncate max-w-[100px]">{b}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error/Success Messages */}
      {(error || success) && (
        <div className="mb-6 flex flex-col gap-2">
          {error && <div className="text-red-400 font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20 animate-fadeIn">{error}</div>}
          {success && <div className="text-green-400 font-medium bg-green-500/10 p-3 rounded-lg border border-green-500/20 animate-fadeIn">{success}</div>}
        </div>
      )}
      
      {loading && !stories.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
          <svg className="animate-spin h-8 w-8 mb-4 text-[var(--accent)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
          Chargement des stories...
        </div>
      ) : (
        <>
          {/* Stories Grid */}
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-[var(--text-muted)] py-20 dark-card">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              <p className="text-lg font-medium">Aucune story trouvée.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {paginated.map(story => (
                <div 
                  key={story.id} 
                  className={`dark-card !p-0 overflow-hidden flex flex-col group transition-all duration-300 hover:-translate-y-1 border ${
                    story.is_active ? 'border-[var(--accent)] shadow-[0_4px_24px_var(--accent-glow)]' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Image story */}
                  <div 
                    className="relative w-full h-56 flex items-center justify-center bg-black/40 overflow-hidden cursor-pointer" 
                    onClick={() => openLightbox(story.image_url)}
                  >
                    {story.image_url ? (
                      <img 
                        src={story.image_url} 
                        alt={story.title} 
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105 opacity-90" 
                      />
                    ) : (
                      <ImgIcon className="w-16 h-16 text-white/20" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                    
                    {story.badge && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded text-xs font-bold bg-yellow-500 text-yellow-950 shadow-lg">
                        {story.badge}
                      </span>
                    )}
                    {story.is_active && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded text-xs font-bold bg-[var(--accent)] text-white flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        Active
                      </span>
                    )}
                  </div>
                  
                  {/* Infos */}
                  <div className="flex-1 flex flex-col p-4">
                    <div className="font-bold text-[var(--text-primary)] text-sm mb-2 line-clamp-2" title={story.title}>
                      {story.title}
                    </div>
                    <div className="mt-auto flex items-center justify-between text-[var(--text-secondary)] text-xs">
                      <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded border border-white/5">
                        <Eye className="w-3.5 h-3.5 text-emerald-400" /> <span className="font-mono">{story.views || 0}</span>
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="absolute bottom-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={e => { e.stopPropagation(); handleToggleActive(story.id, story.is_active); }} 
                      className={`p-1.5 rounded-lg shadow-lg backdrop-blur-sm transition-colors ${
                        story.is_active 
                          ? 'bg-red-500/80 hover:bg-red-500 text-white' 
                          : 'bg-green-500/80 hover:bg-green-500 text-white'
                      }`} 
                      title={story.is_active ? 'Désactiver' : 'Activer'}
                    >
                      {story.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={e => { e.stopPropagation(); setEditStory(story); setModalOpen(true); }} 
                      className="p-1.5 bg-blue-500/80 hover:bg-blue-500 text-white rounded-lg shadow-lg backdrop-blur-sm transition-colors" 
                      title="Éditer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={e => { e.stopPropagation(); setConfirmDelete(story); }} 
                      className="p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg shadow-lg backdrop-blur-sm transition-colors" 
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {pageCount > 1 && (
            <div className="flex justify-center items-center gap-4 pt-4 border-t border-white/10">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1} 
                className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm font-medium hover:bg-white/10 disabled:opacity-30 transition-colors text-white"
              >
                Précédent
              </button>
              <span className="px-4 py-2 text-sm font-bold bg-[var(--accent)]/10 text-[var(--accent)] rounded-lg border border-[var(--accent)]/20">
                Page {page} sur {pageCount}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(pageCount, p + 1))} 
                disabled={page === pageCount} 
                className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm font-medium hover:bg-white/10 disabled:opacity-30 transition-colors text-white"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}

      {/* Modale ajout/édition */}
      {modalOpen && (
        <StoryModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditStory(null); }}
          onSave={handleSave}
          initialData={editStory}
          dragActive={dragActive}
          setDragActive={setDragActive}
          inputRef={inputRef}
          loading={loading}
        />
      )}
      
      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={closeLightbox}>
          <div className="relative max-w-sm w-full flex flex-col items-center">
            <button 
              onClick={closeLightbox} 
              className="absolute -top-12 right-0 bg-white/10 text-white p-2 rounded-full hover:bg-[var(--accent)] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={lightbox} 
              alt="aperçu story" 
              className="max-h-[85vh] w-auto mx-auto rounded-2xl shadow-[0_0_40px_rgba(255,24,78,0.2)] border border-white/10 object-contain bg-black" 
            />
          </div>
        </div>
      )}
      
      {/* Confirmation suppression */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="bg-red-500/10 p-4 rounded-full mb-4 w-fit mx-auto">
              <Trash2 className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Supprimer la story ?</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-8">
              Vous êtes sur le point de supprimer la story<br/>
              <strong className="text-white">"{confirmDelete.title}"</strong>.<br/>
              Cette action est irréversible.
            </p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setConfirmDelete(null)} 
                className="flex-1 bg-white/5 text-[var(--text-primary)] px-4 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors border border-white/10"
              >
                Annuler
              </button>
              <button 
                onClick={() => handleDelete(confirmDelete)} 
                className="flex-1 bg-red-500 text-white px-4 py-3 rounded-xl font-semibold hover:brightness-110 shadow-[0_4px_16px_rgba(239,68,68,0.3)] transition-all"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Modale d'ajout/édition story
const StoryModal = ({ open, onClose, onSave, initialData, dragActive, setDragActive, inputRef, loading }: any) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
  const [badge, setBadge] = useState(initialData?.badge || "");
  const [views, setViews] = useState(initialData?.views || 0);
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [file, setFile] = useState<File|null>(null);

  React.useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setImageUrl(initialData.image_url || "");
      setBadge(initialData.badge || "");
      setViews(initialData.views || 0);
      setIsActive(initialData.is_active ?? true);
    } else {
      setTitle("");
      setImageUrl("");
      setBadge("");
      setViews(0);
      setIsActive(true);
    }
    setFile(null);
  }, [initialData, open]);

  // Drag & drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files) as File[];
    if (files[0]) {
      setFile(files[0]);
      setImageUrl(URL.createObjectURL(files[0]));
    }
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragActive(false); };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files[0]) {
      setFile(files[0]);
      setImageUrl(URL.createObjectURL(files[0]));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      id: initialData?.id,
      title,
      image_url: imageUrl,
      badge,
      views,
      is_active: isActive,
    }, file);
  };

  return open ? (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl p-8 w-full max-w-lg flex flex-col gap-6 relative max-h-[90vh] overflow-y-auto custom-scrollbar animate-modalIn">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-[var(--text-muted)] p-2 rounded-lg hover:bg-white/10 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
          {initialData ? 'Éditer la story' : 'Nouvelle story'}
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Titre de la story <span className="text-red-500">*</span></label>
          <input 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/30 text-white focus:border-[var(--accent)] outline-none text-sm transition-colors placeholder-[var(--text-muted)]" 
            placeholder="Titre accrocheur..."
            required 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Image format vertical (9:16)</label>
          <div
            className={`w-full border-2 border-dashed rounded-xl transition-all duration-300 flex flex-col items-center justify-center py-8 mb-4 ${
              dragActive ? 'border-[var(--accent)] bg-[var(--accent)]/10' : 'border-white/10 bg-black/20 hover:bg-black/40 hover:border-white/20'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <UploadCloud className={`w-10 h-10 mb-3 ${dragActive ? 'text-[var(--accent)]' : 'text-white/40'}`} />
            <div className="text-sm font-semibold mb-1 text-[var(--text-primary)]">Glissez-déposez une image ici</div>
            <div className="text-xs text-[var(--text-muted)] mb-4">ou cliquez sur le bouton ci-dessous</div>
            <button 
              type="button" 
              onClick={() => { if (inputRef.current) inputRef.current.click(); }} 
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition flex items-center gap-2 border border-white/10"
            >
              <UploadCloud className="w-4 h-4" /> Parcourir...
            </button>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} disabled={loading} />
          </div>
          
          {imageUrl && (
            <div className="relative rounded-xl overflow-hidden border border-white/10 max-w-[150px] mx-auto mt-2">
              <img src={imageUrl} alt="aperçu" className="w-full h-auto object-cover" />
              <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs backdrop-blur-sm text-white font-medium">Aperçu</div>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Badge (optionnel)</label>
            <input 
              value={badge} 
              onChange={e => setBadge(e.target.value)} 
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/30 text-white focus:border-[var(--accent)] outline-none text-sm transition-colors placeholder-[var(--text-muted)]" 
              placeholder="Ex: Nouveau..." 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Vues initiales</label>
            <input 
              type="number" 
              value={views} 
              onChange={e => setViews(Number(e.target.value))} 
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/30 text-white focus:border-[var(--accent)] outline-none text-sm transition-colors" 
              min="0" 
            />
          </div>
        </div>
        
        <label className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-black/20 cursor-pointer hover:bg-black/30 transition-colors">
          <div className="relative flex items-center">
            <input 
              type="checkbox" 
              checked={isActive} 
              onChange={e => setIsActive(e.target.checked)} 
              className="peer sr-only" 
            />
            <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
          </div>
          <span className="text-sm font-medium text-white">Story visible publiquement</span>
        </label>
        
        <div className="flex gap-4 mt-4">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
            disabled={loading}
          >
            Annuler
          </button>
          <button 
            type="submit" 
            className="flex-1 px-4 py-3 rounded-xl bg-[var(--accent)] text-white text-sm font-bold shadow-[0_4px_16px_var(--accent-glow)] hover:brightness-110 hover:-translate-y-0.5 transition-all" 
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : initialData ? 'Enregistrer' : 'Créer la story'}
          </button>
        </div>
      </form>
    </div>
  ) : null;
};

export default StoriesPage;
