import React, { Suspense, lazy } from 'react';
import { LoadingBar } from '@/components/ui/loading-bar';

const DashboardWidgets = lazy(() => import('../../components/admin-dashboard/DashboardWidgets'));

const widgetsFallback = (
  <div className="flex min-h-[200px] items-center justify-center py-16">
    <LoadingBar variant="inline" className="h-1 w-48" />
  </div>
);

export default function AdminHome() {
  return (
    <Suspense fallback={widgetsFallback}>
      <DashboardWidgets />
    </Suspense>
  );
}

export { default as PollsPage } from './PollsPage';
export { default as MainMenuPage } from './MainMenuPage';