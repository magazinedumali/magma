import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import "./dashboard.css";

const AdminDashboardHeader = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };
  return (
    <header className="dashboard-header">
      <div className="flex items-center gap-4">
        {/* Avatar Admin */}
        {user && user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt="avatar"
            className="w-12 h-12 rounded-full object-cover border-2 border-[#4f8cff]"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#4f8cff] text-white flex items-center justify-center font-semibold text-lg border-2 border-[#4f8cff] font-poppins">
            {user?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-sm text-gray-500 font-medium font-poppins">Dashboard</span>
          <span className="text-2xl font-semibold text-gray-800 font-poppins">
            Bienvenue {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Admin'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default AdminDashboardHeader; 