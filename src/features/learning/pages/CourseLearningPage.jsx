import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { learnerCourseService } from '../../../services/api';
import { BrandLockup } from '../../../components/shared/Brand';
import { useAuth } from '../../../context/AuthContext';

/* ─────────────────────────── helpers ─────────────────────────── */

const humanize = (v) =>
  v ? String(v).replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : '';

// Turn a content URL into an embeddable player URL when we recognise the host.
const toEmbed = (url) => {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return { kind: 'iframe', src: `https://www.youtube.com/embed/${yt[1]}` };
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { kind: 'iframe', src: `https://player.vimeo.com/video/${vimeo[1]}` };
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) return { kind: 'video', src: url };
  return { kind: 'external', src: url };
};

const ITEM_META = {
  VIDEO: { label: 'Video', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  READING: { label: 'Reading', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  QUIZ: { label: 'Quiz', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  ASSIGNMENT: { label: 'Assignment', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  FILE: { label: 'File', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
  LINK: { label: 'Link', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
};

// Every id whose "completed" flag came back true from the backend.
const completedIdsFrom = (course) =>
  new Set((course?.modules || []).flatMap((m) => (m.items || []).filter((i) => i.completed).map((i) => i.id)));

/* ───────────────── lightweight rich-text renderer ─────────────────
   Instructors write plain text (optionally with markdown-ish markers).
   We render it as a formatted document instead of a wall of text:
   - `# / ## / ###` or short standalone lines            → headings
   - `- item` / `• item` / `1. item`                     → bullet / numbered lists
   - `Label: value | Label: value`                       → metadata row
   - `Label: value` at line start                        → bolded label
   - `**bold**` inline                                   → bold                    */

const Inline = ({ text }) =>
  String(text).split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="font-semibold text-[#1b1e26]">{part.slice(2, -2)}</strong>
      : <React.Fragment key={i}>{part}</React.Fragment>
  );

// A short, unpunctuated, capitalised line reads as a section title
// ("Why this course", "Key Competencies", …).
const looksLikeHeading = (line) =>
  line.length <= 60 && /^[A-Z]/.test(line) && !/[.!?,;]$/.test(line) && line.split(/\s+/).length <= 7;

// Legacy content is often one giant pasted blob with no line breaks (the old
// builder input couldn't even accept Enter). Repair jammed sentences
// ("…opportunities.Data has…") and break the wall into readable paragraphs
// of ~3 sentences so it still renders like a document.
const splitBlob = (line) => {
  const repaired = line.replace(/([.!?])(?=[A-Z(])/g, '$1 ');
  const sentences = repaired.match(/[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g) || [repaired];
  const paras = [];
  for (let i = 0; i < sentences.length; i += 3) {
    const p = sentences.slice(i, i + 3).join('').trim();
    if (p) paras.push(p);
  }
  return paras;
};

const parseRichText = (text) => {
  const lines = String(text).replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let list = null;
  let callout = null;   // consecutive "> …" lines merge into one info box
  let accordion = null; // "+++ Title" opens a collapsible; a bare "+++" closes it

  const flushList = () => { if (list) { blocks.push(list); list = null; } };
  const flushCallout = () => { if (callout) { blocks.push({ type: 'callout', text: callout.join(' ') }); callout = null; } };

  lines.forEach((raw) => {
    // Inside an open collapsible — swallow everything until the closing +++,
    // then parse the captured body recursively (accordions hold full content).
    if (accordion) {
      if (raw.trim() === '+++') {
        blocks.push({ type: 'accordion', title: accordion.title, blocks: parseRichText(accordion.lines.join('\n')) });
        accordion = null;
      } else {
        accordion.lines.push(raw);
      }
      return;
    }

    const line = raw.trim();
    if (!line) { flushList(); flushCallout(); return; }

    const acc = line.match(/^\+{3}\s+(.+)/);
    if (acc) { flushList(); flushCallout(); accordion = { title: acc[1], lines: [] }; return; }

    const quote = line.match(/^>\s?(.*)/);
    if (quote) { flushList(); callout = callout || []; callout.push(quote[1]); return; }
    flushCallout();

    // ![Caption](url) or ![Caption](url|left) / (url|right) for text-wrap layouts
    const img = line.match(/^!\[([^\]]*)\]\(([^)|]+?)(?:\|(left|right))?\)$/);
    if (img) { flushList(); blocks.push({ type: 'img', alt: img[1], src: img[2].trim(), align: img[3] || null }); return; }

    if (/^-{3,}$/.test(line)) { flushList(); blocks.push({ type: 'hr' }); return; }

    const bullet = line.match(/^[-*•]\s+(.*)/);
    if (bullet) {
      if (!list || list.type !== 'ul') { flushList(); list = { type: 'ul', items: [] }; }
      list.items.push(bullet[1]);
      return;
    }
    const numbered = line.match(/^\d+[.)]\s+(.*)/);
    if (numbered) {
      if (!list || list.type !== 'ol') { flushList(); list = { type: 'ol', items: [] }; }
      list.items.push(numbered[1]);
      return;
    }
    flushList();

    const md = line.match(/^(#{1,3})\s+(.*)/);
    if (md) { blocks.push({ type: `h${md[1].length}`, text: md[2] }); return; }

    // "Format: Self-paced | Duration: 7 weeks | Workload: ~4 hours/week"
    if (line.includes('|') && line.includes(':') && line.length < 200) {
      blocks.push({ type: 'meta', pairs: line.split('|').map((s) => s.trim()).filter(Boolean) });
      return;
    }

    if (looksLikeHeading(line)) { blocks.push({ type: 'h3', text: line.replace(/:$/, '') }); return; }

    // Very long single lines are pasted blobs — break them up.
    if (line.length > 320) { splitBlob(line).forEach((p) => blocks.push({ type: 'p', text: p })); return; }

    blocks.push({ type: 'p', text: line });
  });
  flushList();
  flushCallout();
  if (accordion) blocks.push({ type: 'accordion', title: accordion.title, blocks: parseRichText(accordion.lines.join('\n')) });
  return blocks;
};

// "Label: value" → bold the label. Falls back to plain inline text.
const MetaOrText = ({ text }) => {
  const m = String(text).match(/^([A-Za-z][\w\s/&()-]{0,40}):\s*(.+)$/);
  if (m) return (<><strong className="font-semibold text-[#1b1e26]">{m[1]}:</strong> <Inline text={m[2]} /></>);
  return <Inline text={text} />;
};

/** Click-to-expand section — the "Who is this curriculum for?" pattern. */
const Accordion = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden clear-both">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-gray-50/70 transition-colors"
        aria-expanded={open}
      >
        <span className="text-[15px] font-bold text-[#1b1e26]">{title}</span>
        <span className={`w-7 h-7 rounded-lg bg-[#f3f4f6] text-[#1b1e26]/60 flex items-center justify-center shrink-0 transition-transform duration-200 ${open ? 'rotate-45 bg-[#d0f24a] text-[#1b1e26]' : ''}`}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
            <div className="px-5 pb-5 pt-4 border-t border-gray-100">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Recursive so accordions can hold full formatted content of their own.
// `flow-root` contains floated (|left / |right) images so text wraps beside
// them without the float escaping the card.
const RichTextBlocks = ({ blocks }) => (
  <div className="space-y-5 flow-root">
    {blocks.map((b, i) => {
      if (b.type === 'meta') {
        return (
          <p key={i} className="text-[15px] text-gray-600 leading-[1.8] pb-4 border-b border-gray-100">
            {b.pairs.map((pair, pi) => (
              <span key={pi}>
                {pi > 0 && <span className="mx-2.5 text-gray-300">|</span>}
                <MetaOrText text={pair} />
              </span>
            ))}
          </p>
        );
      }
      if (b.type === 'h1') {
        // Full-width banner heading — the reference's coloured course band.
        return (
          <div key={i} className="rounded-xl bg-[#1b1e26] px-6 py-4 clear-both">
            <h2 className="text-lg font-semibold text-white tracking-tight">
              <span className="inline-block w-2 h-2 rounded-full bg-[#d0f24a] mr-2.5 align-middle" />
              {b.text}
            </h2>
          </div>
        );
      }
      if (b.type === 'h2') {
        return <h2 key={i} className="text-[22px] font-semibold text-[#1b1e26] tracking-tight pt-3 clear-both">{b.text}</h2>;
      }
      if (b.type === 'h3') {
        return <h3 key={i} className="text-[17px] font-bold text-[#1b1e26] pt-3">{b.text}</h3>;
      }
      if (b.type === 'img') {
        const floatCls = b.align === 'left'
          ? 'sm:float-left sm:w-[46%] sm:mr-8 sm:mb-3'
          : b.align === 'right'
            ? 'sm:float-right sm:w-[46%] sm:ml-8 sm:mb-3'
            : '';
        return (
          <figure key={i} className={`${floatCls} ${b.align ? 'w-full' : 'clear-both'}`}>
            <img src={b.src} alt={b.alt || 'Lesson image'} loading="lazy" className="w-full rounded-2xl border border-gray-100 shadow-sm" />
            {b.alt && <figcaption className="mt-2 text-xs text-gray-400 text-center">{b.alt}</figcaption>}
          </figure>
        );
      }
      if (b.type === 'callout') {
        return (
          <div key={i} className="clear-both flex items-start gap-3 rounded-xl border border-[#d0f24a]/60 bg-[#d0f24a]/10 px-4 py-4">
            <span className="w-6 h-6 rounded-full bg-[#1b1e26] text-[#d0f24a] flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 16v-4m0-4h.01" strokeLinecap="round" /><circle cx="12" cy="12" r="9" /></svg>
            </span>
            <p className="text-[14px] text-[#1b1e26]/80 leading-relaxed font-medium"><Inline text={b.text} /></p>
          </div>
        );
      }
      if (b.type === 'accordion') {
        return <Accordion key={i} title={b.title}><RichTextBlocks blocks={b.blocks} /></Accordion>;
      }
      if (b.type === 'hr') {
        return <hr key={i} className="border-gray-100 clear-both" />;
      }
      if (b.type === 'ul' || b.type === 'ol') {
        const Tag = b.type;
        return (
          <Tag key={i} className="space-y-2.5 pl-1.5">
            {b.items.map((item, ii) => (
              <li key={ii} className="flex gap-3 text-[15px] text-gray-600 leading-[1.8]">
                {b.type === 'ul'
                  ? <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#d0f24a] ring-2 ring-[#d0f24a]/25 shrink-0" />
                  : <span className="font-semibold text-[#1b1e26]/50 shrink-0 tabular-nums">{ii + 1}.</span>}
                <span className="min-w-0"><MetaOrText text={item} /></span>
              </li>
            ))}
          </Tag>
        );
      }
      return <p key={i} className="text-[15px] text-gray-600 leading-[1.8]"><MetaOrText text={b.text} /></p>;
    })}
  </div>
);

const RichText = ({ text }) => {
  const blocks = useMemo(() => parseRichText(text), [text]);
  return <RichTextBlocks blocks={blocks} />;
};

const readingMinutes = (text) => Math.max(1, Math.round(String(text).split(/\s+/).length / 200));

/* ─────────────────────── item renderers ─────────────────────── */

const ItemStage = ({ item }) => {
  // Prefer the instructor's linked URL; fall back to an uploaded attachment
  // (e.g. an .mp4 uploaded in the course builder plays right in the stage).
  const resourceUrl = item.contentUrl || item.attachmentUrl;
  const embed = toEmbed(resourceUrl);

  if (item.itemType === 'VIDEO') {
    if (embed?.kind === 'iframe') {
      return (
        <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black">
          <iframe src={embed.src} title={item.title} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </div>
      );
    }
    if (embed?.kind === 'video') {
      return (
        <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black">
          <video src={embed.src} controls className="w-full h-full" />
        </div>
      );
    }
    return (
      <StagePlaceholder
        icon={ITEM_META.VIDEO.icon}
        title="Video lesson"
        sub={resourceUrl ? 'This video is hosted externally.' : 'The instructor has not attached a video yet.'}
        actionUrl={resourceUrl}
        actionLabel="Open video"
      />
    );
  }

  if (item.itemType === 'READING') {
    // Instructors write reading content as plain text in contentUrl; when it's
    // a real link instead, offer it as an external resource. Text renders as a
    // formatted document — headings, bullets, metadata — filling the page.
    const isExternal = /^https?:\/\/\S+$/.test((resourceUrl || '').trim());
    if (resourceUrl && !isExternal) {
      return (
        <article className="rounded-2xl bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 px-6 sm:px-12 pt-7 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            <svg className="w-4 h-4 text-[#1b1e26]/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={ITEM_META.READING.icon} /></svg>
            Reading · ~{readingMinutes(resourceUrl)} min
          </div>
          <div className="px-6 sm:px-12 py-7 sm:pb-12">
            <RichText text={resourceUrl} />
          </div>
        </article>
      );
    }
    return (
      <StagePlaceholder
        icon={ITEM_META.READING.icon}
        title="Reading"
        sub={isExternal ? 'This reading is hosted externally.' : 'The instructor has not added the reading content yet.'}
        actionUrl={isExternal ? resourceUrl : null}
        actionLabel="Open reading"
        tone="reading"
      />
    );
  }

  if (item.itemType === 'QUIZ') {
    return (
      <StagePlaceholder
        icon={ITEM_META.QUIZ.icon}
        title="Knowledge check"
        sub="A short quiz to confirm you've got it. Mark complete once you've passed."
        tone="quiz"
      />
    );
  }

  if (item.itemType === 'ASSIGNMENT') {
    return (
      <StagePlaceholder
        icon={ITEM_META.ASSIGNMENT.icon}
        title="Assignment"
        sub={resourceUrl ? 'Open the brief, do the work, then mark complete.' : 'Follow the instructions and submit your work.'}
        actionUrl={resourceUrl}
        actionLabel="Open brief"
        tone="assignment"
      />
    );
  }

  // FILE / LINK
  return (
    <StagePlaceholder
      icon={ITEM_META[item.itemType]?.icon || ITEM_META.LINK.icon}
      title={item.itemType === 'FILE' ? 'Downloadable file' : 'External resource'}
      sub={resourceUrl ? 'Open the resource to continue.' : 'A resource will be attached here.'}
      actionUrl={resourceUrl}
      actionLabel={item.itemType === 'FILE' ? 'Download' : 'Open link'}
    />
  );
};

/** Download chip for a lesson's uploaded notes/slides, shown under the stage. */
const AttachmentCard = ({ url, name }) => (
  <a
    href={url} target="_blank" rel="noreferrer"
    className="mt-4 flex items-center gap-3 rounded-2xl bg-white border border-gray-100 shadow-sm px-4 py-3.5 hover:border-[#d0f24a] hover:shadow-md transition-all group"
  >
    <span className="w-10 h-10 rounded-xl bg-[#d0f24a]/20 text-[#1b1e26] flex items-center justify-center shrink-0 group-hover:bg-[#d0f24a] transition-colors">
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
      </svg>
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-semibold text-[#1b1e26] truncate">{name || 'Lesson attachment'}</span>
      <span className="block text-[11px] text-gray-400">Attached by the instructor — click to open or download</span>
    </span>
    <svg className="w-4 h-4 text-gray-300 group-hover:text-[#1b1e26] transition-colors shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </a>
);

const TONE_BG = {
  default: 'from-[#1b1e26] to-[#343b49]',
  reading: 'from-sky-600 to-indigo-700',
  quiz: 'from-violet-600 to-fuchsia-700',
  assignment: 'from-amber-500 to-orange-600',
};

const StagePlaceholder = ({ icon, title, sub, actionUrl, actionLabel, tone = 'default' }) => {
  // Validate URL before rendering link
  const isValidUrl = actionUrl && (actionUrl.startsWith('http') || actionUrl.startsWith('/'));
  
  return (
    <div className={`aspect-video rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br ${TONE_BG[tone]} flex items-center justify-center relative`}>
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-12 -left-8 w-48 h-48 rounded-full bg-white/[0.06]" />
      <div className="relative text-center px-6">
        <span className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm text-white flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={icon} /></svg>
        </span>
        <h3 className="text-white text-lg font-semibold">{title}</h3>
        <p className="text-white/60 text-sm mt-1 max-w-sm mx-auto">{sub}</p>
        {isValidUrl && (
          <a href={actionUrl} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-[#d0f24a] text-[#1b1e26] text-sm font-bold hover:bg-[#c4e83a] transition-colors">
            {actionLabel}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────── page ─────────────────────────── */

export const CourseLearningPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const signOut = () => { logout(); navigate('/login'); };
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'ST';

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [done, setDone] = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openModules, setOpenModules] = useState({});
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        // Fetches the real curriculum + this learner's own progress — and
        // auto-enrolls on first view (the backend enforces the course's
        // enrollment policy: OPEN enrolls immediately, REQUEST_TO_JOIN queues
        // a pending request, INVITE_ONLY/limit-reached reject with a message
        // that surfaces below via `error`).
        const data = await learnerCourseService.getMyCourse(courseId);
        if (cancelled) return;
        setCourse(data);
        setDone(completedIdsFrom(data));
        const firstItem = data.modules?.[0]?.items?.[0];
        setActiveId(firstItem?.id || null);
        setOpenModules({ [data.modules?.[0]?.id]: true });
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [courseId]);

  // Flatten the curriculum, tagging each item with its module + global lock state.
  const flat = useMemo(() => {
    if (!course?.modules) return [];
    const isModuleComplete = (mod) => {
      const items = mod.items || [];
      return items.length > 0 && items.every((i) => done.has(i.id));
    };
    const rows = [];
    course.modules.forEach((mod, mi) => {
      const prev = course.modules[mi - 1];
      const locked = mod.lockedAfterPrevious && prev ? !isModuleComplete(prev) : false;
      (mod.items || []).forEach((item, ii) => {
        rows.push({ ...item, moduleId: mod.id, moduleTitle: mod.title, moduleIndex: mi, itemIndex: ii, locked });
      });
    });
    return rows;
  }, [course, done]);

  const moduleState = useMemo(() => {
    if (!course?.modules) return {};
    const map = {};
    const isModuleComplete = (mod) => {
      const items = mod.items || [];
      return items.length > 0 && items.every((i) => done.has(i.id));
    };
    course.modules.forEach((mod, mi) => {
      const prev = course.modules[mi - 1];
      const locked = mod.lockedAfterPrevious && prev ? !isModuleComplete(prev) : false;
      const total = (mod.items || []).length;
      const completed = (mod.items || []).filter((i) => done.has(i.id)).length;
      map[mod.id] = { locked, total, completed, complete: total > 0 && completed === total };
    });
    return map;
  }, [course, done]);

  const totalItems = flat.length;
  const completedCount = flat.filter((r) => done.has(r.id)).length;
  const progress = totalItems ? Math.round((completedCount / totalItems) * 100) : 0;

  const active = flat.find((r) => r.id === activeId) || null;

  const selectItem = (row) => {
    if (row.locked) return;
    setActiveId(row.id);
    setOpenModules((p) => ({ ...p, [row.moduleId]: true }));
  };

  const advanceAfter = (next) => {
    // Auto-advance to the next accessible item.
    const idx = flat.findIndex((r) => r.id === active.id);
    for (let i = idx + 1; i < flat.length; i++) {
      // re-evaluate lock against the updated completion set
      const mod = course.modules[flat[i].moduleIndex];
      const prev = course.modules[flat[i].moduleIndex - 1];
      const prevComplete = prev ? (prev.items || []).every((it) => next.has(it.id)) && (prev.items || []).length > 0 : true;
      const locked = mod.lockedAfterPrevious && prev ? !prevComplete : false;
      if (!locked) { setActiveId(flat[i].id); setOpenModules((p) => ({ ...p, [flat[i].moduleId]: true })); break; }
    }
  };

  const markComplete = async () => {
    if (!active || done.has(active.id) || completing) return;
    setCompleting(true);
    setCompleteError('');
    try {
      await learnerCourseService.completeItem(courseId, active.id);
      const next = new Set(done);
      next.add(active.id);
      setDone(next);
      advanceAfter(next);
    } catch (err) {
      setCompleteError(err.message || 'Could not save your progress. Try again.');
    } finally {
      setCompleting(false);
    }
  };

  const goPrev = () => {
    const idx = flat.findIndex((r) => r.id === activeId);
    for (let i = idx - 1; i >= 0; i--) if (!flat[i].locked) { selectItem(flat[i]); return; }
  };
  const goNext = () => {
    const idx = flat.findIndex((r) => r.id === activeId);
    for (let i = idx + 1; i < flat.length; i++) if (!flat[i].locked) { selectItem(flat[i]); return; }
  };

  const activeIndex = flat.findIndex((r) => r.id === activeId);
  const hasPrev = flat.slice(0, activeIndex).some((r) => !r.locked);
  const hasNext = flat.slice(activeIndex + 1).some((r) => !r.locked);

  // ← / → step between lessons (ignored while typing in a field).
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea, select, [contenteditable]')) return;
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  /* ─── loading / error ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-[#d0f24a] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading course…</p>
        </div>
      </div>
    );
  }
  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <span className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          <h2 className="text-lg font-semibold text-[#1b1e26]">Course unavailable</h2>
          <p className="text-sm text-gray-500 mt-1 mb-5">{error || 'This course could not be loaded.'}</p>
          <div className="flex items-center justify-center gap-2.5">
            <Link to="/learning/dashboard" className="inline-block px-5 py-2.5 rounded-xl bg-[#1b1e26] text-white text-sm font-semibold hover:bg-black transition-colors">My courses</Link>
            <Link to="/" className="inline-block px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-[#1b1e26] text-sm font-semibold hover:bg-gray-50 transition-colors">Back to home</Link>
          </div>
          <button onClick={signOut} className="mt-4 text-xs font-semibold text-gray-400 hover:text-[#1b1e26] underline underline-offset-2 transition-colors">
            Sign out
          </button>
        </div>
      </div>
    );
  }

  // This course requires approval to join, and the request hasn't been
  // accepted (or was declined) yet — no curriculum to show either way.
  if (course.enrollmentStatus === 'PENDING' || course.enrollmentStatus === 'DROPPED') {
    const pending = course.enrollmentStatus === 'PENDING';
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <span className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${pending ? 'bg-amber-50 text-amber-500' : 'bg-gray-100 text-gray-400'}`}>
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l2.5 2.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          <h2 className="text-lg font-semibold text-[#1b1e26]">
            {pending ? 'Your request to join is pending' : "You're not currently enrolled"}
          </h2>
          <p className="text-sm text-gray-500 mt-1 mb-5">
            {pending
              ? `${course.title} requires instructor approval before you can start. We'll let you know once you're in.`
              : `Your enrollment in ${course.title} has ended.`}
          </p>
          <div className="flex items-center justify-center gap-2.5">
            <Link to="/learning/dashboard" className="inline-block px-5 py-2.5 rounded-xl bg-[#1b1e26] text-white text-sm font-semibold hover:bg-black transition-colors">My courses</Link>
            <Link to="/" className="inline-block px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-[#1b1e26] text-sm font-semibold hover:bg-gray-50 transition-colors">Back to home</Link>
          </div>
        </div>
      </div>
    );
  }

  /* ─── player ─── */
  return (
    // App shell: the page itself never scrolls — the sidebar and the content
    // pane are independent scroll containers, each moving only when its own
    // content overflows.
    <div className="h-screen bg-[#f7f8fa] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shrink-0 z-40">
        <div className="h-16 px-4 sm:px-6 flex items-center gap-4">
          <button onClick={() => setSidebarOpen((o) => !o)} className="w-10 h-10 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-[#1b1e26] flex items-center justify-center transition-colors" aria-label="Toggle content">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" /></svg>
          </button>
          <Link to="/" className="shrink-0" aria-label="Back to home"><BrandLockup dark size={30} /></Link>
          <div className="min-w-0 hidden md:block">
            <h1 className="text-sm font-semibold text-[#1b1e26] truncate max-w-xs">{course.title}</h1>
            <p className="text-[11px] text-gray-400 truncate">{[course.category, course.entityName].filter(Boolean).join(' · ')}</p>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2.5 ml-auto">
            <div className="hidden sm:block w-28 h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div className="h-full bg-[#d0f24a] rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
            </div>
            <span className="text-xs font-bold text-[#1b1e26] tabular-nums">{progress}%</span>
          </div>

          {/* Account — the way back out of the player */}
          <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
            <Link
              to="/learning/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:text-[#1b1e26] hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              My courses
            </Link>
            <span className="w-9 h-9 rounded-xl bg-[#1b1e26] text-[#d0f24a] flex items-center justify-center text-xs font-bold" title={user?.name}>{initials}</span>
            <button
              onClick={signOut}
              className="w-9 h-9 sm:w-auto sm:px-3.5 sm:py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5"
              title="Sign out"
            >
              <svg className="w-4 h-4 sm:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>

        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar — content tree */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 34 }}
              className="w-[320px] shrink-0 bg-white border-r border-gray-100 overflow-y-auto"
            >
              <div className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">Course content</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <span>{course.modules.length} modules</span><span>·</span>
                  <span>{totalItems} items</span><span>·</span>
                  <span className="font-semibold text-[#1b1e26]">{completedCount}/{totalItems} done</span>
                </div>

                <div className="mt-4 space-y-2">
                  {course.modules.map((mod, mi) => {
                    const st = moduleState[mod.id] || {};
                    const isOpen = openModules[mod.id];
                    return (
                      <div key={mod.id} className={`rounded-xl border overflow-hidden ${st.locked ? 'border-gray-100 bg-[#fafbfc]' : 'border-gray-100 bg-white'}`}>
                        <button
                          onClick={() => setOpenModules((p) => ({ ...p, [mod.id]: !p[mod.id] }))}
                          className="w-full px-3.5 py-3 flex items-center gap-2.5 text-left hover:bg-gray-50/70 transition-colors"
                        >
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 ${
                            st.complete ? 'bg-[#d0f24a] text-[#1b1e26]' : st.locked ? 'bg-gray-100 text-gray-400' : 'bg-[#1b1e26] text-[#d0f24a]'
                          }`}>
                            {st.complete ? (
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            ) : st.locked ? (
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            ) : (mi + 1)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13px] font-semibold text-[#1b1e26] truncate">{mod.title}</span>
                            <span className="block text-[11px] text-gray-400">{st.completed || 0}/{st.total || 0} · {humanize(mod.moduleType)}</span>
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 tabular-nums ${
                            st.complete ? 'bg-[#d0f24a] text-[#1b1e26]'
                              : st.locked ? 'bg-gray-100 text-gray-400'
                              : 'bg-[#1b1e26]/[0.05] text-[#1b1e26]/60'
                          }`}>
                            {st.locked ? 'Locked' : `${st.total ? Math.round(((st.completed || 0) / st.total) * 100) : 0}%`}
                          </span>
                          <svg className={`w-4 h-4 text-gray-300 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="border-t border-gray-50">
                              {(mod.items || []).map((item, ii) => {
                                const isDone = done.has(item.id);
                                const isActive = activeId === item.id;
                                const meta = ITEM_META[item.itemType] || ITEM_META.LINK;
                                return (
                                  <button
                                    key={item.id}
                                    onClick={() => selectItem({ ...item, moduleId: mod.id, locked: st.locked })}
                                    disabled={st.locked}
                                    className={`w-full px-3.5 py-2.5 flex items-center gap-2.5 text-left transition-colors ${
                                      st.locked ? 'opacity-50 cursor-not-allowed' : isActive ? 'bg-[#d0f24a]/12' : 'hover:bg-gray-50/70'
                                    }`}
                                  >
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                                      isDone ? 'bg-[#d0f24a] text-[#1b1e26]' : isActive ? 'bg-[#1b1e26] text-white' : 'bg-gray-100 text-gray-400'
                                    }`}>
                                      {isDone ? (
                                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                      ) : (
                                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d={meta.icon} strokeLinecap="round" strokeLinejoin="round" /></svg>
                                      )}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                      <span className={`block text-[12.5px] truncate ${isActive ? 'font-semibold text-[#1b1e26]' : 'text-gray-600'}`}>{item.title}</span>
                                    </span>
                                    {item.durationMinutes ? <span className="text-[10px] text-gray-400 shrink-0">{item.durationMinutes}m</span> : null}
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main stage */}
        <main className="flex-1 min-w-0 overflow-y-auto flex flex-col">
          <div className="flex-1 w-full max-w-5xl mx-auto px-5 sm:px-10 py-8">
            {progress === 100 ? (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-2xl bg-gradient-to-br from-[#1b1e26] to-[#343b49] text-white p-6 flex items-center gap-4">
                <span className="w-12 h-12 rounded-2xl bg-[#d0f24a] text-[#1b1e26] flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <div>
                  <p className="font-semibold">Course complete 🎉</p>
                  <p className="text-white/60 text-sm">You finished every lesson in {course.title}.</p>
                </div>
              </motion.div>
            ) : null}

            {active ? (
              // Keyed remount on item change — a smooth enter animation without
              // the AnimatePresence "wait" exit deadlock that froze the stage.
              <div key={active.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* Breadcrumb + title */}
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                    <span>Module {active.moduleIndex + 1}</span>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <span className="truncate">{active.moduleTitle}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#d0f24a]/25 text-[#1b1e26] text-[11px] font-bold uppercase tracking-wide">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d={(ITEM_META[active.itemType] || ITEM_META.LINK).icon} strokeLinecap="round" strokeLinejoin="round" /></svg>
                      {(ITEM_META[active.itemType] || {}).label || 'Item'}
                    </span>
                    {done.has(active.id) && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        Completed
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-semibold text-[#1b1e26] tracking-tight mb-6">{active.title}</h1>

                  {/* Stage */}
                  <ItemStage item={active} />

                  {/* Uploaded notes/slides — always downloadable, even when the
                      stage already plays the attachment as a video */}
                  {active.attachmentUrl && (
                    <AttachmentCard url={active.attachmentUrl} name={active.attachmentName} />
                  )}

                  {completeError && (
                    <p className="mt-4 text-center text-xs font-semibold text-red-500">{completeError}</p>
                  )}
                </div>
            ) : (
              <div className="text-center py-24">
                <span className="w-14 h-14 rounded-2xl bg-[#d0f24a]/20 text-[#1b1e26] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <p className="text-base font-semibold text-[#1b1e26]">This course has no lessons yet</p>
                <p className="text-sm text-gray-400 mt-1">Check back once the instructor adds content.</p>
              </div>
            )}
          </div>

          {/* Sticky pager — always in reach, like a book's page controls */}
          {active && (
            <footer className="sticky bottom-0 z-10 bg-white/95 backdrop-blur border-t border-gray-100">
              <div className="max-w-5xl mx-auto px-5 sm:px-10 h-16 flex items-center gap-3">
                <span className="text-xs text-gray-400 font-medium tabular-nums shrink-0">
                  Item {activeIndex + 1} of {totalItems}
                </span>
                <div className="ml-auto flex items-center gap-2.5">
                  <button onClick={goPrev} disabled={!hasPrev}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:pointer-events-none">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    Previous
                  </button>
                  <button onClick={markComplete} disabled={completing}
                    className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-[13px] font-bold transition-colors active:scale-[0.98] shadow-sm disabled:opacity-60 disabled:pointer-events-none ${
                      done.has(active.id) ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-[#d0f24a] text-[#1b1e26] hover:bg-[#c4e83a]'
                    }`}>
                    {done.has(active.id) ? 'Completed' : completing ? 'Saving…' : 'Mark complete'}
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                  <button onClick={goNext} disabled={!hasNext}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1b1e26] text-white text-[13px] font-semibold hover:bg-black transition-colors disabled:opacity-40 disabled:pointer-events-none">
                    Next
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                </div>
              </div>
            </footer>
          )}
        </main>
      </div>
    </div>
  );
};

export default CourseLearningPage;
