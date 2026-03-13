import React from "react";
import { Link } from 'react-router-dom';
import StatsCards from './StatsCards';
import DashboardAreaChart from './DashboardAreaChart';
import ArticlesByCategoryPie from './ArticlesByCategoryPie';
import ModernTable from './ModernTable';
import LocationUsersStatusBar from './LocationUsersStatusBar';
import RecentUsersWidget from './RecentUsersWidget';
import { useDashboardStats } from './useDashboardStats';
import { useRecentArticles } from './useRecentArticles';
import { useUsersByLocation } from './useUsersByLocation';
import { Skeleton } from '@/components/ui/skeleton';
import "./dashboard.css";

const DashboardWidgets = () => {
  const { stats, loading, error } = useDashboardStats();
  const { articles, loading: loadingArticles } = useRecentArticles(5);
  const { locations, total, loading: loadingLocations } = useUsersByLocation();

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
  
  if (error) return (
    <div className="dark-card" style={{ background: 'rgba(255,24,78,0.1)', borderColor: 'rgba(255,24,78,0.3)' }}>
      <div style={{ color: '#ff184e' }}>Erreur : {error}</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 8 }}>
        <Link 
          to="/admin/categories" 
          style={{
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            padding: '10px 20px',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 500,
            fontSize: '0.875rem',
            textDecoration: 'none',
            border: '1px solid var(--border)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
        >
          Gérer les catégories
        </Link>
        <Link 
          to="/admin/menu" 
          style={{
            background: 'var(--accent)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 600,
            fontSize: '0.875rem',
            textDecoration: 'none',
            boxShadow: '0 4px 12px var(--accent-glow)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.filter = 'brightness(1.1)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.filter = 'brightness(1)';
            e.currentTarget.style.transform = 'none';
          }}
        >
          Gérer le menu principal
        </Link>
      </div>

      {/* Row 1 : Stats */}
      <StatsCards />

      {/* Row 2 : Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '60% 1fr', gap: 24 }}>
        <DashboardAreaChart data={stats.articlesByMonth} title="Évolution des articles publiés" />
        <ArticlesByCategoryPie />
      </div>

      {/* Row 3 : Lists & Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: '35% 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {loadingLocations ? (
            <div className="dark-card p-6 space-y-3" style={{ height: 180 }}>
              <Skeleton className="h-4 w-3/4" />
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-6 w-full rounded-full" />
              ))}
            </div>
          ) : (
            <LocationUsersStatusBar locations={locations} total={total} />
          )}
          <RecentUsersWidget />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {loadingArticles ? (
            <div className="dark-card p-4 space-y-3" style={{ flex: 1 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded shrink-0" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <ModernTable rows={articles} />
          )}
        </div>
      </div>
      
    </div>
  );
};

export default DashboardWidgets;