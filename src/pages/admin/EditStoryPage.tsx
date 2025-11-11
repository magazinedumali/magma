import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAdminContext } from '@/hooks/use-admin-context';

interface Story {
  id: string;
  title: string;
  image_url: string;
  is_active: boolean;
}

const EditStoryPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getStoriesPath } = useAdminContext();
  const [story, setStory] = useState<Story | null>(null);
  const [title, setTitle] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStory();
  }, [id]);

  const fetchStory = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setStory(data);
      setTitle(data.title);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!story) return;

    try {
      setSaving(true);
      setError(null);

      let imageUrl = story.image_url;

      if (imageFile) {
        // Upload new image
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('stories')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('stories')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Update story
      const { error: updateError } = await supabase
        .from('stories')
        .update({
          title,
          image_url: imageUrl
        })
        .eq('id', story.id);

      if (updateError) throw updateError;

      navigate(getStoriesPath());
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 32, textAlign: 'center' }}>Chargement...</div>;
  }

  if (!story) {
    return <div style={{ padding: 32, textAlign: 'center' }}>Story non trouvée</div>;
  }

  return (
    <div style={{ padding: 32, fontFamily: 'Jost, sans-serif' }}>
      <h2 style={{ marginBottom: 24 }}>Modifier la story</h2>
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

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>Image actuelle</label>
          <img
            src={story.image_url}
            alt={story.title}
            style={{
              width: '100%',
              maxHeight: 300,
              objectFit: 'cover',
              borderRadius: 6,
              marginBottom: 8
            }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>Nouvelle image (optionnel)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
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
            disabled={saving}
            style={{
              background: '#23272f',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: 16,
              opacity: saving ? 0.7 : 1
            }}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
          <button
            type="button"
            onClick={() => navigate(getStoriesPath())}
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

export default EditStoryPage; 