import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

import { Share2, Bookmark, Send, MessageCircle, X, Facebook, Copy, User, Clock } from 'lucide-react';
import AudioPlayer from '@/components/AudioPlayer';
import Banner from '@/components/Banner';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabaseClient';
import { fetchPublishedArticleBySlugParam } from '@/lib/fetchArticleBySlug';
import { mapArticleFromSupabase } from '@/lib/articleMapper';
import { optimiseSupabaseImageUrl } from '@/lib/supabaseImageUrl';
import { getUserAvatar, getUserDisplayName, getCommentUserInfo } from '@/lib/userHelper';

const MobileArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  
  // Central state for comments (most recent first)
  const [comments, setComments] = useState<any[]>([]);

  // Fetch current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  // Fetch comments from Supabase
  const fetchComments = async () => {
    if (!article?.slug) return;
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('article_slug', article.slug)
      .order('created_at', { ascending: false });
    
    if (data) {
      const mappedComments = data.map(comment => {
        const userInfo = getCommentUserInfo(comment);
        return {
          id: comment.id,
          name: userInfo.name,
          time: comment.created_at ? new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          avatar: userInfo.avatar,
          text: comment.content || '',
          created_at: comment.created_at,
          user_id: comment.user_id,
        };
      });
      setComments(mappedComments);
    }
  };

  // Add comment handler
  const handleAddComment = async (text: string) => {
    if (!article?.slug) return;
    
    const currentUser = user || (await supabase.auth.getUser()).data.user;
    if (!currentUser) {
      navigate('/mobile/login');
      return;
    }
    
    const author = getUserDisplayName(currentUser);
    const avatar = getUserAvatar(currentUser);
    
    await supabase.from('comments').insert({
      article_slug: article.slug,
      article_id: article.id,
      author,
      avatar,
      content: text,
      user_id: currentUser.id,
      created_at: new Date().toISOString(),
    });
    
    // Refresh comments
    fetchComments();
  };

  const [inputValue, setInputValue] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (article?.slug) {
      fetchComments();
    }
  }, [article?.slug]);

  useEffect(() => {
    const load = async () => {
      if (!slug) {
        setLoading(false);
        setArticle(null);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await fetchPublishedArticleBySlugParam(supabase, slug);
        if (error) {
          console.error('[mobile/ArticleDetail]', error);
        }
        if (data) {
          setArticle(mapArticleFromSupabase(data));
        } else {
          setArticle(null);
        }
      } catch (err) {
        console.error('[mobile/ArticleDetail]', err);
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0d14] text-[#9ba5be]">
        Chargement…
      </div>
    );
  }
  if (!article) {
    return (
      <div className="min-h-screen bg-[#0a0d14] px-4 py-12 text-center text-white">
        <div className="mb-4 text-xl text-[#ef4444]">Article introuvable</div>
        <div className="mb-4 text-[#9ba5be]">
          L&apos;article avec le slug ou l&apos;identifiant « {slug} » est introuvable ou n&apos;est pas encore publié.
        </div>
        <Link to="/mobile" className="font-semibold text-[#ff184e] hover:underline">
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }
  
  const safeTags = Array.isArray(article.tags)
    ? article.tags
    : typeof article.tags === 'string' && article.tags.length > 0
      ? article.tags.split(',').map(t => t.trim())
      : [];

  const readMinutes = article.content
    ? Math.max(
        1,
        Math.round(
          String(article.content)
            .replace(/<[^>]*>/g, ' ')
            .split(/\s+/)
            .filter(Boolean).length / 200,
        ),
      )
    : 5;

  const canonicalUrl = `https://www.lemagazinedumali.com/article/${article.slug}`;
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0d14] transition-colors duration-300">
      <Helmet>
        <title>{article.title || article.titre}</title>
        <meta property="og:type" content="article" />
        <meta property="og:title" content={article.title || article.titre} />
        <meta property="og:description" content={article.share_description || article.meta_description || article.excerpt || ''} />
        <meta property="og:image" content={article.share_image_url || article.imageSource || article.image} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title || article.titre} />
        <meta name="twitter:description" content={article.share_description || article.meta_description || article.excerpt || ''} />
        <meta name="twitter:image" content={article.share_image_url || article.imageSource || article.image} />
        <meta name="twitter:url" content={canonicalUrl} />
      </Helmet>
      {/* Hero — proche ArticleDetailScreen RN */}
      <div className="relative min-h-[50vh] w-full overflow-hidden md:min-h-[55vh]">
        <img
          src={optimiseSupabaseImageUrl(article.imageSource || article.image, 'hero')}
          alt={article.title || article.titre}
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 35%, rgba(10,13,20,0.95) 100%)',
          }}
        />
        <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+12px)]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-black/35 backdrop-blur-sm"
            aria-label="Retour"
          >
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-black/35 backdrop-blur-sm"
              aria-label="Favori"
            >
              <Bookmark size={22} className="text-white" />
            </button>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-black/35 backdrop-blur-sm"
              aria-label="Partager"
              onClick={() => setShowShareModal(true)}
            >
              <Share2 size={22} className="text-white" />
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-24">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className="rounded bg-[#ff184e] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
              {article.category || article.categorie}
            </span>
            <span className="text-xs text-white/80">
              {article.date_publication ? new Date(article.date_publication).toLocaleDateString() : ''}
            </span>
          </div>
          <h1 className="mb-4 text-2xl font-bold leading-tight text-white drop-shadow-md">
            {article.title || article.titre}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-2">
              <User size={16} className="shrink-0 text-[#9ba5be]" aria-hidden />
              <span className="text-sm font-semibold text-white">{article.author || article.auteur}</span>
            </div>
            <div className="flex items-center gap-2 text-[#9ba5be]">
              <Clock size={16} className="shrink-0" aria-hidden />
              <span className="text-sm">
                {readMinutes} min de lecture
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 bg-[#0a0d14] px-4 pt-4">
        <AudioPlayer src={article.audio_url || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'} noCard />
      </div>
      <div className="px-4 mb-6 mt-4">
        <Banner position="sous-article" width={600} height={120} />
      </div>
      <div className="bg-[#0a0d14] px-4 py-8 text-[#cbd5e1] [&_a]:text-[#ff184e] [&_blockquote]:border-white/20 [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_li]:text-[#cbd5e1] [&_p]:text-[#cbd5e1] [&_strong]:text-white">
        {article.content ? (
          <div className="article-mobile-content" dangerouslySetInnerHTML={{ __html: article.content }} />
        ) : (
          <div className="py-8 text-center italic text-[#9ba5be]">
            <p>Le contenu de cet article n&apos;est pas disponible.</p>
            <p className="mt-2 text-sm">Veuillez contacter l&apos;administrateur si ce problème persiste.</p>
          </div>
        )}
      </div>
      {safeTags.length > 0 && (
        <div className="mb-4 mt-2 flex flex-wrap gap-3 px-4">
          {safeTags.map((tag: string, idx: number) => (
            <span
              key={idx}
              className="rounded-full border border-white/10 bg-[#161b26] px-4 py-2 text-sm font-medium text-[#9ba5be]"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
      {/* Formulaire de commentaire moderne type app mobile */}
      <div className="mb-8 px-4">
        <form
          className="flex items-center rounded-2xl border border-white/10 bg-[#161b26] px-3 py-2.5"
          onSubmit={(e) => {
            e.preventDefault();
            if (inputValue.trim()) {
              handleAddComment(inputValue.trim());
              setInputValue('');
            }
          }}
        >
          {user ? (
            <>
              <img
                src={getUserAvatar(user)}
                alt={getUserDisplayName(user)}
                className="mr-3 h-9 w-9 rounded-full border-2 border-white/10 object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <input
                type="text"
                className="flex-1 border-none bg-transparent text-base text-white outline-none placeholder:text-[#9ba5be]"
                placeholder="Partagez votre avis…"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                autoComplete="off"
              />
              <button
                type="submit"
                className="ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#ff184e] text-white shadow transition hover:bg-red-600"
                aria-label="Envoyer"
              >
                <Send size={22} />
              </button>
            </>
          ) : (
            <div className="flex w-full flex-col items-center gap-3 px-2 py-1">
              <div className="text-center text-sm text-[#9ba5be]">Connectez-vous pour rejoindre la discussion</div>
              <div className="flex w-full gap-2">
                <a
                  href="/mobile/login"
                  className="flex-1 rounded-full bg-[#161b26] px-3 py-2.5 text-center text-sm font-bold text-white ring-1 ring-white/15 transition hover:bg-white/10"
                >
                  Se connecter
                </a>
                <a
                  href="/mobile/register"
                  className="flex-1 rounded-full bg-[#ff184e] px-3 py-2.5 text-center text-sm font-bold text-white shadow transition hover:bg-red-600"
                >
                  Créer un compte
                </a>
              </div>
            </div>
          )}
        </form>
      </div>
      {/* Modal de partage personnalisé */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl border-t border-white/10 bg-[#161b26] p-6 pb-6 text-white shadow-2xl"
            style={{ borderTopLeftRadius: 32, borderTopRightRadius: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-lg font-bold">Partager l&apos;article</span>
              <button type="button" className="text-[#9ba5be]" onClick={() => setShowShareModal(false)} aria-label="Fermer">
                <X size={28} />
              </button>
            </div>
            <div className="flex justify-around items-center gap-4 mb-2 flex-wrap">
              {/* WhatsApp */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center"
              >
                <span className="bg-[#25D366] rounded-full p-2 mb-1">
                  <svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#25D366"/><path d="M23.5 8.5a9.5 9.5 0 0 0-15.7 10.5L6 26l7.2-1.8a9.5 9.5 0 0 0 10.3-15.7zm-7.5 15a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-4.3 1.1 1.1-4.2-.2-.3A8.1 8.1 0 1 1 16 23.5zm4.5-6.2c-.2-.1-1.2-.6-1.3-.7-.2-.1-.3-.2-.5.1-.1.2-.5.7-.6.8-.1.1-.2.2-.4.1-.2-.1-.8-.3-1.5-1-.6-.6-1-1.3-1.1-1.5-.1-.2 0-.3.1-.4.1-.1.2-.2.3-.3.1-.1.1-.2.2-.3.1-.1.1-.2.1-.3 0-.1 0-.2-.1-.3-.1-.1-.5-1.2-.7-1.6-.2-.4-.4-.3-.5-.3h-.4c-.1 0-.3 0-.4.2-.1.2-.5.5-.5 1.2 0 .7.5 1.4.6 1.5.1.1.9 1.4 2.2 2.2 1.3.8 1.3.5 1.5.5.2 0 .7-.3.8-.5.1-.2.1-.3.1-.4 0-.1 0-.2-.1-.3z" fill="#fff"/></svg>
                </span>
                <span className="text-xs">WhatsApp</span>
              </a>
              {/* WhatsApp Business */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center"
              >
                <span className="bg-[#075e54] rounded-full p-2 mb-1">
                  <svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#075e54"/><text x="16" y="22" textAnchor="middle" fontSize="16" fill="#fff" fontWeight="bold">W</text></svg>
                </span>
                <span className="text-xs">WA Business</span>
              </a>
              {/* Telegram */}
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center"
              >
                <span className="bg-[#229ED9] rounded-full p-2 mb-1">
                  <svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#229ED9"/><path d="M23.7 10.2l-2.2 10.3c-.2.8-.6 1-1.3.6l-3.6-2.7-1.7 1.6c-.2.2-.3.3-.7.3l.2-2.1 7.7-7c.3-.3-.1-.5-.5-.3l-9.5 6-2-0.6c-.8-.3-.8-.8.2-1.2l12.1-4.7c.6-.2 1.1.1.9 1z" fill="#fff"/></svg>
                </span>
                <span className="text-xs">Telegram</span>
              </a>
              {/* Facebook */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center"
              >
                <Facebook size={40} className="text-[#1877f3] mb-1" />
                <span className="text-xs">Facebook</span>
              </a>
              {/* X (Twitter) */}
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center"
              >
                <span className="bg-black rounded-full p-2 mb-1">
                  <svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#000"/><path d="M21.5 10.5l-9 11m0-11l9 11" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                </span>
                <span className="text-xs">X</span>
              </a>
              {/* Copier */}
              <button
                onClick={() => {
                  if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(window.location.href);
                    setShowShareModal(false);
                    alert('Lien copié !');
                  } else {
                    // Fallback pour anciens navigateurs
                    const textArea = document.createElement('textarea');
                    textArea.value = window.location.href;
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    try {
                      document.execCommand('copy');
                      alert('Lien copié !');
                    } catch (err) {
                      alert('Impossible de copier le lien');
                    }
                    document.body.removeChild(textArea);
                    setShowShareModal(false);
                  }
                }}
                className="flex flex-col items-center"
              >
                <Copy size={40} className="mb-1 text-[#9ba5be]" />
                <span className="text-xs text-[#9ba5be]">Copier</span>
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        type="button"
        className="fixed bottom-[calc(24px+env(safe-area-inset-bottom,0px))] right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#ff184e] shadow-lg transition hover:scale-105"
        onClick={() => navigate(`/mobile/article/${article.slug}/comments`, { state: { comments } })}
        aria-label="Commentaires"
      >
        <MessageCircle size={32} className="text-white" />
      </button>
    </div>
  );
};

export default MobileArticleDetail;
