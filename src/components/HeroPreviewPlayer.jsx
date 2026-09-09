import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Sparkles, Lock, Maximize2, ShieldAlert } from 'lucide-react';
import { resolveVideoUrl } from '../services/api';

export default function HeroPreviewPlayer({ show, isPurchased, onUnlockClick, onPlayFullClick }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [previewEnded, setPreviewEnded] = useState(false);

  const previewDuration = show?.previewDurationSeconds || 30;

  useEffect(() => {
    // Reset video state when active show changes without auto-playing
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
      setPreviewEnded(false);
    }
  }, [show?._id]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    // Enforce 30s preview limit for non-purchased users
    if (!isPurchased && time >= previewDuration) {
      videoRef.current.pause();
      setIsPlaying(false);
      setPreviewEnded(true);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (previewEnded && !isPurchased) {
      onUnlockClick();
      return;
    }

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(console.warn);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatTime = (secs) => {
    const s = Math.floor(secs);
    const m = Math.floor(s / 60);
    const remainder = s % 60;
    return `${m.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min((currentTime / previewDuration) * 100, 100);

  if (!show) return null;

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl group">
      
      {/* Aspect Ratio Container (16:9 Cinema) */}
      <div className="relative aspect-[16/9] md:aspect-[21/9] w-full max-h-[520px] overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={resolveVideoUrl(show.previewVideoUrl || show.fullVideoUrl)}
          poster={show.thumbnailUrl}
          playsInline
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => {
            setIsPlaying(false);
            setPreviewEnded(true);
          }}
          className="w-full h-full object-cover"
        />

        {/* Cinematic Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-indigo-600 to-pink-600 text-white shadow-lg shadow-indigo-500/30">
              {show.category || 'Featured HD'}
            </span>
            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-black/60 backdrop-blur-md text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>★ {show.rating || '4.9'}</span>
            </span>
          </div>

          {/* Live Preview / Unlocked Badge */}
          {isPurchased ? (
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
              ✓ Unlocked Full HD
            </span>
          ) : (
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 backdrop-blur-md animate-pulse">
              ⚡ Free 30s Preview
            </span>
          )}
        </div>

        {/* Preview Expired Lock Screen Overlay */}
        {previewEnded && !isPurchased && (
          <div className="absolute inset-0 z-20 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-600 to-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/50 mb-4 animate-bounce">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white">Preview Reached 30s Limit</h3>
            <p className="text-sm text-slate-300 max-w-md mt-2 mb-6">
              Unlock the complete <span className="text-white font-bold">{show.title}</span> in High Definition with immersive spatial audio.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={onUnlockClick}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 active:scale-95 text-white font-bold text-sm shadow-xl shadow-pink-500/30 transition-all cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Unlock for ₹{show.priceBuy || 199}</span>
              </button>
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    setPreviewEnded(false);
                    videoRef.current.play().then(() => setIsPlaying(true));
                  }
                }}
                className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all cursor-pointer"
              >
                Replay Teaser
              </button>
            </div>
          </div>
        )}

        {/* Bottom Hero Info & Live Controls Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col justify-end pointer-events-auto">
          
          <div className="max-w-2xl">
            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-none mb-2 drop-shadow-lg">
              {show.title}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 line-clamp-2 max-w-xl drop-shadow mb-4">
              {show.description || 'Experience this cinematic masterpiece in high-definition streaming.'}
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {isPurchased ? (
                <button
                  onClick={onPlayFullClick}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Watch Full Movie</span>
                </button>
              ) : (
                <button
                  onClick={onUnlockClick}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 active:scale-95 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Unlock Full Show (₹{show.priceBuy || 199})</span>
                </button>
              )}

              {/* Play/Pause Button */}
              <button
                onClick={togglePlay}
                className="p-3 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-all cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              {/* Mute Button */}
              <button
                onClick={toggleMute}
                className="p-3 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-all cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Live Progress Bar & Timer */}
          <div className="mt-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                {formatTime(currentTime)} / {formatTime(previewDuration)}
              </span>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider">
                {isPurchased ? 'Full Video Streaming' : '30-Sec Preview Limit'}
              </span>
            </div>

            {/* Glowing Progress Bar Track */}
            <div className="relative w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden backdrop-blur">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-150 shadow-[0_0_12px_rgba(99,102,241,0.8)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
