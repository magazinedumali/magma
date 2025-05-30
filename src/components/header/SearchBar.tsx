import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

type SearchBarProps = {
  isSearchOpen: boolean;
};

const SearchBar = ({ isSearchOpen }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticles = async () => {
      if (!query.trim()) {
        setArticles([]);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .ilike('titre', `%${query}%`)
        .order('date_publication', { ascending: false })
        .limit(20);
      setArticles(data || []);
      setLoading(false);
    };
    const timeout = setTimeout(fetchArticles, 300); // debounce
    return () => clearTimeout(timeout);
  }, [query]);

  if (!isSearchOpen) return null;
  
  return (
    <div className="container mx-auto px-4 py-4 bg-white border-b">
      <div className="relative">
        <input 
          type="text" 
          placeholder="Search for news..." 
          className="w-full border rounded-full py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-[#ff184e]"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button className="absolute right-3 top-2 text-news-gray">
          <Search size={20} />
        </button>
      </div>
      <div className="bg-white mt-2 rounded shadow max-h-96 overflow-y-auto">
        {loading && <div className="text-center text-gray-400 py-4">Loading...</div>}
        {query.trim() && !loading && articles.length === 0 && (
          <div className="text-center text-gray-400 py-4">No results found</div>
        )}
        {articles.map(article => (
          <div
            key={article.id}
            className="p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50"
            onClick={() => navigate(`/article/${article.slug || article.id}`)}
          >
            <div className="font-bold text-base mb-1">{article.titre}</div>
            <div className="text-xs text-gray-500 flex gap-2">
              <span>{article.auteur}</span>
              <span className="bg-white border border-[#ff184e] text-[#ff184e] text-xs font-semibold px-2 py-0.5 rounded-full ml-2 transition-colors duration-300">{article.categorie}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
