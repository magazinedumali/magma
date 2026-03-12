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
    return <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>Chargement...</div>;
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Gestion des médias</h2>
      {error && <div style={{ color: '#ff4d4f', background: 'rgba(255, 77, 79, 0.1)', padding: 12, borderRadius: 8, marginBottom: 16 }}>{error}</div>}
      
      <div style={{ marginBottom: 32 }}>
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
            background: 'var(--accent)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            display: 'inline-block',
            fontWeight: 600,
            fontSize: 15,
            boxShadow: '0 4px 12px var(--accent-glow)',
            transition: 'all 0.2s'
          }}
          className="hover:brightness-110 hover:-translate-y-0.5"
        >
          Ajouter un média
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
        {medias.map((media) => (
          <div
            key={media.id}
            className="dark-card"
            style={{ padding: 16, display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, overflow: 'hidden', marginBottom: 16, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 150 }}>
              {media.type.startsWith('image/') ? (
                <img src={media.url} alt={media.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : media.type.startsWith('video/') ? (
                <video src={media.url} controls style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#000' }} />
              ) : media.type.startsWith('audio/') ? (
                <audio src={media.url} controls style={{ width: '90%' }} />
              ) : (
                <div style={{ color: 'var(--text-muted)' }}>Fichier ({media.type})</div>
              )}
            </div>
            
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16, wordBreak: 'break-all', fontWeight: 500, lineHeight: 1.4 }}>
              {media.name}
            </div>
            
            <button
              onClick={() => handleDelete(media.id)}
              style={{
                background: 'rgba(255, 24, 78, 0.1)',
                color: '#ff184e',
                border: '1px solid rgba(255,24,78,0.2)',
                borderRadius: 6,
                padding: '10px 16px',
                cursor: 'pointer',
                width: '100%',
                fontWeight: 600,
                fontSize: 14,
                transition: 'all 0.2s'
              }}
              className="hover:bg-[#ff184e] hover:text-white"
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