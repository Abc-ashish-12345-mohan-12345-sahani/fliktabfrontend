import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Music2, CheckCircle2, Volume2, VolumeX, Play } from 'lucide-react';
import { reelsApi } from '../services/api';

export default function ReelCard({ reel, onOpenComments, onOpenShare, isMuted, onToggleMute }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(reel.likesCount || 0);
  const [heartBursts, setHeartBursts] = useState([]);

  useEffect(() => {
    // Observer to auto-play video when in center of viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        } else {
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.65 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLike = async () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikesCount((prev) => (newLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await reelsApi.like(reel._id);
    } catch (_) {}
  };

  const handleDoubleTap = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newId = Date.now();
    setHeartBursts((prev) => [...prev, { id: newId, x, y }]);
    setTimeout(() => {
      setHeartBursts((prev) => prev.filter((h) => h.id !== newId));
    }, 900);

    if (!isLiked) {
      handleLike();
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(console.warn);
    }
  };

  return (
    <div className="relative w-full max-w-[420px] h-[calc(100vh-6rem)] max-h-[820px] rounded-3xl overflow-hidden bg-black border border-slate-800 shadow-2xl reel-item mx-auto select-none">
      
      {/* Video Element */}
      <video
        ref={videoRef}
        src={reel.videoUrl}
        poster={reel.thumbnailUrl}
        loop
        playsInline
        muted={isMuted}
        onClick={togglePlay}
        onDoubleClick={handleDoubleTap}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* Floating Heart Burst Animations */}
      {heartBursts.map((h) => (
        <div
          key={h.id}
          style={{ left: h.x, top: h.y }}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-ping duration-700"
        >
          <Heart className="w-20 h-20 text-pink-500 fill-pink-500 drop-shadow-[0_0_20px_rgba(236,72,153,0.8)]" />
        </div>
      ))}

      {/* Top Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
        <span className="px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-black/50 backdrop-blur-md text-white border border-white/10">
          FlickTap Reel
        </span>

        <button
          onClick={onToggleMute}
          className="p-2.5 rounded-2xl bg-black/50 hover:bg-black/70 backdrop-blur-md text-white pointer-events-auto transition-all cursor-pointer border border-white/10"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Center Play indicator if paused */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] z-10 cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-2xl border border-white/30">
            <Play className="w-8 h-8 fill-current ml-1" />
          </div>
        </div>
      )}

      {/* Bottom Info & Creator Section */}
      <div className="absolute bottom-0 left-0 right-16 p-5 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
        
        {/* Creator Info */}
        <div className="flex items-center gap-3 mb-2 pointer-events-auto">
          <div className="w-10 h-10 rounded-full ring-2 ring-indigo-500 overflow-hidden bg-slate-800 shrink-0">
            <img
              src={reel.creator?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
              alt={reel.creator?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white leading-none">{reel.creator?.name || 'Creator'}</span>
              {reel.creator?.isVerified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 fill-indigo-500/20" />
              )}
            </div>
            <span className="text-xs text-indigo-300">{reel.creator?.username || '@creator'}</span>
          </div>
        </div>

        {/* Caption */}
        <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed mb-2 pointer-events-auto">
          {reel.title || reel.caption}
        </p>

        {/* Music Sound Pill */}
        <div className="flex items-center gap-2 text-[11px] text-slate-300 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full w-fit pointer-events-auto">
          <Music2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
          <span className="truncate max-w-[200px]">{reel.musicName || 'Original Soundtrack • FlickTap'}</span>
        </div>
      </div>

      {/* Right Social Actions Column */}
      <div className="absolute bottom-6 right-3 z-20 flex flex-col items-center gap-4">
        
        {/* Like Button */}
        <button
          onClick={handleLike}
          className="flex flex-col items-center gap-1 group/btn cursor-pointer"
        >
          <div
            className={`p-3 rounded-full backdrop-blur-md border transition-all active:scale-125 ${
              isLiked
                ? 'bg-pink-600/30 border-pink-500/50 text-pink-500'
                : 'bg-black/50 border-white/10 text-white hover:bg-black/70'
            }`}
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-pink-500' : ''}`} />
          </div>
          <span className="text-[11px] font-bold text-white drop-shadow">{likesCount}</span>
        </button>

        {/* Comments Button */}
        <button
          onClick={() => onOpenComments(reel)}
          className="flex flex-col items-center gap-1 group/btn cursor-pointer"
        >
          <div className="p-3 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/10 text-white transition-all active:scale-110">
            <MessageCircle className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold text-white drop-shadow">{reel.commentsCount || 12}</span>
        </button>

        {/* Share Button */}
        <button
          onClick={() => onOpenShare(reel)}
          className="flex flex-col items-center gap-1 group/btn cursor-pointer"
        >
          <div className="p-3 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/10 text-white transition-all active:scale-110">
            <Share2 className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold text-white drop-shadow">{reel.sharesCount || 6}</span>
        </button>

        {/* Spinning Vinyl Audio Disc */}
        <div className="w-10 h-10 rounded-full border-2 border-slate-700 bg-slate-900 flex items-center justify-center shadow-lg animate-[spin_4s_linear_infinite] mt-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 border border-black" />
        </div>
      </div>
    </div>
  );
}
