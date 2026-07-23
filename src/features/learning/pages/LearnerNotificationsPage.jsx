import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationService } from '../../../services/api';

const TYPE_STYLES = {
  enrollment:  { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  completion:  { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  assignment:  { bg: 'bg-amber-100', text: 'text-amber-700', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  quiz:        { bg: 'bg-violet-100', text: 'text-violet-700', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  achievement: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  info:        { bg: 'bg-gray-100', text: 'text-gray-700', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  reminder:    { bg: 'bg-rose-100', text: 'text-rose-700', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
};

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'archived', label: 'Archived' },
];

const fmtTime = (iso) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};

export const LearnerNotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await notificationService.list({ archived: true });
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'archived') return n.archived;
    return true;
  });

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {}
  };

  const handleArchive = async (id) => {
    try {
      await notificationService.archive(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, archived: true } : n)));
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1b1e26] tracking-tight">Notifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1b1e26] text-white text-xs font-semibold hover:bg-black transition-colors active:scale-[0.97]">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Mark all read
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              filter === t.id
                ? 'bg-[#1b1e26] text-white shadow-md'
                : 'bg-white text-[#1b1e26]/55 border border-gray-200 hover:text-[#1b1e26] hover:border-gray-300'
            }`}
          >
            {t.label}
            {t.id === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-current text-white text-[10px]">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-white border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button onClick={load} className="px-5 py-2.5 rounded-xl bg-[#1b1e26] text-white text-sm font-semibold hover:bg-black transition-colors">Try again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <p className="text-sm font-semibold text-[#1b1e26]">No notifications yet</p>
          <p className="text-xs text-gray-400 mt-1">You're all caught up — check back later.</p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-2">
            {filtered.map((n, i) => {
              const s = TYPE_STYLES[n.type] || TYPE_STYLES.info;
              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, scale: 0.97, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: -8 }}
                  transition={{ delay: i * 0.025, duration: 0.25 }}
                  className={`rounded-2xl bg-white p-5 transition-all hover:shadow-sm ${
                    !n.read
                      ? 'border-l-4 border-l-[#1b1e26] border-t border-r border-b border-gray-100 shadow-[0_4px_20px_rgba(27,30,38,0.06)]'
                      : 'border border-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <span className={`w-10 h-10 rounded-xl ${s.bg} ${s.text} flex items-center justify-center shrink-0`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={s.icon} /></svg>
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${!n.read ? 'font-bold' : 'font-medium'} text-[#1b1e26]`}>{n.title}</p>
                        <span className="text-[11px] text-gray-400 shrink-0 whitespace-nowrap">{fmtTime(n.createdAt)}</span>
                      </div>
                      {n.body && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{n.body}</p>}
                      <div className="flex items-center gap-3 mt-3">
                        {n.link && (
                          <Link to={n.link} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1b1e26] text-white text-[11px] font-semibold hover:bg-black transition-colors">
                            View
                          </Link>
                        )}
                        {!n.read && (
                          <button onClick={() => handleMarkRead(n.id)} className="text-[11px] font-semibold text-gray-400 hover:text-[#1b1e26] transition-colors">Mark read</button>
                        )}
                        {!n.archived && (
                          <button onClick={() => handleArchive(n.id)} className="text-[11px] font-semibold text-gray-400 hover:text-[#1b1e26] transition-colors">Archive</button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default LearnerNotificationsPage;
