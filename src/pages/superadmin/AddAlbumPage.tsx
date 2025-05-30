import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const AddAlbumPage = () => {
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [cover, setCover] = useState(''); // URL finale
  const [coverFile, setCoverFile] = useState<File|null>(null); // Fichier sélectionné
  const [songs, setSongs] = useState([{ title: '', subtitle: '', duration: '', audioFile: null as File|null, audio_url: '' }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('');
  const navigate = useNavigate();

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
  const handleRemoveSong = (idx: number) => {
    setSongs(songs => songs.filter((_, i) => i !== idx));
  };
  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverFile(e.target.files[0]);
      setCover(''); // reset URL
    }
  };
  const handleAudioFileChange = (idx: number, file: File|null) => {
    handleSongChange(idx, 'audioFile', file);
    handleSongChange(idx, 'audio_url', ''); // reset URL
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!title || !year || (!coverFile && !cover) || songs.some(s => !s.title || !s.duration || !s.audioFile)) {
        setError('Veuillez remplir tous les champs obligatoires et sélectionner les fichiers.');
        setLoading(false);
        return;
      }
      // 1. Upload cover if needed
      let coverUrl = cover;
      if (coverFile) {
        coverUrl = await uploadCover(coverFile);
        setCover(coverUrl);
      }
      // 2. Insert album
      const { data: album, error: albumError } = await supabase
        .from('albums')
        .insert([{ title, year: parseInt(year), cover: coverUrl, category }])
        .select()
        .single();
      if (albumError) throw albumError;
      // 3. Upload audios and insert songs
      for (let i = 0; i < songs.length; i++) {
        const s = songs[i];
        let audioUrl = '';
        if (s.audioFile) {
          audioUrl = await uploadAudio(s.audioFile);
        }
        await supabase.from('songs').insert([{
          album_id: album.id,
          title: s.title,
          subtitle: s.subtitle,
          duration: s.duration,
          audio_url: audioUrl
        }]);
      }
      alert('Album ajouté !');
      navigate('/superadmin/albums');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l’ajout.');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 32, maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Ajouter un album</h1>
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
          <label style={{ fontWeight: 600 }}>Catégorie *</label><br />
          <input value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #eee', marginTop: 4 }} required placeholder="Ex: Podcast, Musique, Interview…" />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 600 }}>Cover (image) *</label><br />
          <input type="file" accept="image/*" onChange={handleCoverFileChange} style={{ marginTop: 4 }} required={!cover} />
          {coverFile && <div style={{ marginTop: 8 }}><img src={URL.createObjectURL(coverFile)} alt="cover" style={{ width: 120, borderRadius: 8 }} /></div>}
          {cover && !coverFile && <div style={{ marginTop: 8 }}><img src={cover} alt="cover" style={{ width: 120, borderRadius: 8 }} /></div>}
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 600 }}>Morceaux *</label>
          {songs.map((song, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input placeholder="Titre" value={song.title} onChange={e => handleSongChange(idx, 'title', e.target.value)} style={{ flex: 2, padding: 6, borderRadius: 6, border: '1px solid #eee' }} required />
              <input placeholder="Sous-titre" value={song.subtitle} onChange={e => handleSongChange(idx, 'subtitle', e.target.value)} style={{ flex: 2, padding: 6, borderRadius: 6, border: '1px solid #eee' }} />
              <input placeholder="Durée (ex: 3:45)" value={song.duration} onChange={e => handleSongChange(idx, 'duration', e.target.value)} style={{ flex: 1, padding: 6, borderRadius: 6, border: '1px solid #eee' }} required />
              <input type="file" accept="audio/*" onChange={e => handleAudioFileChange(idx, e.target.files ? e.target.files[0] : null)} style={{ flex: 2 }} required={!song.audio_url} />
              {song.audioFile && <span style={{ fontSize: 12, color: '#555' }}>{song.audioFile.name}</span>}
              {songs.length > 1 && <button type="button" onClick={() => handleRemoveSong(idx)} style={{ background: '#ff184e', color: 'white', border: 'none', borderRadius: 6, padding: '4px 10px', fontWeight: 700, marginLeft: 4 }}>-</button>}
            </div>
          ))}
          <button type="button" onClick={handleAddSong} style={{ background: '#eee', color: '#222', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 500, marginTop: 6 }}>+ Ajouter un morceau</button>
        </div>
        <button type="submit" disabled={loading} style={{ background: '#ff184e', color: 'white', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 16 }}>{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
        <button type="button" onClick={() => navigate('/superadmin/albums')} style={{ marginLeft: 16, background: '#eee', color: '#222', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 16 }}>Annuler</button>
      </form>
    </div>
  );
};

export default AddAlbumPage; 