import React, { useRef, useState } from 'react';
import { fileService } from '../../services/api';

/**
 * Drag-and-drop uploaders backed by POST /api/files.
 *
 * - <CoverImageDropzone value onChange>     — course cover; image-only, live preview.
 * - <AttachmentDropzone url name onChange>  — compact per-lesson strip for notes/video.
 *
 * Both are self-contained: drag state, progress, and errors live inside; the
 * parent only ever sees the final uploaded URL (and name for attachments).
 */

const prettySize = (bytes) => {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const useUpload = ({ kind, onDone }) => {
  const [progress, setProgress] = useState(null); // null = idle, 0..100 = uploading
  const [error, setError] = useState('');

  const upload = async (file) => {
    if (!file) return;
    setError('');
    setProgress(0);
    try {
      const result = await fileService.upload(file, { kind, onProgress: setProgress });
      onDone(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setProgress(null);
    }
  };

  return { progress, error, upload, uploading: progress !== null };
};

// Shared drag-over plumbing: returns handlers + whether a file hovers the zone.
const useDragOver = (onFile) => {
  const [over, setOver] = useState(false);
  return {
    over,
    handlers: {
      onDragOver: (e) => { e.preventDefault(); setOver(true); },
      onDragLeave: (e) => { e.preventDefault(); setOver(false); },
      onDrop: (e) => {
        e.preventDefault();
        setOver(false);
        onFile(e.dataTransfer.files?.[0]);
      },
    },
  };
};

const ProgressBar = ({ value }) => (
  <div className="w-full h-1.5 bg-[#1b1e26]/[0.08] rounded-full overflow-hidden">
    <div className="h-full bg-accent rounded-full transition-all duration-200" style={{ width: `${value}%` }} />
  </div>
);

/* ─────────────────────── Cover image (course basics) ─────────────────────── */

export const CoverImageDropzone = ({ value, onChange }) => {
  const inputRef = useRef(null);
  const { progress, error, upload, uploading } = useUpload({
    kind: 'image',
    onDone: (f) => onChange(f.url),
  });
  const { over, handlers } = useDragOver(upload);

  const pick = () => inputRef.current?.click();

  return (
    // relative: contains the absolutely-positioned sr-only input — without it the
    // input escapes the layout's scroll container and stretches the page height.
    <div className="relative">
      <input
        ref={inputRef} type="file" className="sr-only"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }}
      />

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-[#1b1e26]/10 bg-[#f7f8fa]">
          <img src={value} alt="Course cover" className="w-full h-32 object-cover" />
          <div className="absolute inset-0 bg-[#1b1e26]/0 group-hover:bg-[#1b1e26]/50 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              type="button" onClick={pick}
              className="px-4 py-2 rounded-xl bg-accent text-[#1b1e26] text-xs font-bold hover:bg-accent-hover transition-colors"
            >
              Replace
            </button>
            <button
              type="button" onClick={() => onChange('')}
              className="px-4 py-2 rounded-xl bg-white/90 text-[#1b1e26] text-xs font-bold hover:bg-white transition-colors"
            >
              Remove
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-x-3 bottom-3"><ProgressBar value={progress} /></div>
          )}
        </div>
      ) : (
        <button
          type="button" onClick={pick} {...handlers}
          className={`w-full h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-colors ${
            over
              ? 'border-accent bg-accent/10'
              : 'border-[#1b1e26]/15 bg-[#f7f8fa] hover:border-accent hover:bg-accent/5'
          }`}
        >
          {uploading ? (
            <div className="w-2/3 space-y-2 text-center">
              <p className="text-xs font-semibold text-[#1b1e26]/60">Uploading… {progress}%</p>
              <ProgressBar value={progress} />
            </div>
          ) : (
            <>
              <span className="w-10 h-10 rounded-xl bg-accent/25 text-[#1b1e26] flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
              <p className="text-[13px] font-semibold text-[#1b1e26]/70">
                Drag &amp; drop a cover image, or <span className="text-accent-text underline decoration-accent decoration-2 underline-offset-2">browse</span>
              </p>
              <p className="text-[11px] text-gray-400">JPG, PNG, GIF or WEBP · up to 5 MB</p>
            </>
          )}
        </button>
      )}

      {error && <p className="mt-1.5 text-[11px] font-semibold text-red-500">{error}</p>}
    </div>
  );
};

/* ─────────────────── Lesson attachment (curriculum items) ─────────────────── */

const ATTACHMENT_ACCEPT = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.csv,.zip,.mp4,.webm,.mov,.mp3,.wav,.m4a,.ogg,.jpg,.jpeg,.png,.gif,.webp';

export const AttachmentDropzone = ({ url, name, onChange }) => {
  const inputRef = useRef(null);
  const [size, setSize] = useState(null);
  const { progress, error, upload, uploading } = useUpload({
    kind: 'attachment',
    onDone: (f) => { setSize(f.size); onChange({ url: f.url, name: f.name }); },
  });
  const { over, handlers } = useDragOver(upload);

  const pick = () => inputRef.current?.click();

  return (
    <div className="relative min-w-0">
      <input
        ref={inputRef} type="file" className="sr-only" accept={ATTACHMENT_ACCEPT}
        onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }}
      />

      {url ? (
        <div className="flex items-center gap-2 rounded-lg bg-accent/10 border border-accent/40 px-2.5 py-1.5">
          <svg className="w-3.5 h-3.5 text-accent-text shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
          </svg>
          <a
            href={url} target="_blank" rel="noreferrer"
            className="text-[11.5px] font-semibold text-[#1b1e26]/80 hover:text-[#1b1e26] hover:underline truncate flex-1 min-w-0"
            title={name || 'Attachment'}
          >
            {name || 'Attachment'}
          </a>
          {size != null && <span className="text-[10px] text-[#1b1e26]/40 shrink-0">{prettySize(size)}</span>}
          <button
            type="button" onClick={pick}
            className="text-[10px] font-bold text-accent-text hover:underline shrink-0"
          >
            Replace
          </button>
          <button
            type="button" onClick={() => { setSize(null); onChange(null); }}
            className="w-5 h-5 rounded-md flex items-center justify-center text-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
            aria-label="Remove attachment"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" /></svg>
          </button>
        </div>
      ) : uploading ? (
        <div className="rounded-lg border border-[#1b1e26]/10 px-2.5 py-2 space-y-1.5">
          <p className="text-[10.5px] font-semibold text-[#1b1e26]/50">Uploading… {progress}%</p>
          <ProgressBar value={progress} />
        </div>
      ) : (
        <button
          type="button" onClick={pick} {...handlers}
          className={`w-full flex items-center gap-2 rounded-lg border border-dashed px-2.5 py-1.5 text-left transition-colors ${
            over
              ? 'border-accent bg-accent/10'
              : 'border-[#1b1e26]/15 text-[#1b1e26]/45 hover:border-accent hover:text-[#1b1e26]/70 hover:bg-accent/5'
          }`}
        >
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
          </svg>
          <span className="text-[11.5px] font-semibold truncate">
            Attach notes or video — drag &amp; drop or browse
          </span>
        </button>
      )}

      {error && <p className="mt-1 text-[10.5px] font-semibold text-red-500">{error}</p>}
    </div>
  );
};
