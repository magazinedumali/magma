import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { XMarkIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import type { Article } from './ArticleList';
import i18n from '@/lib/i18n';

interface ArticleDetailModalProps {
  article: Article;
  onClose: () => void;
  onEdit: (id: string) => void;
  open: boolean;
}

const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({ article, onClose, onEdit, open }) => {
  if (!open || !article) return null;

  return (
    <Dialog.Root open onOpenChange={open => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-fadeIn" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-0 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-modalIn">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-xl font-bold truncate" title={article.titre}>{article.titre}</h2>
            <div className="flex gap-2">
              <button onClick={() => onEdit(article.id)} className="p-2 rounded hover:bg-blue-100 transition" title="Éditer">
                <PencilSquareIcon className="w-5 h-5 text-blue-600" />
              </button>
              <button onClick={onClose} className="p-2 rounded hover:bg-gray-100 transition" title="Fermer">
                <XMarkIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="px-6 py-4 flex flex-col gap-4">
            {article.image_url && (
              <img 
                src={article.image_url} 
                alt={article.titre} 
                className="w-full max-h-64 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
                loading="lazy"
              />
            )}
            <div className="flex flex-wrap gap-2 items-center text-xs">
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">{article.categorie || 'Sans catégorie'}</span>
              {article.statut && (
                <span className={`px-2 py-1 rounded font-semibold ml-2 ${article.statut === 'publie' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                  {article.statut === 'publie' ? 'Publié' : 'Brouillon'}
                </span>
              )}
              {article.auteur && <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">Auteur: {article.auteur}</span>}
            </div>
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {article.tags.map((tag, idx) => (
                  <span key={idx} className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs">#{tag}</span>
                ))}
              </div>
            )}
            {article.contenu && (
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.contenu }} />
            )}
            {/* Galerie d'images */}
            {Array.isArray((article as any).gallery) && (article as any).gallery.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Galerie d'images</h3>
                <div className="grid grid-cols-2 gap-2">
                  {(article as any).gallery.map((url: string, idx: number) => (
                    <img 
                      key={idx} 
                      src={url} 
                      alt={`galerie-${idx}`} 
                      className="w-full h-32 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>
            )}
            {/* Audio */}
            {article.audio_url && (
              <audio controls src={article.audio_url} className="w-full mt-2">
                Votre navigateur ne supporte pas l'audio.
              </audio>
            )}
            {/* SEO */}
            {(article as any).meta_title && (
              <div className="mt-2">
                <div className="text-xs text-gray-500">Meta title</div>
                <div className="font-semibold">{(article as any).meta_title}</div>
              </div>
            )}
            {(article as any).meta_description && (
              <div className="mt-1">
                <div className="text-xs text-gray-500">Meta description</div>
                <div className="text-sm">{(article as any).meta_description}</div>
              </div>
            )}
            {/* Dates (si présentes) */}
            {(article as any).created_at && (
              <div className="text-xs text-gray-400 mt-2">Créé le {new Date((article as any).created_at).toLocaleString(i18n.language || 'fr-FR')}</div>
            )}
            {(article as any).updated_at && (
              <div className="text-xs text-gray-400">Modifié le {new Date((article as any).updated_at).toLocaleString(i18n.language || 'fr-FR')}</div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ArticleDetailModal; 