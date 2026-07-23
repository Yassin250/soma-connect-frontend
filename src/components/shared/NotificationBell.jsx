import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Topbar notification bell with a tabbed, scrollable dropdown inbox.
 *
 * Client-side only for now — pass portal-specific starter items via `seed`;
 * swap the seed for the backend feed when the notifications endpoint ships.
 * Each item: { id, title, body, time, category, icon, unread, archived,
 *              action?: { label, to } }
 */
const TABS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'archived', label: 'Archived' },
];

export const NotificationBell = ({ seed = [], viewAllPath }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('unread');
  const [items, setItems] = useState(seed);
  const ref = useRef(null);

  // Close on outside click + on route change
  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);
  useEffect(() => { setOpen(false); }, [location.pathname, location.search]);

  const unreadCount = items.filter((n) => n.unread && !n.archived).length;
  const counts = {
    all: items.filter((n) => !n.archived).length,
    unread: unreadCount,
    archived: items.filter((n) => n.archived).length,
  };
  const visible = items.filter((n) =>
    tab === 'archived' ? n.archived : tab === 'unread' ? n.unread && !n.archived : !n.archived
  );

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
  const markRead = (id) => setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));

  const openAction = (n) => {
    markRead(n.id);
    if (n.action?.to) navigate(n.action.to);
    setOpen(false);
  };

  const goViewAll = () => {
    setOpen(false);
    if (viewAllPath) navigate(viewAllPath);
  };

  return (
    <div className="relative ml-auto md:ml-0" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-[#1b1e26] transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#d0f24a] text-[#1b1e26] text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-in zoom-in duration-200">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-gray-100 z-50 animate-in fade-in slide-in-from-top-1 duration-150 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-1 px-4 pt-4 pb-3">
            <h3 className="text-sm font-semibold text-[#1b1e26] mr-auto">Notifications</h3>
            <button
              onClick={markAllRead}
              title="Mark all as read"
              aria-label="Mark all as read"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1b1e26] hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={goViewAll}
              title="Notification settings"
              aria-label="Notification settings"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1b1e26] hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="mx-3 mb-2 rounded-xl bg-[#f7f8fa] p-1 grid grid-cols-3 gap-1">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    active ? 'bg-white text-[#1b1e26] shadow-sm' : 'text-gray-400 hover:text-[#1b1e26]'
                  }`}
                >
                  {t.label}
                  <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center transition-colors ${
                    active ? 'bg-[#1b1e26] text-[#d0f24a]' : 'bg-[#1b1e26]/[0.06] text-[#1b1e26]/50'
                  }`}>
                    {counts[t.id]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Scrollable list */}
          <div className="max-h-[340px] overflow-y-auto divide-y divide-gray-50 bell-scroll">
            {visible.length === 0 ? (
              <div className="py-12 text-center animate-in fade-in duration-200">
                <span className="w-11 h-11 rounded-2xl bg-[#d0f24a]/20 text-[#1b1e26] flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <p className="text-sm font-semibold text-[#1b1e26]">You're all caught up</p>
                <p className="text-xs text-gray-400 mt-0.5">Nothing in this tab right now.</p>
              </div>
            ) : (
              visible.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className="px-4 py-3.5 flex gap-3 hover:bg-gray-50/70 transition-colors cursor-pointer"
                >
                  <span className="w-9 h-9 rounded-xl bg-[#d0f24a]/20 text-[#1b1e26] flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d={n.icon} />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-semibold text-[#1b1e26] truncate">{n.title}</p>
                      {n.unread && <span className="w-2 h-2 rounded-full bg-[#d0f24a] ring-1 ring-[#1b1e26]/10 shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed bg-[#f7f8fa] border border-[#1b1e26]/[0.04] rounded-lg px-2.5 py-2 mt-1.5">
                      {n.body}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      {n.time} · {n.category}
                    </p>
                    {n.action && (
                      <button
                        onClick={(e) => { e.stopPropagation(); openAction(n); }}
                        className="mt-2 px-3.5 py-1.5 rounded-lg bg-[#1b1e26] text-white text-xs font-semibold hover:bg-black transition-colors active:scale-[0.97]"
                      >
                        {n.action.label}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 p-2">
            <button
              onClick={goViewAll}
              className="w-full py-2 rounded-xl text-sm font-semibold text-[#1b1e26] hover:bg-gray-50 transition-colors"
            >
              View all notifications
            </button>
          </div>

          <style>{`
            .bell-scroll::-webkit-scrollbar { width: 5px; }
            .bell-scroll::-webkit-scrollbar-thumb { background: rgba(27,30,38,0.12); border-radius: 999px; }
            .bell-scroll { scrollbar-width: thin; scrollbar-color: rgba(27,30,38,0.12) transparent; }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
