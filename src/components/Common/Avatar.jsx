// src/components/Common/Avatar.jsx
import React from 'react';

/**
 * Reusable Avatar Component
 * Displays user avatar with image or fallback to initials
 */
const Avatar = ({ 
  user, 
  size = 'md', 
  className = '',
  showBorder = true 
}) => {
  // Map size to pixel dimensions
  const sizeMap = {
    sm: { width: 32, height: 32, textSize: 'text-xs' },
    md: { width: 40, height: 40, textSize: 'text-sm' },
    lg: { width: 56, height: 56, textSize: 'text-base' },
    xl: { width: 80, height: 80, textSize: 'text-xl' },
  };

  const { width, height, textSize } = sizeMap[size] || sizeMap.md;

  // Get initials from user name
  const getInitials = () => {
    if (!user) return '?';
    const firstInitial = user.first_name?.charAt(0) || '';
    const lastInitial = user.last_name?.charAt(0) || '';
    return `${firstInitial}${lastInitial}`.toUpperCase() || '?';
  };

  // Get avatar URL from profile_image_url, profile_image or storage
  const getAvatarUrl = () => {
    let imageUrl = user?.profile_image_url || user?.profile_image
    if (!imageUrl) return null;

    // If it's a full http(s) URL, data URL or blob URL, return as-is
    if (
      imageUrl.startsWith('http') ||
      imageUrl.startsWith('data:') ||
      imageUrl.startsWith('blob:')
    ) {
      // Add cache-busting parameter for http URLs to ensure fresh images
      if (imageUrl.startsWith('http') && user?.id) {
        const separator = imageUrl.includes('?') ? '&' : '?'
        return `${imageUrl}${separator}uid=${user.id}`
      }
      return imageUrl;
    }

    // If already an absolute path (starts with '/'), return it as-is with cache-busting
    if (imageUrl.startsWith('/')) {
      const separator = imageUrl.includes('?') ? '&' : '?'
      return `${imageUrl}${separator}uid=${user?.id || 'guest'}`;
    }

    // If it already starts with 'storage/', prefix with '/'
    if (imageUrl.startsWith('storage/')) {
      const path = `/${imageUrl}`
      const separator = path.includes('?') ? '&' : '?'
      return `${path}${separator}uid=${user?.id || 'guest'}`;
    }

    // Otherwise assume it's a storage path and prefix accordingly
    const path = `/storage/${imageUrl}`
    const separator = path.includes('?') ? '&' : '?'
    return `${path}${separator}uid=${user?.id || 'guest'}`;
  };

  const avatarUrl = getAvatarUrl();
  const borderClass = showBorder ? 'ring-2 ring-[var(--app-surface)]' : '';
  const isDev = import.meta.env.DEV;
 
  // ✅ Debug log
  if (isDev && avatarUrl) {
    console.log('🖼️ Avatar rendering:', {
      userId: user?.id,
      firstName: user?.first_name,
      lastName: user?.last_name,
      profileImage: user?.profile_image,
      profileImageUrl: user?.profile_image_url,
      computedUrl: avatarUrl
    });
  }

  return (
    <div
      className={`
        flex-shrink-0 rounded-full flex items-center justify-center 
        bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-primary-hover)]
        text-white font-bold shadow-sm transition-transform
        group-hover:scale-105 ${borderClass} ${className}
      `}
      style={{ 
        width: `${width}px`, 
        height: `${height}px` 
      }}
      title={user ? `${user.first_name} ${user.last_name}` : 'Avatar'}
    >
      {avatarUrl ? (
        <img
          key={avatarUrl}
          src={avatarUrl}
          alt={`${user?.first_name || ''} ${user?.last_name || ''}`}
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            // ✅ Debug: Log image loading error
            console.warn('⚠️ Avatar image failed to load:', {
              url: e.target.src,
              error: e.target.error
            });
            // Fallback to initials if image fails to load
            e.target.style.display = 'none';
            if (e.target.nextSibling) {
              e.target.nextSibling.style.display = 'flex';
            }
          }}
          onLoad={() => {
            // ✅ Debug: Log successful image load
            if (isDev) {
              console.log('✅ Avatar image loaded successfully:', avatarUrl);
            }
          }}
        />
      ) : null}
      
      {/* Fallback to initials */}
      <div
        className={`${textSize} font-bold flex items-center justify-center w-full h-full`}
        style={{ display: avatarUrl ? 'none' : 'flex' }}
      >
        {getInitials()}
      </div>
    </div>
  );
};

export default Avatar;
