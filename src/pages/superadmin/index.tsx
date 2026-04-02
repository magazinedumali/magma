import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { LoadingBar } from '@/components/ui/loading-bar';

const DashboardWidgets = lazy(() => import('../../components/admin-dashboard/DashboardWidgets'));

const widgetsFallback = (
  <div className="flex min-h-[200px] items-center justify-center py-16">
    <LoadingBar variant="inline" className="h-1 w-48" />
  </div>
);

export default function SuperAdminHome() {
  return (
    <>
      <div className="flex justify-end mb-6 gap-3">
        <Link 
          to="/superadmin/categories" 
          className="bg-[#4f8cff] text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-[#2563eb] transition-colors shadow-sm font-poppins"
        >
          Gérer les catégories
        </Link>
        <Link 
          to="/superadmin/menu" 
          className="bg-[#ff184e] text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-red-600 transition-colors shadow-sm font-poppins"
        >
          Gérer le menu principal
        </Link>
      </div>
      <Suspense fallback={widgetsFallback}>
        <DashboardWidgets />
      </Suspense>
    </>
  );
}

export { default as PollsPage } from './PollsPage'; 
export { default as MainMenuPage } from './MainMenuPage';

export { default as VideosPage } from './VideosPage'; 