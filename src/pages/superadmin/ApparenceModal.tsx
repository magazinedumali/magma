import * as Dialog from '@radix-ui/react-dialog';
import React, { useState, useEffect, ChangeEvent } from 'react';
import { supabase } from "../../lib/supabaseClient";

type Banner = {
  id?: number;
  title: string;
  image: string;
  link: string;
  status: string;
  position: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (banner: Banner) => void;
  initialData?: Banner | null;
};

const positionDescriptions: Record<string, string> = {
  accueil: "S'affiche en haut de la page d'accueil (carrousel ou top banner)",
  'sidebar-accueil': "S'affiche dans la colonne latérale de la page d'accueil",
  'sidebar-article': "S'affiche dans la colonne latérale de la page de détail d'un article",
};

const ApparenceModal: React.FC<Props> = ({ open, onClose, onSave, initialData }) => {
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [link, setLink] = useState('');
  const [status, setStatus] = useState('actif');
  const [position, setPosition] = useState('accueil');
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setTitle(initialData?.title || '');
    setImage(initialData?.image || '');
    setLink(initialData?.link || '');
    setStatus(initialData?.status || 'actif');
    setPosition(initialData?.position || 'accueil');
    setPreview(initialData?.image || null);
  }, [initialData, open]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const { data, error } = await supabase.storage.from('banners').upload(fileName, file, { upsert: true });
      if (error) {
        alert('Erreur upload image');
        setUploading(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from('banners').getPublicUrl(fileName);
      setImage(publicUrlData.publicUrl);
      setPreview(publicUrlData.publicUrl);
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...initialData, title, image: image, link, status, position });
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={open => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay style={{ background: 'rgba(0,0,0,0.3)', position: 'fixed', inset: 0 }} />
        <Dialog.Content style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 340, maxWidth: 400, margin: '10vh auto', position: 'fixed', left: 0, right: 0, zIndex: 1001 }}>
          <Dialog.Title style={{ fontWeight: 600, fontSize: 22, marginBottom: 16 }}>
            {initialData ? 'Éditer une bannière' : 'Ajouter une bannière'}
          </Dialog.Title>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input required placeholder="Titre" value={title} onChange={e => setTitle(e.target.value)} style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2', fontFamily: 'Jost, sans-serif' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 14, fontWeight: 500 }}>Image</label>
              <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
              {uploading && <span style={{ color: 'orange', fontSize: 12 }}>Upload en cours...</span>}
              <input placeholder="URL de l'image (optionnel)" value={image} onChange={e => { setImage(e.target.value); setPreview(e.target.value); }} style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2', fontFamily: 'Jost, sans-serif' }} />
            </div>
            <input placeholder="Lien (optionnel)" value={link} onChange={e => setLink(e.target.value)} style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2', fontFamily: 'Jost, sans-serif' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <select value={position} onChange={e => setPosition(e.target.value)} style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2', fontFamily: 'Jost, sans-serif' }}>
                <option value="accueil">Accueil</option>
                <option value="accueil-sous-slider">Sous le slider (Accueil)</option>
                <option value="accueil-sous-votes">Sous la section votes (Accueil)</option>
                <option value="sidebar-categorie">Sidebar Catégorie</option>
                <option value="sidebar-article">Sidebar Article</option>
              </select>
              <span style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{positionDescriptions[position]}</span>
            </div>
            <select value={status} onChange={e => setStatus(e.target.value)} style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2', fontFamily: 'Jost, sans-serif' }}>
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
            </select>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" onClick={onClose} style={{ background: '#eee', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>Annuler</button>
              <button type="submit" style={{ background: '#4f8cff', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>{initialData ? 'Enregistrer' : 'Ajouter'}</button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ApparenceModal; 