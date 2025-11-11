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
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
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
    <div className="font-poppins">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Gestion des Stories</h2>
            <p className="text-sm text-gray-500">Gérez les stories de votre site</p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Rechercher..." 
                value={search} 
                onChange={e => { setSearch(e.target.value); setPage(1); }} 
                className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#4f8cff] focus:ring-2 focus:ring-[#4f8cff]/20 outline-none text-sm bg-white font-poppins"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <button 
              onClick={() => { setEditStory(null); setModalOpen(true); }} 
              className="px-5 py-2.5 rounded-lg bg-[#4f8cff] text-white font-medium text-sm hover:bg-[#2563eb] transition-colors shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Nouvelle
            </button>
          </div>
        </div>
        
        {/* Stats */}
        {(total > 0 || totalActive > 0 || totalViews > 0 || badges.length > 0) && (
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
              <div className="text-xs text-gray-500 mb-1">Total</div>
              <div className="text-lg font-semibold text-gray-800">{total}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
              <div className="text-xs text-gray-500 mb-1">Actives</div>
              <div className="text-lg font-semibold text-gray-800">{totalActive}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
              <div className="text-xs text-gray-500 mb-1">Vues</div>
              <div className="text-lg font-semibold text-gray-800">{totalViews}</div>
            </div>
            {badges.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
                <div className="text-xs text-gray-500 mb-1">Badges</div>
                <div className="flex flex-wrap gap-1.5">
                  {badges.map(b => (
                    <span key={b} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">{b}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}
      
      {loading && !stories.length && (
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500 font-poppins text-base">Chargement...</div>
        </div>
      )}
      {/* Stories Grid */}
      {paginated.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500 font-medium">Aucune story trouvée.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
            {paginated.map(story => (
              <div 
                key={story.id} 
                className={`relative group bg-white rounded-lg border-2 overflow-hidden flex flex-col transition-all hover:shadow-lg cursor-pointer ${
                  story.is_active ? 'border-[#4f8cff]' : 'border-gray-200'
                }`}
              >
                {/* Image story */}
                <div 
                  className="relative w-full h-48 flex items-center justify-center bg-gray-50 overflow-hidden" 
                  onClick={() => openLightbox(story.image_url)}
                >
                  {story.image_url ? (
                    <img 
                      src={story.image_url} 
                      alt={story.title} 
                      className="object-cover w-full h-full transition-transform group-hover:scale-105" 
                    />
                  ) : (
                    <ImgIcon className="w-12 h-12 text-gray-300" />
                  )}
                  {story.badge && (
                    <span className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      {story.badge}
                    </span>
                  )}
                  {story.is_active && (
                    <span className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium bg-[#4f8cff] text-white flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Active
                    </span>
                  )}
                </div>
                
                {/* Infos */}
                <div className="flex-1 flex flex-col p-4 gap-2">
                  <div className="font-semibold text-gray-800 text-sm truncate" title={story.title}>
                    {story.title}
                  </div>
                  <div className="text-gray-500 text-xs flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> {story.views || 0} vues
                  </div>
                </div>
                
                {/* Actions */}
                <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={e => { e.stopPropagation(); handleToggleActive(story.id, story.is_active); }} 
                    className={`p-2 rounded-lg shadow-sm transition-colors ${
                      story.is_active 
                        ? 'bg-[#4f8cff] text-white hover:bg-[#2563eb]' 
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`} 
                    title={story.is_active ? 'Désactiver' : 'Activer'}
                  >
                    {story.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={e => { e.stopPropagation(); setEditStory(story); setModalOpen(true); }} 
                    className="p-2 bg-yellow-50 text-yellow-600 rounded-lg shadow-sm hover:bg-yellow-100 transition-colors" 
                    title="Éditer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={e => { e.stopPropagation(); setConfirmDelete(story); }} 
                    className="p-2 bg-red-50 text-red-600 rounded-lg shadow-sm hover:bg-red-100 transition-colors" 
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {pageCount > 1 && (
            <div className="flex justify-center items-center gap-3">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1} 
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-700">Page {page} / {pageCount}</span>
              <button 
                onClick={() => setPage(p => Math.min(pageCount, p + 1))} 
                disabled={page === pageCount} 
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={closeLightbox}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full relative">
            <button 
              onClick={closeLightbox} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={lightbox} 
              alt="aperçu story" 
              className="max-h-[70vh] w-auto mx-auto rounded-lg" 
            />
          </div>
        </div>
      )}
      
      {/* Confirmation suppression */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Supprimer la story</h3>
            <p className="text-sm text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer la story <strong>"{confirmDelete.title}"</strong> ?
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setConfirmDelete(null)} 
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={() => handleDelete(confirmDelete)} 
                className="px-4 py-2 rounded-lg bg-[#ff184e] text-white text-sm font-medium hover:bg-red-600 transition-colors"
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

  // Drag & drop image (upload)
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg flex flex-col gap-5 relative max-h-[90vh] overflow-y-auto font-poppins">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-semibold text-gray-800 mb-1">{initialData ? 'Éditer la story' : 'Nouvelle story'}</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Titre <span className="text-red-500">*</span></label>
          <input 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#4f8cff] focus:ring-2 focus:ring-[#4f8cff]/20 outline-none text-sm font-poppins" 
            required 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Image</label>
          <div
            className={`w-full border-2 border-dashed rounded-lg transition-all duration-200 flex flex-col items-center justify-center py-6 mb-2 ${
              dragActive ? 'border-[#4f8cff] bg-blue-50' : 'border-gray-200 bg-gray-50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <UploadCloud className="w-8 h-8 text-[#4f8cff] mb-2" />
            <div className="text-sm font-medium mb-1 text-gray-700">Glissez-déposez une image ici</div>
            <div className="text-xs text-gray-500 mb-3">ou cliquez sur le bouton ci-dessous</div>
            <button 
              type="button" 
              onClick={() => { if (inputRef.current) inputRef.current.click(); }} 
              className="px-4 py-2 rounded-lg bg-[#4f8cff] text-white text-sm font-medium hover:bg-[#2563eb] transition-colors shadow-sm flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" /> Upload
            </button>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} disabled={loading} />
          </div>
          {imageUrl && (
            <img src={imageUrl} alt="aperçu" className="mt-3 max-w-xs rounded-lg shadow border border-gray-200" />
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Badge (optionnel)</label>
          <input 
            value={badge} 
            onChange={e => setBadge(e.target.value)} 
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#4f8cff] focus:ring-2 focus:ring-[#4f8cff]/20 outline-none text-sm font-poppins" 
            placeholder="Ex: Nouveau, Populaire..." 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Vues</label>
          <input 
            type="number" 
            value={views} 
            onChange={e => setViews(Number(e.target.value))} 
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#4f8cff] focus:ring-2 focus:ring-[#4f8cff]/20 outline-none text-sm font-poppins" 
            min="0" 
          />
        </div>
        
        <div className="flex items-center gap-3">
          <input 
            type="checkbox" 
            checked={isActive} 
            onChange={e => setIsActive(e.target.checked)} 
            id="active" 
            className="w-4 h-4 rounded border-gray-300 text-[#4f8cff] focus:ring-2 focus:ring-[#4f8cff]/20" 
          />
          <label htmlFor="active" className="text-sm font-medium text-gray-700">Active</label>
        </div>
        
        <div className="flex justify-end gap-3 pt-2">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button 
            type="submit" 
            className="px-5 py-2.5 rounded-lg bg-[#4f8cff] text-white text-sm font-medium hover:bg-[#2563eb] transition-colors shadow-sm" 
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
