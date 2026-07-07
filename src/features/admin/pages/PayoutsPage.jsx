import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

const STATUS_STYLE = {
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
  cancelled: 'bg-slate-50 text-slate-500 border-slate-200',
};

export const PayoutsPage = () => {
  const { token } = useAuth();
  const API_BASE_URL = 'http://localhost:5050/api/admin';

  const [payouts, setPayouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const toast = useToast();

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  const loadPayouts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (search.trim()) params.append('q', search.trim());

      const response = await fetch(`${API_BASE_URL}/payouts?${params}`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error(`Failed to fetch payouts: ${response.status}`);

      const data = await response.json();
      const items = Array.isArray(data) ? data : data.data || [];
      setPayouts(items);
      setStats({
        total: items.length,
        completed: items.filter((p) => p.status === 'completed').length,
        pending: items.filter((p) => p.status === 'pending' || p.status === 'processing').length,
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [getHeaders, statusFilter, search]);

  useEffect(() => {
    loadPayouts();
  }, [loadPayouts]);

  useEffect(() => {
    setStatusFilter('ALL');
  }, [search]);

  const STATUSES = ['ALL', 'completed', 'pending', 'processing', 'failed', 'cancelled'];

  const formatRWF = (n) => `RWF ${(n || 0).toLocaleString()}`;

  return (
    <div className="space-y-8 antialiased">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">
            Financials
          </span>
          <h1 className="text-3xl font-black tracking-tight mt-2 text-slate-900">
            Payouts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage disbursements to institutions, partners, and vendors.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Payouts', value: stats.total, icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', accent: 'border-l-indigo-500', iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
          { label: 'Completed', value: stats.completed, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', accent: 'border-l-emerald-500', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
          { label: 'Pending', value: stats.pending, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', accent: 'border-l-amber-500', iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
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
            placeholder="Search payouts..."
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
            Loading payouts...
          </div>
        ) : payouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <p className="text-sm font-medium">No payouts found</p>
            <p className="text-xs mt-1">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Recipient', 'Amount', 'Status', 'Method', 'Date', 'Reference'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-900">{p.recipient || p.institution}</p>
                      {p.email && <p className="text-xs text-slate-400 mt-0.5">{p.email}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold text-slate-900">{formatRWF(p.amount)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border capitalize ${STATUS_STYLE[p.status] || STATUS_STYLE.pending}`}>
                        {p.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 capitalize">{p.method || p.paymentMethod || 'bank transfer'}</td>
                    <td className="px-5 py-4 text-xs font-mono text-slate-500">{p.processedAt || p.createdAt}</td>
                    <td className="px-5 py-4 text-xs font-mono text-slate-400">{p.reference || p.transactionId || '---'}</td>
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
