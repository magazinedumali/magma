import React, { useState, useEffect } from 'react';
import { Search, Menu, X, Bell, ChevronDown, UserCircle, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/lib/supabaseClient';
import { useTranslation } from 'react-i18next';
import { getUserAvatar } from '@/lib/userHelper';
import MainNavigation from './header/MainNavigation';
import HeaderLogo from './header/HeaderLogo';
import { useCategories } from '@/hooks/useCategories';
import { useTheme } from '@/contexts/ThemeContext';
import { applyStorageImageFallback, optimiseSupabaseImageUrl } from '@/lib/supabaseImageUrl';

const Header = () => {
  const { categories } = useCategories();
  const { isDark, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentArticleTitle, setCurrentArticleTitle] = useState("");
  const [showTitle, setShowTitle] = useState(true);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const { t, i18n } = useTranslation();
  
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [recentFetchError, setRecentFetchError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticles() {
      setLoadingRecent(true);
      setRecentFetchError(null);
      const { data, error } = await supabase
        .from('articles')
        .select('id, slug, titre, meta_description, image_url, categorie, date_publication, auteur, statut')
        .eq('statut', 'publie')
        .order('date_publication', { ascending: false })
        .limit(10);
      if (error) {
        console.error('[Header] titres défilants:', error);
        setRecentArticles([]);
        setRecentFetchError(error.message);
      } else {
        setRecentArticles(data || []);
      }
      setLoadingRecent(false);
    }
    fetchArticles();
  }, []);

  const mappedArticles = (recentArticles || [])
    .map((a: any) => ({
      id: a.id,
      slug: a.slug || a.id,
      title: (a.titre ?? a.title ?? '').trim(),
      excerpt: a.meta_description ?? a.excerpt ?? '',
      image: a.image_url ?? a.image ?? '',
      category: a.categorie ?? a.category ?? '',
      date: a.date_publication ?? a.date ?? '',
      author: a.auteur ?? a.author ?? '',
    }))
    .filter((a) => a.title.length > 0);

  const tickerItems = mappedArticles.length > 0 ? mappedArticles.concat(mappedArticles) : [];

  useEffect(() => {
    if (!mappedArticles.length) return;
    let currentIndex = 0;
    const interval = setInterval(() => {
      setShowTitle(false);
      setTimeout(() => {
        currentIndex = (currentIndex + 1) % mappedArticles.length;
        setCurrentArticleTitle(mappedArticles[currentIndex].title);
        setShowTitle(true);
      }, 500);
    }, 4000);
    setCurrentArticleTitle(mappedArticles[0].title);
    return () => clearInterval(interval);
  }, [mappedArticles]);

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  useEffect(() => {
    if (!isSearchOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleSearch();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  // Search query and results with debounced database searching
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const searchArticles = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('id, slug, titre, meta_description, image_url, categorie, date_publication, auteur, statut')
          .eq('statut', 'publie')
          .ilike('titre', `%${searchQuery}%`)
          .order('date_publication', { ascending: false })
          .limit(10);

        if (error) throw error;

        if (data) {
          setSearchResults(data.map((a: any) => ({
            id: a.id,
            slug: a.slug || a.id,
            title: a.titre ?? a.title ?? '',
            excerpt: a.meta_description ?? a.excerpt ?? '',
            image: a.image_url ?? a.image ?? '',
            category: a.categorie ?? a.category ?? '',
            date: a.date_publication ?? a.date ?? '',
            author: a.auteur ?? a.author ?? '',
          })));
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchArticles, 400);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <header className="glass-header text-white transition-all duration-300 relative z-50">
      <div className="w-full">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center mb-0">
          <div className="flex items-center">
            <button 
              className="md:hidden text-gray-300 mr-3 hover:text-white transition-colors"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <HeaderLogo />
            </motion.div>
          </div>
          
          {/* Main Navigation - Desktop */}
          <div className="hidden md:block">
            <MainNavigation />
          </div>
          
          {/* Right section with language, login and notifications */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center text-sm px-2 sm:px-3 py-1.5 border border-white/20 rounded-md bg-white/5 hover:bg-white/10 transition-colors focus:outline-none focus:ring-1 focus:ring-[#ff184e]">
                  <img src={i18n.language === 'fr' ? "https://flagcdn.com/w20/fr.png" : "https://flagcdn.com/w20/us.png"} alt="Flag" className="h-4 mr-0 sm:mr-2 rounded-sm" />
                  <span className="hidden sm:inline">{i18n.language === 'fr' ? 'FR' : 'EN'}</span>
                  <ChevronDown size={14} className="ml-1 sm:ml-2 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 glass-panel border-white/10 text-white">
                <DropdownMenuItem onClick={() => i18n.changeLanguage('fr')} className="flex items-center cursor-pointer hover:bg-white/10 focus:bg-white/10 focus:text-white">
                  <img src="https://flagcdn.com/w20/fr.png" alt="Français" className="h-4 mr-2" />
                  Français
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => i18n.changeLanguage('en')} className="flex items-center cursor-pointer hover:bg-white/10 focus:bg-white/10 focus:text-white">
                  <img src="https://flagcdn.com/w20/us.png" alt="English" className="h-4 mr-2" />
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-300 hover:shadow-[0_0_10px_rgba(255,24,78,0.3)] focus:outline-none"
            >
              {isDark 
                ? <Sun size={16} className="text-amber-300" />
                : <Moon size={16} className="text-slate-600" />}
            </button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/10 transition-colors border border-transparent hover:border-white/10">
                    {getUserAvatar(user) !== '/placeholder.svg' ? (
                      <img 
                        src={getUserAvatar(user)} 
                        alt="avatar" 
                        className="w-8 h-8 rounded-full object-cover border border-white/20"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    ) : (
                      <UserCircle size={28} className="text-gray-300" />
                    )}
                    <span className="font-medium text-sm hidden md:block text-gray-200">{user.user_metadata?.name || user.email?.split('@')[0]}</span>
                    <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 glass-panel border-white/10 text-white">
                  <DropdownMenuItem asChild className="hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer">
                    <Link to="/profile" className="block w-full text-left">Mon profil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer">
                    <button
                      className="block w-full text-left text-[#ff184e] font-medium"
                      onClick={async () => { await supabase.auth.signOut(); }}
                    >
                      Déconnexion
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button 
                  className="hidden md:flex text-white font-medium bg-[#ff184e] hover:bg-[#ff184e]/80 shadow-[0_0_15px_rgba(255,24,78,0.5)] transition-all duration-300 border-none px-6"
                  size="sm"
                >
                  Connexion
                </Button>
              </Link>
            )}
            
            <Button
              variant="ghost" 
              size="icon"
              className="relative hover:bg-white/10 text-gray-300 hover:text-white"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 sm:top-0 sm:right-0 bg-[#ff184e] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full shadow-[0_0_8px_rgba(255,24,78,0.8)]">
                2
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden glass-panel border-b border-t border-white/10 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4">
              <ul className="flex flex-col space-y-2 text-sm font-medium">
                {categories.map((item) => (
                  <li key={item.name}>
                    <Link 
                      to={item.path} 
                      className="block py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded px-3 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t(item.name)}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button 
                      className="w-full mt-4 text-white bg-[#ff184e] hover:bg-[#ff184e]/80 border-none shadow-[0_0_10px_rgba(255,24,78,0.4)]"
                      size="sm"
                    >
                      Connexion
                    </Button>
                  </Link>
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Browse Section */}
      <div className="border-t border-white/10 py-2 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-4 flex items-center justify-between min-h-0">
          <div className="flex items-center flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center cursor-pointer text-gray-300 hover:text-white transition-colors bg-white/5 px-4 py-1.5 rounded-md border border-white/10 hover:bg-white/10">
                  <Menu size={16} className="mr-2" />
                  <span className="font-semibold mr-2 text-sm tracking-wide uppercase">Sujets</span>
                  <ChevronDown size={14} />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="glass-panel border-white/10 p-3 shadow-2xl rounded-xl w-64 z-50 mt-2">
                <div className="grid gap-1">
                  {categories.map((cat, idx) => (
                    <Link key={idx} to={cat.path} className="flex items-center text-gray-300 hover:text-white hover:bg-white/10 p-2.5 rounded-lg transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#ff184e] mr-3 shadow-[0_0_5px_#ff184e]"></div>
                      <span className="font-medium">{t(cat.name)}</span>
                    </Link>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Sliding Article Titles dynamique et cliquable */}
          <div className="mx-4 hidden min-w-0 max-w-[700px] flex-1 items-center justify-center md:flex">
            <div className="header-news-ticker relative flex h-9 w-full min-w-0 flex-1 items-stretch overflow-hidden rounded-full border border-white/10 bg-black/30 px-1 shadow-inner">
              <div
                className="header-ticker-fade-left pointer-events-none absolute inset-y-0 left-0 z-[2] w-10 bg-gradient-to-r from-neutral-900/95 via-neutral-900/45 to-transparent dark:from-black/90 dark:via-black/55"
                aria-hidden
              />
              <div className="relative z-[1] flex min-h-0 min-w-0 flex-1 items-center overflow-hidden">
                {loadingRecent ? (
                  <span className="truncate px-4 text-sm font-semibold text-[#ff184e]">
                    La rédaction charge les derniers titres…
                  </span>
                ) : recentFetchError ? (
                  <span className="truncate px-4 text-sm font-medium text-[#ff184e]" title={recentFetchError}>
                    Impossible de charger les titres (réseau ou session).
                  </span>
                ) : tickerItems.length === 0 ? (
                  <span className="truncate px-4 text-sm font-medium text-[#ff184e]/90">
                    Aucun article publié à afficher pour le moment.
                  </span>
                ) : (
                  <div
                    className="header-news-marquee flex h-full w-max max-w-none flex-nowrap items-center gap-0 whitespace-nowrap py-0 text-sm font-semibold animate-marquee"
                  >
                    {tickerItems.map((article, idx) => (
                      <span key={`${article.id}-${idx}`} className="inline-flex shrink-0 items-center">
                        <Link
                          to={`/article/${article.slug}`}
                          className="header-news-marquee-link max-w-[min(280px,42vw)] shrink-0 truncate text-[#ff184e] underline-offset-2 hover:underline"
                        >
                          {article.title}
                        </Link>
                        <span
                          className="mx-4 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-900 ring-[0.5px] ring-neutral-900/20 dark:bg-black dark:ring-white/25"
                          aria-hidden
                        />
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div
                className="header-ticker-fade-right pointer-events-none absolute inset-y-0 right-0 z-[2] w-10 bg-gradient-to-l from-neutral-900/95 via-neutral-900/45 to-transparent dark:from-black/90 dark:via-black/55"
                aria-hidden
              />
            </div>
          </div>
          
          {/* Right section with tags and search */}
          <div className="flex items-center flex-shrink-0">
            {!isSearchOpen && (
              <div className="hidden lg:flex items-center mr-4">
                <span className="bg-[#ff184e]/20 border border-[#ff184e]/50 text-[#ff184e] px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase mr-3">Trending</span>
                <div className="flex space-x-3 text-sm font-medium text-gray-400">
                  <Link to="/tag/brave" className="hover:text-white transition-colors">#Mali</Link>
                  <Link to="/tag/business" className="hover:text-white transition-colors">#Afrique</Link>
                </div>
              </div>
            )}
            <div className="relative flex items-center justify-end w-full">
              <button 
                className="flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-gray-300 hover:text-white transition-all w-9 h-9 hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]" 
                onClick={toggleSearch}
              >
                <Search size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add overlay and search bar when isSearchOpen is true */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center bg-black/80 backdrop-blur-sm" 
            onClick={toggleSearch}
          >
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-3xl mx-4 mt-24 glass-panel border border-white/20 rounded-2xl flex items-center px-4 py-3 relative shadow-2xl" 
              onClick={e => e.stopPropagation()}
            >
              <Search className="text-gray-400 mr-3" size={24} />
              <input
                type="text"
                autoFocus
                placeholder="Rechercher des articles..."
                value={searchQuery}
                onChange={handleSearch}
                className="flex-1 bg-transparent border-none outline-none text-xl text-white placeholder-gray-500"
              />
              {isSearching && (
                <div className="mr-3">
                  <div className="w-5 h-5 border-2 border-[#ff184e]/20 border-t-[#ff184e] rounded-full animate-spin" />
                </div>
              )}
              <button className="text-gray-400 hover:text-[#ff184e] transition-colors p-2 bg-white/5 rounded-full hover:bg-white/10" onClick={toggleSearch}>
                <X size={20} />
              </button>
            </motion.div>
            
            {/* Search results */}
            <AnimatePresence>
              {searchQuery && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-3xl mx-4 mt-4 glass-panel border-white/10 rounded-xl shadow-2xl overflow-hidden" 
                  style={{ maxHeight: '60vh', overflowY: 'auto' }} 
                  onClick={e => e.stopPropagation()}
                >
                  {isSearching ? (
                    <div className="py-16 text-center text-gray-400">
                      <div className="w-12 h-12 border-4 border-[#ff184e]/20 border-t-[#ff184e] rounded-full animate-spin mx-auto mb-4" />
                      <p className="animate-pulse">{t("On fouille dans les archives…")}</p>
                    </div>
                  ) : searchResults.length ? (
                    <ul className="divide-y divide-white/10">
                      {searchResults.map((article, idx) => (
                        <motion.li
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          key={article.id}
                          className="flex items-center gap-4 py-3 px-4 cursor-pointer hover:bg-white/5 transition-colors"
                          onClick={() => {
                            toggleSearch();
                            navigate(`/article/${article.id}`);
                          }}
                        >
                          <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 bg-black/50">
                            <img src={optimiseSupabaseImageUrl(article.image || '/placeholder.svg', 'thumb')} alt={article.title} className="w-full h-full object-cover" decoding="async" onError={(e) => applyStorageImageFallback(e.currentTarget)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-gray-200 truncate">{article.title}</h3>
                            <p className="text-xs text-gray-400 truncate mt-1">{article.excerpt || article.category}</p>
                          </div>
                          <ChevronDown className="text-gray-600 -rotate-90 hidden sm:block" size={16} />
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    <div className="py-12 text-center text-gray-400">
                      <Search className="mx-auto mb-3 opacity-20" size={48} />
                      <p>Aucun article ne correspond à "{searchQuery}". Essayez un autre mot-clé ou une orthographe différente.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;