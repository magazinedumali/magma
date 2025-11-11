import React from 'react';
import { Routes, Route, Outlet, useParams } from 'react-router-dom';
import AdminDashboardLayout from '../components/admin-dashboard/AdminDashboardLayout';
import MediasPage from './admin/MediasPage';
import CommentsPage from './admin/CommentsPage';
import LoginPage from './admin/LoginPage';
import RegisterPage from './admin/RegisterPage';
import RequireAdminAuth from './admin/RequireAdminAuth';
import AlbumsPage from './admin/AlbumsPage';
import AddAlbumPage from './admin/AddAlbumPage';
import EditAlbumPage from './admin/EditAlbumPage';
import StoriesPage from './admin/StoriesPage';
import AddStoryPage from './admin/AddStoryPage';
import EditStoryPage from './admin/EditStoryPage';
import ArticleList from '../admin/Articles/ArticleList';
import ArticleForm from '../admin/Articles/ArticleForm';
import ArticleCreatePage from '../admin/Articles/ArticleCreatePage';
import { PollsPage } from './admin';
import AdminHome from './admin';
import CategoriesPage from './admin/CategoriesPage';
import MainMenuPage from './admin/MainMenuPage';
import PagesAdminPage from './admin/PagesAdminPage';
import VideosPage from './admin/VideosPage';
import SettingsPage from './admin/SettingsPage';
import { useAdminContext } from '@/hooks/use-admin-context';
import { useNavigate } from 'react-router-dom';

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

const AdminDashboard = () => {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route element={<AdminDashboardLayout><Outlet /></AdminDashboardLayout>}>
        <Route element={<RequireAdminAuth><Outlet /></RequireAdminAuth>}>
          <Route index element={<AdminHome />} />
          <Route path="medias" element={<MediasPage />} />
          <Route path="commentaires" element={<CommentsPage />} />
          <Route path="parametres" element={<SettingsPage />} />
          <Route path="albums" element={<AlbumsPage />} />
          <Route path="albums/add" element={<AddAlbumPage />} />
          <Route path="albums/edit/:id" element={<EditAlbumPage />} />
          <Route path="stories" element={<StoriesPage />} />
          <Route path="stories/add" element={<AddStoryPage />} />
          <Route path="stories/edit/:id" element={<EditStoryPage />} />
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

export default AdminDashboard; 