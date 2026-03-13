import React, { useEffect, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getArticlesByCategory } from '@/data/articles';
import { Icon } from '@iconify/react';
import Banner from '@/components/Banner';
import { supabase } from '@/lib/supabaseClient';
import { mapArticlesFromSupabase } from '@/lib/articleMapper';
import { motion } from 'framer-motion';

const socialLinks = [
  { name: 'Facebook', action: 'Follow', icon: 'solar:facebook-bold-duotone' },
  { name: 'Twitter', action: 'Follow', icon: 'solar:twitter-bold-duotone' },
  { name: 'Instagram', action: 'Follow', icon: 'solar:instagram-bold-duotone' },
  { name: 'Youtube', action: 'Subscribe', icon: 'solar:videocamera-record-bold-duotone' },
  { name: 'Pinterest', action: 'Follow', icon: 'solar:globus-bold-duotone' },
];

// Example reviews data
const reviews = [
  {
    name: 'Rob Davis',
    time: '6:30pm',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    text: 'Near to the city and public transport, friendly staff, clean and calm rooms, good breakfast.Everything was well. I\'ll be back again!'
  },
  {
    name: 'Rob Davis',
    time: '6:30pm',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    text: 'It was a lovely hotel with excellent facilities and also very helpful stuff. We look forward to come back once again.'
  },
  {
    name: 'Rob Davis',
    time: '6:30pm',
    avatar: 'https://randomuser.me/api/portraits/men/54.jpg',
    text: 'Hotel is clean as well as rooms and restaurant. Although in the center, it is very silent Service is perfect. Breakfast is good with large variety. Hotel is very well accessible by tram from port. Railway- and busstation are close, not long way to walk.'
  },
  {
    name: 'Rob Davis',
    time: '6:30pm',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    text: 'Nice staff, near bus access, very big room and silently sleep. You can find cheap food in train station nearby hotel. We found very cheap items shop near this hotel too, they sell souvenir and more things.'
  },
];

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [trendingArticles, setTrendingArticles] = useState<any[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  useEffect(() => {
    if (!category) return;
    setLoading(true);
    setError(null);
    supabase
      .from('articles')
      .select('*')
      .eq('statut', 'publie')
      .ilike('categorie', `%${category}%`)
      .order('date_publication', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setError("Erreur lors du chargement des articles : " + error.message);
          setArticles([]);
        } else {
          setArticles(data || []);
        }
        setLoading(false);
      });
      
    setLoadingTrending(true);
    supabase
      .from('articles')
      .select('*')
      .eq('statut', 'publie')
      .order('date_publication', { ascending: false })
      .limit(4)
      .then(({ data }) => {
        setTrendingArticles(data ? mapArticlesFromSupabase(data) : []);
        setLoadingTrending(false);
      });
  }, [category]);

  const mappedArticles = mapArticlesFromSupabase(articles || []);

  const categoryTitle = category ? category.charAt(0).toUpperCase() + category.slice(1) : '';
  if (!loading && !error && mappedArticles.length === 0) return <Navigate to="/not-found" replace />;
  
  return (
    <>
      <Header />
      
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[#0B0F19]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#ff184e]/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]"></div>
      </div>
      
      <main className="py-8 bg-transparent text-gray-200 min-h-screen">
        <div className="container mx-auto px-4 flex flex-col md:flex-row gap-8">
            {/* Main Content */}
          <div className="w-full md:w-2/3">
            <nav className="text-sm text-gray-500 mb-2">
              <span>Accueil</span> &gt; <span>Blog</span> &gt; <span className="text-[#ff184e] font-bold">{categoryTitle}</span>
            </nav>
            <h1 className="text-3xl font-jost font-bold mb-6 text-white">{categoryTitle}</h1>
            <div className="space-y-10">
              {loading && <div>Chargement...</div>}
              {error && <div className="text-red-500">{error}</div>}
              {!loading && !error && mappedArticles.map((article, idx) => (
                <div key={article.id} className="flex flex-col gap-4">
                  {/* Title */}
                  <h2 className="font-bold text-2xl md:text-3xl font-jost mb-2 leading-snug text-white hover:text-[#ff184e] transition-colors">
                    <Link to={`/article/${article.slug}`}>{article.title}</Link>
                  </h2>
                  {/* Card with image */}
                  <Link to={`/article/${article.slug}`} className="glass-panel rounded-2xl p-0 overflow-hidden block shadow-xl border border-white/10 relative group">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10 pointer-events-none"></div>
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-72 object-cover rounded-t-2xl transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                      loading="lazy"
                    />
                    <div className="flex justify-between items-center px-6 py-4 bg-white/5 relative z-10">
                      <div>
                        <div className="text-gray-300 font-medium text-sm mb-1">{article.author}</div>
                        <div className="text-gray-500 text-xs">{article.date}</div>
                      </div>
                    </div>
                  </Link>
                  {/* Excerpt */}
                  <p className="text-gray-400 text-lg mt-2 mb-8">{article.excerpt}</p>
                </div>
              ))}
            </div>
          </div>
            {/* Sidebar */}
          <aside className="w-full md:w-1/3">
            <div className="glass-panel border-white/10 rounded-2xl shadow-xl p-6 flex flex-col gap-8">
              {/* Search */}
              <div>
                <h3 className="font-bold text-lg mb-2 text-white">Recherche</h3>
                <div className="h-1 w-24 bg-[#ff184e] mb-4" />
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Rechercher..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff184e] pr-10 placeholder-gray-500 font-jost"
                  />
                  <Icon icon="solar:magnifer-bold-duotone" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-2xl" />
                </div>
              </div>
              <div className="border-t border-white/10" />
              {/* Social Links */}
              <div>
                <h3 className="font-bold text-lg mb-2 text-white">Restez connecté</h3>
                <div className="h-1 w-40 bg-[#ff184e] mb-4" />
                <div className="flex flex-col gap-4">
                  {socialLinks.map(link => {
                    let actionFr = link.action;
                    if (actionFr === 'Follow') actionFr = 'Suivre';
                    if (actionFr === 'Subscribe') actionFr = "S'abonner";
                    return (
                      <div key={link.name} className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-all">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-10 h-10 rounded-xl border border-white/10 text-[#ff184e] bg-[#ff184e]/10 group-hover:bg-[#ff184e] group-hover:text-white transition-all shadow-[0_0_10px_rgba(255,24,78,0.2)]">
                            <Icon icon={link.icon} className="text-xl" />
                          </span>
                          <span className="font-bold text-sm text-gray-200 font-jost">{link.name}</span>
                        </div>
                        <button className="px-4 py-1.5 text-xs rounded-lg border border-white/10 text-gray-400 font-bold hover:bg-white/10 hover:text-white transition-all uppercase tracking-wider">
                          {actionFr}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="border-t border-white/10" />
              {/* Hot Topics */}
              <div>
                <h3 className="font-bold text-xl mb-2 text-white">Sujets populaires</h3>
                <div className="h-1 w-24 bg-[#ff184e] mb-6" />
                <div className="flex flex-col gap-6">
                  {loadingTrending && <div>Chargement...</div>}
                  {!loadingTrending && trendingArticles.map((topic, idx) => (
                    <div key={topic.id} className="flex items-center gap-4 group cursor-pointer" onClick={() => window.location.href = `/article/${topic.slug || topic.id}`}>
                      <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded shadow-lg">
                        <img src={topic.image} alt={topic.title} className="w-20 h-20 object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute top-0 left-0 bg-[#ff184e] text-white font-bold rounded-br w-7 h-7 flex items-center justify-center text-xs shadow">
                          {String(idx+1).padStart(2, '0')}
                        </div>
                      </div>
                      <div className="flex-1 ml-2">
                        <div className="uppercase text-[#ff184e] text-[10px] font-bold mb-1 tracking-wider">{topic.category}</div>
                        <div className="font-bold text-sm text-gray-200 leading-snug group-hover:text-[#ff184e] transition-colors line-clamp-2">{topic.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-white/10" />
              {/* Ad Banner */}
              <div>
                <Banner position="sidebar-categorie" width={300} height={250} />
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CategoryPage;
