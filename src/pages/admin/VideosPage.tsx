import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

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
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
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
    <div style={{ padding: 32, fontFamily: 'Jost, sans-serif' }}>
      <h2 style={{ marginBottom: 24 }}>Gestion des vidéos publiées</h2>
      <button
        style={{ background: '#4f8cff', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 18px', fontWeight: 500, marginBottom: 24, fontSize: 16, cursor: 'pointer' }}
        onClick={() => openModal()}
      >
        + Ajouter une vidéo
      </button>
      {error && <div style={{ color: 'red', marginBottom: 16, padding: 12, background: '#fee', borderRadius: 6 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: 16, padding: 12, background: '#efe', borderRadius: 6 }}>{success}</div>}
      {loading && videos.length === 0 && <div style={{ padding: 24, textAlign: 'center' }}>Chargement...</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001' }}>
        <thead>
          <tr style={{ background: '#f5f7fa', textAlign: 'left' }}>
            <th style={{ padding: 12 }}>Titre</th>
            <th style={{ padding: 12 }}>Auteur</th>
            <th style={{ padding: 12 }}>Date</th>
            <th style={{ padding: 12 }}>Image</th>
            <th style={{ padding: 12 }}>Avatar auteur</th>
            <th style={{ padding: 12 }}>URL vidéo</th>
            <th style={{ padding: 12, width: 120 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {videos.length === 0 && !loading ? (
            <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#aaa' }}>Aucune vidéo.</td></tr>
          ) : (
            videos.map(video => (
              <tr key={video.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                <td style={{ padding: 12 }}>{video.title}</td>
                <td style={{ padding: 12 }}>{video.author}</td>
                <td style={{ padding: 12 }}>{video.date}</td>
                <td style={{ padding: 12 }}><img src={video.image} alt="img" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6 }} onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} /></td>
                <td style={{ padding: 12 }}>{video.author_avatar ? <img src={video.author_avatar} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%' }} onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} /> : '-'}</td>
                <td style={{ padding: 12, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={video.video_url}>{video.video_url}</td>
                <td style={{ padding: 12 }}>
                  <button
                    style={{ background: '#e5e9f2', border: 'none', borderRadius: 6, padding: '6px 12px', marginRight: 8, cursor: 'pointer' }}
                    onClick={() => openModal(video)}
                    disabled={loading}
                  >
                    Éditer
                  </button>
                  <button
                    style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}
                    onClick={() => handleDelete(video.id)}
                    disabled={loading}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* Modal ajout/édition */}
      {modalOpen && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 400, maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 2px 8px #0002' }}>
            <h3 style={{ marginBottom: 18 }}>{editVideo ? 'Éditer' : 'Ajouter'} une vidéo</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input required placeholder="Titre" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2' }} />
              <input required placeholder="Auteur" value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2' }} />
              <input required type="date" placeholder="Date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2' }} />
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Image de couverture</label>
                <input type="file" accept="image/*" onChange={async e => {
                  if (e.target.files && e.target.files[0]) {
                    setLoading(true);
                    try {
                      const url = await uploadToStorage(e.target.files[0], 'images');
                      setForm(f => ({ ...f, image: url }));
                    } catch (err: any) {
                      setError('Erreur upload image : ' + (err?.message || JSON.stringify(err)));
                    }
                    setLoading(false);
                  }
                }} style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2', width: '100%' }} />
                {form.image && <img src={form.image} alt="preview" style={{ marginTop: 8, maxWidth: 200, borderRadius: 6 }} />}
              </div>
              <input placeholder="URL avatar auteur (optionnel)" value={form.author_avatar || ''} onChange={e => setForm(f => ({ ...f, author_avatar: e.target.value }))} style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2' }} />
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Fichier vidéo</label>
                <input type="file" accept="video/*" onChange={async e => {
                  if (e.target.files && e.target.files[0]) {
                    setLoading(true);
                    try {
                      const url = await uploadToStorage(e.target.files[0], 'videos');
                      setForm(f => ({ ...f, video_url: url }));
                    } catch (err: any) {
                      setError('Erreur upload vidéo : ' + (err?.message || JSON.stringify(err)));
                    }
                    setLoading(false);
                  }
                }} style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2', width: '100%' }} />
                {form.video_url && <div style={{ marginTop: 8, padding: 8, background: '#f5f5f5', borderRadius: 6, fontSize: 12, wordBreak: 'break-all' }}>{form.video_url}</div>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <button type="button" onClick={() => setModalOpen(false)} style={{ background: '#eee', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }} disabled={loading}>Annuler</button>
                <button type="submit" style={{ background: '#4f8cff', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }} disabled={loading}>{loading ? 'Enregistrement...' : (editVideo ? 'Enregistrer' : 'Ajouter')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideosPage;
