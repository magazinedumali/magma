import React from 'react';
import ArticleCard from '@/components/ArticleCard';
import { useTranslation } from 'react-i18next';

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  author: string;
}

interface MostReadingSectionProps {
  articles: Article[];
}

const MostReadingSection: React.FC<MostReadingSectionProps> = ({ articles }) => {
  const { t } = useTranslation();
  return (
    <section className="py-12 bg-transparent text-white">
      <div className="container mx-auto px-4">
        <h2 className="section-title text-white">{t('Plus lus')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {articles.map((article) => (
            <ArticleCard key={article.id} {...article} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MostReadingSection; 