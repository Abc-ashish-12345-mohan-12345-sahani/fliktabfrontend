import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { showsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PurchaseModal({ show, onClose, onPurchased, onOpenLogin }) {
  const { user, isAuthenticated } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!show) return null;

  const unlockPrice = show.priceBuy || show.price || 199;

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      onClose();
      onOpenLogin();
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      await showsApi.purchase(show._id, {
        plan: 'buy',
        email: user.email,
        price: unlockPrice,
      });

      // Trigger Cinema Confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366F1', '#EC4899', '#10B981', '#F59E0B'],
      });

      onPurchased(show._id);
      onClose();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Transaction failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header Media Backdrop */}
        <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
          <img
            src={show.thumbnailUrl}
            alt={show.title}
            className="w-full h-full object-cover opacity-60 blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

          <div className="absolute bottom-4 left-6 right-6 flex items-end gap-4">
            <img
              src={show.thumbnailUrl}
              alt={show.title}
              className="w-20 h-28 object-cover rounded-xl shadow-2xl border border-white/20 shrink-0"
            />
            <div className="min-w-0">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
                {show.category || 'Cinema'}
              </span>
              <h3 className="text-lg font-bold text-white truncate mt-1">{show.title}</h3>
              <p className="text-xs text-slate-200">{show.duration || '45 mins'} • High Definition</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
            {show.description || 'Unlock full-length unlimited streaming access in high-definition video across all your devices.'}
          </p>

          {/* Pricing Highlight Card */}
          <div className="relative p-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-50 via-purple-50/50 to-pink-50/30 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/30">
            <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-pink-500 to-indigo-500 text-white shadow-md">
              Lifetime Access
            </span>

            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Full Show Unlock</span>
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹{unlockPrice}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">One-time payment • Watch forever</p>
              </div>

              <div className="text-right space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1 justify-end font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>1080p HD Video</span>
                </div>
                <div className="flex items-center gap-1 justify-end font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>All Devices Sync</span>
                </div>
              </div>
            </div>
          </div>

          {errorMessage && (
            <p className="text-xs text-rose-700 dark:text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
              {errorMessage}
            </p>
          )}

          {/* Guarantee Badges */}
          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secure Checkout</span>
            <span>•</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" /> Instant Playback</span>
          </div>

          {/* Action Button */}
          <button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 active:scale-98 font-bold text-white shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 cursor-pointer text-sm"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Unlocking Full Access...</span>
              </>
            ) : (
              <>
                <span>{isAuthenticated ? `Unlock Now for ₹${unlockPrice}` : 'Sign In to Unlock'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
