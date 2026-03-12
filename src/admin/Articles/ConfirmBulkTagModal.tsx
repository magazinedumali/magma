import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { XMarkIcon, HashtagIcon } from '@heroicons/react/24/outline';

interface ConfirmBulkTagModalProps {
  open: boolean;
  count: number;
  tag: string;
  setTag: (t: string) => void;
  action: 'add' | 'remove';
  setAction: (a: 'add' | 'remove') => void;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const ConfirmBulkTagModal: React.FC<ConfirmBulkTagModalProps> = ({ open, count, tag, setTag, action, setAction, onCancel, onConfirm, loading }) => {
  if (!open || tag == null || tag === '') return null;

  return (
    <Dialog.Root open={open} onOpenChange={open => { if (!open) onCancel(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fadeIn" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl p-0 max-w-md w-full animate-modalIn text-[var(--text-primary)]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
            <h2 className="text-xl font-bold truncate">Gérer les tags</h2>
            <button onClick={onCancel} className="p-2 rounded-lg hover:bg-white/10 transition-colors text-[var(--text-muted)] hover:text-white" title="Fermer">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="px-6 py-8 flex flex-col items-center text-center">
            <div className="bg-purple-500/10 p-4 rounded-full mb-4">
              <HashtagIcon className="w-10 h-10 text-purple-400" />
            </div>
            
            <h3 className="text-lg font-semibold mb-2">{action === 'add' ? 'Ajouter' : 'Retirer'} un tag à {count} article(s)</h3>
            
            <div className="w-full flex gap-3 mt-4">
              <input
                type="text"
                value={tag}
                onChange={e => setTag(e.target.value)}
                className="flex-1 px-4 py-3 bg-black/30 border border-[var(--border)] rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none"
                placeholder="Nom du tag"
                disabled={loading}
              />
              <select
                value={action}
                onChange={e => setAction(e.target.value as 'add' | 'remove')}
                className="w-1/3 px-4 py-3 bg-black/30 border border-[var(--border)] rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none"
                disabled={loading}
              >
                <option value="add" className="bg-[var(--bg-main)]">Ajouter</option>
                <option value="remove" className="bg-[var(--bg-main)]">Retirer</option>
              </select>
            </div>
            
            <p className="text-sm text-[var(--text-muted)] mt-4">Tous les articles sélectionnés seront mis à jour.</p>
            
            <div className="flex gap-3 mt-8 w-full">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors font-semibold"
                disabled={loading}
              >Annuler</button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-3 rounded-xl bg-purple-600 text-white hover:brightness-110 shadow-[0_4px_16px_rgba(147,51,234,0.3)] transition-all font-semibold"
                disabled={loading || !tag}
              >{loading ? 'Mise à jour...' : 'Valider'}</button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ConfirmBulkTagModal;