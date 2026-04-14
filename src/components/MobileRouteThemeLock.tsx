import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const MOBILE_NEWS_FONT_CLASS = 'mobile-news-typography';

/** Police « app actu » sur les routes `/mobile` (thème clair/sombre : `ThemeProvider`). */
export default function MobileRouteThemeLock() {
  const { pathname } = useLocation();

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
