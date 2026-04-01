import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { ChevronRight } from 'lucide-react';

type ArticleRow = {
  id: string;
  slug: string;
  titre: string;
  image_url?: string | null;
  categorie?: string | null;
  date_publication?: string | null;
};

const SECTIONS: { key: string; title: string; load: () => Promise<{ data: ArticleRow[] | null }> }[] = [
  {
    key: 'editor',
    title: 'Les choix de la rédaction',
    load: () =>
      supabase
        .from('articles')
        .select('id, slug, titre, image_url, categorie, date_publication')
        .eq('statut', 'publie')
        .ilike('categorie', '%Actualit%')
        .order('date_publication', { ascending: false })
        .limit(8),
  },
  {
    key: 'travel',
    title: 'Carnets de voyage',
    load: () =>
      supabase
        .from('articles')
        .select('id, slug, titre, image_url, categorie, date_publication')
        .eq('statut', 'publie')
        .ilike('categorie', 'Voyage')
        .order('date_publication', { ascending: false })
        .limit(8),
  },
  {
    key: 'tech',
    title: 'Tech & innovation',
    load: () =>
      supabase
        .from('articles')
        .select('id, slug, titre, image_url, categorie, date_publication')
        .eq('statut', 'publie')
        .ilike('categorie', 'Technologie')
        .order('date_publication', { ascending: false })
        .limit(8),
  },
  {
    key: 'business',
    title: 'Économie & business',
    load: () =>
      supabase
        .from('articles')
        .select('id, slug, titre, image_url, categorie, date_publication')
        .eq('statut', 'publie')
        .eq('categorie', 'Business')
        .order('date_publication', { ascending: false })
        .limit(8),
  },
  {
    key: 'sport',
    title: 'Sport',
    load: () =>
      supabase
        .from('articles')
        .select('id, slug, titre, image_url, categorie, date_publication')
        .eq('statut', 'publie')
        .ilike('categorie', 'Sport%')
        .order('date_publication', { ascending: false })
        .limit(8),
  },
  {
    key: 'culture',
    title: 'Culture & divertissement',
    load: () =>
      supabase
        .from('articles')
        .select('id, slug, titre, image_url, categorie, date_publication')
        .eq('statut', 'publie')
        .ilike('categorie', 'Divertissement')
        .order('date_publication', { ascending: false })
        .limit(8),
  },
];

function MiniArticleCard({ article, onClick }: { article: ArticleRow; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-[200px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#161b26] text-left transition active:scale-[0.98]"
    >
      <div className="relative h-[110px] w-full bg-[#0a0d14]">
        <img
          src={article.image_url || '/placeholder.svg'}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        {article.categorie && (
          <span className="absolute left-2 top-2 max-w-[90%] truncate rounded bg-[#ff184e]/95 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
            {article.categorie}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-white">{article.titre}</h3>
        {article.date_publication && (
          <p className="mt-1.5 text-[11px] text-[#9ba5be]">
            {new Date(article.date_publication).toLocaleDateString('fr-FR')}
          </p>
        )}
      </div>
    </button>
  );
}

export default function MobileHomeThematicSections() {
  const navigate = useNavigate();
  const [data, setData] = useState<Record<string, ArticleRow[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const entries = await Promise.all(
        SECTIONS.map(async (s) => {
          const { data: rows, error } = await s.load();
          if (error) {
            console.error('[MobileHomeThematicSections]', s.key, error);
            return [s.key, [] as ArticleRow[]] as const;
          }
          return [s.key, (rows || []) as ArticleRow[]] as const;
        })
      );
      if (cancelled) return;
      const map: Record<string, ArticleRow[]> = {};
      for (const [k, v] of entries) map[k] = v;
      setData(map);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 px-4 py-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse space-y-3">
            <div className="h-6 w-40 rounded bg-white/10" />
            <div className="flex gap-3 overflow-hidden">
              <div className="h-40 w-[200px] shrink-0 rounded-2xl bg-white/5" />
              <div className="h-40 w-[200px] shrink-0 rounded-2xl bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-2">
      {SECTIONS.map((s) => {
        const rows = data[s.key] || [];
        if (rows.length === 0) return null;
        return (
          <section key={s.key} className="min-w-0">
            <div className="mb-3 flex items-center justify-between px-4">
              <h2 className="text-lg font-bold tracking-tight text-white">{s.title}</h2>
              <ChevronRight className="shrink-0 text-[#9ba5be]" size={20} aria-hidden />
            </div>
            <div className="flex gap-3 overflow-x-auto overflow-y-hidden px-4 pb-1 scrollbar-hide">
              {rows.map((article) => (
                <MiniArticleCard
                  key={article.id}
                  article={article}
                  onClick={() => navigate(`/mobile/article/${article.slug || article.id}`)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
