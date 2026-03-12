import React, { useEffect, useState } from 'react';
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

// Titres de sections factorisés pour faciliter la traduction
const SECTION_TITLES = {
  selectedNews: 'Actualités sélectionnées',
  travelBlogs: 'Blogs de voyage',
  onlineVoting: 'Sondage en ligne',
  technology: 'Technologie',
  business: 'Business',
  sport: 'Sport',
  entertainment: 'Divertissement',
};

const Index = () => {
  // Remplacement de la logique statique pour la section Technologie
  const [technologyArticles, setTechnologyArticles] = useState<any[]>([]);
  const [loadingTech, setLoadingTech] = useState(true);
  const [errorTech, setErrorTech] = useState<string | null>(null);

  // --- Section Business dynamique ---
  const [businessArticles, setBusinessArticles] = useState<any[]>([]);
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [errorBusiness, setErrorBusiness] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchBusinessArticles = async () => {
      setLoadingBusiness(true);
      setErrorBusiness(null);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('statut', 'publie')
        .eq('categorie', 'Business')
        .order('date_publication', { ascending: false })
        .limit(3);
      if (error) {
        setErrorBusiness('Erreur lors du chargement des articles.');
        setBusinessArticles([]);
      } else {
        setBusinessArticles(data || []);
      }
      setLoadingBusiness(false);
    };
    fetchBusinessArticles();
  }, []);

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

      // Récupérer les articles de la catégorie 'Technologie' (case-insensitive)
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('statut', 'publie')
        .ilike('categorie', 'Technologie')
        .order('date_publication', { ascending: false })
        .limit(2);

      if (error) {
        setErrorTech('Erreur lors du chargement des articles.');
        setTechnologyArticles([]);
      } else {
        setTechnologyArticles(data || []);
      }
      setLoadingTech(false);
    };
    fetchTechArticles();
  }, []);

  // Mapping des articles Supabase vers les props attendues par les composants d'affichage
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

  // --- Section Sport dynamique ---
  const [sportsArticles, setSportsArticles] = useState<any[]>([]);
  const [loadingSports, setLoadingSports] = useState(true);
  const [errorSports, setErrorSports] = useState<string | null>(null);

  useEffect(() => {
    const fetchSportsArticles = async () => {
      setLoadingSports(true);
      setErrorSports(null);

      // Récupérer les articles de la catégorie 'Sport' (case-insensitive, matches 'Sport' or 'Sports')
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('statut', 'publie')
        .ilike('categorie', 'Sport%')
        .order('date_publication', { ascending: false })
        .limit(1);

      if (error) {
        setErrorSports('Erreur lors du chargement des articles.');
        setSportsArticles([]);
      } else {
        setSportsArticles(data || []);
      }
      setLoadingSports(false);
    };
    fetchSportsArticles();
  }, []);

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
  
  // --- Section Articles Récents dynamique ---
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
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
        .limit(6);
      if (error) {
        setErrorRecent('Erreur lors du chargement des articles récents.');
        setRecentArticles([]);
      } else {
        setRecentArticles(data || []);
      }
      setLoadingRecent(false);
    };
    fetchRecentArticles();
  }, []);

  const mappedRecentArticles = mapArticlesFromSupabase(recentArticles || []);

  // --- Section Additional dynamique (News, Travel, Entertainment) ---
  const [additionalData, setAdditionalData] = useState({
    selectedNews: [] as any[],
    travelBlogs: [] as any[],
    entertainmentArts: [] as any[]
  });
  const [loadingAdditional, setLoadingAdditional] = useState(true);

  useEffect(() => {
    const fetchAdditional = async () => {
      setLoadingAdditional(true);
      const [ resNews, resTravel, resEnt ] = await Promise.all([
        supabase.from('articles').select('*').eq('statut', 'publie').ilike('categorie', '%Actualit%').order('date_publication', { ascending: false }).limit(3),
        supabase.from('articles').select('*').eq('statut', 'publie').ilike('categorie', 'Voyage').order('date_publication', { ascending: false }).limit(3),
        supabase.from('articles').select('*').eq('statut', 'publie').ilike('categorie', 'Divertissement').order('date_publication', { ascending: false }).limit(1)
      ]);
      setAdditionalData({
        selectedNews: resNews.data || [],
        travelBlogs: resTravel.data || [],
        entertainmentArts: resEnt.data || []
      });
      setLoadingAdditional(false);
    };
    fetchAdditional();
  }, []);

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
    <div>
      <TopBar />
      <Header />
      <main>
        <HeroSection />
        
        {/* Section MostReadingSection dynamique */}
        {loadingRecent && <div className="py-12 text-center">Chargement des articles récents...</div>}
        {errorRecent && <div className="py-12 text-center text-red-500">{errorRecent}</div>}
        {!loadingRecent && !errorRecent && mappedRecentArticles.length === 0 && (
          <div className="py-12 text-center">Aucun article récent trouvé.</div>
        )}
        {!loadingRecent && !errorRecent && mappedRecentArticles.length > 0 && (
          <MostReadingSection articles={mappedRecentArticles} />
        )}
        
        <PublishedVideoSection />
        
        {/* Latest & Trending */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Selected News */}
              <div>
                <h2 className="text-2xl font-jost font-bold mb-4" style={{ borderBottom: '2px solid #ff184e', display: 'inline-block', paddingBottom: '4px' }}>{SECTION_TITLES.selectedNews}</h2>
                <div className="space-y-6">
                  {loadingAdditional && <div>Chargement...</div>}
                  {!loadingAdditional && additionalData.selectedNews.length === 0 && <div>Aucun article.</div>}
                  {!loadingAdditional && additionalData.selectedNews.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-start cursor-pointer hover:bg-gray-50 p-2 -ml-2 rounded transition-colors" onClick={() => window.location.href = `/article/${item.slug || item.id}`}>
                      <div className="relative min-w-[140px] w-[140px] h-[90px] rounded-lg overflow-hidden">
                        <img 
                          src={item.image_url || '/placeholder.svg'} 
                          alt={item.titre} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                          loading="lazy"
                        />
                        <span className={`absolute top-2 left-2 px-3 py-1 rounded text-white text-xs font-bold ${item.categorie === 'Mode' || item.categorie === 'Fashion' ? 'bg-pink-600' : 'bg-red-600'}`}>{item.categorie || 'Actualités'}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center text-gray-500 text-sm mb-1">
                          <span className="mr-2">📅 {new Date(item.date_publication).toLocaleDateString()}</span>
                        </div>
                        <h3 className="font-bold text-lg font-jost mb-2 line-clamp-2">{item.titre}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Travel Blogs */}
              <div>
                <h2 className="text-2xl font-jost font-bold mb-4" style={{ borderBottom: '2px solid #ff184e', display: 'inline-block', paddingBottom: '4px' }}>{SECTION_TITLES.travelBlogs}</h2>
                <div className="space-y-6">
                  {loadingAdditional && <div>Chargement...</div>}
                  {!loadingAdditional && additionalData.travelBlogs.length === 0 && <div>Aucun article.</div>}
                  {!loadingAdditional && additionalData.travelBlogs.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-start cursor-pointer hover:bg-gray-50 p-2 -ml-2 rounded transition-colors" onClick={() => window.location.href = `/article/${item.slug || item.id}`}>
                      <div className="relative min-w-[140px] w-[140px] h-[90px] rounded-lg overflow-hidden">
                        <img 
                          src={item.image_url || '/placeholder.svg'} 
                          alt={item.titre} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                          loading="lazy"
                        />
                        <span className="absolute top-2 left-2 px-3 py-1 rounded text-white text-xs font-bold bg-lime-600">{item.categorie || 'Voyage'}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center text-gray-500 text-sm mb-1">
                          <span className="mr-2">📅 {new Date(item.date_publication).toLocaleDateString()}</span>
                        </div>
                        <h3 className="font-bold text-lg font-jost mb-2 line-clamp-2">{item.titre}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Online Voting */}
              <div>
                <h2 className="text-2xl font-jost font-bold mb-4" style={{ borderBottom: '2px solid #ff184e', display: 'inline-block', paddingBottom: '4px' }}>{SECTION_TITLES.onlineVoting}</h2>
                <Poll />
              </div>
            </div>
          </div>
        </section>
        
        {/* Banner Image Section */}
        <div className="container mx-auto px-4 my-8">
          <Banner position="accueil-sous-votes" width={1200} height={120} />
        </div>
        
        {/* Category Sections */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Technology Section */}
              <div>
                <h2 className="section-title">{SECTION_TITLES.technology}</h2>
                <div className="space-y-6">
                  {loadingTech && <div>Chargement...</div>}
                  {errorTech && <div className="text-red-500">{errorTech}</div>}
                  {!loadingTech && !errorTech && technologyArticles.length === 0 && (
                    <div>Aucun article dans cette catégorie.</div>
                  )}
                  {!loadingTech && !errorTech && mappedTechArticles[0] && (
                    <ArticleCard {...mappedTechArticles[0]} />
                  )}
                  {!loadingTech && !errorTech && mappedTechArticles[1] && (
                    <SmallArticleCard {...mappedTechArticles[1]} />
                  )}
                </div>
              </div>
              
              {/* Business Section */}
              <div>
                <h2 className="section-title">{SECTION_TITLES.business}</h2>
                <div className="space-y-6">
                  {loadingBusiness && <div>Chargement...</div>}
                  {errorBusiness && <div className="text-red-500">{errorBusiness}</div>}
                  {!loadingBusiness && !errorBusiness && mappedBusinessArticles.length === 0 && (
                    <div>Aucun article dans cette catégorie.</div>
                  )}
                  {!loadingBusiness && !errorBusiness && mappedBusinessArticles.map((article, index) => (
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
              </div>
            </div>
          </div>
        </section>
        
        {/* More Categories */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Sports Section */}
              <div>
                <h2 className="section-title">{SECTION_TITLES.sport}</h2>
                {loadingSports && <div>Chargement...</div>}
                {errorSports && <div className="text-red-500">{errorSports}</div>}
                {!loadingSports && !errorSports && mappedSportsArticles[0] && (
                  <ArticleCard {...mappedSportsArticles[0]} />
                )}
                {!loadingSports && !errorSports && mappedSportsArticles.length === 0 && (
                  <div>Aucun article dans cette catégorie.</div>
                )}
              </div>
              
              {/* Entertainment Section */}
              <div>
                <h2 className="section-title">{SECTION_TITLES.entertainment}</h2>
                {loadingAdditional && <div>Chargement...</div>}
                {!loadingAdditional && mappedEntertainmentArts.length === 0 && <div>Aucun article.</div>}
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
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
