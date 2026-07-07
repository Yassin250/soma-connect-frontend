import React from 'react';

export const SchoolOverviewPage = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">Institutional Overview</span>
        <h1 className="text-2xl font-black tracking-tight mt-2 text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Total students, active teachers, today's attendance, and pending fees.</p>
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: 'Total Students', value: '—', color: 'from-blue-500 to-blue-700' },
        { label: 'Active Teachers', value: '—', color: 'from-emerald-500 to-emerald-700' },
        { label: "Today's Attendance", value: '—', color: 'from-amber-500 to-amber-700' },
        { label: 'Pending Fees', value: '—', color: 'from-rose-500 to-rose-700' },
      ].map((card, i) => (
        <div key={i} className={`bg-gradient-to-br ${card.color} rounded-xl p-4 text-white shadow-lg`}>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70">{card.label}</p>
          <p className="text-3xl font-black mt-1">{card.value}</p>
        </div>
      ))}
    </div>
  </div>
);
