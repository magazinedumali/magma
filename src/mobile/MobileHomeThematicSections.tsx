import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { ChevronRight } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { applyStorageImageFallback, optimiseSupabaseImageUrl } from '@/lib/supabaseImageUrl';

type ArticleRow = {
  id: string;
  slug: string;
  titre: string;
  image_url?: string | null;
  categorie?: string | null;
  date_publication?: string | null;
};

const SECTION_KEYWORDS = [
  { key: 'editor', title: 'Les choix de la rédaction', keywords: ['actualite', 'news', 'actus', 'rédaction'] },
  { key: 'travel', title: 'Carnets de voyage', keywords: ['voyage', 'travel', 'carnet'] },
  { key: 'tech', title: 'Tech & innovation', keywords: ['tech', 'technologie', 'innovation', 'digital'] },
  { key: 'business', title: 'Économie & business', keywords: ['business', 'economie', 'économie', 'finance'] },
  { key: 'sport', title: 'Sport', keywords: ['sport'] },
  { key: 'culture', title: 'Culture & divertissement', keywords: ['culture', 'divertissement', 'art', 'loisir'] },
];

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
}

function findMatchingCategory(dbCategories: { name: string }[], keywords: string[]): string | null {
  for (const cat of dbCategories) {
    const normalizedCat = normalize(cat.name);
    for (const keyword of keywords) {
      if (normalizedCat.includes(normalize(keyword)) || normalize(keyword).includes(normalizedCat)) {
        return cat.name;
      }
    }
  }
  return null;
}

type SectionItem = {
  key: string;
  title: string;
  categoryName: string | null;
  load: () => Promise<{ data: any[] | null; error: any }>;
};

function createSections(dbCategories: { name: string }[]): SectionItem[] {
  return SECTION_KEYWORDS.map(section => {
    const categoryName = findMatchingCategory(dbCategories, section.keywords);
    return {
      key: section.key,
      title: section.title,
      categoryName,
      load: async () => {
        if (!categoryName) {
          return { data: [], error: null };
        }
        const result = await supabase
          .from('articles')
          .select('id, slug, titre, image_url, categorie, date_publication')
          .eq('statut', 'publie')
          .ilike('categorie', `%${categoryName}%`)
          .order('date_publication', { ascending: false })
          .limit(8);
        return { data: result.data, error: result.error };
      },
    };
  }).filter((s): s is SectionItem => s.categoryName !== null);
}

function MiniArticleCard({ article, onClick }: { article: ArticleRow; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-[200px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#161b26] text-left transition active:scale-[0.98]"
    >
      <div className="relative h-[110px] w-full bg-[#0a0d14]">
        <img
          src={optimiseSupabaseImageUrl(article.image_url || '/placeholder.svg', 'thumb')}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          onError={(e) => applyStorageImageFallback(e.currentTarget)}
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
  const { categories: dbCategories } = useCategories();
  const [data, setData] = useState<Record<string, ArticleRow[]>>({});
  const [loading, setLoading] = useState(true);

  const sections = useMemo(() => createSections(dbCategories), [dbCategories]);

  useEffect(() => {
    if (!dbCategories.length) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const entries = await Promise.all(
        sections.map(async (s) => {
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
  }, [sections]);

  if (loading || !dbCategories.length) {
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
      {sections.map((s) => {
        const rows = data[s.key] || [];
        if (rows.length === 0) return null;
        return (
          <section key={s.key} className="min-w-0">
            <div className="mb-3 flex items-center justify-between px-4">
              <h2 className="text-lg font-bold tracking-tight text-white">{s.title}</h2>
              <ChevronRight className="shrink-0 text-[#9ba5be]" size={20} aria-hidden />
            </div>
            <div className="flex touch-pan-x gap-3 overflow-x-auto overflow-y-hidden px-4 pb-1 [-webkit-overflow-scrolling:touch] scrollbar-hide">
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
