import React from 'react';
import type { ImageDisplayPreset } from '@/lib/supabaseImageUrl';
import { optimiseSupabaseImageUrl } from '@/lib/supabaseImageUrl';

interface ArticleImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  fallbackSrc?: string;
  /** Transformation Supabase pour les URLs Storage */
  displayPreset?: ImageDisplayPreset | false;
}

const ArticleImage: React.FC<ArticleImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  fallbackSrc = '/placeholder.svg',
  displayPreset = 'card',
}) => {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = fallbackSrc;
  };

  const resolvedSrc =
    displayPreset === false ? src : optimiseSupabaseImageUrl(src, displayPreset);

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loading}
      decoding="async"
      onError={handleError}
    />
  );
};

export default ArticleImage;
