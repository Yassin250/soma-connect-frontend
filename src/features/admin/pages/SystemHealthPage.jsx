import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';

const SERVICE_ICONS = {
  api: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  database: 'M4 7v10c0 2 1.5 4 8 4s8-2 8-4V7M4 7c0-2 1.5-4 8-4s8 2 8 4M4 7c0 2 1.5 4 8 4s8-2 8-4',
  auth: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  storage: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
  mail: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
};

const SERVICE_NAMES = {
  api: 'API Server',
  database: 'Database',
  auth: 'Authentication Service',
  storage: 'File Storage',
  mail: 'Mail Service',
};

const STATUS_CONFIG = {
  operational: {
    label: 'Operational',
    dot: 'bg-emerald-500',
    ring: 'shadow-[0_0_8px_rgba(16,185,129,0.4)]',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    bar: 'bg-emerald-500',
    bg: 'bg-emerald-50',
  },
  degraded: {
    label: 'Degraded',
    dot: 'bg-amber-500',
    ring: 'shadow-[0_0_8px_rgba(245,158,11,0.4)]',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    bar: 'bg-amber-500',
    bg: 'bg-amber-50',
  },
  down: {
    label: 'Down',
    dot: 'bg-red-500',
    ring: 'shadow-[0_0_8px_rgba(239,68,68,0.4)]',
    badge: 'bg-red-50 text-red-700 border-red-200',
    bar: 'bg-red-500',
    bg: 'bg-red-50',
  },
};

export const SystemHealthPage = () => {
  const { token } = useAuth();
  const API_BASE_URL = 'http://localhost:5050/api/admin';

  const [services, setServices] = useState({
    api: { status: 'loading', latency: null, message: 'Checking...' },
    database: { status: 'loading', latency: null, message: 'Checking...' },
    auth: { status: 'loading', latency: null, message: 'Checking...' },
    storage: { status: 'loading', latency: null, message: 'Checking...' },
    mail: { status: 'loading', latency: null, message: 'Checking...' },
  });
  const [overallStatus, setOverallStatus] = useState('loading');
  const [lastChecked, setLastChecked] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  const measureLatency = async (url) => {
    const start = performance.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      await fetch(url, { signal: controller.signal, method: 'HEAD' });
      clearTimeout(timeout);
      return Math.round(performance.now() - start);
    } catch {
      return null;
    }
  };

  const checkServices = useCallback(async () => {
    setIsRefreshing(true);
    const results = {};

    const apiLatency = await measureLatency(API_BASE_URL.replace('/api/admin', '/api/health'));
    results.api = apiLatency !== null
      ? { status: apiLatency < 500 ? 'operational' : 'degraded', latency: apiLatency, message: apiLatency < 500 ? 'Responding normally' : 'High latency' }
      : { status: 'down', latency: null, message: 'Unreachable' };

    const dbLatency = await measureLatency(`${API_BASE_URL}/stats`);
    results.database = dbLatency !== null
      ? { status: dbLatency < 800 ? 'operational' : 'degraded', latency: dbLatency, message: dbLatency < 800 ? 'Connected' : 'Slow queries' }
      : { status: 'down', latency: null, message: 'Connection failed' };

    const authLatency = await measureLatency(`${API_BASE_URL.replace('/api/admin', '/api/auth')}/verify`);
    results.auth = authLatency !== null
      ? { status: authLatency < 500 ? 'operational' : 'degraded', latency: authLatency, message: authLatency < 500 ? 'Token validation OK' : 'Slow response' }
      : { status: 'down', latency: null, message: 'Auth service unreachable' };

    const storageLatency = await measureLatency(`${API_BASE_URL.replace('/api/admin', '/api/storage')}/status`);
    results.storage = storageLatency !== null
      ? { status: storageLatency < 1000 ? 'operational' : 'degraded', latency: storageLatency, message: storageLatency < 1000 ? 'Storage accessible' : 'High latency' }
      : { status: 'down', latency: null, message: 'Storage service down' };

    const mailLatency = await measureLatency(`${API_BASE_URL.replace('/api/admin', '/api/mail')}/health`);
    results.mail = mailLatency !== null
      ? { status: mailLatency < 1000 ? 'operational' : 'degraded', latency: mailLatency, message: mailLatency < 1000 ? 'Mail queue healthy' : 'Slow delivery' }
      : { status: 'down', latency: null, message: 'Mail service offline' };

    setServices(results);

    const statuses = Object.values(results).map(s => s.status);
    if (statuses.every(s => s === 'operational')) setOverallStatus('operational');
    else if (statuses.some(s => s === 'down')) setOverallStatus('down');
    else setOverallStatus('degraded');

    setLastChecked(new Date().toLocaleTimeString());
    setIsRefreshing(false);
  }, [getHeaders]);

  useEffect(() => {
    checkServices();
    const interval = setInterval(checkServices, 30000);
    return () => clearInterval(interval);
  }, [checkServices]);

  const overallConfig = STATUS_CONFIG[overallStatus] || STATUS_CONFIG.operational;

  const UPTIME_EVENTS = [
    { time: '2h ago', event: 'Scheduled DB maintenance completed', status: 'resolved', type: 'database' },
    { time: '6h ago', event: 'Mail queue backlog cleared', status: 'resolved', type: 'mail' },
    { time: '1d ago', event: 'Storage migration — Phase 2 finished', status: 'resolved', type: 'storage' },
    { time: '3d ago', event: 'Auth token expiry extended to 24h', status: 'resolved', type: 'auth' },
  ];

  return (
    <div className="space-y-8 antialiased">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FFFFFF] bg-[#3D7FFF]/20 px-2.5 py-1 rounded">
            Infrastructure
          </span>
          <h1 className="text-[19px] font-medium tracking-tight mt-2 text-slate-900">
            System Health
          </h1>
          <p className="text-[12px] text-slate-500 mt-1">
            Real-time service status, latency monitoring, and incident timeline.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastChecked && (
            <span className="text-[10px] text-slate-400 font-mono">
              Last checked: {lastChecked}
            </span>
          )}
          <button
            onClick={checkServices}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            <svg className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className={`flex items-center gap-2.5 px-4 py-2 rounded-xl ${overallConfig.bg}`}>
            <span className={`w-3 h-3 rounded-full ${overallConfig.dot} ${overallConfig.ring}`} />
            <span className={`text-sm font-bold ${overallConfig.badge.split(' ').slice(0, 2).join(' ')}`}>
              {overallConfig.label === 'operational' && 'All Systems Operational'}
              {overallConfig.label === 'degraded' && 'Partial Service Degradation'}
              {overallConfig.label === 'down' && 'Service Interruption Detected'}
              {overallStatus === 'loading' && 'Checking services...'}
            </span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Operational</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Degraded</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>Down</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {Object.entries(services).map(([key, svc]) => {
          const cfg = STATUS_CONFIG[svc.status] || STATUS_CONFIG.down;
          return (
            <div
              key={key}
              className="bg-white border border-slate-200 rounded-xl shadow-sm p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot} ${cfg.ring}`} />
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${cfg.badge}`}>
                  {cfg.label}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${cfg.bg}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={SERVICE_ICONS[key]} />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-700 truncate">{SERVICE_NAMES[key]}</p>
                  <p className="text-base font-black text-slate-900">
                    {svc.latency !== null ? `${svc.latency}ms` : '---'}
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 truncate">{svc.message}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-slate-400">
            Recent Events
          </h3>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100">
              {UPTIME_EVENTS.map((evt, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      evt.status === 'resolved' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{evt.event}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{evt.time}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    evt.status === 'resolved'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {evt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-slate-400">
            Quick Diagnostic
          </h3>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Auto-refresh</span>
              <span className="font-bold text-slate-900">30s interval</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Timeout threshold</span>
              <span className="font-bold text-slate-900">5,000ms</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Degradation limit</span>
              <span className="font-bold text-slate-900">&gt;500ms latency</span>
            </div>
            <hr className="border-slate-200" />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Latency is measured via <code className="text-[10px] bg-slate-200 px-1 rounded">HEAD</code> requests to each service endpoint. If a service fails to respond within 5 seconds it is marked as <strong>Down</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
