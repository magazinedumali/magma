import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Edit2, Trash2, X, Link as LinkIcon } from 'lucide-react';

type Page = {
  id: string;
  title: string;
  path: string;
  is_active: boolean;
};

const emptyPage: Omit<Page, 'id'> = {
  title: '',
  path: '',
  is_active: true,
};

const PagesAdminPage = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPage, setEditPage] = useState<Page | null>(null);
  const [form, setForm] = useState(emptyPage);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchPages = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .order('title', { ascending: true });
    if (error) setError(error.message);
    else setPages(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPages(); }, []);

  const openModal = (page?: Page) => {
    if (page) {
      setEditPage(page);
      setForm({ ...page });
    } else {
      setEditPage(null);
      setForm(emptyPage);
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (editPage) {
        const { error } = await supabase
          .from('pages')
          .update({ ...form })
          .eq('id', editPage.id);
        if (error) throw error;
        setSuccess('Page modifiée !');
      } else {
        const { error } = await supabase
          .from('pages')
          .insert([{ ...form }]);
        if (error) throw error;
        setSuccess('Page ajoutée !');
      }
      setModalOpen(false);
      fetchPages();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Supprimer définitivement la page "${title}" ?`)) return;
    setLoading(true);
    setError(null);
    try {
      await supabase.from('pages').delete().eq('id', id);
      setSuccess('Page supprimée !');
      fetchPages();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-jost text-[var(--text-primary)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Gestion des pages dynamiques</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">Gérez les différentes pages accessibles sur votre site</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-[var(--accent)] hover:brightness-110 text-white px-5 py-2.5 rounded-xl font-semibold shadow-[0_4px_16px_var(--accent-glow)] transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" /> Ajouter une page
        </button>
      </div>

      {(error || success) && (
        <div className="mb-6 flex flex-col gap-2">
          {error && <div className="text-red-400 font-medium bg-red-500/10 p-4 rounded-xl border border-red-500/20 animate-fadeIn">{error}</div>}
          {success && <div className="text-green-400 font-medium bg-green-500/10 p-4 rounded-xl border border-green-500/20 animate-fadeIn">{success}</div>}
        </div>
      )}

      <div className="dark-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/20">
                <th className="p-4 font-semibold text-[var(--text-secondary)] text-sm">Titre</th>
                <th className="p-4 font-semibold text-[var(--text-secondary)] text-sm">Chemin (URL)</th>
                <th className="p-4 font-semibold text-[var(--text-secondary)] text-sm">Statut</th>
                <th className="p-4 font-semibold text-[var(--text-secondary)] text-sm text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && pages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-[var(--text-muted)]">
                     <div className="flex flex-col items-center justify-center">
                        <svg className="animate-spin h-8 w-8 mb-4 text-[var(--accent)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                        Chargement...
                     </div>
                  </td>
                </tr>
              ) : pages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-[var(--text-muted)]">
                    <LinkIcon className="w-12 h-12 mx-auto mb-3 opacity-50 text-[var(--text-muted)]" />
                    Aucune page trouvée.
                  </td>
                </tr>
              ) : (
                pages.map(page => (
                  <tr key={page.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="p-4 font-semibold text-[var(--text-primary)]">{page.title}</td>
                    <td className="p-4 text-[var(--text-secondary)] font-mono text-sm bg-black/20 w-max px-3 py-1.5 rounded-lg border border-white/5 my-2 inline-block ml-4">{page.path}</td>
                    <td className="p-4">
                      {page.is_active ? (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                           Active
                        </span>
                      ) : (
                        <span className="bg-white/10 text-white/50 border border-white/10 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
                           Désactivée
                        </span>
                      )}
                    </td>
                    <td className="p-4 w-32">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openModal(page)}
                          disabled={loading}
                          className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors border border-blue-500/20"
                          title="Éditer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(page.id, page.title)}
                          disabled={loading}
                          className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors border border-red-500/20"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal ajout/édition */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl p-8 max-w-lg w-full relative animate-modalIn">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-2xl font-bold text-white mb-6">
              {editPage ? 'Éditer la page' : 'Ajouter une page'}
            </h3>
            
            <form onSubmit={handleSave} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Titre de la page</label>
                <input 
                  required 
                  placeholder="Ex: Politique de confidentialité" 
                  value={form.title} 
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} 
                  className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-muted)]" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Chemin d'accès (URL)</label>
                <input 
                  required 
                  placeholder="Ex: /privacy, /contact, /about" 
                  value={form.path} 
                  onChange={e => setForm(f => ({ ...f, path: e.target.value }))} 
                  className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-muted)] font-mono" 
                />
              </div>

              <label className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-black/20 cursor-pointer hover:bg-black/30 transition-colors mt-2">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    checked={form.is_active} 
                    onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} 
                    className="peer sr-only" 
                  />
                  <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
                </div>
                <span className="text-sm font-medium text-white">Page publique (visible)</span>
              </label>

              <div className="flex gap-4 mt-6">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)} 
                  className="flex-1 bg-white/5 border border-white/10 text-[var(--text-primary)] px-4 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors" 
                  disabled={loading}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-[var(--accent)] shadow-[0_4px_16px_var(--accent-glow)] text-white px-4 py-3 rounded-xl font-bold hover:brightness-110 transition-all flex justify-center" 
                  disabled={loading}
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                  ) : (
                    editPage ? 'Enregistrer' : 'Ajouter'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PagesAdminPage;
