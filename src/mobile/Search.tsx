import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import MobileBottomNav from './MobileBottomNav';
import { applyStorageImageFallback, optimiseSupabaseImageUrl } from '@/lib/supabaseImageUrl';

function escapeForIlike(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

export default function MobileSearch() {
  const navigate = useNavigate();
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
    <div className="flex min-h-screen flex-col bg-[#0a0d14] pb-[calc(80px+env(safe-area-inset-bottom,0px))] text-white">
      <header className="flex items-center gap-2 border-b border-white/10 px-4 pb-4 pt-[calc(env(safe-area-inset-top)+12px)]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#161b26]"
          aria-label="Retour"
        >
          <ArrowLeft size={22} className="text-white" />
        </button>
        <input
          autoFocus
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un article…"
          className="flex-1 rounded-full border border-white/10 bg-[#161b26] px-4 py-2.5 text-base text-white outline-none placeholder:text-[#9ba5be] focus:border-[#ff184e]/40"
        />
      </header>

      <div className="flex-1 space-y-3 px-4 py-4">
        {loading && <p className="mt-10 text-center text-sm text-[#9ba5be]">Chargement…</p>}
        {query.trim() && !loading && articles.length === 0 && (
          <p className="mt-10 text-center text-sm text-[#9ba5be]">Aucun résultat</p>
        )}
        {articles.map((article) => (
          <button
            key={article.id}
            type="button"
            className="flex w-full overflow-hidden rounded-2xl border border-white/10 bg-[#161b26] text-left"
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
                <h3 className="mb-1 line-clamp-2 text-base font-bold leading-tight text-white">{article.titre}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <img
                    src={getAuthorAvatar(article.auteur)}
                    alt=""
                    className="h-5 w-5 rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = '/logo.png';
                    }}
                  />
                  <span className="text-xs font-medium text-[#9ba5be]">{article.auteur}</span>
                  <span className="rounded-full border border-[#ff184e]/40 px-2 py-0.5 text-xs font-semibold text-[#ff184e]">
                    {article.categorie}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex justify-end">
                <Bookmark size={18} className="text-[#9ba5be]" />
              </div>
            </div>
          </button>
        ))}
      </div>

      <MobileBottomNav user={user} />
    </div>
  );
}
