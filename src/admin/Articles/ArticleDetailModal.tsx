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
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fadeIn" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl p-0 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-modalIn text-[var(--text-primary)] custom-scrollbar">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 sticky top-0 z-10 backdrop-blur-md">
            <h2 className="text-xl font-bold truncate pr-4 text-[var(--text-primary)]" title={article.titre}>{article.titre}</h2>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => onEdit(article.id)} className="p-2 rounded-lg hover:bg-blue-500/20 transition-colors text-blue-400 hover:text-blue-300" title="Éditer">
                <PencilSquareIcon className="w-5 h-5" />
              </button>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors text-[var(--text-muted)] hover:text-white" title="Fermer">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="px-6 py-6 flex flex-col gap-6">
            {article.image_url ? (
              <img 
                src={article.image_url} 
                alt={article.titre} 
                className="w-full h-64 object-cover rounded-xl border border-white/10 shadow-lg"
                onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-32 bg-black/20 rounded-xl border border-white/5 flex flex-col items-center justify-center text-[var(--text-muted)]">
                 <span className="text-4xl mb-2 opacity-50">📷</span>
                 <span className="text-sm">Aucune image principale</span>
              </div>
            )}
            
            <div className="flex flex-wrap gap-3 items-center text-xs">
              <span className="bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30 px-3 py-1.5 rounded-lg font-bold">
                {article.categorie || 'Sans catégorie'}
              </span>
              
              {article.statut && (
                <span className={`px-3 py-1.5 rounded-lg font-bold border ${
                  article.statut === 'publie' 
                    ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                    : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                }`}>
                  {article.statut === 'publie' ? 'Publié' : 'Brouillon'}
                </span>
              )}
              
              {article.auteur && (
                <span className="bg-white/5 border border-white/10 text-[var(--text-secondary)] px-3 py-1.5 rounded-lg font-medium flex items-center gap-2">
                  <span className="opacity-60">Auteur:</span> {article.auteur}
                </span>
              )}
            </div>
            
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {article.tags.map((tag, idx) => (
                  <span key={idx} className="bg-white/5 border border-white/10 text-[var(--text-secondary)] px-2.5 py-1 rounded-md text-xs font-medium">#{tag}</span>
                ))}
              </div>
            )}
            
            {article.contenu && (
              <div className="prose prose-invert max-w-none prose-sm bg-black/20 p-5 rounded-xl border border-white/5" dangerouslySetInnerHTML={{ __html: article.contenu }} />
            )}
            
            {/* Galerie d'images */}
            {Array.isArray((article as any).gallery) && (article as any).gallery.length > 0 && (
              <div className="bg-black/20 p-5 rounded-xl border border-white/5">
                <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[var(--accent)] rounded-full"></span>
                  Galerie d'images
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(article as any).gallery.map((url: string, idx: number) => (
                    <img 
                      key={idx} 
                      src={url} 
                      alt={`galerie-${idx}`} 
                      className="w-full h-24 object-cover rounded-lg border border-white/10 transition-transform hover:scale-105 cursor-pointer"
                      onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Audio */}
            {article.audio_url && (
              <div className="bg-black/20 p-5 rounded-xl border border-white/5">
                <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
                  Fichier Audio
                </h3>
                <audio controls src={article.audio_url} className="w-full opacity-90 style-audio rounded-lg">
                  Votre navigateur ne supporte pas l'audio.
                </audio>
              </div>
            )}
            
            {/* SEO */}
            {((article as any).meta_title || (article as any).meta_description) && (
              <div className="bg-black/20 p-5 rounded-xl border border-white/5 flex flex-col gap-3">
                <h3 className="font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                  SEO Meta Data
                </h3>
                
                {(article as any).meta_title && (
                  <div>
                    <div className="text-xs text-[var(--text-muted)] mb-1 font-medium uppercase tracking-wider">Meta title</div>
                    <div className="text-sm font-semibold bg-white/5 p-2 rounded border border-white/5">{(article as any).meta_title}</div>
                  </div>
                )}
                
                {(article as any).meta_description && (
                  <div>
                    <div className="text-xs text-[var(--text-muted)] mb-1 font-medium uppercase tracking-wider">Meta description</div>
                    <div className="text-sm text-[var(--text-secondary)] leading-relaxed bg-white/5 p-2 rounded border border-white/5">{(article as any).meta_description}</div>
                  </div>
                )}
              </div>
            )}
            
            {/* Dates */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/10 text-xs text-[var(--text-muted)]">
              {(article as any).created_at && (
                <div className="flex items-center gap-1.5">
                  <span className="opacity-60">Créé le :</span>
                  <span className="font-medium text-[var(--text-secondary)]">{new Date((article as any).created_at).toLocaleString(i18n.language || 'fr-FR')}</span>
                </div>
              )}
              {(article as any).updated_at && (
                <div className="flex items-center gap-1.5">
                  <span className="opacity-60">Modifié le :</span>
                  <span className="font-medium text-[var(--text-secondary)]">{new Date((article as any).updated_at).toLocaleString(i18n.language || 'fr-FR')}</span>
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ArticleDetailModal;