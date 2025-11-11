import React, { useState, useRef } from "react";
import { X, Edit2, Trash2, User, Search, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

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
  const handleSave = async (comment) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (comment.id) {
        // Update
        const { error: updateError } = await supabase.from('comments').update({
          author: comment.author,
          avatar: comment.avatar,
          content: comment.content,
          article_titre: comment.article_titre,
          article_url: comment.article_url,
          created_at: comment.created_at,
        }).eq('id', comment.id);
        if (updateError) throw updateError;
        setSuccess('Commentaire modifié !');
      } else {
        // Insert
        const { error: insertError } = await supabase.from('comments').insert([{
          author: comment.author,
          avatar: comment.avatar,
          content: comment.content,
          article_titre: comment.article_titre,
          article_url: comment.article_url,
          created_at: comment.created_at,
        }]);
        if (insertError) throw insertError;
        setSuccess('Commentaire ajouté !');
      }
      setModalOpen(false);
      setEditComment(null);
      fetchComments();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l’enregistrement.');
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
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f9fafd] to-[#e6eaff] flex flex-col items-center py-0 px-0 font-jost">
      <div className="w-full max-w-7xl flex-1 flex flex-col justify-start items-center px-2 sm:px-6 md:px-10 py-10">
        {/* Barre sticky */}
        <div className="w-full sticky top-0 z-20 bg-white/80 backdrop-blur-md rounded-b-2xl shadow-lg mb-8 px-4 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-[#e5e9f2]">
          <div>
            <h2 className="text-3xl font-bold mb-2 text-[#232b46] flex items-center gap-2">🗨️ Commentaires</h2>
            <div className="flex flex-wrap gap-4 text-base text-gray-600">
              <span>Total : <b>{total}</b></span>
              {topArticles.length > 0 && <span>Top articles : {topArticles.map(([titre, count]) => <span key={titre} className="ml-1">{titre} <span className="text-xs text-gray-400">({Number(count)})</span></span>)}</span>}
              {topAuthors.length > 0 && <span>Top auteurs : {topAuthors.map(([author, count]) => <span key={author} className="ml-1">{author} <span className="text-xs text-gray-400">({Number(count)})</span></span>)}</span>}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 items-center justify-end">
            <div className="relative">
              <input type="text" placeholder="Recherche auteur, texte, article..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-[#4f8cff] outline-none text-base bg-white shadow-sm" />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <button onClick={() => { setEditComment(null); setModalOpen(true); }} className="px-5 py-2 rounded-xl bg-[#4f8cff] text-white font-bold shadow hover:bg-[#2563eb] transition">+ Ajouter</button>
          </div>
        </div>
        {/* Tableau moderne */}
        <div className="w-full bg-white rounded-3xl shadow-2xl p-0 overflow-x-auto mb-10">
          <table className="w-full min-w-[900px] bg-white rounded-3xl overflow-hidden">
            <thead>
              <tr className="bg-[#f1f3fa] text-[#232b46] text-lg">
                <th className="py-4 px-6">Auteur</th>
                <th className="py-4 px-6">Avatar</th>
                <th className="py-4 px-6">Commentaire</th>
                <th className="py-4 px-6">Article</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-gray-400 text-lg">Aucun commentaire trouvé.</td></tr>
              ) : (
                paginated.map(comment => (
                  <tr key={comment.id} className="border-b hover:bg-[#f9fafd] transition">
                    <td className="py-4 px-6 font-medium text-[#232b46] text-base">{comment.author}</td>
                    <td className="py-4 px-6 text-center">
                      {comment.avatar ? <img src={comment.avatar} alt={comment.author} className="w-12 h-12 rounded-full object-cover mx-auto border-2 border-gray-200" /> : <User className="w-10 h-10 text-gray-300 mx-auto" />}
                    </td>
                    <td className="py-4 px-6 text-gray-700 text-base max-w-[320px] break-words">{comment.content}</td>
                    <td className="py-4 px-6">
                      <a href={comment.article_url} target="_blank" rel="noopener noreferrer" className="text-[#4f8cff] font-semibold flex items-center gap-1 hover:underline">
                        {comment.article_titre} <ExternalLink className="w-4 h-4" />
                      </a>
                    </td>
                    <td className="py-4 px-6 text-gray-500 text-base">{comment.created_at}</td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => { setEditComment(comment); setModalOpen(true); }} className="bg-[#ffc107] text-[#232b46] p-2 rounded-full shadow hover:scale-110 transition" title="Éditer"><Edit2 className="w-5 h-5" /></button>
                        <button onClick={() => setConfirmDelete(comment)} className="bg-[#ff184e] text-white p-2 rounded-full shadow hover:scale-110 transition" title="Supprimer"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {pageCount > 1 && (
          <div className="flex justify-center gap-4 mb-10">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-6 py-3 rounded-xl border border-gray-200 text-base font-bold bg-white shadow disabled:opacity-50">Précédent</button>
            <span className="px-6 py-3 text-base font-bold">Page {page} / {pageCount}</span>
            <button onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page === pageCount} className="px-6 py-3 rounded-xl border border-gray-200 text-base font-bold bg-white shadow disabled:opacity-50">Suivant</button>
          </div>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-10 rounded-2xl shadow-2xl">
              <div className="text-2xl font-bold mb-8 text-[#ff184e]">Supprimer le commentaire de "{confirmDelete.author}" ?</div>
              <div className="flex justify-end gap-6">
                <button onClick={() => setConfirmDelete(null)} className="bg-gray-200 text-[#ff184e] px-6 py-3 rounded-xl font-semibold hover:scale-105 transition">Annuler</button>
                <button onClick={() => handleDelete(confirmDelete)} className="bg-[#ff184e] text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition">Supprimer</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Modale ajout/édition commentaire
const CommentModal = ({ open, onClose, onSave, initialData }) => {
  const [author, setAuthor] = useState(initialData?.author || "");
  const [avatar, setAvatar] = useState(initialData?.avatar || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [article, setArticle] = useState(initialData?.article_titre || "");
  const [date, setDate] = useState(initialData?.created_at || "");

  const handleSubmit = e => {
    e.preventDefault();
    if (!author.trim() || !content.trim() || !article.trim() || !date.trim()) return;
    onSave({
      id: initialData?.id,
      author,
      avatar,
      content,
      article_titre: article,
      article_url: initialData?.article_url || "#",
      created_at: date,
    });
  };

  return open ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg flex flex-col gap-6 relative animate-fade-in">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 bg-gray-200 text-[#ff184e] p-2 rounded-full hover:scale-110 transition"><X className="w-6 h-6" /></button>
        <h3 className="text-2xl font-bold text-[#232b46] mb-2">{initialData ? 'Éditer le commentaire' : 'Nouveau commentaire'}</h3>
        <div>
          <label className="block font-bold mb-2 text-[#232b46]">Auteur :</label>
          <input value={author} onChange={e => setAuthor(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#4f8cff] outline-none text-lg" />
        </div>
        <div>
          <label className="block font-bold mb-2 text-[#232b46]">Avatar (URL) :</label>
          <input value={avatar} onChange={e => setAvatar(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#4f8cff] outline-none text-lg" />
        </div>
        <div>
          <label className="block font-bold mb-2 text-[#232b46]">Commentaire :</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#4f8cff] outline-none text-lg min-h-[80px]" />
        </div>
        <div>
          <label className="block font-bold mb-2 text-[#232b46]">Article :</label>
          <input value={article} onChange={e => setArticle(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#4f8cff] outline-none text-lg" />
        </div>
        <div>
          <label className="block font-bold mb-2 text-[#232b46]">Date :</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#4f8cff] outline-none text-lg" />
        </div>
        <button type="submit" className="mt-4 px-6 py-3 rounded-xl bg-[#4f8cff] text-white font-bold shadow hover:bg-[#2563eb] transition">{initialData ? 'Enregistrer' : 'Créer le commentaire'}</button>
      </form>
    </div>
  ) : null;
};

export default CommentsPage; 