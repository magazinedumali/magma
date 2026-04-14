import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Link as LinkIcon, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingBar } from '@/components/ui/loading-bar';
import { compressImageFile } from '@/lib/compressImage';

type Banner = {
  id: string;
  title: string;
  image_url: string;
  link: string;
  status: 'actif' | 'inactif';
  position: string;
};

const FIXED_BANNERS = [
  { key: "accueil", label: "Bannière Accueil (Top)", description: "S'affiche en haut de la page d'accueil (TopBar)" },
  { key: "accueil-sous-slider", label: "Bannière sous le slider (Accueil)", description: "S'affiche juste sous le slider sur la page d'accueil" },
  { key: "accueil-sous-votes", label: "Bannière sous la section votes", description: "S'affiche sous la section des votes sur la page d'accueil" },
  { key: "sidebar-categorie", label: "Sidebar Catégorie", description: "S'affiche dans la colonne latérale de la page de catégories" },
  { key: "sidebar-article", label: "Sidebar Article", description: "S'affiche dans la colonne latérale de la page de détail d'un article" },
  { key: "sous-article", label: "Bannière sous l'article", description: "S'affiche juste sous l'article, avant les commentaires" }
];

const emptyBanner: Omit<Banner, 'id'> = {
  title: '',
  image_url: '',
  link: '',
  status: 'actif',
  position: 'accueil',
};

