import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Heart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabaseClient';

interface ArticleProps {
  id: string;
  number: string;
  category: string;
  title: string;
  image: string;
  author: string;
  date: string;
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

const SidebarArticle = ({ article }: { article: ArticleProps }) => {
  return (
    <div className="flex items-start gap-4">
      <div className="relative min-w-[80px] w-20 h-20">
        <div className="absolute left-0 top-0 z-10 bg-[#ff184e] text-white text-center min-w-[30px] py-1 px-2 font-bold">
          {article.number}
        </div>
        <img 
          src={article.image} 
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <div className="text-gray-500 uppercase text-xs mb-1">{article.category}</div>
        <h4 className="font-bold text-sm mb-2 hover:text-[#ff184e] transition-colors">
          <Link to={`/article/${article.id}`}>
            {article.title}
          </Link>
        </h4>
        <div className="flex items-center text-gray-500 text-xs">
          <Calendar size={14} className="mr-1" />
          {article.date}
        </div>
      </div>
    </div>
  );
};

const SidebarTabs = () => {
  const { t } = useTranslation();
  // Dynamique : articles récents
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
          date: a.date_publication ?? a.date ?? '',
        })));
      }
      setLoadingRecent(false);
    };
    fetchRecentArticles();
  }, []);

  return (
    <Tabs defaultValue="recent" className="w-full">
      <div className="border-b mb-4">
        <TabsList className="bg-transparent p-0 gap-6">
          <TabsTrigger 
            value="recent" 
            className={cn(
              "px-2 pb-2 text-base font-medium data-[state=active]:shadow-none data-[state=active]:bg-transparent",
              "data-[state=active]:text-[#ff184e] data-[state=active]:border-b-2 data-[state=active]:border-[#ff184e]",
              "rounded-none"
            )}
          >
            <Clock size={16} className="mr-2" /> {t('Récents')}
          </TabsTrigger>
          <TabsTrigger 
            value="favorites"
            className={cn(
              "px-2 pb-2 text-base font-medium data-[state=active]:shadow-none data-[state=active]:bg-transparent",
              "data-[state=active]:text-[#ff184e] data-[state=active]:border-b-2 data-[state=active]:border-[#ff184e]",
              "rounded-none"
            )}
          >
            <Heart size={16} className="mr-2" /> {t('Favoris')}
          </TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="recent" className="mt-0">
        <div className="space-y-6">
          {loadingRecent && <div>Chargement...</div>}
          {errorRecent && <div className="text-red-500">{errorRecent}</div>}
          {!loadingRecent && !errorRecent && recentArticles.length === 0 && (
            <div>Aucun article récent trouvé.</div>
          )}
          {!loadingRecent && !errorRecent && recentArticles.map((article) => (
            <SidebarArticle key={article.id} article={article} />
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="favorites" className="mt-0">
        <div className="space-y-6">
          {favorites.map((article) => (
            <SidebarArticle key={article.id} article={article} />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default SidebarTabs;
