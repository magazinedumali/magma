import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import { useDashboardStats } from './useDashboardStats';
import "./dashboard.css";
import StatsCards from './StatsCards';
import DashboardAreaChart from './DashboardAreaChart';
import StatusBar from './StatusBar';
import ModernTable from './ModernTable';
import { useRecentArticles } from './useRecentArticles';
import LocationUsersStatusBar from './LocationUsersStatusBar';
import { useUsersByLocation } from './useUsersByLocation';
import ArticlesByCategoryPie from './ArticlesByCategoryPie';
import RecentUsersWidget from './RecentUsersWidget';

const COLORS = ['#4f8cff', '#ff184e', '#ffc107', '#22c55e', '#a855f7', '#f59e42'];

const DashboardWidgets = () => {
  const { stats, loading, error } = useDashboardStats();
  const { articles, loading: loadingArticles } = useRecentArticles(5);
  const { locations, total, loading: loadingLocations } = useUsersByLocation();

  if (loading) return <div className="dashboard-widgets"><div className="widget">Chargement des statistiques…</div></div>;
  if (error) return <div className="dashboard-widgets"><div className="widget alert">Erreur : {error}</div></div>;

  return (
    <div className="flex flex-col gap-8">
      {/* Section 1 : Stats + Localisation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCards />
        {loadingLocations ? (
          <div className="dashboard-widgets"><div className="widget">Chargement des localisations…</div></div>
        ) : (
          <LocationUsersStatusBar locations={locations} total={total} />
        )}
      </div>
      {/* Section 2 : Graphiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardAreaChart data={stats.articlesByMonth} title="Évolution des articles publiés" />
        <ArticlesByCategoryPie />
      </div>
      {/* Section 3 : Widgets latéraux */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatusBar />
        <RecentUsersWidget />
      </div>
      {/* Section 4 : Tableau articles */}
      {loadingArticles ? (
        <div className="bg-white/80 rounded-2xl shadow-lg p-6 mb-8 text-center text-gray-400">Chargement des articles…</div>
      ) : (
        <ModernTable rows={articles} />
      )}
    </div>
  );
};

export default DashboardWidgets; 