import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SmallArticleCard from '@/components/SmallArticleCard';
import { getArticleById, getRecentArticles } from '@/data/articles';
import { Clock } from 'lucide-react';
import AudioPlayer from '@/components/AudioPlayer';
import CommentForm from '@/components/CommentForm';
import Banner from '@/components/Banner';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabaseClient';
import { Helmet } from 'react-helmet';
import { mapArticleFromSupabase } from '@/lib/articleMapper';
import { getUserAvatar, getUserDisplayName, getCommentUserInfo } from '@/lib/userHelper';

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const recentArticles = getRecentArticles(5);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  
  // Central state for comments (most recent first)
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);

  // Fetch current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  // Add comment handler
  const handleAddComment = async (text: string) => {
    if (!article?.slug) return;
    
    // Get user information
    const currentUser = user || (await supabase.auth.getUser()).data.user;
    if (!currentUser) {
      // User not logged in - redirect to login
      navigate('/login');
      return;
    }
    
    const author = getUserDisplayName(currentUser);
    const avatar = getUserAvatar(currentUser);
    
    // Envoi dans Supabase
    await supabase.from('comments').insert({
      article_slug: article.slug,
      article_id: article.id,
      author,
      avatar,
      content: text,
      user_id: currentUser.id,
      created_at: new Date().toISOString(),
    });
    
    // Refresh comments
    fetchComments();
  };
  
  const fetchComments = async () => {
    if (!article?.slug) return;
    setCommentsLoading(true);
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('article_slug', article.slug)
      .order('created_at', { ascending: false });
    
    if (data) {
      // Map comments with real user info
      const mappedComments = data.map(comment => {
        const userInfo = getCommentUserInfo(comment);
        return {
          id: comment.id,
          avatar: userInfo.avatar,
          name: userInfo.name,
          time: comment.created_at ? new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          text: comment.content || '',
          created_at: comment.created_at,
          user_id: comment.user_id,
        };
      });
      setComments(mappedComments);
    }
    setCommentsLoading(false);
  };

  const [startIdx, setStartIdx] = useState(0);
  const visibleCount = 4;
  const commentHeight = 104; // px, augmenté pour que tout soit bien contenu

  useEffect(() => {
    console.log('slug from URL:', slug);
    const fetchArticle = async () => {
      setLoading(true);
      try {
        // First try to fetch by slug (exact match) - only published articles
        let { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('slug', slug)
          .eq('statut', 'publie')
          .maybeSingle(); // Use maybeSingle instead of single to avoid error when no results
        
        console.log('Supabase fetch by slug result:', { data, error, slug });
        
        // If exact slug match fails, try case-insensitive search - only published articles
        if (!data && slug) {
          console.log('Trying case-insensitive slug search...');
          const { data: caseInsensitiveData, error: caseInsensitiveError } = await supabase
            .from('articles')
            .select('*')
            .eq('statut', 'publie')
            .ilike('slug', slug)
            .maybeSingle();
          
          console.log('Case-insensitive slug search result:', { data: caseInsensitiveData, error: caseInsensitiveError });
          
          if (caseInsensitiveData) {
            data = caseInsensitiveData;
            error = null;
          }
        }
        
        // If slug fails and slug looks like an ID, try fetching by ID - only published articles
        if (!data && slug && slug.length === 36) { // UUID length
          console.log('Trying to fetch by ID as fallback...');
          const { data: idData, error: idError } = await supabase
            .from('articles')
            .select('*')
            .eq('statut', 'publie')
            .eq('id', slug)
            .maybeSingle();
          
          console.log('Supabase fetch by ID result:', { data: idData, error: idError });
          
          if (idData) {
            data = idData;
            error = null;
          }
        }
        
        // If still no match, try to find similar slugs for debugging
        if (!data && slug) {
          console.log('Searching for similar slugs...');
          const { data: similarSlugs, error: similarError } = await supabase
            .from('articles')
            .select('id, titre, slug, statut')
            .ilike('slug', `%${slug}%`)
            .limit(5);
          
          console.log('Similar slugs found:', similarSlugs);
          
          // Also try searching by title if slug contains meaningful words
          if (similarSlugs && similarSlugs.length === 0) {
            const words = slug.split('-').filter(w => w.length > 2);
            if (words.length > 0) {
              console.log('Searching by title keywords:', words);
              const { data: titleMatches, error: titleError } = await supabase
                .from('articles')
                .select('id, titre, slug, statut')
                .or(words.map(w => `titre.ilike.%${w}%`).join(','))
                .limit(5);
              
              console.log('Title matches found:', titleMatches);
            }
          }
        }
        
        if (error) {
          console.error('Error fetching article:', error);
          setArticle(null);
        } else if (data) {
          console.log('Article image_url:', data?.image_url);
          console.log('Article image field:', data?.image);
          console.log('Article content fields:', {
            contenu: data?.contenu,
            content: data?.content,
            contenuLength: data?.contenu?.length,
            contentLength: data?.content?.length
          });
          const mappedArticle = mapArticleFromSupabase(data);
          console.log('Mapped article:', {
            image: mappedArticle.image,
            content: mappedArticle.content,
            contentLength: mappedArticle.content?.length
          });
          setArticle(mappedArticle);
        } else {
          console.log('No article found with slug:', slug);
          setArticle(null);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchArticle();
  }, [slug]);

  useEffect(() => {
    if (comments.length <= visibleCount) return;
    const interval = setInterval(() => {
      setStartIdx((prev) => (prev + 1) % comments.length);
    }, 3000); // Slide every 3 seconds
    return () => clearInterval(interval);
  }, [comments.length]);

  // Fetch real comments from Supabase
  useEffect(() => {
    if (article?.slug) {
      fetchComments();
    }
  }, [article?.slug]);

  // Compute the visible comments (wrap around if needed)
  const visibleComments = [];
  for (let i = 0; i < Math.min(visibleCount, comments.length); i++) {
    visibleComments.push(comments[(startIdx + i) % comments.length]);
  }
  
  useEffect(() => {
    if (!article?.id) return;
    supabase.rpc('increment_article_views', { article_id: article.id });
  }, [article?.id]);

  if (loading) return <div className="py-12 text-center text-gray-400">Chargement...</div>;
  if (!article) return (
    <div className="py-12 text-center">
      <div className="text-red-500 text-xl mb-4">Article introuvable</div>
      <div className="text-gray-600 mb-4">L'article avec le slug "{slug}" n'a pas été trouvé.</div>
      <div className="text-sm text-gray-500">
        Vérifiez que l'URL est correcte ou que l'article existe dans la base de données.
      </div>
      <div className="mt-4">
        <Link to="/" className="text-blue-600 hover:underline">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
  
  const canonicalUrl = `https://www.lemagazinedumali.com/article/${article.slug}`;
  return (
    <>
      <Helmet>
        <title>{article.title || article.titre}</title>
        <meta property="og:type" content="article" />
        <meta property="og:title" content={article.title || article.titre} />
        <meta property="og:description" content={article.share_description || article.meta_description || article.excerpt || ''} />
        <meta property="og:image" content={article.share_image_url || article.image_url || article.image} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title || article.titre} />
        <meta name="twitter:description" content={article.share_description || article.meta_description || article.excerpt || ''} />
        <meta name="twitter:image" content={article.share_image_url || article.image_url || article.image} />
        <meta name="twitter:url" content={canonicalUrl} />
      </Helmet>
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <article>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  {article.title || article.titre}
                </h1>
                
                <div className="flex items-center text-news-gray mb-6">
                  <span className="mr-4">{article.author || article.auteur}</span>
                  <span className="flex items-center">
                    <Clock size={16} className="mr-1" />
                    {article.date ? new Date(article.date).toLocaleDateString() : (article.date_publication ? new Date(article.date_publication).toLocaleDateString() : '')}
                  </span>
                </div>
                
                <div className="mb-6">
                  <span className="article-category">
                    {article.category || article.categorie}
                  </span>
                </div>
                
                {(article.image || article.image_url) && (article.image !== '/placeholder.svg' && article.image_url !== '/placeholder.svg') && (
                  <img 
                    src={article.image || article.image_url} 
                    alt={article.title || article.titre} 
                    width="991"
                    height="564"
                    className="w-full h-auto object-cover mb-6 rounded"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                    loading="lazy"
                  />
                )}
                
                {article.audio_url && (
                  <div className="mb-6">
                    <AudioPlayer src={article.audio_url} />
                  </div>
                )}
                
                <div className="prose max-w-none">
                  {article.excerpt && (
                    <p className="text-lg leading-relaxed mb-4">
                      {article.excerpt}
                    </p>
                  )}
                  
                  {article.content ? (
                    <div dangerouslySetInnerHTML={{ __html: article.content }} />
                  ) : (
                    <div className="text-gray-500 italic text-center py-8">
                      <p>Le contenu de cet article n'est pas disponible.</p>
                      <p className="text-sm mt-2">Veuillez contacter l'administrateur si ce problème persiste.</p>
                    </div>
                  )}
                </div>
                
                {/* Bannière sous l'article, avant les commentaires */}
                <div className="my-8">
                  <Banner position="sous-article" width={1200} height={180} />
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-8" id="comment-form">
                  <CommentForm 
                    onAdd={handleAddComment} 
                    placeholder={t('Ajouter un commentaire…')} 
                    sendLabel={t('Envoyer')}
                    user={user}
                  />
                </div>
              </article>
              
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="inline-block text-[#ff184e]" width="28" height="28" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.198.297-.767.967-.94 1.166-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.52-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.099 3.205 5.077 4.372.71.306 1.263.489 1.695.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-13.37C6.067 1.012 1.012 6.067 1.012 12.001c0 5.934 5.055 10.989 10.989 10.989 5.934 0 10.989-5.055 10.989-10.989 0-5.934-5.055-10.989-10.989-10.989"/></svg>
                  {t('Partager cet article')}
                </h3>
                <div className="flex gap-5">
                  {/* Facebook */}
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-full bg-[#3b5998] shadow text-white hover:bg-[#2d4373] transition text-2xl">
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
                  </a>
                  {/* Twitter */}
                  <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-full bg-[#1da1f2] shadow text-white hover:bg-[#0d8ddb] transition text-2xl">
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.83 9.83 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.916 4.916 0 0 0-8.38 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.117 2.823 5.247a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.058 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z"/></svg>
                  </a>
                  {/* LinkedIn */}
                  <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-full bg-[#0077b5] shadow text-white hover:bg-[#005983] transition text-2xl">
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M22.23 0H1.77C.792 0 0 .771 0 1.723v20.549C0 23.229.792 24 1.77 24h20.459C23.208 24 24 23.229 24 22.271V1.723C24 .771 23.208 0 22.23 0zM7.12 20.452H3.56V9h3.56v11.452zM5.34 7.633a2.07 2.07 0 1 1 0-4.139 2.07 2.07 0 0 1 0 4.139zm15.112 12.819h-3.56v-5.604c0-1.336-.025-3.058-1.865-3.058-1.867 0-2.153 1.454-2.153 2.957v5.705h-3.56V9h3.419v1.561h.049c.477-.899 1.637-1.847 3.37-1.847 3.602 0 4.267 2.369 4.267 5.455v6.283z"/></svg>
                  </a>
                  {/* WhatsApp */}
                  <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(document.title + ' ' + window.location.href)}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-full bg-[#25D366] shadow text-white hover:bg-[#128C7E] transition text-2xl">
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.198.297-.767.967-.94 1.166-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.52-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.099 3.205 5.077 4.372.71.306 1.263.489 1.695.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-13.37C6.067 1.012 1.012 6.067 1.012 12.001c0 5.934 5.055 10.989 10.989 10.989 5.934 0 10.989-5.055 10.989-10.989 0-5.934-5.055-10.989-10.989-10.989"/></svg>
                  </a>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div>
              {/* Reviews Section */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-xl">{t('Avis')}</h3>
                  <button
                    className="text-gray-400 font-medium text-base hover:underline"
                    onClick={() => navigate(`/article/${article.slug}/comments`)}
                  >
                    {t('Voir tout')}
                  </button>
                </div>
                <div className="overflow-hidden" style={{ height: `${commentHeight * visibleCount}px` }}>
                  {commentsLoading ? (
                    <div className="text-center text-gray-400 py-10">Chargement…</div>
                  ) : comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-8">
                      <div className="text-gray-500 text-base mb-3">Soyez le premier à commenter cet article!</div>
                      <button
                        className="flex items-center gap-2 text-[#4f8cff] font-semibold hover:underline text-base"
                        onClick={() => {
                          const el = document.getElementById('comment-form');
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                      >
                        <span>Commenter</span>
                        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-right"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                      </button>
                    </div>
                  ) : (
                    <div
                      className="flex flex-col gap-3 transition-transform duration-700"
                      style={{ transform: `translateY(-${startIdx * commentHeight}px)` }}
                    >
                      {visibleComments.concat(visibleComments.length < visibleCount ? [] : visibleComments).map((review, idx) => {
                        const userInfo = getCommentUserInfo(review);
                        return (
                          <div
                            key={review.id || idx}
                            className="bg-white rounded-2xl shadow p-4 flex gap-4 items-start w-full max-w-full"
                          >
                            <img 
                              src={userInfo.avatar} 
                              alt={userInfo.name} 
                              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder.svg';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-base text-black">{userInfo.name}</div>
                              <div className="text-gray-400 text-sm mb-2">{review.time}</div>
                              <div className="text-gray-500 text-base leading-snug break-words max-w-full">{review.text}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="sticky top-8">
                {/* Ad Banner */}
                <div className="mb-8">
                  <Banner position="sidebar-article" width={300} height={250} />
                </div>
                <div className="bg-gray-50 p-6 mb-8">
                  <h3 className="text-xl font-bold mb-4">{t('Articles récents')}</h3>
                  <div className="space-y-4">
                    {recentArticles
                      .filter(recent => (recent.slug || recent.id) && (recent.slug || recent.id) !== (article.slug || article.id))
                      .slice(0, 4)
                      .map(recent => (
                        <SmallArticleCard
                          key={recent.slug || recent.id}
                          slug={recent.slug || recent.id}
                          title={recent.title}
                          image={recent.image}
                          date={recent.date}
                        />
                      ))
                    }
                  </div>
                </div>
                <div className="bg-gray-50 p-6">
                  <h3 className="text-xl font-bold mb-4">{t('S\'abonner')}</h3>
                  <p className="text-news-gray mb-4">
                    {t('Restez informé de nos dernières actualités et articles directement dans votre boîte mail.')}
                  </p>
                  <div className="space-y-3">
                    <input 
                      type="email" 
                      placeholder={t('Votre adresse e-mail')} 
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-news-red"
                    />
                    <button className="w-full bg-news-red hover:bg-red-700 text-white py-2 px-4 rounded font-medium">
                      {t('S\'abonner')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default ArticleDetail;
