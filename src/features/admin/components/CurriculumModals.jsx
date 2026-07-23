import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export const MODULE_TYPES = ['OVERVIEW', 'LESSON', 'ASSESSMENT'];
export const ITEM_TYPES = ['VIDEO', 'READING', 'QUIZ', 'ASSIGNMENT', 'FILE', 'LINK'];

const humanize = (v) =>
  String(v || '').replace(/[_-]+/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const inputClass =
  'w-full rounded-xl bg-[#f7f8fa] border border-[#1b1e26]/10 px-3.5 py-2.5 text-[13px] text-[#1b1e26] placeholder-gray-400 focus:bg-white focus:border-[#d0f24a] focus:ring-2 focus:ring-[#d0f24a]/25 focus:outline-none transition-all';
const labelClass = 'block text-[10px] font-bold text-[#1b1e26]/45 uppercase tracking-[0.14em] mb-1.5';

// Shared modal shell — ink/lime, portalled, esc-to-close, backdrop-dismiss.
const ModalShell = ({ title, subtitle, icon, onClose, children, maxW = '480px' }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1b1e26]/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} role="presentation">
      <div
        className="relative w-full bg-white rounded-3xl border border-[#1b1e26]/[0.06] shadow-[0_20px_60px_rgba(27,30,38,0.25)] p-6 sm:p-7 animate-in zoom-in-95 fade-in duration-200"
        style={{ maxWidth: maxW }}
        onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true"
      >
        <button type="button" onClick={onClose} aria-label="Close" className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center text-rose-500 bg-rose-50 hover:bg-rose-100 transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" /></svg>
        </button>
        <div className="mb-5 pr-8">
          <span className="w-11 h-11 rounded-2xl bg-[#d0f24a]/25 text-[#1b1e26] flex items-center justify-center mb-3">
            {icon}
          </span>
          <h3 className="text-lg font-bold text-[#1b1e26] tracking-tight">{title}</h3>
          {subtitle && <p className="text-[13px] text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
};

const MODULE_ICON = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
);
const LESSON_ICON = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
);

