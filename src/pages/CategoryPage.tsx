import React, { useEffect, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getArticlesByCategory, getTrendingArticles } from '@/data/articles';
import { Search, Facebook, Twitter, Instagram, Youtube, Globe } from 'lucide-react';
import Banner from '@/components/Banner';
import { supabase } from '@/lib/supabaseClient';

const socialLinks = [
  { name: 'Facebook', action: 'Follow', icon: Facebook },
  { name: 'Twitter', action: 'Follow', icon: Twitter },
  { name: 'Instagram', action: 'Follow', icon: Instagram },
  { name: 'Youtube', action: 'Subscribe', icon: Youtube },
  { name: 'Pinterest', action: 'Follow', icon: Globe },
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
  }, [category]);

  const mappedArticles = (articles || []).map((a: any) => ({
    id: a.id,
    slug: a.slug || a.id,
    title: a.titre ?? a.title ?? '',
    excerpt: a.meta_description ?? a.excerpt ?? '',
    image: a.image_url ?? a.image ?? '',
    category: a.categorie ?? a.category ?? '',
    date: a.date_publication ?? a.date ?? '',
    author: a.auteur ?? a.author ?? '',
    views: a.views ?? 0,
    comments_count: a.comments_count ?? 0,
  }));

  const trendingArticles = getTrendingArticles(4);
  const categoryTitle = category ? category.charAt(0).toUpperCase() + category.slice(1) : '';
  if (!loading && !error && mappedArticles.length === 0) return <Navigate to="/not-found" replace />;
  
  return (
    <>
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row gap-8">
            {/* Main Content */}
          <div className="w-full md:w-2/3">
            <nav className="text-sm text-gray-500 mb-2">
              <span>Accueil</span> &gt; <span>Blog</span> &gt; <span className="text-news-red font-bold">{categoryTitle}</span>
            </nav>
            <h1 className="text-3xl font-jost font-bold mb-6">{categoryTitle}</h1>
            <div className="space-y-10">
              {loading && <div>Chargement...</div>}
              {error && <div className="text-red-500">{error}</div>}
              {!loading && !error && mappedArticles.map((article, idx) => (
                <div key={article.id} className="flex flex-col gap-4">
                  {/* Title */}
                  <h2 className="font-bold text-2xl md:text-3xl font-jost mb-2 leading-snug">
                    <Link to={`/article/${article.slug}`}>{article.title}</Link>
                  </h2>
                  {/* Card with image */}
                  <Link to={`/article/${article.slug}`} className="bg-white rounded-2xl shadow p-0 overflow-hidden block">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-72 object-cover rounded-2xl"
                    />
                    <div className="flex justify-between items-center px-6 py-4">
                      <div>
                        <div className="text-gray-400 text-base">{article.author}</div>
                        <div className="text-gray-400 text-base">{article.date}</div>
                      </div>
                    </div>
                  </Link>
                  {/* Excerpt */}
                  <p className="text-gray-500 text-lg mt-2">{article.excerpt}</p>
                </div>
              ))}
            </div>
          </div>
            {/* Sidebar */}
          <aside className="w-full md:w-1/3">
            <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-8">
              {/* Search */}
              <div>
                <h3 className="font-bold text-lg mb-2">Recherche</h3>
                <div className="h-1 w-24 bg-[#ff184e] mb-4" />
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Rechercher..."
                    className="w-full px-4 py-3 bg-gray-50 rounded focus:outline-none focus:ring-2 focus:ring-news-red pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
                </div>
              </div>
              <div className="border-t border-gray-100" />
              {/* Social Links */}
              <div>
                <h3 className="font-bold text-lg mb-2">Restez connecté</h3>
                <div className="h-1 w-40 bg-[#ff184e] mb-4" />
                <div className="flex flex-col gap-4">
                  {socialLinks.map(link => {
                    const Icon = link.icon;
                    let actionFr = link.action;
                    if (actionFr === 'Follow') actionFr = 'Suivre';
                    if (actionFr === 'Subscribe') actionFr = "S'abonner";
                    return (
                      <div key={link.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 text-gray-700 bg-white">
                            <Icon size={22} />
                          </span>
                          <span className="font-medium text-base text-black">{link.name}</span>
                        </div>
                        <button className="px-6 py-1 rounded-full border border-gray-300 text-gray-500 font-semibold bg-white hover:bg-gray-100 transition-all">
                          {actionFr}
                  </button>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="border-t border-gray-100" />
              {/* Hot Topics */}
              <div>
                <h3 className="font-bold text-xl mb-2">Sujets populaires</h3>
                <div className="h-1 w-24 bg-[#ff184e] mb-6" />
                <div className="flex flex-col gap-6">
                  {trendingArticles.map((topic, idx) => (
                    <div key={topic.id} className="flex items-center gap-4">
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <img src={topic.image} alt={topic.title} className="w-20 h-20 object-cover rounded" />
                        <div className="absolute top-1 left-1 bg-[#ff184e] text-white font-bold rounded w-8 h-8 flex items-center justify-center text-sm shadow">
                          {String(idx+1).padStart(2, '0')}
                        </div>
                      </div>
                      <div className="flex-1 ml-2">
                        <div className="uppercase text-gray-400 text-xs font-semibold mb-1 tracking-wider">{topic.category}</div>
                        <div className="font-bold text-base text-black leading-snug">{topic.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-gray-100" />
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
