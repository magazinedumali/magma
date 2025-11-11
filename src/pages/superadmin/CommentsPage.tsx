import React, { useState, useRef } from "react";
import { X, Edit2, Trash2, User, Search, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { getCommentUserInfo } from '@/lib/userHelper';

const DUMMY_COMMENTS = [
  { id: 1, author: "Awa", avatar: "", content: "Super article, merci !", article: { titre: "L'économie malienne en 2024", url: "/article/economie-2024" }, created_at: "2024-06-10" },
  { id: 2, author: "Moussa", avatar: "", content: "Je ne suis pas d'accord sur ce point.", article: { titre: "Politique et société", url: "/article/politique-societe" }, created_at: "2024-06-09" },
  { id: 3, author: "Fatou", avatar: "", content: "Très instructif.", article: { titre: "L'éducation au Mali", url: "/article/education-mali" }, created_at: "2024-06-08" },
  { id: 4, author: "Baba", avatar: "", content: "Bravo à l'équipe !", article: { titre: "L'économie malienne en 2024", url: "/article/economie-2024" }, created_at: "2024-06-07" },
  { id: 5, author: "Awa", avatar: "", content: "Merci pour ce partage.", article: { titre: "L'éducation au Mali", url: "/article/education-mali" }, created_at: "2024-06-06" },
];

const PAGE_SIZE = 8;

const CommentsPage = () => {
  const [search, setSearch] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editComment, setEditComment] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(null);

  // Fetch comments from Supabase
  const fetchComments = async () => {
    setLoading(true);
    setError(null);
    // Fetch comments + article info
    const { data, error } = await supabase.from('comments').select('*').order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setComments(data || []);
    setLoading(false);
  };
  React.useEffect(() => { fetchComments(); }, []);

  // Stats dynamiques
  const total = comments.length;
  const topArticles = Object.entries(comments.reduce((acc: Record<string, number>, c) => { acc[c.article_titre] = (acc[c.article_titre] || 0) + 1; return acc; }, {})).sort((a, b) => Number(b[1]) - Number(a[1])).slice(0, 2);
  const topAuthors = Object.entries(comments.reduce((acc: Record<string, number>, c) => { acc[c.author] = (acc[c.author] || 0) + 1; return acc; }, {})).sort((a, b) => Number(b[1]) - Number(a[1])).slice(0, 2);

  // Filtrage
  const filtered = comments.filter(c =>
    (!search || c.author?.toLowerCase().includes(search.toLowerCase()) || c.content?.toLowerCase().includes(search.toLowerCase()) || c.article_titre?.toLowerCase().includes(search.toLowerCase()))
  );
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Ajout/édition commentaire
  const handleSave = async (comment: any) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const updateData: any = {
        content: comment.content,
      };
      
      // Only update author and avatar if provided (for manual edits)
      if (comment.author) {
        updateData.author = comment.author;
      }
      if (comment.avatar) {
        updateData.avatar = comment.avatar;
      }
      
      // Handle article reference
      if (comment.article_slug) {
        updateData.article_slug = comment.article_slug;
      }
      if (comment.article_id) {
        updateData.article_id = comment.article_id;
      }
      
      if (comment.id) {
        // Update existing comment
        const { error: updateError } = await supabase
          .from('comments')
          .update(updateData)
          .eq('id', comment.id);
        if (updateError) throw updateError;
        setSuccess('Commentaire modifié !');
      } else {
        // Insert new comment - requires article_slug or article_id
        if (!comment.article_slug && !comment.article_id) {
          throw new Error('Article requis pour créer un commentaire');
        }
        const { error: insertError } = await supabase
          .from('comments')
          .insert([{
            ...updateData,
            created_at: comment.created_at || new Date().toISOString(),
          }]);
        if (insertError) throw insertError;
        setSuccess('Commentaire ajouté !');
      }
      setModalOpen(false);
      setEditComment(null);
      fetchComments();
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  // Suppression réelle
  const handleDelete = async (comment) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { error: delError } = await supabase.from('comments').delete().eq('id', comment.id);
      if (delError) throw delError;
      setSuccess('Commentaire supprimé !');
      fetchComments();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression.');
    } finally {
      setLoading(false);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="font-poppins">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Gestion des commentaires</h2>
            <p className="text-sm text-gray-500">Gérez tous les commentaires de votre site</p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Rechercher..." 
                value={search} 
                onChange={e => { setSearch(e.target.value); setPage(1); }} 
                className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#4f8cff] focus:ring-2 focus:ring-[#4f8cff]/20 outline-none text-sm bg-white font-poppins"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <button 
              onClick={() => { setEditComment(null); setModalOpen(true); }} 
              className="px-5 py-2.5 rounded-lg bg-[#4f8cff] text-white font-medium text-sm hover:bg-[#2563eb] transition-colors shadow-sm"
            >
              + Ajouter
            </button>
          </div>
        </div>
        
        {/* Stats */}
        {(total > 0 || topArticles.length > 0 || topAuthors.length > 0) && (
          <div className="flex flex-wrap gap-6 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
              <div className="text-xs text-gray-500 mb-1">Total</div>
              <div className="text-lg font-semibold text-gray-800">{total}</div>
            </div>
            {topArticles.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
                <div className="text-xs text-gray-500 mb-1">Top Articles</div>
                <div className="text-sm font-medium text-gray-800">
                  {topArticles.map(([titre, count], idx) => (
                    <span key={titre}>{idx > 0 && ', '}{titre} ({Number(count)})</span>
                  ))}
                </div>
              </div>
            )}
            {topAuthors.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
                <div className="text-xs text-gray-500 mb-1">Top Auteurs</div>
                <div className="text-sm font-medium text-gray-800">
                  {topAuthors.map(([author, count], idx) => (
                    <span key={author}>{idx > 0 && ', '}{author} ({Number(count)})</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500 font-poppins text-base">Chargement...</div>
        </div>
      ) : paginated.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500 font-medium">Aucun commentaire trouvé.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Auteur</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Commentaire</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Article</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {paginated.map(comment => {
                    const userInfo = getCommentUserInfo(comment);
                    return (
                      <tr key={comment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={userInfo.avatar} 
                              alt={userInfo.name} 
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder.svg';
                              }}
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{userInfo.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-md">
                          <p className="text-sm text-gray-800 break-words">{comment.content}</p>
                        </td>
                        <td className="px-6 py-4">
                          {comment.article_slug ? (
                            <a 
                              href={`/article/${comment.article_slug}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-[#4f8cff] font-medium text-sm hover:underline flex items-center gap-1"
                            >
                              {comment.article_titre || comment.article_slug} 
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : comment.article_url ? (
                            <a 
                              href={comment.article_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-[#4f8cff] font-medium text-sm hover:underline flex items-center gap-1"
                            >
                              {comment.article_titre || 'Article'} 
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-sm text-gray-500">{comment.article_titre || 'N/A'}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {comment.created_at ? new Date(comment.created_at).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => { setEditComment(comment); setModalOpen(true); }} 
                              className="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors border border-yellow-200" 
                              title="Éditer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setConfirmDelete(comment)} 
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200" 
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Pagination */}
          {pageCount > 1 && (
            <div className="flex justify-center items-center gap-3">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1} 
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-700">Page {page} / {pageCount}</span>
              <button 
                onClick={() => setPage(p => Math.min(pageCount, p + 1))} 
                disabled={page === pageCount} 
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
      {/* Modale ajout/édition */}
      {modalOpen && (
        <CommentModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditComment(null); }}
          onSave={handleSave}
          initialData={editComment}
        />
      )}
      
      {/* Confirmation suppression */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Supprimer le commentaire</h3>
            <p className="text-sm text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer le commentaire de <strong>{getCommentUserInfo(confirmDelete).name}</strong> ?
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setConfirmDelete(null)} 
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={() => handleDelete(confirmDelete)} 
                className="px-4 py-2 rounded-lg bg-[#ff184e] text-white text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Modale ajout/édition commentaire
const CommentModal = ({ open, onClose, onSave, initialData }: any) => {
  const [author, setAuthor] = useState(initialData?.author || "");
  const [avatar, setAvatar] = useState(initialData?.avatar || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [articleSlug, setArticleSlug] = useState(initialData?.article_slug || "");
  const [date, setDate] = useState(initialData?.created_at ? initialData.created_at.split('T')[0] : new Date().toISOString().split('T')[0]);
  const [articles, setArticles] = useState<any[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);

  React.useEffect(() => {
    if (open) {
      // Initialize form data
      if (initialData) {
        setAuthor(initialData.author || "");
        setAvatar(initialData.avatar || "");
        setContent(initialData.content || "");
        setArticleSlug(initialData.article_slug || "");
        setDate(initialData.created_at ? initialData.created_at.split('T')[0] : new Date().toISOString().split('T')[0]);
      } else {
        // Reset form for new comment
        setAuthor("");
        setAvatar("");
        setContent("");
        setArticleSlug("");
        setDate(new Date().toISOString().split('T')[0]);
      }
      
      // Load articles for dropdown
      setLoadingArticles(true);
      supabase
        .from('articles')
        .select('id, title, titre, slug')
        .eq('statut', 'publie')
        .order('date_publication', { ascending: false })
        .limit(100)
        .then(({ data }) => {
          setArticles(data || []);
          setLoadingArticles(false);
        });
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !articleSlug.trim()) return;
    
    // Find article by slug
    const article = articles.find(a => a.slug === articleSlug);
    if (!article) {
      alert('Article non trouvé');
      return;
    }
    
    onSave({
      id: initialData?.id,
      author: author || initialData?.author,
      avatar: avatar || initialData?.avatar,
      content: content.trim(),
      article_slug: articleSlug,
      article_id: article.id,
      article_titre: article.title || article.titre,
      created_at: date ? new Date(date).toISOString() : new Date().toISOString(),
    });
  };

  return open ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg flex flex-col gap-6 relative animate-fade-in">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 bg-gray-200 text-[#ff184e] p-2 rounded-full hover:scale-110 transition"><X className="w-6 h-6" /></button>
        <h3 className="text-2xl font-bold text-[#232b46] mb-2">{initialData ? 'Éditer le commentaire' : 'Nouveau commentaire'}</h3>
        {!initialData && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Auteur (optionnel)</label>
              <input 
                value={author} 
                onChange={e => setAuthor(e.target.value)} 
                placeholder="Laisser vide pour utiliser l'utilisateur connecté" 
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#4f8cff] focus:ring-2 focus:ring-[#4f8cff]/20 outline-none text-sm font-poppins" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Avatar (URL, optionnel)</label>
              <input 
                value={avatar} 
                onChange={e => setAvatar(e.target.value)} 
                placeholder="Laisser vide pour générer automatiquement" 
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#4f8cff] focus:ring-2 focus:ring-[#4f8cff]/20 outline-none text-sm font-poppins" 
              />
            </div>
          </>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Commentaire <span className="text-red-500">*</span></label>
          <textarea 
            value={content} 
            onChange={e => setContent(e.target.value)} 
            required 
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#4f8cff] focus:ring-2 focus:ring-[#4f8cff]/20 outline-none text-sm font-poppins min-h-[100px] resize-y" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Article <span className="text-red-500">*</span></label>
          {loadingArticles ? (
            <div className="text-sm text-gray-500 py-2.5">Chargement des articles...</div>
          ) : (
            <select 
              value={articleSlug} 
              onChange={e => setArticleSlug(e.target.value)} 
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#4f8cff] focus:ring-2 focus:ring-[#4f8cff]/20 outline-none text-sm font-poppins"
            >
              <option value="">Sélectionner un article</option>
              {articles.map(article => (
                <option key={article.id} value={article.slug}>
                  {article.title || article.titre} ({article.slug})
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Date <span className="text-red-500">*</span></label>
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            required 
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#4f8cff] focus:ring-2 focus:ring-[#4f8cff]/20 outline-none text-sm font-poppins" 
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button 
            type="submit" 
            className="px-5 py-2.5 rounded-lg bg-[#4f8cff] text-white text-sm font-medium hover:bg-[#2563eb] transition-colors shadow-sm"
          >
            {initialData ? 'Enregistrer' : 'Créer le commentaire'}
          </button>
        </div>
      </form>
    </div>
  ) : null;
};

export default CommentsPage; 