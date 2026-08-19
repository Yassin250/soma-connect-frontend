import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

const STATUS_STYLE = {
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  overdue: 'bg-red-50 text-red-700 border-red-200',
  cancelled: 'bg-slate-50 text-slate-500 border-slate-200',
  draft: 'bg-[#3D7FFF]/20 text-white border-[#3D7FFF]/50',
};

export const InvoicesPage = () => {
  const { token } = useAuth();
  const API_BASE_URL = 'http://localhost:5050/api/admin';

  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [stats, setStats] = useState({ total: 0, paid: 0, outstanding: 0 });
  const toast = useToast();

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  const loadInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (search.trim()) params.append('q', search.trim());

      const response = await fetch(`${API_BASE_URL}/invoices?${params}`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error(`Failed to fetch invoices: ${response.status}`);

      const data = await response.json();
      const items = Array.isArray(data) ? data : data.data || [];
      setInvoices(items);
      setStats({
        total: items.length,
        paid: items.filter((i) => i.status === 'paid').length,
        outstanding: items.filter((i) => i.status === 'pending' || i.status === 'overdue').length,
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [getHeaders, statusFilter, search]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  useEffect(() => {
    setStatusFilter('ALL');
  }, [search]);

  const STATUSES = ['ALL', 'paid', 'pending', 'overdue', 'cancelled', 'draft'];

  const formatRWF = (n) => `RWF ${(n || 0).toLocaleString()}`;

  return (
    <div className="space-y-8 antialiased">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white bg-[#3D7FFF]/20 px-2.5 py-1 rounded">
            Financials
          </span>
          <h1 className="text-[19px] font-medium tracking-tight mt-2 text-slate-900">
            Invoices
          </h1>
          <p className="text-[12px] text-slate-500 mt-1">
            Track billing documents, payment statuses, and invoice history.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Invoices', value: stats.total, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', accent: 'border-l-[#3D7FFF]', iconBg: 'bg-[#3D7FFF]/20', iconColor: 'text-white' },
          { label: 'Paid', value: stats.paid, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', accent: 'border-l-emerald-500', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
          { label: 'Outstanding', value: stats.outstanding, icon: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z', accent: 'border-l-amber-500', iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
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
            placeholder="Search invoices..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#3D7FFF] transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all capitalize ${
                statusFilter === s
                  ? 'bg-[#0A0A0A] text-white border-[#0A0A0A] shadow-sm'
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
            Loading invoices...
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-medium">No invoices found</p>
            <p className="text-xs mt-1">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#0A0A0A]/[0.06] bg-[#f4f6f8]">
                  {['Invoice', 'Institution', 'Amount', 'Status', 'Issued', 'Due'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#0A0A0A]/45 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#3D7FFF]/[0.08] transition-colors">
                    <td className="px-4 py-2.5">
                      <p className="text-[13px] font-semibold text-slate-900">{inv.number || `#${inv.id}`}</p>
                      {inv.description && <p className="text-xs text-slate-400 mt-0.5">{inv.description}</p>}
                    </td>
                    <td className="px-4 py-2.5 text-[13px] text-[#0A0A0A]/80">{inv.institution || inv.schoolName}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-[13px] font-bold text-slate-900">{formatRWF(inv.amount)}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border capitalize ${STATUS_STYLE[inv.status] || STATUS_STYLE.pending}`}>
                        {inv.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs font-mono text-slate-500">{inv.issuedDate || inv.createdAt}</td>
                    <td className="px-4 py-2.5 text-xs font-mono text-slate-500">{inv.dueDate || 'N/A'}</td>
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
