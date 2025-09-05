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
  // Gestion du clic sur la carte (hors actions)
  const handleCardClick = (e: React.MouseEvent) => {
    // On ne déclenche pas si clic sur bouton ou checkbox
    if ((e.target as HTMLElement).closest('button,input')) return;
    if (onShowDetail) onShowDetail(id);
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md p-4 flex flex-col gap-3 relative hover:shadow-xl transition animate-fadeIn cursor-pointer"
      onClick={handleCardClick}
    >
      {typeof selected === 'boolean' && onSelect && (
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          className="absolute top-3 left-3 w-4 h-4 accent-blue-600 z-10"
          aria-label="Sélectionner l'article"
          onClick={e => e.stopPropagation()}
        />
      )}
      {image_url && (
        <img 
          src={image_url} 
          alt={titre} 
          className="w-full h-40 object-cover rounded-lg mb-2"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
          loading="lazy"
        />
      )}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">
          {categorie || 'Sans catégorie'}
        </span>
        {statut && (
          <span className={`text-xs px-2 py-1 rounded font-semibold ml-2 ${statut === 'publie' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
            {statut === 'publie' ? 'Publié' : 'Brouillon'}
          </span>
        )}
        <div className="flex gap-2">
          <button
            onClick={e => { e.stopPropagation(); window.open(`/article/${slug || id}`, '_blank'); }}
            className="p-1 rounded hover:bg-gray-100 transition"
            aria-label="Prévisualiser l'article"
            title="Prévisualiser"
          >
            <EyeIcon className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => onEdit(id)}
            className="p-1 rounded hover:bg-blue-100 transition"
            aria-label="Éditer l'article"
            title="Éditer"
          >
            <PencilSquareIcon className="w-5 h-5 text-blue-600" />
          </button>
          <button
            onClick={() => onDelete(id)}
            className="p-1 rounded hover:bg-red-100 transition"
            aria-label="Supprimer l'article"
            title="Supprimer"
          >
            <TrashIcon className="w-5 h-5 text-red-600" />
          </button>
        </div>
      </div>
      <h2 className="text-lg font-bold mb-1 truncate" title={titre}>{titre}</h2>
      {Array.isArray(tags) && tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {(Array.isArray(tags) ? tags : []).map((tag, idx) => (
            <span key={idx} className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs">#{tag}</span>
          ))}
        </div>
      )}
      {audio_url && (
        <audio controls src={audio_url} className="w-full mt-2">
          Votre navigateur ne supporte pas l'audio.
        </audio>
      )}
    </div>
  );
};

export default ArticleCard; 