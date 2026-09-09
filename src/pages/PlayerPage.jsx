import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Sparkles, Film, CheckCircle2 } from 'lucide-react';
import { resolveVideoUrl } from '../services/api';

export default function PlayerPage({ show, onBack }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [show?._id]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3500);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true));
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    setDuration(videoRef.current.duration || 0);
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
      setIsMuted(newVol === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
    if (!newMuted && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.warn);
    } else {
      document.exitFullscreen().catch(console.warn);
    }
  };

  const changeSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackRate(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '00:00';
    const s = Math.floor(secs);
    const m = Math.floor(s / 60);
    const remainder = s % 60;
    return `${m.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  if (!show) return null;

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      
      {/* Top Back Navigation Bar */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer w-fit shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Catalog</span>
      </button>

      {/* Cinema Theater Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative w-full aspect-video max-h-[75vh] rounded-3xl overflow-hidden bg-black border border-slate-800 shadow-2xl group select-none"
      >
        <video
          ref={videoRef}
          src={resolveVideoUrl(show.fullVideoUrl || show.previewVideoUrl)}
          poster={show.thumbnailUrl}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
          onClick={togglePlay}
          className="w-full h-full object-contain cursor-pointer"
        />

        {/* Top Floating Title Bar */}
        <div
          className={`absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between transition-opacity duration-300 pointer-events-none ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
              High Definition
            </span>
            <h2 className="text-lg md:text-xl font-black text-white truncate drop-shadow">{show.title}</h2>
          </div>
        </div>

        {/* Center Pause/Play Splash */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer"
          >
            <div className="w-20 h-20 rounded-3xl bg-indigo-600/80 backdrop-blur-md flex items-center justify-center text-white shadow-2xl border border-white/20">
              <Play className="w-10 h-10 fill-current ml-1" />
            </div>
          </div>
        )}

        {/* Bottom Custom Controls Bar */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Progress Slider */}
          <div className="space-y-1 mb-3">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
            />
            <div className="flex justify-between text-[11px] font-semibold text-slate-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button
                onClick={() => {
                  if (videoRef.current) videoRef.current.currentTime = Math.max(0, currentTime - 10);
                }}
                title="Rewind 10s"
                className="p-2.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              {/* Volume Slider */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="p-2 text-slate-300 hover:text-white cursor-pointer"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>

            {/* Right Options */}
            <div className="flex items-center gap-3">
              {/* Playback Speed Button */}
              <button
                onClick={changeSpeed}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
              >
                {playbackRate}x
              </button>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Show Details Section */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                {show.category?.replace('_', ' ') || 'TV SERIAL'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{show.duration || '45 mins'}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{show.title}</h1>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">{show.rating || '4.9'}</span>
            <span className="text-xs text-slate-500">/ 5.0 Cinema Rating</span>
          </div>
        </div>

        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-4xl">
          {show.description || 'Full movie description and storyline available in the cinema catalog.'}
        </p>

        {show.genres?.length > 0 && (
          <div className="flex items-center gap-2 pt-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Genres:</span>
            {show.genres.map((g) => (
              <span key={g} className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-300">
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
