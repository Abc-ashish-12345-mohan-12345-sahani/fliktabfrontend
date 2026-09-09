import React from 'react';
import { Play, Sparkles, CheckCircle2, Lock } from 'lucide-react';

export default function ShowCard({ show, isPurchased, onSelect, onUnlock }) {
  return (
    <div
      onClick={() => onSelect(show)}
      className="group relative rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer flex flex-col"
    >
      {/* Poster Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-950">
        <img
          src={show.thumbnailUrl}
          alt={show.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=60';
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
            HD
          </span>

          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 backdrop-blur-md text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            <span>{show.rating || '4.9'}</span>
          </span>
        </div>

        {/* Center Hover Play Icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-pink-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/40 transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </div>
        </div>

        {/* Bottom Unlocked / Price Tag */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
          {isPurchased ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Unlocked</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
              <Lock className="w-3 h-3 text-indigo-400" />
              <span>₹{show.priceBuy || 199}</span>
            </span>
          )}

          <span className="text-[10px] font-medium text-slate-300 bg-black/50 px-1.5 py-0.5 rounded backdrop-blur">
            {show.duration || '45 mins'}
          </span>
        </div>
      </div>

      {/* Info Content */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-0.5 truncate">
            {show.category?.replace('_', ' ') || 'TV SERIAL'}
          </span>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
            {show.title}
          </h4>
        </div>

        {show.genres?.length > 0 && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1">
            {show.genres.join(' • ')}
          </p>
        )}
      </div>
    </div>
  );
}
