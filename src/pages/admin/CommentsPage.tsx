import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { getCommentUserInfo } from '../../lib/userHelper';

interface Comment {
  id: string;
  content: string;
  user_id: string;
  article_id: string;
  created_at: string;
  author?: string;
  avatar?: string;
  article_slug?: string;
  user: {
    email: string;
  };
  article: {
    title: string;
  };
}

const CommentsPage = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:user_id(email),
          article:article_id(title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
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
        .from('comments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchComments();
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
      <h2 style={{ marginBottom: 24 }}>Gestion des commentaires</h2>
      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}

      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f7fa', textAlign: 'left' }}>
              <th style={{ padding: 12 }}>Commentaire</th>
              <th style={{ padding: 12 }}>Utilisateur</th>
              <th style={{ padding: 12 }}>Article</th>
              <th style={{ padding: 12 }}>Date</th>
              <th style={{ padding: 12, width: 120 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {comments.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#aaa' }}>
                  Aucun commentaire trouvé.
                </td>
              </tr>
            ) : (
              comments.map((comment) => (
                <tr key={comment.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                  <td style={{ padding: 12 }}>{comment.content}</td>
                  <td style={{ padding: 12 }}>{comment.user?.email}</td>
                  <td style={{ padding: 12 }}>{comment.article?.title}</td>
                  <td style={{ padding: 12 }}>
                    {new Date(comment.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td style={{ padding: 12 }}>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      style={{
                        background: '#ff4d4f',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '8px 16px',
                        cursor: 'pointer'
                      }}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CommentsPage; 