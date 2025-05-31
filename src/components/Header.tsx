import React, { useState, useEffect } from 'react';
import { Search, Menu, X, Bell, ChevronDown, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
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
import MainNavigation from './header/MainNavigation';
import HeaderLogo from './header/HeaderLogo';

export const categories = [
  { name: 'Actualités', path: '/category/actualites' },
  { name: 'International', path: '/category/international' },
  { name: 'Économie', path: '/category/business' },
  { name: 'Éducation', path: '/category/education' },
  { name: 'Société', path: '/category/societe' },
  { name: 'Santé', path: '/category/sante' },
  { name: 'Sport', path: '/category/sport' },
  { name: 'Mode', path: '/category/fashion' },
  { name: 'Alimentation', path: '/category/food' },
  { name: 'Art de vivre', path: '/category/lifestyle' },
  { name: 'Politique', path: '/category/politics' },
  { name: 'Actualité Tech', path: '/category/tech' },
  { name: 'Voyage', path: '/category/travel' },
  { name: 'Divertissement', path: '/category/entertainment' },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentArticleTitle, setCurrentArticleTitle] = useState("");
  const [showTitle, setShowTitle] = useState(true);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const { t, i18n } = useTranslation();
  
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      setLoadingRecent(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('statut', 'publie')
        .order('date_publication', { ascending: false })
        .limit(10);
      setRecentArticles(data || []);
      setLoadingRecent(false);
    }
    fetchArticles();
  }, []);

  const mappedArticles = (recentArticles || []).map((a: any) => ({
    id: a.id,
    slug: a.slug || a.id,
    title: a.titre ?? a.title ?? '',
    excerpt: a.meta_description ?? a.excerpt ?? '',
    image: a.image_url ?? a.image ?? '',
    category: a.categorie ?? a.category ?? '',
    date: a.date_publication ?? a.date ?? '',
    author: a.auteur ?? a.author ?? '',
  }));

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

  // Render dropdown content for category menu
  const renderCategoryDropdown = () => (
    <div className="p-4 grid grid-cols-3 gap-4 min-w-[600px]">
      {categories.map((category) => (
        <Link 
          key={category.name} 
          to={category.path}
          className="block p-2 hover:bg-gray-100 hover:text-news-red transition-colors"
        >
          {t(category.name)}
        </Link>
      ))}
    </div>
  );

  useEffect(() => {
    if (!isSearchOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleSearch();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  // Add state for search query and results
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Instant search handler
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim()) {
      const filtered = mappedArticles.filter(article =>
        article.title.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <header className="bg-white shadow-sm">
      {/* Main header (not fixed) */}
      <div className="w-full bg-white shadow-sm">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center mb-8">
          <div className="flex items-center">
            <button 
              className="md:hidden text-news-dark mr-3"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <HeaderLogo />
          </div>
          
          {/* Main Navigation - Desktop */}
          <div className="hidden md:block">
            <MainNavigation />
          </div>
          
          {/* Language Switcher */}
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center text-sm px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-[#ff184e] bg-white">
                  <img src="https://flagcdn.com/w20/fr.png" alt="Français" className="h-4 mr-2" />
                  {i18n.language === 'fr' ? 'Français' : 'English'}
                  <ChevronDown size={16} className="ml-2" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-white">
                <DropdownMenuItem onClick={() => i18n.changeLanguage('fr')} className="flex items-center cursor-pointer">
                  <img src="https://flagcdn.com/w20/fr.png" alt="Français" className="h-4 mr-2" />
                  Français
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => i18n.changeLanguage('en')} className="flex items-center cursor-pointer">
                  <img src="https://flagcdn.com/w20/us.png" alt="English" className="h-4 mr-2" />
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Right section with language, login and notifications */}
          <div className="flex items-center space-x-4">
            {/* Afficher le menu utilisateur si connecté, sinon le bouton Connexion */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-100 transition">
                    {user.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="avatar" className="w-8 h-8 rounded-full" />
                    ) : (
                      <UserCircle size={32} className="text-gray-400" />
                    )}
                    <span className="font-medium text-sm text-gray-700">{user.user_metadata?.name || user.email}</span>
                    <ChevronDown size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="block w-full text-left px-4 py-2 hover:bg-gray-100">Mon profil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
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
              variant="destructive" 
              className="hidden md:flex text-white bg-[#ff184e] hover:bg-red-700"
              size="sm"
            >
                  Connexion
            </Button>
              </Link>
            )}
            
            <Button
              variant="ghost" 
              size="icon"
              className="relative"
            >
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-[#ff184e] text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                2
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-b">
          <div className="container mx-auto px-4">
            <ul className="flex flex-col space-y-2 py-4 text-sm font-medium">
              {categories.map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.path} 
                    className="nav-link block py-1 flex items-center"
                  >
                    {t(item.name)}
                  </Link>
                </li>
              ))}
              
              <li className="mt-4">
                <span className="font-bold block mb-2">Categories</span>
                <ul className="pl-4 space-y-1">
                  {categories.map((category) => (
                    <li key={category.name}>
                      <Link 
                        to={category.path} 
                        className="block py-1 hover:text-[#ff184e]"
                      >
                        {t(category.name)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              
              <li>
                <Link to="/login">
                <Button 
                  variant="destructive" 
                  className="w-full mt-4 text-white bg-[#ff184e] hover:bg-red-700"
                  size="sm"
                >
                    Connexion
                </Button>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Category Browse Section */}
      <div className="border-t border-gray-200 py-1">
        <div className="container mx-auto px-4 flex items-center gap-4 min-h-0" style={{height: 'auto'}}>
          <div className="flex items-center flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center cursor-pointer">
                  <Menu size={18} className="mr-2" />
                  <span className="font-medium mr-2">Sujets</span>
                  <ChevronDown size={16} />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white p-4 shadow-lg rounded-md w-60">
                <div className="grid gap-4">
                  <Link to="/category/business" className="flex items-center hover:text-[#ff184e]">
                    <div className="w-6 h-6 mr-3 text-gray-500">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                        <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z"></path>
                      </svg>
                    </div>
                    <span>{t('Économie')}</span>
                  </Link>
                  
                  <Link to="/category/fashion" className="flex items-center hover:text-[#ff184e]">
                    <div className="w-6 h-6 mr-3 text-gray-500">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 19h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1z"></path>
                        <path d="M4 5V3h16v2"></path>
                        <path d="M12 17V9"></path>
                        <path d="M8 13h8"></path>
                      </svg>
                    </div>
                    <span>{t('Mode')}</span>
                  </Link>
                  
                  <Link to="/category/food" className="flex items-center hover:text-[#ff184e]">
                    <div className="w-6 h-6 mr-3 text-gray-500">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                        <path d="M6 1v3"></path>
                        <path d="M10 1v3"></path>
                        <path d="M14 1v3"></path>
                      </svg>
                    </div>
                    <span>{t('Alimentation')}</span>
                  </Link>
                  
                  <Link to="/category/lifestyle" className="flex items-center hover:text-[#ff184e]">
                    <div className="w-6 h-6 mr-3 text-gray-500">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                      </svg>
                    </div>
                    <span>{t('Art de vivre')}</span>
                  </Link>
                  
                  <Link to="/category/politics" className="flex items-center hover:text-[#ff184e]">
                    <div className="w-6 h-6 mr-3 text-gray-500">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 20h.01"></path>
                        <path d="M7 20v-4"></path>
                        <path d="M12 20v-8"></path>
                        <path d="M17 20V8"></path>
                        <path d="M22 4v16"></path>
                      </svg>
                    </div>
                    <span>{t('Politique')}</span>
                  </Link>
                  
                  <Link to="/category/sports" className="flex items-center hover:text-[#ff184e]">
                    <div className="w-6 h-6 mr-3 text-gray-500">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 8v8"></path>
                        <path d="M8 12h8"></path>
                      </svg>
                    </div>
                    <span>{t('Sport')}</span>
                  </Link>
                  
                  <Link to="/category/tech" className="flex items-center hover:text-[#ff184e]">
                    <div className="w-6 h-6 mr-3 text-gray-500">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                        <rect x="9" y="9" width="6" height="6"></rect>
                        <line x1="9" y1="2" x2="9" y2="4"></line>
                        <line x1="15" y1="2" x2="15" y2="4"></line>
                        <line x1="9" y1="20" x2="9" y2="22"></line>
                        <line x1="15" y1="20" x2="15" y2="22"></line>
                        <line x1="20" y1="9" x2="22" y2="9"></line>
                        <line x1="20" y1="14" x2="22" y2="14"></line>
                        <line x1="2" y1="9" x2="4" y2="9"></line>
                        <line x1="2" y1="14" x2="4" y2="14"></line>
                      </svg>
                    </div>
                    <span>{t('Actualité Tech')}</span>
                  </Link>
                  
                  <Link to="/category/travel" className="flex items-center hover:text-[#ff184e]">
                    <div className="w-6 h-6 mr-3 text-gray-500">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="11" r="3"></circle>
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      </svg>
                    </div>
                    <span>{t('Voyage')}</span>
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Sliding Article Titles dynamique et cliquable */}
          <div className="hidden md:flex flex-1 items-center justify-center max-w-[700px]">
            <div className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 flex items-center overflow-hidden min-w-0" style={{height: '38px'}}>
              <div
                className="whitespace-nowrap animate-marquee text-sm font-roboto font-medium text-black flex items-center h-8"
                style={{ display: 'inline-block', minWidth: '100%' }}
              >
                {loadingRecent ? (
                  <span className="mx-4 text-gray-400">Chargement...</span>
                ) : (
                  mappedArticles.concat(mappedArticles).map((article, idx) => (
                    <span key={idx} className="mx-4 inline-flex items-center">
                      <span className="w-2 h-2 rounded-full bg-[#ff184e] inline-block mr-2"></span>
                      <Link to={`/article/${article.slug}`} className="hover:underline font-semibold" style={{maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                        {article.title.length > 32 ? article.title.slice(0, 29) + '...' : article.title}
                      </Link>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
          
          {/* Right section with tags and search */}
          <div className="flex items-center flex-shrink-0 ml-4" style={{ marginLeft: '13rem' }}>
            {!isSearchOpen && (
              <div className="hidden md:flex items-center mr-4">
                <span className="bg-[#ff184e] text-white px-2 py-1 rounded-sm text-xs font-bold mr-2"># Mots-clés</span>
                <div className="flex space-x-2 text-sm">
                  <Link to="/tag/brave" className="hover:text-[#ff184e]">Courageux</Link> • 
                  <Link to="/tag/business" className="hover:text-[#ff184e] ml-1">Économie</Link>
                </div>
              </div>
            )}
            <div className="relative flex items-center">
              <button className="ml-2 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-100 transition-colors w-12 h-12" onClick={toggleSearch}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add overlay and search bar when isSearchOpen is true */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center bg-black bg-opacity-70" onClick={toggleSearch}>
          <div className="w-full max-w-4xl mx-4 mt-20 bg-white rounded-full flex items-center px-4 py-2 relative" onClick={e => e.stopPropagation()}>
            <input
              type="text"
              autoFocus
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={handleSearch}
              className="flex-1 bg-transparent outline-none text-lg px-2"
            />
            <button className="ml-2 text-gray-500 hover:text-[#ff184e]" onClick={toggleSearch}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
          </div>
          {/* Search results with images and titles */}
          {searchQuery && (
            <div className="w-full max-w-4xl mx-4 bg-white rounded-lg shadow mt-2 p-4" style={{ maxHeight: '320px', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
              {searchResults.length ? (
                <ul>
                  {searchResults.map((article, idx) => (
                    <li
                      key={article.id}
                      className="flex items-center gap-4 py-2 border-b last:border-b-0 cursor-pointer hover:bg-gray-100 rounded"
                      onClick={() => navigate(`/article/${article.id}`)}
                    >
                      <img src={article.image} alt={article.title} className="w-20 h-20 object-cover" />
                      <div>
                        <h3 className="text-sm font-medium leading-6 text-gray-900">{article.title}</h3>
                        <p className="text-sm leading-6 text-gray-500">{article.summary}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No results found.</p>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;