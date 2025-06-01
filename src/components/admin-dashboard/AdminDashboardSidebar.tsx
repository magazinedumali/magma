import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaSearch, FaHome, FaFileAlt, FaImages, FaComments, FaTools, FaMusic, FaFire, FaSitemap } from "react-icons/fa";
import "./dashboard.css";
import { useTranslation } from 'react-i18next';
import { supabase } from "../../lib/supabaseClient";

const AdminDashboardSidebar = () => {
  const { t } = useTranslation();
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
    <aside className="dashboard-sidebar">
      <div className="dashboard-logo-row">
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
        <span className="dashboard-logo">Admin</span>
      </div>
      <div className="dashboard-search">
        <FaSearch className="search-icon" />
        <input type="text" placeholder={t('Recherche')} />
      </div>
      {/* Bloc scrollable pour les menus */}
      <div style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', paddingRight: 4 }}>
        <nav>
          <div className="sidebar-section-title">{t('Content')}</div>
          <ul>
            <li>
              <NavLink to="/admin" end className={({ isActive }) => isActive ? "active" : undefined}>
                <FaHome className="sidebar-icon" />
                <span>{t('Dashboard')}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/articles" className={({ isActive }) => isActive ? "active" : undefined}>
                <FaFileAlt className="sidebar-icon" />
                <span>{t('Articles')}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/categories" className={({ isActive }) => isActive ? "active" : undefined}>
                <FaTools className="sidebar-icon" />
                <span>Catégories</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/medias" className={({ isActive }) => isActive ? "active" : undefined}>
                <FaImages className="sidebar-icon" />
                <span>{t('Médias')}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/commentaires" className={({ isActive }) => isActive ? "active" : undefined}>
                <FaComments className="sidebar-icon" />
                <span>{t('Commentaires')}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/albums" className={({ isActive }) => isActive ? "active" : undefined}>
                <FaMusic className="sidebar-icon" />
                <span>{t('Albums audios')}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/stories" className={({ isActive }) => isActive ? "active" : undefined}>
                <FaImages className="sidebar-icon" />
                <span>{t('Stories')}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/polls" className={({ isActive }) => isActive ? "active" : undefined}>
                <FaFire className="sidebar-icon" />
                <span>Sondages</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/pages" className={({ isActive }) => isActive ? "active" : undefined}>
                <FaFileAlt className="sidebar-icon" />
                <span>Pages du site</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/videos" className={({ isActive }) => isActive ? "active" : undefined}>
                <FaImages className="sidebar-icon" />
                <span>Vidéos</span>
              </NavLink>
            </li>
          </ul>
          <div className="sidebar-section-title">{t('Website')}</div>
          <ul>
            <li>
              <NavLink to="/admin/menu" className={({ isActive }) => isActive ? "active" : undefined}>
                <FaSitemap className="sidebar-icon" />
                <span>Menu principal</span>
              </NavLink>
            </li>
          </ul>
          <div className="sidebar-section-title">{t('System')}</div>
          <ul>
            <li>
              <NavLink to="/admin/parametres" className={({ isActive }) => isActive ? "active" : undefined}>
                <FaTools className="sidebar-icon" />
                <span>{t('Paramètres')}</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
      <button
        onClick={handleLogout}
        style={{
          background: '#4f8cff',
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          padding: '14px 0',
          fontWeight: 700,
          fontSize: 17,
          width: '88%',
          margin: '32px auto 0 auto',
          display: 'block',
          boxShadow: '0 2px 8px #4f8cff22',
          fontFamily: 'Jost, sans-serif',
          cursor: 'pointer',
          letterSpacing: 0.2,
          transition: 'background 0.18s, color 0.18s',
        }}
      >
        Déconnexion
      </button>
    </aside>
  );
};

export default AdminDashboardSidebar; 