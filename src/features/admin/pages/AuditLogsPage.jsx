import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

const TYPE_CONFIG = {
  AUTH: { dot: 'bg-violet-500', badge: 'bg-violet-50 text-violet-700 border-violet-200', label: 'Auth' },
  USER: { dot: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 border-blue-200', label: 'User' },
  SCHOOL: { dot: 'bg-indigo-500', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'School' },
  ROLE: { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Role' },
  PERMISSION: { dot: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Permission' },
  SYSTEM: { dot: 'bg-slate-500', badge: 'bg-slate-50 text-slate-700 border-slate-200', label: 'System' },
};

export const AuditLogsPage = () => {
  const { token, refreshAccessToken } = useAuth();
  const API_BASE_URL = 'http://localhost:5050/api/admin';

  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const PER_PAGE = 15;
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
        if (!retryRes.ok) throw new Error(`Failed: ${retryRes.status}`);
        return retryRes.json();
      }
      throw new Error('Session expired. Please log in again.');
    }
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    return res.json();
  }, [getHeaders, refreshAccessToken]);

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: PER_PAGE });
      if (typeFilter !== 'ALL') params.append('type', typeFilter);
      if (search.trim()) params.append('q', search.trim());

      const json = await fetchWithAuth(`${API_BASE_URL}/audit-logs?${params}`);
      const payload = json.data || json;
      const items = Array.isArray(payload) ? payload : (payload.data || []);
      setLogs(items);
      setTotalPages(payload.totalPages || Math.ceil((payload.total || items.length) / PER_PAGE) || 1);
    } catch (err) {
      toast.error(err.message);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithAuth, page, typeFilter, search, toast]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    setPage(1);
  }, [typeFilter, search]);

  const filteredLogs = logs;

  const getTypeConfig = (type) => TYPE_CONFIG[type?.toUpperCase()] || TYPE_CONFIG.SYSTEM;

  return (
    <div className="space-y-8 antialiased">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">
            Security &amp; Compliance
          </span>
          <h1 className="text-3xl font-black tracking-tight mt-2 text-slate-900">
            Audit Logs
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Chronological record of administrative actions and system events.
          </p>
        </div>
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
            placeholder="Search events, users, actions..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['ALL', ...Object.keys(TYPE_CONFIG)].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                typeFilter === t
                  ? 'bg-[#1d4ed8] text-white border-[#1d4ed8] shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              {t === 'ALL' ? 'All' : TYPE_CONFIG[t]?.label || t}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 text-sm font-mono">
            Loading audit trail...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-sm font-medium">No audit logs found</p>
            <p className="text-xs mt-1">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => {
              const cfg = getTypeConfig(log.type);
              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                  className={`p-4 flex items-start justify-between cursor-pointer transition-all hover:bg-slate-50 ${
                    selectedLog?.id === log.id ? 'bg-indigo-50/40' : ''
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-900 truncate">
                          {log.action || log.event}
                        </span>
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full border ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span className="font-mono">{log.timestamp || log.createdAt}</span>
                        {log.adminName && (
                          <>
                            <span className="text-slate-300">|</span>
                            <span className="font-medium text-slate-500">{log.adminName}</span>
                          </>
                        )}
                      </div>
                      {log.description && (
                        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{log.description}</p>
                      )}
                    </div>
                  </div>
                  <svg className={`w-4 h-4 text-slate-300 mt-1 flex-shrink-0 transition-transform ${selectedLog?.id === log.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <span className="text-xs text-slate-500 font-mono">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {selectedLog && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Event Details</h4>
            <button
              onClick={() => setSelectedLog(null)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Event ID</span>
              <p className="font-mono text-slate-800 font-semibold">{selectedLog.id}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Timestamp</span>
              <p className="font-mono text-slate-800 font-semibold">{selectedLog.timestamp || selectedLog.createdAt}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Admin</span>
              <p className="font-semibold text-slate-800">{selectedLog.adminName || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Type</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${getTypeConfig(selectedLog.type).badge}`}>
                {getTypeConfig(selectedLog.type).label}
              </span>
            </div>
          </div>
          <div className="space-y-1 pt-2 border-t border-slate-200">
            <span className="text-xs text-slate-400 font-medium">Action</span>
            <p className="text-sm font-bold text-slate-900">{selectedLog.action || selectedLog.event}</p>
          </div>
          {selectedLog.description && (
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium">Description</span>
              <p className="text-sm text-slate-700">{selectedLog.description}</p>
            </div>
          )}
          {selectedLog.metadata && (
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium">Metadata</span>
              <pre className="text-xs bg-white border border-slate-200 rounded-lg p-3 font-mono text-slate-600 overflow-x-auto">
                {typeof selectedLog.metadata === 'string' ? selectedLog.metadata : JSON.stringify(selectedLog.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
