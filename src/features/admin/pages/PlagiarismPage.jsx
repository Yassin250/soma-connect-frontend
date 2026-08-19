import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { SimilarityScanner } from '../../assignments/components/SimilarityScanner';

const SEVERITY_CONFIG = {
  HIGH: { dot: 'bg-red-500', badge: 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-200', bar: 'bg-red-500', label: 'High', gradient: 'from-red-500 to-rose-600' },
  MEDIUM: { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-200', bar: 'bg-amber-500', label: 'Medium', gradient: 'from-amber-500 to-orange-600' },
  LOW: { dot: 'bg-yellow-500', badge: 'bg-yellow-50 text-yellow-700 border-yellow-200 ring-1 ring-yellow-200', bar: 'bg-yellow-500', label: 'Low', gradient: 'from-yellow-500 to-amber-600' },
  CLEAR: { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-200', bar: 'bg-emerald-500', label: 'Clear', gradient: 'from-emerald-500 to-teal-600' },
};

export const PlagiarismPage = () => {
  const { token } = useAuth();
  const API_BASE_URL = 'http://localhost:5050/api/admin';

  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [stats, setStats] = useState({ total: 0, high: 0, flagged: 0, clean: 0 });
  const [showScanner, setShowScanner] = useState(false);
  const toast = useToast();

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (severityFilter !== 'ALL') params.append('severity', severityFilter);
      if (search.trim()) params.append('q', search.trim());

      const response = await fetch(`${API_BASE_URL}/plagiarism?${params}`, { headers: getHeaders() });
      if (!response.ok) throw new Error(`Failed to fetch reports: ${response.status}`);

      const data = await response.json();
      const items = Array.isArray(data) ? data : data.data || [];
      setReports(items);
      setStats({
        total: items.length,
        high: items.filter((r) => r.severity === 'HIGH').length,
        flagged: items.filter((r) => r.status === 'FLAGGED' || !r.status).length,
        clean: items.filter((r) => r.status === 'CLEAR' || r.status === 'REVIEWED').length,
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [getHeaders, severityFilter, search]);

  useEffect(() => { loadReports(); }, [loadReports]);
  useEffect(() => { setSeverityFilter('ALL'); }, [search]);

  const getSeverity = (r) => SEVERITY_CONFIG[r.severity] || SEVERITY_CONFIG.CLEAR;

  const SEVERITIES = ['ALL', 'HIGH', 'MEDIUM', 'LOW', 'CLEAR'];

  const handleScanComplete = () => {
    setShowScanner(false);
    loadReports();
    toast.success('Document scanned successfully.');
  };

  return (
    <div className="space-y-8 antialiased">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FFFFFF] bg-[#3D7FFF]/20 px-2.5 py-1 rounded">
            Academic Integrity
          </span>
          <h1 className="text-[19px] font-medium tracking-tight mt-2 text-slate-900">
            Plagiarism Reports
          </h1>
          <p className="text-[12px] text-slate-500 mt-1">
            Review flagged submissions and run similarity scans across documents.
          </p>
        </div>
        <button
          onClick={() => setShowScanner(!showScanner)}
          className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[#0A0A0A] text-white rounded-xl hover:bg-black transition-all shadow-md flex items-center gap-2"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {showScanner ? 'Close Scanner' : 'New Scan'}
        </button>
      </div>

      {/* Scanner Panel */}
      {showScanner && (
        <div className="max-w-md">
          <SimilarityScanner onScanComplete={handleScanComplete} />
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', gradient: 'from-slate-600 to-slate-700' },
          { label: 'High Severity', value: stats.high, icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z', gradient: 'from-red-500 to-rose-600' },
          { label: 'Flagged', value: stats.flagged, icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', gradient: 'from-amber-500 to-orange-600' },
          { label: 'Clean', value: stats.clean, icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z', gradient: 'from-emerald-500 to-teal-600' },
        ].map((card, idx) => (
          <div key={idx} className={`relative p-4 rounded-xl bg-gradient-to-br ${card.gradient} shadow-md overflow-hidden`}>
            <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-white/5 blur-sm" />
            <div className="relative z-10">
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={card.icon} />
                </svg>
                <p className="text-[9px] font-bold uppercase tracking-wider text-white/60">{card.label}</p>
              </div>
              <p className="text-xl font-black text-white mt-1 tabular-nums">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.603 10.602z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search submissions, students..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#3D7FFF] focus:ring-2 focus:ring-[#3D7FFF]/25 transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {SEVERITIES.map((s) => {
            const cfg = SEVERITY_CONFIG[s];
            return (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all ${
                  severityFilter === s
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
              >
                {s === 'ALL' ? 'All' : cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Report list */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 text-sm font-mono">
            <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Scanning reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-medium">No reports found</p>
            <p className="text-xs mt-1">All clear — no flagged submissions match your criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reports.map((report) => {
              const sv = getSeverity(report);
              const sim = report.similarity || 0;
              return (
                <div key={report.id} className="p-5 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900">{report.title || report.submissionTitle}</h4>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${sv.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sv.dot}`} />
                          {sv.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 flex-wrap">
                        <span className="font-semibold text-slate-700">{report.studentName || report.student}</span>
                        <span className="text-slate-300">|</span>
                        <span>{report.course || report.courseName}</span>
                        {report.institution && (
                          <>
                            <span className="text-slate-300">|</span>
                            <span className="font-mono text-slate-400">{report.institution}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${sv.bar}`} style={{ width: `${sim}%` }} />
                          </div>
                          <span className={`text-[11px] font-bold tabular-nums ${sim >= 75 ? 'text-red-600' : sim >= 40 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {sim}%
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{report.submittedAt || report.date}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border tracking-wider ${
                        report.status === 'REVIEWED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : report.status === 'FLAGGED'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : report.status === 'CLEAR'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {report.status || 'FLAGGED'}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button className="text-[10px] font-semibold text-[#FFFFFF] hover:text-[#0A0A0A] px-2 py-0.5 rounded bg-[#3D7FFF]/20 hover:bg-[#3D7FFF]/30 transition-colors">
                          View
                        </button>
                        <button className="text-[10px] font-semibold text-slate-500 hover:text-slate-700 px-2 py-0.5 rounded bg-slate-50 hover:bg-slate-100 transition-colors">
                          Dismiss
                        </button>
                      </div>
                    </div>
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