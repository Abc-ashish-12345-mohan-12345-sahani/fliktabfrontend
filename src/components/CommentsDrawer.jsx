import React, { useState } from 'react';
import { X, Send, Heart, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CommentsDrawer({ reel, onClose }) {
  const { user, isAuthenticated } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    {
      id: 1,
      user: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      text: 'The streaming quality and smooth audio on FlickTap is unbelievable! 🔥',
      time: '2h ago',
      likes: 24,
    },
    {
      id: 2,
      user: 'Rahul Verma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      text: 'Loved the historical serial episode teaser. Unlocked the full version right away!',
      time: '4h ago',
      likes: 18,
    },
    {
      id: 3,
      user: 'Ananya Roy',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      text: 'Next-level cinema UI. Cleanest streaming web experience ever ✨',
      time: '6h ago',
      likes: 9,
    },
  ]);

  if (!reel) return null;

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now(),
      user: user?.name || 'FlickTap Streamer',
      avatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      text: commentText.trim(),
      time: 'Just now',
      likes: 0,
    };

    setComments([newComment, ...comments]);
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-[80vh] max-h-[600px] rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Comments ({comments.length})</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3 text-xs">
              <img
                src={c.avatar}
                alt={c.user}
                className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-slate-200">{c.user}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{c.time}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{c.text}</p>
              </div>
              <button className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-pink-500 self-start pt-1 cursor-pointer">
                <Heart className="w-3.5 h-3.5" />
                <span className="text-[10px]">{c.likes > 0 ? c.likes : ''}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Add Comment Input Bar */}
        <form onSubmit={handleAddComment} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={isAuthenticated ? "Add a comment as " + user?.name?.split(' ')[0] + "..." : "Add a public comment..."}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white disabled:opacity-40 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
