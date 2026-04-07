import React from 'react';
import { PencilSquareIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

interface ArticleCardProps {
  id: string;
  titre: string;
  image_url?: string;
  categorie?: string;
  tags?: string[];
  audio_url?: string;
  statut?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  selected?: boolean;
  onSelect?: () => void;
  onShowDetail?: (id: string) => void;
  slug?: string;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  id,
  titre,
  image_url,
  categorie,
  tags = [],
  audio_url,
  statut,
  onEdit,
  onDelete,
  selected = false,
  onSelect,
  onShowDetail,
  slug,
}) => {
  const normalizedStatut = String(statut ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  const isPublished = normalizedStatut === 'publie' || normalizedStatut === 'published' || normalizedStatut === 'public';

  const processedImageUrl = image_url ? (() => {
    if (image_url.startsWith('http')) return image_url;
    if (image_url.startsWith('public/') || image_url.includes('/storage/')) return image_url;
    if (!image_url || image_url === '/placeholder.svg' || image_url.trim() === '') return null;
    return image_url;
  })() : null;
  
  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button,input')) return;
    if (onShowDetail) onShowDetail(id);
  };

  return (
    <div
      className="dark-card flex flex-col gap-3 relative transition-all duration-300 cursor-pointer group"
      style={{
        padding: 16, border: selected ? '2px solid var(--accent)' : '1px solid var(--border)',
        transform: selected ? 'translateY(-2px)' : 'none',
        boxShadow: selected ? '0 8px 24px rgba(255, 24, 78, 0.2)' : 'var(--shadow-card)'
      }}
      onClick={handleCardClick}
    >
      {typeof selected === 'boolean' && onSelect && (
        <label className="absolute top-4 left-4 z-10 cursor-pointer flex items-center gap-2 bg-black/40 p-1.5 rounded-md backdrop-blur-sm border border-white/10" onClick={e => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="w-4 h-4 accent-[#ff184e] cursor-pointer"
            aria-label="Sélectionner l'article"
          />
        </label>
      )}
      
      <div className="relative overflow-hidden rounded-lg mb-2">
        {processedImageUrl ? (
          <img 
            src={processedImageUrl} 
            alt={titre} 
            className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-44 bg-black/20 flex flex-col items-center justify-center text-gray-500 border border-white/5">
            <span className="text-3xl mb-2 opacity-50">📷</span>
            <span className="text-sm font-medium">Sans image</span>
          </div>
        )}
        
        {/* Status Badge Absolute Over Image */}
        {statut && (
          <div className="absolute top-3 right-3">
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold shadow-lg backdrop-blur-md border ${
              isPublished
                ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            }`}>
              {isPublished ? 'Publié' : 'Brouillon'}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-1 mt-1">
        <span className="text-xs bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 px-2 py-1 rounded font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[50%]">
          {categorie || 'Sans catégorie'}
        </span>
        
        <div className="flex gap-1.5 bg-black/20 p-1 rounded-md border border-white/5">
          <button
            onClick={e => { e.stopPropagation(); window.open(`/article/${slug || id}`, '_blank'); }}
            className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Prévisualiser"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(id)}
            className="p-1.5 rounded hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 transition-colors"
            title="Éditer"
          >
            <PencilSquareIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(id)}
            className="p-1.5 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
            title="Supprimer"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <h2 className="text-lg font-bold mt-1 mb-1 line-clamp-2 text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors" title={titre}>{titre}</h2>
      
      {Array.isArray(tags) && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-white/10">
          {(Array.isArray(tags) ? tags : []).slice(0, 3).map((tag, idx) => (
            <span key={idx} className="bg-white/5 text-[var(--text-secondary)] px-2 py-0.5 rounded text-[11px] font-medium border border-white/5">#{tag}</span>
          ))}
          {tags.length > 3 && (
            <span className="bg-white/5 text-[var(--text-secondary)] px-2 py-0.5 rounded text-[11px] font-medium border border-white/5">+{tags.length - 3}</span>
          )}
        </div>
      )}
      
      {audio_url && (
        <div className="mt-3 bg-black/30 p-2 rounded-lg border border-white/5">
           <audio controls src={audio_url} className="w-full h-8 opacity-80 style-audio" />
        </div>
      )}
    </div>
  );
};

export default ArticleCard;