/** Create / edit a module. onSubmit(payload) should return a promise. */
export const ModuleFormModal = ({ open, editing, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [moduleType, setModuleType] = useState('LESSON');
  const [locked, setLocked] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setTitle(editing?.title || '');
    setDescription(editing?.description || '');
    setModuleType(editing?.moduleType || 'LESSON');
    setLocked(editing?.lockedAfterPrevious ?? true);
    setError('');
  }, [open, editing]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Module needs a title.'); return; }
    setSaving(true);
    setError('');
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        moduleType,
        lockedAfterPrevious: locked,
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <ModalShell
      title={editing ? 'Edit module' : 'New module'}
      subtitle="A module groups related lessons into one unit of the curriculum."
      icon={MODULE_ICON}
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={labelClass}>Title</label>
          <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Getting Started" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional — what this module covers" className={`${inputClass} resize-none`} />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className={labelClass}>Type</label>
            <select value={moduleType} onChange={(e) => setModuleType(e.target.value)} className={`${inputClass} cursor-pointer`}>
              {MODULE_TYPES.map((t) => <option key={t} value={t}>{humanize(t)}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className={labelClass}>Access</label>
            <button
              type="button"
              onClick={() => setLocked((v) => !v)}
              className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[13px] font-semibold border transition-all ${
                locked ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}
            >
              {locked ? 'Locked' : 'Open'}
              <span className={`relative w-9 h-5 rounded-full transition-colors ${locked ? 'bg-amber-300' : 'bg-emerald-400'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${locked ? 'left-0.5' : 'left-[18px]'}`} />
              </span>
            </button>
          </div>
        </div>

        {error && <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">{error}</p>}

        <div className="pt-1 flex justify-end gap-2.5">
          <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl text-[13px] font-semibold text-[#1b1e26]/70 border border-[#1b1e26]/10 hover:bg-[#f3f4f6] transition-colors">Cancel</button>
          <button type="submit" disabled={saving} className="px-6 py-2 rounded-xl text-[13px] font-bold bg-[#1b1e26] text-white hover:bg-black transition-colors active:scale-[0.98] shadow-sm disabled:opacity-60">
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create module'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

/** Create / edit a lesson (module item). onSubmit(payload) should return a promise. */
export const LessonFormModal = ({ open, editing, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [itemType, setItemType] = useState('VIDEO');
  const [contentUrl, setContentUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [required, setRequired] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setTitle(editing?.title || '');
    setItemType(editing?.itemType || 'VIDEO');
    setContentUrl(editing?.contentUrl || '');
    setDuration(editing?.durationMinutes != null ? String(editing.durationMinutes) : '');
    setRequired(editing?.required ?? true);
    setError('');
  }, [open, editing]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Lesson needs a title.'); return; }
    setSaving(true);
    setError('');
    try {
      await onSubmit({
        title: title.trim(),
        itemType,
        contentUrl: contentUrl.trim() || null,
        durationMinutes: duration === '' ? null : Number(duration),
        required,
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const isReading = itemType === 'READING';

  return (
    <ModalShell
      title={editing ? 'Edit lesson' : 'New lesson'}
      subtitle="A lesson is a single item inside a module — a video, reading, quiz, or file."
      icon={LESSON_ICON}
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={labelClass}>Title</label>
          <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Introduction video" className={inputClass} />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className={labelClass}>Type</label>
            <select value={itemType} onChange={(e) => setItemType(e.target.value)} className={`${inputClass} cursor-pointer`}>
              {ITEM_TYPES.map((t) => <option key={t} value={t}>{humanize(t)}</option>)}
            </select>
          </div>
          <div className="w-[130px]">
            <label className={labelClass}>Minutes</label>
            <input type="number" min="0" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="0" className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>{isReading ? 'Content' : 'Content URL'}</label>
          {isReading ? (
            <textarea rows={3} value={contentUrl} onChange={(e) => setContentUrl(e.target.value)} placeholder="The reading body / lesson text" className={`${inputClass} resize-none`} />
          ) : (
            <input type="text" value={contentUrl} onChange={(e) => setContentUrl(e.target.value)} placeholder="https://… (video, file or external link)" className={inputClass} />
          )}
        </div>

        <button
          type="button"
          onClick={() => setRequired((v) => !v)}
          className="flex items-center gap-2.5 group"
        >
          <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${required ? 'bg-[#d0f24a] border-[#d0f24a] text-[#1b1e26]' : 'bg-white border-[#1b1e26]/15 text-transparent'}`}>
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          <span className="text-[13px] font-medium text-[#1b1e26]/80">Required to complete the module</span>
        </button>

        {error && <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">{error}</p>}

        <div className="pt-1 flex justify-end gap-2.5">
          <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl text-[13px] font-semibold text-[#1b1e26]/70 border border-[#1b1e26]/10 hover:bg-[#f3f4f6] transition-colors">Cancel</button>
          <button type="submit" disabled={saving} className="px-6 py-2 rounded-xl text-[13px] font-bold bg-[#1b1e26] text-white hover:bg-black transition-colors active:scale-[0.98] shadow-sm disabled:opacity-60">
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create lesson'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

/** Generic delete confirmation, ink/lime palette. onConfirm() returns a promise. */
export const ConfirmDeleteModal = ({ open, title = 'Delete', message, onClose, onConfirm }) => {
  const [saving, setSaving] = useState(false);
  if (!open) return null;

  const confirm = async () => {
    setSaving(true);
    try {
      await onConfirm();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      title={title}
      icon={<svg className="w-5 h-5 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
      onClose={onClose}
      maxW="400px"
    >
      <p className="text-[13px] text-[#1b1e26]/70 leading-relaxed">{message}</p>
      <div className="pt-5 flex justify-end gap-2.5">
        <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl text-[13px] font-semibold text-[#1b1e26]/70 border border-[#1b1e26]/10 hover:bg-[#f3f4f6] transition-colors">Cancel</button>
        <button type="button" onClick={confirm} disabled={saving} className="px-6 py-2 rounded-xl text-[13px] font-bold bg-rose-500 text-white hover:bg-rose-600 transition-colors active:scale-[0.98] shadow-sm disabled:opacity-60">
          {saving ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </ModalShell>
  );
};
