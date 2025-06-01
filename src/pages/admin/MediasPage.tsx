import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface Media {
  id: string;
  name: string;
  url: string;
  type: string;
  created_at: string;
}

const MediasPage = () => {
  const [medias, setMedias] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMedias();
  }, []);

  const fetchMedias = async () => {
    try {
      const { data, error } = await supabase
        .from('medias')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedias(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('medias')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('medias')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from('medias')
        .insert([
          {
            name: file.name,
            url: publicUrl,
            type: file.type
          }
        ]);

      if (insertError) throw insertError;

      fetchMedias();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('medias')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchMedias();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 32, textAlign: 'center' }}>Chargement...</div>;
  }

  return (
    <div style={{ padding: 32, fontFamily: 'Jost, sans-serif' }}>
      <h2 style={{ marginBottom: 24 }}>Gestion des médias</h2>
      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
      
      <div style={{ marginBottom: 24 }}>
        <input
          type="file"
          onChange={handleUpload}
          accept="image/*,video/*,audio/*"
          style={{ display: 'none' }}
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          style={{
            background: '#4f8cff',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: 8,
            cursor: 'pointer',
            display: 'inline-block',
            fontWeight: 500
          }}
        >
          Ajouter un média
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24 }}>
        {medias.map((media) => (
          <div
            key={media.id}
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            {media.type.startsWith('image/') ? (
              <img
                src={media.url}
                alt={media.name}
                style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }}
              />
            ) : media.type.startsWith('video/') ? (
              <video
                src={media.url}
                controls
                style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }}
              />
            ) : media.type.startsWith('audio/') ? (
              <audio
                src={media.url}
                controls
                style={{ width: '100%', marginBottom: 12 }}
              />
            ) : null}
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>{media.name}</div>
            <button
              onClick={() => handleDelete(media.id)}
              style={{
                background: '#ff4d4f',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '8px 16px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediasPage; 