import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

interface SmallArticleCardProps {
  slug: string;
  title: string;
  image?: string;
  date: string;
  showImage?: boolean;
}

const SmallArticleCard = ({ 
  slug, 
  title, 
  image, 
  date, 
  showImage = true 
}: SmallArticleCardProps) => {
  // Add getAuthorAvatar function for author avatars
  const getAuthorAvatar = (author: string, authorAvatar?: string) => {
    if (authorAvatar) return authorAvatar;
    return '/logo.png';
  };

  return (
    <article className="flex items-center space-x-3 mb-4">
      {showImage && image && (
        <Link to={`/article/${slug}`} className="shrink-0">
          <img 
            src={image} 
            alt={title} 
            className="w-20 h-20 object-cover"
          />
        </Link>
      )}
      <div>
        <h4 className="font-medium line-clamp-2 text-sm">
          <Link to={`/article/${slug}`} className="hover:text-news-red transition-colors">
            {title}
          </Link>
        </h4>
        <div className="flex items-center text-xs text-news-gray mt-1">
          <span className="flex items-center">
            <Clock size={12} className="mr-1" />
            {date}
          </span>
        </div>
      </div>
    </article>
  );
};

export default SmallArticleCard;
