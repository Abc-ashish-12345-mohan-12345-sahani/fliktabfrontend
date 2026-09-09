import React, { useState, useEffect } from 'react';
import { Flame, Loader2, Sparkles } from 'lucide-react';
import ReelCard from '../components/ReelCard';
import CommentsDrawer from '../components/CommentsDrawer';
import ShareModal from '../components/ShareModal';
import { reelsApi } from '../services/api';

export default function ReelsPage() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [activeCommentsReel, setActiveCommentsReel] = useState(null);
  const [activeShareReel, setActiveShareReel] = useState(null);

  useEffect(() => {
    const fetchReels = async () => {
      setLoading(true);
      try {
        const res = await reelsApi.getAll();
        setReels(res.data?.reels || []);
      } catch (err) {
        console.error('Failed to load reels:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReels();
  }, []);

  return (
    <div className="relative w-full min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center pb-12">
      
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-indigo-600 dark:text-indigo-400">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Loading High-Energy Reels...</p>
        </div>
      ) : reels.length > 0 ? (
        <div className="w-full max-w-md space-y-8 reel-container overflow-y-auto no-scrollbar py-2">
          {reels.map((reel) => (
            <ReelCard
              key={reel._id}
              reel={reel}
              isMuted={isMuted}
              onToggleMute={() => setIsMuted((prev) => !prev)}
              onOpenComments={(r) => setActiveCommentsReel(r)}
              onOpenShare={(r) => setActiveShareReel(r)}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 max-w-md shadow-xl">
          <Flame className="w-10 h-10 text-pink-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Reels Available</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Check back soon or upload new streaming short videos in the Upload Studio.
          </p>
        </div>
      )}

      {/* Comments Drawer */}
      {activeCommentsReel && (
        <CommentsDrawer
          reel={activeCommentsReel}
          onClose={() => setActiveCommentsReel(null)}
        />
      )}

      {/* Share Modal */}
      {activeShareReel && (
        <ShareModal
          item={activeShareReel}
          onClose={() => setActiveShareReel(null)}
        />
      )}
    </div>
  );
}
