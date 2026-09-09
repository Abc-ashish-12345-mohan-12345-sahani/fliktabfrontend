import React, { useState } from 'react';
import { X, Copy, Check, Share2, Send } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';

export default function ShareModal({ item, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const shareUrl = window.location.origin + '?share=' + (item._id || item.id || 'stream');

  const handleCopy = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Share Video</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 truncate">
          {item.title || item.caption || 'Watch this video on FlickTap'}
        </p>

        {/* Copy Link Input Bar */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 mb-4">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent text-xs text-slate-600 dark:text-slate-400 px-2 focus:outline-none truncate"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-xs font-semibold text-white flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Share apps row */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
          {['WhatsApp', 'Telegram', 'Twitter', 'Direct'].map((name) => (
            <button
              key={name}
              onClick={handleCopy}
              className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-pink-600 flex items-center justify-center text-white shadow-md text-xs font-bold">
                {name[0]}
              </div>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">{name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
