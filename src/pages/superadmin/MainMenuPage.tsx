import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import RequireSuperAdminAuth from './RequireSuperAdminAuth';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

// Type du menu principal
export type MainMenuItem = {
  id: string;
  name: string;
  path: string;
  has_dropdown: boolean;
  hot: boolean;
  order: number;
  parent_id?: string | null;
  link_type: 'internal' | 'external';
  target_blank: boolean;
};

// Ajout du type Page pour la liste dynamique
type Page = {
  id: string;
  title: string;
  path: string;
  is_active: boolean;
};

const emptyItem: Omit<MainMenuItem, 'id'> = {
  name: '',
  path: '',
  has_dropdown: false,
  hot: false,
  order: 0,
  parent_id: null,
  link_type: 'internal',
  target_blank: false,
};

const MainMenuPage = () => {
  const [items, setItems] = useState<MainMenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<MainMenuItem | null>(null);
  const [form, setForm] = useState(emptyItem);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<Page[]>([]);

  // Charger les éléments du menu
  const fetchMenu = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('main_menu')
      .select('*')
      .order('order', { ascending: true });
    if (error) setError(error.message);
    else setItems(data || []);
    setLoading(false);
  };

  // Charger les pages dynamiquement
  useEffect(() => {
    const fetchPages = async () => {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('is_active', true)
        .order('title', { ascending: true });
      if (!error && data) setPages(data);
    };
    fetchPages();
  }, []);

  useEffect(() => { fetchMenu(); }, []);

  // Ouvrir le modal pour ajouter ou éditer
  const openModal = (item?: MainMenuItem) => {
    if (item) {
      setEditItem(item);
      setForm({ ...item });
    } else {
      setEditItem(null);
      setForm(emptyItem);
    }
    setModalOpen(true);
  };

  // Sauvegarder (ajout ou édition)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (editItem) {
      // Update
      const { error } = await supabase
        .from('main_menu')
        .update({ ...form })
        .eq('id', editItem.id);
      if (error) setError(error.message);
    } else {
      // Insert
      const { error } = await supabase
        .from('main_menu')
        .insert([{ ...form }]);
      if (error) setError(error.message);
    }
    setModalOpen(false);
    setLoading(false);
    fetchMenu();
  };

  // Supprimer
  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cet élément du menu ?')) return;
    setLoading(true);
    await supabase.from('main_menu').delete().eq('id', id);
    setLoading(false);
    fetchMenu();
  };

  // Drag & drop handlers
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const newItems = Array.from(items);
    const [removed] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, removed);
    // Met à jour l'ordre localement
    setItems(newItems);
    // Met à jour l'ordre dans Supabase
    await Promise.all(newItems.map((item, idx) =>
      supabase.from('main_menu').update({ order: idx }).eq('id', item.id)
    ));
    fetchMenu();
  };

  return (
    <RequireSuperAdminAuth>
      <div style={{ padding: 32, fontFamily: 'Jost, sans-serif' }}>
        <h2 style={{ marginBottom: 24 }}>Gestion du menu principal</h2>
        <button
          style={{ background: '#4f8cff', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 18px', fontWeight: 500, marginBottom: 24, fontSize: 16 }}
          onClick={() => openModal()}
        >
          + Ajouter un élément
        </button>
        {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="main-menu-droppable">
            {(provided) => (
              <table ref={provided.innerRef} {...provided.droppableProps} style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001' }}>
                <thead>
                  <tr style={{ background: '#f5f7fa', textAlign: 'left' }}>
                    <th style={{ padding: 12 }}>Nom</th>
                    <th style={{ padding: 12 }}>Parent</th>
                    <th style={{ padding: 12 }}>Chemin/URL</th>
                    <th style={{ padding: 12 }}>Type</th>
                    <th style={{ padding: 12 }}>Dropdown</th>
                    <th style={{ padding: 12 }}>Hot</th>
                    <th style={{ padding: 12 }}>Ordre</th>
                    <th style={{ padding: 12, width: 120 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center', color: '#aaa' }}>Aucun élément.</td></tr>
                  ) : (
                    items
                      .filter(item => !item.parent_id)
                      .map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <tr
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                background: snapshot.isDragging ? '#e5e9f2' : undefined
                              }}
                            >
                              <td style={{ padding: 12 }}>{item.name}</td>
                              <td style={{ padding: 12 }}>{item.parent_id ? (items.find(i => i.id === item.parent_id)?.name || '-') : '-'}</td>
                              <td style={{ padding: 12 }}>{item.path}</td>
                              <td style={{ padding: 12 }}>{item.link_type === 'external' ? 'Externe' : 'Interne'}</td>
                              <td style={{ padding: 12 }}>{item.has_dropdown ? 'Oui' : 'Non'}</td>
                              <td style={{ padding: 12 }}>{item.hot ? 'Oui' : 'Non'}</td>
                              <td style={{ padding: 12 }}>{item.order}</td>
                              <td style={{ padding: 12 }}>
                                <button
                                  style={{ background: '#e5e9f2', border: 'none', borderRadius: 6, padding: '6px 12px', marginRight: 8, cursor: 'pointer' }}
                                  onClick={() => openModal(item)}
                                >
                                  Éditer
                                </button>
                                <button
                                  style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}
                                  onClick={() => handleDelete(item.id)}
                                >
                                  Supprimer
                                </button>
                              </td>
                            </tr>
                          )}
                        </Draggable>
                      ))
                  )}
                  {provided.placeholder}
                </tbody>
              </table>
            )}
          </Droppable>
        </DragDropContext>
        {/* Modal ajout/édition */}
        {modalOpen && (
          <div style={{
            position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 340, boxShadow: '0 2px 8px #0002' }}>
              <h3 style={{ marginBottom: 18 }}>{editItem ? 'Éditer' : 'Ajouter'} un élément</h3>
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input required placeholder="Nom" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2' }} />
                {form.link_type === 'internal' ? (
                  <label>Page du site
                    <select
                      required
                      value={form.path}
                      onChange={e => setForm(f => ({ ...f, path: e.target.value }))}
                      style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2' }}
                    >
                      <option value="">Sélectionner une page</option>
                      {pages.map(page => (
                        <option key={page.id} value={page.path}>{page.title} ({page.path})</option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <input required placeholder="URL externe" value={form.path} onChange={e => setForm(f => ({ ...f, path: e.target.value }))} style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2' }} />
                )}
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={form.has_dropdown} onChange={e => setForm(f => ({ ...f, has_dropdown: e.target.checked }))} /> Dropdown
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={form.hot} onChange={e => setForm(f => ({ ...f, hot: e.target.checked }))} /> Hot
                </label>
                <input type="number" required placeholder="Ordre" value={form.order} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2' }} />
                <label>Parent
                  <select value={form.parent_id || ''} onChange={e => setForm(f => ({ ...f, parent_id: e.target.value || null }))} style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2' }}>
                    <option value="">Aucun (menu principal)</option>
                    {items.filter(i => !editItem || i.id !== editItem.id).map(i => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                  </select>
                </label>
                <label>Type de lien
                  <select value={form.link_type} onChange={e => setForm(f => ({ ...f, link_type: e.target.value as 'internal' | 'external' }))} style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2' }}>
                    <option value="internal">Interne</option>
                    <option value="external">Externe</option>
                  </select>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={form.target_blank} onChange={e => setForm(f => ({ ...f, target_blank: e.target.checked }))} /> Ouvrir dans un nouvel onglet
                </label>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                  <button type="button" onClick={() => setModalOpen(false)} style={{ background: '#eee', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>Annuler</button>
                  <button type="submit" style={{ background: '#4f8cff', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>{editItem ? 'Enregistrer' : 'Ajouter'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RequireSuperAdminAuth>
  );
};

export default MainMenuPage; 