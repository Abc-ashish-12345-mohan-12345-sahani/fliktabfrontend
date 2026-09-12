import React from 'react';
import { Film, Flame, Bookmark, UploadCloud, User, Sparkles, Shield, Star, MessageSquare, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user, isAuthenticated, isAdmin } = useAuth();

  const mainLinks = [
    { id: 'home', label: 'Home Feed', icon: Film, badge: 'HD' },
    ...(isAuthenticated ? [{ id: 'purchases', label: 'My Library', icon: Bookmark }] : []),
    ...(isAdmin ? [{ id: 'upload', label: 'Upload Studio', icon: UploadCloud }] : []),
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-[calc(100vh-4rem)] border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0B0F19]/90 p-4 space-y-6 transition-colors duration-200">
      
      {/* Quick Streamer Badge Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-500/20 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-pink-500 text-white shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">FlickTap VIP</h4>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-300">High-Definition Streaming</p>
          </div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <div className="space-y-1.5">
        <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Discover
        </p>

        {mainLinks.map((link) => {
          const Icon = link.icon;
          const isActive = activeTab === link.id;

          return (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </div>
              {link.badge && (
                <span
                  className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                    isActive ? 'bg-white/25 text-white' : 'bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30'
                  }`}
                >
                  {link.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Admin Console Section (Only for Admins) */}
      {isAdmin && (
        <div className="space-y-1.5 pt-4 border-t border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Admin Console
            </p>
            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[9px] font-black border border-amber-500/30">
              PRO
            </span>
          </div>

          {/* In-App Users & Passwords Tab */}
          <button
            onClick={() => setActiveTab('admin-users')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'admin-users'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-amber-800 dark:text-amber-200 hover:text-amber-950 dark:hover:text-white hover:bg-amber-500/10 border border-amber-500/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <Shield className={`w-4 h-4 ${activeTab === 'admin-users' ? 'text-white' : 'text-amber-500 dark:text-amber-400'}`} />
              <span>Users & Passwords</span>
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300">
              Users
            </span>
          </button>

          {/* User Reviews & Feedback Tab */}
          <button
            onClick={() => setActiveTab('admin-feedback')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'admin-feedback'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-amber-800 dark:text-amber-200 hover:text-amber-950 dark:hover:text-white hover:bg-amber-500/10 border border-amber-500/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <Star className={`w-4 h-4 ${activeTab === 'admin-feedback' ? 'text-white' : 'text-amber-500 dark:text-amber-400'}`} />
              <span>Reviews & Feedback</span>
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300">
              Ratings
            </span>
          </button>

          {/* Database Structure & Schema Tab */}
          <button
            onClick={() => setActiveTab('admin-db')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'admin-db'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-cyan-800 dark:text-cyan-200 hover:text-cyan-950 dark:hover:text-white hover:bg-cyan-500/10 border border-cyan-500/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <Database className={`w-4 h-4 ${activeTab === 'admin-db' ? 'text-white' : 'text-cyan-500 dark:text-cyan-400'}`} />
              <span>Database Structure</span>
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-700 dark:text-cyan-300">
              D1 SQL
            </span>
          </button>
        </div>
      )}

      {/* Profile & Account Links */}
      <div className="space-y-1.5 pt-4 border-t border-slate-200 dark:border-slate-800/80">
        <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Account
        </p>

        {isAuthenticated ? (
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            <User className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <span className="truncate">My Profile ({user?.name?.split(' ')[0]})</span>
          </button>
        ) : (
          <button
            onClick={() => setActiveTab('login')}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
          >
            <User className="w-4 h-4 text-slate-400" />
            <span>Sign In / Register</span>
          </button>
        )}
      </div>

      {/* Admin Quick Link */}
      {isAdmin && (
        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800/80">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center gap-2.5 text-xs">
            <Shield className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
            <span className="font-semibold">Admin Mode Active</span>
          </div>
        </div>
      )}
    </aside>
  );
}
