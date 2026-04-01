import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useRoutes, useLocation, useNavigate } from "react-router-dom";
import ErrorBoundary from './components/ErrorBoundary';
import MobileRouteThemeLock from './components/MobileRouteThemeLock';
import GoogleAuthNormalizer from './components/GoogleAuthNormalizer';
import routes from "tempo-routes";
import './lib/i18n';
import { useEffect, lazy, Suspense } from 'react';
import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LoadingBar } from './components/ui/loading-bar';

const queryClient = new QueryClient();

// Lazy load des pages lourdes pour accélérer le premier affichage
const Index = lazy(() => import('./pages/Index'));
const ArticleDetail = lazy(() => import('./pages/ArticleDetail'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/profile'));
const MobileHome = lazy(() => import('./mobile/Index'));
const MobileSearch = lazy(() => import('./mobile/Search'));
const MobileProfile = lazy(() => import('./mobile/profile'));
const MobileLogin = lazy(() => import('./mobile/Login'));
const MobileRegister = lazy(() => import('./mobile/Register'));
const MobileSettings = lazy(() => import('./mobile/settings'));
const MobileBookmarks = lazy(() => import('./mobile/MobileBookmarks'));
const MobileArticleDetail = lazy(() => import('./mobile/ArticleDetail'));
const ArticleCommentsMobile = lazy(() => import('./mobile/ArticleComments'));
const AudioStreamingPage = lazy(() => import('./mobile/AudioStreaming').then(m => ({ default: m.default })));
const AlbumDetailMobile = lazy(() => import('./mobile/AudioStreaming').then(m => ({ default: m.AlbumDetailMobile })));
const ArticleCommentsWeb = lazy(() => import('./pages/ArticleCommentsWeb'));
const Streaming = lazy(() => import('./pages/Streaming'));
const NousContacter = lazy(() => import('./pages/NousContacter'));
const About = lazy(() => import('./pages/About'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Advertise = lazy(() => import('./pages/Advertise'));
const TestArticle = lazy(() => import('./pages/TestArticle'));
const SlugDebugger = lazy(() => import('./pages/SlugDebugger'));
const SlugFixer = lazy(() => import('./pages/SlugFixer'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Create a separate component for Tempo routes to ensure useRoutes is used within Router context
const TempoRoutes = () => {
  const shouldRenderTempo = Boolean(import.meta.env.VITE_TEMPO);
  const tempoElements = useRoutes(shouldRenderTempo ? routes : []);
  return shouldRenderTempo ? tempoElements : null;
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
  <ThemeProvider>
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GoogleAuthNormalizer />
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <MobileRouteThemeLock />
          <MobileRedirector>
            {/* Tempo routes component used inside Router context */}
            <TempoRoutes />
            <Routes>
            <Route path="/" element={<Suspense fallback={<LoadingBar variant="full" />}><Index /></Suspense>} />
            <Route path="/mobile" element={<Suspense fallback={<LoadingBar variant="full" />}><MobileHome /></Suspense>} />
            <Route path="/mobile/search" element={<Suspense fallback={<LoadingBar variant="full" />}><MobileSearch /></Suspense>} />
            <Route path="/mobile/profile" element={<Suspense fallback={<LoadingBar variant="full" />}><MobileProfile /></Suspense>} />
            <Route path="/mobile/login" element={<Suspense fallback={<LoadingBar variant="full" />}><MobileLogin /></Suspense>} />
            <Route path="/mobile/register" element={<Suspense fallback={<LoadingBar variant="full" />}><MobileRegister /></Suspense>} />
            <Route path="/mobile/settings" element={<Suspense fallback={<LoadingBar variant="full" />}><MobileSettings /></Suspense>} />
            <Route path="/mobile/bookmarks" element={<Suspense fallback={<LoadingBar variant="full" />}><MobileBookmarks /></Suspense>} />
            <Route path="/mobile/audio-streaming" element={<Suspense fallback={<LoadingBar variant="full" />}><AudioStreamingPage /></Suspense>} />
            <Route path="/mobile/album/:id" element={<Suspense fallback={<LoadingBar variant="full" />}><AlbumDetailMobile /></Suspense>} />
            <Route path="/mobile/article/:slug" element={<Suspense fallback={<LoadingBar variant="full" />}><MobileArticleDetail /></Suspense>} />
            <Route path="/mobile/article/:slug/comments" element={<Suspense fallback={<LoadingBar variant="full" />}><ArticleCommentsMobile /></Suspense>} />
            <Route path="/article/:slug" element={<Suspense fallback={<LoadingBar variant="full" />}><ArticleDetail /></Suspense>} />
            <Route path="/article/:slug/comments" element={<Suspense fallback={<LoadingBar variant="full" />}><ArticleCommentsWeb /></Suspense>} />
            <Route path="/category/:category" element={<Suspense fallback={<LoadingBar variant="full" />}><CategoryPage /></Suspense>} />
            <Route path="/admin/*" element={<Suspense fallback={<LoadingBar variant="full" />}><AdminDashboard /></Suspense>} />
            <Route path="/superadmin/*" element={<Suspense fallback={<LoadingBar variant="full" />}><SuperAdminDashboard /></Suspense>} />
            <Route path="/login" element={<Suspense fallback={<LoadingBar variant="full" />}><Login /></Suspense>} />
            <Route path="/register" element={<Suspense fallback={<LoadingBar variant="full" />}><Register /></Suspense>} />
            <Route path="/profile" element={<Suspense fallback={<LoadingBar variant="full" />}><Profile /></Suspense>} />
            <Route path="/streaming" element={<Suspense fallback={<LoadingBar variant="full" />}><Streaming /></Suspense>} />
            <Route path="/nouscontacter" element={<Suspense fallback={<LoadingBar variant="full" />}><NousContacter /></Suspense>} />
            <Route path="/about" element={<Suspense fallback={<LoadingBar variant="full" />}><About /></Suspense>} />
            <Route path="/terms" element={<Suspense fallback={<LoadingBar variant="full" />}><Terms /></Suspense>} />
            <Route path="/privacy" element={<Suspense fallback={<LoadingBar variant="full" />}><Privacy /></Suspense>} />
            <Route path="/advertise" element={<Suspense fallback={<LoadingBar variant="full" />}><Advertise /></Suspense>} />
            <Route path="/test-article" element={<Suspense fallback={<LoadingBar variant="full" />}><TestArticle /></Suspense>} />
            <Route path="/slug-debugger" element={<Suspense fallback={<LoadingBar variant="full" />}><SlugDebugger /></Suspense>} />
            <Route path="/slug-fixer" element={<Suspense fallback={<LoadingBar variant="full" />}><SlugFixer /></Suspense>} />
            {/* Add this before the catchall route for Tempo */}
            {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}
            <Route path="*" element={<Suspense fallback={<LoadingBar variant="full" />}><NotFound /></Suspense>} />
            </Routes>
          </MobileRedirector>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
  </ThemeProvider>
);

export default App;
