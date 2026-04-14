import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { getUserAvatar } from "../../lib/userHelper";
import { useTheme } from "../../contexts/ThemeContext";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import "./dashboard.css";

const AdminDashboardHeader = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Admin';
  const initial = displayName.charAt(0).toUpperCase();
  const hasAvatar = user && getUserAvatar(user) !== '/placeholder.svg';

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <header className="dashboard-header">
      {/* Left: Greeting */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font)', fontWeight: 500 }}>
          Dashboard
        </span>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font)', letterSpacing: '-0.3px' }}>
          {greeting}, <span style={{ color: 'var(--accent)' }}>{displayName}</span> 👋
        </span>
      </div>

      {/* Right: theme toggle & avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button 
          onClick={toggleTheme}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            color: 'var(--text-primary)', cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
          className="dashboard-theme-toggle"
          title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
        >
          {isDark ? <SunIcon className="w-5 h-5 text-amber-400" /> : <MoonIcon className="w-5 h-5 text-slate-700" />}
        </button>

        <div style={{
          padding: '6px 14px',
          background: 'rgba(255,24,78,0.1)',
          border: '1px solid rgba(255,24,78,0.2)',
          borderRadius: 8,
          fontSize: '0.78rem',
          fontWeight: 600,
          color: 'var(--accent)',
          fontFamily: 'var(--font)',
        }}>
          Admin
        </div>
        {hasAvatar ? (
          <img
            src={getUserAvatar(user)}
            alt="avatar"
            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,24,78,0.4)', cursor: 'pointer' }}
            onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
          />
        ) : (
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'linear-gradient(135deg, #ff184e, #ff6b8a)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 15,
            border: '2px solid rgba(255,24,78,0.4)',
            boxShadow: '0 0 12px rgba(255,24,78,0.3)',
            cursor: 'pointer',
            fontFamily: 'var(--font)',
          }}>
            {initial}
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminDashboardHeader;