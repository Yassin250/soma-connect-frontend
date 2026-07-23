import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';

const EMPTY_STATS = {
  totalUsers: 0,
  totalStudents: 0,
  totalFaculty: 0,
  totalAdmins: 0,
  activeUsers: 0,
  lockedUsers: 0,
  totalRoles: 0,
  totalPermissions: 0,
};

const roleNames = (user) =>
  (user?.roles || []).map((r) => (typeof r === 'string' ? r : r?.name || '').toUpperCase());

const hasAnyRole = (user, wanted) => {
  const names = roleNames(user);
  return wanted.some((w) => names.includes(w));
};

// Human-friendly "time ago" for the activity feed derived from createdAt.
const timeAgo = (isoDate) => {
  if (!isoDate) return '';
  const then = new Date(isoDate).getTime();
  if (Number.isNaN(then)) return '';
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [label, secs] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value} ${label}${value > 1 ? 's' : ''} ago`;
  }
  return 'just now';
};

export const AdminCommandCenter = () => {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  // useToast() returns a fresh object each provider render, so keep it in a ref
  // instead of an effect dependency — otherwise showing a toast would re-run the
  // loader and could loop.
  const toastRef = useRef(toast);
  toastRef.current = toast;

  // Derive the command-center metrics from the endpoints the API actually
  // exposes today (users / roles / permissions). Dedicated /stats and /activity
  // endpoints don't exist yet, so each source is loaded independently and a
  // single failure degrades that metric to 0 instead of blanking the dashboard.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setIsLoading(true);

      const [usersRes, rolesRes, permsRes] = await Promise.allSettled([
        adminService.getUsers(),
        adminService.getRoles(),
        adminService.getPermissions(),
      ]);
      if (cancelled) return;

      const users = usersRes.status === 'fulfilled' && Array.isArray(usersRes.value) ? usersRes.value : [];
      const roles = rolesRes.status === 'fulfilled' && Array.isArray(rolesRes.value) ? rolesRes.value : [];
      const permissions = permsRes.status === 'fulfilled' && Array.isArray(permsRes.value) ? permsRes.value : [];

      setStats({
        totalUsers: users.length,
        totalStudents: users.filter((u) => hasAnyRole(u, ['STUDENT'])).length,
        totalFaculty: users.filter((u) => hasAnyRole(u, ['LECTURER', 'FACULTY', 'TEACHER'])).length,
        totalAdmins: users.filter((u) => hasAnyRole(u, ['ADMIN', 'SUPER_ADMIN'])).length,
        activeUsers: users.filter((u) => u.active && u.enabled && u.accountNonLocked !== false).length,
        lockedUsers: users.filter((u) => u.accountNonLocked === false).length,
        totalRoles: roles.length,
        totalPermissions: permissions.length,
      });

      const activity = [...users]
        .filter((u) => u.createdAt)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6)
        .map((u) => ({
          id: u.id,
          type: 'User',
          action: `New account created — ${u.name || u.username || u.email}`,
          time: timeAgo(u.createdAt),
        }));
      setRecentActivity(activity);

      if (usersRes.status === 'rejected') {
        toastRef.current.error(usersRes.reason?.message || 'Could not load dashboard metrics');
      }

      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const kpiCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      sub: `${stats.totalStudents} students · ${stats.totalFaculty} faculty`,
      accent: true,
      icon: 'M17 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    },
    {
      label: 'Active Accounts',
      value: stats.activeUsers,
      sub: `${stats.lockedUsers} locked`,
      icon: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3',
    },
    {
      label: 'Roles Configured',
      value: stats.totalRoles,
      sub: `${stats.totalPermissions} permissions`,
      icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4',
    },
    {
      label: 'Administrators',
      value: stats.totalAdmins,
      sub: 'Platform operators',
      icon: 'M12 2 4 5v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V5l-8-3z',
    },
  ];

  const quickLinks = [
    { label: 'Manage Users', desc: 'Audit accounts & statuses', to: '/admin/users', icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
    { label: 'Manage Roles', desc: 'Configure role permissions', to: '/admin/roles', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
    { label: 'Permissions', desc: 'Fine-grained privileges', to: '/admin/permissions', icon: 'M15.5 7.5 21 2M18 5l-3 3M11 11a4 4 0 1 1-5.66 5.66A4 4 0 0 1 11 11z' },
    { label: 'Review Schools', desc: 'Approve institutions', to: '/admin/approvals', icon: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3' },
  ];

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 w-64 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-32 bg-gray-200/70 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-gray-200/70 rounded-2xl" />
          <div className="h-80 bg-gray-200/70 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <span className="inline-block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1b1e26]/50 bg-[#d0f24a]/40 px-2.5 py-1 rounded-full">
            Global Oversight
          </span>
          <h1 className="text-[19px] font-medium tracking-tight text-[#1b1e26] mt-3">Command Center</h1>
          <p className="text-[12px] text-gray-500 mt-1">Real-time platform health, growth, and user distribution.</p>
        </div>
        <div className="flex items-center gap-2.5 text-xs font-semibold bg-[#d0f24a] text-[#1b5e20] rounded-2xl px-4 py-2.5 shadow-sm relative overflow-hidden">
          <span className="absolute -right-3 -bottom-3 w-14 h-14 rounded-full bg-white/25 pointer-events-none" />
          <span className="relative flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2e7d32] animate-pulse shrink-0" />
            <span className="uppercase tracking-wide text-[11px]">System Operational</span>
          </span>
          <span className="relative hidden sm:block text-[10px] font-medium text-[#1b5e20]/70 before:content-['·'] before:mr-2">
            Environment · Rwanda
          </span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className={`relative rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${
              card.accent ? 'bg-[#1b1e26] border-[#1b1e26]' : 'bg-white border-gray-100 shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between">
              <span className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.accent ? 'bg-[#d0f24a] text-[#1b1e26]' : 'bg-[#f3f4f6] text-[#1b1e26]'}`}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={card.icon} />
                </svg>
              </span>
            </div>
            <p className={`text-3xl font-bold tabular-nums mt-4 ${card.accent ? 'text-white' : 'text-[#1b1e26]'}`}>{card.value}</p>
            <p className={`text-sm font-medium mt-0.5 ${card.accent ? 'text-white/80' : 'text-gray-600'}`}>{card.label}</p>
            <p className={`text-xs mt-2 ${card.accent ? 'text-white/50' : 'text-gray-400'}`}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Activity + quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity feed */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h3 className="text-sm font-semibold text-[#1b1e26]">Recent Activity</h3>
            <Link to="/admin/audit-logs" className="text-xs font-medium text-gray-400 hover:text-[#1b1e26] transition-colors">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentActivity.length === 0 ? (
              <div className="px-6 py-14 text-center text-sm text-gray-400">No recent platform activity recorded.</div>
            ) : (
              recentActivity.map((act) => (
                <div key={act.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/60 transition-colors">
                  <span className="w-9 h-9 rounded-xl bg-[#d0f24a]/25 text-[#1b1e26] flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#1b1e26] truncate">{act.action}</p>
                    <p className="text-xs text-gray-400">{act.time}</p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-100 px-2 py-1 rounded-full shrink-0">{act.type}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-5">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-[#1b1e26] mb-4">Admin Fast-Track</h3>
            <div className="space-y-1.5">
              {quickLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="group flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-[#f3f4f6] transition-colors"
                >
                  <span className="w-10 h-10 rounded-xl bg-[#f3f4f6] group-hover:bg-[#d0f24a] text-[#1b1e26] flex items-center justify-center transition-colors shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={link.icon} /></svg>
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1b1e26]">{link.label}</p>
                    <p className="text-[11px] text-gray-400 truncate">{link.desc}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-[#1b1e26] ml-auto transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Lime highlight */}
          <div className="rounded-2xl bg-[#d0f24a] p-6 relative overflow-hidden shadow-[0_8px_32px_rgba(208,242,74,0.25)]">
            <div className="absolute -bottom-10 -right-8 w-32 h-32 rounded-full bg-white/20 pointer-events-none" />
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-[#e8ff6a]/40 blur-2xl pointer-events-none" />
            <div className="relative">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1b1e26]/55">Access control</p>
              <p className="text-xl font-bold text-[#1b1e26] mt-2 leading-snug">
                {stats.totalPermissions} permissions across {stats.totalRoles} roles
              </p>
              <Link
                to="/admin/roles"
                className="inline-flex items-center gap-2 mt-5 bg-[#1b1e26] text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-black transition-all duration-200 hover:gap-2.5 shadow-md"
              >
                Review access
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCommandCenter;
