import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { XMarkIcon, TagIcon } from '@heroicons/react/24/outline';

interface ConfirmBulkCategoryModalProps {
  open: boolean;
  count: number;
  categories: string[];
  category: string;
  setCategory: (c: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const ConfirmBulkCategoryModal: React.FC<ConfirmBulkCategoryModalProps> = ({ open, count, categories, category, setCategory, onCancel, onConfirm, loading }) => {
  if (!open || !categories || categories.length === 0) return null;

  return (
    <Dialog.Root open={open} onOpenChange={open => { if (!open) onCancel(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-fadeIn" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-0 max-w-md w-full animate-modalIn">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-lg font-bold truncate">Changer la catégorie de {count} article(s)</h2>
            <button onClick={onCancel} className="p-2 rounded hover:bg-gray-100 transition" title="Fermer">
              <XMarkIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="px-6 py-6 flex flex-col gap-4 items-center text-center">
            <TagIcon className="w-12 h-12 text-blue-500 mb-2" />
            <div className="font-semibold text-blue-700">Sélectionnez la nouvelle catégorie</div>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="border rounded px-4 py-2 mt-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-200"
              disabled={loading}
            >
              <option value="">-- Choisir --</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="text-sm text-gray-500 mt-2">Tous les articles sélectionnés auront cette catégorie.</div>
            <div className="flex gap-4 mt-4 justify-center">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                disabled={loading}
              >Annuler</button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition font-semibold"
                disabled={loading || !category}
              >{loading ? 'Mise à jour...' : 'Valider'}</button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ConfirmBulkCategoryModal; 