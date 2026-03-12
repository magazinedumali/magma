import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <motion.article 
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className={`glass-panel rounded-xl overflow-hidden flex flex-col ${featured ? '' : 'h-full'}`}
    >
      <Link to={`/article/${slug}`} className="block relative overflow-hidden group">
        <motion.img 
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.5 }}
          src={image} 
          alt={title} 
          className="w-full h-56 object-cover transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
        <span className="absolute top-4 left-4 bg-[#ff184e]/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-[0_0_10px_rgba(255,24,78,0.5)]">
          {category}
        </span>
      </Link>
      
      <div className="p-5 flex flex-col flex-1 relative z-10 bg-gradient-to-b from-white/5 to-transparent">
        <h3 className={`font-bold mb-3 line-clamp-2 text-white group-hover:text-[#ff184e] transition-colors ${featured ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
          <Link to={`/article/${slug}`} className="hover:text-[#ff184e] transition-colors">
            {title}
          </Link>
        </h3>
        
        {featured && (
          <p className="text-gray-400 mb-5 line-clamp-3 text-sm leading-relaxed">{excerpt}</p>
        )}
        
        <div className="mt-auto pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-gray-400 gap-y-2">
          <div className="flex items-center space-x-3">
            <span className="flex items-center font-medium text-gray-300">
              <img src={getAuthorAvatar(author, authorAvatar)} alt={author} className="w-5 h-5 rounded-full mr-2 border border-white/20"/>
              {author}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="flex items-center">
              <Clock size={12} className="mr-1 text-[#ff184e]" />
              {new Date(date).toLocaleDateString()}
            </span>
            <span className="flex items-center">
              <Eye size={12} className="mr-1 text-[#ff184e]" />
              {views}
            </span>
            <span className="flex items-center">
              <MessageCircle size={12} className="mr-1 text-[#ff184e]" />
              {comments_count}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default ArticleCard;
