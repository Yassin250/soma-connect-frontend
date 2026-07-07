import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const SchoolProfilePage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [school, setSchool] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  const fetchSchoolData = useCallback(async () => {
    if (!user?.schoolId) {
      setError('No school ID found');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const API_BASE_URL = 'http://localhost:5050/api/school';

      const [schoolRes, metricsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/${user.schoolId}`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/${user.schoolId}/metrics`, { headers: getHeaders() }),
      ]);

      if (!schoolRes.ok) throw new Error(`Failed to fetch school: ${schoolRes.status}`);

      const schoolData = await schoolRes.json();
      const schoolPayload = schoolData.data || schoolData;
      setSchool(schoolPayload);

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData.data || metricsData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.schoolId, getHeaders]);

  useEffect(() => {
    fetchSchoolData();
  }, [fetchSchoolData]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-RW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      ACTIVE: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
      APPROVED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
      PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
      SUSPENDED: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
      REJECTED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
    };
    return configs[status?.toUpperCase()] || configs.PENDING;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">Institutional Overview</span>
          <h1 className="text-2xl font-black tracking-tight mt-2 text-slate-900">School Profile</h1>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
          <svg className="w-8 h-8 mx-auto animate-spin text-[#5429FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p className="mt-3 text-sm font-medium">Loading school profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">Institutional Overview</span>
          <h1 className="text-2xl font-black tracking-tight mt-2 text-slate-900">School Profile</h1>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-red-600">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="font-medium mb-1">Failed to load school profile</p>
          <p className="text-sm text-slate-500 mb-4">{error}</p>
          <button onClick={fetchSchoolData} className="px-4 py-2 bg-[#5429FF] text-white text-sm font-semibold rounded-xl hover:bg-purple-700 transition-colors">Retry</button>
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
          <p>No school data found</p>
        </div>
      </div>
    );
  }

  const statusCfg = getStatusConfig(school.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">Institutional Overview</span>
          <h1 className="text-2xl font-black tracking-tight mt-2 text-slate-900">School Profile</h1>
          <p className="text-sm text-slate-500 mt-1">Manage official school details, logo, and contact information.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} mr-2`} />
            {school.status}
          </span>
        </div>
      </div>

      {/* School Identity Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#5429FF] to-purple-700 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 flex items-center justify-center ring-4 ring-white/20">
              <svg className="w-12 h-12 sm:w-14 sm:h-14 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div className="flex-1 text-white text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">{school.name}</h2>
              <p className="text-white/70 text-sm sm:text-base mt-1 capitalize">{school.type?.toLowerCase().replace('_', ' ')}</p>
              <p className="text-white/50 text-xs mt-1">Slug: <code className="font-mono">{school.slug}</code></p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Contact Information */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#5429FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Email</label>
                <p className="text-slate-900 font-medium break-all">{school.email || '—'}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Phone</label>
                <p className="text-slate-900 font-medium">{school.phone || '—'}</p>
              </div>
              <div className="sm:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Address</label>
                <p className="text-slate-900 font-medium whitespace-pre-wrap">{school.address || '—'}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Website</label>
                <p className="text-slate-900 font-medium break-all">{school.website ? (
                  <a href={school.website.startsWith('http') ? school.website : `https://${school.website}`} target="_blank" rel="noopener noreferrer" className="text-[#5429FF] hover:underline">{school.website}</a>
                ) : '—'}</p>
              </div>
            </div>
          </section>

          {/* Basic Information */}
          <section className="space-y-4 border-t border-slate-200 pt-6">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#5429FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Status</label>
                <p className="text-slate-900 font-medium capitalize">{school.status?.toLowerCase()}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Type</label>
                <p className="text-slate-900 font-medium capitalize">{school.type?.toLowerCase().replace('_', ' ')}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Active</label>
                <p className="text-slate-900 font-medium">{school.active ? 'Yes' : 'No'}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Admin</label>
                <p className="text-slate-900 font-medium">{school.adminName || '—'}</p>
              </div>
            </div>
          </section>

          {/* Timestamps */}
          <section className="space-y-4 border-t border-slate-200 pt-6">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#5429FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              System Timestamps
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Created</label>
                <p className="text-slate-900 font-medium font-mono text-xs">{formatDate(school.createdAt)}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Last Updated</label>
                <p className="text-slate-900 font-medium font-mono text-xs">{formatDate(school.updatedAt)}</p>
              </div>
            </div>
          </section>

          {/* Metrics Summary */}
          {metrics && (
            <section className="space-y-4 border-t border-slate-200 pt-6">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#5429FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Quick Metrics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                  <p className="text-2xl font-black text-blue-700">{metrics.totalStudents || 0}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mt-1">Total Students</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                  <p className="text-2xl font-black text-emerald-700">{metrics.totalLecturers || 0}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 mt-1">Total Lecturers</p>
                </div>
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-center">
                  <p className="text-2xl font-black text-purple-700">{metrics.totalCourses || 0}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-purple-500 mt-1">Total Courses</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
                  <p className="text-2xl font-black text-amber-700">{metrics.totalUsers || 0}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500 mt-1">Total Users</p>
                </div>
              </div>
            </section>
          )}

          {/* Note about editing */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-800">Profile Editing</p>
              <p className="text-xs text-amber-700 mt-1">School profile updates (name, contact info, address, etc.) require super-admin permissions. Contact your system administrator to request changes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};