import React, { useEffect, useState, useMemo } from 'react';
import Header from '@/components/Header';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/hero';
import ArticleCard from '@/components/ArticleCard';
import SmallArticleCard from '@/components/SmallArticleCard';
import MostReadingSection from '@/components/MostReadingSection';
import PublishedVideoSection, { Video } from '@/components/PublishedVideoSection';
import Banner from '@/components/Banner';
import { Button } from '@/components/ui/button';
import Poll from '@/components/Poll';
import { supabase } from '@/lib/supabaseClient';
import { mapArticlesFromSupabase } from '@/lib/articleMapper';
import { motion } from 'framer-motion';
import { useCategories } from '@/hooks/useCategories';
import { applyStorageImageFallback, optimiseSupabaseImageUrl } from '@/lib/supabaseImageUrl';
import { ARTICLES_PUBLISHED_OR_FILTER, escapeForIlike } from '@/lib/utils';

/** Colonnes réellement présentes sur `articles` (éviter excerpt, title, image, etc. alias inexistants). */
const ARTICLES_HOME_SELECT =
  'id, slug, titre, meta_description, image_url, categorie, date_publication, auteur, statut';

const SECTION_TITLES = {
  selectedNews: 'Les choix de la rédaction',
  travelBlogs: 'Carnets de voyage',
  onlineVoting: 'Votre avis nous intéresse',
  technology: 'Tech & innovation',
  business: 'Économie & business',
  sport: 'Sport',
  entertainment: 'Culture & divertissement',
};

const CATEGORY_NAMES: Record<keyof typeof SECTION_TITLES, string[]> = {
  selectedNews: ['Actualité', 'Actualite'],
  travelBlogs: ['Voyage'],
  onlineVoting: [],
  technology: ['Technologie'],
  business: ['Économie', 'Economie', 'Business'],
  sport: ['Sport'],
  entertainment: ['Culture', 'Divertissement'],
};

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
}

function findMatchingCategory(dbCategories: { name: string }[], sectionKey: keyof typeof CATEGORY_NAMES): string | null {
  const allowedNames = CATEGORY_NAMES[sectionKey].map(normalize);
  if (!allowedNames.length) return null;
  for (const cat of dbCategories) {
    if (allowedNames.includes(normalize(cat.name))) {
      return cat.name;
    }
  }
  return null;
}

