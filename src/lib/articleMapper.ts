/**
 * Mappe les données d'articles depuis Supabase vers le format attendu par les composants
 * Gère les différences de noms de champs entre la base de données et les composants
 */

export interface MappedArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  author: string;
  views?: number;
  comments_count?: number;
  featured?: boolean;
  tags?: string[];
}

export const mapArticleFromSupabase = (article: any): MappedArticle => {
  return {
    id: article.id,
    slug: article.slug || article.id,
    title: article.titre ?? article.title ?? '',
    excerpt: article.meta_description ?? article.excerpt ?? '',
    image: article.image_url ?? article.image ?? '/placeholder.svg',
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
