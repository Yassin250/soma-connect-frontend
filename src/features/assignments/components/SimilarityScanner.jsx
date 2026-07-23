import React, { useState, useRef } from 'react';
import { usePlagiarismCheck } from '../hooks/usePlagiarismCheck';

const SEVERITY_STYLES = {
  HIGH: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', dot: 'bg-red-500', bar: 'bg-red-500', label: 'High Risk' },
  MEDIUM: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500', bar: 'bg-amber-500', label: 'Medium Risk' },
  LOW: { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-500', bar: 'bg-yellow-500', label: 'Low Risk' },
  CLEAR: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', bar: 'bg-emerald-500', label: 'No Issues' },
};

export const SimilarityScanner = ({ onScanComplete, title, studentName, course }) => {
  const { scanDocument, scanning, result, error, reset } = usePlagiarismCheck();
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) setFile(selected);
  };

  const handleScan = async () => {
    if (!file) return;
    try {
      const res = await scanDocument(file, { title, studentName, course });
      if (onScanComplete) onScanComplete(res);
    } catch {}
  };

  const handleReset = () => {
    setFile(null);
    reset();
  };

  const sev = result ? (SEVERITY_STYLES[result.severity] || SEVERITY_STYLES.CLEAR) : null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#1b1e26]/[0.06] text-[#1b1e26]/70">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Similarity Scanner</h3>
            <p className="text-[11px] text-slate-400">Upload a document to check for plagiarism.</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        {!result ? (
          <>
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragOver ? 'border-[#d0f24a]/50 bg-[#d0f24a]/20' : file ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 hover:border-slate-300 bg-slate-50'
              }`}
            >
              <input ref={inputRef} type="file" accept=".txt,.pdf,.docx" onChange={handleSelect} className="hidden" />
              {file ? (
                <div className="space-y-2">
                  <svg className="w-8 h-8 mx-auto text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium text-slate-900">{file.name}</p>
                  <p className="text-[11px] text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <svg className="w-8 h-8 mx-auto text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <p className="text-sm font-medium text-slate-600">Drop a file or click to browse</p>
                  <p className="text-[10px] text-slate-400">Supports .txt, .pdf, .docx</p>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={handleScan}
              disabled={!file || scanning}
              className={`mt-4 w-full py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                !file || scanning
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-[#1b1e26] text-white shadow-sm hover:bg-black'
              }`}
            >
              {scanning ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Scanning...
                </span>
              ) : 'Run Similarity Check'}
            </button>
          </>
        ) : (
          /* Result card */
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border ${sev.bg}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${sev.dot}`} />
                  <span className={`text-xs font-bold uppercase tracking-wider ${sev.text}`}>{sev.label}</span>
                </div>
                <span className={`text-xl font-black ${sev.text}`}>{result.similarity}%</span>
              </div>
              <div className="h-2 bg-white/60 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${sev.bar}`} style={{ width: `${result.similarity}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                <div>
                  <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Status</p>
                  <p className="font-semibold text-slate-800">{result.status}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Severity</p>
                  <p className="font-semibold text-slate-800">{result.severity}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
            >
              Scan Another Document
            </button>
          </div>
        )}
      </div>
    </div>
  );
};