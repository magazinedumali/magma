import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useDashboardStats() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>({
    articles: 0,
    articlesByMonth: [],
    comments: 0,
    commentsByMonth: [],
    topArticles: [],
    topAuthors: [],
    mostActiveUsers: [],
    recentUsers: [],
  });

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        // Nombre total d'articles
        const { count: articlesCount } = await supabase.from('articles').select('*', { count: 'exact', head: true });
        // Articles par mois
        const { data: articlesByMonth } = await supabase.rpc('articles_by_month');
        // Nombre total de commentaires
        const { count: commentsCount } = await supabase.from('comments').select('*', { count: 'exact', head: true });
        // Commentaires par mois
        const { data: commentsByMonth } = await supabase.rpc('comments_by_month');
        // Top articles commentés
        const { data: topArticles } = await supabase.rpc('top_articles_comments');
        // Top auteurs
        const { data: topAuthors } = await supabase.rpc('top_authors_comments');
        // Utilisateurs les plus actifs
        const { data: mostActiveUsers } = await supabase.rpc('most_active_users');
        // Utilisateurs récents (optionnel, si tu veux l'afficher)
        let recentUsers = [];
        if (supabase.auth?.admin?.listUsers) {
          const { data: usersData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 5 });
          recentUsers = usersData?.users || [];
        }
        setStats({
          articles: articlesCount || 0,
          articlesByMonth: articlesByMonth || [],
          comments: commentsCount || 0,
          commentsByMonth: commentsByMonth || [],
          topArticles: topArticles || [],
          topAuthors: topAuthors || [],
          mostActiveUsers: mostActiveUsers || [],
          recentUsers,
        });
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des stats');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return { stats, loading, error };
} 