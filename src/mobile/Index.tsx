import React, { useState, useEffect, useLayoutEffect, memo } from 'react';
import { Bell, Bookmark, User, Search as SearchIcon, PlayCircle, Sun, Moon } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { getUserAvatar } from '@/lib/userHelper';
import { getFeaturedArticles, getArticlesByCategory, getRecentArticles } from '@/data/articles';
import { categories as siteCategories } from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import Banner from '@/components/Banner';
import { User as UserIcon } from 'lucide-react';
import Stories from './Stories';
import Poll from '@/components/Poll';

const articles = [
    {
      id: 1,
    category: 'Travel',
    time: '5 min reads',
    title: 'The UNESCO World Heritage Site with sky-high house prices',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    source: 'BBC NEWS',
    ago: '3 hours ago',
    badge: true,
    },
    {
      id: 2,
    category: 'Business',
    time: '12 min reads',
    title: "Peak oil is coming. That won't save the world",
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2',
    source: 'BBC NEWS',
    ago: '1 min ago',
    badge: true,
    },
    {
      id: 3,
    category: 'World',
    time: '8 min reads',
    title: 'World news headline example',
      image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308',
    source: 'BBC NEWS',
    ago: '8 min ago',
    badge: false,
  },
];

// Dummy creators data
const creators = [
  {
    id: 1,
    name: 'Ronald',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308',
    title: 'WINDS OF DESTINY',
    live: true,
    viewers: '86.4K',
    time: '2m',
  },
  {
    id: 2,
    name: 'Cody Ray',
    avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
    title: 'THREADS OF FATE',
    live: true,
    viewers: '41.2K',
    time: '1h',
  },
  // Placeholders avec images accessibles
  {
    id: 3,
    name: '',
    avatar: '',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    title: 'TITRE URGENT',
    live: true,
    viewers: '12.3K',
    time: '',
  },
  {
    id: 4,
    name: '',
    avatar: '',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
    title: 'ALERTE INFO',
    live: true,
    viewers: '7.8K',
    time: '',
  },
  {
    id: 5,
    name: '',
    avatar: '',
    image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
    title: 'FLASH NEWS',
    live: true,
    viewers: '22.1K',
    time: '',
  },
  {
    id: 6,
    name: '',
    avatar: '',
    image: 'https://images.unsplash.com/photo-1551038247-3d9af20df552',
    title: 'DERNIÈRE MINUTE',
    live: true,
    viewers: '5.4K',
    time: '',
  },
];

const getAuthorAvatar = (author: string, authorAvatar?: string) => {
  if (authorAvatar) return authorAvatar;
  return '/logo.png';
};

// Composant ArticleCard optimisé
const ArticleCard = memo(function ArticleCard({ title, image, author, authorAvatar, category, date, slug, excerpt, featured, onClick }: { title: string, image: string, author: string, authorAvatar?: string, category: string, date: string, slug: string, excerpt: string, featured: boolean, onClick: () => void }) {
  return (
    <div className="flex bg-white rounded-2xl shadow-sm overflow-hidden h-28 cursor-pointer transition-colors duration-300" onClick={e => { console.log('ArticleCard clicked:', { title, slug }); onClick(); }}>
      <img src={image} alt={title} className="w-28 h-full object-cover flex-shrink-0 rounded-l-2xl" loading="lazy" />
      <div className="flex-1 flex flex-col justify-between p-4 min-w-0">
        <div>
          <h3 className="font-bold text-lg text-leading-tight mb-2 truncate">{title}</h3>
          <div className="flex items-center gap-2 mb-2">
            <img src={getAuthorAvatar(author, authorAvatar)} alt={author} className="h-5 w-5 rounded-full" loading="lazy" onError={e => { e.currentTarget.src = '/logo.png'; }} />
            <span className="text-xs text-gray-500 font-medium">{author}</span>
            <span className="bg-white border border-[#ff184e] text-[#ff184e] text-xs font-semibold px-3 py-0.5 rounded-full ml-2 transition-colors duration-300">{category}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#ff184e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              110.5K
            </span>
          </div>
        </div>
        <div className="flex justify-end items-center mt-2">
          <button className="text-[#ff184e]">
            <Bookmark size={22} />
          </button>
        </div>
      </div>
    </div>
  );
});

