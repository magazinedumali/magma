import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const SlugDebugger = () => {
  const [searchSlug, setSearchSlug] = useState('federation-founou-founou');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [allSlugs, setAllSlugs] = useState<any[]>([]);

  const debugSlug = async (slug: string) => {
    setLoading(true);
    setResults(null);

    try {
      console.log('=== DEBUGGING SLUG:', slug, '===');

      // 1. Recherche exacte
      const { data: exactMatch, error: exactError } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      console.log('1. Exact match:', { data: exactMatch, error: exactError });

      // 2. Recherche insensible à la casse
      const { data: caseInsensitive, error: caseError } = await supabase
        .from('articles')
        .select('*')
        .ilike('slug', slug)
        .maybeSingle();

      console.log('2. Case insensitive:', { data: caseInsensitive, error: caseError });

      // 3. Recherche partielle
      const { data: partialMatch, error: partialError } = await supabase
        .from('articles')
        .select('id, titre, slug, statut')
        .ilike('slug', `%${slug}%`)
        .limit(10);

      console.log('3. Partial match:', { data: partialMatch, error: partialError });

      // 4. Recherche par mots-clés
      const keywords = slug.split('-');
      const { data: keywordMatch, error: keywordError } = await supabase
        .from('articles')
        .select('id, titre, slug, statut')
        .or(keywords.map(k => `slug.ilike.%${k}%`).join(','))
        .limit(10);

      console.log('4. Keyword match:', { data: keywordMatch, error: keywordError });

      // 5. Tous les slugs similaires
      const { data: allSimilar, error: allSimilarError } = await supabase
        .from('articles')
        .select('id, titre, slug, statut')
        .ilike('slug', '%federation%')
        .limit(20);

      console.log('5. All federation slugs:', { data: allSimilar, error: allSimilarError });

      setResults({
        exactMatch: { data: exactMatch, error: exactError },
        caseInsensitive: { data: caseInsensitive, error: caseError },
        partialMatch: { data: partialMatch, error: partialError },
        keywordMatch: { data: keywordMatch, error: keywordError },
        allSimilar: { data: allSimilar, error: allSimilarError }
      });

    } catch (err) {
      console.error('Debug error:', err);
      setResults({ error: err });
    } finally {
      setLoading(false);
    }
  };

  const loadAllSlugs = async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('id, titre, slug, statut, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setAllSlugs(data);
    }
  };

  useEffect(() => {
    loadAllSlugs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔍 Slug Debugger</h1>
        
        {/* Search Input */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Rechercher un slug</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={searchSlug}
              onChange={(e) => setSearchSlug(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Entrez un slug à rechercher..."
            />
            <button
              onClick={() => debugSlug(searchSlug)}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Recherche...' : 'Rechercher'}
            </button>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Exact Match */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                1. Correspondance exacte
                {results.exactMatch?.data ? (
                  <span className="ml-2 text-green-600">✅ Trouvé</span>
                ) : (
                  <span className="ml-2 text-red-600">❌ Non trouvé</span>
                )}
              </h3>
              {results.exactMatch?.data ? (
                <div className="bg-green-50 p-4 rounded">
                  <pre className="text-sm">{JSON.stringify(results.exactMatch.data, null, 2)}</pre>
                </div>
              ) : (
                <div className="text-red-600">
                  Erreur: {results.exactMatch?.error?.message || 'Aucun résultat'}
                </div>
              )}
            </div>

            {/* Case Insensitive */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                2. Recherche insensible à la casse
                {results.caseInsensitive?.data ? (
                  <span className="ml-2 text-green-600">✅ Trouvé</span>
                ) : (
                  <span className="ml-2 text-red-600">❌ Non trouvé</span>
                )}
              </h3>
              {results.caseInsensitive?.data ? (
                <div className="bg-green-50 p-4 rounded">
                  <pre className="text-sm">{JSON.stringify(results.caseInsensitive.data, null, 2)}</pre>
                </div>
              ) : (
                <div className="text-red-600">
                  Erreur: {results.caseInsensitive?.error?.message || 'Aucun résultat'}
                </div>
              )}
            </div>

            {/* Partial Match */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                3. Correspondance partielle
                {results.partialMatch?.data?.length > 0 ? (
                  <span className="ml-2 text-green-600">✅ {results.partialMatch.data.length} trouvé(s)</span>
                ) : (
                  <span className="ml-2 text-red-600">❌ Non trouvé</span>
                )}
              </h3>
              {results.partialMatch?.data?.length > 0 ? (
                <div className="space-y-2">
                  {results.partialMatch.data.map((article: any) => (
                    <div key={article.id} className="bg-blue-50 p-3 rounded">
                      <div className="font-semibold">{article.titre}</div>
                      <div className="text-sm text-gray-600">
                        Slug: <code>{article.slug}</code> | Statut: {article.statut}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-red-600">Aucun résultat</div>
              )}
            </div>

            {/* Keyword Match */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                4. Correspondance par mots-clés
                {results.keywordMatch?.data?.length > 0 ? (
                  <span className="ml-2 text-green-600">✅ {results.keywordMatch.data.length} trouvé(s)</span>
                ) : (
                  <span className="ml-2 text-red-600">❌ Non trouvé</span>
                )}
              </h3>
              {results.keywordMatch?.data?.length > 0 ? (
                <div className="space-y-2">
                  {results.keywordMatch.data.map((article: any) => (
                    <div key={article.id} className="bg-yellow-50 p-3 rounded">
                      <div className="font-semibold">{article.titre}</div>
                      <div className="text-sm text-gray-600">
                        Slug: <code>{article.slug}</code> | Statut: {article.statut}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-red-600">Aucun résultat</div>
              )}
            </div>

            {/* All Similar */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                5. Tous les slugs contenant "federation"
                {results.allSimilar?.data?.length > 0 ? (
                  <span className="ml-2 text-green-600">✅ {results.allSimilar.data.length} trouvé(s)</span>
                ) : (
                  <span className="ml-2 text-red-600">❌ Non trouvé</span>
                )}
              </h3>
              {results.allSimilar?.data?.length > 0 ? (
                <div className="space-y-2">
                  {results.allSimilar.data.map((article: any) => (
                    <div key={article.id} className="bg-purple-50 p-3 rounded">
                      <div className="font-semibold">{article.titre}</div>
                      <div className="text-sm text-gray-600">
                        Slug: <code>{article.slug}</code> | Statut: {article.statut}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-red-600">Aucun résultat</div>
              )}
            </div>
          </div>
        )}

        {/* All Slugs */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Tous les slugs récents</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {allSlugs.map((article) => (
              <div key={article.id} className="border-b pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{article.titre}</div>
                    <div className="text-sm text-gray-600">
                      Slug: <code className="bg-gray-100 px-1 rounded">{article.slug}</code> | 
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
        </div>
      </div>
    </div>
  );
};

export default SlugDebugger;
