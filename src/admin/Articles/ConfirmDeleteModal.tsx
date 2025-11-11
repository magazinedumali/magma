import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import type { Article } from './ArticleList';

interface ConfirmDeleteModalProps {
  article: Article;
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ article, open, onCancel, onConfirm, loading }) => {
  if (!article) return null;

  return (
    <Dialog.Root open={open} onOpenChange={open => { if (!open) onCancel(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-fadeIn" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-0 max-w-md w-full animate-modalIn">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-lg font-bold truncate" title={article.titre}>Supprimer l'article</h2>
            <button onClick={onCancel} className="p-2 rounded hover:bg-gray-100 transition" title="Fermer">
              <XMarkIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="px-6 py-6 flex flex-col gap-4 items-center text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mb-2" />
            <div className="font-semibold text-red-700">Cette action est irréversible !</div>
            {article.image_url && (
              <img 
                src={article.image_url} 
                alt={article.titre} 
                className="w-32 h-20 object-cover rounded mx-auto"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
                loading="lazy"
              />
            )}
            <div className="text-lg font-bold">{article.titre}</div>
            {article.statut && (
              <span className={`px-2 py-1 rounded font-semibold text-xs ${article.statut === 'publie' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{article.statut === 'publie' ? 'Publié' : 'Brouillon'}</span>
            )}
            <div className="text-sm text-gray-500 mt-2">Voulez-vous vraiment supprimer cet article ?</div>
            <div className="flex gap-4 mt-4 justify-center">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                disabled={loading}
              >Annuler</button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition font-semibold"
                disabled={loading}
              >{loading ? 'Suppression...' : 'Supprimer définitivement'}</button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ConfirmDeleteModal; 