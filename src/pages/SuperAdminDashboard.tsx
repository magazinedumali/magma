import React, { Suspense, lazy } from 'react';
import { Routes, Route, Outlet, useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/admin-dashboard/DashboardLayout';
import RequireSuperAdminAuth from './superadmin/RequireSuperAdminAuth';
import { useAdminContext } from '@/hooks/use-admin-context';
import { LoadingBar } from '@/components/ui/loading-bar';

const adminPageFallback = (
  <div className="flex min-h-[180px] items-center justify-center py-12">
    <LoadingBar variant="inline" className="h-1 w-44" />
  </div>
);

const LoginPage = lazy(() => import('./superadmin/LoginPage'));
const RegisterPage = lazy(() => import('./superadmin/RegisterPage'));
const SuperAdminHome = lazy(() => import('./superadmin'));
const MediasPage = lazy(() => import('./superadmin/MediasPage'));
const UsersPage = lazy(() => import('./superadmin/UsersPage'));
const AdminsPage = lazy(() => import('./superadmin/AdminsPage'));
const CommentsPage = lazy(() => import('./superadmin/CommentsPage'));
const ApparencePage = lazy(() => import('./superadmin/ApparencePage'));
const EditBannerPage = lazy(() => import('./superadmin/EditBannerPage'));
const SettingsPage = lazy(() => import('./superadmin/SettingsPage'));
const AlbumsPage = lazy(() => import('./superadmin/AlbumsPage'));
const AddAlbumPage = lazy(() => import('./superadmin/AddAlbumPage'));
const EditAlbumPage = lazy(() => import('./superadmin/EditAlbumPage'));
const StoriesPage = lazy(() => import('./superadmin/StoriesPage'));
const ArticleList = lazy(() => import('../admin/Articles/ArticleList'));
const ArticleCreatePage = lazy(() => import('../admin/Articles/ArticleCreatePage'));
const PollsPage = lazy(() => import('./superadmin/PollsPage'));
const CategoriesPage = lazy(() => import('./superadmin/CategoriesPage'));
const MainMenuPage = lazy(() => import('./superadmin/MainMenuPage'));
const PagesAdminPage = lazy(() => import('./superadmin/PagesAdminPage'));
const VideosPage = lazy(() => import('./superadmin/VideosPage'));

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

const SuperAdminDashboard = () => {
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
      <Route element={<DashboardLayout />}>
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
