import React from "react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import { Outlet } from 'react-router-dom';
import "./dashboard.css";

const DashboardLayout = () => (
  <div className="dashboard-container">
    <DashboardSidebar />
    <main className="main-content">
      <DashboardHeader />
      <Outlet />
    </main>
  </div>
);

export default DashboardLayout; 