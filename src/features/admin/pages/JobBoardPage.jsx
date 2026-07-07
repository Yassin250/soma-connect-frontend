import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

const STATUS_STYLE = {
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  draft: 'bg-slate-50 text-slate-500 border-slate-200',
  closed: 'bg-red-50 text-red-700 border-red-200',
  featured: 'bg-purple-50 text-purple-700 border-purple-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
};

const TYPE_STYLE = {
  'full-time': 'bg-blue-50 text-blue-700 border-blue-200',
  'part-time': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  contract: 'bg-amber-50 text-amber-700 border-amber-200',
  internship: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  remote: 'bg-purple-50 text-purple-700 border-purple-200',
};

export const JobBoardPage = () => {
  const { token } = useAuth();
  const API_BASE_URL = 'http://localhost:5050/api/admin';

  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [stats, setStats] = useState({ total: 0, published: 0, featured: 0 });
  const toast = useToast();

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (search.trim()) params.append('q', search.trim());

      const response = await fetch(`${API_BASE_URL}/jobs?${params}`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error(`Failed to fetch jobs: ${response.status}`);

      const data = await response.json();
      const items = Array.isArray(data) ? data : data.data || [];
      setJobs(items);
      setStats({
        total: items.length,
        published: items.filter((j) => j.status === 'published').length,
        featured: items.filter((j) => j.featured || j.status === 'featured').length,
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [getHeaders, statusFilter, search]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    setStatusFilter('ALL');
  }, [search]);

  const STATUSES = ['ALL', 'published', 'featured', 'draft', 'pending', 'closed'];

  return (
    <div className="space-y-8 antialiased">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">
            Career Marketplace
          </span>
          <h1 className="text-3xl font-black tracking-tight mt-2 text-slate-900">Job Board</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review, moderate, and manage all job listings across the platform.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Listings', value: stats.total, icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', accent: 'border-l-indigo-500', iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
          { label: 'Published', value: stats.published, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', accent: 'border-l-emerald-500', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
          { label: 'Featured', value: stats.featured, icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', accent: 'border-l-purple-500', iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
        ].map((card, idx) => (
          <div key={idx} className={`bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden ${card.accent} border-l-4`}>
            <div className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${card.iconBg} ${card.iconColor}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={card.icon} />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{card.label}</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.603 10.602z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all capitalize ${
                statusFilter === s
                  ? 'bg-[#1d4ed8] text-white border-[#1d4ed8] shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              {s === 'ALL' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 text-sm font-mono">
            Loading jobs...
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
            </svg>
            <p className="text-sm font-medium">No jobs found</p>
            <p className="text-xs mt-1">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Title', 'Employer', 'Type', 'Status', 'Location', 'Posted'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-900">{j.title}</p>
                      {j.department && <p className="text-xs text-slate-400 mt-0.5">{j.department}</p>}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">{j.employer || j.company}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${TYPE_STYLE[j.type] || TYPE_STYLE['full-time']}`}>
                        {j.type || 'full-time'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border capitalize ${STATUS_STYLE[j.status] || STATUS_STYLE.pending}`}>
                        {j.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">{j.location || '---'}</td>
                    <td className="px-5 py-4 text-xs font-mono text-slate-400">{j.createdAt || j.postedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
