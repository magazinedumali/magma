import * as Dialog from '@radix-ui/react-dialog';
import React, { useState, useEffect } from 'react';

type User = {
  id?: number;
  name: string;
  email: string;
  role: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  initialData?: User | null;
};

const UserModal: React.FC<Props> = ({ open, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('rédacteur');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setEmail(initialData.email);
      setRole(initialData.role);
    } else {
      setName('');
      setEmail('');
      setRole('rédacteur');
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...initialData, name, email, role });
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
            {initialData ? 'Éditer un utilisateur' : 'Ajouter un utilisateur'}
          </Dialog.Title>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input
              required
              placeholder="Nom"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2', fontFamily: 'Jost, sans-serif' }}
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2', fontFamily: 'Jost, sans-serif' }}
            />
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2', fontFamily: 'Jost, sans-serif' }}
            >
              <option value="rédacteur">Rédacteur</option>
              <option value="auteur">Auteur</option>
              <option value="admin">Admin</option>
            </select>
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

export default UserModal; 