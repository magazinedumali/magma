import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface ConfirmExportModalProps {
  count: number;
  format: 'csv' | 'json';
  filename: string;
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const ConfirmExportModal: React.FC<ConfirmExportModalProps> = ({ count, format, filename, open, onCancel, onConfirm, loading }) => {
  return (
    <Dialog.Root open={open} onOpenChange={open => { if (!open) onCancel(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fadeIn" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl p-0 max-w-md w-full animate-modalIn text-[var(--text-primary)]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
            <h2 className="text-xl font-bold truncate">Exporter les articles</h2>
            <button onClick={onCancel} className="p-2 rounded-lg hover:bg-white/10 transition-colors text-[var(--text-muted)] hover:text-white" title="Fermer">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="px-6 py-8 flex flex-col items-center text-center">
            <div className="bg-emerald-500/10 p-4 rounded-full mb-4">
              <ArrowDownTrayIcon className="w-10 h-10 text-emerald-400" />
            </div>
            
            <h3 className="text-lg font-semibold mb-2">Vous allez exporter {count} article(s)</h3>
            
            <div className="bg-black/30 border border-white/5 rounded-xl p-4 w-full mt-4 flex flex-col gap-2 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)] text-sm">Format:</span>
                <span className="font-bold uppercase text-emerald-400">{format}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[var(--text-secondary)] text-sm">Nom du fichier:</span>
                <span className="font-mono text-sm bg-black/40 px-2 py-1 rounded border border-white/5 w-fit text-white/90">{filename}</span>
              </div>
            </div>
            
            <p className="text-sm text-[var(--text-muted)] mt-6">Confirmez-vous l'export de ces données ?</p>
            
            <div className="flex gap-3 mt-4 w-full">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors font-semibold"
                disabled={loading}
              >Annuler</button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 text-white hover:brightness-110 shadow-[0_4px_16px_rgba(16,185,129,0.3)] transition-all font-semibold"
                disabled={loading}
              >{loading ? 'Export en cours...' : 'Exporter maintenant'}</button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ConfirmExportModal;