export default function MobileHome() {
  const [tab, setTab] = useState('latest');
  const [user, setUser] = useState<any>(null);
  const [slide, setSlide] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  const [featuredArticles, setFeaturedArticles] = useState<any[]>([]);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [wasSwiping, setWasSwiping] = useState(false);
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const batchSize = 10;
  const [page, setPage] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Charger dynamiquement les 3 derniers articles publiés
    const fetchArticles = async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('id, slug, titre, image_url, categorie, auteur, date_publication')
        .eq('statut', 'publie')
        .order('date_publication', { ascending: false })
        .limit(3);
      if (data) {
        setFeaturedArticles(data.map((a: any) => ({
          id: a.id,
          slug: a.slug,
          title: a.titre,
          image: a.image_url,
          category: a.categorie,
          author: a.auteur,
          date: a.date_publication ? new Date(a.date_publication).toLocaleDateString() : '',
        })));
      }
    };
    fetchArticles();
  }, []);

  // Update fetchArticles to fetch by category from Supabase
  const fetchArticles = async (reset = false) => {
    setLoadingMore(true);
    const from = reset ? 0 : articles.length;
    const to = from + batchSize - 1;
    let data = [];
    let error = null;
    if (tab === 'latest') {
      const res = await supabase
        .from('articles')
        .select('*')
        .eq('statut', 'publie')
        .order('date_publication', { ascending: false })
        .range(from, to);
      data = res.data || [];
      error = res.error;
    } else {
      // Fetch by category from Supabase
      const res = await supabase
        .from('articles')
        .select('*')
        .eq('statut', 'publie')
        .eq('categorie', tab)
        .order('date_publication', { ascending: false })
        .range(from, to);
      data = res.data || [];
      error = res.error;
    }
    if (!error) {
      setArticles(prev => reset ? data : [...prev, ...data]);
      setHasMore(data.length === batchSize);
    }
    setLoadingMore(false);
  };

  // Initial fetch and on tab change
  useEffect(() => {
    fetchArticles(true);
    setPage(0);
  }, [tab]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMore) return;
      const scrollY = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      if (scrollY + windowHeight >= docHeight - 200) {
        fetchArticles();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [articles, tab, loadingMore, hasMore]);

  const avatar = user ? getUserAvatar(user) : '';
  const name = user?.user_metadata?.name || user?.email?.split('@')[0] || '';
  const username = user?.user_metadata?.username || '';

  // Message de bienvenue dynamique selon l'heure
  function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning!';
    if (hour >= 12 && hour < 18) return 'Good afternoon!';
    if (hour >= 18 && hour < 22) return 'Good evening!';
    return 'Good night!';
  }

  // Slider navigation
  const nextSlide = React.useCallback(() => {
    setDirection('left');
    setSlide((s) => (s + 1) % featuredArticles.length);
  }, [featuredArticles.length]);
  const prevSlide = React.useCallback(() => {
    setDirection('right');
    setSlide((s) => (s - 1 + featuredArticles.length) % featuredArticles.length);
  }, [featuredArticles.length]);

  // Auto-slide (reset timer on manual change)
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(interval);
  }, [slide, nextSlide]);

  // Animation classes
  function getSlideClass(idx: number) {
    if (idx === slide) return 'z-10 opacity-100 translate-x-0';
    if (direction === 'left' && idx === (slide - 1 + featuredArticles.length) % featuredArticles.length) return 'z-0 opacity-0 -translate-x-full';
    if (direction === 'right' && idx === (slide + 1) % featuredArticles.length) return 'z-0 opacity-0 translate-x-full';
    return 'z-0 opacity-0';
  }

  // Gestion du swipe tactile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setWasSwiping(false);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.touches[0].clientX);
    if (touchStartX !== null && Math.abs(e.touches[0].clientX - touchStartX) > 10) {
      setWasSwiping(true);
    }
  };
  const handleTouchEnd = () => {
    if (touchStartX !== null && touchEndX !== null) {
      const diff = touchStartX - touchEndX;
      if (diff > 50) nextSlide(); // swipe left
      else if (diff < -50) prevSlide(); // swipe right
    }
    setTouchStartX(null);
    setTouchEndX(null);
    setTimeout(() => setWasSwiping(false), 100);
  };

  // Tabs dynamiques à partir des catégories du site
  const mobileTabs = [
    { label: 'Latest', value: 'latest' },
    ...siteCategories.map(cat => ({ label: cat.name, value: cat.name }))
  ];

  return (
    <>
      <div className="bg-[#f9fafd] min-h-screen flex flex-col transition-colors duration-300">
        {/* Header */}
        <header className="flex items-center justify-between px-4 pt-6 pb-4 bg-[#f9fafd] transition-colors duration-300">
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {avatar && avatar !== '/placeholder.svg' ? (
                  <img 
                    src={avatar} 
                    alt="avatar" 
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="#cbd5e1"/><path d="M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4" fill="#cbd5e1"/></svg>
                  </div>
                )}
                <div className="flex flex-col justify-center">
                  <span className="text-xs text-gray-500">{getGreeting()}</span>
                  <span className="font-bold text-lg text-leading-tight">{name || username}</span>
                </div>
              </>
            ) : (
              <>
                <img src="/logo.png" alt="Logo" className="h-10" />
                <div className="flex flex-col justify-center">
                  <span className="text-xs text-gray-500">{getGreeting()}</span>
                  <span className="font-bold text-lg text-leading-tight">Le Magazine</span>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button className="bg-white rounded-full p-2 shadow-sm transition-colors duration-300" onClick={() => navigate('/mobile/search')}>
              <SearchIcon size={24} />
            </button>
            <button className="relative bg-white rounded-full p-2 shadow-sm transition-colors duration-300">
              <Bell size={24} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Tabs dynamiques au-dessus du slider */}
        <nav className="flex px-4 gap-4 mb-4 mt-2 overflow-x-auto scrollbar-hide">
          {mobileTabs.map(t => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-6 py-2 rounded-full font-bold text-base whitespace-nowrap transition-all ${tab === t.value ? 'bg-[#ff184e] text-white shadow' : 'bg-transparent text-black'}`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* Hero Slider */}
        <div className="px-4">
          <div
            className="rounded-3xl overflow-hidden relative shadow-lg mb-6 h-56 bg-white transition-colors duration-300"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {featuredArticles.map((article, idx) => (
              <div
                key={article.id}
                className={`absolute inset-0 transition-all duration-500 ease-in-out will-change-transform ${getSlideClass(idx)}`}
                style={{ pointerEvents: idx === slide ? 'auto' : 'none' }}
                onClick={() => {
                  if (!wasSwiping) {
                    console.log('Featured slider clicked:', article);
                    navigate(`/mobile/article/${article.slug || article.id}`);
                  }
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                tabIndex={idx === slide ? 0 : -1}
                aria-label={article.title}
              >
                <img src={article.image} alt="hero" className="w-full h-56 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-3xl" />
                {/* Dots in slider, overlay bottom center */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                  {featuredArticles.map((_, dotIdx) => (
                    <button key={dotIdx} onClick={() => { setDirection(dotIdx > slide ? 'left' : 'right'); setSlide(dotIdx); }} className={`w-3 h-1.5 rounded-full transition-all ${slide === dotIdx ? 'bg-[#ff184e]' : 'bg-gray-300'}`}></button>
                  ))}
                </div>
                <div className="absolute left-0 right-0 bottom-0 p-5 text-white z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">{article.category}</span>
                    <span className="text-xs">5 min reads</span>
                    </div>
                  <h2 className="text-2xl font-bold leading-tight mb-2">{article.title}</h2>
                  <div className="flex items-center gap-2 text-xs opacity-80">
                    <img src={getAuthorAvatar(article.author, article.authorAvatar)} alt={article.author} className="h-5 w-5 rounded-full" onError={e => { e.currentTarget.src = '/logo.png'; }} />
                    <span>{article.author}</span>
                    <span>•</span>
                    <span>{article.date}</span>
                  </div>
                </div>
                <button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1 z-20"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="#1a2746" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                <button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1 z-20"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke="#1a2746" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                {article.featured && (
                  <span className="absolute top-4 right-4 bg-white text-[#ff184e] rounded-xl p-2 shadow z-20">
                    <Bookmark size={20} />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Banner Accueil */}
        <div className="px-4 mb-4">
          <Banner position="accueil" width={400} height={80} />
        </div>

        {/* Sujets brûlants! (stories) */}
        <section className="bg-white px-0 pt-2 pb-4 mb-2 transition-colors duration-300">
          <div className="px-4 mb-3">
            <span className="font-bold text-xl text-black">Sujets brûlants!</span>
          </div>
          <Stories />
        </section>
        <div className="px-4 mb-4">
          <span className="font-bold text-xl text-black block mb-3">Sondage en ligne</span>
          <Poll compact={true} />
        </div>
          
        {/* Article List dynamique */}
        <div className="flex-1 px-4 space-y-4 pb-24">
          {articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><path d="M12 20h9" stroke="#ff184e" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="10" r="6" stroke="#ff184e" strokeWidth="2"/><path d="M9.5 9.5h.01M14.5 9.5h.01" stroke="#ff184e" strokeWidth="2" strokeLinecap="round"/><path d="M9.5 13c.5.5 1.5.5 2 0" stroke="#ff184e" strokeWidth="2" strokeLinecap="round"/></svg>
              <span className="mt-2 text-base font-medium">Aucun article trouvé dans cette catégorie</span>
              <button
                onClick={() => setTab('latest')}
                className="mt-4 px-6 py-2 rounded-full bg-[#ff184e] text-white font-bold shadow hover:bg-red-600 transition"
              >
                Retour à l'accueil
              </button>
            </div>
          ) : (
            <>
              {articles.map(article => (
                <ArticleCard
                  key={article.id}
                  title={article.titre}
                  image={article.image_url}
                  author={article.auteur}
                  authorAvatar={article.authorAvatar}
                  category={article.categorie}
                  date={article.date_publication}
                  slug={article.slug}
                  excerpt={article.excerpt || ''}
                  featured={article.featured}
                  onClick={() => navigate(`/mobile/article/${article.slug || article.id}`)}
                />
              ))}
              {loadingMore && (
                <div className="flex justify-center py-4">
                  <span className="text-gray-400">Chargement...</span>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Bottom Navigation - Fixed */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center h-16 z-50 shadow-lg transition-colors duration-300">
          <button className="flex flex-col items-center text-[#ff184e]">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M3 12L12 5l9 7v7a2 2 0 01-2 2h-3a2 2 0 01-2-2v-3H9v3a2 2 0 01-2 2H4a2 2 0 01-2-2v-7z" stroke="#ff184e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#fff"/></svg>
          </button>
          <button className="flex flex-col items-center text-[#1a2746]" onClick={() => navigate('/mobile/audio-streaming')} aria-label="Streaming audio">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <path d="M12 3v18M8 7v10M16 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="flex flex-col items-center text-[#ff184e]" onClick={() => navigate('/mobile/audio-streaming')} aria-label="Streaming audio">
            <PlayCircle size={32} />
          </button>
          <button className="flex flex-col items-center text-[#1a2746]">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="flex flex-col items-center text-[#1a2746]" onClick={() => user ? navigate('/mobile/profile') : navigate('/mobile/login')}>
            <User size={28} />
          </button>
        </nav>
      </div>
    </>
  );
}
