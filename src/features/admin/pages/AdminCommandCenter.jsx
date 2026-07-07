import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

export const AdminCommandCenter = () => {
  const { token, refreshAccessToken } = useAuth();
  const API_BASE_URL = 'http://localhost:5050/api/admin';

  const [stats, setStats] = useState({
    totalSchools: 0,
    activeSchools: 0,
    pendingSchools: 0,
    totalUsers: 0,
    totalStudents: 0,
    totalLecturers: 0,
    totalCourses: 0,
    globalSubmissions: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const getHeaders = useCallback((t) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${t || token}`,
  }), [token]);

  const fetchWithAuth = useCallback(async (url, retried = false) => {
    const res = await fetch(url, { headers: getHeaders() });
    if (res.status === 401 && !retried) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        const retryRes = await fetch(url, { headers: getHeaders(newToken) });
        if (!retryRes.ok) throw new Error(`Failed: ${retryRes.status} ${retryRes.statusText}`);
        return retryRes.json();
      }
      throw new Error('Session expired. Please log in again.');
    }
    if (!res.ok) throw new Error(`Failed: ${res.status} ${res.statusText}`);
    return res.json();
  }, [getHeaders, refreshAccessToken]);

  const loadGlobalStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const statsData = await fetchWithAuth(`${API_BASE_URL}/stats`);
      setStats(statsData.data || statsData);

      const activityData = await fetchWithAuth(`${API_BASE_URL}/activity`);
      setRecentActivity(Array.isArray(activityData) ? activityData : (activityData.data || []));
    } catch (err) {
      console.error('Error loading global stats:', err);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithAuth, toast]);

  useEffect(() => {
    loadGlobalStats();
  }, [loadGlobalStats]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 font-mono text-sm">
        Initializing Command Center...
      </div>
    );
  }

  // Color maps
  const typeColors = {
    School: { dot: 'bg-indigo-500', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', border: 'hover:border-indigo-400' },
    User:   { dot: 'bg-violet-500', badge: 'bg-violet-50 text-violet-700 border-violet-200',  border: 'hover:border-violet-400' },
    Course: { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', border: 'hover:border-emerald-400' },
    System: { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200',     border: 'hover:border-amber-400' },
  };

  const kpiCards = [
    {
      label: 'Total Institutions',
      value: stats.totalSchools,
      subValue: `${stats.activeSchools} Active / ${stats.pendingSchools} Pending`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5" />
        </svg>
      ),
      gradient: 'from-indigo-500 via-indigo-600 to-indigo-700',
      shadow: 'shadow-indigo-500/20',
      badge: 'bg-white/20 text-white',
      corner: 'bg-indigo-400/20',
    },
    {
      label: 'Total Users',
      value: stats.totalUsers,
      subValue: `${stats.totalStudents} Students · ${stats.totalLecturers} Faculty`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      gradient: 'from-violet-500 via-violet-600 to-fuchsia-600',
      shadow: 'shadow-violet-500/20',
      badge: 'bg-white/20 text-white',
      corner: 'bg-violet-400/20',
    },
    {
      label: 'Academic Courses',
      value: stats.totalCourses,
      subValue: 'Distributed across all institutes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      gradient: 'from-emerald-500 via-emerald-600 to-teal-700',
      shadow: 'shadow-emerald-500/20',
      badge: 'bg-white/20 text-white',
      corner: 'bg-emerald-400/20',
    },
    {
      label: 'Global Submissions',
      value: stats.globalSubmissions,
      subValue: 'Verified academic work',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-amber-500 via-orange-500 to-rose-600',
      shadow: 'shadow-amber-500/20',
      badge: 'bg-white/20 text-white',
      corner: 'bg-amber-400/20',
    },
  ];

  const quickLinks = [
    { label: 'Manage Users',       desc: 'Audit roles and account statuses',      path: '/admin/users',       icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { label: 'Manage Roles',       desc: 'Configure system role permissions',      path: '/admin/roles',       icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
    { label: 'Manage Permissions', desc: 'Audit fine-grained privileges',          path: '/admin/permissions', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
    { label: 'Review Schools',     desc: 'Approve pending institutions',           path: '/admin/approvals',   icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5' },
  ];

  return (
    <div className="space-y-8 antialiased">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">
            Global Oversight
          </span>
          <h1 className="text-3xl font-black tracking-tight mt-2 text-slate-900">
            Command Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time platform health, institutional growth, and user distribution metrics.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-medium text-slate-400">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          <span>System Operational</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, idx) => (
          <div
            key={idx}
            className={`relative p-4 rounded-xl bg-gradient-to-br ${card.gradient} ${card.shadow} shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 overflow-hidden group`}
          >
            {/* Decorative corner ring */}
            <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full ${card.corner} blur-lg group-hover:scale-150 transition-transform duration-700`} />
            <div className="absolute -bottom-3 -left-3 w-10 h-10 rounded-full border-2 border-white/5 group-hover:scale-125 transition-transform duration-500" />

            {/* Top row: icon + subtle indicator */}
            <div className="flex items-start justify-between relative z-10">
              <div className="p-2 rounded-lg bg-white/15 text-white backdrop-blur-sm ring-1 ring-white/20 shadow-inner">
                {card.icon}
              </div>
              <div className="w-1 h-1 rounded-full bg-white/40 animate-pulse" />
            </div>

            {/* Value area */}
            <div className="mt-3 relative z-10">
              <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-white/60">{card.label}</p>
              <p className="text-2xl font-black text-white mt-0.5 drop-shadow-sm tabular-nums">{card.value}</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold mt-2 ${card.badge} backdrop-blur-sm`}>
                {card.subValue}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Activity Feed */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-slate-400 mb-2">Global Event Stream</h3>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100">
              {recentActivity.length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-xs italic">No recent platform activity recorded.</div>
              ) : (
                recentActivity.map((act) => {
                  const colors = typeColors[act.type] || typeColors.System;
                  return (
                    <div
                      key={act.id}
                      className={`p-4 flex items-center justify-between transition-all border-l-4 border-transparent hover:bg-slate-50 ${colors.border}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-2 h-2 rounded-full ${colors.dot} flex-shrink-0`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{act.action}</p>
                          <p className="text-xs text-slate-400 font-mono">{act.time}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${colors.badge} border whitespace-nowrap flex-shrink-0`}>
                        {act.type}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-slate-400 mb-2">Admin Fast-Track</h3>
          <div className="grid grid-cols-1 gap-3">
            {quickLinks.map((link, idx) => (
              <Link
                key={idx}
                to={link.path}
                className="flex items-center p-4 bg-white border border-slate-200 rounded-2xl transition-all border-l-4 border-transparent hover:border-l-indigo-400 hover:bg-slate-50 group"
              >
                <div className="p-2.5 rounded-xl transition-colors bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon} />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-bold text-slate-900">{link.label}</p>
                  <p className="text-[11px] text-slate-500">{link.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};