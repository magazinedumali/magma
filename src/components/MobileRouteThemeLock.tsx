import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Les pages /mobile sont conçues pour le fond #0a0d14 et les classes type text-white.
 * Avec html.light-mode, index.css retinte tout le site en clair et dégrade /mobile.
 * On applique donc toujours dark-mode sur <html> tant qu'on est sous /mobile.
 */
export default function MobileRouteThemeLock() {
  const { pathname } = useLocation();
  const { theme } = useTheme();
  const onMobile = pathname.startsWith('/mobile');

  useEffect(() => {
    const root = document.documentElement;
    if (onMobile) {
      root.classList.remove('light-mode');
      root.classList.add('dark-mode');
      root.classList.add('dark');
    } else {
      if (theme === 'light') {
        root.classList.remove('dark');
        root.classList.add('light-mode');
        root.classList.remove('dark-mode');
      } else {
        root.classList.add('dark');
        root.classList.add('dark-mode');
        root.classList.remove('light-mode');
      }
    }
  }, [onMobile, theme]);

  return null;
}
