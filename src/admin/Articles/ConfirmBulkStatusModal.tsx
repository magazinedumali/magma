import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface ConfirmBulkStatusModalProps {
  open: boolean;
  count: number;
  statut: string;
  setStatut: (s: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const ConfirmBulkStatusModal: React.FC<ConfirmBulkStatusModalProps> = ({ open, count, statut, setStatut, onCancel, onConfirm, loading }) => {
  if (!open || !statut) return null;

  return (
    <Dialog.Root open={open} onOpenChange={open => { if (!open) onCancel(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fadeIn" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl p-0 max-w-md w-full animate-modalIn text-[var(--text-primary)]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
            <h2 className="text-xl font-bold truncate">Changer le statut</h2>
            <button onClick={onCancel} className="p-2 rounded-lg hover:bg-white/10 transition-colors text-[var(--text-muted)] hover:text-white" title="Fermer">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="px-6 py-8 flex flex-col items-center text-center">
            <div className="bg-green-500/10 p-4 rounded-full mb-4">
              <ArrowPathIcon className="w-10 h-10 text-green-400" />
            </div>
            
            <h3 className="text-lg font-semibold mb-2">Sélectionnez le nouveau statut pour {count} article(s)</h3>
            
            <select
              value={statut}
              onChange={e => setStatut(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-[var(--border)] rounded-xl text-white focus:outline-none focus:border-green-500 transition-colors appearance-none mt-4"
              disabled={loading}
            >
              <option value="publie" className="bg-[var(--bg-main)] text-green-400">Publié</option>
              <option value="brouillon" className="bg-[var(--bg-main)] text-yellow-400">Brouillon</option>
            </select>
            <p className="text-sm text-[var(--text-muted)] mt-4">Tous les articles sélectionnés auront ce statut.</p>
            
            <div className="flex gap-3 mt-8 w-full">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors font-semibold"
                disabled={loading}
              >Annuler</button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-3 rounded-xl bg-green-600 text-white hover:brightness-110 shadow-[0_4px_16px_rgba(34,197,94,0.3)] transition-all font-semibold"
                disabled={loading}
              >{loading ? 'Mise à jour...' : 'Valider'}</button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ConfirmBulkStatusModal;