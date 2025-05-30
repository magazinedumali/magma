import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

interface ArticleCardProps {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  author: string;
  authorAvatar?: string;
  featured?: boolean;
  views?: number;
  comments_count?: number;
}

const getAuthorAvatar = (author: string, authorAvatar?: string) => {
  if (authorAvatar) return authorAvatar;
  return '/logo.png';
};

const ArticleCard = ({ 
  slug, 
  title, 
  excerpt, 
  image, 
  category, 
  date, 
  author,
  authorAvatar,
  featured = false,
  views = 0,
  comments_count = 0
}: ArticleCardProps) => {
  return (
    <article className={`bg-white ${featured ? '' : 'h-full'}`}>
      <Link to={`/article/${slug}`} className="block relative">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-48 object-cover"
        />
        <span className="article-category absolute top-4 left-4">
          {category}
        </span>
      </Link>
      <div className="p-4">
        <h3 className={`font-bold mb-2 line-clamp-2 ${featured ? 'text-2xl md:text-3xl' : 'text-lg'}`}>
          <Link to={`/article/${slug}`} className="hover:text-news-red transition-colors">
            {title}
          </Link>
        </h3>
        {featured && (
          <p className="text-news-gray mb-4 line-clamp-3">{excerpt}</p>
        )}
        <div className="flex items-center text-xs text-news-gray mt-2">
          <span className="mr-3">{author}</span>
          <span className="flex items-center mr-3">
            <Clock size={14} className="mr-1" />
            {date}
          </span>
          <span className="flex items-center mr-3">
            <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 24 24'><path fill='currentColor' d='M12 5c-7.633 0-10 6.833-10 7.5S4.367 20 12 20s10-6.833 10-7.5S19.633 5 12 5Zm0 13c-5.94 0-8.5-5.13-8.958-6C3.5 11.13 6.06 6 12 6s8.5 5.13 8.958 6C20.5 12.87 17.94 18 12 18Zm0-10a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 6.5A2.5 2.5 0 1 1 12 9a2.5 2.5 0 0 1 0 5Z'/></svg>
            {views}
          </span>
          <span className="flex items-center">
            Commentaire ({comments_count})
          </span>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;
