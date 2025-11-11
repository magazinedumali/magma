import React from 'react';
import { Routes, Route, Outlet, useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/admin-dashboard/DashboardLayout';
import MediasPage from './superadmin/MediasPage';
import UsersPage from './superadmin/UsersPage';
import AdminsPage from './superadmin/AdminsPage';
import CommentsPage from './superadmin/CommentsPage';
import ApparencePage from './superadmin/ApparencePage';
import EditBannerPage from './superadmin/EditBannerPage';
import LoginPage from './superadmin/LoginPage';
import RegisterPage from './superadmin/RegisterPage';
import RequireSuperAdminAuth from './superadmin/RequireSuperAdminAuth';
import AlbumsPage from './superadmin/AlbumsPage';
import AddAlbumPage from './superadmin/AddAlbumPage';
import EditAlbumPage from './superadmin/EditAlbumPage';
import StoriesPage from './superadmin/StoriesPage';
import ArticleList from '../admin/Articles/ArticleList';
import ArticleForm from '../admin/Articles/ArticleForm';
import ArticleCreatePage from '../admin/Articles/ArticleCreatePage';
import { PollsPage } from './superadmin';
import SuperAdminHome from './superadmin';
import CategoriesPage from './superadmin/CategoriesPage';
import MainMenuPage from './superadmin/MainMenuPage';
import PagesAdminPage from './superadmin/PagesAdminPage';
import VideosPage from './superadmin/VideosPage';
import SettingsPage from './superadmin/SettingsPage';
import { useAdminContext } from '@/hooks/use-admin-context';

const ArticleFormWrapper = (props: any) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getArticlesPath } = useAdminContext();
  
  return (
    <ArticleForm
      articleId={id}
      onSuccess={() => navigate(getArticlesPath())}
      onCancel={() => navigate(getArticlesPath())}
      {...props}
    />
  );
};

const SuperAdminDashboard = () => {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route element={<DashboardLayout><Outlet /></DashboardLayout>}>
        <Route element={<RequireSuperAdminAuth><Outlet /></RequireSuperAdminAuth>}>
          <Route index element={<SuperAdminHome />} />
          <Route path="medias" element={<MediasPage />} />
          <Route path="utilisateurs" element={<UsersPage />} />
          <Route path="administrateurs" element={<AdminsPage />} />
          <Route path="commentaires" element={<CommentsPage />} />
          <Route path="apparence" element={<ApparencePage />} />
          <Route path="banniere/:position" element={<EditBannerPage />} />
          <Route path="parametres" element={<SettingsPage />} />
          <Route path="albums" element={<AlbumsPage />} />
          <Route path="albums/add" element={<AddAlbumPage />} />
          <Route path="albums/edit/:id" element={<EditAlbumPage />} />
          <Route path="stories" element={<StoriesPage />} />
          <Route path="articles" element={<ArticleList />} />
          <Route path="articles/nouveau" element={<ArticleCreatePage />} />
          <Route path="articles/edit/:id" element={<ArticleFormWrapper />} />
          <Route path="polls" element={<PollsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="menu" element={<MainMenuPage />} />
          <Route path="pages" element={<PagesAdminPage />} />
          <Route path="videos" element={<VideosPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default SuperAdminDashboard; 