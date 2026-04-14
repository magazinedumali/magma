import React, { useEffect, useState } from 'react';
import ArticleCard from './ArticleCard';
import toast from 'react-hot-toast';
import * as Dialog from '@radix-ui/react-dialog';
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import ArticleDetailModal from './ArticleDetailModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import ConfirmBulkDeleteModal from './ConfirmBulkDeleteModal';
import ConfirmBulkStatusModal from './ConfirmBulkStatusModal';
import ConfirmBulkCategoryModal from './ConfirmBulkCategoryModal';
import ConfirmBulkTagModal from './ConfirmBulkTagModal';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import ArticleImageDebug from '@/components/ArticleImageDebug';
import { useAdminContext } from '@/hooks/use-admin-context';
import { Skeleton } from '@/components/ui/skeleton';

export interface Article {
  id: string;
  titre: string;
  image_url?: string;
  image?: string; 
  categorie?: string;
  tags?: string[];
  audio_url?: string;
  contenu?: string;
  auteur?: string;
  statut?: string;
  slug?: string;
  gallery?: string[];
}

function normalizeArticleStatut(raw?: string): 'publie' | 'brouillon' {
  const s = String(raw ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  if (s === 'publie' || s === 'published' || s === 'public') return 'publie';
  return 'brouillon';
}

const ARTICLES_VIEW_STORAGE_KEY = 'magma-admin-articles-view';

function listRowImageUrl(raw?: string): string | null {
  if (!raw) return null;
  if (raw.startsWith('http')) return raw;
  if (raw.startsWith('public/') || raw.includes('/storage/')) return raw;
  if (raw === '/placeholder.svg' || raw.trim() === '') return null;
  return raw;
}

interface ArticleListRowProps {
  article: Article;
  statut: 'publie' | 'brouillon';
  selected: boolean;
  onSelect: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onShowDetail: (id: string) => void;
}

const ArticleListRow: React.FC<ArticleListRowProps> = ({
  article,
  statut,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onShowDetail,
}) => {
  const { getArticleEditPath } = useAdminContext();
  const { id, titre, categorie, tags = [], audio_url, slug } = article;
  const imageUrl = listRowImageUrl(article.image_url || article.image);
  const isPublished = statut === 'publie';

  const handlePreview = () => {
    if (!isPublished) {
      toast.error('Les brouillons ne sont pas visibles sur le site public. Ouverture de l’édition.');
      window.open(getArticleEditPath(id), '_blank');
      return;
    }
    const segment = slug?.trim() ? encodeURIComponent(slug.trim()) : id;
    window.open(`/article/${segment}`, '_blank');
  };

  const handleRowClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, label, a, audio')) return;
    onShowDetail(id);
  };

  return (
    <div
      className="dark-card flex flex-wrap sm:flex-nowrap gap-4 items-center p-4 transition-all duration-200 cursor-pointer group"
      style={{
        border: selected ? '2px solid var(--accent)' : '1px solid var(--border)',
        boxShadow: selected ? '0 8px 24px rgba(255, 24, 78, 0.15)' : 'var(--shadow-card)',
      }}
      onClick={handleRowClick}
    >
      <label
        className="flex items-center shrink-0 cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          className="w-4 h-4 accent-[#ff184e]"
          aria-label="Sélectionner l'article"
        />
      </label>

      <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-black/20 border border-white/5">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 border border-white/5 px-1 text-center">
            <span className="text-[10px] font-medium leading-tight">Sans image</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3
          className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors line-clamp-2"
          title={titre}
        >
          {titre}
        </h3>
        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
          <span className="bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 px-2 py-0.5 rounded font-semibold">
            {categorie || 'Sans catégorie'}
          </span>
          {Array.isArray(tags) &&
            tags.slice(0, 4).map((tag, idx) => (
              <span
                key={idx}
                className="bg-white/5 text-[var(--text-secondary)] px-2 py-0.5 rounded border border-white/5"
              >
                #{tag}
              </span>
            ))}
          {tags.length > 4 && (
            <span className="text-[var(--text-muted)]">+{tags.length - 4}</span>
          )}
        </div>
        {audio_url && (
          <div className="mt-3 max-w-md" onClick={(e) => e.stopPropagation()}>
            <audio controls src={audio_url} className="w-full h-8 opacity-90 style-audio" />
          </div>
        )}
      </div>

      <span
        className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-bold border ${
          isPublished
            ? 'bg-green-500/20 text-green-400 border-green-500/30'
            : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        }`}
      >
        {isPublished ? 'Publié' : 'Brouillon'}
      </span>

      <div
        className="flex gap-1.5 bg-black/20 p-1 rounded-md border border-white/5 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handlePreview}
          className="p-2 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          title="Prévisualiser"
        >
          <EyeIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onEdit(id)}
          className="p-2 rounded hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 transition-colors"
          title="Éditer"
        >
          <PencilSquareIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(id)}
          className="p-2 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
          title="Supprimer"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const ArticleList: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [selectedDetailArticle, setSelectedDetailArticle] = useState<Article | null>(null);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [loadingBulkDelete, setLoadingBulkDelete] = useState(false);
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<'publie' | 'brouillon'>('publie');
  const [loadingBulkStatus, setLoadingBulkStatus] = useState(false);
  const [bulkCategoryOpen, setBulkCategoryOpen] = useState(false);
  const [bulkCategory, setBulkCategory] = useState('');
  const [loadingBulkCategory, setLoadingBulkCategory] = useState(false);
  const [bulkTagOpen, setBulkTagOpen] = useState(false);
  const [bulkTag, setBulkTag] = useState('');
  const [bulkTagAction, setBulkTagAction] = useState<'add' | 'remove'>('add');
  const [loadingBulkTag, setLoadingBulkTag] = useState(false);
  const [showImageDebug, setShowImageDebug] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    try {
      const v = localStorage.getItem(ARTICLES_VIEW_STORAGE_KEY);
      if (v === 'list' || v === 'grid') return v;
    } catch {
      /* ignore */
    }
    return 'grid';
  });
  const navigate = useNavigate();

  useEffect(() => {
    try {
      localStorage.setItem(ARTICLES_VIEW_STORAGE_KEY, viewMode);
    } catch {
      /* ignore */
    }
  }, [viewMode]);
  const { getArticleEditPath, getArticleCreatePath } = useAdminContext();

  const fetchArticles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
      toast.error("Erreur lors du chargement des articles");
    } else {
      setArticles(data || []);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = (id: string) => {
    const article = articles.find(a => a.id === id);
    if (article) setArticleToDelete(article);
  };

  const handleConfirmDelete = async () => {
    if (!articleToDelete) return;
    setLoadingDelete(true);
    setArticles(prev => prev.filter(a => a.id !== articleToDelete.id));
    setSelected(selected.filter(id => id !== articleToDelete.id));
    
    try {
      if (articleToDelete.image_url) {
        const path = articleToDelete.image_url.split('/storage/v1/object/public/')[1];
        if (path) await supabase.storage.from('article-images').remove([path]);
      }
      if (articleToDelete.audio_url) {
        const path = articleToDelete.audio_url.split('/storage/v1/object/public/')[1];
        if (path) await supabase.storage.from('article-audios').remove([path]);
      }
      if (Array.isArray(articleToDelete.gallery)) {
        const galleryPaths = articleToDelete.gallery
          .map((url) => url.split('/storage/v1/object/public/')[1])
          .filter(Boolean);
        if (galleryPaths.length > 0) {
          await supabase.storage.from('article-images').remove(galleryPaths);
        }
      }
    } catch (e) {
      toast.error("Erreur lors de la suppression d'un fichier associé");
    }
    
    const { error, count } = await supabase.from('articles').delete({ count: 'exact' }).eq('id', articleToDelete.id);
    setLoadingDelete(false);
    
    if (error || count === 0) {
      toast.error("Erreur lors de la suppression en base. L'article n'a pas été supprimé.");
      fetchArticles();
    } else {
      toast.success("Article supprimé");
      fetchArticles();
    }
    setArticleToDelete(null);
  };

  const handleEdit = (id: string) => {
    navigate(getArticleEditPath(id));
  };

  const handleAdd = () => {
    navigate(getArticleCreatePath());
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch =
      article.titre?.toLowerCase().includes(search.toLowerCase()) ||
      article.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter ? article.categorie === categoryFilter : true;
    const matchesStatus = statusFilter
      ? normalizeArticleStatut(article.statut) === statusFilter
      : true;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalPages = Math.ceil(filteredArticles.length / pageSize) || 1;
  const paginatedArticles = filteredArticles.slice((page - 1) * pageSize, page * pageSize);

  const handleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  };
  
  const handleSelectAll = () => {
    if (selectAll) {
      setSelected([]);
      setSelectAll(false);
    } else {
      setSelected(paginatedArticles.map(a => a.id));
      setSelectAll(true);
    }
  };
  
  useEffect(() => {
    setSelectAll(
      paginatedArticles.length > 0 && paginatedArticles.every(a => selected.includes(a.id))
    );
  }, [paginatedArticles, selected]);

  const handleBulkDelete = () => setBulkDeleteOpen(true);
  const handleBulkStatus = () => { setBulkStatus('publie'); setBulkStatusOpen(true); };
  const handleBulkCategory = () => { setBulkCategory(''); setBulkCategoryOpen(true); };
  const handleBulkTag = () => { setBulkTag(''); setBulkTagAction('add'); setBulkTagOpen(true); };

  const handleConfirmBulkDelete = async () => {
    setLoadingBulkDelete(true);
    const { error } = await supabase.from('articles').delete().in('id', selected);
    setLoadingBulkDelete(false);
    if (error) { toast.error("Erreur lors de la suppression"); } 
    else { toast.success("Articles supprimés"); fetchArticles(); setSelected([]); }
    setBulkDeleteOpen(false);
  };

  const exportArticles = (type: 'csv' | 'json') => {
    const toExport = articles.filter(a => selected.includes(a.id));
    if (type === 'json') {
      const blob = new Blob([JSON.stringify(toExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'articles.json'; a.click(); URL.revokeObjectURL(url);
    } else {
      const header = ['id', 'titre', 'categorie', 'auteur', 'tags', 'image_url', 'audio_url', 'contenu'];
      const rows = toExport.map(a => [
        a.id, a.titre, a.categorie, a.auteur, (a.tags || []).join(','), a.image_url, a.audio_url, a.contenu?.replace(/\n/g, ' ')
      ]);
      const csv = [header, ...rows].map(r => r.map(x => '"' + (x || '') + '"').join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'articles.csv'; a.click(); URL.revokeObjectURL(url);
    }
  };

  const handleShowDetail = (id: string) => {
    const article = articles.find(a => a.id === id);
    if (article) setSelectedDetailArticle(article);
  };

  const handleConfirmBulkStatus = async () => {
    setLoadingBulkStatus(true);
    const updatePayload =
      bulkStatus === 'publie'
        ? {
            statut: 'publie',
            // Ensure newly published drafts have a publication date for public listing/order.
            date_publication: new Date().toISOString(),
          }
        : { statut: 'brouillon' };

    const { error } = await supabase.from('articles').update(updatePayload).in('id', selected);
    setLoadingBulkStatus(false);
    if (error) { toast.error("Erreur lors du changement de statut"); } 
    else { toast.success("Statut mis à jour"); fetchArticles(); setSelected([]); }
    setBulkStatusOpen(false);
  };

  const handleConfirmBulkCategory = async () => {
    if (!bulkCategory) return;
    setLoadingBulkCategory(true);
    const { error } = await supabase.from('articles').update({ categorie: bulkCategory }).in('id', selected);
    setLoadingBulkCategory(false);
    if (error) { toast.error("Erreur lors du changement de catégorie"); } 
    else { toast.success("Catégorie mise à jour"); fetchArticles(); setSelected([]); }
    setBulkCategoryOpen(false);
  };

  const handleConfirmBulkTag = async () => {
    if (!bulkTag) return;
    setLoadingBulkTag(true);
    const toUpdate = articles.filter(a => selected.includes(a.id));
    const updates = toUpdate.map(a => {
      let tags = Array.isArray(a.tags) ? [...a.tags] : [];
      if (bulkTagAction === 'add' && !tags.includes(bulkTag)) { tags.push(bulkTag); } 
      else if (bulkTagAction === 'remove') { tags = tags.filter(t => t !== bulkTag); }
      return { id: a.id, tags };
    });
    for (const u of updates) {
      await supabase.from('articles').update({ tags: u.tags }).eq('id', u.id);
    }
    setLoadingBulkTag(false);
    toast.success('Tags mis à jour');
    fetchArticles(); setSelected([]); setBulkTagOpen(false);
  };

  const allCategories = Array.from(new Set(articles.map(a => a.categorie).filter(Boolean)));

  return (
    <div className="text-[var(--text-primary)]">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold admin-dashboard-title">Articles</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">Gérez tout votre contenu éditorial.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-[var(--text-muted)] border-r border-white/10 pr-1" />
            <input
              type="text"
              placeholder="Rechercher par titre ou tag..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-11 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg w-full focus:outline-none focus:border-[var(--accent)] text-sm transition-colors text-white placeholder-[var(--text-muted)]"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent)] text-sm transition-colors text-white appearance-none pr-8 cursor-pointer"
          >
            <option value="" className="bg-[var(--bg-main)] text-white">Toutes catégories</option>
            {allCategories.map(cat => (
              <option key={cat} value={cat} className="bg-[var(--bg-main)] text-white">{cat}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent)] text-sm transition-colors text-white appearance-none pr-8 cursor-pointer"
          >
            <option value="" className="bg-[var(--bg-main)] text-white">Tous statuts</option>
            <option value="publie" className="bg-[var(--bg-main)] text-green-400">Publié</option>
            <option value="brouillon" className="bg-[var(--bg-main)] text-yellow-400">Brouillon</option>
          </select>
          <div
            className="flex rounded-lg border border-white/10 overflow-hidden shrink-0"
            role="group"
            aria-label="Mode d'affichage des articles"
          >
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-pressed={viewMode === 'grid'}
              title="Vue grille"
              className={`p-2.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-white/5 text-[var(--text-muted)] hover:bg-white/10 hover:text-white'
              }`}
            >
              <Squares2X2Icon className="w-5 h-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
              title="Vue liste"
              className={`p-2.5 transition-colors border-l border-white/10 ${
                viewMode === 'list'
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-white/5 text-[var(--text-muted)] hover:bg-white/10 hover:text-white'
              }`}
            >
              <ListBulletIcon className="w-5 h-5" aria-hidden />
            </button>
          </div>
          <button
            className="bg-[var(--accent)] text-white px-5 py-2 rounded-lg hover:brightness-110 hover:-translate-y-0.5 transition-all shadow-[0_4px_16px_var(--accent-glow)] flex items-center gap-2 font-medium"
            onClick={handleAdd}
          >
            <span className="text-xl leading-none -mt-1">+</span> Créer un article
          </button>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-3 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-xl px-4 py-3 mb-6 animate-fadeIn shadow-[0_4px_16px_rgba(0,0,0,0.2)] backdrop-blur-md">
          <span className="font-semibold text-white bg-[var(--accent)] px-2 py-0.5 rounded text-sm">{selected.length}</span>
          <span className="text-sm font-medium text-[var(--accent)]">sélectionné(s)</span>
          <div className="h-6 w-px bg-white/10 mx-2"></div>
          <button onClick={handleBulkDelete} className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-md hover:bg-red-500 flex-1 hover:text-white transition-colors text-xs font-semibold">Supprimer</button>
          <button onClick={handleBulkStatus} className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-md hover:bg-blue-500 flex-1 hover:text-white transition-colors text-xs font-semibold">Statut</button>
          <button onClick={handleBulkCategory} className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-3 py-1.5 rounded-md hover:bg-purple-500 flex-1 hover:text-white transition-colors text-xs font-semibold">Catégorie</button>
          <button onClick={handleBulkTag} className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-3 py-1.5 rounded-md hover:bg-yellow-500 flex-1 hover:text-white transition-colors text-xs font-semibold">Tags</button>
          <button onClick={() => exportArticles('csv')} className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-md hover:bg-green-500 flex-1 hover:text-white transition-colors text-xs font-semibold">CSV</button>
          
          <button onClick={() => setSelected([])} className="ml-auto text-[var(--text-muted)] hover:text-white text-sm transition-colors">Désélectionner tout</button>
        </div>
      )}
      
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="dark-card p-4 flex gap-4 items-start">
              <Skeleton className="w-24 h-24 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-red-400 bg-red-400/10 p-4 rounded-lg border border-red-400/20">{error}</div>
      ) : filteredArticles.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-[var(--text-muted)] py-20 dark-card">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <p className="text-lg font-medium">Aucun article trouvé.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4 bg-white/5 p-2 rounded-lg border border-white/5 w-fit">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="w-4 h-4 accent-[#ff184e]"
                aria-label="Tout sélectionner"
              />
              <span className="text-sm font-medium text-[var(--text-secondary)]">Tout sélectionner page active</span>
            </label>
          </div>
          
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-6">
              {paginatedArticles.map((article) => {
                const imageUrl = article.image_url || article.image;
                return (
                  <ArticleCard
                    key={article.id}
                    id={article.id}
                    titre={article.titre}
                    image_url={imageUrl}
                    categorie={article.categorie}
                    tags={article.tags}
                    audio_url={article.audio_url}
                    statut={normalizeArticleStatut(article.statut)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    selected={selected.includes(article.id)}
                    onSelect={() => handleSelect(article.id)}
                    onShowDetail={handleShowDetail}
                    slug={article.slug}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {paginatedArticles.map((article) => (
                <ArticleListRow
                  key={article.id}
                  article={article}
                  statut={normalizeArticleStatut(article.statut)}
                  selected={selected.includes(article.id)}
                  onSelect={() => handleSelect(article.id)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onShowDetail={handleShowDetail}
                />
              ))}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t border-white/10 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-muted)] mr-2">Afficher par page:</span>
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm focus:outline-none focus:border-[var(--accent)] cursor-pointer text-white appearance-none pr-6"
              >
                {[8, 16, 32, 64].map(size => (
                  <option key={size} value={size} className="bg-[var(--bg-main)]">{size}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 disabled:opacity-30 hover:bg-white/10 transition-colors text-sm font-medium"
              >
                Précédent
              </button>
              
              <div className="flex bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pn => (
                  <button
                    key={pn}
                    onClick={() => setPage(pn)}
                    className={`w-8 h-8 flex items-center justify-center text-sm font-medium transition-colors ${
                      pn === page 
                        ? 'bg-[var(--accent)] text-white shadow-[0_0_10px_var(--accent-glow)]' 
                        : 'hover:bg-white/10 text-[var(--text-secondary)]'
                    }`}
                  >
                    {pn}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 disabled:opacity-30 hover:bg-white/10 transition-colors text-sm font-medium"
              >
                Suivant
              </button>
            </div>
          </div>
        </>
      )}

      {selectedDetailArticle && (
        <ArticleDetailModal
          article={selectedDetailArticle}
          onClose={() => setSelectedDetailArticle(null)}
          onEdit={handleEdit}
          open={!!selectedDetailArticle}
        />
      )}
      <ConfirmDeleteModal
        article={articleToDelete}
        open={!!articleToDelete}
        onCancel={() => setArticleToDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={loadingDelete}
      />
      <ConfirmBulkDeleteModal
        articles={articles.filter(a => selected.includes(a.id))}
        open={bulkDeleteOpen && selected.length > 0}
        onCancel={() => setBulkDeleteOpen(false)}
        onConfirm={handleConfirmBulkDelete}
        loading={loadingBulkDelete}
      />
      <ConfirmBulkStatusModal
        open={bulkStatusOpen}
        count={selected.length}
        statut={bulkStatus}
        setStatut={(s: string) => setBulkStatus(s as 'publie' | 'brouillon')}
        onCancel={() => setBulkStatusOpen(false)}
        onConfirm={handleConfirmBulkStatus}
        loading={loadingBulkStatus}
      />
      <ConfirmBulkCategoryModal
        open={bulkCategoryOpen}
        count={selected.length}
        categories={allCategories}
        category={bulkCategory}
        setCategory={setBulkCategory}
        onCancel={() => setBulkCategoryOpen(false)}
        onConfirm={handleConfirmBulkCategory}
        loading={loadingBulkCategory}
      />
      <ConfirmBulkTagModal
        open={bulkTagOpen}
        count={selected.length}
        tag={bulkTag}
        setTag={setBulkTag}
        action={bulkTagAction}
        setAction={setBulkTagAction}
        onCancel={() => setBulkTagOpen(false)}
        onConfirm={handleConfirmBulkTag}
        loading={loadingBulkTag}
      />
    </div>
  );
};

export default ArticleList;