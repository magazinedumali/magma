import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import type { Article } from './ArticleList';

interface ConfirmBulkDeleteModalProps {
  articles: Article[];
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const ConfirmBulkDeleteModal: React.FC<ConfirmBulkDeleteModalProps> = ({ articles, open, onCancel, onConfirm, loading }) => {
  if (!open || !articles || articles.length === 0) return null;

  return (
    <Dialog.Root open={open} onOpenChange={open => { if (!open) onCancel(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fadeIn" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl p-0 max-w-lg w-full animate-modalIn text-[var(--text-primary)]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
            <h2 className="text-xl font-bold truncate">Suppression en masse</h2>
            <button onClick={onCancel} className="p-2 rounded-lg hover:bg-white/10 transition-colors text-[var(--text-muted)] hover:text-white" title="Fermer">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="px-6 py-8 flex flex-col items-center text-center">
            <div className="bg-red-500/10 p-4 rounded-full mb-4">
              <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Supprimer {articles.length} article(s) ?</h3>
            <div className="font-semibold text-red-400 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20 w-fit mb-6">Cette action est irréversible !</div>
            
            <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto w-full mb-4 px-2 custom-scrollbar">
              {articles.slice(0, 8).map(article => (
                <div key={article.id} className="flex items-center gap-3 bg-black/30 border border-white/5 rounded-xl p-2 text-left">
                  {article.image_url ? (
                    <img 
                      src={article.image_url} 
                      alt={article.titre} 
                      className="w-12 h-10 object-cover rounded-lg border border-white/10"
                      onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-12 h-10 bg-white/5 rounded-lg border border-white/5 flex items-center justify-center text-xl">📷</div>
                  )}
                  <span className="text-sm font-medium truncate flex-1" title={article.titre}>{article.titre}</span>
                </div>
              ))}
              {articles.length > 8 && (
                <div className="col-span-2 text-sm font-medium text-[var(--text-muted)] bg-white/5 rounded-xl py-2 mt-1">
                  ... et {articles.length - 8} autres articles.
                </div>
              )}
            </div>
            
            <p className="text-sm text-[var(--text-muted)] mt-2">Tous ces articles seront définitivement supprimés, y compris leurs images et audios.</p>
            
            <div className="flex gap-3 mt-8 w-full">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors font-semibold"
                disabled={loading}
              >Annuler</button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white hover:brightness-110 shadow-[0_4px_16px_rgba(239,68,68,0.3)] transition-all font-semibold"
                disabled={loading}
              >{loading ? 'Suppression...' : 'Supprimer définitivement'}</button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ConfirmBulkDeleteModal;