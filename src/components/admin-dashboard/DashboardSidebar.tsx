import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaSearch, FaHome, FaUser, FaFileAlt, FaImages, FaComments, FaPaintBrush, FaPlug, FaTools, FaUsersCog, FaCog, FaCode, FaUserShield, FaMusic, FaFire, FaSitemap } from "react-icons/fa";
import "./dashboard.css";
import { useTranslation } from 'react-i18next';
import { supabase } from "../../lib/supabaseClient";

const DashboardSidebar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/superadmin/login");
  };
  return (
  <aside className="dashboard-sidebar">
    <div className="dashboard-logo-row">
      {/* Avatar SuperAdmin */}
      {user && user.user_metadata?.avatar_url ? (
        <img
          src={user.user_metadata.avatar_url}
          alt="avatar"
          style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', background: '#eee', border: '2px solid #ff4d4f' }}
        />
      ) : (
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#ff4d4f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, border: '2px solid #ff4d4f' }}>
          SA
        </div>
      )}
      <span className="dashboard-logo">SuperAdmin</span>
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
          <NavLink to="/superadmin" end className={({ isActive }) => isActive ? "active" : undefined}>
            <FaHome className="sidebar-icon" />
              <span>{t('Dashboard')}</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/superadmin/articles" className={({ isActive }) => isActive ? "active" : undefined}>
            <FaFileAlt className="sidebar-icon" />
            <span>{t('Articles')}</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/superadmin/categories" className={({ isActive }) => isActive ? "active" : undefined}>
            <FaTools className="sidebar-icon" />
            <span>Catégories</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/superadmin/medias" className={({ isActive }) => isActive ? "active" : undefined}>
            <FaImages className="sidebar-icon" />
              <span>{t('Médias')}</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/superadmin/commentaires" className={({ isActive }) => isActive ? "active" : undefined}>
            <FaComments className="sidebar-icon" />
              <span>{t('Commentaires')}</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/superadmin/albums" className={({ isActive }) => isActive ? "active" : undefined}>
            <FaMusic className="sidebar-icon" />
            <span>{t('Albums audios')}</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/superadmin/stories" className={({ isActive }) => isActive ? "active" : undefined}>
            <FaImages className="sidebar-icon" />
            <span>{t('Stories')}</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/superadmin/polls" className={({ isActive }) => isActive ? "active" : undefined}>
            <FaFire className="sidebar-icon" />
            <span>Sondages</span>
          </NavLink>
        </li>
          <li>
            <NavLink to="/superadmin/pages" className={({ isActive }) => isActive ? "active" : undefined}>
              <FaFileAlt className="sidebar-icon" />
              <span>Pages du site</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/superadmin/videos" className={({ isActive }) => isActive ? "active" : undefined}>
              <FaImages className="sidebar-icon" />
              <span>Vidéos</span>
            </NavLink>
          </li>
      </ul>
        <div className="sidebar-section-title">{t('Website')}</div>
      <ul>
        <li>
          <NavLink to="/superadmin/apparence" className={({ isActive }) => isActive ? "active" : undefined}>
            <FaPaintBrush className="sidebar-icon" />
              <span>{t('Apparence')}</span>
          </NavLink>
        </li>
          <li>
            <NavLink to="/superadmin/menu" className={({ isActive }) => isActive ? "active" : undefined}>
              <FaSitemap className="sidebar-icon" />
              <span>Menu principal</span>
            </NavLink>
          </li>
      </ul>
        <div className="sidebar-section-title">{t('System')}</div>
      <ul>
        <li>
          <NavLink to="/superadmin/utilisateurs" className={({ isActive }) => isActive ? "active" : undefined}>
            <FaUsersCog className="sidebar-icon" />
              <span>{t('Utilisateurs')}</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/superadmin/administrateurs" className={({ isActive }) => isActive ? "active" : undefined}>
            <FaUserShield className="sidebar-icon" />
              <span>{t('Administrateurs')}</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/superadmin/parametres" className={({ isActive }) => isActive ? "active" : undefined}>
            <FaCog className="sidebar-icon" />
              <span>{t('Paramètres')}</span>
          </NavLink>
        </li>
      </ul>
    </nav>
    </div>
    <button
      onClick={handleLogout}
      style={{
        background: '#ff4d4f',
        color: '#fff',
        border: 'none',
        borderRadius: 10,
        padding: '14px 0',
        fontWeight: 700,
        fontSize: 17,
        width: '88%',
        margin: '32px auto 0 auto',
        display: 'block',
        boxShadow: '0 2px 8px #ff4d4f22',
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

export default DashboardSidebar; 