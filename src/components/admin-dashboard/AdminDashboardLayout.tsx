import React from "react";
import AdminDashboardSidebar from "./AdminDashboardSidebar";
import AdminDashboardHeader from "./AdminDashboardHeader";
import "./dashboard.css";

interface AdminDashboardLayoutProps {
  children?: React.ReactNode;
}

const AdminDashboardLayout = ({ children }: AdminDashboardLayoutProps) => (
  <div className="dashboard-container">
    <AdminDashboardSidebar />
    <main className="main-content">
      <AdminDashboardHeader />
      <div className="main-content-inner">
        {children}
      </div>
    </main>
  </div>
);

export default AdminDashboardLayout;