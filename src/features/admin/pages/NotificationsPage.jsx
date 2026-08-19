import React, { useState, useEffect } from 'react';
import { useToast } from '../../../context/ToastContext';
import { notificationService } from '../../../services/api';

const TYPE_CONFIG = {
  alert: { dot: 'bg-red-500', badge: 'bg-red-50 text-red-700 border-red-200', label: 'Alert' },
  update: { dot: 'bg-[#3D7FFF]', badge: 'bg-[#3D7FFF]/20 text-white border-[#3D7FFF]/50', label: 'Update' },
  reminder: { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Reminder' },
  achievement: { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Achievement' },
  info: { dot: 'bg-slate-500', badge: 'bg-slate-50 text-slate-600 border-slate-200', label: 'Info' },
};

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const toast = useToast();

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await notificationService.list({ archived: true });
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const getType = (n) => TYPE_CONFIG[n.type] || TYPE_CONFIG.info;

  const filtered = filter === 'ALL' ? notifications : notifications.filter((n) => n.type === filter);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  const toggleRead = async (id, currentRead) => {
    try {
      if (!currentRead) await notificationService.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
    } catch {}
  };

  const TYPES = ['ALL', 'alert', 'update', 'reminder', 'achievement', 'info'];

  return (
    <div className="space-y-8 antialiased">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white bg-[#3D7FFF]/20 px-2.5 py-1 rounded">
            Communication
          </span>
          <h1 className="text-[19px] font-medium tracking-tight mt-2 text-slate-900">
            Notifications
          </h1>
          <p className="text-[12px] text-slate-500 mt-1">
            System alerts, updates, and administrative announcements.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs text-slate-400 font-mono">
          {unreadCount} unread / {notifications.length} total
        </span>
        <div className="flex-1" />
        {TYPES.map((t) => {
          const cfg = TYPE_CONFIG[t] || { label: 'All' };
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                filter === t
                  ? 'bg-[#0A0A0A] text-white border-[#0A0A0A] shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              {t === 'ALL' ? 'All' : cfg.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 text-sm font-mono">
            Loading notifications...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <p className="text-sm font-medium">No notifications</p>
            <p className="text-xs mt-1">All caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((n) => {
              const cfg = getType(n);
              return (
                <div
                  key={n.id}
                  onClick={() => toggleRead(n.id, n.read)}
                  className={`p-5 flex items-start gap-4 cursor-pointer transition-all hover:bg-slate-50 ${
                    !n.read ? 'bg-[#3D7FFF]/10 border-l-2 border-l-[#3D7FFF]' : ''
                  }`}
                >
                  <div className={`p-2 rounded-xl ${cfg.badge.split(' ').slice(0, 2).join(' ')} ${!n.read ? 'ring-2 ring-[#3D7FFF]/40' : ''}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      {n.type === 'alert' && <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />}
                      {n.type === 'update' && <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />}
                      {n.type === 'reminder' && <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />}
                      {n.type === 'achievement' && <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />}
                      {n.type === 'info' && <path d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />}
                      {!n.type || (!n.type && n.type !== 'alert' && n.type !== 'update' && n.type !== 'reminder' && n.type !== 'achievement' && n.type !== 'info') && <path d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />}
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className={`text-sm ${!n.read ? 'font-extrabold' : 'font-semibold'} text-slate-900`}>{n.title}</h4>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-[#3D7FFF]" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1.5">{n.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
