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
  
  // Utilisateur fictif (à remplacer par le vrai utilisateur connecté si besoin)
  const user = {
    name: 'Utilisateur',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  };
  
  // Central state for comments (most recent first)
  const [comments, setComments] = useState([
    {
      name: 'Jane Doe',
      time: '6:30pm',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      text: 'Great article! Very informative.'
    },
    {
      name: 'John Smith',
      time: '6:32pm',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      text: 'Thanks for sharing this update.'
    },
    {
      name: 'Alice Johnson',
      time: '6:35pm',
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
      text: 'I learned a lot from this post. Keep up the good work!'
    },
    {
      name: 'Michael Brown',
      time: '6:37pm',
      avatar: 'https://randomuser.me/api/portraits/men/54.jpg',
      text: 'Looking forward to more articles like this.'
    },
    {
      name: 'Emily Clark',
      time: '6:40pm',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      text: 'Very well written and easy to understand.'
    },
    {
      name: 'David Lee',
      time: '6:42pm',
      avatar: 'https://randomuser.me/api/portraits/men/77.jpg',
      text: 'This was exactly what I was looking for, thank you!'
    },
    {
      name: 'Sophia Martinez',
      time: '6:45pm',
      avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
      text: 'Can you write more about this topic?'
    },
    {
      name: 'Chris Evans',
      time: '6:48pm',
      avatar: 'https://randomuser.me/api/portraits/men/23.jpg',
      text: 'Awesome insights, really appreciate it.'
    }
  ]);

  // Add comment handler
  const handleAddComment = async (text: string) => {
    if (!article?.slug) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const author = 'Utilisateur';
    const avatar = 'https://randomuser.me/api/portraits/men/32.jpg';
    await supabase.from('comments').insert({
      article_slug: article.slug,
      author,
      avatar,
      content: text,
      created_at: new Date().toISOString(),
    });
    // Optionnel: toast de confirmation
  };

  const [startIdx, setStartIdx] = useState(0);
  const visibleCount = 4;
  const commentHeight = 104; // px, augmenté pour que tout soit bien contenu

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
  
  const [inputValue, setInputValue] = useState('');
  
  const [showShareModal, setShowShareModal] = useState(false);
  
  const [showAllComments, setShowAllComments] = useState(false);

  // Limite le nombre de commentaires affichés
  const commentsToShow = showAllComments ? comments : comments.slice(0, 3);
  
  useEffect(() => {
    console.log('Detail page slug:', slug);
    const fetchArticle = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .single();
      console.log('Fetched article:', data, 'Error:', error);
      setArticle(data);
      setLoading(false);
    };
    if (slug) fetchArticle();
  }, [slug]);

  if (loading) return <div className="py-12 text-center text-gray-400">Chargement...</div>;
  if (!article) return <div className="py-12 text-center text-red-500">Article introuvable.</div>;
  
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
  
  return (
    <div className="min-h-screen bg-[#f9fafd] flex flex-col transition-colors duration-300">
      <Helmet>
        <meta property="og:type" content="article" />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:image" content={article.image} />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.excerpt} />
        <meta name="twitter:image" content={article.image} />
      </Helmet>
      {/* Header sur image */}
      <div className="relative w-full h-80 overflow-hidden">
        <img src={article.image_url} alt={article.titre} className="w-full h-80 object-cover" onError={e => { e.currentTarget.src = '/logo.png'; }} loading="lazy" />
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
            <span className="bg-[#ff184e] text-white text-xs font-semibold px-3 py-1 rounded-full">{article.categorie}</span>
            {/* <span className="text-white text-xs">5 min reads</span> */}
            <span className="text-white text-xs">{article.date_publication ? new Date(article.date_publication).toLocaleDateString() : ''}</span>
          </div>
          <h1 className="text-2xl font-bold text-white leading-tight mb-4 drop-shadow-lg">
            {article.titre}
          </h1>
          <div className="flex items-center gap-3 mt-6">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full object-cover border-2 border-white" loading="lazy" />
            <div>
              <div className="font-bold text-white text-base">{article.auteur}</div>
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
        <div dangerouslySetInnerHTML={{ __html: article.contenu }} />
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
          <img
            src={user.avatar}
            alt={user.name}
            className="w-9 h-9 rounded-full object-cover border-2 border-gray-200 mr-3"
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
