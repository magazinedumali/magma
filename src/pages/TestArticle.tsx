import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { mapArticleFromSupabase } from '@/lib/articleMapper';

const TestArticle = () => {
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allArticles, setAllArticles] = useState<any[]>([]);

  const articleId = '44f08f2c-59e0-487c-b5a0-1e3f0ec60145';

  useEffect(() => {
    const testArticle = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('Testing article ID:', articleId);

        // Test 1: Fetch by ID
        const { data: byId, error: idError } = await supabase
          .from('articles')
          .select('*')
          .eq('id', articleId)
          .single();

        console.log('Fetch by ID result:', { data: byId, error: idError });

        if (idError) {
          setError(`Error fetching by ID: ${idError.message}`);
        } else if (byId) {
          setArticle(byId);
          console.log('Article found:', byId);
          console.log('Article slug:', byId.slug);
          console.log('Article title:', byId.titre);
        } else {
          setError('Article not found by ID');
        }

        // Test 2: Get sample articles
        const { data: sampleArticles, error: sampleError } = await supabase
          .from('articles')
          .select('id, titre, slug, statut, created_at')
          .order('created_at', { ascending: false })
          .limit(10);

        if (!sampleError && sampleArticles) {
          setAllArticles(sampleArticles);
        }

      } catch (err) {
        console.error('Unexpected error:', err);
        setError(`Unexpected error: ${err}`);
      } finally {
        setLoading(false);
      }
    };

    testArticle();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Testing Article</h1>
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Article Test Results</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Testing Article ID: {articleId}</h2>
          
          {error ? (
            <div className="text-red-600 mb-4">
              <strong>Error:</strong> {error}
            </div>
          ) : article ? (
            <div className="space-y-4">
              <div className="text-green-600 font-semibold">✅ Article Found!</div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong>ID:</strong> {article.id}
                </div>
                <div>
                  <strong>Title:</strong> {article.titre || 'No title'}
                </div>
                <div>
                  <strong>Slug:</strong> {article.slug || 'No slug'}
                </div>
                <div>
                  <strong>Status:</strong> {article.statut || 'No status'}
                </div>
                <div>
                  <strong>Author:</strong> {article.auteur || 'No author'}
                </div>
                <div>
                  <strong>Category:</strong> {article.categorie || 'No category'}
                </div>
                <div>
                  <strong>Created:</strong> {article.created_at ? new Date(article.created_at).toLocaleString() : 'No date'}
                </div>
                <div>
                  <strong>Published:</strong> {article.date_publication ? new Date(article.date_publication).toLocaleString() : 'No date'}
                </div>
                <div>
                  <strong>Content Length:</strong> {article.contenu?.length || article.content?.length || 0} characters
                </div>
                <div>
                  <strong>Has Content:</strong> {article.contenu || article.content ? 'Yes' : 'No'}
                </div>
              </div>

              {article.slug && (
                <div className="mt-4 p-4 bg-blue-50 rounded">
                  <h3 className="font-semibold mb-2">Article URLs:</h3>
                  <div className="space-y-2">
                    <div>
                      <strong>Web URL:</strong>{' '}
                      <a 
                        href={`/article/${article.slug}`} 
                        className="text-blue-600 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        /article/{article.slug}
                      </a>
                    </div>
                    <div>
                      <strong>Mobile URL:</strong>{' '}
                      <a 
                        href={`/mobile/article/${article.slug}`} 
                        className="text-blue-600 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        /mobile/article/{article.slug}
                      </a>
                    </div>
                    <div>
                      <strong>Direct ID URL:</strong>{' '}
                      <a 
                        href={`/article/${article.id}`} 
                        className="text-blue-600 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        /article/{article.id}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <h3 className="font-semibold mb-2">Content Preview:</h3>
                <div className="bg-gray-100 p-4 rounded text-sm max-h-48 overflow-auto">
                  {article.contenu || article.content ? (
                    <div dangerouslySetInnerHTML={{ __html: (article.contenu || article.content).substring(0, 500) + '...' }} />
                  ) : (
                    <div className="text-gray-500 italic">No content available</div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold mb-2">Raw Article Data:</h3>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                  {JSON.stringify(article, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-red-600">❌ Article not found</div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Sample Articles in Database</h2>
          {allArticles.length > 0 ? (
            <div className="space-y-2">
              {allArticles.map((art) => (
                <div key={art.id} className="border-b pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong>{art.titre || 'No title'}</strong>
                      <div className="text-sm text-gray-600">
                        ID: {art.id} | Slug: {art.slug || 'No slug'} | Status: {art.statut || 'No status'}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {art.created_at ? new Date(art.created_at).toLocaleDateString() : 'No date'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-600">No articles found in database</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestArticle;
