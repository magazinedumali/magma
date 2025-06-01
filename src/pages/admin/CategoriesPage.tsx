import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette catégorie ?')) return;
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

  if (loading) {
    return <div style={{ padding: 32, textAlign: 'center' }}>Chargement...</div>;
  }

  return (
    <div style={{ padding: 32, fontFamily: 'Jost, sans-serif', maxWidth: 600 }}>
      <h2 style={{ marginBottom: 24 }}>Gestion des catégories</h2>
      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Nouvelle catégorie"
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #e5e9f2', fontSize: 16 }}
        />
        <button
          type="submit"
          style={{ background: '#4f8cff', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', fontWeight: 500, fontSize: 16 }}
        >
          Ajouter
        </button>
      </form>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f7fa', textAlign: 'left' }}>
              <th style={{ padding: 12 }}>Nom</th>
              <th style={{ padding: 12, width: 120 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={2} style={{ padding: 24, textAlign: 'center', color: '#aaa' }}>
                  Aucune catégorie trouvée.
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                  <td style={{ padding: 12 }}>
                    {editingId === cat.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={e => setEditingName(e.target.value)}
                        style={{ padding: 8, borderRadius: 6, border: '1px solid #e5e9f2', fontSize: 15 }}
                      />
                    ) : (
                      cat.name
                    )}
                  </td>
                  <td style={{ padding: 12 }}>
                    {editingId === cat.id ? (
                      <>
                        <button
                          onClick={() => handleEditSave(cat.id)}
                          style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', marginRight: 8, fontSize: 14, cursor: 'pointer' }}
                        >
                          Sauver
                        </button>
                        <button
                          onClick={() => { setEditingId(null); setEditingName(''); }}
                          style={{ background: '#e5e9f2', color: '#23272f', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 14, cursor: 'pointer' }}
                        >
                          Annuler
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(cat.id, cat.name)}
                          style={{ background: '#e5e9f2', color: '#23272f', border: 'none', borderRadius: 6, padding: '6px 14px', marginRight: 8, fontSize: 14, cursor: 'pointer' }}
                        >
                          Éditer
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 14, cursor: 'pointer' }}
                        >
                          Supprimer
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoriesPage; 