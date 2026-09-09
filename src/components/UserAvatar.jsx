import React, { useState } from 'react';

export default function UserAvatar({ avatarUrl, name = 'User', size = 'md', className = '' }) {
  const [imgError, setImgError] = useState(false);

  const initials = name
    ? name
        .trim()
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const sizeClasses = {
    xs: 'w-7 h-7 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  }[size] || 'w-10 h-10 text-sm';

  const hasImage = Boolean(avatarUrl && avatarUrl.trim().length > 0 && !imgError);

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl overflow-hidden shrink-0 select-none shadow-md transition-all ${sizeClasses} ${className}`}
      style={{
        background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 50%, #EC4899 100%)',
      }}
    >
      {hasImage ? (
        <img
          src={avatarUrl}
          alt={name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-[inherit]"
        />
      ) : (
        <span className="font-black text-white tracking-wider flex items-center justify-center">
          {initials}
        </span>
      )}
    </div>
  );
}
