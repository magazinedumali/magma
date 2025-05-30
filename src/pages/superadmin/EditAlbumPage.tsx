import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

// Toast component
const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div style={{
    position: 'fixed',
    top: 24,
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#222',
    color: 'white',
    padding: '12px 32px',
    borderRadius: 8,
    zIndex: 9999,
    fontWeight: 600,
    fontSize: 16,
    boxShadow: '0 2px 8px #0002',
  }}>
    {message}
    <button onClick={onClose} style={{ marginLeft: 24, background: 'none', color: 'white', border: 'none', fontWeight: 700, fontSize: 18, cursor: 'pointer' }}>×</button>
  </div>
);

// Song interface
interface Song {
  id?: number;
  title: string;
  subtitle?: string;
  duration: string;
  audio_url?: string;
  audioFile?: File | null;
}

const EditAlbumPage = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [cover, setCover] = useState(''); // URL finale
  const [coverFile, setCoverFile] = useState<File|null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const navigate = useNavigate();

  // Load album and songs
  useEffect(() => {
    async function fetchAlbum() {
      setLoading(true);
      setError('');
      const { data, error } = await supabase
        .from('albums')
        .select('*, songs(*)')
        .eq('id', id)
        .single();
      if (error || !data) {
        setError("Impossible de charger l'album.");
        setLoading(false);
        return;
      }
      setTitle(data.title);
      setYear(data.year?.toString() || '');
      setCover(data.cover);
      setSongs((data.songs || []).map((s: any) => ({ ...s, audioFile: null })));
      setLoading(false);
    }
    fetchAlbum();
  }, [id]);

  // Upload cover image to Supabase Storage
  async function uploadCover(file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `cover-${Date.now()}-${Math.random()}.${fileExt}`;
    const { error } = await supabase.storage.from('albums').upload(`covers/${fileName}`, file);
    if (error) throw error;
    const { data: publicUrlData } = supabase.storage.from('albums').getPublicUrl(`covers/${fileName}`);
    return publicUrlData.publicUrl;
  }
  // Upload audio file to Supabase Storage
  async function uploadAudio(file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `audio-${Date.now()}-${Math.random()}.${fileExt}`;
    const { error } = await supabase.storage.from('albums').upload(`audios/${fileName}`, file);
    if (error) throw error;
    const { data: publicUrlData } = supabase.storage.from('albums').getPublicUrl(`audios/${fileName}`);
    return publicUrlData.publicUrl;
  }

  const handleSongChange = (idx: number, field: string, value: string|File|null) => {
    setSongs(songs => songs.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };
  const handleAddSong = () => {
    setSongs([...songs, { title: '', subtitle: '', duration: '', audioFile: null, audio_url: '' }]);
  };
  const handleRemoveSong = async (idx: number) => {
    const song = songs[idx];
    if (song.id) {
      setSaving(true);
      setError('');
      try {
        await supabase.from('songs').delete().eq('id', song.id);
        setSongs(songs => songs.filter((_, i) => i !== idx));
      } catch (err: any) {
        setError("Erreur lors de la suppression du morceau.");
      }
      setSaving(false);
    } else {
      setSongs(songs => songs.filter((_, i) => i !== idx));
    }
  };
  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverFile(e.target.files[0]);
      setCover('');
    }
  };
  const handleAudioFileChange = (idx: number, file: File|null) => {
    handleSongChange(idx, 'audioFile', file);
    // On ne reset pas audio_url si pas de nouveau fichier
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setToast('');
    setSaving(true);
    try {
      // Validation du format de la durée (mm:ss)
      const durationRegex = /^\d{1,2}:[0-5]\d$/;
      if (!title || !year || (!coverFile && !cover) || songs.some(s => !s.title || !s.duration)) {
        setError('Veuillez remplir tous les champs obligatoires.');
        setSaving(false);
        return;
      }
      if (songs.some(s => !durationRegex.test(s.duration))) {
        setError('Le format de la durée doit être mm:ss (ex: 3:45).');
        setSaving(false);
        return;
      }
      if (songs.some(s => !s.audio_url && !s.audioFile)) {
        setError('Veuillez sélectionner un fichier audio pour chaque morceau.');
        setSaving(false);
        return;
      }
      // 1. Upload cover if needed
      let coverUrl = cover;
      if (coverFile) {
        try {
          coverUrl = await uploadCover(coverFile);
        } catch (err) {
          setError("Erreur lors de l'upload de la couverture.");
          setSaving(false);
          return;
        }
      }
      // 2. Update album
      const { error: albumError } = await supabase
        .from('albums')
        .update({ title, year: parseInt(year), cover: coverUrl })
        .eq('id', id);
      if (albumError) throw albumError;
      // 3. Update/insert songs
      for (let i = 0; i < songs.length; i++) {
        const s = songs[i];
        let audioUrl = s.audio_url;
        if (s.audioFile) {
          try {
            audioUrl = await uploadAudio(s.audioFile);
          } catch (err) {
            setError(`Erreur lors de l'upload du fichier audio pour le morceau ${s.title}.`);
            setSaving(false);
            return;
          }
        }
        if (s.id) {
          await supabase.from('songs').update({
            title: s.title,
            subtitle: s.subtitle,
            duration: s.duration,
            audio_url: audioUrl
          }).eq('id', s.id);
        } else {
          await supabase.from('songs').insert([{
            album_id: id,
            title: s.title,
            subtitle: s.subtitle,
            duration: s.duration,
            audio_url: audioUrl
          }]);
        }
      }
      setToast('Album modifié !');
      setTimeout(() => {
        setToast('');
        navigate('/superadmin/albums');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification.');
    }
    setSaving(false);
  };

  if (loading) return <div style={{ padding: 32 }}>Chargement…</div>;

  return (
    <div style={{ padding: 32, maxWidth: 600, margin: '0 auto' }}>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Éditer l'album</h1>
      <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px #0001' }}>
        {error && <div style={{ color: '#ff184e', marginBottom: 16 }}>{error}</div>}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 600 }}>Titre *</label><br />
          <input value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #eee', marginTop: 4 }} required />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 600 }}>Année *</label><br />
          <input value={year} onChange={e => setYear(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #eee', marginTop: 4 }} required type="number" min="1900" max="2100" />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 600 }}>Cover (image) *</label><br />
          <input type="file" accept="image/*" onChange={handleCoverFileChange} style={{ marginTop: 4 }} />
          {coverFile && <div style={{ marginTop: 8 }}><img src={URL.createObjectURL(coverFile)} alt="cover" style={{ width: 120, borderRadius: 8 }} /></div>}
          {cover && !coverFile && <div style={{ marginTop: 8 }}><img src={cover} alt="cover" style={{ width: 120, borderRadius: 8 }} /></div>}
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 600 }}>Morceaux *</label>
          {songs.map((song, idx) => (
            <div key={song.id || idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input placeholder="Titre" value={song.title} onChange={e => handleSongChange(idx, 'title', e.target.value)} style={{ flex: 2, padding: 6, borderRadius: 6, border: '1px solid #eee' }} required />
              <input placeholder="Sous-titre" value={song.subtitle} onChange={e => handleSongChange(idx, 'subtitle', e.target.value)} style={{ flex: 2, padding: 6, borderRadius: 6, border: '1px solid #eee' }} />
              <input placeholder="Durée (ex: 3:45)" value={song.duration} onChange={e => handleSongChange(idx, 'duration', e.target.value)} style={{ flex: 1, padding: 6, borderRadius: 6, border: '1px solid #eee' }} required />
              <input type="file" accept="audio/*" onChange={e => handleAudioFileChange(idx, e.target.files ? e.target.files[0] : null)} style={{ flex: 2 }} />
              {song.audioFile && <span style={{ fontSize: 12, color: '#555' }}>{song.audioFile.name}</span>}
              {song.audio_url && !song.audioFile && <audio src={song.audio_url} controls style={{ height: 32 }} />}
              {songs.length > 1 && <button type="button" disabled={saving} onClick={() => handleRemoveSong(idx)} style={{ background: '#ff184e', color: 'white', border: 'none', borderRadius: 6, padding: '4px 10px', fontWeight: 700, marginLeft: 4 }}>-</button>}
            </div>
          ))}
          <button type="button" onClick={handleAddSong} style={{ background: '#eee', color: '#222', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 500, marginTop: 6 }}>+ Ajouter un morceau</button>
        </div>
        <button type="submit" disabled={saving} style={{ background: '#ff184e', color: 'white', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 16 }}>{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
        <button type="button" onClick={() => navigate('/superadmin/albums')} style={{ marginLeft: 16, background: '#eee', color: '#222', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 16 }}>Annuler</button>
      </form>
    </div>
  );
};

export default EditAlbumPage; 