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
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Enrich comments with article information if article_id exists
      const enrichedComments = await Promise.all((data || []).map(async (comment) => {
        if (comment.article_id) {
          const { data: articleData } = await supabase
            .from('articles')
            .select('title, titre, slug')
            .eq('id', comment.article_id)
            .single();
          
          if (articleData) {
            return {
              ...comment,
              article: {
                title: articleData.title || articleData.titre,
                slug: articleData.slug,
              },
            };
          }
        }
        return comment;
      }));
      
      setComments(enrichedComments || []);
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
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500 font-poppins text-base">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="font-poppins">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Gestion des commentaires</h2>
        <p className="text-sm text-gray-500">Gérez tous les commentaires de votre site</p>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {comments.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500 font-medium">Aucun commentaire trouvé.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Commentaire</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Utilisateur</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Article</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {comments.map((comment) => {
                  const userInfo = getCommentUserInfo(comment);
                  return (
                    <tr key={comment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 max-w-md">
                        <p className="text-sm text-gray-800 break-words">{comment.content}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={userInfo.avatar} 
                            alt={userInfo.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{userInfo.name}</div>
                            {comment.user?.email && comment.user.email !== userInfo.name && (
                              <div className="text-xs text-gray-500 mt-0.5">{comment.user.email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">
                          {comment.article?.title || comment.article?.titre || comment.article_slug || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {new Date(comment.created_at).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium text-sm hover:bg-red-100 transition-colors border border-red-200"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentsPage; 