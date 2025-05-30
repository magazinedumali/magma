import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface ArticleProps {
  id: string;
  number: string;
  category: string;
  title: string;
  image: string;
  author: string;
  date: string;
  slug?: string;
  authorAvatar?: string;
}

const trendingTopics: ArticleProps[] = [
  {
    id: '1',
    number: '01',
    category: 'TECH NEWS',
    title: 'It now attracts over one million ever visitors',
    image: 'https://images.unsplash.com/photo-1580894894513-541e068a3e2b',
    author: 'Magezix',
    date: 'May 25, 2022'
  },
  {
    id: '2',
    number: '02',
    category: 'SPORTS',
    title: 'The blog was launched as result organizing',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
    author: 'Magezix',
    date: 'May 25, 2022'
  },
  {
    id: '3',
    number: '03',
    category: 'LIFESTYLE',
    title: 'Next Web Conference which was initially',
    image: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93',
    author: 'Magezix',
    date: 'May 25, 2022'
  },
  {
    id: '4',
    number: '04',
    category: 'POLITICS',
    title: 'which has grown to take its place among the',
    image: 'https://images.unsplash.com/photo-1551076805-e1869033e561',
    author: 'Magezix',
    date: 'May 25, 2022'
  }
];

const popularArticles: ArticleProps[] = [
  {
    id: '9',
    number: '01',
    category: 'FASHION',
    title: 'Finally found Pc Programm That\'s practically perfect',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
    author: 'Magezix',
    date: 'Jun 14, 2022'
  },
  {
    id: '10',
    number: '02',
    category: 'FASHION',
    title: 'There are several differences between outbound and',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b',
    author: 'Magezix',
    date: 'Jun 09, 2022'
  },
  {
    id: '11',
    number: '03',
    category: 'FASHION',
    title: 'before he was sought out by Weblogs Inc. to',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25cc55',
    author: 'Magezix',
    date: 'Jun 09, 2022'
  },
  {
    id: '12',
    number: '04',
    category: 'FASHION',
    title: 'Formerly the Gaw Media network, Internet',
    image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e',
    author: 'Magezix',
    date: 'Jun 09, 2022'
  }
];

const getAuthorAvatar = (author: string, authorAvatar?: string) => {
  if (authorAvatar) return authorAvatar;
  return '/logo.png';
};

const TrendingTopicsSection = () => {
  const { t } = useTranslation();
  return (
    <section className="bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Trending Topics */}
          <div>
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-[#ff184e] pb-1">{t('Sujets Tendances')}</h2>
            <div className="space-y-6">
              {trendingTopics.map((article) => (
                <div key={article.id} className="flex items-start gap-4">
                  <div className="relative min-w-[80px] w-20 h-20">
                    <div className="absolute left-0 top-0 z-10 bg-[#ff184e] text-white text-center min-w-[30px] py-1 px-2 font-bold">
                      {article.number}
                    </div>
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div>
                    <div className="text-gray-500 uppercase text-xs mb-1">{article.category}</div>
                    <h4 className="font-bold text-sm mb-2 hover:text-[#ff184e] transition-colors">
                      <Link to={`/article/${article.slug || article.id}`}>{article.title}</Link>
                    </h4>
                    <div className="flex items-center text-gray-500 text-xs">
                      <img 
                        src={getAuthorAvatar(article.author, article.authorAvatar)}
                        alt={article.author}
                        className="w-6 h-6 rounded-full mr-2"
                        onError={e => { e.currentTarget.src = '/logo.png'; }}
                      />
                      {article.author}
                      <span className="flex items-center ml-2">
                        <Calendar size={14} className="mr-1" />
                        {article.date}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center: Featured Article */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-full h-full rounded-lg overflow-hidden shadow">
              <img 
                src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5" 
                alt="Featured Article"
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <span className="inline-block bg-[#ff184e] text-white text-xs uppercase px-2 py-1 mb-2">#BUSINESS</span>
                <h2 className="text-2xl font-bold text-white mb-2">Finally found a work computer That's practically perfect</h2>
                <div className="flex items-center text-white">
                  <img 
                    src={getAuthorAvatar('Magezix')}
                    alt="Magezix"
                    className="w-6 h-6 rounded-full mr-2"
                    onError={e => { e.currentTarget.src = '/logo.png'; }}
                  />
                  Magezix
                  <span className="flex items-center ml-2">
                    <Calendar size={14} className="mr-1" />
                    May 26, 2022
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Tabs for Popular, Hot Topics, Top News */}
          <div>
            <Tabs defaultValue="popular" className="w-full">
              <TabsList className="bg-transparent p-0 gap-6 mb-4 border-b">
                <TabsTrigger 
                  value="popular" 
                  className={cn(
                    "px-2 pb-2 text-base font-medium data-[state=active]:shadow-none data-[state=active]:bg-transparent",
                    "data-[state=active]:text-[#ff184e] data-[state=active]:border-b-2 data-[state=active]:border-[#ff184e]",
                    "rounded-none"
                  )}
                >
                  {t('Populaires')}
                </TabsTrigger>
                <TabsTrigger 
                  value="hot-topics"
                  className={cn(
                    "px-2 pb-2 text-base font-medium data-[state=active]:shadow-none data-[state=active]:bg-transparent",
                    "data-[state=active]:text-[#ff184e] data-[state=active]:border-b-2 data-[state=active]:border-[#ff184e]",
                    "rounded-none"
                  )}
                >
                  {t('Sujets brûlants')}
                </TabsTrigger>
                <TabsTrigger 
                  value="top-news"
                  className={cn(
                    "px-2 pb-2 text-base font-medium data-[state=active]:shadow-none data-[state=active]:bg-transparent",
                    "data-[state=active]:text-[#ff184e] data-[state=active]:border-b-2 data-[state=active]:border-[#ff184e]",
                    "rounded-none"
                  )}
                >
                  {t('Actualités')}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="popular" className="mt-4">
                <div className="space-y-6">
                  {popularArticles.map((article) => (
                    <div key={article.id} className="flex items-start gap-4">
                      <div className="relative min-w-[80px] w-20 h-20">
                        <div className="absolute left-0 top-0 z-10 bg-[#ff184e] text-white text-center min-w-[30px] py-1 px-2 font-bold">
                          {article.number}
                        </div>
                        <img 
                          src={article.image} 
                          alt={article.title}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div>
                        <div className="text-gray-500 uppercase text-xs mb-1">{article.category}</div>
                        <h4 className="font-bold text-sm mb-2 hover:text-[#ff184e] transition-colors">
                          <Link to={`/article/${article.slug || article.id}`}>{article.title}</Link>
                        </h4>
                        <div className="flex items-center text-gray-500 text-xs">
                          <img 
                            src={getAuthorAvatar(article.author, article.authorAvatar)}
                            alt={article.author}
                            className="w-6 h-6 rounded-full mr-2"
                            onError={e => { e.currentTarget.src = '/logo.png'; }}
                          />
                          {article.author}
                          <span className="flex items-center ml-2">
                            <Calendar size={14} className="mr-1" />
                            {article.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="hot-topics" className="mt-4">
                <div className="text-center py-8 text-gray-500">Content for Hot Topics will appear here</div>
              </TabsContent>
              <TabsContent value="top-news" className="mt-4">
                <div className="text-center py-8 text-gray-500">Content for Top News will appear here</div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendingTopicsSection;
