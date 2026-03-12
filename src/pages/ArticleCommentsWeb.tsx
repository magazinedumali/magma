import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Send, Trash2 } from 'lucide-react';
import { getUserAvatar, getUserDisplayName, getCommentUserInfo } from '@/lib/userHelper';

const PAGE_SIZE = 10;

const ArticleCommentsWeb: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [comments, setComments] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);

  // Fetch total count
  useEffect(() => {
    if (!slug) return;
    supabase.from('comments').select('*', { count: 'exact', head: true }).eq('article_slug', slug).then(({ count }) => {
      setTotal(count || 0);
    });
  }, [slug]);

  const fetchCommentsPage = useCallback(async (from: number, to: number, reset: boolean = false) => {
    if (!slug) return;
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('article_slug', slug)
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (data) {
      const mappedComments = data.map(comment => {
        const userInfo = getCommentUserInfo(comment);
        return {
          ...comment,
          avatar: userInfo.avatar,
          author: userInfo.name,
        };
      });
      
      if (reset) {
        setComments(mappedComments);
        setHasMore((data.length || 0) === PAGE_SIZE);
        setLoading(false);
      } else {
        setComments(prev => [...prev, ...mappedComments]);
        setHasMore((data.length || 0) === PAGE_SIZE);
        setLoadingMore(false);
      }
    } else {
      if (reset) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, [slug]);
  
  // Fetch first page
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchCommentsPage(0, PAGE_SIZE - 1, true);
  }, [slug, fetchCommentsPage]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMore) return;
      if (!listRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        fetchMore();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [comments, loadingMore, hasMore]);

  const fetchMore = async () => {
    if (!slug || loadingMore) return;
    setLoadingMore(true);
    const from = comments.length;
    const to = from + PAGE_SIZE - 1;
    await fetchCommentsPage(from, to, false);
  };

  // Realtime
  useEffect(() => {
    let subscription: any;
    const fetchFirstPage = async () => {
      if (!slug) return;
      await fetchCommentsPage(0, comments.length ? comments.length - 1 : PAGE_SIZE - 1, true);
      // Update total count
      supabase.from('comments').select('*', { count: 'exact', head: true }).eq('article_slug', slug).then(({ count }) => {
        setTotal(count || 0);
      });
    };
    if (slug) {
      subscription = supabase
        .channel('comments-realtime-web-' + slug)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `article_slug=eq.${slug}` }, () => {
          fetchFirstPage();
        })
        .subscribe();
    }
    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [slug, comments.length, fetchCommentsPage]);

  // Récupérer l'utilisateur connecté
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !slug || !user) return;
    setSending(true);
    const author = getUserDisplayName(user);
    const avatar = getUserAvatar(user);
    const user_id = user.id;
    const content = inputValue.trim();
    const created_at = new Date().toISOString();
    
    const optimisticComment = {
      id: 'optimistic-' + Date.now(),
      article_slug: slug,
      author,
      avatar,
      user_id,
      content,
      created_at,
      optimistic: true,
    };
    setComments(prev => [optimisticComment, ...prev]);
    setInputValue('');
    
    await supabase.from('comments').insert({
      article_slug: slug,
      author,
      avatar,
      user_id,
      content,
      created_at,
    });
    
    setSending(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Supprimer ce commentaire ?')) return;
    await supabase.from('comments').delete().eq('id', commentId);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col transition-colors duration-300 relative text-white">
      {/* Background decorations */}
      <div className="fixed top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ff184e]/30 to-transparent z-0"></div>
      <div className="fixed top-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#ff184e]/5 blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-20%] left-[-10%] w-[30%] h-[40%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none z-0"></div>

      <div className="max-w-2xl mx-auto w-full pt-12 pb-32 px-4 relative z-10">
        <h1 className="text-3xl font-bold mb-8 font-jost">Commentaires <span className="text-[#ff184e]">({total})</span></h1>
        <div ref={listRef} className="space-y-6">
          {loading ? (
            <div className="text-center text-gray-400 mt-10">Chargement...</div>
          ) : comments.length === 0 ? (
            <div className="text-center text-red-500 mt-10 font-semibold">Aucun commentaire publié pour cet article</div>
          ) : (
            comments.map((comment, idx) => {
              const userInfo = getCommentUserInfo(comment);
              return (
                <div key={comment.id || idx} className="flex items-start gap-4 glass-panel rounded-2xl p-5 shadow-xl border border-white/10 relative group hover:bg-white/5 transition-colors">
                  <img 
                    src={userInfo.avatar} 
                    alt={userInfo.name} 
                    className="w-12 h-12 rounded-full object-cover border border-white/20 shadow-md" 
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-gray-200">{userInfo.name}</span>
                      <span className="text-[10px] text-[#ff184e] uppercase tracking-wider font-medium">{comment.created_at ? new Date(comment.created_at).toLocaleString() : ''}</span>
                    </div>
                    <div className="text-gray-400 text-sm leading-relaxed break-words">{comment.content}</div>
                  </div>
                  {/* Poubelle visible seulement pour l'auteur */}
                  {user && comment.user_id === user.id && (
                    <button
                      className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-opacity opacity-0 group-hover:opacity-100"
                      title="Supprimer"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              );
            })
          )}
          {loadingMore && (
            <div className="text-center text-gray-400 py-4">Chargement...</div>
          )}
        </div>
      </div>
      {/* Barre d'ajout de commentaire en bas */}
      <div className="fixed bottom-0 left-0 right-0 z-20 p-4 bg-black/40 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <form onSubmit={handleAddComment} className="max-w-2xl mx-auto flex items-center glass-panel rounded-2xl px-4 py-3 border border-white/10">
          <img
            src={user ? getUserAvatar(user) : '/placeholder.svg'}
            alt={user ? getUserDisplayName(user) : 'Avatar'}
            className="w-12 h-12 rounded-full object-cover border border-white/20 mr-4 shadow-md"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          {user ? (
            <>
              <input
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                className="flex-1 px-5 py-3.5 bg-white/5 rounded-xl border border-white/10 focus:border-[#ff184e] focus:ring-1 focus:ring-[#ff184e] outline-none text-sm text-white placeholder-gray-500 transition-all"
                placeholder="Ajouter un commentaire…"
                disabled={sending}
              />
              <button
                type="submit"
                className="ml-4 px-8 py-3.5 rounded-xl bg-[#ff184e] text-white font-bold shadow-[0_0_15px_rgba(255,24,78,0.4)] hover:bg-[#ff184e]/80 transition-all disabled:opacity-50 text-sm"
                disabled={sending || !inputValue.trim()}
              >
                Envoyer
              </button>
            </>
          ) : (
            <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-gray-300 text-sm font-medium">Connectez-vous pour participer</div>
              <div className="flex gap-3 w-full sm:w-auto">
                <a href="/login" className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg bg-white/10 text-white font-bold text-center border border-white/10 hover:bg-white/20 transition-all text-sm">Connexion</a>
                <a href="/register" className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg bg-[#ff184e] text-white font-bold text-center shadow-[0_0_15px_rgba(255,24,78,0.4)] hover:bg-[#ff184e]/80 transition-all text-sm">Inscription</a>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ArticleCommentsWeb; 