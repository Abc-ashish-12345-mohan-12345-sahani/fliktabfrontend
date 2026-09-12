import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Shield,
  Sparkles,
  Bookmark,
  Trash2,
  LogOut,
  Sun,
  Moon,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Edit3,
  X,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { showsApi } from '../services/api';
import UserAvatar from '../components/UserAvatar';

const AVATAR_PRESETS = [
  { name: 'VIP Cinema Fox', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
  { name: 'Cyber Director', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
  { name: 'Neon Gamer', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80' },
  { name: 'Film Producer', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
  { name: 'Anime Streamer', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80' },
  { name: 'Sci-Fi Astronaut', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80' },
  { name: 'Golden Star', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80' },
  { name: 'Blockbuster Hero', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80' },
];

export default function ProfilePage({ onExploreHome, onOpenPurchases }) {
  const { user, isAuthenticated, isAdmin, updateProfile, deleteAccount, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const [purchasedCount, setPurchasedCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phoneNumber || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Delete Account Confirmation Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const res = await showsApi.getAll();
        const allShows = res.data?.data || res.data?.shows || [];
        const userEmail = user?.email;
        if (userEmail) {
          const unlocked = allShows.filter((s) => s.purchasedUsers?.includes(userEmail));
          setPurchasedCount(unlocked.length);
        }
      } catch (err) {
        console.warn('Failed to load user purchase count:', err);
      }
    };

    if (isAuthenticated && user?.email) {
      fetchPurchases();
    }
  }, [isAuthenticated, user?.email]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateProfile({
        name: editName.trim(),
        phoneNumber: editPhone.trim(),
        avatar: editAvatar.trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setIsEditing(false);
        setSaveSuccess(false);
      }, 1200);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationInput !== 'DELETE') {
      setDeleteError('Please type "DELETE" exactly to confirm.');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteAccount();
      // AuthContext.deleteAccount automatically logs out and clears state
      setShowDeleteModal(false);
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || err.message || 'Failed to delete account'
      );
      setIsDeleting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sign In to View Profile</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Sign in or create an account to view your VIP status, unlocked shows, and account settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* 🌟 1. HERO PROFILE CARD */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-50 via-white to-purple-50 dark:from-indigo-950/70 dark:via-slate-900 dark:to-purple-950/60 border border-indigo-200 dark:border-indigo-500/20 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar with glowing ring */}
            <div className="relative">
              <UserAvatar
                avatarUrl={user?.avatar}
                name={user?.name}
                size="xl"
                className="ring-2 ring-indigo-500/50 shadow-xl shadow-indigo-500/30"
              />
              <span className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-emerald-500 text-white shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* User Meta */}
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">{user?.name}</h1>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                  {user?.role || 'VIP Streamer'}
                </span>
              </div>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">@{user?.username || 'streamer'}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {user?.email}
                </span>
                {user?.phoneNumber && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {user?.phoneNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Edit Profile Button */}
          <button
            onClick={() => {
              setEditName(user?.name || '');
              setEditPhone(user?.phoneNumber || '');
              setIsEditing(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-md"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* 📊 2. METRIC STATS TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={onOpenPurchases}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Unlocked Library</span>
            <Bookmark className="w-4 h-4 text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{purchasedCount} Titles</div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 inline-block">
            Permanent Access
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Account Tier</span>
            <Shield className="w-4 h-4 text-pink-500 dark:text-pink-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white capitalize">{user?.role || 'VIP'}</div>
          <span className="text-[10px] text-pink-600 dark:text-pink-400 font-semibold mt-1 inline-block">
            VIP Streamer Membership
          </span>
        </div>
      </div>

      {/* ⚙️ 3. PREFERENCES & SETTINGS */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 space-y-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Account & App Settings</h3>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {/* Dark / Light Mode Switcher */}
          <div className="py-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {isDarkMode ? <Moon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <span>Appearance Theme</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch between Cinema OLED Dark and Radiant Light mode
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-sm"
            >
              {isDarkMode ? '🌙 Dark Mode (Active)' : '☀️ Light Mode (Active)'}
            </button>
          </div>

          {/* Sign Out Row */}
          <div className="py-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <LogOut className="w-4 h-4 text-slate-400" />
                <span>Session Sign Out</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Log out of FlickTap Cinema on this web browser
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* 🚨 4. DANGER ZONE: PERMANENT ACCOUNT DELETION (HIDDEN FOR ADMINS) */}
      {!isAdmin ? (
        <div className="rounded-3xl bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/20 dark:border-rose-500/30 p-6 md:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold">Danger Zone: Permanent Account Deletion</h3>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl">
            Permanently delete your FlickTap account and remove all personal data, unlocked library purchases, and saved history from our servers. This action is <strong>irreversible</strong> and will also deactivate your credentials for the Flutter Mobile App.
          </p>
          <button
            onClick={() => {
              setDeleteConfirmationInput('');
              setDeleteError('');
              setShowDeleteModal(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Permanently Delete My Account</span>
          </button>
        </div>
      ) : (
        <div className="rounded-3xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 dark:border-amber-500/30 p-6 md:p-8 space-y-2 shadow-sm">
          <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
            <Shield className="w-5 h-5" />
            <h3 className="text-base font-bold">Administrator Account Protected</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            As a <strong>Super Administrator</strong>, this account is protected against direct deletion. You have full access to User Management, Database Structure, and Upload Studio.
          </p>
        </div>
      )}

      {/* ✏️ EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Profile Details</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              {/* Avatar Picker Section */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Profile Avatar</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-normal">Choose preset or custom upload</span>
                </label>

                {/* Preset Avatars Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                  {/* Default Initials */}
                  <button
                    type="button"
                    onClick={() => setEditAvatar('')}
                    className={`p-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      editAvatar === ''
                        ? 'bg-indigo-600/20 border-2 border-indigo-500 scale-105'
                        : 'border border-transparent hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <UserAvatar avatarUrl="" name={editName || 'U'} size="sm" />
                    <span className="text-[9px] text-slate-600 dark:text-slate-300 font-medium">Initials</span>
                  </button>

                  {/* 8 Curated Cinema Presets */}
                  {AVATAR_PRESETS.map((p) => {
                    const isSelected = editAvatar === p.url;
                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => setEditAvatar(p.url)}
                        title={p.name}
                        className={`p-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600/20 border-2 border-indigo-500 scale-105'
                            : 'border border-transparent hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <UserAvatar avatarUrl={p.url} name={p.name} size="sm" />
                        <span className="text-[9px] text-slate-600 dark:text-slate-300 truncate max-w-[48px]">
                          {p.name.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Upload from Device */}
                <div className="pt-1 flex items-center justify-between">
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 text-xs font-bold cursor-pointer transition-colors">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Upload Image from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (reader.result) {
                              setEditAvatar(reader.result.toString());
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  {editAvatar && (
                    <button
                      type="button"
                      onClick={() => setEditAvatar('')}
                      className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-semibold cursor-pointer"
                    >
                      Reset to Initials
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-xs font-bold text-white shadow-md shadow-indigo-500/20 cursor-pointer flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ⚠️ DELETE ACCOUNT CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-rose-500/40 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Permanently Delete Account?</h3>
                <p className="text-xs text-rose-500 dark:text-rose-400">Warning: This cannot be undone!</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Deleting your account will remove your user profile, purge all unlocked movies and TV serials from your account, and delete your database credentials across both the Web and Mobile apps.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Type <span className="text-rose-500 font-mono">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationInput}
                onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                placeholder="Type DELETE"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmationInput !== 'DELETE'}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-xs font-bold text-white shadow-lg shadow-rose-600/30 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
