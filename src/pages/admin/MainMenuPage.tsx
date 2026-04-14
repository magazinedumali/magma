import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Edit2, Trash2, X, GripVertical, Link as LinkIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingBar } from '@/components/ui/loading-bar';

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
  const [success, setSuccess] = useState<string | null>(null);
  const [pages, setPages] = useState<Page[]>([]);

  // Charger les éléments du menu
  const fetchMenu = async () => {
    setLoading(true);
    setError(null);
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
    setSuccess(null);
    try {
      if (editItem) {
        // Update
        const { error } = await supabase
          .from('main_menu')
          .update({ ...form })
          .eq('id', editItem.id);
        if (error) throw error;
        setSuccess('Élément du menu modifié !');
      } else {
        // Insert
        // Attribuer l'ordre le plus élevé par défaut si non spécifié ou si nouvel item principal
        let newOrder = form.order;
        if (!editItem && !form.parent_id) {
           const topLevelItems = items.filter(i => !i.parent_id);
           newOrder = topLevelItems.length > 0 ? Math.max(...topLevelItems.map(i => i.order)) + 1 : 0;
           setForm(f => ({...f, order: newOrder})); // Update local form state too
        }

        const { error } = await supabase
          .from('main_menu')
          .insert([{ ...form, order: newOrder }]);
        if (error) throw error;
        setSuccess('Élément du menu ajouté !');
      }
      setModalOpen(false);
      fetchMenu();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement.');
    } finally {
      setLoading(false);
    }
  };

  // Supprimer
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Supprimer définitivement l'élément de menu "${name}" ?`)) return;
    setLoading(true);
    setError(null);
    try {
      await supabase.from('main_menu').delete().eq('id', id);
      setSuccess('Élément du menu supprimé !');
      fetchMenu();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression.');
    } finally {
      setLoading(false);
    }
  };

  // Drag & drop handlers
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const newItems = Array.from(items.filter(i => !i.parent_id)); // On ne réorganise que les parents pour le moment
    const [removed] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, removed);
    
    // Met à jour l'ordre localement (seulement pour l'affichage immédiat)
    // C'est un peu complexe car items contient aussi les enfants
    const updatedItems = items.map(item => {
      const topLevelIndex = newItems.findIndex(i => i.id === item.id);
      if (topLevelIndex !== -1) {
        return { ...item, order: topLevelIndex }; 
      }
      return item;
    });
    setItems(updatedItems);
    
    // Met à jour l'ordre dans Supabase
    try {
      await Promise.all(newItems.map((item, idx) =>
        supabase.from('main_menu').update({ order: idx }).eq('id', item.id)
      ));
    } catch (err) {
       console.error("Erreur réorganisation menu", err);
       fetchMenu(); // Revert on failure
    }
  };

  return (
    <div className="font-jost text-[var(--text-primary)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold admin-dashboard-title">Structure du Menu</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">Organisez la navigation principale de votre site (Drag & Drop pour réordonner)</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-[var(--accent)] hover:brightness-110 text-white px-5 py-2.5 rounded-xl font-semibold shadow-[0_4px_16px_var(--accent-glow)] transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" /> Ajouter un lien
        </button>
      </div>

      {(error || success) && (
        <div className="mb-6 flex flex-col gap-2">
          {error && <div className="text-red-400 font-medium bg-red-500/10 p-4 rounded-xl border border-red-500/20 animate-fadeIn">{error}</div>}
          {success && <div className="text-green-400 font-medium bg-green-500/10 p-4 rounded-xl border border-green-500/20 animate-fadeIn">{success}</div>}
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="dark-card p-4 flex items-center gap-4">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-4 flex-1 max-w-[200px]" />
              <Skeleton className="h-4 flex-1 max-w-[280px]" />
              <Skeleton className="h-8 w-20 rounded" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="dark-card p-12 text-center text-[var(--text-muted)] mt-4">
          <LinkIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium text-lg">Le menu principal est vide.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
           {/* Header for table-like look */}
           <div className="hidden lg:grid grid-cols-[auto_1fr_1fr_100px_100px_120px] gap-4 px-6 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-sm font-semibold text-[var(--text-secondary)]">
              <div className="w-8"></div>
              <div>Nom du lien</div>
              <div>Destination (URL)</div>
              <div className="text-center">Type</div>
              <div className="text-center">Tags</div>
              <div className="text-center">Actions</div>
           </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="main-menu-droppable">
              {(provided) => (
                <div 
                  ref={provided.innerRef} 
                  {...provided.droppableProps}
                  className="flex flex-col gap-3"
                >
                  {items
                    .filter(item => !item.parent_id)
                    .sort((a, b) => a.order - b.order)
                    .map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex flex-col p-4 bg-[var(--bg-card)] border ${snapshot.isDragging ? 'border-[var(--accent)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-50' : 'border-[var(--border)] hover:border-white/10'} rounded-xl transition-colors`}
                            style={provided.draggableProps.style}
                          >
                            <div className="flex flex-col lg:grid lg:grid-cols-[auto_1fr_1fr_100px_100px_120px] gap-4 items-center">
                              <div 
                                {...provided.dragHandleProps} 
                                className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-white cursor-grab active:cursor-grabbing self-start lg:self-auto bg-white/5 rounded-lg"
                              >
                                <GripVertical className="w-5 h-5" />
                              </div>
                              
                              <div className="font-bold text-[var(--text-primary)] w-full lg:w-auto text-center lg:text-left text-lg">
                                {item.name}
                              </div>
                              
                              <div className="w-full lg:w-auto text-center lg:text-left">
                                <span className="text-[var(--text-secondary)] font-mono text-sm bg-black/30 px-3 py-1.5 rounded-lg border border-white/5 inline-block">
                                  {item.path}
                                </span>
                              </div>
                              
                              <div className="text-center w-full lg:w-auto">
                                <span className={`text-xs px-2.5 py-1 rounded font-medium border ${item.link_type === 'external' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                                  {item.link_type === 'external' ? 'Externe' : 'Interne'}
                                </span>
                              </div>
                              
                              <div className="flex flex-wrap items-center justify-center gap-1.5 w-full lg:w-auto">
                                {item.hot && <span className="bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Hot</span>}
                                {item.has_dropdown && <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Drop</span>}
                                {item.target_blank && <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase" title="Nouvel onglet">Ext</span>}
                              </div>
                              
                              <div className="flex items-center justify-center gap-2 w-full lg:w-auto mt-2 lg:mt-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/5">
                                <button
                                  onClick={() => openModal(item)}
                                  className="w-full lg:w-auto lg:p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 text-white rounded-lg transition-all border border-blue-500/20 hover:border-blue-500 flex items-center justify-center py-2"
                                  title="Éditer"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id, item.name)}
                                  className="w-full lg:w-auto lg:p-2 bg-red-500/10 text-red-400 hover:bg-red-500 text-white rounded-lg transition-all border border-red-500/20 hover:border-red-500 flex items-center justify-center py-2"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Sous-menus imbriqués (affichage simple seulement pour l'instant) */}
                            {items.filter(child => child.parent_id === item.id).length > 0 && (
                              <div className="mt-4 pl-12 pr-4 space-y-2 border-l-2 border-white/10 ml-4 py-2">
                                <div className="text-xs text-[var(--text-muted)] font-medium mb-2">Sous-éléments de ce menu :</div>
                                {items
                                  .filter(child => child.parent_id === item.id)
                                  .sort((a,b) => a.order - b.order)
                                  .map(child => (
                                    <div key={child.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5 gap-3">
                                      <div className="flex flex-wrap items-center gap-3">
                                        <div className="font-semibold text-sm">{child.name}</div>
                                        <div className="text-xs font-mono text-[var(--text-muted)] bg-black/40 px-2 py-1 rounded border border-white/5">{child.path}</div>
                                        {child.hot && <span className="bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">Hot</span>}
                                      </div>
                                      <div className="flex gap-2 w-full sm:w-auto justify-end">
                                        <button onClick={() => openModal(child)} className="text-blue-400 hover:text-blue-300 p-1"><Edit2 className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => handleDelete(child.id, child.name)} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))
                  }
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}


      {/* Modal ajout/édition */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar relative animate-modalIn">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-2xl font-bold text-white mb-6">
              {editItem ? 'Éditer l\'élément' : 'Ajouter un lien'}
            </h3>
            
            <form onSubmit={handleSave} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Nom d'affichage</label>
                <input 
                  required 
                  placeholder="Ex: Accueil, Articles, Contact..." 
                  value={form.name} 
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                  className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-muted)]" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Type de lien</label>
                <div className="grid grid-cols-2 gap-3 relative z-10 p-1 bg-black/40 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, link_type: 'internal' }))}
                      className={`py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${form.link_type === 'internal' ? 'bg-white/10 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                    >
                      Page Interne
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, link_type: 'external' }))}
                      className={`py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${form.link_type === 'external' ? 'bg-white/10 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                    >
                      Lien Externe
                    </button>
                </div>
              </div>

              {form.link_type === 'internal' ? (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Page de destination</label>
                  <select
                    required
                    value={form.path}
                    onChange={e => setForm(f => ({ ...f, path: e.target.value }))}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--accent)] transition-colors appearance-none"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23999\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                  >
                    <option value="" disabled className="bg-gray-900">Sélectionner une page existante</option>
                    <option value="/" className="bg-gray-900">Accueil (/)</option>
                    {pages.map(page => (
                      <option key={page.id} value={page.path} className="bg-gray-900">{page.title} ({page.path})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">URL externe</label>
                  <input 
                    required 
                    placeholder="https://..." 
                    type="url"
                    value={form.path} 
                    onChange={e => setForm(f => ({ ...f, path: e.target.value }))} 
                    className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-muted)] font-mono text-sm" 
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Parent (Menu déroulant)</label>
                <select 
                  value={form.parent_id || ''} 
                  onChange={e => setForm(f => ({ ...f, parent_id: e.target.value || null }))} 
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--accent)] transition-colors appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23999\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                >
                  <option value="" className="bg-gray-900">Aucun (Lien principal)</option>
                  {items.filter(i => !i.parent_id && (!editItem || i.id !== editItem.id)).map(i => (
                    <option key={i.id} value={i.id} className="bg-gray-900">Sous-menu de "{i.name}"</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                 <label className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-black/20 cursor-pointer hover:bg-black/30 transition-colors">
                   <div className="relative flex items-center">
                     <input 
                       type="checkbox" 
                       checked={form.hot} 
                       onChange={e => setForm(f => ({ ...f, hot: e.target.checked }))} 
                       className="peer sr-only" 
                     />
                     <div className="w-10 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--accent)]"></div>
                   </div>
                   <div className="flex flex-col">
                     <span className="text-[13px] font-semibold text-white">Badge "HOT"</span>
                     <span className="text-[10px] text-[var(--text-muted)]">Mise en avant</span>
                   </div>
                 </label>

                 <label className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-black/20 cursor-pointer hover:bg-black/30 transition-colors">
                   <div className="relative flex items-center">
                     <input 
                       type="checkbox" 
                       checked={form.target_blank} 
                       onChange={e => setForm(f => ({ ...f, target_blank: e.target.checked }))} 
                       className="peer sr-only" 
                     />
                     <div className="w-10 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                   </div>
                  <div className="flex flex-col">
                     <span className="text-[13px] font-semibold text-white">Nouvel onglet</span>
                     <span className="text-[10px] text-[var(--text-muted)]">Ouvrir target="_blank"</span>
                   </div>
                 </label>
              </div>

              <div className="mt-2 text-xs text-yellow-500/80 bg-yellow-500/10 p-3 rounded-xl border border-yellow-500/20">
                 💡 <strong>Note :</strong> L'ordre des éléments (drag & drop) n'est actif que pour les liens principaux pour le moment.
              </div>

              <div className="flex gap-4 mt-4">
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
                  className="flex-1 bg-[var(--accent)] shadow-[0_4px_16px_var(--accent-glow)] text-white px-4 py-3 rounded-xl font-bold hover:brightness-110 transition-all flex justify-center items-center gap-2" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoadingBar variant="inline" className="h-0.5 min-w-[60px] flex-1 max-w-16 bg-white/30" />
                      Sauvegarde...
                    </>
                  ) : (
                    editItem ? 'Enregistrer' : 'Ajouter'
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

export default MainMenuPage;
