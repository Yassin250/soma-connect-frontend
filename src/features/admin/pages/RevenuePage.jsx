import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

const CHANNEL_ICONS = {
  subscriptions: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
  payouts: 'M21 12V7H5a2 2 0 010-4h14v4M3 5v14a2 2 0 002 2h16v-5M18 12a2 2 0 000 4h4v-4h-4z',
  adjustments: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
};

const CHANNEL_COLORS = {
  subscriptions: { bg: 'bg-[#8B5CF6]', text: 'text-[#FFFFFF]' },
  payouts: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  adjustments: { bg: 'bg-amber-50', text: 'text-amber-600' },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const RevenuePage = () => {
  const { token } = useAuth();
  const API_BASE_URL = 'http://localhost:5050/api/admin';

  const [total, setTotal] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [breakdown, setBreakdown] = useState({ subscriptions: 0, payouts: 0, adjustments: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  const loadRevenue = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/revenue`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error(`Failed to fetch revenue: ${response.status}`);

      const data = await response.json();
      const rev = data.data || data;

      setTotal(rev.total || 0);
      setMonthlyData(Array.isArray(rev.monthly) ? rev.monthly : []);
      setBreakdown({
        subscriptions: rev.subscriptions || rev.channels?.subscriptions || 0,
        payouts: rev.payouts || rev.channels?.payouts || 0,
        adjustments: rev.adjustments || rev.channels?.adjustments || 0,
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    loadRevenue();
  }, [loadRevenue]);

  const maxMonthly = Math.max(...monthlyData.map((m) => m.amount || 0), 1);

  const channels = [
    { key: 'subscriptions', label: 'Subscriptions', value: breakdown.subscriptions },
    { key: 'payouts', label: 'Payouts', value: breakdown.payouts },
    { key: 'adjustments', label: 'Adjustments', value: breakdown.adjustments },
  ];

  const maxChannel = Math.max(...channels.map((c) => c.value), 1);

  const formatRWF = (n) => `RWF ${(n || 0).toLocaleString()}`;

  return (
    <div className="space-y-8 antialiased">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FFFFFF] bg-[#8B5CF6]/20 px-2.5 py-1 rounded">
            Financials
          </span>
          <h1 className="text-[19px] font-medium tracking-tight mt-2 text-slate-900">
            Revenue
          </h1>
          <p className="text-[12px] text-slate-500 mt-1">
            Platform revenue overview, monthly trends, and channel breakdown.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Revenue</p>
          <p className="text-4xl sm:text-5xl font-black text-slate-900 mt-1">{formatRWF(total)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-5">Monthly Trends</h3>
          {isLoading ? (
            <div className="h-48 flex items-center justify-center text-xs text-slate-400 font-mono">Loading chart...</div>
          ) : monthlyData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-slate-400">No monthly data available.</div>
          ) : (
            <div className="flex items-end gap-2 h-48">
              {monthlyData.map((m, idx) => {
                const pct = maxMonthly > 0 ? ((m.amount || 0) / maxMonthly) * 100 : 0;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[9px] font-bold text-slate-500">{formatRWF(m.amount || 0)}</span>
                    <div
                      className="w-full bg-[#8B5CF6] rounded-t-md transition-all"
                      style={{ height: `${Math.max(pct, 2)}%` }}
                    />
                    <span className="text-[9px] font-mono text-slate-400">{m.month || MONTHS[idx] || idx + 1}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-5">Revenue Channels</h3>
          <div className="space-y-5">
            {channels.map((ch) => {
              const colors = CHANNEL_COLORS[ch.key] || { bg: 'bg-slate-50', text: 'text-slate-600' };
              const pct = maxChannel > 0 ? (ch.value / maxChannel) * 100 : 0;
              return (
                <div key={ch.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${colors.bg} ${colors.text}`}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d={CHANNEL_ICONS[ch.key]} />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{ch.label}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900">{formatRWF(ch.value)}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${colors.bg.replace('50', '500')}`} style={{ width: `${Math.max(pct, 2)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};
