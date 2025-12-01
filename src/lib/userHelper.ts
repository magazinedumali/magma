// Helper functions for user profile management

/**
 * Get user avatar URL from user metadata or generate a default one
 * Handles Google OAuth and other providers
 * 
 * Google OAuth stores profile picture in 'picture' field
 * This function checks multiple fields to ensure compatibility
 */
export const getUserAvatar = (user: any): string => {
  if (!user) return '/placeholder.svg';

  const metadata = user.user_metadata || {};
  
  // Priority order:
  // 1. avatar_url (standard Supabase field, may be normalized from Google)
  if (metadata.avatar_url) {
    return metadata.avatar_url;
  }
  
  // 2. picture (Google OAuth standard field)
  if (metadata.picture) {
    return metadata.picture;
  }
  
  // 3. avatar (alternative field name)
  if (metadata.avatar) {
    return metadata.avatar;
  }
  
  // 4. Check app_metadata (some providers store it there)
  if (user.app_metadata?.avatar_url) {
    return user.app_metadata.avatar_url;
  }
  
  // Generate a default avatar based on email or name
  if (user.email) {
    const emailName = user.email.split('@')[0];
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(emailName)}&background=4f8cff&color=fff&size=128`;
  }
  
  if (metadata.name || metadata.full_name) {
    const displayName = metadata.name || metadata.full_name;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4f8cff&color=fff&size=128`;
  }
  
  // Fallback to a generic avatar
  return '/placeholder.svg';
};

/**
 * Get user display name from user metadata or email
 */
export const getUserDisplayName = (user: any): string => {
  if (user?.user_metadata?.name) {
    return user.user_metadata.name;
  }
  
  if (user?.user_metadata?.full_name) {
    return user.user_metadata.full_name;
  }
  
  if (user?.email) {
    return user.email.split('@')[0];
  }
  
  return 'Utilisateur';
};

/**
 * Check if an avatar URL is a placeholder
 */
const isPlaceholderAvatar = (avatar: string | null | undefined): boolean => {
  if (!avatar) return true;
  const placeholderPatterns = [
    'randomuser.me',
    'placeholder',
    'placehold.it',
    'via.placeholder',
    'dummyimage.com',
  ];
  return placeholderPatterns.some(pattern => avatar.toLowerCase().includes(pattern));
};

/**
 * Get user information from comment data
 * This handles both old format (author/avatar) and new format (user_id)
 */
export const getCommentUserInfo = (comment: any, userCache?: Map<string, any>): { name: string; avatar: string } => {
  // If comment has user_id and we have user cache, use it
  if (comment.user_id && userCache?.has(comment.user_id)) {
    const user = userCache.get(comment.user_id);
    return {
      name: getUserDisplayName(user),
      avatar: getUserAvatar(user),
    };
  }
  
  // If comment has stored author and avatar, validate the avatar
  if (comment.author) {
    // If avatar exists and is not a placeholder, use it
    if (comment.avatar && !isPlaceholderAvatar(comment.avatar)) {
      return {
        name: comment.author,
        avatar: comment.avatar,
      };
    }
    
    // Generate avatar from author name (real user name)
    // This creates a consistent avatar based on the user's name
    const nameParts = comment.author.trim().split(' ');
    const displayName = comment.author;
    // Use UI Avatars service to generate avatar from name
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4f8cff&color=fff&size=128&bold=true`;
    
    return {
      name: displayName,
      avatar: avatarUrl,
    };
  }
  
  // Fallback - should not happen if data is correct
  return {
    name: 'Utilisateur',
    avatar: '/placeholder.svg',
  };
};

/**
 * Fetch user information by user_id from Supabase Auth
 * Note: This requires admin privileges or a custom function
 */
export const fetchUserById = async (userId: string): Promise<any> => {
  // This would typically require a server-side function or admin API
  // For now, we'll return null and rely on stored data
  // In production, you might want to create a Supabase function that returns user info
  return null;
};

/**
 * Generate initials from a name
 */
export const getInitials = (name: string): string => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

