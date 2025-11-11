import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import ArticleCard from './ArticleCard';
import ArticleForm from './ArticleForm';
import toast from 'react-hot-toast';
import * as Dialog from '@radix-ui/react-dialog';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useCallback } from 'react';
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

export interface Article {
  id: string;
  titre: string;
  image_url?: string;
  image?: string; // Alternative field name for backward compatibility
  categorie?: string;
  tags?: string[];
  audio_url?: string;
  contenu?: string;
  auteur?: string;
  statut?: string;
  slug?: string;
  gallery?: string[];
}

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
  const navigate = useNavigate();
  const { getArticleEditPath, getArticleCreatePath } = useAdminContext();

  // Charger les articles depuis Supabase
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
      console.log('Fetched articles data:', data);
      // Debug: Check image URLs for first few articles
      data?.slice(0, 3).forEach((article, index) => {
        console.log(`Article ${index + 1} image data:`, {
          id: article.id,
          titre: article.titre,
          image_url: article.image_url,
          image: article.image,
          hasImageUrl: !!article.image_url,
          hasImage: !!article.image
        });
      });
      setArticles(data || []);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // Suppression d'un article (ouvre la modale)
  const handleDelete = (id: string) => {
    const article = articles.find(a => a.id === id);
    if (article) setArticleToDelete(article);
  };

  // Confirmation réelle de suppression
  const handleConfirmDelete = async () => {
    if (!articleToDelete) return;
    setLoadingDelete(true);
    // Suppression locale immédiate (optimiste)
    setArticles(prev => prev.filter(a => a.id !== articleToDelete.id));
    setSelected(selected.filter(id => id !== articleToDelete.id));
    // Suppression des fichiers du Storage
    try {
      // Supprimer l'image principale
      if (articleToDelete.image_url) {
        const path = articleToDelete.image_url.split('/storage/v1/object/public/')[1];
        if (path) {
          await supabase.storage.from('article-images').remove([path]);
        }
      }
      // Supprimer l'audio principal
      if (articleToDelete.audio_url) {
        const path = articleToDelete.audio_url.split('/storage/v1/object/public/')[1];
        if (path) {
          await supabase.storage.from('article-audios').remove([path]);
        }
      }
      // Supprimer les images de la galerie
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
    // Suppression de l'article en base
    const { error, count } = await supabase.from('articles').delete({ count: 'exact' }).eq('id', articleToDelete.id);
    setLoadingDelete(false);
    if (error || count === 0) {
      toast.error("Erreur lors de la suppression en base. L'article n'a pas été supprimé.");
      // Recharge la liste pour être sûr
      fetchArticles();
    } else {
      toast.success("Article supprimé");
      // Recharge la liste pour être sûr
      fetchArticles();
    }
    setArticleToDelete(null);
  };

  // Ouvre la page d'édition
  const handleEdit = (id: string) => {
    navigate(getArticleEditPath(id));
  };

  // Ouvre la page de création d'article
  const handleAdd = () => {
    navigate(getArticleCreatePath());
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch =
      article.titre?.toLowerCase().includes(search.toLowerCase()) ||
      article.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter ? article.categorie === categoryFilter : true;
    const matchesStatus = statusFilter ? article.statut === statusFilter : true;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredArticles.length / pageSize) || 1;
  const paginatedArticles = filteredArticles.slice((page - 1) * pageSize, page * pageSize);

  // Selection logic
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

  // Suppression multiple (ouvre la modale)
  const handleBulkDelete = () => {
    setBulkDeleteOpen(true);
  };

  // Confirmation réelle de suppression multiple
  const handleConfirmBulkDelete = async () => {
    setLoadingBulkDelete(true);
    const { error } = await supabase.from('articles').delete().in('id', selected);
    setLoadingBulkDelete(false);
    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      toast.success("Articles supprimés");
      fetchArticles();
      setSelected([]);
    }
    setBulkDeleteOpen(false);
  };

  // Export utility
  const exportArticles = (type: 'csv' | 'json') => {
    const toExport = articles.filter(a => selected.includes(a.id));
    if (type === 'json') {
      const blob = new Blob([JSON.stringify(toExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'articles.json';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // CSV
      const header = ['id', 'titre', 'categorie', 'auteur', 'tags', 'image_url', 'audio_url', 'contenu'];
      const rows = toExport.map(a => [
        a.id,
        a.titre,
        a.categorie,
        a.auteur,
        (a.tags || []).join(','),
        a.image_url,
        a.audio_url,
        a.contenu?.replace(/\n/g, ' ')
      ]);
      const csv = [header, ...rows].map(r => r.map(x => '"' + (x || '') + '"').join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'articles.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleShowDetail = (id: string) => {
    const article = articles.find(a => a.id === id);
    if (article) setSelectedDetailArticle(article);
  };

  const handleBulkStatus = () => {
    setBulkStatus('publie');
    setBulkStatusOpen(true);
  };

  const handleConfirmBulkStatus = async () => {
    setLoadingBulkStatus(true);
    const { error } = await supabase.from('articles').update({ statut: bulkStatus }).in('id', selected);
    setLoadingBulkStatus(false);
    if (error) {
      toast.error("Erreur lors du changement de statut");
    } else {
      toast.success("Statut mis à jour");
      fetchArticles();
      setSelected([]);
    }
    setBulkStatusOpen(false);
  };

  const handleBulkCategory = () => {
    setBulkCategory('');
    setBulkCategoryOpen(true);
  };

  const handleConfirmBulkCategory = async () => {
    if (!bulkCategory) return;
    setLoadingBulkCategory(true);
    const { error } = await supabase.from('articles').update({ categorie: bulkCategory }).in('id', selected);
    setLoadingBulkCategory(false);
    if (error) {
      toast.error("Erreur lors du changement de catégorie");
    } else {
      toast.success("Catégorie mise à jour");
      fetchArticles();
      setSelected([]);
    }
    setBulkCategoryOpen(false);
  };

  const handleBulkTag = () => {
    setBulkTag('');
    setBulkTagAction('add');
    setBulkTagOpen(true);
  };

  const handleConfirmBulkTag = async () => {
    if (!bulkTag) return;
    setLoadingBulkTag(true);
    // Récupère les articles sélectionnés
    const toUpdate = articles.filter(a => selected.includes(a.id));
    // Prépare les nouvelles valeurs de tags
    const updates = toUpdate.map(a => {
      let tags = Array.isArray(a.tags) ? [...a.tags] : [];
      if (bulkTagAction === 'add' && !tags.includes(bulkTag)) {
        tags.push(bulkTag);
      } else if (bulkTagAction === 'remove') {
        tags = tags.filter(t => t !== bulkTag);
      }
      return { id: a.id, tags };
    });
    // Met à jour chaque article (en bulk via upsert ou update)
    for (const u of updates) {
      await supabase.from('articles').update({ tags: u.tags }).eq('id', u.id);
    }
    setLoadingBulkTag(false);
    toast.success('Tags mis à jour');
    fetchArticles();
    setSelected([]);
    setBulkTagOpen(false);
  };

  const allCategories = Array.from(new Set(articles.map(a => a.categorie).filter(Boolean)));

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Articles</h2>
        <div className="flex flex-col sm:flex-row gap-2 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-2 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par titre ou tag..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-3 py-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Toutes catégories</option>
            {allCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {/* Filtre statut */}
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Tous statuts</option>
            <option value="publie">Publié</option>
            <option value="brouillon">Brouillon</option>
          </select>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2 shadow"
            onClick={handleAdd}
          >
            <span className="text-lg font-bold">+</span> Ajouter un article
          </button>
        </div>
      </div>
      {/* Bulk actions bar */}
      {selected.length > 0 && (
        <div className="flex items-center gap-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 mb-4 animate-fadeIn">
          <span className="font-semibold">{selected.length} sélectionné(s)</span>
          <button onClick={handleBulkDelete} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition">Supprimer</button>
          <button onClick={handleBulkStatus} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition">Changer le statut</button>
          <button onClick={handleBulkCategory} className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition">Changer la catégorie</button>
          <button onClick={handleBulkTag} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition">Ajouter/Retirer un tag</button>
          <button onClick={() => exportArticles('csv')} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition">Exporter CSV</button>
          <button onClick={() => exportArticles('json')} className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition">Exporter JSON</button>
          <button onClick={() => setShowImageDebug(!showImageDebug)} className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition">
            {showImageDebug ? 'Hide' : 'Debug'} Images
          </button>
          <button onClick={() => setSelected([])} className="ml-auto text-blue-600 underline">Tout désélectionner</button>
        </div>
      )}
      
      {/* Image Debug Section */}
      {showImageDebug && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="text-lg font-bold mb-4">Image Debug - Articles avec problèmes d'images</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredArticles.slice(0, 6).map(article => (
              <ArticleImageDebug key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex flex-col items-center justify-center text-gray-500 py-12">
          <svg className="animate-spin h-8 w-8 mb-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
          Chargement...
        </div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : filteredArticles.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-gray-400 py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 018 0v2m-4-4v4m0 0v4m0-4h4m-4 0H5" /></svg>
          Aucun article pour le moment.
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              className="w-4 h-4 accent-blue-600"
              aria-label="Tout sélectionner"
            />
            <span className="text-sm text-gray-600">Tout sélectionner cette page</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {paginatedArticles.map(article => {
              const imageUrl = article.image_url || article.image;
              console.log(`Passing to ArticleCard for "${article.titre}":`, {
                image_url: imageUrl,
                hasImageUrl: !!imageUrl
              });
              return (
                <ArticleCard
                  key={article.id}
                  id={article.id}
                  titre={article.titre}
                  image_url={imageUrl}
                  categorie={article.categorie}
                  tags={article.tags}
                  audio_url={article.audio_url}
                  statut={article.statut}
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
          {/* Pagination controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded border bg-white disabled:opacity-50"
              >Précédent</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pn => (
                <button
                  key={pn}
                  onClick={() => setPage(pn)}
                  className={`px-3 py-1 rounded border ${pn === page ? 'bg-blue-600 text-white' : 'bg-white'}`}
                >{pn}</button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded border bg-white disabled:opacity-50"
              >Suivant</button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Par page:</span>
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="border rounded px-2 py-1"
              >
                {[8, 16, 32, 64].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
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