import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
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
import ArticleList from '../admin/Articles/ArticleList';
import ArticleForm from '../admin/Articles/ArticleForm';
import ArticleCreatePage from '../admin/Articles/ArticleCreatePage';
import { PollsPage } from './admin';
import AdminHome from './admin';
import CategoriesPage from './admin/CategoriesPage';
import MainMenuPage from './admin/MainMenuPage';
import PagesAdminPage from './admin/PagesAdminPage';
import VideosPage from './admin/VideosPage';

const Placeholder = ({ title }: { title: string }) => (
  <div style={{ padding: 32, fontFamily: 'Jost, sans-serif', fontSize: 24, fontWeight: 500 }}>
    {title}
  </div>
);

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
          <Route path="parametres" element={<Placeholder title="Paramètres" />} />
          <Route path="albums" element={<AlbumsPage />} />
          <Route path="albums/add" element={<AddAlbumPage />} />
          <Route path="albums/edit/:id" element={<EditAlbumPage />} />
          <Route path="stories" element={<StoriesPage />} />
          <Route path="articles" element={<ArticleList />} />
          <Route path="articles/nouveau" element={<ArticleCreatePage />} />
          <Route path="articles/edit/:id" element={<ArticleForm />} />
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