import React, { useState, useEffect, memo, useRef, useMemo } from 'react';
import { Bell, Bookmark, Search, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

import { useCategories } from '@/hooks/useCategories';
import { useNavigate } from 'react-router-dom';
import Banner from '@/components/Banner';
import Poll from '@/components/Poll';
import HeroSlider from '@/components/hero/HeroSlider';
import PublishedVideoSection from '@/components/PublishedVideoSection';
import Stories from './Stories';
import MobileBottomNav from './MobileBottomNav';
import MobileGlassPlayer from './MobileGlassPlayer';
import MobileHomeThematicSections from './MobileHomeThematicSections';
import { optimiseSupabaseImageUrl } from '@/lib/supabaseImageUrl';

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
}: {
  title: string;
  image: string;
  author: string;
  category: string;
  onClick: () => void;
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
        className="h-[100px] w-[100px] shrink-0 rounded-[20px] bg-[#161b26] object-cover"
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
          <h3 className="line-clamp-2 text-[16px] font-bold leading-[22px] text-white">{title}</h3>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[12px] font-medium text-[#9ba5be]">{author} • 2h</span>
          <span className="text-[#9ba5be]">
            <Bookmark size={18} />
          </span>
        </div>
      </div>
    </div>
  );
});

const batchSize = 10;

export default function MobileHome() {
  const { categories: siteCategories } = useCategories();
  const mobileTabs = useMemo(() => buildMobileTabs(siteCategories), [siteCategories]);

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
      .select('id, slug, titre, image_url, categorie, auteur, date_publication, excerpt, statut')
      .eq('statut', 'publie')
      .order('date_publication', { ascending: false });
    if (t !== 'latest') q = q.eq('categorie', t);
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
          setArticles(rows.length > 3 ? rows.slice(3) : []);
        } else {
          setHeroArticle(rows[0]);
          setArticles(rows.slice(1));
        }
      } else {
        setHeroArticle(null);
        setArticles([]);
      }
      setHasMore(rows.length === batchSize);
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
            setArticles((prev) => [...prev, ...rows]);
            nextOffsetRef.current = from + rows.length;
            setHasMore(rows.length === batchSize);
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
    <div className="flex min-h-screen flex-col bg-[#0a0d14] transition-colors duration-300">
      <header className="z-10 flex items-center justify-between bg-[#0a0d14] px-4 pb-4 pt-[calc(env(safe-area-inset-top)+10px)]">
        <div>
          <p className="text-sm text-[#9ba5be]">Bonjour,</p>
          <h1 className="mt-0.5 text-[20px] font-extrabold tracking-tight text-white">
            Le Magazine du Mali
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#161b26]"
            aria-label="Rechercher"
            onClick={() => navigate('/mobile/search')}
          >
            <Search size={20} className="text-white" />
          </button>
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#161b26]"
            aria-label="Notifications"
          >
            <Bell size={20} className="text-white" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-[#161b26] bg-[#ff184e]" />
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
            className={`whitespace-nowrap rounded-[25px] border px-5 py-2.5 text-[14px] font-bold transition-all ${
              tab === t.value
                ? 'border-[#ff184e] bg-[#ff184e] text-white'
                : 'border-white/10 bg-[#161b26] text-[#9ba5be]'
            }`}
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
          <div className="flex h-[220px] items-center justify-center rounded-3xl border border-white/10 bg-[#161b26]">
            <p className="text-sm text-[#9ba5be]">Chargement de l’actualité…</p>
          </div>
        ) : heroArticle ? (
          <button
            type="button"
            className="relative block h-[220px] w-full overflow-hidden rounded-3xl bg-[#161b26] text-left"
            onClick={() => goArticle(heroArticle)}
          >
            <img
              src={optimiseSupabaseImageUrl(heroArticle.image_url || '/placeholder.svg', 'hero')}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
              <div className="mb-2 inline-flex items-center gap-1 rounded bg-[#ff184e] px-2 py-1">
                <TrendingUp size={12} className="text-white" />
                <span className="text-[10px] font-extrabold tracking-wide text-white">À LA UNE</span>
              </div>
              <h2 className="line-clamp-2 text-[22px] font-bold leading-7 text-white">
                {heroArticle.titre}
              </h2>
              <div className="mt-2 flex items-center gap-2 text-xs text-white/80">
                <span className="font-semibold">{heroArticle.auteur}</span>
                <span>•</span>
                <span>5 min de lecture</span>
              </div>
            </div>
          </button>
        ) : (
          <div className="flex h-[140px] items-center justify-center rounded-3xl border border-dashed border-white/15 bg-[#161b26]/50 px-4 text-center text-sm text-[#9ba5be]">
            Aucun article dans cette rubrique pour le moment.
          </div>
        )}
      </div>

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

      {/* Stories / sujets brûlants — visible même si vide */}
      <section className="mb-2 mt-10 px-0 pb-2 pt-2">
        <div className="mb-4 flex items-center justify-between px-4">
          <h2 className="text-[20px] font-extrabold tracking-tight text-white">Sujets brûlants</h2>
        </div>
        <Stories />
      </section>

      <div className="px-4 mb-5 mt-6">
        <Banner position="accueil" width={400} height={80} />
      </div>

      {tab === 'latest' && (
        <section className="mb-8 px-4">
          <div className="rounded-2xl border border-white/10 bg-[#161b26] p-4">
            <h2 className="mb-3 text-base font-bold text-white">Votre avis nous intéresse</h2>
            <Poll compact />
          </div>
        </section>
      )}

      {/* Actualités récentes = suite du même flux que la une */}
      <div className="mb-[15px] mt-2 flex items-center justify-between px-4">
        <h2 className="text-[18px] font-bold text-white">Actualités récentes</h2>
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
            <span className="text-[16px] text-[#9ba5be]">Aucun article pour le moment</span>
          </div>
        ) : (
          <>
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                title={article.titre}
                image={article.image_url}
                author={article.auteur}
                category={article.categorie}
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

      <MobileGlassPlayer />
      <MobileBottomNav user={user} />
    </div>
  );
}
