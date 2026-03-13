import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { getCommentUserInfo } from '../../lib/userHelper';
import { MessageSquare, Trash2, User, FileText, Calendar, ShieldAlert } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
    titre?: string;
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
    if (!window.confirm("Supprimer ce commentaire de façon permanente ?")) return;
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

  if (loading && comments.length === 0) {
    return (
      <div className="font-jost text-[var(--text-primary)] space-y-4">
        <div className="mb-8">
          <Skeleton className="h-9 w-72 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="dark-card p-4 flex gap-4">
            <Skeleton className="w-12 h-12 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="font-jost text-[var(--text-primary)]">
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Gestion des commentaires</h2>
        <p className="text-[var(--text-muted)] mt-2">Gérez, modérez et supprimez les commentaires laissés par vos utilisateurs.</p>
      </div>
      
      {error && (
        <div className="mb-6 flex items-center gap-3 text-red-400 font-medium bg-red-500/10 p-4 rounded-xl border border-red-500/20 animate-fadeIn">
          <ShieldAlert className="w-5 h-5" /> {error}
        </div>
      )}

      {comments.length === 0 ? (
        <div className="dark-card text-center py-20">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)] opacity-30" />
          <h3 className="text-xl font-bold text-white mb-2">Aucun commentaire</h3>
          <p className="text-[var(--text-muted)]">Il n'y a actuellement aucun commentaire sur vos articles.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {/* Version style timeline/cartes au lieu du tableau classique pour plus de modernité */}
          {comments.map((comment) => {
            const userInfo = getCommentUserInfo(comment);
            
            return (
              <div key={comment.id} className="dark-card p-5 hover:border-white/20 transition-colors group flex flex-col md:flex-row gap-6 relative overflow-hidden">
                 {/* Decorative background accent */}
                 <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 rounded-full blur-2xl -mt-10 -mr-10"></div>
                 
                 {/* Left Col: User Info & Source */}
                 <div className="flex flex-col gap-4 w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-white/5 pb-4 md:pb-0 md:pr-6 relative z-10">
                    <div className="flex items-center gap-3">
                      <img 
                        src={userInfo.avatar} 
                        alt={userInfo.name}
                        className="w-10 h-10 rounded-full object-cover border border-white/10 ring-2 ring-black/50"
                        onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                      />
                      <div className="overflow-hidden">
                        <div className="font-bold text-white truncate">{userInfo.name}</div>
                        {comment.user?.email && comment.user.email !== userInfo.name && (
                          <div className="text-xs text-[var(--text-muted)] truncate">{comment.user.email}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 mt-auto">
                       <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 w-fit max-w-full">
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{comment.article?.title || comment.article?.titre || comment.article_slug || 'Article Inconnu'}</span>
                       </div>
                       
                       <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] px-1">
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span>
                            {new Date(comment.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                       </div>
                    </div>
                 </div>
                 
                 {/* Right Col: Content & Actions */}
                 <div className="flex flex-col flex-1 justify-between gap-4 relative z-10">
                    <div className="text-[var(--text-primary)] text-sm leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5 italic">
                       "{comment.content}"
                    </div>
                    
                    <div className="flex justify-end mt-auto opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                       <button
                         onClick={() => handleDelete(comment.id)}
                         className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-red-500 rounded-lg font-semibold text-sm transition-all"
                       >
                         <Trash2 className="w-4 h-4" />
                         Supprimer
                       </button>
                    </div>
                 </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommentsPage;