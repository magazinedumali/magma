import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import i18n from './i18n'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Échappe `%`, `_` et `\` pour les filtres PostgREST `.ilike()`. */
export function escapeForIlike(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

/** Filtre `.or()` : articles considérés publiés (statuts variantes en base). */
export const ARTICLES_PUBLISHED_OR_FILTER =
  'statut.eq.publie,statut.eq.publié,statut.eq.published,statut.ilike.%publ%';

export function formatDate(date: string): string {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString(i18n.language || 'fr-FR', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (e) {
    return date;
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
