import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const AddStoryPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setError('Veuillez sélectionner une image');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Upload image
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage
        .from('stories')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('stories')
        .getPublicUrl(fileName);

      // Create story
      const { error: insertError } = await supabase
        .from('stories')
        .insert([
          {
            title,
            image_url: publicUrl,
            is_active: true
          }
        ]);

      if (insertError) throw insertError;

      navigate('/admin/stories');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 32, fontFamily: 'Jost, sans-serif' }}>
      <h2 style={{ marginBottom: 24 }}>Ajouter une story</h2>
      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>Titre</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #e5e9f2',
              fontSize: 16
            }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            required
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #e5e9f2',
              fontSize: 16
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#23272f',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: 16,
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Création...' : 'Créer la story'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/stories')}
            style={{
              background: '#e5e9f2',
              color: '#23272f',
              border: 'none',
              borderRadius: 6,
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: 16
            }}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStoryPage; 