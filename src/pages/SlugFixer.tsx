import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Simple slugify function
const slugify = (text: string) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
};

const SlugFixer = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fixing, setFixing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('federation-founou-founou');

  const loadArticles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('articles')
      .select('id, titre, slug, statut, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data) {
      setArticles(data);
    }
    setLoading(false);
  };

  const fixSlug = async (article: any) => {
    if (!article.titre) return;
    
    setFixing(article.id);
    const newSlug = slugify(article.titre);
    
    try {
      const { error } = await supabase
        .from('articles')
        .update({ slug: newSlug })
        .eq('id', article.id);
      
      if (error) {
        console.error('Error updating slug:', error);
        alert('Erreur lors de la mise à jour: ' + error.message);
      } else {
        console.log('Slug updated successfully:', newSlug);
        alert(`Slug mis à jour: ${newSlug}`);
        loadArticles(); // Reload the list
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('Erreur inattendue: ' + err);
    } finally {
      setFixing(null);
    }
  };

  const searchArticles = () => {
    if (!searchTerm) return loadArticles();
    
    const filtered = articles.filter(article => 
      article.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.slug?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setArticles(filtered);
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const articlesWithoutSlug = articles.filter(a => !a.slug || a.slug.trim() === '');
  const articlesWithSimilarSlug = articles.filter(a => 
    a.slug && a.slug.toLowerCase().includes('federation')
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔧 Slug Fixer</h1>
        
        {/* Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Rechercher des articles</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Rechercher par titre ou slug..."
            />
            <button
              onClick={searchArticles}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Rechercher
            </button>
            <button
              onClick={loadArticles}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Tout recharger
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Articles sans slug</h3>
            <div className="text-3xl font-bold text-red-600">{articlesWithoutSlug.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Articles "federation"</h3>
            <div className="text-3xl font-bold text-blue-600">{articlesWithSimilarSlug.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Total articles</h3>
            <div className="text-3xl font-bold text-green-600">{articles.length}</div>
          </div>
        </div>

        {/* Articles without slug */}
        {articlesWithoutSlug.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-red-600">
              ⚠️ Articles sans slug ({articlesWithoutSlug.length})
            </h2>
            <div className="space-y-3">
              {articlesWithoutSlug.map((article) => (
                <div key={article.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{article.titre}</h3>
                      <div className="text-sm text-gray-600">
                        ID: {article.id} | Statut: {article.statut}
                      </div>
                      <div className="text-sm text-gray-500">
                        Créé: {article.created_at ? new Date(article.created_at).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                    <button
                      onClick={() => fixSlug(article)}
                      disabled={fixing === article.id}
                      className="ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {fixing === article.id ? 'Création...' : 'Créer slug'}
                    </button>
                  </div>
                  {article.titre && (
                    <div className="mt-2 text-sm text-gray-500">
                      Slug suggéré: <code className="bg-gray-100 px-1 rounded">{slugify(article.titre)}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Articles with similar slug */}
        {articlesWithSimilarSlug.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">
              🔍 Articles contenant "federation" ({articlesWithSimilarSlug.length})
            </h2>
            <div className="space-y-3">
              {articlesWithSimilarSlug.map((article) => (
                <div key={article.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{article.titre}</h3>
                      <div className="text-sm text-gray-600">
                        Slug: <code className="bg-gray-100 px-1 rounded">{article.slug}</code>
                      </div>
                      <div className="text-sm text-gray-600">
                        ID: {article.id} | Statut: {article.statut}
                      </div>
                    </div>
                    <div className="ml-4 space-x-2">
                      <a
                        href={`/article/${article.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Voir
                      </a>
                      {article.slug !== slugify(article.titre) && (
                        <button
                          onClick={() => fixSlug(article)}
                          disabled={fixing === article.id}
                          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
                        >
                          {fixing === article.id ? 'Mise à jour...' : 'Corriger'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All articles */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Tous les articles</h2>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {articles.map((article) => (
                <div key={article.id} className="border-b pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-semibold">{article.titre}</div>
                      <div className="text-sm text-gray-600">
                        Slug: <code className="bg-gray-100 px-1 rounded">{article.slug || 'AUCUN'}</code> | 
                        Statut: {article.statut}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {article.created_at ? new Date(article.created_at).toLocaleDateString() : 'No date'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SlugFixer;
