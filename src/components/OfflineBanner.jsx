import React from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { useConnectivity } from '../context/ConnectivityContext';

export default function OfflineBanner() {
  const { isOnline, showRestored, isReconnecting, checkConnection } = useConnectivity();

  const isVisible = !isOnline || showRestored;

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-5 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div
        className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all duration-300 max-w-md w-full ${
          showRestored
            ? 'bg-gradient-to-r from-emerald-950/90 to-emerald-800/90 border-emerald-500/40 text-emerald-100 shadow-emerald-950/50'
            : 'bg-gradient-to-r from-red-950/95 to-rose-900/95 border-red-500/40 text-white shadow-red-950/60'
        }`}
      >
        <div
          className={`p-2 rounded-xl flex items-center justify-center ${
            showRestored ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
          }`}
        >
          {showRestored ? (
            <Wifi className="w-5 h-5 animate-pulse" />
          ) : (
            <WifiOff className="w-5 h-5 animate-bounce" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold tracking-tight">
            {showRestored ? 'Back online' : 'No internet connection'}
          </p>
          <p className="text-xs text-white/80 truncate">
            {showRestored
              ? 'Connection restored'
              : 'Please check your network settings'}
          </p>
        </div>

        {!isOnline && (
          <button
            onClick={checkConnection}
            disabled={isReconnecting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-xs font-semibold text-white transition-all duration-200 disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReconnecting ? 'animate-spin' : ''}`} />
            <span>{isReconnecting ? 'Retrying...' : 'Retry'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
