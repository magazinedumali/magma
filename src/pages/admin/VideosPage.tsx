import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Edit2, Trash2, X, UploadCloud, Video as VideoIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingBar } from '@/components/ui/loading-bar';

type Video = {
  id: string;
  title: string;
  author: string;
  date: string;
  image: string;
  author_avatar?: string;
  video_url: string;
};

const emptyVideo: Omit<Video, 'id'> = {
  title: '',
  author: '',
  date: '',
  image: '',
  author_avatar: '',
  video_url: '',
};

const uploadToStorage = async (file: File, bucket: string) => {
  const ext = file.name.split('.').pop();
  const filePath = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: false });
  if (error) throw error;
  const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return publicUrl.publicUrl;
};

const getStoragePathFromUrl = (url: string, bucket: string) => {
  const match = url.match(new RegExp(`${bucket}/(.+)$`));
  return match ? match[1] : null;
};

const VideosPage = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editVideo, setEditVideo] = useState<Video | null>(null);
  const [form, setForm] = useState(emptyVideo);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [thumbnailOptions, setThumbnailOptions] = useState<string[]>([]);
  const [generatingThumbnails, setGeneratingThumbnails] = useState(false);

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('date', { ascending: false });
    if (error) setError(error.message);
    else setVideos(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchVideos(); }, []);

  const openModal = (video?: Video) => {
    if (video) {
      setEditVideo(video);
      setForm({ ...video });
    } else {
      setEditVideo(null);
      setForm(emptyVideo);
    }
    setThumbnailOptions([]);
    setGeneratingThumbnails(false);
    setModalOpen(true);
  };

  const generateThumbnailFromVideo = (file: File, fraction: number) => {
    return new Promise<File>((resolve, reject) => {
      const videoElement = document.createElement('video');
      const objectUrl = URL.createObjectURL(file);
      let done = false;

      const cleanUp = () => {
        if (!done) {
          done = true;
          URL.revokeObjectURL(objectUrl);
          videoElement.src = '';
        }
      };

      videoElement.preload = 'auto';
      videoElement.src = objectUrl;
      videoElement.muted = true;
      videoElement.playsInline = true;

      const handleError = () => {
        if (done) return;
        cleanUp();
        reject(new Error('Erreur lecture vidéo pour miniature'));
      };

      videoElement.onerror = handleError;

      videoElement.onloadeddata = () => {
        if (done) return;
        const duration = videoElement.duration || 0;
        const captureTime = Math.min(
          Math.max(duration * fraction, 0.5),
          duration > 1 ? duration - 0.5 : duration || 0.5
        );
        videoElement.currentTime = captureTime;
      };

      videoElement.onseeked = () => {
        if (done) return;
        if (!videoElement.videoWidth || !videoElement.videoHeight) {
          // Si les dimensions ne sont pas encore dispo, on réessaie un peu plus tard
          setTimeout(() => {
            if (done) return;
            videoElement.currentTime = videoElement.currentTime;
          }, 100);
          return;
        }
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          cleanUp();
          reject(new Error('Impossible de générer la miniature'));
          return;
        }
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          if (!blob) {
            cleanUp();
            reject(new Error('Erreur lors de la création de la miniature'));
            return;
          }
          const thumbFile = new File([blob], `thumbnail-${Date.now()}.jpg`, { type: 'image/jpeg' });
          cleanUp();
          resolve(thumbFile);
        }, 'image/jpeg', 0.85);
      };
    });
  };

  const generateThumbnailsFromVideo = async (file: File) => {
    const fractions = [0.2, 0.5, 0.8];
    const files: File[] = [];
    for (const fraction of fractions) {
      try {
        const thumbFile = await generateThumbnailFromVideo(file, fraction);
        files.push(thumbFile);
      } catch (_) {
        // ignore individual failures, we'll just have fewer options
      }
    }
    return files;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (!form.video_url) {
        throw new Error('Veuillez téléverser une vidéo avant d’enregistrer.');
      }
      if (!form.image) {
        throw new Error('Veuillez choisir une couverture générée à partir de la vidéo.');
      }
      if (editVideo) {
        const { error } = await supabase
          .from('videos')
          .update({ ...form })
          .eq('id', editVideo.id);
        if (error) throw error;
        setSuccess('Vidéo modifiée !');
      } else {
        const { error } = await supabase
          .from('videos')
          .insert([{ ...form }]);
        if (error) throw error;
        setSuccess('Vidéo ajoutée !');
      }
      setModalOpen(false);
      fetchVideos();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const video = videos.find(v => v.id === id);
    if (!video) return;
    if (!window.confirm('Supprimer cette vidéo ?')) return;
    setLoading(true);
    setError(null);
    try {
      // Supprime le fichier vidéo du Storage
      if (video.video_url) {
        const path = getStoragePathFromUrl(video.video_url, 'videos');
        if (path) await supabase.storage.from('videos').remove([path]);
      }
      // Supprime le fichier image du Storage
      if (video.image) {
        const path = getStoragePathFromUrl(video.image, 'images');
        if (path) await supabase.storage.from('images').remove([path]);
      }
      await supabase.from('videos').delete().eq('id', id);
      setSuccess('Vidéo supprimée !');
      fetchVideos();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-jost text-[var(--text-primary)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Gestion des Vidéos</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">Gérez le contenu vidéo de votre site</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-[var(--accent)] hover:brightness-110 text-white px-5 py-2.5 rounded-xl font-semibold shadow-[0_4px_16px_var(--accent-glow)] transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" /> Ajouter une vidéo
        </button>
      </div>

      {(error || success) && (
        <div className="mb-6 flex flex-col gap-2">
          {error && <div className="text-red-400 font-medium bg-red-500/10 p-4 rounded-xl border border-red-500/20 animate-fadeIn">{error}</div>}
          {success && <div className="text-green-400 font-medium bg-green-500/10 p-4 rounded-xl border border-green-500/20 animate-fadeIn">{success}</div>}
        </div>
      )}

      <div className="dark-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/20">
                <th className="p-4 font-semibold text-[var(--text-secondary)] text-sm whitespace-nowrap">Image</th>
                <th className="p-4 font-semibold text-[var(--text-secondary)] text-sm">Titre</th>
                <th className="p-4 font-semibold text-[var(--text-secondary)] text-sm">Auteur</th>
                <th className="p-4 font-semibold text-[var(--text-secondary)] text-sm">Date</th>
                <th className="p-4 font-semibold text-[var(--text-secondary)] text-sm text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && videos.length === 0 ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="p-4 w-24"><Skeleton className="w-24 h-16 rounded-lg" /></td>
                    <td className="p-4"><Skeleton className="h-5 w-40" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="p-4 w-32"><Skeleton className="h-9 w-20 mx-auto rounded-lg" /></td>
                  </tr>
                ))
              ) : videos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[var(--text-muted)]">
                    <VideoIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    Aucune vidéo trouvée.
                  </td>
                </tr>
              ) : (
                videos.map(video => (
                  <tr key={video.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="p-4 w-24">
                      <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-white/10 bg-black/40">
                        <img 
                          src={video.image} 
                          alt="preview" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} 
                        />
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-[var(--text-primary)]">
                       <div className="max-w-[300px] truncate" title={video.title}>{video.title}</div>
                       <div className="text-xs text-[var(--accent)] mt-1 truncate max-w-[300px]" title={video.video_url}>{video.video_url}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {video.author_avatar ? (
                          <img src={video.author_avatar} alt="avatar" className="w-8 h-8 rounded-full border border-white/10" onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xs">
                             {video.author.substring(0,2).toUpperCase()}
                          </div>
                        )}
                        <span className="text-[var(--text-secondary)]">{video.author}</span>
                      </div>
                    </td>
                    <td className="p-4 text-[var(--text-secondary)] text-sm">{new Date(video.date).toLocaleDateString()}</td>
                    <td className="p-4 w-32">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openModal(video)}
                          disabled={loading}
                          className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors border border-blue-500/20"
                          title="Éditer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(video.id)}
                          disabled={loading}
                          className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors border border-red-500/20"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar relative animate-modalIn">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-2xl font-bold text-white mb-6">
              {editVideo ? 'Éditer la vidéo' : 'Ajouter une vidéo'}
            </h3>
            
            <form onSubmit={handleSave} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Titre</label>
                <input 
                  required 
                  placeholder="Ex: Interview exclusive..." 
                  value={form.title} 
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} 
                  className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-muted)]" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Auteur</label>
                   <input 
                     required 
                     placeholder="Ex: John Doe" 
                     value={form.author} 
                     onChange={e => setForm(f => ({ ...f, author: e.target.value }))} 
                     className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-muted)]" 
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Date</label>
                   <input 
                     required 
                     type="date" 
                     value={form.date} 
                     onChange={e => setForm(f => ({ ...f, date: e.target.value }))} 
                     className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--accent)] transition-colors [color-scheme:dark]" 
                   />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  Images de couverture (générées automatiquement)
                </label>
                <div className="w-full border-2 border-dashed border-white/10 rounded-xl bg-black/20 p-4">
                  {generatingThumbnails && (
                    <div className="flex flex-col gap-2 text-[var(--text-muted)] text-sm">
                      <LoadingBar variant="inline" className="w-full max-w-xs" />
                      <span>Génération de suggestions de miniatures à partir de la vidéo…</span>
                    </div>
                  )}
                  {!generatingThumbnails && thumbnailOptions.length === 0 && !form.image && (
                    <div className="text-sm text-[var(--text-muted)]">
                      Après le téléversement de la vidéo, plusieurs miniatures seront proposées automatiquement, comme sur YouTube.
                    </div>
                  )}
                  {!generatingThumbnails && (thumbnailOptions.length > 0 || form.image) && (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {(thumbnailOptions.length > 0 ? thumbnailOptions : [form.image]).map((url) => (
                        <button
                          key={url}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, image: url }))}
                          className={`relative rounded-xl overflow-hidden border transition-all ${
                            form.image === url ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/40' : 'border-white/10 hover:border-[var(--accent)]/60'
                          }`}
                        >
                          <img src={url} alt="miniature" className="w-full h-20 object-cover" />
                          {form.image === url && (
                            <div className="absolute bottom-1 right-1 bg-[var(--accent)] text-white text-[10px] px-2 py-0.5 rounded-full">
                              Sélectionnée
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">URL de l'avatar auteur (optionnel)</label>
                <input 
                  placeholder="https://..." 
                  value={form.author_avatar || ''} 
                  onChange={e => setForm(f => ({ ...f, author_avatar: e.target.value }))} 
                  className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-muted)]" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Fichier vidéo</label>
                <div className="w-full border-2 border-dashed border-white/10 rounded-xl bg-black/20 hover:bg-black/40 hover:border-[var(--accent)] transition-all flex flex-col items-center justify-center p-4 relative cursor-pointer">
                   <VideoIcon className="w-6 h-6 mb-2 text-white/40" />
                   <span className="text-sm text-[var(--text-muted)]">
                     Cliquer pour uploader une vidéo (les miniatures seront générées automatiquement)
                   </span>
                   <input 
                     type="file" 
                     accept="video/*" 
                     onChange={async e => {
                       if (e.target.files && e.target.files[0]) {
                        setLoading(true);
                        setGeneratingThumbnails(true);
                         try {
                          const file = e.target.files[0];
                          const url = await uploadToStorage(file, 'videos');
                          setForm(f => ({ ...f, video_url: url }));

                          const thumbFiles = await generateThumbnailsFromVideo(file);
                          const urls: string[] = [];
                          for (const thumbFile of thumbFiles) {
                            try {
                              const thumbUrl = await uploadToStorage(thumbFile, 'images');
                              urls.push(thumbUrl);
                            } catch (_) {
                              // ignore single thumbnail upload failure
                            }
                          }
                          if (urls.length > 0) {
                            setThumbnailOptions(urls);
                            setForm(f => ({ ...f, image: f.image || urls[0] }));
                          }
                         } catch (err: any) {
                          setError('Erreur upload vidéo / génération miniatures : ' + (err?.message || JSON.stringify(err)));
                          setThumbnailOptions([]);
                         }
                        setLoading(false);
                        setGeneratingThumbnails(false);
                       }
                     }} 
                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                   />
                </div>
                {form.video_url && (
                  <div className="mt-3 text-xs bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 p-3 rounded-xl break-all">
                    {form.video_url}
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-4 pt-4 border-t border-white/10">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)} 
                  className="flex-1 bg-white/5 border border-white/10 text-[var(--text-primary)] px-4 py-2.5 rounded-xl font-semibold hover:bg-white/10 transition-colors" 
                  disabled={loading}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-[var(--accent)] shadow-[0_4px_16px_var(--accent-glow)] text-white px-4 py-2.5 rounded-xl font-bold hover:brightness-110 transition-all flex justify-center" 
                  disabled={loading}
                >
                  {loading ? (
                    <LoadingBar variant="inline" className="h-0.5 min-w-[60px] flex-1 max-w-16 bg-white/30" />
                  ) : (
                    editVideo ? 'Enregistrer' : 'Ajouter'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideosPage;