const fadeUpVariant: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const Index = () => {
  const { categories: dbCategories } = useCategories();

  const mappedCategories = useMemo(() => ({
    technology: findMatchingCategory(dbCategories, 'technology'),
    business: findMatchingCategory(dbCategories, 'business'),
    sport: findMatchingCategory(dbCategories, 'sport'),
    travel: findMatchingCategory(dbCategories, 'travelBlogs'),
    news: findMatchingCategory(dbCategories, 'selectedNews'),
    entertainment: findMatchingCategory(dbCategories, 'entertainment'),
  }), [dbCategories]);

  const [technologyArticles, setTechnologyArticles] = useState<any[]>([]);
  const [loadingTech, setLoadingTech] = useState(true);
  const [errorTech, setErrorTech] = useState<string | null>(null);

  const [businessArticles, setBusinessArticles] = useState<any[]>([]);
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [errorBusiness, setErrorBusiness] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchBusinessArticles = async () => {
      setLoadingBusiness(true);
      setErrorBusiness(null);
      const cat = mappedCategories.business?.trim();
      if (!cat) {
        setBusinessArticles([]);
        setLoadingBusiness(false);
        return;
      }
      const { data, error } = await supabase
        .from('articles')
        .select(ARTICLES_HOME_SELECT)
        .or(ARTICLES_PUBLISHED_OR_FILTER)
        .ilike('categorie', `%${escapeForIlike(cat)}%`)
        .order('date_publication', { ascending: false })
        .limit(3);
      if (error) {
        console.error('Erreur lors du chargement des articles Business:', error);
        setBusinessArticles([]);
      } else {
        setBusinessArticles(data || []);
      }
      setLoadingBusiness(false);
    };
    fetchBusinessArticles();
  }, [mappedCategories.business]);

  const mappedBusinessArticles = (businessArticles || []).map(a => ({
    slug: a.slug || a.id,
    title: a.titre ?? a.title,
    excerpt: a.meta_description ?? a.excerpt ?? '',
    image: a.image_url ?? a.image,
    category: a.categorie ?? a.category ?? 'Business',
    date: a.date_publication ?? a.date,
    author: a.auteur ?? a.author,
    featured: false,
  }));

  useEffect(() => {
    const fetchTechArticles = async () => {
      setLoadingTech(true);
      setErrorTech(null);
      const cat = mappedCategories.technology?.trim();
      if (!cat) {
        setTechnologyArticles([]);
        setLoadingTech(false);
        return;
      }
      const { data, error } = await supabase
        .from('articles')
        .select(ARTICLES_HOME_SELECT)
        .or(ARTICLES_PUBLISHED_OR_FILTER)
        .ilike('categorie', `%${escapeForIlike(cat)}%`)
        .order('date_publication', { ascending: false })
        .limit(2);

      if (error) {
        console.error('Erreur lors du chargement des articles Tech:', error);
        setTechnologyArticles([]);
      } else {
        setTechnologyArticles(data || []);
      }
      setLoadingTech(false);
    };
    fetchTechArticles();
  }, [mappedCategories.technology]);

  const mappedTechArticles = (technologyArticles || []).map(a => ({
    slug: a.slug || a.id,
    title: a.titre,
    excerpt: a.meta_description || '',
    image: a.image_url,
    category: 'Technologie',
    date: a.date_publication,
    author: a.auteur,
    featured: false,
  }));

  const [sportsArticles, setSportsArticles] = useState<any[]>([]);
  const [loadingSports, setLoadingSports] = useState(true);
  const [errorSports, setErrorSports] = useState<string | null>(null);

  useEffect(() => {
    const fetchSportsArticles = async () => {
      setLoadingSports(true);
      setErrorSports(null);
      const cat = mappedCategories.sport?.trim();
      if (!cat) {
        setSportsArticles([]);
        setLoadingSports(false);
        return;
      }
      const { data, error } = await supabase
        .from('articles')
        .select(ARTICLES_HOME_SELECT)
        .or(ARTICLES_PUBLISHED_OR_FILTER)
        .ilike('categorie', `%${escapeForIlike(cat)}%`)
        .order('date_publication', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Erreur lors du chargement des articles Sport:', error);
        setSportsArticles([]);
      } else {
        setSportsArticles(data || []);
      }
      setLoadingSports(false);
    };
    fetchSportsArticles();
  }, [mappedCategories.sport]);

  const mappedSportsArticles = (sportsArticles || []).map(a => {
    const art = a as any;
    return {
      slug: art.slug ?? art.id ?? '',
      title: art.titre ?? art.title ?? '',
      excerpt: art.meta_description ?? art.excerpt ?? '',
      image: art.image_url ?? art.image ?? '',
      category: 'Sport',
      date: art.date_publication ?? art.date ?? '',
      author: art.auteur ?? art.author ?? '',
      featured: true,
    };
  });
  
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [errorRecent, setErrorRecent] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentArticles = async () => {
      setLoadingRecent(true);
      setErrorRecent(null);
      const { data, error } = await supabase
        .from('articles')
        .select(ARTICLES_HOME_SELECT)
        .or(ARTICLES_PUBLISHED_OR_FILTER)
        .order('date_publication', { ascending: false })
        .limit(6);
      if (error) {
        console.error('Erreur lors du chargement des articles récents:', error);
        setRecentArticles([]);
      } else {
        setRecentArticles(data || []);
      }
      setLoadingRecent(false);
    };
    fetchRecentArticles();
  }, []);

  const mappedRecentArticles = mapArticlesFromSupabase(recentArticles || []);

  const [additionalData, setAdditionalData] = useState({
    selectedNews: [] as any[],
    travelBlogs: [] as any[],
    entertainmentArts: [] as any[]
  });
  const [loadingAdditional, setLoadingAdditional] = useState(true);

  useEffect(() => {
    const fetchAdditional = async () => {
      setLoadingAdditional(true);

      const byCategory = (cat: string | null, limit: number) => {
        const c = cat?.trim();
        if (!c) return Promise.resolve({ data: [] as any[], error: null });
        return supabase
          .from('articles')
          .select(ARTICLES_HOME_SELECT)
          .or(ARTICLES_PUBLISHED_OR_FILTER)
          .ilike('categorie', `%${escapeForIlike(c)}%`)
          .order('date_publication', { ascending: false })
          .limit(limit);
      };

      const [resNews, resTravel, resEnt] = await Promise.all([
        byCategory(mappedCategories.news, 3),
        byCategory(mappedCategories.travel, 3),
        byCategory(mappedCategories.entertainment, 1),
      ]);
      
      setAdditionalData({
        selectedNews: resNews.data || [],
        travelBlogs: resTravel.data || [],
        entertainmentArts: resEnt.data || []
      });
      setLoadingAdditional(false);
    };
    fetchAdditional();
  }, [mappedCategories.news, mappedCategories.travel, mappedCategories.entertainment]);

  const mappedEntertainmentArts = additionalData.entertainmentArts.map(a => ({
    id: a.id,
    slug: a.slug || a.id,
    title: a.titre,
    excerpt: a.meta_description || '',
    image: a.image_url,
    category: a.categorie || 'Divertissement',
    date: a.date_publication,
    author: a.auteur,
  }));
  
  return (
    <div className="min-h-screen bg-transparent text-gray-200 selection:bg-[#ff184e]/30 selection:text-white relative">
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[#0B0F19]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#ff184e]/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]"></div>
      </div>
      
      <TopBar />
      <Header />
      <main className="overflow-hidden">
        <HeroSection />
        
        {loadingRecent && <div className="py-12 text-center text-gray-400">On prépare vos derniers articles, un instant…</div>}
        {!loadingRecent && mappedRecentArticles.length === 0 && (
          <div className="py-12 text-center text-gray-400">Aucun article récent trouvé.</div>
        )}
        {!loadingRecent && mappedRecentArticles.length > 0 && (
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant}>
            <MostReadingSection articles={mappedRecentArticles} />
          </motion.div>
        )}
        
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant}>
          <PublishedVideoSection />
        </motion.div>
        
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant}>
                <h2 className="text-2xl font-jost font-bold mb-6 text-white" style={{ borderBottom: '2px solid #ff184e', display: 'inline-block', paddingBottom: '4px' }}>{SECTION_TITLES.selectedNews}</h2>
                <div className="space-y-4">
                  {loadingAdditional && <div className="text-gray-400">Nous parcourons la rédaction pour vous…</div>}
                  {!loadingAdditional && additionalData.selectedNews.length === 0 && <div className="text-gray-400">Rien à afficher ici pour le moment. Revenez un peu plus tard.</div>}
                  {!loadingAdditional && additionalData.selectedNews.map((item, idx) => (
                    <motion.div whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.05)' }} key={idx} className="flex gap-4 items-center cursor-pointer p-3 rounded-xl transition-colors glass-panel" onClick={() => window.location.href = `/article/${item.slug || item.id}`}>
                      <div className="relative min-w-[120px] w-[120px] h-[80px] rounded-lg overflow-hidden border border-white/10 shadow-lg">
                        <img 
                          src={optimiseSupabaseImageUrl(item.image_url || '/placeholder.svg', 'thumb')} 
                          alt={item.titre} 
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                          onError={(e) => applyStorageImageFallback(e.currentTarget)}
                          loading="lazy"
                        />
                        <span className={`absolute top-1 left-1 px-2 py-0.5 rounded text-white text-[10px] uppercase font-bold tracking-wider ${item.categorie === 'Mode' || item.categorie === 'Fashion' ? 'bg-pink-600' : 'bg-[#ff184e]'}`}>{item.categorie || 'Actualités'}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center text-gray-400 text-xs mb-1.5 font-medium">
                          <span className="mr-2">🕒 {new Date(item.date_publication).toLocaleDateString()}</span>
                        </div>
                        <h3 className="font-bold text-sm text-gray-100 font-jost line-clamp-2 hover:text-[#ff184e] transition-colors">{item.titre}</h3>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant}>
                <h2 className="text-2xl font-jost font-bold mb-6 text-white" style={{ borderBottom: '2px solid #ff184e', display: 'inline-block', paddingBottom: '4px' }}>{SECTION_TITLES.travelBlogs}</h2>
                <div className="space-y-4">
                  {loadingAdditional && <div className="text-gray-400">Quelques secondes, nous chargeons les carnets de voyage…</div>}
                  {!loadingAdditional && additionalData.travelBlogs.length === 0 && <div className="text-gray-400">Aucun récit de voyage publié pour l’instant.</div>}
                  {!loadingAdditional && additionalData.travelBlogs.map((item, idx) => (
                    <motion.div whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.05)' }} key={idx} className="flex gap-4 items-center cursor-pointer p-3 rounded-xl transition-colors glass-panel" onClick={() => window.location.href = `/article/${item.slug || item.id}`}>
                      <div className="relative min-w-[120px] w-[120px] h-[80px] rounded-lg overflow-hidden border border-white/10 shadow-lg">
                        <img 
                          src={optimiseSupabaseImageUrl(item.image_url || '/placeholder.svg', 'thumb')} 
                          alt={item.titre} 
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                          onError={(e) => applyStorageImageFallback(e.currentTarget)}
                          loading="lazy"
                        />
                        <span className="absolute top-1 left-1 px-2 py-0.5 rounded text-white text-[10px] uppercase font-bold tracking-wider bg-lime-500">{item.categorie || 'Voyage'}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center text-gray-400 text-xs mb-1.5 font-medium">
                          <span className="mr-2">🕒 {new Date(item.date_publication).toLocaleDateString()}</span>
                        </div>
                        <h3 className="font-bold text-sm text-gray-100 font-jost line-clamp-2 hover:text-[#ff184e] transition-colors">{item.titre}</h3>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant}>
                <h2 className="text-2xl font-jost font-bold mb-6 text-white" style={{ borderBottom: '2px solid #ff184e', display: 'inline-block', paddingBottom: '4px' }}>{SECTION_TITLES.onlineVoting}</h2>
                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff184e]/10 rounded-full blur-[40px] pointer-events-none"></div>
                  <Poll />
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="container mx-auto px-4 my-8 relative">
          <div className="glass-panel rounded-2xl p-1 overflow-hidden shadow-2xl">
            <Banner position="accueil-sous-votes" width={1200} height={120} />
          </div>
        </motion.div>
        
        <section className="py-16 relative">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl -z-10"></div>
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant}>
                <h2 className="section-title text-white">{SECTION_TITLES.technology}</h2>
                <div className="space-y-6">
                  {loadingTech && <div className="text-gray-400">On surveille l’actualité tech…</div>}
                  {!loadingTech && technologyArticles.length === 0 && (
                    <div className="text-gray-400">Aucun article publié ici pour l’instant.</div>
                  )}
                  {!loadingTech && mappedTechArticles[0] && (
                    <ArticleCard {...mappedTechArticles[0]} />
                  )}
                  {!loadingTech && mappedTechArticles[1] && (
                    <SmallArticleCard {...mappedTechArticles[1]} />
                  )}
                </div>
              </motion.div>
              
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant} transition={{ delay: 0.2 }}>
                <h2 className="section-title text-white">{SECTION_TITLES.business}</h2>
                <div className="space-y-6">
                  {loadingBusiness && <div className="text-gray-400">Les dernières analyses économiques arrivent…</div>}
                  {!loadingBusiness && mappedBusinessArticles.length === 0 && (
                      <div className="text-gray-400">Nous n’avons pas encore publié d’article dans cette rubrique.</div>
                  )}
                  {!loadingBusiness && mappedBusinessArticles.map((article, index) => (
                    index === 0 ? (
                      <ArticleCard key={article.slug} {...article} />
                    ) : (
                      <SmallArticleCard
                        key={article.slug}
                        slug={article.slug}
                        title={article.title}
                        image={article.image}
                        date={article.date}
                      />
                    )
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant}>
                <h2 className="section-title text-white">{SECTION_TITLES.sport}</h2>
                {loadingSports && <div className="text-gray-400">On met à jour les résultats sportifs…</div>}
                {!loadingSports && mappedSportsArticles[0] && (
                  <ArticleCard {...mappedSportsArticles[0]} />
                )}
                {!loadingSports && mappedSportsArticles.length === 0 && (
                  <div className="text-gray-400">Pas encore d’article sport ici. Revenez après le prochain coup d’envoi.</div>
                )}
              </motion.div>
              
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant} transition={{ delay: 0.2 }}>
                <h2 className="section-title text-white">{SECTION_TITLES.entertainment}</h2>
                {loadingAdditional && <div className="text-gray-400">On choisit quelques idées culturelles pour vous…</div>}
                {!loadingAdditional && mappedEntertainmentArts.length === 0 && <div className="text-gray-400">Pas encore de contenu dans cette rubrique, la rédaction y travaille.</div>}
                {!loadingAdditional && mappedEntertainmentArts.map((article) => (
                  <ArticleCard
                    key={article.id}
                    slug={article.slug || article.id.toString()}
                    title={article.title}
                    excerpt={article.excerpt}
                    image={article.image}
                    category={article.category}
                    date={article.date}
                    author={article.author}
                    featured={true}
                  />
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
