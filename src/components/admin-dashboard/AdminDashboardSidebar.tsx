import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaSearch, FaHome, FaFileAlt, FaImages, FaComments, FaTools,
  FaMusic, FaFire, FaSitemap, FaVideo, FaPoll, FaCog
} from "react-icons/fa";
import "./dashboard.css";
import { useTranslation } from 'react-i18next';
import { supabase } from "../../lib/supabaseClient";
import { getUserAvatar } from "../../lib/userHelper";
import { useAdminContext } from "@/hooks/use-admin-context";

const AdminDashboardSidebar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const {
    basePath,
    getDashboardPath,
    getArticlesPath,
    getCategoriesPath,
    getMediasPath,
    getCommentsPath,
    getAlbumsPath,
    getStoriesPath,
    getPollsPath,
    getPagesPath,
    getVideosPath,
    getMenuPath
  } = useAdminContext();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Admin';
  const initial = displayName.charAt(0).toUpperCase();
  const hasAvatar = user && getUserAvatar(user) !== '/placeholder.svg';

  return (
    <aside className="dashboard-sidebar">
      {/* Logo */}
      <div className="dashboard-logo-row">
        <div
          style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'linear-gradient(135deg, #ff184e, #ff6b8a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 15, color: '#fff', flexShrink: 0,
            boxShadow: '0 0 16px rgba(255,24,78,0.45)'
          }}
        >
          LM
        </div>
        <div className="dashboard-logo">
          Le Magazine<br />
          <span>du Mali</span>
        </div>
      </div>

      {/* Search */}
      <div className="dashboard-search">
        <FaSearch className="search-icon" />
        <input type="text" placeholder={t('Recherche')} />
      </div>

      {/* Nav scrollable */}
      <div className="sidebar-scroll">
        <nav>
          <div className="sidebar-section-title">{t('Content')}</div>
          <ul>
            <li>
              <NavLink to={getDashboardPath()} end className={({ isActive }) => isActive ? "active" : undefined}>
                <FaHome className="sidebar-icon" />
                <span>{t('Dashboard')}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to={getArticlesPath()} className={({ isActive }) => isActive ? "active" : undefined}>
                <FaFileAlt className="sidebar-icon" />
                <span>{t('Articles')}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to={getCategoriesPath()} className={({ isActive }) => isActive ? "active" : undefined}>
                <FaTools className="sidebar-icon" />
                <span>Catégories</span>
              </NavLink>
            </li>
            <li>
              <NavLink to={getMediasPath()} className={({ isActive }) => isActive ? "active" : undefined}>
                <FaImages className="sidebar-icon" />
                <span>{t('Médias')}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to={getCommentsPath()} className={({ isActive }) => isActive ? "active" : undefined}>
                <FaComments className="sidebar-icon" />
                <span>{t('Commentaires')}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to={getAlbumsPath()} className={({ isActive }) => isActive ? "active" : undefined}>
                <FaMusic className="sidebar-icon" />
                <span>{t('Albums audios')}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to={getStoriesPath()} className={({ isActive }) => isActive ? "active" : undefined}>
                <FaImages className="sidebar-icon" />
                <span>{t('Stories')}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to={getVideosPath()} className={({ isActive }) => isActive ? "active" : undefined}>
                <FaVideo className="sidebar-icon" />
                <span>Vidéos</span>
              </NavLink>
            </li>
            <li>
              <NavLink to={getPollsPath()} className={({ isActive }) => isActive ? "active" : undefined}>
                <FaPoll className="sidebar-icon" />
                <span>Sondages</span>
              </NavLink>
            </li>
            <li>
              <NavLink to={getPagesPath()} className={({ isActive }) => isActive ? "active" : undefined}>
                <FaFileAlt className="sidebar-icon" />
                <span>Pages du site</span>
              </NavLink>
            </li>
          </ul>

          <div className="sidebar-section-title">{t('Website')}</div>
          <ul>
            <li>
              <NavLink to={getMenuPath()} className={({ isActive }) => isActive ? "active" : undefined}>
                <FaSitemap className="sidebar-icon" />
                <span>Menu principal</span>
              </NavLink>
            </li>
          </ul>

          <div className="sidebar-section-title">{t('System')}</div>
          <ul>
            <li>
              <NavLink to={`${basePath}/parametres`} className={({ isActive }) => isActive ? "active" : undefined}>
                <FaCog className="sidebar-icon" />
                <span>{t('Paramètres')}</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>

      {/* User + Logout */}
      <div style={{ padding: '0 10px', marginTop: 'auto' }}>
        <div className="dashboard-user-info">
          {hasAvatar ? (
            <img
              src={getUserAvatar(user)}
              alt="avatar"
              style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
              onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
            />
          ) : (
            <div className="dashboard-avatar">{initial}</div>
          )}
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {displayName}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Admin</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '10px',
            background: 'rgba(255,24,78,0.12)',
            color: '#ff184e',
            border: '1px solid rgba(255,24,78,0.25)',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.18s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,24,78,0.22)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,24,78,0.12)';
          }}
        >
          Déconnexion
        </button>
      </div>
    </aside>
  );
};

export default AdminDashboardSidebar;