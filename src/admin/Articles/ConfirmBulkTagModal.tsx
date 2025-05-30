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
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-fadeIn" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-0 max-w-md w-full animate-modalIn">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-lg font-bold truncate">{action === 'add' ? 'Ajouter' : 'Retirer'} un tag à {count} article(s)</h2>
            <button onClick={onCancel} className="p-2 rounded hover:bg-gray-100 transition" title="Fermer">
              <XMarkIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="px-6 py-6 flex flex-col gap-4 items-center text-center">
            <HashtagIcon className="w-12 h-12 text-blue-500 mb-2" />
            <div className="font-semibold text-blue-700">Tag à {action === 'add' ? 'ajouter' : 'retirer'}</div>
            <input
              type="text"
              value={tag}
              onChange={e => setTag(e.target.value)}
              className="border rounded px-4 py-2 mt-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Nom du tag"
              disabled={loading}
            />
            <select
              value={action}
              onChange={e => setAction(e.target.value as 'add' | 'remove')}
              className="border rounded px-4 py-2 mt-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-200"
              disabled={loading}
            >
              <option value="add">Ajouter</option>
              <option value="remove">Retirer</option>
            </select>
            <div className="text-sm text-gray-500 mt-2">Tous les articles sélectionnés seront mis à jour.</div>
            <div className="flex gap-4 mt-4 justify-center">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                disabled={loading}
              >Annuler</button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition font-semibold"
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