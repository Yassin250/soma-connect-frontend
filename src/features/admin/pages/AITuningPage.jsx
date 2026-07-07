import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

const PARAMS = [
  {
    key: 'plagiarismThreshold',
    label: 'Plagiarism Sensitivity',
    min: 0, max: 100, step: 1, unit: '%',
    desc: 'Minimum similarity score to flag a submission.',
    icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
    gradient: 'from-rose-500 to-pink-600',
    lightBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    barColor: 'bg-rose-500',
    trackColor: 'bg-rose-100',
  },
  {
    key: 'similarityCutoff',
    label: 'Similarity Cutoff',
    min: 0, max: 100, step: 1, unit: '%',
    desc: 'Threshold below which similarity is acceptable.',
    icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    gradient: 'from-blue-500 to-indigo-600',
    lightBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    barColor: 'bg-blue-500',
    trackColor: 'bg-blue-100',
  },
  {
    key: 'matchingAccuracy',
    label: 'Matching Accuracy',
    min: 50, max: 100, step: 0.5, unit: '%',
    desc: 'Required precision for text matching.',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    gradient: 'from-emerald-500 to-teal-600',
    lightBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    barColor: 'bg-emerald-500',
    trackColor: 'bg-emerald-100',
  },
  {
    key: 'autoFlagScore',
    label: 'Auto-Flag Score',
    min: 0, max: 100, step: 1, unit: '%',
    desc: 'Score at which submissions auto-flag.',
    icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    gradient: 'from-amber-500 to-orange-600',
    lightBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    barColor: 'bg-amber-500',
    trackColor: 'bg-amber-100',
  },
  {
    key: 'maxTokens',
    label: 'Max Tokens',
    min: 256, max: 8192, step: 256, unit: '',
    desc: 'Output token limit for AI analysis.',
    icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4',
    gradient: 'from-violet-500 to-purple-600',
    lightBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    barColor: 'bg-violet-500',
    trackColor: 'bg-violet-100',
  },
  {
    key: 'temperature',
    label: 'Temperature',
    min: 0, max: 2, step: 0.1, unit: '',
    desc: 'Randomness in AI outputs. Lower = deterministic.',
    icon: 'M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z',
    gradient: 'from-cyan-500 to-sky-600',
    lightBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    barColor: 'bg-cyan-500',
    trackColor: 'bg-cyan-100',
  },
];

