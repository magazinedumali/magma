import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const AddAlbumPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverFile) {
      setError('Veuillez sélectionner une image de couverture');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Upload cover image
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

      // Create album
      const { error: insertError } = await supabase
        .from('albums')
        .insert([
          {
            title,
            description,
            cover_url: publicUrl
          }
        ]);

      if (insertError) throw insertError;

      navigate('/admin/albums');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 32, fontFamily: 'Jost, sans-serif' }}>
      <h2 style={{ marginBottom: 24 }}>Ajouter un album</h2>
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
          <input
            id="cover"
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
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
            disabled={loading}
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
            {loading ? 'Création...' : 'Créer l\'album'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAlbumPage; 