import React, { useState, useEffect, memo, useRef, useMemo } from 'react';
import { Bookmark, Moon, Search, Sun, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

import { useCategories } from '@/hooks/useCategories';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { cn, escapeForIlike, ARTICLES_PUBLISHED_OR_FILTER } from '@/lib/utils';
import Banner from '@/components/Banner';
import HeroSlider from '@/components/hero/HeroSlider';
import PublishedVideoSection from '@/components/PublishedVideoSection';
import Stories from './Stories';
import MobileBottomNav from './MobileBottomNav';
import MobileGlassPlayer from './MobileGlassPlayer';
import MobileHomeThematicSections from './MobileHomeThematicSections';
import { applyStorageImageFallback, optimiseSupabaseImageUrl } from '@/lib/supabaseImageUrl';

function buildMobileTabs(siteCategories: { name: string }[]) {
  const fallback = [
    { label: 'Dernières', value: 'latest' },
    { label: 'Politique', value: 'Politique' },
    { label: 'Sport', value: 'Sport' },
    { label: 'Culture', value: 'Culture' },
    { label: 'Économie', value: 'Économie' },
  ];
  const seen = new Set<string>();
  const out: { label: string; value: string }[] = [];
  for (const t of fallback) {
    if (!seen.has(t.value)) {
      seen.add(t.value);
      out.push(t);
    }
  }
  for (const cat of siteCategories) {
    if (!seen.has(cat.name)) {
      seen.add(cat.name);
      out.push({ label: cat.name, value: cat.name });
    }
  }
  return out;
}

const ArticleCard = memo(function ArticleCard({
  title,
  image,
  author,
  category,
  onClick,
  isDark = true,
}: {
  title: string;
  image: string;
  author: string;
  category: string;
  onClick: () => void;
  isDark?: boolean;
}) {
  return (
    <div
      className="mb-[18px] flex cursor-pointer flex-row gap-4 px-4"
      onClick={() => onClick()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <img
        src={image}
        alt=""
        className={cn(
          'h-[100px] w-[100px] shrink-0 rounded-[20px] object-cover',
          isDark ? 'bg-[#161b26]' : 'bg-gray-200'
        )}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = '/placeholder.svg';
        }}
      />
      <div className="flex flex-1 flex-col justify-between py-1">
        <div>
          <span className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-[#ff184e]">
            {category}
          </span>
          <h3
            className={cn(
              'line-clamp-2 text-[16px] font-bold leading-[22px]',
              isDark ? 'text-[#ffffff]' : 'text-[#111827]'
            )}
          >
            {title}
          </h3>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span
            className={cn('text-[12px] font-medium', isDark ? 'text-[#9ba5be]' : 'text-[#6b7280]')}
          >
            {author} • 2h
          </span>
          <span className={isDark ? 'text-[#9ba5be]' : 'text-[#9ca3af]'}>
            <Bookmark size={18} />
          </span>
        </div>
      </div>
    </div>
  );
});

const batchSize = 10;

/** Nombre max d’articles dans « Actualités récentes » (après le carrousel) sur l’onglet Dernières. */
const MAX_RECENT_ARTICLES = 20;

export default function MobileHome() {
  const { categories: siteCategories } = useCategories();
  const mobileTabs = useMemo(() => buildMobileTabs(siteCategories), [siteCategories]);
  const { isDark, toggleTheme } = useTheme();

  const [tab, setTab] = useState('latest');
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  const [heroArticle, setHeroArticle] = useState<any | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const nextOffsetRef = useRef(0);
  const scrollLockRef = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const articleQuery = (t: string) => {
    let q = supabase
      .from('articles')
      .select('id, slug, titre, image_url, categorie, auteur, date_publication, statut')
      .or(ARTICLES_PUBLISHED_OR_FILTER)
      .order('date_publication', { ascending: false });
    if (t !== 'latest') {
      const safe = escapeForIlike(t.trim());
      if (safe.length) q = q.ilike('categorie', `%${safe}%`);
    }
    return q;
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingInitial(true);
      setHeroArticle(null);
      setArticles([]);
      nextOffsetRef.current = 0;
      scrollLockRef.current = false;

      const res = await articleQuery(tab).range(0, batchSize - 1);
      if (cancelled) return;

      if (res.error) {
        console.error('[mobile/Index] articles:', res.error);
        setHeroArticle(null);
        setArticles([]);
        setHasMore(false);
        setLoadingInitial(false);
        return;
      }

      const rows = res.data || [];
      nextOffsetRef.current = rows.length;

      if (rows.length > 0) {
        if (tab === 'latest') {
          setHeroArticle(null);
          const listRaw = rows.length > 3 ? rows.slice(3) : [];
          const capped = listRaw.slice(0, MAX_RECENT_ARTICLES);
          setArticles(capped);
          setHasMore(
            rows.length === batchSize && capped.length < MAX_RECENT_ARTICLES
          );
        } else {
          setHeroArticle(rows[0]);
          setArticles(rows.slice(1));
          setHasMore(rows.length === batchSize);
        }
      } else {
        setHeroArticle(null);
        setArticles([]);
        setHasMore(false);
      }
      setLoadingInitial(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [tab]);

  useEffect(() => {
    const onScroll = () => {
      if (loadingInitial || !hasMore || scrollLockRef.current) return;
      if (window.innerHeight + window.scrollY < document.documentElement.scrollHeight - 220) return;
      scrollLockRef.current = true;
      setLoadingMore(true);
      void (async () => {
        try {
          const from = nextOffsetRef.current;
          const to = from + batchSize - 1;
          const res = await articleQuery(tab).range(from, to);
          const rows = res.data || [];
          if (res.error) {
            console.error('[mobile/Index] load more:', res.error);
          } else if (rows.length) {
            let merged: any[] = [];
            setArticles((prev) => {
              merged =
                tab === 'latest'
                  ? [...prev, ...rows].slice(0, MAX_RECENT_ARTICLES)
                  : [...prev, ...rows];
              return merged;
            });
            nextOffsetRef.current = from + rows.length;
            if (tab === 'latest') {
              setHasMore(
                merged.length < MAX_RECENT_ARTICLES && rows.length === batchSize
              );
            } else {
              setHasMore(rows.length === batchSize);
            }
          } else {
            setHasMore(false);
          }
        } finally {
          scrollLockRef.current = false;
          setLoadingMore(false);
        }
      })();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [loadingInitial, hasMore, tab]);

  const goArticle = (a: { slug?: string; id?: string }) => {
    navigate(`/mobile/article/${a.slug || a.id}`);
  };

  return (
    <div
      className={cn(
        'flex min-h-screen flex-col transition-colors duration-300',
        isDark ? 'bg-[#0a0d14]' : 'bg-[#f3f4f6]'
      )}
    >
      <header
        className={cn(
          'z-10 flex items-center justify-between px-4 pb-4 pt-[calc(env(safe-area-inset-top)+10px)]',
          isDark ? 'bg-[#0a0d14]' : 'bg-[#f3f4f6]'
        )}
      >
        <div className="min-w-0 pr-2">
          <p className={cn('text-xs', isDark ? 'text-[#9ba5be]' : 'text-[#6b7280]')}>Bonjour,</p>
          <h1
            className={cn(
              'mt-0.5 text-[15px] font-bold leading-snug tracking-tight sm:text-[16px]',
              isDark ? 'text-white' : 'text-[#111827]'
            )}
          >
            Le Magazine du Mali
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full border transition-colors',
              isDark
                ? 'border-white/10 bg-[#161b26] text-white'
                : 'border-black/10 bg-white text-[#111827] shadow-sm'
            )}
            aria-label="Rechercher"
            onClick={() => navigate('/mobile/search')}
          >
            <Search size={20} />
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full border transition-colors',
              isDark
                ? 'border-white/10 bg-[#161b26] text-amber-300'
                : 'border-black/10 bg-white text-slate-600 shadow-sm'
            )}
            aria-label={isDark ? 'Activer le thème clair' : 'Activer le thème sombre'}
          >
            {isDark ? <Sun size={20} strokeWidth={2} /> : <Moon size={20} strokeWidth={2} />}
          </button>
        </div>
      </header>

      {/* Rubriques — comme HomeScreen RN (avant la une) */}
      <nav className="scrollbar-hide my-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {mobileTabs.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={cn(
              'whitespace-nowrap rounded-[25px] border px-5 py-2.5 text-[14px] font-bold transition-all',
              tab === t.value
                ? 'border-[#ff184e] bg-[#ff184e] text-[#ffffff]'
                : isDark
                  ? 'border-white/10 bg-[#161b26] text-[#9ba5be]'
                  : 'border-black/10 bg-white text-[#6b7280] shadow-sm'
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* À la une : carrousel (même flux que le site) pour « Dernières », sinon une carte par rubrique */}
      <div className="mx-4 mt-1">
        {tab === 'latest' ? (
          <HeroSlider articleBasePath="/mobile/article" compact />
        ) : loadingInitial && !heroArticle ? (
          <div
            className={cn(
              'flex h-[220px] items-center justify-center rounded-3xl border',
              isDark ? 'border-white/10 bg-[#161b26]' : 'border-black/10 bg-white shadow-sm'
            )}
          >
            <p className={cn('text-sm', isDark ? 'text-[#9ba5be]' : 'text-[#6b7280]')}>
              Chargement de l’actualité…
            </p>
          </div>
        ) : heroArticle ? (
          <button
            type="button"
            className={cn(
              'relative block h-[220px] w-full overflow-hidden rounded-3xl text-left',
              isDark ? 'bg-[#161b26]' : 'bg-gray-200'
            )}
            onClick={() => goArticle(heroArticle)}
          >
            <img
              src={optimiseSupabaseImageUrl(heroArticle.image_url || '/placeholder.svg', 'hero')}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => applyStorageImageFallback(e.currentTarget)}
              loading="eager"
              decoding="async"
              fetchpriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/20" />
            <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
              <div className="mb-2 inline-flex items-center gap-1 rounded bg-[#ff184e] px-2 py-1">
                <TrendingUp size={12} className="text-[#ffffff]" />
                <span className="text-[10px] font-extrabold tracking-wide text-[#ffffff]">À LA UNE</span>
              </div>
              <h2 className="line-clamp-2 text-[22px] font-bold leading-7 text-[#ffffff] drop-shadow-sm">
                {heroArticle.titre}
              </h2>
              <div className="mt-2 flex items-center gap-2 text-xs text-[rgba(255,255,255,0.88)]">
                <span className="font-semibold">{heroArticle.auteur}</span>
                <span>•</span>
                <span>5 min de lecture</span>
              </div>
            </div>
          </button>
        ) : (
          <div
            className={cn(
              'flex h-[140px] items-center justify-center rounded-3xl border border-dashed px-4 text-center text-sm',
              isDark
                ? 'border-white/15 bg-[#161b26]/50 text-[#9ba5be]'
                : 'border-black/15 bg-white/80 text-[#6b7280]'
            )}
          >
            Aucun article dans cette rubrique pour le moment.
          </div>
        )}
      </div>

      {/* Rubrique : liste compacte directement sous le premier article (pas après Stories / bannière) */}
      {tab !== 'latest' && heroArticle && (
        <section className="mt-5 px-0 pb-2">
          <div className="mb-3 px-4">
            <h2
              className={cn(
                'text-[18px] font-bold tracking-tight',
                isDark ? 'text-[#ffffff]' : 'text-[#111827]'
              )}
            >
              Suite dans cette rubrique
            </h2>
          </div>
          {loadingInitial && articles.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-[#ff184e]">Chargement…</div>
          ) : articles.length === 0 ? (
            <p
              className={cn(
                'px-4 py-4 text-center text-sm',
                isDark ? 'text-[#9ba5be]' : 'text-[#6b7280]'
              )}
            >
              Aucun autre article pour le moment.
            </p>
          ) : (
            <>
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  title={article.titre}
                  image={optimiseSupabaseImageUrl(article.image_url || '/placeholder.svg', 'thumb')}
                  author={article.auteur}
                  category={article.categorie}
                  isDark={isDark}
                  onClick={() => goArticle(article)}
                />
              ))}
              {(loadingMore || (loadingInitial && articles.length > 0)) && (
                <div className="flex justify-center py-4">
                  <span className="text-sm text-[#ff184e]">Chargement…</span>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* Sujets brûlants : uniquement accueil « Dernières », pas sur les onglets rubrique */}
      {tab === 'latest' && (
        <section className="mb-2 mt-8 px-0 pb-2 pt-2">
          <div className="mb-4 flex items-center justify-between px-4">
            <h2
              className={cn(
                'text-[20px] font-extrabold tracking-tight',
                isDark ? 'text-[#ffffff]' : 'text-[#111827]'
              )}
            >
              Sujets brûlants
            </h2>
          </div>
          <Stories />
        </section>
      )}

      {/* Sections thématiques (alignées sur la page d’accueil web) */}
      {tab === 'latest' && (
        <div className="mt-10">
          <MobileHomeThematicSections />
        </div>
      )}

      {tab === 'latest' && (
        <div className="mt-8">
          <PublishedVideoSection />
        </div>
      )}

      <div className="px-4 mb-5 mt-6">
        <Banner position="accueil" width={400} height={80} />
      </div>

      {/* Actualités récentes = flux « Dernières » uniquement (les rubriques listent au-dessus) */}
      {tab === 'latest' && (
        <>
          <div className="mb-[15px] mt-2 flex items-center justify-between px-4">
            <h2 className={cn('text-[18px] font-bold', isDark ? 'text-[#ffffff]' : 'text-[#111827]')}>
              Actualités récentes
            </h2>
            <button
              type="button"
              className="text-sm font-semibold text-[#ff184e]"
              onClick={() => navigate('/mobile/search')}
            >
              Voir tout
            </button>
          </div>

          <div className="flex-1 pb-[calc(200px+env(safe-area-inset-bottom,0px))]">
            {!loadingInitial && articles.length === 0 && !heroArticle ? (
              <div className="flex flex-col items-center justify-center py-10 opacity-60">
                <span
                  className={cn('text-[16px]', isDark ? 'text-[#9ba5be]' : 'text-[#6b7280]')}
                >
                  Aucun article pour le moment
                </span>
              </div>
            ) : (
              <>
                {articles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    title={article.titre}
                    image={optimiseSupabaseImageUrl(article.image_url || '/placeholder.svg', 'thumb')}
                    author={article.auteur}
                    category={article.categorie}
                    isDark={isDark}
                    onClick={() => goArticle(article)}
                  />
                ))}
                {(loadingMore || (loadingInitial && articles.length > 0)) && (
                  <div className="flex justify-center py-4">
                    <span className="text-sm text-[#ff184e]">Chargement…</span>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {tab !== 'latest' && (
        <div className="flex-1 pb-[calc(200px+env(safe-area-inset-bottom,0px))]" aria-hidden />
      )}

      <MobileGlassPlayer />
      <MobileBottomNav user={user} />
    </div>
  );
}
