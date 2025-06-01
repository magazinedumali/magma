import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function MobileSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const getAuthorAvatar = (author: string, authorAvatar?: string) => {
    if (authorAvatar) return authorAvatar;
    return '/logo.png';
  };

  useEffect(() => {
    const fetchArticles = async () => {
      if (!query.trim()) {
        setArticles([]);
        return;
      }
      setLoading(true);
      // Search in title and content
      const { data, error } = await supabase
        .from('articles')
        .select('id, titre, slug, image_url, categorie, auteur, date_publication')
        .eq('statut', 'publie')
        .ilike('titre', `%${query}%`)
        .order('date_publication', { ascending: false })
        .limit(20);
      setArticles(data || []);
      setLoading(false);
    };
    const timeout = setTimeout(fetchArticles, 300); // debounce
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="min-h-screen bg-[#f9fafd] flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="flex items-center gap-2 px-4 pt-6 pb-4 bg-[#f9fafd]">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm mr-2">
          <ArrowLeft size={24} className="text-[#1a2746]" />
        </button>
        <input
          autoFocus
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher un article..."
          className="flex-1 px-4 py-2 rounded-full bg-white shadow text-base outline-none"
        />
      </header>
      <div className="flex-1 px-4 py-2 space-y-3">
        {loading && <div className="text-center text-gray-400 mt-10">Chargement...</div>}
        {query.trim() && !loading && articles.length === 0 && (
          <div className="text-center text-gray-400 mt-10">Aucun résultat</div>
        )}
        {articles.map(article => (
          <div key={article.id} className="flex bg-white rounded-2xl shadow-sm overflow-hidden h-28 transition-colors duration-300" onClick={() => navigate(`/mobile/article/${article.slug || article.id}`)}>
            <img src={article.image_url} alt={article.titre} className="w-28 h-full object-cover flex-shrink-0 rounded-l-2xl" />
            <div className="flex-1 flex flex-col justify-between p-4 min-w-0">
              <div>
                <h3 className="font-bold text-lg text-[#1a2746] leading-tight mb-2 truncate">{article.titre}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <img src={getAuthorAvatar(article.auteur)} alt={article.auteur} className="h-5 w-5 rounded-full" onError={e => { e.currentTarget.src = '/logo.png'; }} />
                  <span className="text-xs text-gray-500 font-medium">{article.auteur}</span>
                  <span className="bg-white border border-[#ff184e] text-[#ff184e] text-xs font-semibold px-3 py-0.5 rounded-full ml-2 transition-colors duration-300">{article.categorie}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#ff184e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    110.5K
                  </span>
                </div>
              </div>
              <div className="flex justify-end items-center mt-2">
                <button className="text-[#ff184e]">
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="#ff184e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 