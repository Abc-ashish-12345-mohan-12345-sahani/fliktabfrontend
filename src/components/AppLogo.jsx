import React from 'react';

export default function AppLogo({ size = 'md', showText = true, className = '' }) {
  const sizeMap = {
    sm: { box: 'w-8 h-8 rounded-xl', icon: 'w-4 h-4', text: 'text-lg', sub: 'text-[9px]' },
    md: { box: 'w-10 h-10 rounded-xl', icon: 'w-5 h-5', text: 'text-xl', sub: 'text-[10px]' },
    lg: { box: 'w-16 h-16 rounded-2xl', icon: 'w-8 h-8', text: 'text-3xl', sub: 'text-xs' },
    xl: { box: 'w-20 h-20 rounded-3xl', icon: 'w-10 h-10', text: 'text-4xl', sub: 'text-sm' },
  };

  const s = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Glowing Gradient Icon Box */}
      <div
        className={`${s.box} relative bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-white/20 transition-transform duration-300 hover:scale-105`}
      >
        {/* Film reel aperture accents */}
        <div className="absolute top-1.5 left-1.5 w-1 h-1 rounded-full bg-white/70" />
        <div className="absolute bottom-1.5 left-1.5 w-1 h-1 rounded-full bg-white/70" />
        
        {/* Play Glyph */}
        <svg
          className={`${s.icon} text-white fill-current ml-0.5 drop-shadow-md`}
          viewBox="0 0 24 24"
        >
          <path d="M8 5.14v14.72a1 1 0 0 0 1.5.86l11-7.36a1 1 0 0 0 0-1.72l-11-7.36a1 1 0 0 0-1.5.86z" />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <span
            className={`${s.text} font-black tracking-tight bg-gradient-to-r from-white via-indigo-200 to-pink-300 bg-clip-text text-transparent`}
          >
            FlickTap
          </span>
          <div className="flex items-center gap-1.5 -mt-0.5">
            <span
              className={`${s.sub} font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20`}
            >
              Cinema HD
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
