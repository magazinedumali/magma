/**
 * Get the correct redirect URL for OAuth callbacks
 * This ensures production URLs are used correctly
 */
export const getOAuthRedirectUrl = (): string => {
  // Check if we have an explicit production URL in environment variables
  const productionUrl = import.meta.env.VITE_SITE_URL || import.meta.env.VITE_PRODUCTION_URL;
  
  if (productionUrl) {
    return `${productionUrl}/`;
  }

  // Detect production environment by hostname
  const hostname = window.location.hostname;
  
  // Production domains
  if (hostname === 'lemagazinedumali.com' || hostname === 'www.lemagazinedumali.com') {
    return 'https://lemagazinedumali.com/';
  }

  // For local development or other environments, use current origin
  // This handles localhost, staging, etc.
  return `${window.location.origin}/`;
};

