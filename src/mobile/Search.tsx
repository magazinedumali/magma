import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import MobileBottomNav from './MobileBottomNav';
import { applyStorageImageFallback, optimiseSupabaseImageUrl } from '@/lib/supabaseImageUrl';
import { useTheme } from '@/contexts/ThemeContext';
import { cn, escapeForIlike } from '@/lib/utils';

export default function MobileSearch() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [query, setQuery] = useState('');
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const getAuthorAvatar = (author: string, authorAvatar?: string) => {
    if (authorAvatar) return authorAvatar;
    return '/logo.png';
  };

  useEffect(() => {
    let cancelled = false;
    const q = query.trim();
    if (!q) {
      setArticles([]);
      return () => {
        cancelled = true;
      };
    }
    setLoading(true);
    const run = async () => {
      const safe = escapeForIlike(q.replace(/,/g, ' '));
      const pattern = `%${safe}%`;
      const orFilter = [
        `titre.ilike.${pattern}`,
        `categorie.ilike.${pattern}`,
        `meta_description.ilike.${pattern}`,
        `auteur.ilike.${pattern}`,
      ].join(',');
      const { data, error } = await supabase
        .from('articles')
        .select('id, titre, slug, image_url, categorie, auteur, date_publication')
        .eq('statut', 'publie')
        .or(orFilter)
        .order('date_publication', { ascending: false })
        .limit(20);
      if (cancelled) return;
      if (error) {
        console.error('[MobileSearch]', error);
        setArticles([]);
      } else {
        setArticles(data || []);
      }
      if (!cancelled) setLoading(false);
    };
    const t = setTimeout(run, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  return (
    <div
      className={cn(
        'flex min-h-screen flex-col pb-[calc(80px+env(safe-area-inset-bottom,0px))]',
        isDark ? 'bg-[#0a0d14] text-white' : 'bg-[#f3f4f6] text-[#111827]'
      )}
    >
      <header
        className={cn(
          'flex items-center gap-2 border-b px-4 pb-4 pt-[calc(env(safe-area-inset-top)+12px)]',
          isDark ? 'border-white/10 bg-[#0a0d14]' : 'border-black/10 bg-white'
        )}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className={cn(
            '-ml-1 flex shrink-0 items-center justify-center rounded-xl p-2.5 transition-colors',
            isDark
              ? 'text-[#ffffff] hover:bg-white/10 active:bg-white/[0.15]'
              : 'text-[#111827] hover:bg-black/[0.06] active:bg-black/[0.1]'
          )}
          aria-label="Retour"
        >
          <ArrowLeft size={24} strokeWidth={2.25} />
        </button>
        <input
          autoFocus
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un article…"
          className={cn(
            'min-w-0 flex-1 rounded-full border px-4 py-2.5 text-base outline-none transition-colors',
            isDark
              ? 'border-white/10 bg-[#161b26] text-[#ffffff] placeholder:text-[#9ba5be] focus:border-[#ff184e]/40'
              : 'border-black/10 bg-gray-100 text-[#111827] placeholder:text-[#6b7280] focus:border-[#ff184e]/60'
          )}
        />
      </header>

      <div className="flex-1 space-y-3 px-4 py-4">
        {loading && (
          <p
            className={cn(
              'mt-10 text-center text-sm',
              isDark ? 'text-[#9ba5be]' : 'text-[#6b7280]'
            )}
          >
            Chargement…
          </p>
        )}
        {query.trim() && !loading && articles.length === 0 && (
          <p
            className={cn(
              'mt-10 text-center text-sm',
              isDark ? 'text-[#9ba5be]' : 'text-[#6b7280]'
            )}
          >
            Aucun résultat
          </p>
        )}
        {articles.map((article) => (
          <button
            key={article.id}
            type="button"
            className={cn(
              'flex w-full overflow-hidden rounded-2xl border text-left transition-colors',
              isDark
                ? 'border-white/10 bg-[#161b26] hover:bg-white/[0.04]'
                : 'border-black/10 bg-white shadow-sm hover:bg-gray-50'
            )}
            onClick={() => navigate(`/mobile/article/${article.slug || article.id}`)}
          >
            <img
              src={optimiseSupabaseImageUrl(article.image_url || '/placeholder.svg', 'thumb')}
              alt=""
              className="h-28 w-28 shrink-0 object-cover"
              onError={(e) => applyStorageImageFallback(e.currentTarget)}
              loading="lazy"
            />
            <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
              <div>
                <h3
                  className={cn(
                    'mb-1 line-clamp-2 text-base font-bold leading-tight',
                    isDark ? 'text-[#ffffff]' : 'text-[#111827]'
                  )}
                >
                  {article.titre}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <img
                    src={getAuthorAvatar(article.auteur)}
                    alt=""
                    className="h-5 w-5 rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = '/logo.png';
                    }}
                  />
                  <span
                    className={cn(
                      'text-xs font-medium',
                      isDark ? 'text-[#9ba5be]' : 'text-[#6b7280]'
                    )}
                  >
                    {article.auteur}
                  </span>
                  <span className="rounded-full border border-[#ff184e]/40 px-2 py-0.5 text-xs font-semibold text-[#ff184e]">
                    {article.categorie}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex justify-end">
                <Bookmark
                  size={18}
                  className={isDark ? 'text-[#9ba5be]' : 'text-[#9ca3af]'}
                />
              </div>
            </div>
          </button>
        ))}
      </div>

      <MobileBottomNav user={user} />
    </div>
  );
}
