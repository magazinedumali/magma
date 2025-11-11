import React, { useState, useRef } from "react";
import MediaModal from "./MediaModal";
import { X, Edit2, Trash2, UploadCloud, Image as ImgIcon, Video, Music, List as ListIcon, LayoutGrid as GridIcon } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import SupabaseStorageTest from '@/components/SupabaseStorageTest';
import ImageUrlTest from '@/components/ImageUrlTest';

const DUMMY_MEDIAS = [
  { id: 1, title: "Image de couverture", type: "image", url: "https://via.placeholder.com/400x250?text=IMG", size: 120000 },
  { id: 2, title: "Vidéo promo", type: "video", url: "https://www.w3schools.com/html/mov_bbb.mp4", size: 8000000 },
  { id: 3, title: "Podcast 2024", type: "audio", url: "https://www.w3schools.com/html/horse.mp3", size: 3000000 },
  { id: 4, title: "Logo", type: "image", url: "https://via.placeholder.com/400x250?text=LOGO", size: 90000 },
  { id: 5, title: "Interview", type: "audio", url: "https://www.w3schools.com/html/horse.mp3", size: 2500000 },
  { id: 6, title: "Présentation", type: "video", url: "https://www.w3schools.com/html/mov_bbb.mp4", size: 12000000 },
];

const typeIcons = {
  image: <ImgIcon className="w-5 h-5 text-[#4f8cff]" />, video: <Video className="w-5 h-5 text-[#ff184e]" />, audio: <Music className="w-5 h-5 text-[#ffc107]" />
};

const BUCKETS = [
  'article-images',
  'article-audios',
  'banners',
  'articles',
  'avatars',
  'albums',
  'trending',
  'stories',
  'polls',
];

const PAGE_SIZE = 12;

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' o';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
  return (bytes / 1024 / 1024).toFixed(1) + ' Mo';
}

