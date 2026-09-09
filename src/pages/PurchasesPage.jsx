import React, { useState, useEffect } from 'react';
import { Bookmark, Play, Film, Sparkles, Lock, ArrowRight } from 'lucide-react';
import ShowCard from '../components/ShowCard';
import { showsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PurchasesPage({ onPlayShow, onExploreHome }) {
  const { user, isAuthenticated } = useAuth();
  const [purchasedShows, setPurchasedShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchasedShows = async () => {
      setLoading(true);
      try {
        const res = await showsApi.getAll();
        const allShows = res.data?.data || res.data?.shows || [];
        const userEmail = user?.email;
        if (userEmail) {
          const unlocked = allShows.filter((s) => s.purchasedUsers?.includes(userEmail));
          setPurchasedShows(unlocked);
        } else {
          setPurchasedShows([]);
        }
      } catch (err) {
        console.error('Failed to load purchases:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchPurchasedShows();
    } else {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mx-auto">
          <Bookmark className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sign In to View Your Library</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Sign in to access your permanently unlocked movies, TV serial episodes, and streaming history.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-indigo-50 via-white to-purple-50 dark:from-indigo-950/60 dark:via-slate-900 dark:to-purple-950/50 border border-indigo-200 dark:border-indigo-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              VIP Library
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">• High Definition Streaming</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            🌟 My Unlocked Library
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-1">
            You have unlocked <span className="text-emerald-600 dark:text-emerald-400 font-bold">{purchasedShows.length} titles</span> for permanent unlimited streaming.
          </p>
        </div>

        <button
          onClick={onExploreHome}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-sm"
        >
          <span>Explore More Shows</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Catalog Grid */}
      {purchasedShows.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {purchasedShows.map((show) => (
            <ShowCard
              key={show._id}
              show={show}
              isPurchased={true}
              onSelect={() => onPlayShow(show)}
            />
          ))}
        </div>
      ) : (
        <div className="p-16 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-lg mx-auto shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Film className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Unlocked Shows Yet</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
              Watch 30-second free teasers on the Home page and unlock your favorite TV serials and movies!
            </p>
          </div>
          <button
            onClick={onExploreHome}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 active:scale-95 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
          >
            Explore Featured Shows
          </button>
        </div>
      )}
    </div>
  );
}
