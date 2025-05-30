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
  let filtered = stories.filter(s => !search || s.title.toLowerCase().includes(search.toLowerCase()) || (s.badge || '').toLowerCase().includes(search.toLowerCase()));
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Drag & drop image upload (démo)
  const handleDrop = e => { e.preventDefault(); setDragActive(false); };
  const handleDragOver = e => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = e => { e.preventDefault(); setDragActive(false); };

  // Lightbox
  const openLightbox = url => setLightbox(url);
  const closeLightbox = () => setLightbox(null);

  // Ajout/édition story (avec upload image)
  const handleSave = async (story, file) => {
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
      setError(err.message || 'Erreur lors de l’enregistrement.');
    } finally {
      setLoading(false);
    }
  };

  // Suppression réelle (table + image storage)
  const handleDelete = async (story) => {
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
      setError(err.message || 'Erreur lors de la suppression.');
    } finally {
      setLoading(false);
      setConfirmDelete(null);
    }
  };

  // Activation/désactivation
  const handleToggleActive = async (id, isActive) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { error } = await supabase.from('stories').update({ is_active: !isActive }).eq('id', id);
      if (error) throw error;
      setSuccess('Story mise à jour !');
      fetchStories();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f9fafd] to-[#e6eaff] flex flex-col items-center py-0 px-0 font-jost">
      <div className="w-full max-w-7xl flex-1 flex flex-col justify-start items-center px-2 sm:px-6 md:px-10 py-10">
        {/* Barre sticky */}
        <div className="w-full sticky top-0 z-20 bg-white/80 backdrop-blur-md rounded-b-2xl shadow-lg mb-8 px-4 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-[#e5e9f2]">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-[#232b46] flex items-center gap-2">📰 Stories</h2>
            <div className="flex flex-wrap gap-4 text-base text-gray-600">
              <span>Total : <b>{total}</b></span>
              <span>Actives : <b>{totalActive}</b></span>
              <span>Vues : <b>{totalViews}</b></span>
              {badges.length > 0 && <span>Badges : {badges.map(b => <span key={b} className="ml-1 bg-[#ffc107]/30 text-[#232b46] px-2 py-1 rounded-full text-xs font-bold">{b}</span>)}</span>}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 items-center justify-end">
            <div className="relative">
              <input type="text" placeholder="Recherche titre, badge..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-[#4f8cff] outline-none text-base bg-white shadow-sm" />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <button onClick={() => { setEditStory(null); setModalOpen(true); }} className="px-5 py-2 rounded-xl bg-[#4f8cff] text-white font-bold shadow hover:bg-[#2563eb] transition flex items-center gap-2"><Plus className="w-5 h-5" /> Nouvelle</button>
          </div>
        </div>
        {/* Feedback visuel */}
        {(loading || error || success) && (
          <div className="w-full max-w-2xl mx-auto mb-6">
            {loading && <div className="text-[#4f8cff] font-bold animate-pulse">Chargement...</div>}
            {error && <div className="text-[#ff184e] font-bold">{error}</div>}
            {success && <div className="text-green-600 font-bold">{success}</div>}
          </div>
        )}
        {/* Grille de stories */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-10">
          {paginated.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 text-lg py-12">Aucune story trouvée.</div>
          ) : (
            paginated.map(story => (
              <div key={story.id} className={`relative group bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col transition hover:scale-[1.03] hover:shadow-2xl cursor-pointer border-2 ${story.is_active ? 'border-[#4f8cff]' : 'border-transparent'}`}>
                {/* Image story */}
                <div className="relative w-full h-48 flex items-center justify-center bg-gray-50 overflow-hidden" onClick={() => openLightbox(story.image_url)}>
                  {story.image_url ? <img src={story.image_url} alt={story.title} className="object-cover w-full h-full transition group-hover:scale-105" /> : <ImgIcon className="w-16 h-16 text-gray-300" />}
                  {story.badge && <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-[#ffc107]/90 text-[#232b46]">{story.badge}</span>}
                  {story.is_active && <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold bg-[#4f8cff]/90 text-white flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Active</span>}
                </div>
                {/* Infos */}
                <div className="flex-1 flex flex-col p-4 gap-2">
                  <div className="font-bold text-[#232b46] text-lg truncate" title={story.title}>{story.title}</div>
                  <div className="text-gray-400 text-xs flex items-center gap-2"><Eye className="w-4 h-4" /> {story.views} vues</div>
                </div>
                {/* Actions */}
                <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={e => { e.stopPropagation(); handleToggleActive(story.id, story.is_active); }} className={`bg-[#4f8cff] text-white p-2 rounded-full shadow hover:scale-110 transition ${story.is_active ? '' : 'opacity-60'}`} title={story.is_active ? 'Désactiver' : 'Activer'}>{story.is_active ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                  <button onClick={e => { e.stopPropagation(); setEditStory(story); setModalOpen(true); }} className="bg-[#ffc107] text-[#232b46] p-2 rounded-full shadow hover:scale-110 transition" title="Éditer"><Edit2 className="w-5 h-5" /></button>
                  <button onClick={e => { e.stopPropagation(); setConfirmDelete(story); }} className="bg-[#ff184e] text-white p-2 rounded-full shadow hover:scale-110 transition" title="Supprimer"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Pagination */}
        {pageCount > 1 && (
          <div className="flex justify-center gap-4 mb-10">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-6 py-3 rounded-xl border border-gray-200 text-base font-bold bg-white shadow disabled:opacity-50">Précédent</button>
            <span className="px-6 py-3 text-base font-bold">Page {page} / {pageCount}</span>
            <button onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page === pageCount} className="px-6 py-3 rounded-xl border border-gray-200 text-base font-bold bg-white shadow disabled:opacity-50">Suivant</button>
          </div>
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
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full relative flex flex-col items-center">
              <button onClick={closeLightbox} className="absolute top-4 right-4 bg-gray-200 text-[#ff184e] p-2 rounded-full hover:scale-110 transition"><X className="w-6 h-6" /></button>
              <div className="w-full flex flex-col items-center">
                <img src={lightbox} alt="aperçu story" className="max-h-[60vh] w-auto rounded-xl shadow mb-4" />
              </div>
            </div>
          </div>
        )}
        {/* Confirmation suppression */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-10 rounded-2xl shadow-2xl">
              <div className="text-2xl font-bold mb-8 text-[#ff184e]">Supprimer la story "{confirmDelete.title}" ?</div>
              <div className="flex justify-end gap-6">
                <button onClick={() => setConfirmDelete(null)} className="bg-gray-200 text-[#ff184e] px-6 py-3 rounded-xl font-semibold hover:scale-105 transition">Annuler</button>
                <button onClick={() => handleDelete(confirmDelete)} className="bg-[#ff184e] text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition">Supprimer</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Modale d'ajout/édition story
const StoryModal = ({ open, onClose, onSave, initialData, dragActive, setDragActive, inputRef, loading }) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
  const [badge, setBadge] = useState(initialData?.badge || "");
  const [views, setViews] = useState(initialData?.views || 0);
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [file, setFile] = useState<File|null>(null);

  // Drag & drop image (upload)
  const handleDrop = e => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files) as File[];
    if (files[0]) {
      setFile(files[0]);
      setImageUrl(URL.createObjectURL(files[0]));
    }
  };
  const handleDragOver = e => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = e => { e.preventDefault(); setDragActive(false); };
  const handleFileInput = e => {
    const files = Array.from(e.target.files as FileList) as File[];
    if (files[0]) {
      setFile(files[0]);
      setImageUrl(URL.createObjectURL(files[0]));
    }
  };

  const handleSubmit = e => {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg flex flex-col gap-6 relative animate-fade-in">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 bg-gray-200 text-[#ff184e] p-2 rounded-full hover:scale-110 transition"><X className="w-6 h-6" /></button>
        <h3 className="text-2xl font-bold text-[#232b46] mb-2">{initialData ? 'Éditer la story' : 'Nouvelle story'}</h3>
        <div>
          <label className="block font-bold mb-2 text-[#232b46]">Titre :</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#4f8cff] outline-none text-lg" />
        </div>
        <div>
          <label className="block font-bold mb-2 text-[#232b46]">Image :</label>
          <div
            className={`w-full border-2 border-dashed rounded-xl transition-all duration-200 flex flex-col items-center justify-center py-6 mb-2 ${dragActive ? 'border-[#4f8cff] bg-blue-50' : 'border-gray-200 bg-white/70'}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <UploadCloud className="w-8 h-8 text-[#4f8cff] mb-2" />
            <div className="text-base font-bold mb-1">Glissez-déposez une image ici</div>
            <div className="text-gray-500 mb-2">ou cliquez sur Upload</div>
            <button type="button" onClick={() => { if (inputRef.current) inputRef.current.click(); }} className="px-4 py-2 rounded-xl bg-[#4f8cff] text-white font-bold shadow hover:bg-[#2563eb] transition flex items-center gap-2"><UploadCloud className="w-4 h-4" /> Upload</button>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} disabled={loading} />
          </div>
          {imageUrl && <img src={imageUrl} alt="aperçu" className="mt-3 max-w-xs rounded-lg shadow" />}
        </div>
        <div>
          <label className="block font-bold mb-2 text-[#232b46]">Badge (optionnel) :</label>
          <input value={badge} onChange={e => setBadge(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#4f8cff] outline-none text-lg" placeholder="Ex: Nouveau, Populaire..." />
        </div>
        <div>
          <label className="block font-bold mb-2 text-[#232b46]">Vues :</label>
          <input type="number" value={views} onChange={e => setViews(Number(e.target.value))} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#4f8cff] outline-none text-lg" />
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} id="active" className="w-5 h-5" />
          <label htmlFor="active" className="font-bold text-[#232b46]">Active</label>
        </div>
        <button type="submit" className="mt-4 px-6 py-3 rounded-xl bg-[#4f8cff] text-white font-bold shadow hover:bg-[#2563eb] transition" disabled={loading}>{initialData ? 'Enregistrer' : 'Créer la story'}</button>
      </form>
    </div>
  ) : null;
};

export default StoriesPage; 