const MediasPage = () => {
  const [search, setSearch] = useState("");
  const [showStorageTest, setShowStorageTest] = useState(false);
  const [showImageTests, setShowImageTests] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [medias, setMedias] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [currentPath, setCurrentPath] = useState(""); // '' = racine
  const [modalOpen, setModalOpen] = useState(false);
  const [editMedia, setEditMedia] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [lightbox, setLightbox] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(null);
  const [viewMode, setViewMode] = useState<'grid'|'list'>('grid');
  const [selectedBucket, setSelectedBucket] = useState(BUCKETS[0]);

  // Nouvelle logique : fetch dossiers + fichiers du dossier courant
  const fetchMedias = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.storage.from(selectedBucket).list(currentPath, { limit: 100, offset: 0 });
      if (error) throw error;
      // Sépare dossiers et fichiers
      const folders = (data || []).filter(f => f && f.name && f.id === undefined && f.metadata === undefined && f.created_at === undefined && f.updated_at === undefined && f.last_accessed_at === undefined && f.name.endsWith('/'));
      const files = (data || []).filter(f => f && f.name && !f.name.endsWith('/') && (f.name.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i) || f.name.match(/\.(mp3|wav|ogg|aac|m4a)$/i)));
      // Génère URLs publiques et type pour les fichiers
      const mapped = files.map(f => {
        const { data: publicUrlData } = supabase.storage.from(selectedBucket).getPublicUrl((currentPath ? currentPath + '/' : '') + f.name);
        const url = publicUrlData.publicUrl;
        let type = 'other';
        if (f.name.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)) type = 'image';
        else if (f.name.match(/\.(mp3|wav|ogg|aac|m4a)$/i)) type = 'audio';
        return {
          id: f.id || f.name,
          title: f.name,
          type,
          url,
          size: f.metadata && f.metadata.size ? Number(f.metadata.size) : 0,
          created_at: f.created_at || null,
        };
      });
      setFolders(folders);
      setMedias(mapped);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des fichiers.');
    } finally {
      setLoading(false);
    }
  };
  React.useEffect(() => { fetchMedias(); }, [selectedBucket, currentPath]);

  // Stats
  const total = medias.length;
  const totalSize = medias.reduce((s, m) => s + (m.size || 0), 0);
  const typeStats = ['image', 'video', 'audio'].map(type => ({ type, count: medias.filter(m => m.type === type).length }));

  // Filtrage
  const filtered = medias.filter(m =>
    (!search || m.title?.toLowerCase().includes(search.toLowerCase())) &&
    (!typeFilter || m.type === typeFilter)
  );
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Drag & drop upload (Supabase)
  const handleDrop = async e => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files) as File[];
    await handleUploadFiles(files);
  };
  const handleDragOver = e => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = e => { e.preventDefault(); setDragActive(false); };
  const handleFileInput = async e => {
    const files = Array.from(e.target.files as FileList) as File[];
    await handleUploadFiles(files);
  };

  // Upload files to Supabase (dans le dossier courant du bucket sélectionné)
  const handleUploadFiles = async (files: File[]) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${currentPath ? currentPath + '/' : ''}media-${Date.now()}-${Math.random().toString(36).slice(2,8)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from(selectedBucket).upload(fileName, file, { upsert: true });
        if (uploadError) throw uploadError;
      }
      setSuccess('Upload réussi !');
      fetchMedias();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l’upload.');
    } finally {
      setLoading(false);
    }
  };

  // Lightbox
  const openLightbox = media => setLightbox(media);
  const closeLightbox = () => setLightbox(null);

  // Ajout/édition média
  const handleSave = async (media, file?) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    let url = media.url;
    try {
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `media-${Date.now()}-${Math.random().toString(36).slice(2,8)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from(selectedBucket).upload(fileName, file, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from(selectedBucket).getPublicUrl(fileName);
        url = publicUrlData.publicUrl;
      }
    if (media.id) {
        // Update
        const { error: updateError } = await supabase.from('medias').update({
          title: media.title,
          type: media.type,
          url,
          size: media.size,
        }).eq('id', media.id);
        if (updateError) throw updateError;
        setSuccess('Média modifié !');
    } else {
        // Insert
        const { error: insertError } = await supabase.from('medias').insert([{
          title: media.title,
          type: media.type,
          url,
          size: media.size,
          created_at: new Date().toISOString(),
        }]);
        if (insertError) throw insertError;
        setSuccess('Média ajouté !');
      }
      setModalOpen(false);
      setEditMedia(null);
      fetchMedias();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l’enregistrement.');
    } finally {
      setLoading(false);
    }
  };

  // Suppression réelle (table + storage)
  const handleDelete = async (media) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Supprime fichier du storage si présent
      if (media.url && media.url.includes('/storage/v1/object/public/medias/')) {
        const path = media.url.split('/storage/v1/object/public/medias/')[1];
        if (path) await supabase.storage.from(selectedBucket).remove([path]);
      }
      const { error: delError } = await supabase.from('medias').delete().eq('id', media.id);
      if (delError) throw delError;
      setSuccess('Média supprimé !');
      fetchMedias();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression.');
    } finally {
      setLoading(false);
    setConfirmDelete(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f9fafd] to-[#e6eaff] flex flex-row font-jost">
      {showStorageTest && <SupabaseStorageTest />}
      {/* Sidebar sticky */}
      <div className="w-56 min-w-[180px] bg-[#18191c] text-white py-8 px-4 flex flex-col gap-2 border-r border-[#232b46]/10" style={{ position: 'sticky', top: 0, height: '100vh' }}>
        <div className="uppercase text-xs text-gray-400 mb-2 tracking-widest">All Buckets</div>
        {BUCKETS.map(bucket => (
          <div
            key={bucket}
            className={`px-3 py-2 rounded-lg cursor-pointer font-semibold transition ${selectedBucket === bucket ? 'bg-white/10 text-[#4f8cff]' : 'hover:bg-white/5 text-gray-200'}`}
            onClick={() => { setSelectedBucket(bucket); setCurrentPath(""); }}
        >
            {bucket}
          </div>
        ))}
      </div>
      {/* Contenu principal */}
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full max-w-7xl flex-1 flex flex-col justify-start items-center px-2 sm:px-6 md:px-10 py-10">
          {/* Barre sticky */}
          <div className="w-full sticky top-0 z-20 bg-white/80 backdrop-blur-md rounded-b-2xl shadow-lg mb-8 px-4 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-[#e5e9f2]">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-bold text-[#232b46] flex items-center gap-2">🎞️ Médias</h2>
              <div className="flex flex-wrap gap-4 text-base text-gray-600">
                <span>Total : <b>{total}</b></span>
                <span>Taille totale : <b>{formatSize(totalSize)}</b></span>
                {typeStats.map(ts => <span key={ts.type} className="flex items-center gap-1">{typeIcons[ts.type]} {ts.type.charAt(0).toUpperCase() + ts.type.slice(1)} <span className="text-xs text-gray-400">({ts.count})</span></span>)}
              </div>
            </div>
            <div className="flex flex-wrap gap-3 items-center justify-end">
              <input type="text" placeholder="Recherche..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="px-4 py-2 rounded-xl border border-gray-200 focus:border-[#4f8cff] outline-none text-base bg-white shadow-sm" />
              <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} className="px-4 py-2 rounded-xl border border-gray-200 text-base bg-white shadow-sm">
                <option value="">Tous types</option>
                <option value="image">Images</option>
                <option value="video">Vidéos</option>
                <option value="audio">Audios</option>
              </select>
              <button onClick={() => { if (inputRef.current) inputRef.current.click(); }} className="px-5 py-2 rounded-xl bg-[#4f8cff] text-white font-bold shadow hover:bg-[#2563eb] transition flex items-center gap-2"><UploadCloud className="w-5 h-5" /> Upload</button>
              <input ref={inputRef} type="file" multiple className="hidden" onChange={handleFileInput} accept="image/*,video/*,audio/*" />
              {/* Test Storage Button */}
              <button onClick={() => setShowStorageTest(!showStorageTest)} className="px-4 py-2 rounded-xl bg-orange-500 text-white font-bold shadow hover:bg-orange-600 transition">
                {showStorageTest ? 'Hide' : 'Test'} Storage
              </button>
              {/* Test Images Button */}
              <button onClick={() => setShowImageTests(!showImageTests)} className="px-4 py-2 rounded-xl bg-purple-500 text-white font-bold shadow hover:bg-purple-600 transition">
                {showImageTests ? 'Hide' : 'Test'} Images
              </button>
              {/* Toggle grille/liste */}
              <button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} className="ml-2 p-2 rounded-xl border border-gray-200 bg-white shadow hover:bg-gray-100 transition flex items-center" title={viewMode === 'grid' ? 'Affichage liste' : 'Affichage grille'}>
                {viewMode === 'grid' ? <ListIcon className="w-5 h-5" /> : <GridIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {/* Fil d’Ariane (breadcrumb) */}
          <div className="w-full flex items-center gap-2 mb-4 text-sm text-[#4f8cff] font-semibold">
            <span
              className={currentPath ? 'cursor-pointer hover:underline' : ''}
              onClick={() => setCurrentPath("")}
            >Racine</span>
            {currentPath && currentPath.split('/').filter(Boolean).map((folder, idx, arr) => {
              const path = arr.slice(0, idx + 1).join('/') + '/';
              const isLast = idx === arr.length - 1;
              return (
                <React.Fragment key={path}>
                  <span className="text-gray-400">/</span>
                  <span
                    className={isLast ? '' : 'cursor-pointer hover:underline'}
                    onClick={() => !isLast && setCurrentPath(arr.slice(0, idx + 1).join('/') + '/')}
                    style={isLast ? { color: '#232b46' } : {}}
                  >{folder}</span>
                </React.Fragment>
              );
            })}
          </div>
          {/* Navigation dossiers */}
          <div className="w-full flex flex-wrap gap-4 mb-8">
            {folders.map(folder => (
              <div key={folder.name} className="flex items-center gap-2 px-4 py-2 bg-[#e5e9f2] rounded-xl cursor-pointer hover:bg-[#4f8cff]/20 font-semibold" onClick={() => setCurrentPath(currentPath ? currentPath + folder.name : folder.name)}>
                <span role="img" aria-label="dossier">📁</span> {folder.name.replace(/\/$/, '')}
              </div>
            ))}
          </div>
          
          {/* Image Tests Section */}
          {showImageTests && (
            <div className="w-full mb-8 p-4 bg-white rounded-xl shadow">
              <h3 className="text-lg font-bold mb-4">Image URL Tests</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {medias.filter(m => m.type === 'image').slice(0, 4).map(media => (
                  <ImageUrlTest 
                    key={media.id} 
                    url={media.url} 
                    title={media.title}
                  />
                ))}
                {medias.filter(m => m.type === 'image').length === 0 && (
                  <div className="col-span-full text-center text-gray-500">
                    No images found to test
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Zone drag & drop */}
          <div
            className={`w-full max-w-5xl mx-auto mb-8 border-2 border-dashed rounded-2xl transition-all duration-200 flex flex-col items-center justify-center py-12 ${dragActive ? 'border-[#4f8cff] bg-blue-50' : 'border-gray-200 bg-white/70'}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <UploadCloud className="w-12 h-12 text-[#4f8cff] mb-2" />
            <div className="text-lg font-bold mb-1">Glissez-déposez vos fichiers ici</div>
            <div className="text-gray-500 mb-2">ou cliquez sur Upload pour sélectionner</div>
            <div className="flex gap-3">
              <button onClick={() => { if (inputRef.current) inputRef.current.click(); }} className="px-5 py-2 rounded-xl bg-[#4f8cff] text-white font-bold shadow hover:bg-[#2563eb] transition flex items-center gap-2"><UploadCloud className="w-5 h-5" /> Upload</button>
            </div>
          </div>
          {/* Affichage grille ou liste */}
          {viewMode === 'grid' ? (
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-10">
              {paginated.length === 0 ? (
                <div className="col-span-full text-center text-gray-400 text-lg py-12">Aucun média trouvé.</div>
              ) : (
                paginated.map(media => (
                  <div key={media.id} className="relative group bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col transition hover:scale-[1.03] hover:shadow-2xl cursor-pointer">
                    {/* Aperçu média */}
                    <div className="relative w-full h-48 flex items-center justify-center bg-gray-50 overflow-hidden" onClick={() => openLightbox(media)}>
                      {media.type === 'image' && <img src={media.url} alt={media.title} className="object-cover w-full h-full transition group-hover:scale-105" />}
                      {media.type === 'video' && <video src={media.url} className="object-cover w-full h-full transition group-hover:scale-105" muted loop preload="metadata" onMouseOver={e => e.currentTarget.play()} onMouseOut={e => e.currentTarget.pause()} />}
                      {media.type === 'audio' && <Music className="w-16 h-16 text-[#ffc107]" />}
                      <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${media.type === 'image' ? 'bg-[#4f8cff]/90 text-white' : media.type === 'video' ? 'bg-[#ff184e]/90 text-white' : 'bg-[#ffc107]/90 text-[#232b46]'}`}>{typeIcons[media.type]} {media.type.charAt(0).toUpperCase() + media.type.slice(1)}</span>
                    </div>
                    {/* Infos */}
                    <div className="flex-1 flex flex-col p-4 gap-2">
                      <div className="font-bold text-[#232b46] text-lg truncate" title={media.title}>{media.title}</div>
                      <div className="text-gray-400 text-xs">{formatSize(media.size)}</div>
                    </div>
                    {/* Actions */}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={e => { e.stopPropagation(); setEditMedia(media); setModalOpen(true); }} className="bg-[#ffc107] text-[#232b46] p-2 rounded-full shadow hover:scale-110 transition"><Edit2 className="w-5 h-5" /></button>
                      <button onClick={e => { e.stopPropagation(); setConfirmDelete(media); }} className="bg-[#ff184e] text-white p-2 rounded-full shadow hover:scale-110 transition"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="w-full mb-10 overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl shadow">
        <thead>
                  <tr className="bg-[#f5f7fa] text-left">
                    <th className="p-3 font-bold">Nom</th>
                    <th className="p-3 font-bold">Type</th>
                    <th className="p-3 font-bold">Taille</th>
                    <th className="p-3 font-bold">Date</th>
                    <th className="p-3 font-bold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-400">Aucun média trouvé.</td></tr>
          ) : (
            paginated.map(media => (
                      <tr key={media.id} className="border-t border-gray-100 hover:bg-[#f9fafd] transition">
                        <td className="p-3 flex items-center gap-2">
                          {typeIcons[media.type]}
                          <span className="truncate max-w-[200px]" title={media.title}>{media.title}</span>
                </td>
                        <td className="p-3 capitalize">{media.type}</td>
                        <td className="p-3">{formatSize(media.size)}</td>
                        <td className="p-3">{media.created_at ? new Date(media.created_at).toLocaleString() : '-'}</td>
                        <td className="p-3 flex gap-2">
                          <button onClick={() => { setEditMedia(media); setModalOpen(true); }} className="bg-[#ffc107] text-[#232b46] p-2 rounded-full shadow hover:scale-110 transition"><Edit2 className="w-5 h-5" /></button>
                          <button onClick={() => setConfirmDelete(media)} className="bg-[#ff184e] text-white p-2 rounded-full shadow hover:scale-110 transition"><Trash2 className="w-5 h-5" /></button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
            </div>
          )}
      {/* Pagination */}
      {pageCount > 1 && (
            <div className="flex justify-center gap-4 mb-10">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-6 py-3 rounded-xl border border-gray-200 text-base font-bold bg-white shadow disabled:opacity-50">Précédent</button>
              <span className="px-6 py-3 text-base font-bold">Page {page} / {pageCount}</span>
              <button onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page === pageCount} className="px-6 py-3 rounded-xl border border-gray-200 text-base font-bold bg-white shadow disabled:opacity-50">Suivant</button>
        </div>
      )}
      {/* Modale ajout/édition */}
      <MediaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editMedia}
      />
          {/* Lightbox */}
          {lightbox && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full relative flex flex-col items-center">
                <button onClick={closeLightbox} className="absolute top-4 right-4 bg-gray-200 text-[#ff184e] p-2 rounded-full hover:scale-110 transition"><X className="w-6 h-6" /></button>
                <div className="w-full flex flex-col items-center">
                  {lightbox.type === 'image' && <img src={lightbox.url} alt={lightbox.title} className="max-h-[60vh] w-auto rounded-xl shadow mb-4" />}
                  {lightbox.type === 'video' && <video src={lightbox.url} className="max-h-[60vh] w-auto rounded-xl shadow mb-4" controls autoPlay />}
                  {lightbox.type === 'audio' && <audio src={lightbox.url} controls className="w-full mb-4" autoPlay />}
                  <div className="font-bold text-lg text-[#232b46] mb-2">{lightbox.title}</div>
                  <div className="text-gray-400 text-sm">{formatSize(lightbox.size)}</div>
                </div>
              </div>
            </div>
          )}
      {/* Confirmation suppression */}
      {confirmDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-10 rounded-2xl shadow-2xl">
                <div className="text-2xl font-bold mb-8 text-[#ff184e]">Supprimer le média "{confirmDelete.title}" ?</div>
                <div className="flex justify-end gap-6">
                  <button onClick={() => setConfirmDelete(null)} className="bg-gray-200 text-[#ff184e] px-6 py-3 rounded-xl font-semibold hover:scale-105 transition">Annuler</button>
                  <button onClick={() => handleDelete(confirmDelete)} className="bg-[#ff184e] text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition">Supprimer</button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default MediasPage; 