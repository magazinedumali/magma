import * as Dialog from '@radix-ui/react-dialog';
import React, { useState, useEffect } from 'react';

type Media = {
  id?: number;
  title: string;
  type: string;
  url: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (media: Media) => void;
  initialData?: Media | null;
};

const MediaModal: React.FC<Props> = ({ open, onClose, onSave, initialData }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('image');
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setType(initialData.type);
      setUrl(initialData.url);
    } else {
      setTitle('');
      setType('image');
      setUrl('');
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...initialData, title, type, url });
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={open => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay style={{
          background: 'rgba(0,0,0,0.3)',
          position: 'fixed', inset: 0
        }} />
        <Dialog.Content style={{
          background: '#fff',
          borderRadius: 12,
          padding: 32,
          minWidth: 340,
          maxWidth: 400,
          margin: '10vh auto',
          position: 'fixed',
          left: 0, right: 0
        }}>
          <Dialog.Title style={{ fontWeight: 600, fontSize: 22, marginBottom: 16 }}>
            {initialData ? 'Éditer un média' : 'Ajouter un média'}
          </Dialog.Title>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input
              required
              placeholder="Titre"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2', fontFamily: 'Jost, sans-serif' }}
            />
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2', fontFamily: 'Jost, sans-serif' }}
            >
              <option value="image">Image</option>
              <option value="video">Vidéo</option>
              <option value="audio">Audio</option>
            </select>
            <input
              required
              placeholder="URL"
              value={url}
              onChange={e => setUrl(e.target.value)}
              style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2', fontFamily: 'Jost, sans-serif' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" onClick={onClose} style={{ background: '#eee', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>Annuler</button>
              <button type="submit" style={{ background: '#4f8cff', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>
                {initialData ? 'Enregistrer' : 'Ajouter'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default MediaModal; 