const BannersPage = () => {
  const [banners, setBanners] = useState<Record<string, Banner>>({});
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [form, setForm] = useState(emptyBanner);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchBanners = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('banners')
      .select('*');
    
    if (error) {
      setError(error.message);
    } else {
      const mapped: Record<string, Banner> = {};
      data?.forEach(b => {
        mapped[b.position] = b;
      });
      setBanners(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openModal = (position: string, banner?: Banner) => {
    if (banner) {
      setEditBanner(banner);
      setForm({ ...banner });
    } else {
      setEditBanner(null);
      setForm({ ...emptyBanner, position });
    }
    setModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.files?.[0];
    if (raw) {
      setUploading(true);
      setError("");
      try {
        const file = await compressImageFile(raw, { maxWidth: 1600, maxHeight: 600 });
        const fileExt = file.name.split('.').pop() || 'webp';
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const { data, error: uploadError } = await supabase.storage.from('banners').upload(fileName, file, { upsert: true });
        
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from('banners').getPublicUrl(fileName);
        setForm(f => ({ ...f, image_url: publicUrlData.publicUrl }));
      } catch (err: any) {
        setError("Erreur lors de l'upload: " + err.message);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (editBanner) {
        const { error } = await supabase
          .from('banners')
          .update({
            title: form.title,
            image_url: form.image_url,
            link: form.link,
            status: form.status,
            position: form.position
          })
          .eq('id', editBanner.id);
        if (error) throw error;
        setSuccess('Bannière mise à jour !');
      } else {
        const { error } = await supabase
          .from('banners')
          .insert([{
            title: form.title,
            image_url: form.image_url,
            link: form.link,
            status: form.status,
            position: form.position
          }]);
        if (error) throw error;
        setSuccess('Bannière créée !');
      }
      setModalOpen(false);
      fetchBanners();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Supprimer définitivement la bannière "${title}" ?`)) return;
    setLoading(true);
    setError(null);
    try {
      await supabase.from('banners').delete().eq('id', id);
      setSuccess('Bannière supprimée !');
      fetchBanners();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-jost text-[var(--text-primary)]">
      <div className="mb-8">
        <h2 className="text-3xl font-bold admin-dashboard-title">Publicité & Bannières</h2>
        <p className="text-[var(--text-muted)] text-sm mt-1">Gérez les emplacements publicitaires sur tout le site</p>
      </div>

      {(error || success) && (
        <div className="mb-6 flex flex-col gap-2">
          {error && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-red-400 font-medium bg-red-500/10 p-4 rounded-xl border border-red-500/20 flex items-center gap-3">
              <AlertCircle className="w-5 h-5" /> {error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-emerald-400 font-medium bg-green-500/10 p-4 rounded-xl border border-green-500/20 flex items-center gap-3">
              <CheckCircle className="w-5 h-5" /> {success}
            </motion.div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FIXED_BANNERS.map((loc) => {
          const banner = banners[loc.key];
          return (
            <motion.div 
              key={loc.key}
              whileHover={{ y: -5 }}
              className="dark-card p-6 flex flex-col h-full group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-white text-lg">{loc.label}</h3>
                  <p className="text-[var(--text-muted)] text-xs mt-0.5">{loc.description}</p>
                </div>
                {banner?.status === 'actif' ? (
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Actif</span>
                ) : (
                  <span className="bg-white/5 text-white/30 border border-white/5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Inactif</span>
                )}
              </div>

              <div className="relative aspect-[3/1] rounded-xl overflow-hidden bg-black/40 border border-white/5 mb-4 group-hover:border-white/10 transition-colors">
                {banner?.image_url ? (
                  <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-xs">Aucune image</span>
                  </div>
                )}
              </div>

              {banner && (
                <div className="mb-4">
                  <div className="text-white font-semibold text-sm truncate">{banner.title}</div>
                  {banner.link && (
                    <div className="flex items-center gap-1.5 text-blue-400 text-xs mt-1 truncate">
                      <ExternalLink className="w-3 h-3" />
                      <a href={banner.link} target="_blank" rel="noopener noreferrer" className="hover:underline">{banner.link}</a>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-auto flex gap-2 pt-4 border-t border-white/5">
                <button
                  onClick={() => openModal(loc.key, banner)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 text-[var(--text-primary)] rounded-lg text-sm font-semibold transition-colors border border-white/10"
                >
                  <Edit2 className="w-4 h-4" /> Configurer
                </button>
                {banner && (
                  <button
                    onClick={() => handleDelete(banner.id, banner.title)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/10"
                    title="Vider cet emplacement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl p-8 max-w-xl w-full relative"
            >
              <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-2xl font-bold text-white mb-2">
                {editBanner ? 'Modifier la bannière' : 'Ajouter une bannière'}
              </h3>
              <p className="text-[var(--text-muted)] text-sm mb-8">
                Configuration pour l'emplacement: <span className="text-white font-medium">{FIXED_BANNERS.find(b => b.key === form.position)?.label}</span>
              </p>
              
              <div className="flex flex-col gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Nom de la campagne</label>
                    <input 
                      required 
                      placeholder="Ex: Campagne d'été 2026" 
                      value={form.title} 
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))} 
                      className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--accent)] transition-colors" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Image de la bannière</label>
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-3">
                        <input 
                          type="text"
                          placeholder="URL de l'image" 
                          value={form.image_url} 
                          onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} 
                          className="flex-1 px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--accent)] transition-colors text-sm" 
                        />
                        <label className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl text-[var(--text-primary)] font-semibold transition-all flex items-center gap-2 whitespace-nowrap">
                          {uploading ? (
                            <LoadingBar variant="inline" className="h-0.5 min-w-[24px] w-12" />
                          ) : <Plus className="w-5 h-5" />}
                          Téleverser
                          <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} className="hidden" />
                        </label>
                      </div>
                      
                      {form.image_url && (
                        <div className="relative aspect-[3/1] rounded-xl overflow-hidden bg-black/40 border border-white/10">
                          <img src={form.image_url} alt="Aperçu" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setForm(f => ({ ...f, image_url: '' }))}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-white hover:bg-red-500/80 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Lien de redirection (URL)</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input 
                        placeholder="https://exemple.com/promo" 
                        value={form.link} 
                        onChange={e => setForm(f => ({ ...f, link: e.target.value }))} 
                        className="w-full pl-11 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--accent)] transition-colors" 
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Statut</label>
                      <div className="flex gap-2">
                        {['actif', 'inactif'].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, status: s as any }))}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                              form.status === s 
                                ? (s === 'actif' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/10 border-white/20 text-white')
                                : 'bg-black/20 border-white/5 text-[var(--text-muted)] hover:bg-white/5'
                            }`}
                          >
                            {s === 'actif' ? 'Actif' : 'Désactivé'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setModalOpen(false)} 
                    className="flex-1 bg-white/5 border border-white/10 text-[var(--text-primary)] px-4 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors" 
                  >
                    Annuler
                  </button>
                  <button 
                    type="button" 
                    onClick={handleSave}
                    className="flex-1 bg-[var(--accent)] shadow-[0_4px_16px_var(--accent-glow)] text-white px-4 py-3 rounded-xl font-bold hover:brightness-110 transition-all flex justify-center items-center gap-2" 
                    disabled={loading || uploading}
                  >
                    {loading ? (
                      <LoadingBar variant="inline" className="h-0.5 min-w-[60px] flex-1 max-w-16 bg-white/30" />
                    ) : (
                      editBanner ? 'Mettre à jour' : 'Enregistrer'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BannersPage;
