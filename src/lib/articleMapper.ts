/**
 * Mappe les données d'articles depuis Supabase vers le format attendu par les composants
 * Gère les différences de noms de champs entre la base de données et les composants
 */

import { optimiseSupabaseImageUrl } from '@/lib/supabaseImageUrl';

export interface MappedArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  /** Image optimisée (transformation Supabase) pour listes / cartes */
  image: string;
  /** URL brute depuis la BDD (Open Graph, image pleine page) */
  imageSource: string;
  share_image_url?: string;
  share_description?: string;
  category: string;
  date: string;
  author: string;
  views?: number;
  comments_count?: number;
  featured?: boolean;
  tags?: string[];
}

export const mapArticleFromSupabase = (article: any): MappedArticle => {
  const rawImage = article.image_url ?? article.image ?? '/placeholder.svg';
  return {
    id: article.id,
    slug: article.slug || article.id,
    title: article.titre ?? article.title ?? '',
    excerpt: article.meta_description ?? article.excerpt ?? '',
    content: article.contenu ?? article.content ?? '',
    image: optimiseSupabaseImageUrl(rawImage, 'card'),
    imageSource: rawImage,
    share_image_url: article.share_image_url,
    share_description: article.share_description,
    category: article.categorie ?? article.category ?? '',
    date: article.date_publication ?? article.date ?? '',
    author: article.auteur ?? article.author ?? '',
    views: article.views ?? 0,
    comments_count: article.comments_count ?? 0,
    featured: article.featured ?? false,
    tags: Array.isArray(article.tags) 
      ? article.tags 
      : typeof article.tags === 'string' && article.tags.length > 0
        ? article.tags.split(',').map((t: string) => t.trim())
        : []
  };
};

export const mapArticlesFromSupabase = (articles: any[]): MappedArticle[] => {
  return articles.map(mapArticleFromSupabase);
};
