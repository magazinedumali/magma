import { useState, useEffect } from 'react';
import { useCategories } from '@/components/admin-dashboard/useCategories';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
  const { categories, loading, error } = useCategories();
  const [modalOpen, setModalOpen] = useState(false);
  const [editCat, setEditCat] = useState(null); // {id, name}
  const [name, setName] = useState('');
  const [articleCounts, setArticleCounts] = useState({});
  const [loadingAction, setLoadingAction] = useState(false);

  // Fetch nombre d'articles par catégorie
  useEffect(() => {
    if (!categories.length) return;
    (async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('categorie', { count: 'exact', head: false });
      if (!error && data) {
        const counts = {};
        data.forEach(row => {
          if (row.categorie) {
            counts[row.categorie] = (counts[row.categorie] || 0) + 1;
          }
        });
        setArticleCounts(counts);
      }
    })();
  }, [categories]);

  // Ouvre la modale pour ajout ou édition
  const openModal = (cat = null) => {
    setEditCat(cat);
    setName(cat ? cat.name : '');
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditCat(null);
    setName('');
  };

  // Ajout ou édition
  const handleSave = async () => {
    if (!name.trim()) return toast.error('Nom requis');
    setLoadingAction(true);
    if (editCat) {
      const { error } = await supabase.from('categories').update({ name }).eq('id', editCat.id);
      if (error) toast.error(error.message); else toast.success('Catégorie modifiée !');
    } else {
      const { error } = await supabase.from('categories').insert({ name });
      if (error) toast.error(error.message); else toast.success('Catégorie ajoutée !');
    }
    setLoadingAction(false);
    closeModal();
    setTimeout(() => window.location.reload(), 800);
  };

  // Suppression
  const handleDelete = async (cat) => {
    if (!window.confirm('Supprimer cette catégorie ?')) return;
    setLoadingAction(true);
    const { error } = await supabase.from('categories').delete().eq('id', cat.id);
    if (error) toast.error(error.message); else toast.success('Catégorie supprimée !');
    setLoadingAction(false);
    setTimeout(() => window.location.reload(), 800);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Catégories</h1>
        <button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold shadow transition flex items-center gap-2">
          <span className="text-xl">＋</span> Nouvelle catégorie
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><span className="loader"></span></div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl shadow-lg bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Articles</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-blue-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-800 flex items-center gap-2">
                    <span className="inline-block w-7 h-7 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center">{cat.name[0]}</span>
                    {cat.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full font-mono">{articleCounts[cat.name] || 0}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right flex gap-2 justify-end">
                    <button onClick={() => openModal(cat)} className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded shadow text-xs">Éditer</button>
                    <button onClick={() => handleDelete(cat)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow text-xs">Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* MODALE AJOUT/EDITION */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-popIn">
            <button onClick={closeModal} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
            <h2 className="text-xl font-bold mb-4">{editCat ? 'Éditer' : 'Nouvelle'} catégorie</h2>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Nom de la catégorie" className="input input-bordered w-full mb-4" autoFocus />
            {/* Futur: couleur, description */}
            <div className="flex gap-4 justify-end mt-6">
              <button onClick={closeModal} className="bg-gray-200 text-gray-700 px-4 py-2 rounded">Annuler</button>
              <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded font-bold" disabled={loadingAction}>{loadingAction ? 'Enregistrement...' : 'Valider'}</button>
            </div>
          </div>
        </div>
      )}
      {/* Loader animé global */}
      {loadingAction && <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50"><span className="loader"></span></div>}
      <style>{`
        .loader { border: 4px solid #e5e7eb; border-top: 4px solid #4f8cff; border-radius: 50%; width: 32px; height: 32px; animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .animate-fadeIn { animation: fadeIn .2s; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-popIn { animation: popIn .2s; } @keyframes popIn { from { transform: scale(.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
} 