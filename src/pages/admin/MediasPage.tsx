import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Copy,
  ExternalLink,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Music,
  RefreshCw,
  Trash2,
  Upload,
  Video,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { LoadingBar } from '@/components/ui/loading-bar';
import {
  canDeleteMediaFromLibrary,
  deleteLibraryMediaFromSupabase,
  loadUnifiedMediaLibrary,
  type MediaKind,
  type UnifiedMediaItem,
} from '@/lib/storageMediaLibrary';

function formatSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

const kindLabels: Record<MediaKind, string> = {
  image: 'Image',
  video: 'Vidéo',
  audio: 'Audio',
};

const KindIcon = ({ kind, className }: { kind: MediaKind; className?: string }) => {
  const cn = className ?? 'w-4 h-4';
  if (kind === 'image') return <ImageIcon className={cn} />;
  if (kind === 'video') return <Video className={cn} />;
  return <Music className={cn} />;
};

const MediasPage = () => {
  const [items, setItems] = useState<UnifiedMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState<MediaKind | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [preview, setPreview] = useState<UnifiedMediaItem | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadUnifiedMediaLibrary(supabase);
      setItems(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sources = useMemo(() => {
    const s = new Set<string>();
    items.forEach((i) => s.add(i.sourceLabel));
    return ['all', ...Array.from(s).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((m) => {
      if (kindFilter !== 'all' && m.kind !== kindFilter) return false;
      if (sourceFilter !== 'all' && m.sourceLabel !== sourceFilter) return false;
      if (q && !m.name.toLowerCase().includes(q) && !m.url.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [items, search, kindFilter, sourceFilter]);

  const stats = useMemo(() => {
    const counts = { image: 0, video: 0, audio: 0 };
    items.forEach((m) => {
      counts[m.kind]++;
    });
    return counts;
  }, [items]);

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Lien copié');
    } catch {
      toast.error('Impossible de copier');
    }
  };

  const handleUploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (!list.length) return;
    setLoading(true);
    setError(null);
    try {
      for (const file of list) {
        const ext = file.name.split('.').pop() || 'bin';
        const path = `library/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage.from('medias').upload(path, file, {
          upsert: false,
        });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from('medias').getPublicUrl(path);
        const { error: insErr } = await supabase.from('medias').insert([
          {
            name: file.name,
            url: pub.publicUrl,
            type: file.type || 'application/octet-stream',
          },
        ]);
        if (insErr) throw insErr;
      }
      toast.success(list.length > 1 ? `${list.length} fichiers ajoutés` : 'Média ajouté');
      await load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Échec du téléversement';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (m: UnifiedMediaItem) => {
    if (!canDeleteMediaFromLibrary(m)) {
      toast.error('Ce fichier ne peut pas être supprimé depuis la bibliothèque (URL externe ou non reconnue).');
      return;
    }
    if (!window.confirm(`Supprimer « ${m.name} » du bucket Storage concerné ? Cette action est définitive.`)) return;

    setLoading(true);
    setError(null);
    try {
      await deleteLibraryMediaFromSupabase(supabase, m);
      toast.success('Fichier supprimé du stockage Supabase');
      setPreview(null);
      await load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Suppression impossible';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) {
      void handleUploadFiles(e.dataTransfer.files);
    }
  };

  const renderPreviewBlock = (m: UnifiedMediaItem, compact: boolean) => {
    const h = compact ? 'h-36' : 'h-48';
    if (m.kind === 'image') {
      return (
        <div className={`relative w-full ${h} bg-black/20 rounded-lg overflow-hidden flex items-center justify-center`}>
          <img src={m.url} alt="" className="max-w-full max-h-full object-contain" loading="lazy" />
        </div>
      );
    }
    if (m.kind === 'video') {
      return (
        <div className={`relative w-full ${h} bg-black rounded-lg overflow-hidden`}>
          <video src={m.url} className="w-full h-full object-contain" controls muted playsInline />
        </div>
      );
    }
    return (
      <div
        className={`w-full ${h} rounded-lg bg-[var(--bg-input)] flex flex-col items-center justify-center gap-2 border border-[var(--border)]`}
      >
        <Music className="w-10 h-10 text-[var(--accent-blue)] opacity-80" />
        <audio src={m.url} controls className="w-[90%] max-w-full" />
      </div>
    );
  };

  return (
    <div className="font-[var(--font)] text-[var(--text-primary)] pb-12">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bibliothèque de médias</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Images, sons et vidéos issus du stockage Supabase (articles, vidéos, albums, etc.), comme dans WordPress.
          </p>
          <div className="flex flex-wrap gap-3 mt-3 text-sm text-[var(--text-secondary)]">
            <span>
              <b className="text-[var(--text-primary)]">{items.length}</b> fichier(s)
            </span>
            <span className="flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-[var(--accent-blue)]" /> {stats.image}
            </span>
            <span className="flex items-center gap-1">
              <Video className="w-3.5 h-3.5 text-[var(--accent)]" /> {stats.video}
            </span>
            <span className="flex items-center gap-1">
              <Music className="w-3.5 h-3.5 text-amber-400" /> {stats.audio}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <button
            type="button"
            onClick={() => load()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-sm font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold cursor-pointer hover:brightness-110 shadow-[0_4px_16px_var(--accent-glow)] transition-all">
            <Upload className="w-4 h-4" />
            Ajouter
            <input
              type="file"
              className="hidden"
              multiple
              accept="image/*,video/*,audio/*"
              onChange={(e) => {
                if (e.target.files) void handleUploadFiles(e.target.files);
                e.target.value = '';
              }}
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 text-red-200 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`rounded-2xl border border-dashed transition-colors mb-6 p-4 ${
          dragOver ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-[var(--border)] bg-[var(--bg-card)]/30'
        }`}
      >
        <p className="text-center text-sm text-[var(--text-muted)]">
          Glissez-déposez des fichiers ici pour les envoyer dans le bucket <code className="text-[var(--text-secondary)]">medias</code>
        </p>
      </div>

      <div className="dark-card p-4 mb-6 flex flex-col xl:flex-row flex-wrap gap-3 xl:items-center xl:justify-between">
        <input
          type="search"
          placeholder="Rechercher par nom ou URL…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)] text-sm"
        />
        <div className="flex flex-wrap gap-2">
          {(['all', 'image', 'video', 'audio'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKindFilter(k)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                kindFilter === k
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {k === 'all' ? 'Tous' : kindLabels[k]}
            </button>
          ))}
        </div>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] outline-none"
        >
          {sources.map((s) => (
            <option key={s} value={s}>
              {s === 'all' ? 'Toutes les sources' : s}
            </option>
          ))}
        </select>
        <div className="flex rounded-xl border border-[var(--border)] overflow-hidden">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]' : 'bg-[var(--bg-input)]'}`}
            aria-label="Grille"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]' : 'bg-[var(--bg-input)]'}`}
            aria-label="Liste"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading && items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <LoadingBar variant="inline" className="w-48" />
          <span className="text-sm text-[var(--text-muted)]">Chargement de la bibliothèque…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="dark-card p-12 text-center text-[var(--text-muted)]">
          Aucun média ne correspond aux filtres. Téléversez un fichier ou élargissez la recherche.
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((m) => (
            <div
              key={m.id}
              className="dark-card p-3 flex flex-col gap-2 hover:border-[var(--accent)]/30 transition-colors cursor-pointer group"
              onClick={() => setPreview(m)}
            >
              {renderPreviewBlock(m, true)}
              <div className="flex items-start justify-between gap-1 min-h-[2.5rem]">
                <p className="text-xs font-medium text-[var(--text-primary)] line-clamp-2 leading-snug" title={m.name}>
                  {m.name}
                </p>
                <span className="shrink-0 inline-flex items-center gap-0.5 text-[10px] uppercase px-1.5 py-0.5 rounded bg-[var(--bg-input)] text-[var(--text-secondary)]">
                  <KindIcon kind={m.kind} className="w-3 h-3" />
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] truncate" title={m.sourceLabel}>
                {m.sourceLabel} · {formatSize(m.size)}
              </p>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void copyUrl(m.url);
                  }}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[var(--bg-input)] text-xs"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <a
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[var(--bg-input)] text-xs"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="dark-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--text-muted)]">
                <th className="p-3 font-medium">Aperçu</th>
                <th className="p-3 font-medium">Fichier</th>
                <th className="p-3 font-medium">Type</th>
                <th className="p-3 font-medium">Source</th>
                <th className="p-3 font-medium">Taille</th>
                <th className="p-3 font-medium w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-[var(--border)]/60 hover:bg-[var(--bg-card-hover)]">
                  <td className="p-2 w-24">
                    {m.kind === 'image' ? (
                      <button type="button" onClick={() => setPreview(m)} className="block w-20 h-14 rounded overflow-hidden bg-black/20">
                        <img src={m.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPreview(m)}
                        className="w-20 h-14 rounded bg-[var(--bg-input)] flex items-center justify-center"
                      >
                        <KindIcon kind={m.kind} />
                      </button>
                    )}
                  </td>
                  <td className="p-3 max-w-[200px]">
                    <div className="font-medium truncate" title={m.name}>
                      {m.name}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1">
                      <KindIcon kind={m.kind} /> {kindLabels[m.kind]}
                    </span>
                  </td>
                  <td className="p-3 text-[var(--text-secondary)] truncate max-w-[140px]" title={m.sourceLabel}>
                    {m.sourceLabel}
                  </td>
                  <td className="p-3 text-[var(--text-secondary)]">{formatSize(m.size)}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => void copyUrl(m.url)}
                        className="p-2 rounded-lg bg-[var(--bg-input)]"
                        title="Copier l’URL"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-[var(--bg-input)] inline-flex"
                        title="Ouvrir"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      {canDeleteMediaFromLibrary(m) && (
                        <button
                          type="button"
                          onClick={() => void handleDelete(m)}
                          className="p-2 rounded-lg bg-red-500/15 text-red-400"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {preview && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setPreview(null)}
          role="presentation"
        >
          <div
            className="dark-card max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 border border-[var(--border)]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex justify-between items-start gap-4 mb-4">
              <div>
                <h3 className="font-semibold text-lg pr-4">{preview.name}</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">{preview.sourceLabel}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-2 rounded-lg hover:bg-[var(--bg-input)]"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderPreviewBlock(preview, false)}
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                type="button"
                onClick={() => void copyUrl(preview.url)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-medium"
              >
                <Copy className="w-4 h-4" /> Copier l’URL
              </button>
              <a
                href={preview.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] text-sm"
              >
                <ExternalLink className="w-4 h-4" /> Ouvrir
              </a>
              {canDeleteMediaFromLibrary(preview) && (
                <button
                  type="button"
                  onClick={() => void handleDelete(preview)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-300 text-sm"
                >
                  <Trash2 className="w-4 h-4" /> Supprimer du stockage
                </button>
              )}
            </div>
            <p className="text-[11px] text-[var(--text-muted)] break-all mt-4">{preview.url}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediasPage;
