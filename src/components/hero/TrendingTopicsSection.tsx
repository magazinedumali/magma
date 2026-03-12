import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

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

const SectionItem = ({ article, delay = 0 }: { article: ArticleProps, delay?: number }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.4 }}
    whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)', scale: 1.02 }}
    className="flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer group glass-panel"
  >
    <div className="relative min-w-[80px] w-20 h-20 rounded-lg overflow-hidden shadow-lg border border-white/10">
      <div className="absolute left-0 top-0 z-10 bg-[#ff184e]/90 text-white text-center min-w-[30px] py-1 px-1.5 text-sm font-bold shadow-[0_0_10px_rgba(255,24,78,0.5)]">
        {article.number}
      </div>
      <img 
        src={article.image} 
        alt={article.title}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
    </div>
    <div className="flex-1">
      <div className="text-[#ff184e] uppercase text-[10px] tracking-wider mb-1 font-bold">{article.category}</div>
      <h4 className="font-bold text-sm mb-2 text-gray-200 group-hover:text-white transition-colors line-clamp-2">
        <Link to={`/article/${article.slug || article.id}`}>{article.title}</Link>
      </h4>
      <div className="flex items-center text-gray-400 text-xs font-medium">
        <img 
          src={getAuthorAvatar(article.author, article.authorAvatar)}
          alt={article.author}
          className="w-5 h-5 rounded-full mr-2 border border-white/20"
          onError={e => { e.currentTarget.src = '/logo.png'; }}
        />
        {article.author}
        <span className="flex items-center ml-2 text-[#ff184e]">
          <Calendar size={12} className="mr-1" />
          <span className="text-gray-400">{article.date}</span>
        </span>
      </div>
    </div>
  </motion.div>
);

const TrendingTopicsSection = () => {
  const { t } = useTranslation();
  return (
    <section className="bg-transparent py-16 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left: Trending Topics */}
          <div className="flex flex-col">
            <h2 className="text-2xl font-jost font-bold mb-6 text-white border-b-2 border-[#ff184e] pb-2 inline-block relative w-max">
              {t('Sujets Tendances')}
              <div className="absolute -bottom-[2px] right-0 w-8 h-[2px] bg-[#ff184e] shadow-[0_0_10px_#ff184e]"></div>
            </h2>
            <div className="space-y-4 flex-1">
              {trendingTopics.map((article, idx) => (
                <SectionItem key={article.id} article={article} delay={idx * 0.1} />
              ))}
            </div>
          </div>

          {/* Center: Featured Article */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center lg:mt-14"
          >
            <div className="relative w-full h-[400px] lg:h-[500px] rounded-2xl overflow-hidden glass-panel border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)] group">
              <img 
                src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5" 
                alt="Featured Article"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
              
              <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                <span className="inline-block bg-[#ff184e]/90 backdrop-blur-sm text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 mb-4 rounded-full shadow-[0_0_15px_rgba(255,24,78,0.5)]">#BUSINESS</span>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 line-clamp-3 font-jost hover:text-[#ff184e] transition-colors cursor-pointer group-hover:translate-x-2 transition-transform duration-300">
                  Finally found a work computer That's practically perfect
                </h2>
                <div className="flex items-center text-gray-300 glass-panel w-max px-4 py-2 rounded-full border-white/10 text-xs font-medium">
                  <img 
                    src={getAuthorAvatar('Magezix')}
                    alt="Magezix"
                    className="w-6 h-6 rounded-full mr-2 border border-white/30"
                    onError={e => { e.currentTarget.src = '/logo.png'; }}
                  />
                  Magezix
                  <div className="w-1 h-1 bg-gray-500 rounded-full mx-3"></div>
                  <span className="flex items-center text-[#ff184e]">
                    <Calendar size={14} className="mr-1.5" />
                    <span className="text-gray-300">May 26, 2022</span>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Tabs for Popular, Hot Topics, Top News */}
          <div className="flex flex-col lg:mt-12">
            <div className="glass-panel p-6 rounded-2xl h-full flex flex-col border border-white/10">
              <Tabs defaultValue="popular" className="w-full flex-1 flex flex-col items-center">
                <TabsList className="bg-black/30 w-full rounded-full p-1 gap-1 mb-6 border border-white/5">
                  <TabsTrigger 
                    value="popular" 
                    className="flex-1 rounded-full text-xs font-bold data-[state=active]:bg-[#ff184e] data-[state=active]:text-white data-[state=active]:shadow-[0_0_15px_rgba(255,24,78,0.5)] text-gray-400 transition-all duration-300"
                  >
                    {t('Populaires')}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="hot-topics"
                    className="flex-1 rounded-full text-xs font-bold data-[state=active]:bg-[#ff184e] data-[state=active]:text-white data-[state=active]:shadow-[0_0_15px_rgba(255,24,78,0.5)] text-gray-400 transition-all duration-300"
                  >
                    {t('Sujets brûlants')}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="top-news"
                    className="flex-1 rounded-full text-xs font-bold data-[state=active]:bg-[#ff184e] data-[state=active]:text-white data-[state=active]:shadow-[0_0_15px_rgba(255,24,78,0.5)] text-gray-400 transition-all duration-300"
                  >
                    {t('Actualités')}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="popular" className="w-full mt-0 flex-1">
                  <div className="space-y-4">
                    {popularArticles.map((article, idx) => (
                      <SectionItem key={article.id} article={article} delay={idx * 0.1} />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="hot-topics" className="w-full mt-0 flex-1">
                  <div className="text-center py-12 text-gray-500 glass-panel rounded-xl border-dashed border-white/20">
                    <p className="font-medium text-sm">Contenu à venir</p>
                  </div>
                </TabsContent>
                <TabsContent value="top-news" className="w-full mt-0 flex-1">
                  <div className="text-center py-12 text-gray-500 glass-panel rounded-xl border-dashed border-white/20">
                    <p className="font-medium text-sm">Contenu à venir</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default TrendingTopicsSection;
