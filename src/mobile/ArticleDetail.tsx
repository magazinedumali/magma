import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SmallArticleCard from '@/components/SmallArticleCard';
import { getArticleById, getRecentArticles } from '@/data/articles';
import { Clock, Share2, Bookmark, Send, MessageCircle, X, Facebook, Twitter, Linkedin, Copy } from 'lucide-react';
import AudioPlayer from '@/components/AudioPlayer';
import CommentForm from '@/components/CommentForm';
import Banner from '@/components/Banner';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabaseClient';
import { mapArticleFromSupabase } from '@/lib/articleMapper';

function stripHtml(html: string): string {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function parseContent(html: string) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  const elements: { type: 'text' | 'image', content: string }[] = [];
  tmp.childNodes.forEach(node => {
    if (node.nodeType === 1 && (node as HTMLElement).tagName === 'IMG') {
      elements.push({ type: 'image', content: (node as HTMLImageElement).src });
    } else if (node.nodeType === 1 && (node as HTMLElement).tagName === 'P') {
      const text = (node as HTMLElement).innerText.trim();
      if (text) elements.push({ type: 'text', content: text });
    } else if (node.nodeType === 3) {
      const text = node.textContent?.trim();
      if (text) elements.push({ type: 'text', content: text });
    }
  });
  return elements;
}

const MobileArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  
  // Central state for comments (most recent first)
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);

  // Fetch current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  // Fetch comments from Supabase
  const fetchComments = async () => {
    if (!article?.slug) return;
    setCommentsLoading(true);
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
    setCommentsLoading(false);
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

  const [startIdx, setStartIdx] = useState(0);
  const visibleCount = 4;
  const commentHeight = 104; // px, augmenté pour que tout soit bien contenu
  
  const [inputValue, setInputValue] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);

  // Fetch comments when article is loaded
  useEffect(() => {
    if (article?.slug) {
      fetchComments();
    }
  }, [article?.slug]);

  useEffect(() => {
    if (comments.length <= visibleCount) return;
    const interval = setInterval(() => {
      setStartIdx((prev) => (prev + 1) % comments.length);
    }, 3000); // Slide every 3 seconds
    return () => clearInterval(interval);
  }, [comments.length]);

  // Compute the visible comments (wrap around if needed)
  const visibleComments = [];
  for (let i = 0; i < Math.min(visibleCount, comments.length); i++) {
    visibleComments.push(comments[(startIdx + i) % comments.length]);
  }

  // Limite le nombre de commentaires affichés
  const commentsToShow = showAllComments ? comments : comments.slice(0, 3);
  
  useEffect(() => {
    console.log('Detail page slug:', slug);
    const fetchArticle = async () => {
      setLoading(true);
      try {
        // First try to fetch by slug (exact match)
        let { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('slug', slug)
          .maybeSingle(); // Use maybeSingle instead of single to avoid error when no results
        
        console.log('Fetched article by slug:', data, 'Error:', error, 'Slug:', slug);
        
        // If exact slug match fails, try case-insensitive search
        if (!data && slug) {
          console.log('Trying case-insensitive slug search...');
          const { data: caseInsensitiveData, error: caseInsensitiveError } = await supabase
            .from('articles')
            .select('*')
            .ilike('slug', slug)
            .maybeSingle();
          
          console.log('Case-insensitive slug search result:', { data: caseInsensitiveData, error: caseInsensitiveError });
          
          if (caseInsensitiveData) {
            data = caseInsensitiveData;
            error = null;
          }
        }
        
        // If slug fails and slug looks like an ID, try fetching by ID
        if (!data && slug && slug.length === 36) { // UUID length
          console.log('Trying to fetch by ID as fallback...');
          const { data: idData, error: idError } = await supabase
            .from('articles')
            .select('*')
            .eq('id', slug)
            .maybeSingle();
          
          console.log('Fetched article by ID:', idData, 'Error:', idError);
          
          if (idData) {
            data = idData;
            error = null;
          }
        }
        
        // If still no match, try to find similar slugs for debugging
        if (!data && slug) {
          console.log('Searching for similar slugs...');
          const { data: similarSlugs, error: similarError } = await supabase
            .from('articles')
            .select('id, titre, slug, statut')
            .ilike('slug', `%${slug}%`)
            .limit(5);
          
          console.log('Similar slugs found:', similarSlugs);
          
          // Also try searching by title if slug contains meaningful words
          if (similarSlugs && similarSlugs.length === 0) {
            const words = slug.split('-').filter(w => w.length > 2);
            if (words.length > 0) {
              console.log('Searching by title keywords:', words);
              const { data: titleMatches, error: titleError } = await supabase
                .from('articles')
                .select('id, titre, slug, statut')
                .or(words.map(w => `titre.ilike.%${w}%`).join(','))
                .limit(5);
              
              console.log('Title matches found:', titleMatches);
            }
          }
        }
        
        if (error) {
          console.error('Error fetching article:', error);
          setArticle(null);
        } else if (data) {
          console.log('Article content fields:', {
            contenu: data?.contenu,
            content: data?.content,
            contenuLength: data?.contenu?.length,
            contentLength: data?.content?.length
          });
          const mappedArticle = mapArticleFromSupabase(data);
          console.log('Mapped article:', {
            image: mappedArticle.image,
            content: mappedArticle.content,
            contentLength: mappedArticle.content?.length
          });
          setArticle(mappedArticle);
        } else {
          console.log('No article found with slug:', slug);
          setArticle(null);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchArticle();
  }, [slug]);

  if (loading) return <div className="py-12 text-center text-gray-400">Chargement...</div>;
  if (!article) return (
    <div className="py-12 text-center px-4">
      <div className="text-red-500 text-xl mb-4">Article introuvable</div>
      <div className="text-gray-600 mb-4">L'article avec le slug "{slug}" n'a pas été trouvé.</div>
      <div className="text-sm text-gray-500 mb-4">
        Vérifiez que l'URL est correcte ou que l'article existe dans la base de données.
      </div>
      <div>
        <Link to="/mobile" className="text-blue-600 hover:underline">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
  
  // Synchronise le contenu web et mobile
  const contentElements = [
    { type: 'text', content: article.excerpt },
    ...parseContent(article.content)
  ];
  
  // Before rendering tags, add:
  const safeTags = Array.isArray(article.tags)
    ? article.tags
    : typeof article.tags === 'string' && article.tags.length > 0
      ? article.tags.split(',').map(t => t.trim())
      : [];
  
  const canonicalUrl = `https://www.lemagazinedumali.com/article/${article.slug}`;
  return (
    <div className="min-h-screen bg-[#f9fafd] flex flex-col transition-colors duration-300">
      <Helmet>
        <title>{article.title || article.titre}</title>
        <meta property="og:type" content="article" />
        <meta property="og:title" content={article.title || article.titre} />
        <meta property="og:description" content={article.share_description || article.meta_description || article.excerpt || ''} />
        <meta property="og:image" content={article.share_image_url || article.image_url || article.image} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title || article.titre} />
        <meta name="twitter:description" content={article.share_description || article.meta_description || article.excerpt || ''} />
        <meta name="twitter:image" content={article.share_image_url || article.image_url || article.image} />
        <meta name="twitter:url" content={canonicalUrl} />
      </Helmet>
      {/* Header sur image */}
      <div className="relative w-full h-80 overflow-hidden">
        <img src={article.image || article.image_url} alt={article.title || article.titre} className="w-full h-80 object-cover" onError={e => { e.currentTarget.src = '/placeholder.svg'; }} loading="lazy" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-8">
          <button onClick={() => navigate(-1)} className="p-2">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className="flex gap-4">
            <button className="p-2">
              <Bookmark size={26} className="text-white" />
            </button>
            <button
              className="p-2"
              onClick={() => setShowShareModal(true)}
            >
              <Share2 size={26} className="text-white" />
            </button>
          </div>
        </div>
        {/* Meta infos sur image */}
        <div className="absolute left-0 right-0 bottom-0 px-4 pb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-[#ff184e] text-white text-xs font-semibold px-3 py-1 rounded-full">{article.category || article.categorie}</span>
            {/* <span className="text-white text-xs">5 min reads</span> */}
            <span className="text-white text-xs">{article.date_publication ? new Date(article.date_publication).toLocaleDateString() : ''}</span>
          </div>
          <h1 className="text-2xl font-bold text-white leading-tight mb-4 drop-shadow-lg">
            {article.title || article.titre}
          </h1>
          <div className="flex items-center gap-3 mt-6">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full object-cover border-2 border-white" loading="lazy" />
            <div>
              <div className="font-bold text-white text-base">{article.author || article.auteur}</div>
              <div className="text-gray-200 text-xs">auteur</div>
            </div>
          </div>
        </div>
      </div>
      {/* Audio réel */}
      <div className="px-4 pt-4">
        <AudioPlayer src={article.audio_url || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'} noCard />
      </div>
      <div className="px-4 mb-6 mt-4">
        <Banner position="sous-article" width={600} height={120} />
      </div>
      {/* Contenu de l'article */}
      <div className="px-4 py-8 bg-white">
        {article.content ? (
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        ) : (
          <div className="text-gray-500 italic text-center py-8">
            <p>Le contenu de cet article n'est pas disponible.</p>
            <p className="text-sm mt-2">Veuillez contacter l'administrateur si ce problème persiste.</p>
          </div>
        )}
      </div>
      {safeTags.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-2 mb-4 px-4">
          {safeTags.map((tag: string, idx: number) => (
            <span
              key={idx}
              className="bg-[#f1f3fa] text-[#232b46] rounded-full px-5 py-2 text-base font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
      {/* Formulaire de commentaire moderne type app mobile */}
      <div className="px-4 mb-8">
        <form
          className="flex items-center bg-white rounded-2xl shadow px-3 py-2"
          onSubmit={e => {
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
                className="w-9 h-9 rounded-full object-cover border-2 border-gray-200 mr-3"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <input
                type="text"
                className="flex-1 border-none outline-none bg-transparent text-base"
                placeholder="Écrire un commentaire..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                autoComplete="off"
              />
              <button
                type="submit"
                className="ml-2 bg-[#ff184e] hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow transition"
                aria-label="Envoyer"
              >
                <Send size={22} />
              </button>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center gap-2 px-3">
              <div className="text-gray-500 text-sm">Connectez-vous pour commenter</div>
              <div className="flex gap-2 w-full">
                <a href="/mobile/login" className="flex-1 px-3 py-2 rounded-full bg-[#4f8cff] text-white font-bold text-center text-sm shadow hover:bg-[#2563eb] transition">Se connecter</a>
                <a href="/mobile/register" className="flex-1 px-3 py-2 rounded-full bg-[#ff184e] text-white font-bold text-center text-sm shadow hover:bg-red-600 transition">Créer un compte</a>
              </div>
            </div>
          )}
        </form>
      </div>
      {/* Modal de partage personnalisé */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowShareModal(false)}>
          <div
            className="w-full max-w-md bg-white rounded-t-3xl p-6 pb-4 shadow-lg"
            style={{ borderTopLeftRadius: 32, borderTopRightRadius: 32 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-lg">Partager l'article</span>
              <button onClick={() => setShowShareModal(false)}>
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
                <Copy size={40} className="text-gray-500 mb-1" />
                <span className="text-xs">Copier</span>
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        className="fixed z-50 bottom-6 right-6 w-14 h-14 rounded-full bg-[#ff184e] shadow-lg flex items-center justify-center hover:scale-110 transition"
        onClick={() => navigate(`/mobile/article/${article.slug}/comments`, { state: { comments } })}
        aria-label="Commentaires"
      >
        <MessageCircle size={32} className="text-white" />
      </button>
    </div>
  );
};

export default MobileArticleDetail;
