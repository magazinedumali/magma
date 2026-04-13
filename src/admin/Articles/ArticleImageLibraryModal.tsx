import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { MagnifyingGlassIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabaseClient';
import { LoadingBar } from '@/components/ui/loading-bar';
import { normalizeStoragePublicUrlForBrowser } from '@/lib/supabaseImageUrl';

const BUCKET = 'article-images';
const IMAGE_RE = /\.(jpe?g|png|gif|webp|bmp|svg)$/i;
const MAX_DEPTH = 6;
const PAGE_LIMIT = 100;

export interface LibraryImageItem {
  path: string;
  url: string;
  name: string;
  updated_at?: string;
}

async function collectImagesFromPrefix(
  prefix: string,
  depth: number,
  acc: LibraryImageItem[],
  seenPaths: Set<string>
): Promise<void> {
  if (depth > MAX_DEPTH) return;
  let offset = 0;
  for (;;) {
    const { data, error } = await supabase.storage.from(BUCKET).list(prefix, {
      limit: PAGE_LIMIT,
      offset,
      sortBy: { column: 'updated_at', order: 'desc' },
    });
    if (error) {
      console.warn('[ArticleImageLibrary]', prefix, error.message);
      return;
    }
    if (!data?.length) break;

    for (const item of data) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      const looksImage = IMAGE_RE.test(item.name);

      if (looksImage) {
        if (seenPaths.has(path)) continue;
        seenPaths.add(path);
        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
        acc.push({
          path,
          url: normalizeStoragePublicUrlForBrowser(pub.publicUrl),
          name: item.name,
          updated_at: item.updated_at,
        });
      } else if (!looksImage && item.name && depth < MAX_DEPTH) {
        await collectImagesFromPrefix(path, depth + 1, acc, seenPaths);
      }
    }

    if (data.length < PAGE_LIMIT) break;
    offset += PAGE_LIMIT;
  }
}

async function fetchAllArticleImages(): Promise<LibraryImageItem[]> {
  const acc: LibraryImageItem[] = [];
  const seen = new Set<string>();
  await collectImagesFromPrefix('', 0, acc, seen);
  acc.sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''));
  return acc;
}

interface ArticleImageLibraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (publicUrl: string) => void;
  title?: string;
}

const ArticleImageLibraryModal: React.FC<ArticleImageLibraryModalProps> = ({
  open,
  onOpenChange,
  onSelect,
  title = 'Bibliothèque de médias',
}) => {
  const [items, setItems] = useState<LibraryImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchAllArticleImages();
      setItems(list);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      void load();
      setQuery('');
    }
  }, [open, load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.name.toLowerCase().includes(q) ||
        it.path.toLowerCase().includes(q)
    );
  }, [items, query]);

  const handlePick = (url: string) => {
    onSelect(url);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/80 animate-fadeIn" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[101] flex max-h-[90vh] w-[min(96vw,64rem)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl animate-modalIn text-[var(--text-primary)] [isolation:isolate]"
          aria-describedby={undefined}
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-2 min-w-0">
              <PhotoIcon className="h-6 w-6 shrink-0 text-[var(--accent)]" aria-hidden />
              <Dialog.Title className="truncate text-lg font-bold">{title}</Dialog.Title>
            </div>
            <Dialog.Close
              className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Fermer"
            >
              <XMarkIcon className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="shrink-0 border-b border-white/5 px-5 py-3">
            <div className="relative">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher par nom de fichier…"
                className="w-full rounded-xl border border-white/10 bg-black/20 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              Images du bucket « {BUCKET} » (dossiers public, galerie, etc.). Cliquez pour sélectionner.
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {loading && (
              <div className="flex flex-col items-center justify-center gap-4 py-16">
                <LoadingBar variant="inline" className="h-1 w-48" />
                <span className="text-sm text-[var(--text-muted)]">Chargement des médias…</span>
              </div>
            )}
            {!loading && error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}
            {!loading && !error && filtered.length === 0 && (
              <div className="py-16 text-center text-[var(--text-muted)]">
                {items.length === 0
                  ? "Aucune image dans le bucket pour l'instant. Importez-en une par glisser-déposer ci-dessus."
                  : 'Aucun résultat pour cette recherche.'}
              </div>
            )}
            {!loading && !error && filtered.length > 0 && (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {filtered.map((it) => (
                  <li key={it.path}>
                    <button
                      type="button"
                      onClick={() => handlePick(it.url)}
                      className="group flex w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-black/20 text-left transition-shadow hover:border-[var(--accent)] hover:shadow-[0_0_20px_rgba(255,24,78,0.2)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    >
                      <div className="aspect-square w-full overflow-hidden bg-black/40">
                        <img
                          src={it.url}
                          alt=""
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                          decoding="async"
                          className="h-full w-full object-cover [image-rendering:auto] [backface-visibility:hidden] transform-gpu transition-opacity group-hover:opacity-95"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      <span className="truncate px-2 py-1.5 text-[10px] text-[var(--text-muted)]" title={it.path}>
                        {it.name}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ArticleImageLibraryModal;
