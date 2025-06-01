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
    <header className="dashboard-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexDirection: 'row', paddingTop: 24, paddingBottom: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 18 }}>
        {/* Avatar Admin */}
        {user && user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt="avatar"
            style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', background: '#eee', border: '2px solid #4f8cff' }}
          />
        ) : (
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#4f8cff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, border: '2px solid #4f8cff' }}>
            A
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
          <span style={{ fontSize: 18, color: '#888', fontWeight: 500, marginBottom: 2 }}>Dashboard</span>
          <span style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.1 }}>Bienvenue Admin,</span>
        </div>
      </div>
    </header>
  );
};

export default AdminDashboardHeader; 