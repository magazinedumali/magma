import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const PAGE_SIZE = 10;

const ArticleCommentsMobile = () => {
  const { slug } = useParams<{ slug: string }>();
  const [comments, setComments] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    fetchComments(true);
    // Realtime
    let subscription: any;
    if (slug) {
      subscription = supabase
        .channel('comments-realtime-' + slug)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `article_slug=eq.${slug}` }, payload => {
          fetchComments(true);
        })
        .subscribe();
    }
    return () => { if (subscription) supabase.removeChannel(subscription); };
    // eslint-disable-next-line
  }, [slug]);

  const fetchComments = async (reset = false) => {
    if (!slug) return;
    if (fetching) return;
    setFetching(true);
    if (reset) setLoading(true);
    const from = reset ? 0 : comments.length;
    const to = from + PAGE_SIZE - 1;
    const { data, count } = await supabase
      .from('comments')
      .select('*', { count: 'exact' })
      .eq('article_slug', slug)
      .order('created_at', { ascending: false })
      .range(from, to);
    if (reset) {
      setComments(data || []);
      setTotal(count || 0);
      setHasMore((data?.length || 0) === PAGE_SIZE);
    } else {
      setComments(prev => [...prev, ...(data || [])]);
      setHasMore((data?.length || 0) === PAGE_SIZE);
    }
    setLoading(false);
    setLoadingMore(false);
    setFetching(false);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !slug || !user) return;
    setSending(true);
    const author = user.user_metadata?.name || user.email || 'Utilisateur';
    const avatar = user.user_metadata?.avatar_url || 'https://randomuser.me/api/portraits/men/32.jpg';
    await supabase.from('comments').insert({
      article_slug: slug,
      author,
      avatar,
      content: inputValue.trim(),
      user_id: user.id,
      created_at: new Date().toISOString(),
    });
    setInputValue('');
    setSending(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('comments').delete().eq('id', id);
  };

  // Scroll infini
  useEffect(() => {
    const handleScroll = () => {
      if (!listRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      if (scrollHeight - scrollTop - clientHeight < 120 && hasMore && !loadingMore && !loading) {
        setLoadingMore(true);
        fetchComments();
      }
    };
    const ref = listRef.current;
    if (ref) ref.addEventListener('scroll', handleScroll);
    return () => { if (ref) ref.removeEventListener('scroll', handleScroll); };
    // eslint-disable-next-line
  }, [hasMore, loadingMore, loading, comments]);

  return (
    <div className="flex flex-col h-screen bg-[#f9fafd]">
      <div className="px-4 pt-6 pb-2 bg-white shadow rounded-b-xl">
        <div className="text-xl font-bold text-[#232b46]">Commentaires</div>
        <div className="text-sm text-gray-500 mt-1">{total} commentaire{total > 1 ? 's' : ''}</div>
      </div>
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {loading ? (
          <div className="text-center text-gray-400 py-10">Chargement…</div>
        ) : comments.length === 0 ? (
          <div className="text-center text-red-500 mt-10 font-semibold">Aucun commentaire publié pour cet article</div>
        ) : (
          comments.map((comment, idx) => (
            <div key={comment.id || idx} className="flex items-start gap-3 bg-white rounded-2xl px-4 py-3 shadow">
              <img src={comment.avatar} alt={comment.author} className="w-10 h-10 rounded-full object-cover" loading="lazy" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-[#1a2746]">{comment.author}</span>
                  <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleString()}</span>
                </div>
                <div className="text-gray-700 text-base break-words">{comment.content}</div>
              </div>
              {user && comment.user_id === user.id && (
                <button onClick={() => handleDelete(comment.id)} className="ml-2 text-[#ff184e] text-lg font-bold">🗑️</button>
              )}
            </div>
          ))
        )}
        {loadingMore && <div className="text-center text-gray-400 py-4">Chargement…</div>}
      </div>
      <form onSubmit={handleAddComment} className="flex items-center bg-white rounded-t-2xl px-4 py-3 shadow-lg">
        <img
          src={user?.user_metadata?.avatar_url || 'https://randomuser.me/api/portraits/men/32.jpg'}
          alt="Votre avatar"
          className="w-9 h-9 rounded-full object-cover border-2 border-gray-200 mr-3"
        />
        {user ? (
          <>
            <input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              className="flex-1 px-4 py-2 rounded-full border border-gray-200 focus:border-[#4f8cff] outline-none text-base"
              placeholder="Ajouter un commentaire…"
              disabled={sending}
            />
            <button
              type="submit"
              className="ml-3 px-5 py-2 rounded-full bg-[#4f8cff] text-white font-bold shadow hover:bg-[#2563eb] transition"
              disabled={sending || !inputValue.trim()}
            >
              Envoyer
            </button>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="text-gray-500 text-sm mb-2">Connectez-vous ou créez un compte pour commenter</div>
            <div className="flex gap-2 w-full">
              <a href="/mobile/login" className="flex-1 px-4 py-2 rounded-full bg-[#4f8cff] text-white font-bold text-center shadow hover:bg-[#2563eb] transition">Se connecter</a>
              <a href="/mobile/register" className="flex-1 px-4 py-2 rounded-full bg-[#ff184e] text-white font-bold text-center shadow hover:bg-red-600 transition">Créer un compte</a>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ArticleCommentsMobile; 