import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

const TYPE_CONFIG = {
  AUTH: { dot: 'bg-[#1b1e26]', badge: 'bg-[#1b1e26]/[0.06] text-[#1b1e26] ring-[#1b1e26]/10', label: 'Auth' },
  USER: { dot: 'bg-[#2e7d32]', badge: 'bg-[#d0f24a]/25 text-[#1b5e20] ring-[#d0f24a]/40', label: 'User' },
  SCHOOL: { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200', label: 'School' },
  ROLE: { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 ring-amber-200', label: 'Role' },
  PERMISSION: { dot: 'bg-lime-600', badge: 'bg-lime-50 text-lime-700 ring-lime-200', label: 'Permission' },
  SYSTEM: { dot: 'bg-slate-400', badge: 'bg-slate-50 text-slate-600 ring-slate-200', label: 'System' },
};

const PER_PAGE = 15;
const API_BASE_URL = 'http://localhost:5050/api/admin';

const formatTimestamp = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const AuditLogsPage = () => {
  const { token, logout } = useAuth();

  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedLog, setSelectedLog] = useState(null);

  // useToast() hands back a fresh object every provider render. Keeping it in a
  // ref (instead of an effect/callback dependency) is what stops the load effect
  // from re-firing on every render — the bug that hammered the API with 500s.
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  // Debounce the search box so we hit the server once the user pauses typing.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(id);
  }, [search]);

  // Any change to the filters should bring us back to the first page.
  useEffect(() => {
    setPage(1);
  }, [typeFilter, debouncedSearch]);

  const loadLogs = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PER_PAGE) });
      if (typeFilter !== 'ALL') params.append('type', typeFilter);
      if (debouncedSearch) params.append('q', debouncedSearch);

      const res = await fetch(`${API_BASE_URL}/audit-logs?${params}`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        toastRef.current.error('Session expired. Please sign in again.');
        logout();
        return;
      }
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const json = await res.json();
      const payload = json?.data ?? json;
      const items = Array.isArray(payload) ? payload : payload?.data || [];
      setLogs(items);
      setTotal(payload?.total ?? items.length);
      setTotalPages(payload?.totalPages || Math.max(1, Math.ceil((payload?.total || items.length) / PER_PAGE)));
    } catch (err) {
      toastRef.current.error(err.message || 'Failed to load audit logs');
      setLogs([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [token, page, typeFilter, debouncedSearch, logout]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const getTypeConfig = (type) => TYPE_CONFIG[type?.toUpperCase()] || TYPE_CONFIG.SYSTEM;

  return (
    <div className="space-y-7 antialiased max-w-[1400px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[#1b1e26]/[0.08] pb-6">
        <div>
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.16em] text-[#1b5e20] bg-[#d0f24a]/40 px-2.5 py-1 rounded-full">
            Security &amp; Compliance
          </span>
          <h1 className="text-[19px] font-medium tracking-tight mt-3 text-[#1b1e26]">Audit Logs</h1>
          <p className="text-[12px] text-gray-500 mt-1">
            Chronological record of administrative actions and system events.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold bg-[#d0f24a] text-[#1b5e20] rounded-full px-4 py-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#2e7d32] animate-pulse" />
          {total} events tracked
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.603 10.602z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events, admins, actions..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#1b1e26]/10 rounded-xl text-xs font-medium text-[#1b1e26] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d0f24a]/50 focus:border-[#d0f24a] transition-shadow"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['ALL', ...Object.keys(TYPE_CONFIG)].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                typeFilter === t
                  ? 'bg-[#1b1e26] text-[#d0f24a] border-[#1b1e26] shadow-sm'
                  : 'bg-white text-gray-500 border-[#1b1e26]/10 hover:border-[#d0f24a] hover:text-[#1b1e26]'
              }`}
            >
              {t === 'ALL' ? 'All' : TYPE_CONFIG[t]?.label || t}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#1b1e26]/[0.06] rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(27,30,38,0.04),0_8px_24px_rgba(27,30,38,0.04)]">
        {isLoading ? (
          <div className="divide-y divide-[#1b1e26]/[0.04]">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-4 flex items-start gap-3.5">
                <div className="w-2 h-2 rounded-full mt-1.5 skeleton-shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 rounded-full skeleton-shimmer" style={{ width: `${40 + ((i * 9) % 40)}%` }} />
                  <div className="h-2.5 rounded-full skeleton-shimmer" style={{ width: `${25 + ((i * 7) % 30)}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="w-14 h-14 rounded-2xl bg-[#d0f24a]/20 text-[#1b1e26]/70 flex items-center justify-center mb-4 ring-1 ring-[#d0f24a]/30">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </span>
            <p className="text-sm font-semibold text-[#1b1e26]">No audit logs found</p>
            <p className="text-xs text-gray-400 mt-1.5">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1b1e26]/[0.05]">
            {logs.map((log) => {
              const cfg = getTypeConfig(log.type);
              const isOpen = selectedLog?.id === log.id;
              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(isOpen ? null : log)}
                  className={`p-4 flex items-start justify-between cursor-pointer transition-colors hover:bg-[#d0f24a]/[0.08] ${
                    isOpen ? 'bg-[#d0f24a]/[0.12]' : ''
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-[#1b1e26] truncate">
                          {log.action || log.event}
                        </span>
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ring-1 ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="font-mono">{formatTimestamp(log.timestamp || log.createdAt)}</span>
                        {log.adminName && (
                          <>
                            <span className="text-gray-300">|</span>
                            <span className="font-medium text-gray-500">{log.adminName}</span>
                          </>
                        )}
                      </div>
                      {log.description && (
                        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{log.description}</p>
                      )}
                    </div>
                  </div>
                  <svg className={`w-4 h-4 text-gray-300 mt-1 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1b1e26]/[0.05] bg-[#fafbfc]/60">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[#1b1e26]/10 bg-white text-[#1b1e26] hover:bg-[#d0f24a]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <span className="text-xs text-gray-500 font-mono">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[#1b1e26]/10 bg-white text-[#1b1e26] hover:bg-[#d0f24a]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {selectedLog && (
        <div className="bg-white border border-[#1b1e26]/[0.08] rounded-2xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Event Details</h4>
            <button
              onClick={() => setSelectedLog(null)}
              className="text-xs font-semibold text-gray-400 hover:text-[#1b1e26] transition-colors"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-gray-400 font-medium">Event ID</span>
              <p className="font-mono text-[#1b1e26] font-semibold break-all">{selectedLog.id}</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 font-medium">Timestamp</span>
              <p className="font-mono text-[#1b1e26] font-semibold">{formatTimestamp(selectedLog.timestamp || selectedLog.createdAt)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 font-medium">Admin</span>
              <p className="font-semibold text-[#1b1e26]">{selectedLog.adminName || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 font-medium">Type</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ring-1 ${getTypeConfig(selectedLog.type).badge}`}>
                {getTypeConfig(selectedLog.type).label}
              </span>
            </div>
          </div>
          <div className="space-y-1 pt-3 border-t border-[#1b1e26]/[0.06]">
            <span className="text-xs text-gray-400 font-medium">Action</span>
            <p className="text-sm font-bold text-[#1b1e26]">{selectedLog.action || selectedLog.event}</p>
          </div>
          {selectedLog.description && (
            <div className="space-y-1">
              <span className="text-xs text-gray-400 font-medium">Description</span>
              <p className="text-sm text-gray-700">{selectedLog.description}</p>
            </div>
          )}
          {selectedLog.metadata && (
            <div className="space-y-1">
              <span className="text-xs text-gray-400 font-medium">Metadata</span>
              <pre className="text-xs bg-[#fafbfc] border border-[#1b1e26]/[0.06] rounded-lg p-3 font-mono text-gray-600 overflow-x-auto">
                {typeof selectedLog.metadata === 'string' ? selectedLog.metadata : JSON.stringify(selectedLog.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
