import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';

const MOBILE_NEWS_FONT_CLASS = 'mobile-news-typography';

/** Thème sur `<html>` + police « app actu » sur les routes `/mobile`. */
export default function MobileRouteThemeLock() {
  const { theme } = useTheme();
  const { pathname } = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light-mode');
      root.classList.remove('dark-mode');
    } else {
      root.classList.add('dark');
      root.classList.add('dark-mode');
      root.classList.remove('light-mode');
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const onMobile = pathname.startsWith('/mobile');
    if (onMobile) {
      root.classList.add(MOBILE_NEWS_FONT_CLASS);
    } else {
      root.classList.remove(MOBILE_NEWS_FONT_CLASS);
    }
    return () => {
      root.classList.remove(MOBILE_NEWS_FONT_CLASS);
    };
  }, [pathname]);

  return null;
}
