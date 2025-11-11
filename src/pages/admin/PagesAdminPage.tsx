import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette page ?')) return;
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
    <div style={{ padding: 32, fontFamily: 'Jost, sans-serif' }}>
      <h2 style={{ marginBottom: 24 }}>Gestion des pages du site</h2>
      <button
        style={{ background: '#4f8cff', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 18px', fontWeight: 500, marginBottom: 24, fontSize: 16, cursor: 'pointer' }}
        onClick={() => openModal()}
      >
        + Ajouter une page
      </button>
      {error && <div style={{ color: 'red', marginBottom: 16, padding: 12, background: '#fee', borderRadius: 6 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: 16, padding: 12, background: '#efe', borderRadius: 6 }}>{success}</div>}
      {loading && pages.length === 0 && <div style={{ padding: 24, textAlign: 'center' }}>Chargement...</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001' }}>
        <thead>
          <tr style={{ background: '#f5f7fa', textAlign: 'left' }}>
            <th style={{ padding: 12 }}>Titre</th>
            <th style={{ padding: 12 }}>Chemin</th>
            <th style={{ padding: 12 }}>Active</th>
            <th style={{ padding: 12, width: 120 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pages.length === 0 && !loading ? (
            <tr><td colSpan={4} style={{ padding: 24, textAlign: 'center', color: '#aaa' }}>Aucune page.</td></tr>
          ) : (
            pages.map(page => (
              <tr key={page.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                <td style={{ padding: 12 }}>{page.title}</td>
                <td style={{ padding: 12 }}>{page.path}</td>
                <td style={{ padding: 12 }}>{page.is_active ? 'Oui' : 'Non'}</td>
                <td style={{ padding: 12 }}>
                  <button
                    style={{ background: '#e5e9f2', border: 'none', borderRadius: 6, padding: '6px 12px', marginRight: 8, cursor: 'pointer' }}
                    onClick={() => openModal(page)}
                    disabled={loading}
                  >
                    Éditer
                  </button>
                  <button
                    style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}
                    onClick={() => handleDelete(page.id)}
                    disabled={loading}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* Modal ajout/édition */}
      {modalOpen && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 340, boxShadow: '0 2px 8px #0002' }}>
            <h3 style={{ marginBottom: 18 }}>{editPage ? 'Éditer' : 'Ajouter'} une page</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input required placeholder="Titre" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2' }} />
              <input required placeholder="Chemin (ex: /, /articles, /contact)" value={form.path} onChange={e => setForm(f => ({ ...f, path: e.target.value }))} style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2' }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} /> Active
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <button type="button" onClick={() => setModalOpen(false)} style={{ background: '#eee', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }} disabled={loading}>Annuler</button>
                <button type="submit" style={{ background: '#4f8cff', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }} disabled={loading}>{loading ? 'Enregistrement...' : (editPage ? 'Enregistrer' : 'Ajouter')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PagesAdminPage;
