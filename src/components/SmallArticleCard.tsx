import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { optimiseSupabaseImageUrl } from '@/lib/supabaseImageUrl';

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
  return (
    <motion.article 
      whileHover={{ scale: 1.02 }}
      className="flex items-center space-x-4 mb-4 p-3 glass-panel rounded-lg hover:bg-white/10 transition-colors group cursor-pointer"
    >
      {showImage && image && (
        <Link to={`/article/${slug}`} className="shrink-0 overflow-hidden rounded relative w-24 h-24 shadow-md bg-black/40">
          <motion.img 
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.4 }}
            src={image ? optimiseSupabaseImageUrl(image, 'thumb') : image} 
            alt={title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </Link>
      )}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h4 className="font-bold line-clamp-3 text-sm md:text-base text-gray-200 group-hover:text-white transition-colors mb-2 leading-tight font-jost">
          <Link to={`/article/${slug}`} className="hover:text-[#ff184e] transition-colors">
            {title}
          </Link>
        </h4>
        <div className="flex items-center text-xs text-gray-400 font-medium font-jost">
          <span className="flex items-center text-[#ff184e]">
            <Icon icon="solar:clock-circle-bold-duotone" className="mr-1.5 text-base" />
            <span className="text-gray-400 group-hover:text-gray-300 transition-colors">{new Date(date).toLocaleDateString()}</span>
          </span>
        </div>
      </div>
    </motion.article>
  );
};

export default SmallArticleCard;
