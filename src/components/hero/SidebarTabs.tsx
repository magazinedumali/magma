import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Heart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';

interface ArticleProps {
  id: string;
  number: string;
  category: string;
  title: string;
  image: string;
  author: string;
  date: string;
}

const favorites: ArticleProps[] = [
  {
    id: '5',
    number: '01',
    category: 'SPORTS',
    title: 'The blog was launched as result organizing',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
    author: 'Magezix',
    date: 'May 25, 2022'
  },
  {
    id: '6',
    number: '02',
    category: 'LIFESTYLE',
    title: 'Next Web Conference which was initially',
    image: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93',
    author: 'Magezix', 
    date: 'May 25, 2022'
  },
  {
    id: '7',
    number: '03',
    category: 'POLITICS',
    title: 'which has grown to take its place among the',
    image: 'https://images.unsplash.com/photo-1551076805-e1869033e561',
    author: 'Magezix',
    date: 'May 25, 2022'
  },
  {
    id: '8',
    number: '04',
    category: 'TRAVEL',
    title: 'he most popular blogs on the web today.',
    image: 'https://images.unsplash.com/photo-1498307833015-e7b400441eb8',
    author: 'Magezix',
    date: 'May 25, 2022'
  }
];

const SidebarArticle = ({ article, delay = 0 }: { article: ArticleProps, delay?: number }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
      className="flex items-start gap-4 p-2 rounded-xl transition-all cursor-pointer group"
    >
      <div className="relative min-w-[90px] w-[90px] h-[90px] rounded-lg overflow-hidden border border-white/10 shadow-lg">
        <div className="absolute left-0 top-0 z-10 bg-[#ff184e]/90 backdrop-blur-sm text-white text-center min-w-[30px] py-1 px-2 font-bold text-sm shadow-[0_0_10px_rgba(255,24,78,0.5)]">
          {article.number}
        </div>
        <img 
          src={article.image || '/placeholder.svg'} 
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
      </div>
      <div className="flex-1 min-w-0 py-1">
        <div className="text-[#ff184e] font-bold uppercase text-[10px] tracking-wider mb-1">{article.category}</div>
        <h4 className="font-bold text-sm mb-2 text-gray-200 group-hover:text-white transition-colors line-clamp-2 leading-tight">
          <Link to={`/article/${article.id}`}>
            {article.title}
          </Link>
        </h4>
        <div className="flex items-center text-gray-400 text-xs font-medium">
          <Calendar size={12} className="mr-1 text-[#ff184e]" />
          {article.date}
        </div>
      </div>
    </motion.div>
  );
};

const SidebarTabs = () => {
  const { t } = useTranslation();
  const [recentArticles, setRecentArticles] = useState<ArticleProps[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [errorRecent, setErrorRecent] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentArticles = async () => {
      setLoadingRecent(true);
      setErrorRecent(null);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('statut', 'publie')
        .order('date_publication', { ascending: false })
        .limit(4);
      if (error) {
        setErrorRecent('Erreur lors du chargement des articles récents.');
        setRecentArticles([]);
      } else {
        setRecentArticles((data || []).map((a: any, idx: number) => ({
          id: a.id,
          number: String(idx + 1).padStart(2, '0'),
          category: a.categorie ?? a.category ?? '',
          title: a.titre ?? a.title ?? '',
          image: a.image_url ?? a.image ?? '',
          author: a.auteur ?? a.author ?? '',
          date: a.date_publication ? new Date(a.date_publication).toLocaleDateString() : '',
        })));
      }
      setLoadingRecent(false);
    };
    fetchRecentArticles();
  }, []);

  return (
    <div className="p-6 h-full flex flex-col bg-transparent text-white">
      <Tabs defaultValue="recent" className="w-full flex-1 flex flex-col">
        <div className="border-b border-white/10 mb-6">
          <TabsList className="bg-transparent p-0 gap-6 w-full justify-start h-auto">
            <TabsTrigger 
              value="recent" 
              className={cn(
                "px-2 pb-3 pt-2 text-base font-bold data-[state=active]:shadow-none data-[state=active]:bg-transparent",
                "text-gray-400 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#ff184e]",
                "rounded-none transition-colors"
              )}
            >
              <Clock size={18} className="mr-2" /> {t('Récents')}
            </TabsTrigger>
            <TabsTrigger 
              value="favorites"
              className={cn(
                "px-2 pb-3 pt-2 text-base font-bold data-[state=active]:shadow-none data-[state=active]:bg-transparent",
                "text-gray-400 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#ff184e]",
                "rounded-none transition-colors"
              )}
            >
              <Heart size={18} className="mr-2" /> {t('Favoris')}
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="recent" className="flex-1 mt-0">
          <div className="space-y-4">
            {loadingRecent && <div className="text-gray-400 animate-pulse">Chargement...</div>}
            {errorRecent && <div className="text-red-400 bg-red-400/10 p-3 rounded-xl">{errorRecent}</div>}
            {!loadingRecent && !errorRecent && recentArticles.length === 0 && (
              <div className="text-gray-400">Aucun article récent trouvé.</div>
            )}
            {!loadingRecent && !errorRecent && recentArticles.map((article, idx) => (
              <SidebarArticle key={article.id} article={article} delay={idx * 0.1} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="favorites" className="flex-1 mt-0">
          <div className="space-y-4">
            {favorites.map((article, idx) => (
              <SidebarArticle key={article.id} article={article} delay={idx * 0.1} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SidebarTabs;
