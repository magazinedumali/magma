import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SmallArticleCard from '@/components/SmallArticleCard';

import { Icon } from '@iconify/react';
import AudioPlayer from '@/components/AudioPlayer';
import CommentForm from '@/components/CommentForm';
import Banner from '@/components/Banner';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabaseClient';
import { Helmet } from 'react-helmet';
import { mapArticleFromSupabase } from '@/lib/articleMapper';
import { getUserAvatar, getUserDisplayName, getCommentUserInfo } from '@/lib/userHelper';
import { motion } from 'framer-motion';
import { stripHtml, decodeHtml } from '@/lib/htmlUtils';

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  
  // Central state for comments (most recent first)
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);

  // Recent articles state
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  // Fetch recent articles from Supabase
  useEffect(() => {
    const fetchRecentArticles = async () => {
      setLoadingRecent(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('statut', 'publie')
        .order('date_publication', { ascending: false })
        .limit(6);
      
      if (data) {
        setRecentArticles(data.map(mapArticleFromSupabase));
      }
      setLoadingRecent(false);
    };
    fetchRecentArticles();
  }, []);

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
      
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[#0B0F19]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#ff184e]/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]"></div>
      </div>
      
      <main className="py-8 bg-transparent text-gray-200 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <article>
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white font-jost">
                  {article.title || article.titre}
                </h1>
                
                <div className="flex items-center text-gray-400 mb-6 text-sm font-medium">
                  <span className="mr-4 text-white">{article.author || article.auteur}</span>
                  <span className="flex items-center text-[#ff184e]">
                    <Icon icon="solar:clock-circle-bold-duotone" className="mr-1.5 text-lg" />
                    <span className="text-gray-400">{article.date ? new Date(article.date).toLocaleDateString() : (article.date_publication ? new Date(article.date_publication).toLocaleDateString() : '')}</span>
                  </span>
                </div>
                
                <div className="mb-6 mb-8 inline-block bg-[#ff184e]/20 border border-[#ff184e]/50 text-[#ff184e] px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase shadow-[0_0_15px_rgba(255,24,78,0.2)]">
                  {article.category || article.categorie}
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
                
                <div className="article-body prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-white prose-a:text-[#ff184e] hover:prose-a:text-[#ff184e]/80">
                  {article.excerpt && (
                    <p className="text-lg leading-relaxed mb-6 font-medium text-gray-200 border-l-4 border-[#ff184e] pl-4 italic bg-white/5 py-4 rounded-r-lg font-jost">
                      {stripHtml(article.excerpt)}
                    </p>
                  )}
                  
                  {article.content ? (
                    <div dangerouslySetInnerHTML={{ __html: decodeHtml(article.content) }} className="font-jost" />
                  ) : (
                    <div className="text-gray-500 italic text-center py-8 glass-panel rounded-xl font-jost">
                      <p>Le contenu de cet article n'est pas disponible.</p>
                      <p className="text-sm mt-2">Veuillez contacter l'administrateur si ce problème persiste.</p>
                    </div>
                  )}
                </div>
                
                {/* Bannière sous l'article, avant les commentaires */}
                <div className="my-8 glass-panel rounded-xl p-1 shadow-2xl overflow-hidden">
                  <Banner position="sous-article" width={1200} height={180} />
                </div>
                <div className="glass-panel rounded-2xl shadow-xl p-8 border border-white/10" id="comment-form">
                  <CommentForm 
                    onAdd={handleAddComment} 
                    placeholder={t('Ajouter un commentaire…')} 
                    sendLabel={t('Envoyer')}
                    user={user}
                  />
                </div>
              </article>
              
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white font-jost uppercase tracking-tighter">
                  <Icon icon="solar:share-bold-duotone" className="text-[#ff184e] text-3xl" />
                  {t('Partager cet article')}
                </h3>
                <div className="flex gap-5">
                  {/* Facebook */}
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow text-white hover:bg-[#ff184e] hover:border-[#ff184e] transition-all text-2xl group">
                    <Icon icon="solar:facebook-bold-duotone" className="group-hover:scale-110 transition-transform" />
                  </a>
                  {/* Twitter */}
                  <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow text-white hover:bg-[#ff184e] hover:border-[#ff184e] transition-all text-2xl group">
                    <Icon icon="solar:twitter-bold-duotone" className="group-hover:scale-110 transition-transform" />
                  </a>
                  {/* LinkedIn */}
                  <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow text-white hover:bg-[#ff184e] hover:border-[#ff184e] transition-all text-2xl group">
                    <Icon icon="solar:linkedin-bold-duotone" className="group-hover:scale-110 transition-transform" />
                  </a>
                  {/* WhatsApp */}
                  <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(document.title + ' ' + window.location.href)}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow text-white hover:bg-[#ff184e] hover:border-[#ff184e] transition-all text-2xl group">
                    <Icon icon="solar:whatsapp-bold-duotone" className="group-hover:scale-110 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div>
              {/* Reviews Section */}
              <div className="glass-panel rounded-2xl shadow-xl p-6 mb-8 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-xl text-white font-jost border-b border-[#ff184e] pb-1 inline-block">{t('Avis')}</h3>
                  <button
                    className="text-gray-400 font-medium text-xs uppercase tracking-wider hover:text-white transition-colors"
                    onClick={() => navigate(`/article/${article.slug}/comments`)}
                  >
                    {t('Voir tout')}
                  </button>
                </div>
                <div className="overflow-hidden" style={{ height: `${commentHeight * visibleCount}px` }}>
                  {commentsLoading ? (
                    <div className="text-center text-gray-400 py-10 animate-pulse">Chargement…</div>
                  ) : comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-8 border border-dashed border-white/20 rounded-xl bg-white/5">
                      <div className="text-gray-400 text-sm mb-4 font-medium">Soyez le premier à commenter cet article!</div>
                      <button
                        className="flex items-center gap-2 text-white bg-[#ff184e] hover:bg-[#ff184e]/80 transition-colors px-4 py-2 rounded-lg font-bold text-sm shadow-[0_0_15px_rgba(255,24,78,0.4)]"
                        onClick={() => {
                          const el = document.getElementById('comment-form');
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                      >
                        <span>Commenter</span>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
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
                            className="bg-white/5 border border-white/10 rounded-xl shadow p-4 flex gap-4 items-start w-full max-w-full hover:bg-white/10 transition-colors"
                          >
                            <img 
                              src={userInfo.avatar} 
                              alt={userInfo.name} 
                              className="w-10 h-10 rounded-full object-cover border border-white/20"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder.svg';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-sm text-gray-200">{userInfo.name}</div>
                              <div className="text-[#ff184e] font-medium text-[10px] tracking-wider mb-1.5 uppercase">{review.time}</div>
                              <div className="text-gray-400 text-sm leading-snug break-words max-w-full line-clamp-2">{review.text}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="sticky top-24">
                {/* Ad Banner */}
                <div className="mb-8 glass-panel rounded-xl p-1 overflow-hidden shadow-2xl flex justify-center">
                  <Banner position="sidebar-article" width={300} height={250} />
                </div>
                <div className="glass-panel border border-white/10 rounded-2xl shadow-xl p-6 mb-8">
                  <h3 className="text-xl font-bold mb-6 font-jost text-white border-b border-[#ff184e] pb-1 inline-block">{t('Articles récents')}</h3>
                  <div className="space-y-4">
                    {loadingRecent ? (
                      <div className="text-gray-400 animate-pulse">Chargement...</div>
                    ) : (
                      recentArticles
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
                    )}
                  </div>
                </div>
                <div className="glass-panel border border-white/10 rounded-2xl shadow-xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff184e]/10 rounded-full blur-[40px] pointer-events-none"></div>
                  <h3 className="text-xl font-bold mb-4 font-jost text-white border-b border-[#ff184e] pb-1 inline-block">{t('S\'abonner')}</h3>
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    {t('Restez informé de nos dernières actualités et articles directement dans votre boîte mail.')}
                  </p>
                  <div className="space-y-3 relative z-10">
                    <input 
                      type="email" 
                      placeholder={t('Votre adresse e-mail')} 
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff184e] focus:border-[#ff184e] placeholder-gray-500 text-sm"
                    />
                    <button className="w-full bg-[#ff184e] hover:bg-[#ff184e]/80 transition-colors text-white py-3 px-4 rounded-lg font-bold shadow-[0_0_15px_rgba(255,24,78,0.4)]">
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
