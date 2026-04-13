import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, PlayCircle, Bookmark, User } from 'lucide-react';
import { mobileTheme as T } from './mobileTheme';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

type Props = {
  user: unknown | null;
};

export default function MobileBottomNav({ user }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isDark } = useTheme();

  const isHome = pathname === '/mobile' || pathname === '/mobile/';
  const isSearch = pathname.startsWith('/mobile/search');
  const isStreaming =
    pathname.startsWith('/mobile/audio-streaming') || pathname.startsWith('/mobile/album/');
  const isBookmarks = pathname.startsWith('/mobile/bookmarks');
  const isProfile =
    pathname.startsWith('/mobile/profile') ||
    pathname.startsWith('/mobile/settings') ||
    pathname.startsWith('/mobile/login') ||
    pathname.startsWith('/mobile/register');

  const inactive = isDark ? T.colors.textMuted : '#6b7280';
  const active = T.colors.primary;

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 flex items-end justify-around border-t pb-[env(safe-area-inset-bottom)]',
        isDark ? 'border-white/10' : 'border-black/10'
      )}
      style={{
        height: 'calc(60px + env(safe-area-inset-bottom, 0px))',
        backgroundColor: isDark ? 'rgba(10, 13, 20, 0.95)' : 'rgba(255, 255, 255, 0.96)',
        boxShadow: isDark ? undefined : '0 -4px 24px rgba(0,0,0,0.06)',
      }}
    >
      <button
        type="button"
        aria-label="Accueil"
        className="flex h-14 w-14 items-center justify-center"
        onClick={() => navigate('/mobile')}
      >
        <Home size={24} color={isHome ? active : inactive} strokeWidth={isHome ? 2.25 : 2} />
      </button>
      <button
        type="button"
        aria-label="Recherche"
        className="flex h-14 w-14 items-center justify-center"
        onClick={() => navigate('/mobile/search')}
      >
        <Search size={24} color={isSearch ? active : inactive} strokeWidth={isSearch ? 2.25 : 2} />
      </button>
      <button
        type="button"
        aria-label="Streaming"
        className="-mt-5 flex h-[50px] w-[50px] items-center justify-center rounded-full shadow-lg"
        style={{
          backgroundColor: T.colors.primary,
          boxShadow: `0 4px 16px ${T.colors.primary}55`,
        }}
        onClick={() => navigate('/mobile/audio-streaming')}
      >
        <PlayCircle size={30} color="#fff" strokeWidth={2} />
      </button>
      <button
        type="button"
        aria-label="Favoris"
        className="flex h-14 w-14 items-center justify-center"
        onClick={() => navigate('/mobile/bookmarks')}
      >
        <Bookmark size={24} color={isBookmarks ? active : inactive} strokeWidth={isBookmarks ? 2.25 : 2} />
      </button>
      <button
        type="button"
        aria-label="Profil"
        className="flex h-14 w-14 items-center justify-center"
        onClick={() => navigate(user ? '/mobile/profile' : '/mobile/login')}
      >
        <User size={24} color={isProfile ? active : inactive} strokeWidth={isProfile ? 2.25 : 2} />
      </button>
    </nav>
  );
}
