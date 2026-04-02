import React, { Suspense, lazy } from 'react';
import { Routes, Route, Outlet, useParams, useNavigate } from 'react-router-dom';
import AdminDashboardLayout from '../components/admin-dashboard/AdminDashboardLayout';
import RequireAdminAuth from './admin/RequireAdminAuth';
import { useAdminContext } from '@/hooks/use-admin-context';
import { LoadingBar } from '@/components/ui/loading-bar';

const adminPageFallback = (
  <div className="flex min-h-[180px] items-center justify-center py-12">
    <LoadingBar variant="inline" className="h-1 w-44" />
  </div>
);

const LoginPage = lazy(() => import('./admin/LoginPage'));
const RegisterPage = lazy(() => import('./admin/RegisterPage'));
const AdminHome = lazy(() => import('./admin'));
const MediasPage = lazy(() => import('./admin/MediasPage'));
const CommentsPage = lazy(() => import('./admin/CommentsPage'));
const SettingsPage = lazy(() => import('./admin/SettingsPage'));
const AlbumsPage = lazy(() => import('./admin/AlbumsPage'));
const AddAlbumPage = lazy(() => import('./admin/AddAlbumPage'));
const EditAlbumPage = lazy(() => import('./admin/EditAlbumPage'));
const StoriesPage = lazy(() => import('./admin/StoriesPage'));
const AddStoryPage = lazy(() => import('./admin/AddStoryPage'));
const EditStoryPage = lazy(() => import('./admin/EditStoryPage'));
const ArticleList = lazy(() => import('../admin/Articles/ArticleList'));
const ArticleCreatePage = lazy(() => import('../admin/Articles/ArticleCreatePage'));
const PollsPage = lazy(() => import('./admin/PollsPage'));
const CategoriesPage = lazy(() => import('./admin/CategoriesPage'));
const MainMenuPage = lazy(() => import('./admin/MainMenuPage'));
const PagesAdminPage = lazy(() => import('./admin/PagesAdminPage'));
const VideosPage = lazy(() => import('./admin/VideosPage'));
const BannersPage = lazy(() => import('./admin/BannersPage'));

const LazyArticleForm = lazy(() => import('../admin/Articles/ArticleForm'));

const ArticleFormWrapper = (props: object) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getArticlesPath } = useAdminContext();

  return (
    <Suspense fallback={adminPageFallback}>
      <LazyArticleForm
        articleId={id}
        onSuccess={() => navigate(getArticlesPath())}
        onCancel={() => navigate(getArticlesPath())}
        {...props}
      />
    </Suspense>
  );
};

const AdminDashboard = () => {
  return (
    <Routes>
      <Route
        path="login"
        element={
          <Suspense fallback={adminPageFallback}>
            <LoginPage />
          </Suspense>
        }
      />
      <Route
        path="register"
        element={
          <Suspense fallback={adminPageFallback}>
            <RegisterPage />
          </Suspense>
        }
      />
      <Route
        element={
          <AdminDashboardLayout>
            <Suspense fallback={adminPageFallback}>
              <Outlet />
            </Suspense>
          </AdminDashboardLayout>
        }
      >
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
          <Route path="bannieres" element={<BannersPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminDashboard;
