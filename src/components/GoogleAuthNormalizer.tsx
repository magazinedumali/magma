import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

/**
 * Component that normalizes Google OAuth metadata after authentication
 * Ensures that Google profile picture is available in avatar_url field
 * This runs automatically when user signs in via Google OAuth
 */
export const GoogleAuthNormalizer = () => {
  useEffect(() => {
    const normalizeGoogleMetadata = async (user: any) => {
      if (!user) return;

      const metadata = user.user_metadata || {};
      
      // Check if user logged in with Google (has picture but no avatar_url)
      const hasGooglePicture = metadata.picture && !metadata.avatar_url;
      const isGoogleUser = user.app_metadata?.provider === 'google' || 
                          metadata.provider === 'google' ||
                          (metadata.picture && metadata.picture.includes('googleusercontent.com'));
      
      const needsNormalization = hasGooglePicture || 
        (isGoogleUser && metadata.picture && metadata.picture !== metadata.avatar_url);

      if (needsNormalization) {
        // Normalize Google metadata: copy picture to avatar_url if not already set
        const updatedMetadata: any = {
          ...metadata,
        };

        // Copy picture to avatar_url if avatar_url is missing
        if (!updatedMetadata.avatar_url && metadata.picture) {
          updatedMetadata.avatar_url = metadata.picture;
        }

        // Also ensure name is set from full_name if available
        if (!updatedMetadata.name) {
          updatedMetadata.name = metadata.full_name || 
                                 metadata.given_name || 
                                 (metadata.family_name ? `${metadata.given_name || ''} ${metadata.family_name}`.trim() : '') ||
                                 '';
        }

        // Only update if there are actual changes
        const hasChanges = (updatedMetadata.avatar_url !== metadata.avatar_url) || 
                          (updatedMetadata.name !== metadata.name);

        if (hasChanges) {
          try {
            const { data: updateData, error } = await supabase.auth.updateUser({
              data: updatedMetadata
            });
            
            if (error) {
              console.error('Error normalizing Google metadata:', error);
            } else if (updateData?.user) {
              // Force a session refresh to update user data across the app
              // This will trigger onAuthStateChange in all components
              const { data: { session } } = await supabase.auth.getSession();
              if (session) {
                // Trigger a token refresh to ensure all components get updated user data
                await supabase.auth.refreshSession();
              }
            }
          } catch (error) {
            console.error('Error normalizing Google metadata:', error);
          }
        }
      }
    };

    // Normalize on mount if user is already logged in
    const initializeNormalization = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await normalizeGoogleMetadata(session.user);
      }
    };

    initializeNormalization();

    // Also normalize when auth state changes (e.g., after OAuth callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Normalize on sign in (including OAuth callbacks)
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        // Add a small delay to ensure metadata is fully loaded
        setTimeout(() => {
          normalizeGoogleMetadata(session.user);
        }, 500);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null; // This component doesn't render anything
};

export default GoogleAuthNormalizer;

