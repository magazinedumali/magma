import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useRoutes, useLocation, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import ArticleDetail from "./pages/ArticleDetail";
import CategoryPage from "./pages/CategoryPage";
import NotFound from "./pages/NotFound";
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/profile';
import MobileHome from './mobile/Index';
import MobileSearch from './mobile/Search';
import MobileProfile from './mobile/profile';
import MobileLogin from './mobile/Login';
import MobileRegister from './mobile/Register';
import MobileSettings from './mobile/settings';
import MobileArticleDetail from './mobile/ArticleDetail';
import ArticleCommentsMobile from './mobile/ArticleComments';
import AudioStreamingPage, { AlbumDetailMobile } from './mobile/AudioStreaming';
import ArticleCommentsWeb from './pages/ArticleCommentsWeb';
import Streaming from './pages/Streaming';
import NousContacter from './pages/NousContacter';
// @ts-ignore - Tempo routes
import routes from "tempo-routes";
import './lib/i18n';
import { useEffect } from 'react';
import React from 'react';

const queryClient = new QueryClient();

// Create a separate component for Tempo routes to ensure useRoutes is used within Router context
const TempoRoutes = () => {
  if (import.meta.env.VITE_TEMPO) {
    return useRoutes(routes);
  }
  return null;
};

function MobileRedirector({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [ready, setReady] = React.useState(false);
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isAlreadyMobile = location.pathname.startsWith('/mobile');
    const isWebArticleOrCategory = location.pathname.startsWith('/article/') || location.pathname.startsWith('/category/');
    if (isMobile && !isAlreadyMobile && !isWebArticleOrCategory) {
      navigate('/mobile', { replace: true });
    } else {
      setReady(true);
    }
  }, [location, navigate]);
  if (!ready) return null;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <MobileRedirector>
          {/* Tempo routes component used inside Router context */}
          <TempoRoutes />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/mobile" element={<MobileHome />} />
            <Route path="/mobile/search" element={<MobileSearch />} />
            <Route path="/mobile/profile" element={<MobileProfile />} />
            <Route path="/mobile/login" element={<MobileLogin />} />
            <Route path="/mobile/register" element={<MobileRegister />} />
            <Route path="/mobile/settings" element={<MobileSettings />} />
            <Route path="/mobile/audio-streaming" element={<AudioStreamingPage />} />
            <Route path="/mobile/album/:id" element={<AlbumDetailMobile />} />
            <Route path="/mobile/article/:slug" element={<MobileArticleDetail />} />
            <Route path="/mobile/article/:slug/comments" element={<ArticleCommentsMobile />} />
            <Route path="/article/:slug" element={<ArticleDetail />} />
            <Route path="/article/:slug/comments" element={<ArticleCommentsWeb />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/superadmin/*" element={<SuperAdminDashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/streaming" element={<Streaming />} />
            <Route path="/nouscontacter" element={<NousContacter />} />
            {/* Add this before the catchall route for Tempo */}
            {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MobileRedirector>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
