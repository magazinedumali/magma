import { useLocation } from 'react-router-dom';

/**
 * Hook to detect if we're in admin or superadmin context
 * Returns the base path and whether we're in superadmin mode
 */
export const useAdminContext = () => {
  const location = useLocation();
  const isSuperAdmin = location.pathname.startsWith('/superadmin');
  const basePath = isSuperAdmin ? '/superadmin' : '/admin';
  
  return {
    isSuperAdmin,
    basePath,
    // Helper functions for common navigation paths
    getArticlesPath: () => `${basePath}/articles`,
    getArticleEditPath: (id: string) => `${basePath}/articles/edit/${id}`,
    getArticleCreatePath: () => `${basePath}/articles/nouveau`,
    getCategoriesPath: () => `${basePath}/categories`,
    getMediasPath: () => `${basePath}/medias`,
    getCommentsPath: () => `${basePath}/commentaires`,
    getAlbumsPath: () => `${basePath}/albums`,
    getStoriesPath: () => `${basePath}/stories`,
    getPollsPath: () => `${basePath}/polls`,
    getPagesPath: () => `${basePath}/pages`,
    getVideosPath: () => `${basePath}/videos`,
    getMenuPath: () => `${basePath}/menu`,
    getDashboardPath: () => basePath,
  };
};

