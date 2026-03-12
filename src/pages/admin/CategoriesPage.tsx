import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Plus, Edit2, Trash2, Check, X, Tag } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  created_at: string;
}

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase
        .from('categories')
        .insert([{ name: newCategory }]);
      if (error) throw error;
      setNewCategory('');
      fetchCategories();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Supprimer définitivement la catégorie "${name}" ?`)) return;
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchCategories();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleEditSave = async (id: string) => {
    if (!editingName.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase
        .from('categories')
        .update({ name: editingName })
        .eq('id', id);
      if (error) throw error;
      setEditingId(null);
      setEditingName('');
      fetchCategories();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
        <svg className="animate-spin h-8 w-8 mb-4 text-[var(--accent)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
        Chargement des catégories...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 font-jost text-[var(--text-primary)]">
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Gestion des catégories</h2>
        <p className="text-[var(--text-muted)] text-sm mt-2">Créez et gérez les catégories pour organiser vos articles</p>
      </div>

      {error && (
        <div className="mb-6 text-red-400 font-medium bg-red-500/10 p-4 rounded-xl border border-red-500/20 animate-fadeIn">
           {error}
        </div>
      )}
      
      <form onSubmit={handleAdd} className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Nom de la nouvelle catégorie..."
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--accent)] transition-all placeholder-[var(--text-muted)] shadow-inner"
          />
          <Tag className="w-5 h-5 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <button
          type="submit"
          disabled={loading || !newCategory.trim()}
          className="bg-[var(--accent)] text-white px-6 py-3 rounded-xl font-bold hover:brightness-110 shadow-[0_4px_16px_var(--accent-glow)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          Ajouter
        </button>
      </form>

      <div className="dark-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/20">
                <th className="p-4 font-semibold text-[var(--text-secondary)] text-sm uppercase tracking-wider">Nom de la catégorie</th>
                <th className="p-4 font-semibold text-[var(--text-secondary)] text-sm uppercase tracking-wider w-48 text-right pr-8">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={2} className="p-12 text-center text-[var(--text-muted)]">
                    <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    Aucune catégorie existante.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      {editingId === cat.id ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                          className="w-full max-w-sm px-4 py-2 bg-black/50 border border-[var(--accent)] rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleEditSave(cat.id)}
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 text-[var(--text-muted)]">
                              <Tag className="w-4 h-4" />
                           </div>
                           <span className="font-semibold text-[var(--text-primary)] text-lg">{cat.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {editingId === cat.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditSave(cat.id)}
                            className="p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition-all border border-emerald-500/30"
                            title="Sauvegarder"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setEditingId(null); setEditingName(''); }}
                            className="p-2 bg-white/10 text-[var(--text-secondary)] hover:bg-white/20 hover:text-white rounded-lg transition-all border border-white/10"
                            title="Annuler"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(cat.id, cat.name)}
                            className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-all border border-blue-500/20 hover:border-blue-500"
                            title="Éditer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id, cat.name)}
                            className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all border border-red-500/20 hover:border-red-500"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;