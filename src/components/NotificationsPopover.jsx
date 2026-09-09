import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Film, ShoppingBag, Sparkles, X, Clock, ExternalLink, Shield, Radio } from 'lucide-react';
import { notificationApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function NotificationsPopover() {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'purchase' | 'new_release' | 'admin'
  const [isLoading, setIsLoading] = useState(false);
  const popoverRef = useRef(null);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    const lookupEmail = user?.email || user?.phoneNumber || '';
    try {
      setIsLoading(true);
      const res = await notificationApi.getAll(lookupEmail, {
        phoneNumber: user?.phoneNumber,
        userId: user?._id || user?.id,
      });
      if (res.data?.success) {
        setNotifications(res.data.notifications || res.data.data || []);
        setUnreadCount(res.data.unreadCount ?? 0);
      }
    } catch (err) {
      console.warn('Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 4000);

    const handleCustomDispatch = () => fetchNotifications();
    window.addEventListener('flicktap_notification_dispatched', handleCustomDispatch);

    return () => {
      clearInterval(interval);
      window.removeEventListener('flicktap_notification_dispatched', handleCustomDispatch);
    };
  }, [isAuthenticated, user?.email, user?.phoneNumber, user?._id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await notificationApi.markAsRead(id, user?.email);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id
            ? { ...n, isRead: true, readBy: [...(n.readBy || []), user?.email] }
            : n
        )
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead(user?.email);
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
          readBy: [...(n.readBy || []), user?.email],
        }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  if (!isAuthenticated) return null;

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen) fetchNotifications();
        }}
        title="Notifications"
        className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-pink-500 to-rose-600 text-[10px] font-black text-white rounded-full flex items-center justify-center shadow-lg shadow-pink-500/40 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/10 dark:bg-pink-500/20 text-pink-600 dark:pink-300 border border-pink-500/20 dark:border-pink-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="px-3 pt-2.5 pb-1 flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'all', label: 'All' },
              { id: 'admin', label: 'Admin Alerts' },
              { id: 'purchase', label: 'Purchases' },
              { id: 'new_release', label: 'Releases' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  filter === tab.id
                    ? 'bg-indigo-50 dark:bg-indigo-600/25 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* List Content */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 mt-1">
            {filtered.length === 0 ? (
              <div className="py-10 px-4 text-center space-y-2">
                <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">No notifications in this filter</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  You will be notified when new movies are added, pings received, or purchases completed.
                </p>
              </div>
            ) : (
              filtered.map((item) => {
                const isItemRead =
                  item.isRead ||
                  (item.readBy && (
                    (user?.email && item.readBy.includes(user.email)) ||
                    (user?.phoneNumber && item.readBy.includes(user.phoneNumber)) ||
                    (user?._id && item.readBy.includes(user._id.toString()))
                  ));

                return (
                  <div
                    key={item._id}
                    onClick={() => handleMarkAsRead(item._id, isItemRead)}
                    className={`p-3.5 transition-colors cursor-pointer flex gap-3 items-start ${
                      isItemRead
                        ? 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/30 opacity-75'
                        : 'bg-indigo-50/60 dark:bg-indigo-950/20 hover:bg-indigo-100/50 dark:hover:bg-indigo-950/30'
                    }`}
                  >
                    {/* Category Icon */}
                    <div
                      className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${
                        item.type === 'purchase'
                          ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30'
                          : item.type === 'admin'
                          ? 'bg-pink-500/10 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 border border-pink-500/20 dark:border-pink-500/30'
                          : item.type === 'new_release'
                          ? 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30'
                          : 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/30'
                      }`}
                    >
                      {item.type === 'purchase' ? (
                        <ShoppingBag className="w-4 h-4" />
                      ) : item.type === 'admin' ? (
                        <Radio className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                      ) : (
                        <Film className="w-4 h-4" />
                      )}
                    </div>

                    {/* Text Details */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs font-bold truncate ${isItemRead ? 'text-slate-600 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                          {item.title}
                        </p>
                        {!isItemRead && (
                          <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0"></span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                        {item.message}
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-400 dark:text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Just now'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
