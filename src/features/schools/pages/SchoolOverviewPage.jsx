import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { entityProfileService } from '../../../services/api';

const STATS = [
  {
    key: 'totalUsers',
    label: 'Total Members',
    hint: 'Staff & students',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    featured: true,
  },
  {
    key: 'activeStudents',
    label: 'Active Students',
    hint: 'Currently enrolled',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    key: 'pendingCount',
    label: 'Pending Invites',
    hint: 'Awaiting activation',
    icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
  },
  {
    key: 'courseCount',
    label: 'Courses',
    hint: 'Active programs',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
];

// One-click entries into the most-used areas of the portal.
const QUICK_ACTIONS = [
  {
    label: 'Manage Users',
    sub: 'Invite staff, assign roles',
    path: '/school/staff',
    icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
  },
  {
    label: 'Roles & Permissions',
    sub: 'Control access levels',
    path: '/school/roles',
    icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4',
  },
  {
    label: 'School Profile',
    sub: 'Update institution details',
    path: '/school/profile',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  },
  {
    label: 'Student Registry',
    sub: 'Browse enrolled students',
    path: '/school/students',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  },
];

const greetingFor = () => 'Welcome back';

export const SchoolOverviewPage = () => {
  const { user } = useAuth();
  const now = new Date();
  const firstName = (user?.name || 'Admin').split(' ')[0];
  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    entityProfileService.getDashboard()
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statValue = (key) => {
    if (loading) return '…';
    if (!stats) return '—';
    return stats[key] ?? '—';
  };

  return (
    <div className="space-y-6">
      {/* Greeting header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium text-gray-400">{dateLabel}</p>
          <h1 className="text-[19px] font-medium text-[#1b1e26] tracking-tight leading-tight">
            {greetingFor(now)}, {firstName}
          </h1>
          <p className="text-[12px] text-gray-500 mt-1">
            Here's what's happening at {user?.entityName || 'your institution'} today.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className={`group rounded-2xl p-5 border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
              s.featured
                ? 'bg-gradient-to-br from-[#10B981] to-[#6EE7B7] border-transparent text-white relative overflow-hidden'
                : 'bg-white border-[#1b1e26]/[0.06] shadow-sm'
            }`}
          >
            {s.featured && <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />}
            <div className="flex items-start justify-between">
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                s.featured ? 'bg-white/20 text-white' : 'bg-[#10B981]/20 text-[#10B981]'
              }`}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={s.icon} />
                </svg>
              </span>
            </div>
            <p className={`text-3xl font-semibold tracking-tight mt-4 ${s.featured ? 'text-white' : 'text-[#1b1e26]'}`}>
              {statValue(s.key)}
            </p>
            <p className={`text-[13px] font-semibold mt-1 ${s.featured ? 'text-white/80' : 'text-[#1b1e26]/70'}`}>
              {s.label}
            </p>
            <p className={`text-xs mt-0.5 ${s.featured ? 'text-white/40' : 'text-gray-400'}`}>{s.hint}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-[#1b1e26] mb-3">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.path}
              to={a.path}
              className="group flex items-center gap-3.5 rounded-2xl bg-white border border-[#1b1e26]/[0.06] shadow-sm p-4 transition-all duration-200 hover:border-[#10B981] hover:shadow-md hover:shadow-emerald-500/10"
            >
              <span className="w-11 h-11 rounded-xl bg-[#f3f4f6] group-hover:bg-[#10B981]/15 text-[#1b1e26] flex items-center justify-center shrink-0 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={a.icon} />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[#1b1e26] truncate">{a.label}</span>
                <span className="block text-xs text-gray-400 truncate">{a.sub}</span>
              </span>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-[#1b1e26] ml-auto shrink-0 transition-all group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/* Coming-soon strip */}
      <div className="rounded-2xl border border-dashed border-[#0E1412]/15 bg-white/60 p-5 flex items-center gap-4">
        <span className="w-10 h-10 rounded-xl bg-[#10B981]/20 text-[#10B981] flex items-center justify-center shrink-0">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </span>
        <div>
          <p className="text-sm font-semibold text-[#1b1e26]">Live metrics are on the way</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Enrollment, attendance, and fee analytics will appear here once academic modules launch.
          </p>
        </div>
      </div>
    </div>
  );
};
