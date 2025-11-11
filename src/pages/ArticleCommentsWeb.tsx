import React, { useEffect, useState, useRef } from 'react';
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

  // Fetch first page
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchCommentsPage(0, PAGE_SIZE - 1, true);
  }, [slug]);
  
  const fetchCommentsPage = async (from: number, to: number, reset: boolean = false) => {
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
  };

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
    // eslint-disable-next-line
  }, [slug]);

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
    <div className="min-h-screen bg-[#f9fafd] flex flex-col transition-colors duration-300">
      <div className="max-w-2xl mx-auto w-full pt-8 pb-32 px-4">
        <h1 className="text-2xl font-bold mb-2">Commentaires <span className="text-[#ff184e]">({total})</span></h1>
        <div ref={listRef} className="space-y-6">
          {loading ? (
            <div className="text-center text-gray-400 mt-10">Chargement...</div>
          ) : comments.length === 0 ? (
            <div className="text-center text-red-500 mt-10 font-semibold">Aucun commentaire publié pour cet article</div>
          ) : (
            comments.map((comment, idx) => {
              const userInfo = getCommentUserInfo(comment);
              return (
                <div key={comment.id || idx} className="flex items-start gap-3 bg-white rounded-2xl px-4 py-3 shadow relative group">
                  <img 
                    src={userInfo.avatar} 
                    alt={userInfo.name} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" 
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-[#1a2746]">{userInfo.name}</span>
                      <span className="text-xs text-gray-400">{comment.created_at ? new Date(comment.created_at).toLocaleString() : ''}</span>
                    </div>
                    <div className="text-gray-700 text-base break-words">{comment.content}</div>
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
      <form onSubmit={handleAddComment} className="flex items-center bg-white rounded-xl px-4 py-4 shadow-lg mt-8 sticky bottom-0 z-10">
        <img
          src={user ? getUserAvatar(user) : '/placeholder.svg'}
          alt={user ? getUserDisplayName(user) : 'Avatar'}
          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 mr-4"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        {user ? (
          <>
            <input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              className="flex-1 px-4 py-3 rounded-full border border-gray-200 focus:border-[#4f8cff] outline-none text-base"
              placeholder="Ajouter un commentaire…"
              disabled={sending}
            />
            <button
              type="submit"
              className="ml-4 px-6 py-3 rounded-full bg-[#4f8cff] text-white font-bold shadow hover:bg-[#2563eb] transition"
              disabled={sending || !inputValue.trim()}
            >
              Envoyer
            </button>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="text-gray-500 text-sm mb-2">Connectez-vous ou créez un compte pour commenter</div>
            <div className="flex gap-2 w-full">
              <a href="/login" className="flex-1 px-4 py-2 rounded-full bg-[#4f8cff] text-white font-bold text-center shadow hover:bg-[#2563eb] transition">Se connecter</a>
              <a href="/register" className="flex-1 px-4 py-2 rounded-full bg-[#ff184e] text-white font-bold text-center shadow hover:bg-red-600 transition">Créer un compte</a>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ArticleCommentsWeb; 