const getRiskLevel = (key, value) => {
  if (key === 'plagiarismThreshold') {
    if (value < 30) return { label: 'Aggressive', color: 'text-rose-600 bg-rose-50 border-rose-200' };
    if (value < 60) return { label: 'Balanced', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    return { label: 'Lenient', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  }
  if (key === 'similarityCutoff') {
    if (value < 20) return { label: 'Strict', color: 'text-rose-600 bg-rose-50 border-rose-200' };
    if (value < 50) return { label: 'Moderate', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    return { label: 'Relaxed', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  }
  if (key === 'temperature') {
    if (value < 0.5) return { label: 'Precise', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    if (value < 1.2) return { label: 'Balanced', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    return { label: 'Creative', color: 'text-purple-600 bg-purple-50 border-purple-200' };
  }
  return null;
};

export const AITuningPage = () => {
  const { token } = useAuth();
  const API_BASE_URL = 'http://localhost:5050/api/admin';

  const [params, setParams] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hoveredParam, setHoveredParam] = useState(null);
  const toast = useToast();

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/ai-tuning`, { headers: getHeaders() });
      if (response.ok) {
        const data = await response.json();
        const config = data.data || data || {};
        const merged = {};
        PARAMS.forEach((p) => { merged[p.key] = config[p.key] !== undefined ? config[p.key] : p.min; });
        setParams(merged);
      } else {
        const merged = {};
        PARAMS.forEach((p) => { merged[p.key] = p.min; });
        setParams(merged);
      }
    } catch {
      const merged = {};
      PARAMS.forEach((p) => { merged[p.key] = p.min; });
      setParams(merged);
    } finally {
      setIsLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  const handleChange = (key, value) => {
    setParams((prev) => ({ ...prev, [key]: Number(value) }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/ai-tuning`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(params),
      });
      if (!response.ok) throw new Error(`Failed to save: ${response.status}`);
      toast.success('AI tuning parameters saved successfully.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    const merged = {};
    PARAMS.forEach((p) => { merged[p.key] = p.min; });
    setParams(merged);
    toast.info('Parameters reset to defaults.');
  };

  const summaryRisk = useMemo(() => {
    const p = params;
    if (!p.plagiarismThreshold) return 'Idle';
    const flags = [
      p.plagiarismThreshold < 40 ? 1 : 0,
      p.similarityCutoff < 30 ? 1 : 0,
      p.matchingAccuracy > 85 ? 1 : 0,
      p.autoFlagScore < 40 ? 1 : 0,
    ];
    const score = flags.reduce((a, b) => a + b, 0);
    if (score >= 3) return 'Strict';
    if (score >= 1) return 'Balanced';
    return 'Relaxed';
  }, [params]);

  const statusColor = summaryRisk === 'Strict' ? 'text-rose-600 bg-rose-50 border-rose-200'
    : summaryRisk === 'Balanced' ? 'text-amber-600 bg-amber-50 border-amber-200'
    : 'text-emerald-600 bg-emerald-50 border-emerald-200';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-400 text-sm font-mono">
        <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading AI configuration...
      </div>
    );
  }

  return (
    <div className="space-y-8 antialiased">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">
              Intelligence Engine
            </span>
            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusColor}`}>
              {summaryRisk}
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight mt-2 text-slate-900">AI Tuning</h1>
          <p className="text-sm text-slate-500 mt-1">
            Fine-tune detection thresholds, model parameters, and scoring behaviour.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleReset} className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all">
            Reset
          </button>
          <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-200">
            {isSaving ? (
              <span className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </span>
            ) : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Parameters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {PARAMS.map((param) => {
          const value = params[param.key] !== undefined ? params[param.key] : param.min;
          const pct = ((value - param.min) / (param.max - param.min)) * 100;
          const risk = getRiskLevel(param.key, value);
          const isHovered = hoveredParam === param.key;

          return (
            <div
              key={param.key}
              onMouseEnter={() => setHoveredParam(param.key)}
              onMouseLeave={() => setHoveredParam(null)}
              className={`relative bg-white border rounded-2xl shadow-sm overflow-hidden transition-all duration-300 ${
                isHovered ? 'shadow-lg border-slate-300 -translate-y-0.5' : 'border-slate-200'
              }`}
            >
              {/* Top gradient bar */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${param.gradient}`} />

              <div className="p-5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl ${param.lightBg} ${param.iconColor} shrink-0`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d={param.icon} />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 truncate">{param.label}</h3>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{param.desc}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xl font-black text-slate-900 tabular-nums">{value}</span>
                    {param.unit && <span className="text-xs font-bold text-slate-400 ml-0.5">{param.unit}</span>}
                  </div>
                </div>

                {/* Slider */}
                <div className="mt-5">
                  <div className="flex justify-between text-[9px] font-semibold text-slate-400 mb-1.5 px-0.5">
                    <span>{param.min}{param.unit}</span>
                    <span>{param.max}{param.unit}</span>
                  </div>
                  <div className="relative">
                    {/* Custom track background */}
                    <div className={`absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 rounded-full ${param.trackColor}`} />
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 left-0 h-2 rounded-full bg-gradient-to-r ${param.gradient} transition-[width] duration-150`}
                      style={{ width: `${pct}%` }}
                    />
                    <input
                      type="range"
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      value={value}
                      onChange={(e) => handleChange(param.key, e.target.value)}
                      className="relative w-full h-2 appearance-none bg-transparent cursor-pointer z-10
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
                        [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-300
                        [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-150
                        [&::-webkit-slider-thumb]:hover:border-indigo-400 [&::-webkit-slider-thumb]:hover:shadow-lg"
                    />
                  </div>
                </div>

                {/* Footer: risk badge + quick info */}
                <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-slate-100">
                  {risk ? (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${risk.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${risk.color.split(' ')[0].replace('text-', 'bg-')}`} />
                      {risk.label}
                    </span>
                  ) : <div />}
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{Math.round(pct)}% capacity</span>
                  </div>
                </div>
              </div>

              {/* Hover glow */}
              <div className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 opacity-0 ${isHovered ? 'opacity-100' : ''}`}
                style={{ boxShadow: 'inset 0 0 0 1px rgba(99,102,241,0.1)' }}
              />
            </div>
          );
        })}
      </div>

      {/* Live preview / simulation panel */}
      <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Live Preview</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Plagiarism Flag Rate', value: `${Math.min(100, Math.round(((params.plagiarismThreshold || 75) / 100) * (params.autoFlagScore || 70)))}%`, desc: 'Estimated auto-flag rate based on current thresholds', color: 'text-indigo-600' },
            { label: 'Detection Sensitivity', value: summaryRisk, desc: 'Overall strictness of the detection engine', color: 'text-violet-600' },
            { label: 'AI Model Profile', value: (params.temperature || 0.7) < 0.5 ? 'Deterministic' : (params.temperature || 0.7) < 1.2 ? 'Balanced' : 'Creative', desc: 'Behaviour profile of the AI analysis model', color: 'text-cyan-600' },
            { label: 'Match Precision', value: `${params.matchingAccuracy || 85}%`, desc: 'Text matching precision threshold', color: 'text-emerald-600' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
              <p className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-slate-400 mt-1">{stat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};