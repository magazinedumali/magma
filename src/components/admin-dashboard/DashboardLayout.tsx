import React, { Suspense } from "react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import { Outlet } from 'react-router-dom';
import { LoadingBar } from '@/components/ui/loading-bar';
import "./dashboard.css";

const superAdminPageFallback = (
  <div className="flex min-h-[180px] items-center justify-center py-12">
    <LoadingBar variant="inline" className="h-1 w-44" />
  </div>
);

const DashboardLayout = () => (
  <div className="dashboard-container">
    <DashboardSidebar />
    <main className="main-content">
      <DashboardHeader />
      <Suspense fallback={superAdminPageFallback}>
        <Outlet />
      </Suspense>
    </main>
  </div>
);

export default DashboardLayout; 