import React, { useState, useEffect, useCallback } from 'react';
import { entityProfileService } from '../../../services/api';

export const SchoolProfilePage = () => {
  const [entity, setEntity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await entityProfileService.getProfile();
      setEntity(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-RW', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gray-400">Institutional Overview</span>
          <h1 className="text-[19px] font-medium tracking-tight mt-1.5 text-[#1b1e26]">School Profile</h1>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
          <svg className="w-8 h-8 mx-auto animate-spin text-[#1b1e26]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
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
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gray-400">Institutional Overview</span>
          <h1 className="text-[19px] font-medium tracking-tight mt-1.5 text-[#1b1e26]">School Profile</h1>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-red-600">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="font-medium mb-1">Failed to load school profile</p>
          <p className="text-sm text-slate-500 mb-4">{error}</p>
          <button onClick={fetchProfile} className="px-4 py-2 bg-[#0E1412] text-white text-sm font-semibold rounded-xl hover:bg-black transition-colors">Retry</button>
        </div>
      </div>
    );
  }

  if (!entity) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gray-400">Institutional Overview</span>
          <h1 className="text-[19px] font-medium tracking-tight mt-1.5 text-[#1b1e26]">School Profile</h1>
          <p className="text-[12px] text-slate-500 mt-1">Official school details and contact information.</p>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border self-start ${
          entity.active
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-slate-100 text-slate-500 border-slate-200'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full mr-2 ${entity.active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          {entity.active ? 'Active' : 'Suspended'}
        </span>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {/* Header banner */}
        <div className="bg-gradient-to-r from-[#0E1412] to-[#1a2020] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 flex items-center justify-center ring-4 ring-white/20">
              <svg className="w-12 h-12 sm:w-14 sm:h-14 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div className="flex-1 text-white text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">{entity.name}</h2>
              <p className="text-white/70 text-sm sm:text-base mt-1 capitalize">{entity.type?.toLowerCase().replace(/_/g, ' ')}</p>
              <p className="text-white/50 text-xs mt-1 font-mono">{entity.code}</p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Contact */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Email</label>
                <p className="text-slate-900 font-medium break-all">{entity.contactPersonEmail || '—'}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Phone</label>
                <p className="text-slate-900 font-medium">{entity.contactPersonPhone || '—'}</p>
              </div>
              <div className="sm:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Address</label>
                <p className="text-slate-900 font-medium whitespace-pre-wrap">{entity.address || '—'}</p>
              </div>
              {entity.website && (
                <div className="sm:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Website</label>
                  <a
                    href={entity.website.startsWith('http') ? entity.website : `https://${entity.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1b1e26] hover:underline font-medium"
                  >
                    {entity.website}
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* Timestamps */}
          <section className="space-y-4 border-t border-slate-200 pt-6">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              System Timestamps
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Registered</label>
                <p className="text-slate-900 font-medium font-mono text-xs">{formatDate(entity.createdAt)}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Last Updated</label>
                <p className="text-slate-900 font-medium font-mono text-xs">{formatDate(entity.updatedAt)}</p>
              </div>
            </div>
          </section>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-800">Profile Editing</p>
              <p className="text-xs text-amber-700 mt-1">Profile updates require super-admin approval. Contact your system administrator to request changes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
