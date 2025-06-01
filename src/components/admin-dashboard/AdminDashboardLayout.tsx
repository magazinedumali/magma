import React from "react";
import AdminDashboardSidebar from "./AdminDashboardSidebar";
import AdminDashboardHeader from "./AdminDashboardHeader";
import { Outlet } from 'react-router-dom';
import "./dashboard.css";

const AdminDashboardLayout = () => (
  <div className="dashboard-container">
    <AdminDashboardSidebar />
    <main className="main-content">
      <AdminDashboardHeader />
      <Outlet />
    </main>
  </div>
);

export default AdminDashboardLayout; 