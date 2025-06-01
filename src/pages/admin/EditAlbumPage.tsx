import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

interface Album {
  id: string;
  title: string;
  description: string;
  cover_url: string;
}

const EditAlbumPage = () => {
  const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<Album | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlbum();
  }, [id]);

  const fetchAlbum = async () => {
    try {
      const { data, error } = await supabase
        .from('albums')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setAlbum(data);
      setTitle(data.title);
      setDescription(data.description);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      let coverUrl = album?.cover_url;

      if (coverFile) {
        // Upload new cover image
        const fileExt = coverFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('albums')
          .upload(filePath, coverFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('albums')
          .getPublicUrl(filePath);

        coverUrl = publicUrl;
      }

      // Update album
      const { error: updateError } = await supabase
        .from('albums')
        .update({
          title,
          description,
          cover_url: coverUrl
        })
        .eq('id', id);

      if (updateError) throw updateError;

      navigate('/admin/albums');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 32, textAlign: 'center' }}>Chargement...</div>;
  }

  if (!album) {
    return <div style={{ padding: 32, textAlign: 'center' }}>Album non trouvé</div>;
  }

  return (
    <div style={{ padding: 32, fontFamily: 'Jost, sans-serif' }}>
      <h2 style={{ marginBottom: 24 }}>Modifier l'album</h2>
      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
        <div style={{ marginBottom: 20 }}>
          <label
            htmlFor="title"
            style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}
          >
            Titre
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid #e5e9f2',
              borderRadius: 8,
              fontSize: 16
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label
            htmlFor="description"
            style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid #e5e9f2',
              borderRadius: 8,
              fontSize: 16,
              minHeight: 100,
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label
            htmlFor="cover"
            style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}
          >
            Image de couverture
          </label>
          {album.cover_url && (
            <img
              src={album.cover_url}
              alt="Cover preview"
              style={{
                width: '100%',
                maxHeight: 200,
                objectFit: 'cover',
                borderRadius: 8,
                marginBottom: 12
              }}
            />
          )}
          <input
            id="cover"
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid #e5e9f2',
              borderRadius: 8,
              fontSize: 16
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={() => navigate('/admin/albums')}
            style={{
              padding: '12px 24px',
              background: '#e5e9f2',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              cursor: 'pointer',
              flex: 1
            }}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '12px 24px',
              background: '#4f8cff',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              cursor: 'pointer',
              flex: 1
            }}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAlbumPage; 