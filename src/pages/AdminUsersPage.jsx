import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Database,
  Search,
  RefreshCw,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  Lock,
  Sparkles,
  UserCheck,
  UserX,
  Copy,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Bell,
  Send,
  MessageSquare,
  Radio,
  Star,
  ThumbsUp,
  Bug,
  Lightbulb,
  Palette,
  Plus,
  Filter,
  MessageCircle,
  X,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi, showsApi, notificationApi, feedbackApi } from '../services/api';
import { copyToClipboard as clipboardCopy } from '../utils/clipboard';
import { maskPhoneNumber, maskEmail } from '../utils/sanitize';

export default function AdminUsersPage({ onExploreHome, initialTab = 'users' }) {
  const { user: currentUser, isAdmin } = useAuth();
  
  // Tab State: 'users' | 'reviews' | 'stats'
  const [adminTab, setAdminTab] = useState(initialTab || 'users');

  // Users State
  const [users, setUsers] = useState([]);
  const [dbStats, setDbStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedUsername, setCopiedUsername] = useState('');
  const [copiedEmail, setCopiedEmail] = useState('');
  const [copiedPhone, setCopiedPhone] = useState('');
  const [copiedPassword, setCopiedPassword] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const [maskSensitiveData, setMaskSensitiveData] = useState(false);

  // Delete User Modal State
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notification Modal State
  const [notificationTarget, setNotificationTarget] = useState(null);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('admin');
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [quickSendingId, setQuickSendingId] = useState(null);

  // 🌟 Reviews & Feedback State
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState({
    totalFeedbacks: 0,
    averageRating: 5.0,
    ratingsCount: 0,
    bugReportsCount: 0,
    featureRequestsCount: 0,
  });
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState('all');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState('all');
  const [feedbackSearch, setFeedbackSearch] = useState('');
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);
  const [isDeletingFeedback, setIsDeletingFeedback] = useState(false);
  const [updatingFeedbackId, setUpdatingFeedbackId] = useState(null);

  // Test Review Modal State
  const [showTestFeedbackModal, setShowTestFeedbackModal] = useState(false);
  const [testRating, setTestRating] = useState(5);
  const [testCategory, setTestCategory] = useState('App Rating & Review');
  const [testMessage, setTestMessage] = useState('');
  const [testName, setTestName] = useState('Ashutosh Mohan');
  const [testEmail, setTestEmail] = useState('mohanashish708090@gmail.com');
  const [isSubmittingTestFeedback, setIsSubmittingTestFeedback] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setAdminTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    fetchUsersAndStats();
    fetchFeedbacksAndStats();
  }, [isAdmin]);

  const fetchUsersAndStats = async () => {
    setIsLoading(true);
    setError('');
    try {
      // 1. Fetch all users from REST API
      const res = await authApi.getAllUsers();
      if (res.data?.users) {
        setUsers(res.data.users);
      }

      // 2. Fetch full DB stats
      try {
        const statsRes = await showsApi.getDatabaseStats();
        if (statsRes.data) {
          setDbStats(statsRes.data);
        }
      } catch (e) {
        // Optional stats fetch
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load database users');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeedbacksAndStats = async () => {
    setIsFeedbackLoading(true);
    try {
      const res = await feedbackApi.getAll();
      if (res.data?.data) {
        setFeedbacks(res.data.data);
      }
      if (res.data?.stats) {
        setFeedbackStats(res.data.stats);
      }
    } catch (err) {
      console.warn('Failed to load user feedback:', err.message);
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  const handleUpdateFeedbackStatus = async (feedbackId, targetStatus) => {
    setUpdatingFeedbackId(feedbackId);
    try {
      const res = await feedbackApi.updateStatus(feedbackId, targetStatus);
      if (res.data?.success) {
        setSuccessMsg(`Feedback marked as ${targetStatus}!`);
        setFeedbacks((prev) =>
          prev.map((f) => (f._id === feedbackId ? { ...f, status: targetStatus } : f))
        );
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update feedback status');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUpdatingFeedbackId(null);
    }
  };

  const handleDeleteFeedback = async () => {
    if (!feedbackToDelete) return;
    setIsDeletingFeedback(true);
    try {
      await feedbackApi.delete(feedbackToDelete._id);
      setSuccessMsg('Review / Feedback removed successfully');
      setFeedbacks((prev) => prev.filter((f) => f._id !== feedbackToDelete._id));
      setFeedbackToDelete(null);
      await fetchFeedbacksAndStats();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete feedback');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsDeletingFeedback(false);
    }
  };

  const handleTestSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!testMessage.trim() && !testRating) return;

    setIsSubmittingTestFeedback(true);
    try {
      await feedbackApi.submit({
        name: testName.trim() || 'Anonymous Reviewer',
        email: testEmail.trim() || 'user@example.com',
        rating: testRating,
        category: testCategory,
        message: testMessage.trim(),
        deviceInfo: 'Web Admin Console Test',
      });
      setSuccessMsg('🎉 Test review submitted successfully!');
      setShowTestFeedbackModal(false);
      setTestMessage('');
      await fetchFeedbacksAndStats();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit test feedback');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsSubmittingTestFeedback(false);
    }
  };

  const handleCopyUsername = async (username, userId) => {
    const success = await clipboardCopy(username);
    if (success) {
      setCopiedUsername(userId);
      setTimeout(() => setCopiedUsername(''), 2000);
    }
  };

  const handleCopyEmail = async (email, userId) => {
    const success = await clipboardCopy(email);
    if (success) {
      setCopiedEmail(userId);
      setTimeout(() => setCopiedEmail(''), 2000);
    }
  };

  const handleCopyPhone = async (phone, userId) => {
    const success = await clipboardCopy(phone);
    if (success) {
      setCopiedPhone(userId);
      setTimeout(() => setCopiedPhone(''), 2000);
    }
  };

  const handleCopyPassword = async (password, userId) => {
    const success = await clipboardCopy(password);
    if (success) {
      setCopiedPassword(userId);
      setTimeout(() => setCopiedPassword(''), 2000);
    }
  };

  const togglePasswordVisibility = (userId) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const toggleAllPasswords = () => {
    const nextState = !showAllPasswords;
    setShowAllPasswords(nextState);
    const newVis = {};
    if (nextState) {
      users.forEach((u) => {
        const uid = (u._id || u.id || u.email).toString();
        newVis[uid] = true;
      });
    }
    setVisiblePasswords(newVis);
  };

  // ✅ Fixed: Strictly matches only the specific clicked user's ID
  const handleToggleUserStatus = async (userObj) => {
    if (userObj.role === 'admin' || userObj.role === 'super_admin') {
      setError('Administrator accounts cannot be disabled.');
      return;
    }

    const targetId = (userObj._id || userObj.id || '').toString();
    if (!targetId) {
      setError('Unable to resolve user identifier.');
      return;
    }

    try {
      const isCurrentlyDisabled = userObj.status === 'disabled' || userObj.isDisabled;
      const targetStatus = isCurrentlyDisabled ? 'active' : 'disabled';
      
      const res = await authApi.toggleUserStatus(targetId, { status: targetStatus });
      if (res.data?.success) {
        setSuccessMsg(`Account for ${userObj.name} has been ${targetStatus === 'disabled' ? 'disabled' : 'enabled'}.`);
        setUsers((prev) =>
          prev.map((u) => {
            const currentId = (u._id || u.id || '').toString();
            if (currentId && currentId === targetId) {
              return { ...u, status: targetStatus, isDisabled: targetStatus === 'disabled' };
            }
            return u;
          })
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update user account status');
    }
  };

  const handleOpenNotificationModal = (userObj) => {
    setNotificationTarget(userObj);
    setNotificationTitle(`⚡ Test Notification from Admin`);
    setNotificationMessage(`Hello ${userObj.name}, this is a test notification from FlickTap Admin sent directly to your account.`);
    setNotificationType('admin');
  };

  const handleSendNotification = async () => {
    if (!notificationTarget || !notificationTitle.trim() || !notificationMessage.trim()) {
      setError('Please provide notification title and message.');
      return;
    }

    setIsSendingNotification(true);
    setError('');
    setSuccessMsg('');

    try {
      const recipient = notificationTarget.email || notificationTarget.phoneNumber || notificationTarget._id;
      const res = await notificationApi.sendNotification({
        userId: recipient,
        title: notificationTitle.trim(),
        message: notificationMessage.trim(),
        type: notificationType,
        itemData: {
          recipientName: notificationTarget.name,
          sentByAdmin: currentUser?.name || 'Mohan Ashish',
          sentAt: new Date().toISOString(),
        },
      });

      if (res.data?.success) {
        setSuccessMsg(`🔔 Test notification successfully delivered to ${notificationTarget.name} (${notificationTarget.email || notificationTarget.phoneNumber})!`);
        window.dispatchEvent(new CustomEvent('flicktap_notification_dispatched'));
        setNotificationTarget(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send notification');
    } finally {
      setIsSendingNotification(false);
    }
  };

  // 1-Click Quick Ping directly from the table
  const handleQuickPingUser = async (userObj) => {
    const targetKey = (userObj._id || userObj.id || userObj.email).toString();
    setQuickSendingId(targetKey);
    setError('');
    setSuccessMsg('');

    try {
      const recipient = userObj.email || userObj.phoneNumber || userObj._id;
      const res = await notificationApi.sendNotification({
        userId: recipient,
        title: `🔔 Admin Ping (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
        message: `Hello ${userObj.name}! FlickTap Admin sent you a quick test ping. Your live connection is active.`,
        type: 'admin',
        itemData: {
          recipientName: userObj.name,
          sentByAdmin: currentUser?.name || 'Mohan Ashish',
        },
      });

      if (res.data?.success) {
        setSuccessMsg(`⚡ Instant test ping sent to ${userObj.name}!`);
        window.dispatchEvent(new CustomEvent('flicktap_notification_dispatched'));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send test ping');
    } finally {
      setQuickSendingId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    if (userToDelete.role === 'admin' || userToDelete.role === 'super_admin') {
      setError('Admin and Super Admin accounts cannot be deleted.');
      setUserToDelete(null);
      return;
    }

    setIsDeleting(true);
    setError('');
    setSuccessMsg('');

    const targetId = (userToDelete._id || userToDelete.id || '').toString();

    try {
      await authApi.deleteUser(targetId);
      setSuccessMsg(`User ${userToDelete.name} (@${userToDelete.username || 'user'}) has been permanently deleted.`);
      setUserToDelete(null);
      await fetchUsersAndStats();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  // If user is not admin, show permission denied guard with 1-click Admin Login
  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Admin Console Access</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              The Users Directory & Database view requires administrator authentication.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={onExploreHome}
              className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
            >
              Back to Home Feed
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Compute all metrics and counts safely
  const totalAdmins = users.filter((u) => u.role === 'admin' || u.role === 'super_admin').length;
  const totalRegularUsers = users.filter((u) => u.role !== 'admin' && u.role !== 'super_admin').length;
  const totalActiveUsers = users.filter((u) => u.status !== 'disabled' && !u.isDisabled).length;
  const totalDisabledUsers = users.filter((u) => u.status === 'disabled' || u.isDisabled).length;

  // Filter users based on search and role/status
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !searchQuery.trim() ||
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.phoneNumber && u.phoneNumber.includes(searchQuery));

    let matchesRole = true;
    if (roleFilter === 'admin') matchesRole = u.role === 'admin' || u.role === 'super_admin';
    else if (roleFilter === 'user') matchesRole = u.role !== 'admin' && u.role !== 'super_admin';
    else if (roleFilter === 'active') matchesRole = u.status !== 'disabled' && !u.isDisabled;
    else if (roleFilter === 'disabled') matchesRole = u.status === 'disabled' || u.isDisabled;

    return matchesSearch && matchesRole;
  });

  // Filter feedback based on category, status, and search
  const filteredFeedbacks = feedbacks.filter((f) => {
    const matchesSearch =
      !feedbackSearch.trim() ||
      (f.name && f.name.toLowerCase().includes(feedbackSearch.toLowerCase())) ||
      (f.email && f.email.toLowerCase().includes(feedbackSearch.toLowerCase())) ||
      (f.message && f.message.toLowerCase().includes(feedbackSearch.toLowerCase())) ||
      (f.category && f.category.toLowerCase().includes(feedbackSearch.toLowerCase()));

    let matchesCat = true;
    if (feedbackCategoryFilter === 'rating') matchesCat = f.category === 'App Rating & Review' || (f.rating && f.rating > 0);
    else if (feedbackCategoryFilter === 'bug') matchesCat = f.category === 'Bug Report';
    else if (feedbackCategoryFilter === 'feature') matchesCat = f.category === 'Feature Request';
    else if (feedbackCategoryFilter === 'ui') matchesCat = f.category === 'UI/UX Improvement';
    else if (feedbackCategoryFilter === 'general') matchesCat = f.category === 'General Feedback';

    let matchesStatus = true;
    if (feedbackStatusFilter !== 'all') matchesStatus = f.status === feedbackStatusFilter;

    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 👑 1. ADMIN HEADER BAR WITH TABS */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 border border-indigo-200 dark:border-indigo-500/20 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md">
                <Shield className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Admin Console</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                Admin Pro
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Manage user accounts, passwords, app ratings, user reviews & bug reports in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {adminTab === 'users' && (
              <button
                type="button"
                onClick={() => setMaskSensitiveData((prev) => !prev)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer border ${
                  maskSensitiveData
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                }`}
                title="Toggle PII masking on email and phone numbers"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{maskSensitiveData ? 'PII Masked' : 'Mask PII'}</span>
              </button>
            )}

            {adminTab === 'reviews' && (
              <button
                type="button"
                onClick={() => setShowTestFeedbackModal(true)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-md hover:from-amber-600 hover:to-orange-600 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Test Submit Review</span>
              </button>
            )}

            <a
              href="/api/db"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600/10 hover:bg-cyan-600/20 dark:bg-cyan-600/20 dark:hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 hover:text-cyan-900 dark:hover:text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Database className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Live DB</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            </a>

            <button
              onClick={() => {
                fetchUsersAndStats();
                fetchFeedbacksAndStats();
              }}
              disabled={isLoading || isFeedbackLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading || isFeedbackLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* 📑 TAB SELECTOR BAR */}
        <div className="flex items-center gap-2 border-t border-slate-200 dark:border-slate-800/80 pt-4 overflow-x-auto">
          <button
            onClick={() => setAdminTab('users')}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              adminTab === 'users'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Accounts & Passwords ({users.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('reviews')}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              adminTab === 'reviews'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                : 'bg-white dark:bg-slate-800/60 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 border border-amber-500/30'
            }`}
          >
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>User Reviews & Ratings ({feedbacks.length})</span>
            {feedbackStats?.averageRating && (
              <span className="px-1.5 py-0.5 rounded-full bg-black/20 text-white text-[10px] font-black">
                {feedbackStats.averageRating} ★
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminTab('stats')}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              adminTab === 'stats'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'bg-white dark:bg-slate-800/60 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/10 border border-cyan-500/30'
            }`}
          >
            <Database className="w-4 h-4 text-cyan-500" />
            <span>Database Structure (D1 SQL)</span>
          </button>
        </div>
      </div>

      {/* 📊 2. METRICS & COUNTS (USERS VIEW) */}
      {adminTab === 'users' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Registered</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{users.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Active Accounts</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{totalActiveUsers}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">Disabled Accounts</span>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{totalDisabledUsers}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">Admin Accounts</span>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{totalAdmins}</p>
            </div>
          </div>

          {/* 🔍 SEARCH & ROLE/STATUS FILTER BAR */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, @handle..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              {[
                { id: 'all', label: `All (${users.length})` },
                { id: 'active', label: `Active (${totalActiveUsers})` },
                { id: 'disabled', label: `Disabled (${totalDisabledUsers})` },
                { id: 'admin', label: `Admins (${totalAdmins})` },
                { id: 'user', label: `Users (${totalRegularUsers})` },
              ].map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setRoleFilter(chip.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    roleFilter === chip.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* 📋 USERS DATATABLE WITH PASSWORD & STATUS COLUMN */}
          <div className="rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Contact Info</th>
                    <th className="py-3.5 px-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Password (Admin Only)</span>
                        </div>
                        {filteredUsers.length > 0 && (
                          <button
                            type="button"
                            onClick={toggleAllPasswords}
                            className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 px-2 py-0.5 rounded cursor-pointer transition-colors"
                            title={showAllPasswords ? 'Hide all passwords' : 'Show all passwords'}
                          >
                            {showAllPasswords ? 'Hide All' : 'Show All'}
                          </button>
                        )}
                      </div>
                    </th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Joined Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span>Loading registered users from MongoDB...</span>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No users matching your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isUserSuperAdmin = u.role === 'super_admin';
                      const isUserAdmin = u.role === 'admin' || u.role === 'super_admin';
                      const userId = (u._id || u.id || u.email).toString();
                      const isPassVisible = !!visiblePasswords[userId];
                      const isAccountDisabled = u.status === 'disabled' || u.isDisabled;
                      const actualPassword = (u.plainPassword && u.plainPassword !== '••••••••' && u.plainPassword.trim() !== '')
                        ? u.plainPassword
                        : '123456';

                      return (
                        <tr
                          key={userId}
                          className={`transition-colors duration-150 ${
                            isAccountDisabled
                              ? 'bg-rose-50/40 dark:bg-rose-950/10 hover:bg-rose-50/70 dark:hover:bg-rose-950/20'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          {/* Name & Avatar */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-md shrink-0 ${
                                  isUserAdmin
                                    ? 'bg-gradient-to-tr from-amber-500 to-orange-500 shadow-amber-500/20'
                                    : isAccountDisabled
                                    ? 'bg-gradient-to-tr from-rose-500 to-red-600 shadow-rose-500/20'
                                    : 'bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-indigo-500/20'
                                }`}
                              >
                                {u.name?.[0]?.toUpperCase() || 'U'}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className={`font-bold ${isAccountDisabled ? 'text-rose-700 dark:text-rose-300 line-through' : 'text-slate-900 dark:text-white'}`}>
                                    {u.name}
                                  </span>
                                  {isCurrent && (
                                    <span className="px-1.5 py-0.2 rounded bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-[9px] font-bold border border-indigo-500/30">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <button
                                    type="button"
                                    onClick={() => handleCopyUsername(u.username || 'user', userId)}
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-mono text-[11px] transition-all cursor-pointer group"
                                    title="Click to copy username"
                                  >
                                    <span>@{u.username || 'user'}</span>
                                    {copiedUsername === userId ? (
                                      <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                                    ) : (
                                      <Copy className="w-3 h-3 opacity-60 group-hover:opacity-100 shrink-0" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Contact Info */}
                          <td className="py-3.5 px-4 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="text-slate-800 dark:text-slate-200">
                                {maskSensitiveData ? maskEmail(u.email) : u.email}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyEmail(u.email, userId)}
                                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
                                title="Copy email"
                              >
                                {copiedEmail === userId ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            {u.phoneNumber && (
                              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{maskSensitiveData ? maskPhoneNumber(u.phoneNumber) : u.phoneNumber}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyPhone(u.phoneNumber, userId)}
                                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
                                  title="Copy phone number"
                                >
                                  {copiedPhone === userId ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            )}
                          </td>

                          {/* 🔑 Plain Text Password View (Admin Only) */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={`font-mono text-xs px-3 py-1.5 rounded-xl border select-all min-w-[110px] text-center transition-all ${
                                  isPassVisible
                                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700/60 font-bold shadow-sm'
                                    : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold tracking-wider'
                                }`}
                              >
                                {isPassVisible ? actualPassword : '••••••••'}
                              </div>
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(userId)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                title={isPassVisible ? 'Hide Password' : 'Show Plain Password'}
                              >
                                {isPassVisible ? (
                                  <EyeOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopyPassword(actualPassword, userId)}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  copiedPassword === userId
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700/60'
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                }`}
                                title="Copy Password"
                              >
                                {copiedPassword === userId ? (
                                  <Check className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* 🟢/🔴 Account Status */}
                          <td className="py-3.5 px-4">
                            {isUserAdmin ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" />
                                Active
                              </span>
                            ) : isAccountDisabled ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 uppercase tracking-wider animate-pulse">
                                <UserX className="w-3 h-3" />
                                Disabled
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                                <UserCheck className="w-3 h-3" />
                                Active
                              </span>
                            )}
                          </td>

                          {/* Role Badge */}
                          <td className="py-3.5 px-4">
                            {isUserSuperAdmin ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-gradient-to-r from-amber-500/20 to-red-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                                <Shield className="w-3 h-3 text-amber-500" />
                                Super Admin
                              </span>
                            ) : isUserAdmin ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                                <Shield className="w-3 h-3" />
                                Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                                <UserCheck className="w-3 h-3" />
                                User
                              </span>
                            )}
                          </td>

                          {/* Joined Date */}
                          <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>
                                {u.createdAt
                                  ? new Date(u.createdAt).toLocaleDateString(undefined, {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    })
                                  : 'Default Seed'}
                              </span>
                            </div>
                          </td>

                          {/* Actions: Send Notification + Quick Ping + Toggle Disable/Enable + Delete */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* 🔔 Send Test Notification Modal Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenNotificationModal(u)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-white border border-indigo-500/20 text-[11px] font-bold transition-all cursor-pointer shadow-sm"
                                title={`Send test notification to ${u.name}`}
                              >
                                <Bell className="w-3 h-3" />
                                <span>Notify</span>
                              </button>

                              {/* ⚡ 1-Click Quick Ping Button */}
                              <button
                                type="button"
                                onClick={() => handleQuickPingUser(u)}
                                disabled={quickSendingId === userId}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-white border border-pink-500/20 text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                                title="Instant 1-Click Test Ping"
                              >
                                <Radio className={`w-3 h-3 ${quickSendingId === userId ? 'animate-pulse text-pink-500' : ''}`} />
                                <span>{quickSendingId === userId ? 'Pinging...' : 'Ping'}</span>
                              </button>

                              {/* Disable / Enable Button (Only for non-admin accounts) */}
                              {!isUserAdmin ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggleUserStatus(u)}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer shadow-sm ${
                                    isAccountDisabled
                                      ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                                      : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30'
                                  }`}
                                  title={isAccountDisabled ? 'Enable User Account' : 'Disable User Account'}
                                >
                                  {isAccountDisabled ? (
                                    <>
                                      <UserCheck className="w-3 h-3" />
                                      <span>Enable</span>
                                    </>
                                  ) : (
                                    <>
                                      <UserX className="w-3 h-3" />
                                      <span>Disable</span>
                                    </>
                                  )}
                                </button>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic px-2">Admin</span>
                              )}

                              {/* Delete Button (Only for non-admin accounts) */}
                              {!isUserAdmin && (
                                <button
                                  type="button"
                                  onClick={() => setUserToDelete(u)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 border border-rose-500/20 text-[11px] font-bold transition-all cursor-pointer"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ⭐ 3. USER REVIEWS & RATINGS TAB */}
      {adminTab === 'reviews' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Metrics Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Feedbacks</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{feedbacks.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                Average Rating
              </span>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  {feedbackStats?.averageRating || '4.8'}
                </p>
                <span className="text-xs text-amber-600/80 font-bold">/ 5.0 ⭐</span>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <Bug className="w-3.5 h-3.5" />
                Bug Reports
              </span>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {feedbacks.filter((f) => f.category === 'Bug Report').length}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5" />
                Feature Requests
              </span>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {feedbacks.filter((f) => f.category === 'Feature Request').length}
              </p>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={feedbackSearch}
                onChange={(e) => setFeedbackSearch(e.target.value)}
                placeholder="Search reviews, user name, email, message..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>

            {/* Category Chips */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {[
                { id: 'all', label: `All (${feedbacks.length})` },
                { id: 'rating', label: `⭐ Ratings (${feedbacks.filter((f) => f.category === 'App Rating & Review' || (f.rating && f.rating > 0)).length})` },
                { id: 'bug', label: `🐞 Bugs (${feedbacks.filter((f) => f.category === 'Bug Report').length})` },
                { id: 'feature', label: `💡 Ideas (${feedbacks.filter((f) => f.category === 'Feature Request').length})` },
                { id: 'ui', label: `🎨 UI/UX (${feedbacks.filter((f) => f.category === 'UI/UX Improvement').length})` },
                { id: 'general', label: `💬 Feedback (${feedbacks.filter((f) => f.category === 'General Feedback').length})` },
              ].map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setFeedbackCategoryFilter(chip.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    feedbackCategoryFilter === chip.id
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                      : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Status Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={feedbackStatusFilter}
                onChange={(e) => setFeedbackStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="new">🟡 New Submissions</option>
                <option value="reviewed">🔵 Reviewed</option>
                <option value="resolved">🟢 Resolved</option>
              </select>
            </div>
          </div>

          {/* Feedback & Review Cards Feed */}
          {isFeedbackLoading ? (
            <div className="py-16 text-center text-slate-500 bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <span className="text-sm font-semibold">Loading user reviews and ratings...</span>
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                <Star className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">No Reviews Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No user reviews match your current filters. You can submit a test rating to see how it renders in real-time.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTestFeedbackModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
              >
                + Submit Test Review
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFeedbacks.map((item) => {
                const isNew = item.status === 'new';
                const isReviewed = item.status === 'reviewed';
                const isResolved = item.status === 'resolved';

                return (
                  <div
                    key={item._id}
                    className={`p-5 rounded-3xl bg-white dark:bg-slate-900/90 border transition-all duration-200 shadow-md space-y-4 ${
                      isNew
                        ? 'border-amber-500/40 hover:border-amber-500'
                        : isResolved
                        ? 'border-emerald-500/30 hover:border-emerald-500/60'
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500/40'
                    }`}
                  >
                    {/* Header: User Info + Rating + Category */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-bold text-sm flex items-center justify-center shadow-md shrink-0">
                          {item.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{item.name || 'Anonymous User'}</span>
                            {item.rating && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] font-black border border-amber-500/30">
                                {item.rating} ★
                              </span>
                            )}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                            <span>{item.email || 'user@example.com'}</span>
                            {item.phoneNumber && (
                              <>
                                <span>•</span>
                                <span>{item.phoneNumber}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Category Badge */}
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase tracking-wider shrink-0">
                        {item.category || 'General'}
                      </span>
                    </div>

                    {/* Star Rating Display */}
                    {item.rating && item.rating > 0 && (
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= item.rating
                                ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                                : 'text-slate-300 dark:text-slate-700'
                            }`}
                          />
                        ))}
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-1.5">
                          {item.rating} out of 5 Stars
                        </span>
                      </div>
                    )}

                    {/* Message Box */}
                    {item.message && (
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                        "{item.message}"
                      </div>
                    )}

                    {/* Footer Metadata & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                      <div className="flex items-center gap-3 text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : 'Recently'}
                          </span>
                        </div>
                        {item.deviceInfo && (
                          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-mono text-[10px]">
                            <Smartphone className="w-3 h-3" />
                            <span className="truncate max-w-[120px]">{item.deviceInfo}</span>
                          </div>
                        )}
                      </div>

                      {/* Status Selector & Actions */}
                      <div className="flex items-center gap-2">
                        {/* Status Select */}
                        <select
                          value={item.status || 'new'}
                          disabled={updatingFeedbackId === item._id}
                          onChange={(e) => handleUpdateFeedbackStatus(item._id, e.target.value)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                            item.status === 'resolved'
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                              : item.status === 'reviewed'
                              ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-700 dark:text-indigo-300'
                              : 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          <option value="new">🟡 New</option>
                          <option value="reviewed">🔵 Reviewed</option>
                          <option value="resolved">🟢 Resolved</option>
                        </select>

                        {/* Send Direct Reply Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setNotificationTarget({
                              name: item.name,
                              email: item.email,
                              phoneNumber: item.phoneNumber,
                              _id: item._id,
                            });
                            setNotificationTitle(`⭐ Response from FlickTap Admin`);
                            setNotificationMessage(
                              `Hello ${item.name}, thank you for your feedback regarding "${item.category}". We've reviewed your submission!`
                            );
                            setNotificationType('admin');
                          }}
                          className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 transition-all cursor-pointer"
                          title={`Reply to ${item.name}`}
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Review Button */}
                        <button
                          type="button"
                          onClick={() => setFeedbackToDelete(item)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
                          title="Delete Review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 🗄️ 4. STORAGE & DATABASE STATS TAB */}
      {adminTab === 'stats' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Engine Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-600">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Database Status</h4>
                  <p className="text-xs text-emerald-600 font-bold">🟢 Connected & Healthy</p>
                </div>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                <p><strong>DB Engine:</strong> Cloudflare D1 (Serverless SQLite at Edge)</p>
                <p><strong>Database Name:</strong> <code className="text-indigo-600 dark:text-indigo-400 font-mono">flicktap-db</code></p>
                <p><strong>Auth Model:</strong> JWT + Scrypt/PBKDF2 Password Hashing</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-500/15 text-indigo-600">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Tables & Collections</h4>
                  <p className="text-xs text-indigo-600 font-bold">6 Active D1 SQL Tables</p>
                </div>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                <p><strong>users:</strong> {users.length} registered accounts</p>
                <p><strong>feedbacks:</strong> {feedbacks.length} user reviews</p>
                <p><strong>shows & reels:</strong> Live 4K streaming catalog</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-600">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Server Runtime</h4>
                  <p className="text-xs text-amber-600 font-bold">Cloudflare Workers Edge API</p>
                </div>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                <p><strong>API Endpoint:</strong> <code className="text-slate-700 dark:text-slate-300 font-mono text-[10px]">flicktap-backend.workers.dev</code></p>
                <p><strong>CORS:</strong> Enabled for Web App & Flutter Clients</p>
                <p><strong>Admin Session:</strong> Active (<code className="text-indigo-600 dark:text-indigo-400 font-mono">{currentUser?.email}</code>)</p>
              </div>
            </div>
          </div>

          {/* Database Explorer Direct Action */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-black tracking-tight">Cloudflare D1 SQL Live Explorer</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                  Remote D1
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Direct live JSON endpoint for table schema inspection, raw queries, and database status verification.
              </p>
            </div>
            <a
              href="https://flicktap-backend.mohanashish708090.workers.dev/api/db"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-cyan-500/30 cursor-pointer shrink-0"
            >
              <span>Launch Live DB Explorer</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Detailed Database Schema Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Cloudflare D1 Relational Schema Architecture (6 Tables)
                </h3>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">SQLite 3 / Cloudflare D1 SQL</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Table 1: users */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                    <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">TABLE users</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    {users.length} Rows
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] font-mono">
                    <thead>
                      <tr className="text-left text-slate-400 border-b border-slate-100 dark:border-slate-800">
                        <th className="py-1">Column</th>
                        <th className="py-1">Type</th>
                        <th className="py-1">Constraint / Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      <tr><td className="py-1 font-bold text-indigo-500">id</td><td>TEXT</td><td className="text-amber-500">PRIMARY KEY</td></tr>
                      <tr><td className="py-1 font-bold text-indigo-500">name</td><td>TEXT</td><td>NOT NULL</td></tr>
                      <tr><td className="py-1 font-bold text-indigo-500">email</td><td>TEXT</td><td className="text-cyan-500">UNIQUE NOT NULL</td></tr>
                      <tr><td className="py-1 font-bold text-indigo-500">phoneNumber</td><td>TEXT</td><td className="text-cyan-500">UNIQUE</td></tr>
                      <tr><td className="py-1 font-bold text-indigo-500">password</td><td>TEXT</td><td>PBKDF2 Hashed</td></tr>
                      <tr><td className="py-1 font-bold text-indigo-500">role</td><td>TEXT</td><td>'super_admin' | 'admin' | 'user'</td></tr>
                      <tr><td className="py-1 font-bold text-indigo-500">isBlocked</td><td>INTEGER</td><td>DEFAULT 0 (Active)</td></tr>
                      <tr><td className="py-1 font-bold text-indigo-500">avatar</td><td>TEXT</td><td>Avatar URL string</td></tr>
                      <tr><td className="py-1 font-bold text-indigo-500">purchasedShows</td><td>TEXT</td><td>JSON Array of Show IDs</td></tr>
                      <tr><td className="py-1 font-bold text-indigo-500">createdAt / updatedAt</td><td>TEXT</td><td>ISO 8601 Timestamps</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 2: shows */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">TABLE shows</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    4K Media Catalog
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] font-mono">
                    <thead>
                      <tr className="text-left text-slate-400 border-b border-slate-100 dark:border-slate-800">
                        <th className="py-1">Column</th>
                        <th className="py-1">Type</th>
                        <th className="py-1">Constraint / Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      <tr><td className="py-1 font-bold text-emerald-500">id</td><td>TEXT</td><td className="text-amber-500">PRIMARY KEY</td></tr>
                      <tr><td className="py-1 font-bold text-emerald-500">title</td><td>TEXT</td><td>NOT NULL</td></tr>
                      <tr><td className="py-1 font-bold text-emerald-500">description</td><td>TEXT</td><td>Full synopsis</td></tr>
                      <tr><td className="py-1 font-bold text-emerald-500">category</td><td>TEXT</td><td>'Trending', 'Action', etc.</td></tr>
                      <tr><td className="py-1 font-bold text-emerald-500">isPaid</td><td>INTEGER</td><td>0 = Free, 1 = VIP Paid</td></tr>
                      <tr><td className="py-1 font-bold text-emerald-500">price</td><td>REAL</td><td>Default ₹0 / ₹499</td></tr>
                      <tr><td className="py-1 font-bold text-emerald-500">videoUrl</td><td>TEXT</td><td>HLS / MP4 Stream URL</td></tr>
                      <tr><td className="py-1 font-bold text-emerald-500">thumbnailUrl</td><td>TEXT</td><td>HD Poster Image URL</td></tr>
                      <tr><td className="py-1 font-bold text-emerald-500">views / likes</td><td>INTEGER</td><td>Engagement Counters</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 3: reels */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                    <span className="font-mono font-bold text-xs text-pink-600 dark:text-pink-400">TABLE reels</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800">
                    9 Live Vertical Clips
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] font-mono">
                    <thead>
                      <tr className="text-left text-slate-400 border-b border-slate-100 dark:border-slate-800">
                        <th className="py-1">Column</th>
                        <th className="py-1">Type</th>
                        <th className="py-1">Constraint / Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      <tr><td className="py-1 font-bold text-pink-500">id</td><td>TEXT</td><td className="text-amber-500">PRIMARY KEY</td></tr>
                      <tr><td className="py-1 font-bold text-pink-500">title</td><td>TEXT</td><td>Short Title & Caption</td></tr>
                      <tr><td className="py-1 font-bold text-pink-500">videoUrl</td><td>TEXT</td><td>Vertical 9:16 MP4 URL</td></tr>
                      <tr><td className="py-1 font-bold text-pink-500">thumbnailUrl</td><td>TEXT</td><td>Instant Load Thumbnail</td></tr>
                      <tr><td className="py-1 font-bold text-pink-500">likes / commentsCount</td><td>INTEGER</td><td>Real-time counter</td></tr>
                      <tr><td className="py-1 font-bold text-pink-500">sharesCount</td><td>INTEGER</td><td>Share Tracker</td></tr>
                      <tr><td className="py-1 font-bold text-pink-500">isLiked / isSaved</td><td>INTEGER</td><td>Default 0</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 4: feedbacks */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400">TABLE feedbacks</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    {feedbacks.length} Reviews
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] font-mono">
                    <thead>
                      <tr className="text-left text-slate-400 border-b border-slate-100 dark:border-slate-800">
                        <th className="py-1">Column</th>
                        <th className="py-1">Type</th>
                        <th className="py-1">Constraint / Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      <tr><td className="py-1 font-bold text-amber-500">id</td><td>TEXT</td><td className="text-amber-500">PRIMARY KEY</td></tr>
                      <tr><td className="py-1 font-bold text-amber-500">name</td><td>TEXT</td><td>Reviewer Name</td></tr>
                      <tr><td className="py-1 font-bold text-amber-500">email</td><td>TEXT</td><td>User Contact Email</td></tr>
                      <tr><td className="py-1 font-bold text-amber-500">rating</td><td>INTEGER</td><td>1 to 5 Stars</td></tr>
                      <tr><td className="py-1 font-bold text-amber-500">category</td><td>TEXT</td><td>'Bug', 'UI', 'Review', etc.</td></tr>
                      <tr><td className="py-1 font-bold text-amber-500">message</td><td>TEXT</td><td>Detailed feedback message</td></tr>
                      <tr><td className="py-1 font-bold text-amber-500">deviceInfo</td><td>TEXT</td><td>Client device/browser string</td></tr>
                      <tr><td className="py-1 font-bold text-amber-500">status</td><td>TEXT</td><td>'new' | 'reviewed' | 'resolved'</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 5: notifications */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                    <span className="font-mono font-bold text-xs text-cyan-600 dark:text-cyan-400">TABLE notifications</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
                    In-App Push
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] font-mono">
                    <thead>
                      <tr className="text-left text-slate-400 border-b border-slate-100 dark:border-slate-800">
                        <th className="py-1">Column</th>
                        <th className="py-1">Type</th>
                        <th className="py-1">Constraint / Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      <tr><td className="py-1 font-bold text-cyan-500">id</td><td>TEXT</td><td className="text-amber-500">PRIMARY KEY</td></tr>
                      <tr><td className="py-1 font-bold text-cyan-500">userId</td><td>TEXT</td><td>Target User ID or 'all'</td></tr>
                      <tr><td className="py-1 font-bold text-cyan-500">title</td><td>TEXT</td><td>Notification Headline</td></tr>
                      <tr><td className="py-1 font-bold text-cyan-500">message</td><td>TEXT</td><td>Push Alert Body</td></tr>
                      <tr><td className="py-1 font-bold text-cyan-500">type</td><td>TEXT</td><td>'admin' | 'purchase' | 'system'</td></tr>
                      <tr><td className="py-1 font-bold text-cyan-500">isRead</td><td>INTEGER</td><td>DEFAULT 0</td></tr>
                      <tr><td className="py-1 font-bold text-cyan-500">createdAt</td><td>TEXT</td><td>ISO Timestamp</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 6: token_blacklist */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    <span className="font-mono font-bold text-xs text-purple-600 dark:text-purple-400">TABLE token_blacklist</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                    Security Revocation
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] font-mono">
                    <thead>
                      <tr className="text-left text-slate-400 border-b border-slate-100 dark:border-slate-800">
                        <th className="py-1">Column</th>
                        <th className="py-1">Type</th>
                        <th className="py-1">Constraint / Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      <tr><td className="py-1 font-bold text-purple-500">token</td><td>TEXT</td><td className="text-amber-500">PRIMARY KEY</td></tr>
                      <tr><td className="py-1 font-bold text-purple-500">expiresAt</td><td>INTEGER</td><td>Expiry Epoch Timestamp</td></tr>
                      <tr><td className="py-1 font-bold text-purple-500">createdAt</td><td>TEXT</td><td>Revoked At Timestamp</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔔 SEND TEST NOTIFICATION MODAL */}
      {notificationTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Send Test Notification</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Deliver a real-time notification to{' '}
                    <strong className="text-indigo-600 dark:text-indigo-400">{notificationTarget.name}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotificationTarget(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Recipient Summary Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {notificationTarget.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white truncate">{notificationTarget.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono">
                    {notificationTarget.email || notificationTarget.phoneNumber}
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider shrink-0 border border-indigo-500/20">
                {notificationTarget.role || 'user'}
              </span>
            </div>

            {/* Quick Template Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Quick Templates (1-Click Fill):</label>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    label: '⚡ Admin Test',
                    type: 'admin',
                    title: '⚡ Test Notification from Admin',
                    message: `Hello ${notificationTarget.name}, this is a test notification from FlickTap Admin sent directly to your account.`,
                  },
                  {
                    label: '🍿 New Release',
                    type: 'new_release',
                    title: '🍿 New Blockbuster Movie Released!',
                    message: `Hey ${notificationTarget.name}! Admin just published a brand new movie. Tap to stream now.`,
                  },
                  {
                    label: '⭐ VIP Offer',
                    type: 'purchase',
                    title: '⭐ Exclusive VIP Streamer Access Granted',
                    message: `Congratulations ${notificationTarget.name}! Your account has been upgraded to VIP stream privileges.`,
                  },
                  {
                    label: '🔒 System Update',
                    type: 'system',
                    title: '🔒 FlickTap System Maintenance Notice',
                    message: `Hello ${notificationTarget.name}, our server network has received performance upgrades.`,
                  },
                ].map((tpl) => (
                  <button
                    key={tpl.label}
                    type="button"
                    onClick={() => {
                      setNotificationTitle(tpl.title);
                      setNotificationMessage(tpl.message);
                      setNotificationType(tpl.type);
                    }}
                    className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input Form */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notification Title
                </label>
                <input
                  type="text"
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  placeholder="e.g. ⚡ Real-Time Admin Notice"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notification Message
                </label>
                <textarea
                  rows={3}
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  placeholder="Write message content..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Category Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'admin', label: 'Admin' },
                    { id: 'system', label: 'System' },
                    { id: 'new_release', label: 'Movie' },
                    { id: 'purchase', label: 'VIP' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNotificationType(cat.id)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                        notificationType === cat.id
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setNotificationTarget(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendNotification}
                disabled={isSendingNotification || !notificationTitle.trim() || !notificationMessage.trim()}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSendingNotification ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Notification</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ DELETE USER CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete User Account?</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Are you sure you want to permanently delete{' '}
                <strong className="text-slate-900 dark:text-white">{userToDelete.name}</strong> ({userToDelete.email})?
                This will delete the user account and remove their purchased items.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Delete Permanently</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⭐ TEST SUBMIT FEEDBACK MODAL */}
      {showTestFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 flex items-center justify-center">
                  <Star className="w-5 h-5 fill-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Submit Test Review / Feedback</h3>
                  <p className="text-xs text-slate-500">Test how reviews appear live across the Admin Console</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTestFeedbackModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTestSubmitFeedback} className="space-y-4">
              {/* Star Rating Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setTestRating(star)}
                      className="p-1.5 rounded-xl hover:scale-110 active:scale-95 transition-all cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= testRating
                            ? 'text-amber-400 fill-amber-400 drop-shadow-md'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-2">
                    {testRating} Star{testRating > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={testCategory}
                  onChange={(e) => setTestCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="App Rating & Review">⭐ App Rating & Review</option>
                  <option value="Bug Report">🐞 Bug Report</option>
                  <option value="Feature Request">💡 Feature Request</option>
                  <option value="UI/UX Improvement">🎨 UI/UX Improvement</option>
                  <option value="General Feedback">💬 General Feedback</option>
                </select>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Reviewer Name
                  </label>
                  <input
                    type="text"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    placeholder="e.g. Ashutosh Mohan"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="e.g. user@flicktap.com"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Review Message */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Review / Feedback Content
                </label>
                <textarea
                  rows={3}
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Enter detailed feedback or praise for FlickTap streaming..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTestFeedbackModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTestFeedback || (!testMessage.trim() && !testRating)}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-xs font-bold text-white shadow-lg shadow-amber-500/30 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmittingTestFeedback ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Star className="w-4 h-4 fill-white" />
                      <span>Post Test Review</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ⚠️ DELETE FEEDBACK MODAL */}
      {feedbackToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete User Review?</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Are you sure you want to remove the feedback submitted by{' '}
                <strong className="text-slate-900 dark:text-white">{feedbackToDelete.name}</strong>?
                This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFeedbackToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteFeedback}
                disabled={isDeletingFeedback}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isDeletingFeedback ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Delete Review</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

