import React, { useState } from 'react';
import { Play, Film, Flame, Bookmark, UploadCloud, User, Sun, Moon, LogIn, Menu, X, Search, Shield, Star, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AppLogo from './AppLogo';
import UserAvatar from './UserAvatar';
import NotificationsPopover from './NotificationsPopover';

export default function Navbar({ activeTab, setActiveTab, searchQuery, setSearchQuery }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Film },
    ...(isAuthenticated ? [{ id: 'purchases', label: 'My Library', icon: Bookmark }] : []),
    ...(isAdmin ? [{ id: 'upload', label: 'Upload Studio', icon: UploadCloud }] : []),
  ];

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/90 dark:bg-[#0B0F19]/85 border-b border-slate-200 dark:border-slate-800/80 transition-colors shadow-sm dark:shadow-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="cursor-pointer" onClick={() => setActiveTab('home')}>
            <AppLogo size="md" />
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search TV serials, movies, genres..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>

            {/* Notifications Popover */}
            {isAuthenticated && <NotificationsPopover />}

            {/* Auth / Profile Area */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu((prev) => !prev)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
                >
                  <UserAvatar avatarUrl={user?.avatar} name={user?.name} size="sm" />
                  <span className="hidden lg:block text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[100px]">
                    {user?.name?.split(' ')[0]}
                  </span>
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onMouseLeave={() => setShowProfileMenu(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                      <UserAvatar avatarUrl={user?.avatar} name={user?.name} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 truncate">@{user?.username || 'streamer'}</p>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                          {user?.role || 'VIP Streamer'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left transition-colors cursor-pointer"
                    >
                      <User className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                      <span>Account Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('purchases');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left transition-colors cursor-pointer"
                    >
                      <Bookmark className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                      <span>My Unlocked Shows</span>
                    </button>

                    {isAdmin && (
                      <>
                        <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                        <div className="px-4 py-1">
                          <span className="text-[10px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider">
                            Admin Tools
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setActiveTab('admin-users');
                            setShowProfileMenu(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-amber-600 dark:text-amber-300 hover:text-amber-700 dark:hover:text-white hover:bg-amber-50 dark:hover:bg-amber-500/10 text-left transition-colors cursor-pointer"
                        >
                          <Shield className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                          <span>Users & Passwords</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('admin-feedback');
                            setShowProfileMenu(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-amber-600 dark:text-amber-300 hover:text-amber-700 dark:hover:text-white hover:bg-amber-50 dark:hover:bg-amber-500/10 text-left transition-colors cursor-pointer"
                        >
                          <Star className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                          <span>Reviews & Feedback</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('admin-db');
                            setShowProfileMenu(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-cyan-600 dark:text-cyan-300 hover:text-cyan-700 dark:hover:text-white hover:bg-cyan-50 dark:hover:bg-cyan-500/10 text-left transition-colors cursor-pointer"
                        >
                          <Database className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                          <span>Database Structure (D1)</span>
                        </button>
                      </>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                        setActiveTab('login');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-left transition-colors cursor-pointer"
                    >
                      <LogIn className="w-4 h-4 rotate-180" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('login')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 active:scale-95 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 py-3 space-y-1 animate-in slide-in-from-top duration-200">
            {/* Mobile Search */}
            <div className="relative w-full mb-3 px-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search TV serials, movies..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {isAuthenticated && (
              <button
                onClick={() => {
                  setActiveTab('profile');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40'
                }`}
              >
                <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>My Profile</span>
              </button>
            )}

            {isAdmin && (
              <>
                <button
                  onClick={() => {
                    setActiveTab('admin-users');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'admin-users'
                      ? 'bg-amber-600/20 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                      : 'text-amber-600 dark:text-amber-300 hover:text-amber-700 dark:hover:text-white hover:bg-amber-50 dark:hover:bg-amber-500/10'
                  }`}
                >
                  <Shield className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                  <span>Users & Passwords</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('admin-feedback');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'admin-feedback'
                      ? 'bg-amber-600/20 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                      : 'text-amber-600 dark:text-amber-300 hover:text-amber-700 dark:hover:text-white hover:bg-amber-50 dark:hover:bg-amber-500/10'
                  }`}
                >
                  <Star className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                  <span>Reviews & Feedback</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('admin-db');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'admin-db'
                      ? 'bg-cyan-600/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30'
                      : 'text-cyan-600 dark:text-cyan-300 hover:text-cyan-700 dark:hover:text-white hover:bg-cyan-50 dark:hover:bg-cyan-500/10'
                  }`}
                >
                  <Database className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                  <span>Database Structure (D1 SQL)</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
