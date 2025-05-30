import * as Dialog from '@radix-ui/react-dialog';
import React, { useState, useEffect } from 'react';

type Article = {
  id?: number;
  title: string;
  author: string;
  date: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (article: Article) => void;
  initialData?: Article | null;
};

const ArticleModal: React.FC<Props> = ({ open, onClose, onSave, initialData }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setAuthor(initialData.author);
      setDate(initialData.date);
    } else {
      setTitle('');
      setAuthor('');
      setDate('');
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...initialData, title, author, date });
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
            {initialData ? 'Éditer un article' : 'Ajouter un article'}
          </Dialog.Title>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input
              required
              placeholder="Titre"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2', fontFamily: 'Jost, sans-serif' }}
            />
            <input
              required
              placeholder="Auteur"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2', fontFamily: 'Jost, sans-serif' }}
            />
            <input
              required
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
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

export default ArticleModal; 