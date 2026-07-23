import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { entityCourseService, entityUserService, courseCategoryService, fileService, platformCourseService, platformEntityService } from '../../services/api';
import { CoverImageDropzone, AttachmentDropzone } from '../../components/shared/UploadDropzone';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

/**
 * Course builder — a 4-step wizard (Basics → Objectives → Curriculum → Review).
 * Everything is held client-side until the final step, then the COMPLETE
 * payload is sent in ONE request and persisted atomically on the backend.
 */

const fieldClass =
  'w-full rounded-lg bg-[#f7f8fa] border border-[#1b1e26]/10 px-3 py-2 text-[13px] text-[#1b1e26] placeholder-gray-400 focus:bg-white focus:border-[#d0f24a] focus:ring-2 focus:ring-[#d0f24a]/25 focus:outline-none transition-all';
const selectClass = `${fieldClass} cursor-pointer`;
const labelClass = 'block text-[10px] font-bold text-[#1b1e26]/45 uppercase tracking-[0.12em] mb-1';
const miniBtnClass =
  'w-7 h-7 rounded-lg flex items-center justify-center text-[#1b1e26]/35 hover:text-[#1b1e26] hover:bg-[#1b1e26]/[0.06] transition-colors disabled:opacity-25 disabled:pointer-events-none';

const STEPS = [
  { id: 0, label: 'Basics' },
  { id: 1, label: 'Objectives' },
  { id: 2, label: 'Curriculum' },
  { id: 3, label: 'Review' },
];

const ITEM_TYPES = ['VIDEO', 'READING', 'QUIZ', 'ASSIGNMENT', 'FILE', 'LINK'];
const MODULE_TYPES = ['OVERVIEW', 'LESSON', 'ASSESSMENT'];

const EMPTY_BASICS = {
  entityId: '', title: '', code: '', summary: '', description: '', coverImageUrl: '', categoryId: '',
  level: '', deliveryMode: 'SELF_PACED', enrollmentPolicy: 'OPEN', enrollmentLimit: '',
  startDate: '', endDate: '', estimatedHours: '', passingScore: '',
  certificateEnabled: false, instructorId: '',
};

const newObjective = () => ({ code: '', description: '' });
const newItem = () => ({ title: '', itemType: 'VIDEO', contentUrl: '', attachmentUrl: '', attachmentName: '', durationMinutes: '', required: true });
const newModule = (locked = true) => ({
  title: '', description: '', moduleType: 'LESSON', lockedAfterPrevious: locked, items: [newItem()],
});

const humanize = (v) => (v ? String(v).replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : '—');

const move = (list, from, to) => {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [row] = next.splice(from, 1);
  next.splice(to, 0, row);
  return next;
};

// Lime-checkbox used for the toggles (matches the permissions modal)
const LimeCheck = ({ checked, onChange, label }) => (
  <div className="flex items-center gap-2.5">
    <button
      type="button"
      onClick={() => onChange({ target: { checked: !checked } })}
      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${checked ? 'bg-[#d0f24a] border-[#d0f24a] text-[#1b1e26]' : 'bg-white border-[#1b1e26]/15 text-transparent'}`}
    >
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
    <span className="text-[13px] font-medium text-[#1b1e26]/75">{label}</span>
  </div>
);

// Hairline group separator with a whispered label — structure without boxes.
const GroupDivider = ({ label }) => (
  <div className="flex items-center gap-3 pt-1.5">
    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1b1e26]/35 shrink-0">{label}</span>
    <span className="flex-1 h-px bg-[#1b1e26]/[0.07]" />
  </div>
);

export const CourseBuilderPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams();
  const { user } = useAuth();
  const isEdit = !!id;
  // Platform admins have no entity of their own — they author on an
  // institution's behalf and must pick which one. Entity admins are scoped to
  // their own entity, so the picker is hidden and the backend forces the scope.
  const isPlatformAuthor = !user?.entityId;

  // Where "leave the builder" goes — platform admins live under /admin,
  // entity admins under /school. Used by the back arrow AND Cancel.
  const exitTo = isPlatformAuthor ? '/admin/courses' : '/school/courses';

  const [step, setStep] = useState(0);
  const [basics, setBasics] = useState(EMPTY_BASICS);
  const [objectives, setObjectives] = useState([newObjective()]);
  const [modules, setModules] = useState([newModule(false)]);
  const [staff, setStaff] = useState([]);
  const [categories, setCategories] = useState([]);
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [stepError, setStepError] = useState('');

  // The layout's <main> owns the scrollbar. When the step changes, bring the
  // wizard back to the top so each step starts at its heading.
  const topRef = useRef(null);
  useEffect(() => {
    topRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [step]);

  const setB = (key) => (e) =>
    setBasics((p) => ({ ...p, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  // Instructor picker options (staff of this entity — entity authors only) + categories.
  useEffect(() => {
    if (!isPlatformAuthor) {
      entityUserService.list().then((list) => setStaff(Array.isArray(list) ? list : [])).catch(() => {});
    }
    courseCategoryService.listActive().then((list) => setCategories(Array.isArray(list) ? list : [])).catch(() => {});
  }, [isPlatformAuthor]);

  // Platform authors pick the owning institution from the directory.
  useEffect(() => {
    if (!isPlatformAuthor) return;
    platformEntityService.list({ page: 0, size: 300 })
      .then((data) => setEntities(Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [isPlatformAuthor]);

  // Edit mode: hydrate the wizard from the existing course. Platform authors
  // load through the admin (cross-entity) endpoint; entity authors through
  // their own scoped one.
  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    (isPlatformAuthor ? platformCourseService.getOne(id) : entityCourseService.getOne(id))
      .then((c) => {
        if (cancelled) return;
        setBasics({
          entityId: c.entityId || '',
          title: c.title || '', code: c.code || '', summary: c.summary || '',
          description: c.description || '', coverImageUrl: c.coverImageUrl || '',
          categoryId: c.categoryId || '', level: c.level || '',
          deliveryMode: c.deliveryMode || 'SELF_PACED',
          enrollmentPolicy: c.enrollmentPolicy || 'OPEN',
          enrollmentLimit: c.enrollmentLimit ?? '', startDate: c.startDate || '',
          endDate: c.endDate || '', estimatedHours: c.estimatedHours ?? '',
          passingScore: c.passingScore ?? '', certificateEnabled: !!c.certificateEnabled,
          instructorId: c.instructorId || '',
        });
        setObjectives(
          (c.objectives || []).length > 0
            ? c.objectives.map((o) => ({ code: o.code || '', description: o.description || '' }))
            : [newObjective()]
        );
        setModules(
          (c.modules || []).length > 0
            ? c.modules.map((m) => ({
                title: m.title || '', description: m.description || '',
                moduleType: m.moduleType || 'LESSON',
                lockedAfterPrevious: !!m.lockedAfterPrevious,
                items: (m.items || []).map((i) => ({
                  title: i.title || '', itemType: i.itemType || 'VIDEO',
                  contentUrl: i.contentUrl || '',
                  attachmentUrl: i.attachmentUrl || '', attachmentName: i.attachmentName || '',
                  durationMinutes: i.durationMinutes ?? '',
                  required: i.required !== false,
                })),
              }))
            : [newModule(false)]
        );
        setLoading(false);
      })
      .catch((err) => { toast.error(err.message); navigate(exitTo); });
    return () => { cancelled = true; };
  }, [id, isEdit]);

  // ── Step validation ─────────────────────────────────────────────────────────
  const validateStep = (target) => {
    setStepError('');
    if (step === 0 && target > 0) {
      if (isPlatformAuthor && !basics.entityId) { setStepError('Select the institution this course belongs to.'); return false; }
      if (!basics.title.trim()) { setStepError('Give the course a title before continuing.'); return false; }
      if (basics.startDate && basics.endDate && basics.endDate < basics.startDate) {
        setStepError('End date cannot be before the start date.'); return false;
      }
    }
    if (step === 2 && target > 2) {
      const bad = modules.findIndex((m) => !m.title.trim());
      if (bad >= 0) { setStepError(`Module ${bad + 1} needs a title.`); return false; }
      // Completely blank item rows are fine (they're dropped on save). Only
      // block when an item HAS content (link / attachment / minutes) but no
      // title — that data would be silently lost. Point at the exact row; the
      // row itself is also highlighted amber inline.
      for (let mi = 0; mi < modules.length; mi++) {
        const bi = modules[mi].items.findIndex(
          (i) => !i.title.trim() && (i.contentUrl.trim() || i.attachmentUrl.trim() || i.durationMinutes !== '')
        );
        if (bi >= 0) {
          setStepError(
            `Item ${bi + 1} in "${modules[mi].title.trim() || `Module ${mi + 1}`}" has content but no title — type a name in its first field (highlighted below) or clear the row.`
          );
          return false;
        }
      }
    }
    return true;
  };

  const goTo = (target) => {
    if (target > step && !validateStep(target)) return;
    setStepError('');
    setStep(target);
  };

  // ── The single atomic save ──────────────────────────────────────────────────
  const buildPayload = (publish) => ({
    // Only platform authors send an entityId; the backend ignores it for entity
    // admins and forces their own scope.
    entityId: isPlatformAuthor ? (basics.entityId || null) : null,
    title: basics.title.trim(),
    code: basics.code.trim() || null,
    summary: basics.summary.trim() || null,
    description: basics.description.trim() || null,
    coverImageUrl: basics.coverImageUrl.trim() || null,
    categoryId: basics.categoryId || null,
    level: basics.level || null,
    language: 'en',
    deliveryMode: basics.deliveryMode,
    enrollmentPolicy: basics.enrollmentPolicy,
    enrollmentLimit: basics.enrollmentLimit === '' ? null : Number(basics.enrollmentLimit),
    startDate: basics.startDate || null,
    endDate: basics.endDate || null,
    estimatedHours: basics.estimatedHours === '' ? null : Number(basics.estimatedHours),
    passingScore: basics.passingScore === '' ? null : Number(basics.passingScore),
    certificateEnabled: basics.certificateEnabled,
    instructorId: basics.instructorId || null,
    publish,
    objectives: objectives
      .filter((o) => o.description.trim())
      .map((o) => ({ code: o.code.trim() || null, description: o.description.trim() })),
    modules: modules
      .filter((m) => m.title.trim())
      .map((m) => ({
        title: m.title.trim(),
        description: m.description.trim() || null,
        moduleType: m.moduleType,
        lockedAfterPrevious: m.lockedAfterPrevious,
        items: m.items
          .filter((i) => i.title.trim())
          .map((i) => ({
            title: i.title.trim(),
            itemType: i.itemType,
            contentUrl: i.contentUrl.trim() || null,
            attachmentUrl: i.attachmentUrl.trim() || null,
            attachmentName: i.attachmentUrl.trim() ? i.attachmentName.trim() || null : null,
            durationMinutes: i.durationMinutes === '' ? null : Number(i.durationMinutes),
            required: i.required,
          })),
      })),
  });

  const save = async (publish) => {
    const payload = buildPayload(publish);

    // A module that ends up with zero real items (title-less rows are
    // dropped above) would publish as an invisible, empty lesson — exactly
    // the "this course has no lessons yet" bug learners hit. Block it here,
    // before it ever reaches a real course.
    if (publish) {
      const empty = payload.modules.find((m) => m.items.length === 0);
      if (empty) {
        toast.error(`"${empty.title}" has no lesson items yet — add at least one before publishing.`);
        return;
      }
    }

    setSaving(true);
    try {
      const saved = isEdit
        ? await entityCourseService.update(id, payload)
        : await entityCourseService.create(payload);
      toast.success(publish ? 'Course published' : isEdit ? 'Course updated' : 'Course saved as draft');
      navigate(isPlatformAuthor ? `/admin/courses/${saved.id}` : `/school/courses/${saved.id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const totalItems = modules.reduce((sum, m) => sum + m.items.filter((i) => i.title.trim()).length, 0);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse space-y-4">
        <div className="h-10 w-72 bg-gray-200 rounded-xl" />
        <div className="h-96 bg-gray-200/70 rounded-3xl" />
      </div>
    );
  }

  return (
    <div ref={topRef} className="max-w-4xl mx-auto space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(exitTo)}
          className="w-9 h-9 rounded-xl border border-[#1b1e26]/10 text-[#1b1e26]/50 hover:text-[#1b1e26] hover:bg-white flex items-center justify-center transition-colors shrink-0"
          aria-label="Back to courses"
        >
          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
            Course builder · Step {step + 1} of {STEPS.length}
          </p>
          <h1 className="text-lg sm:text-[21px] font-semibold text-[#1b1e26] tracking-tight leading-tight truncate">
            {isEdit ? 'Edit course' : 'Create a course'}
          </h1>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white rounded-2xl border border-[#1b1e26]/[0.06] shadow-sm px-4 sm:px-6 py-3">
        <div className="flex items-center">
          {STEPS.map((s, i) => {
            const done = step > s.id;
            const active = step === s.id;
            return (
              <React.Fragment key={s.id}>
                <button
                  type="button"
                  onClick={() => goTo(s.id)}
                  aria-current={active ? 'step' : undefined}
                  className="flex items-center gap-2.5 group shrink-0"
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-200 ${
                    done ? 'bg-[#1b1e26] text-[#d0f24a]'
                      : active ? 'bg-[#d0f24a] text-[#1b1e26] ring-[3px] ring-[#d0f24a]/25'
                      : 'bg-[#f3f4f6] text-[#1b1e26]/40 group-hover:bg-[#1b1e26]/[0.08]'
                  }`}>
                    {done ? (
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (s.id + 1)}
                  </span>
                  <span className={`text-[12px] font-semibold transition-colors ${
                    active ? 'block text-[#1b1e26]' : done ? 'hidden sm:block text-[#1b1e26]/70' : 'hidden sm:block text-[#1b1e26]/35'
                  }`}>
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <span className={`flex-1 h-0.5 mx-2.5 rounded-full transition-colors duration-300 ${done ? 'bg-[#d0f24a]' : 'bg-[#1b1e26]/[0.06]'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step content — plain flow: the layout's <main> is the one scroll container */}
      <div key={step} className="bg-white rounded-2xl border border-[#1b1e26]/[0.06] shadow-sm p-5 sm:p-6">

        {/* ── STEP 1: Basics ── */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-[15px] font-semibold text-[#1b1e26] tracking-tight">Course basics</h2>
              <p className="text-[12.5px] text-gray-400 mt-0.5">The identity of the course — what students see first.</p>
            </div>

            {/* Identity — title and code lead the form */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              <div className="sm:col-span-9">
                <label className={labelClass}>Title *</label>
                <input type="text" value={basics.title} onChange={setB('title')} placeholder="e.g. PMP Preparation Training" className={fieldClass} />
              </div>
              <div className="sm:col-span-3">
                <label className={labelClass}>Course code</label>
                <input type="text" value={basics.code} onChange={setB('code')} placeholder="e.g. PMP-101" className={fieldClass} />
              </div>
              <div className="sm:col-span-12">
                <label className={labelClass}>Short summary</label>
                <input type="text" value={basics.summary} onChange={setB('summary')} placeholder="One sentence shown on course cards" className={fieldClass} />
              </div>
              <div className="sm:col-span-12">
                <label className={labelClass}>Description</label>
                <textarea rows={2} value={basics.description} onChange={setB('description')} placeholder="What is this course about, who is it for, and what will students achieve?" className={`${fieldClass} resize-none`} />
              </div>
            </div>

            {/* Catalog — where the course lives and how it's filtered */}
            <GroupDivider label="Catalog" />
            <div className={`grid grid-cols-2 gap-3.5 ${isPlatformAuthor ? 'sm:grid-cols-5' : 'sm:grid-cols-4'}`}>
              {isPlatformAuthor && (
                <div>
                  <label className={labelClass}>Institution *</label>
                  <select value={basics.entityId} onChange={setB('entityId')} className={selectClass} disabled={isEdit} title={isEdit ? 'A course cannot be moved between institutions.' : undefined}>
                    <option value="">Select…</option>
                    {entities.map((en) => <option key={en.id} value={en.id}>{en.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className={labelClass}>Category</label>
                <select value={basics.categoryId} onChange={setB('categoryId')} className={selectClass}>
                  <option value="">Not set</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Level</label>
                <select value={basics.level} onChange={setB('level')} className={selectClass}>
                  <option value="">Not set</option>
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Delivery</label>
                <select value={basics.deliveryMode} onChange={setB('deliveryMode')} className={selectClass}>
                  <option value="SELF_PACED">Self-paced</option>
                  <option value="INSTRUCTOR_LED">Instructor-led</option>
                  <option value="BLENDED">Blended</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Enrollment</label>
                <select value={basics.enrollmentPolicy} onChange={setB('enrollmentPolicy')} className={selectClass}>
                  <option value="OPEN">Open to all</option>
                  <option value="REQUEST_TO_JOIN">Request to join</option>
                  <option value="INVITE_ONLY">Invite only</option>
                </select>
              </div>
            </div>

            {/* Enrollment & schedule — capacity and the bar to pass, then dates */}
            <GroupDivider label="Enrollment & schedule" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              <div>
                <label className={labelClass}>Capacity</label>
                <input type="number" min="1" value={basics.enrollmentLimit} onChange={setB('enrollmentLimit')} placeholder="Unlimited" className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Estimated hours</label>
                <input type="number" min="1" value={basics.estimatedHours} onChange={setB('estimatedHours')} placeholder="e.g. 40" className={fieldClass} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className={labelClass}>Passing score (%)</label>
                <input type="number" min="0" max="100" value={basics.passingScore} onChange={setB('passingScore')} placeholder="e.g. 70" className={fieldClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              <div>
                <label className={labelClass}>Start date</label>
                <input type="date" value={basics.startDate} onChange={setB('startDate')} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>End date</label>
                <input type="date" value={basics.endDate} onChange={setB('endDate')} className={fieldClass} />
              </div>
              {/* Instructor comes from the institution's own staff — only entity
                  authors can assign one; the school can set it later otherwise. */}
              {!isPlatformAuthor && (
                <div className="col-span-2 sm:col-span-1">
                  <label className={labelClass}>Instructor</label>
                  <select value={basics.instructorId} onChange={setB('instructorId')} className={selectClass}>
                    <option value="">Not assigned</option>
                    {staff.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* Cover image — full width, with a small certificate toggle beneath (no card) */}
            <GroupDivider label="Cover & certificate" />
            <div>
              <label className={labelClass}>Cover image</label>
              <CoverImageDropzone
                value={basics.coverImageUrl}
                onChange={(url) => setBasics((p) => ({ ...p, coverImageUrl: url }))}
              />
              <button
                type="button"
                onClick={() => setBasics((p) => ({ ...p, certificateEnabled: !p.certificateEnabled }))}
                aria-pressed={basics.certificateEnabled}
                className="mt-2.5 flex items-center gap-2 group"
              >
                <span className={`w-4 h-4 rounded-[5px] border flex items-center justify-center shrink-0 transition-colors ${basics.certificateEnabled ? 'bg-[#d0f24a] border-[#d0f24a] text-[#1b1e26]' : 'bg-white border-[#1b1e26]/20 text-transparent group-hover:border-[#1b1e26]/35'}`}>
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <span className="text-[12px] font-medium text-[#1b1e26]/65">Issue a certificate on completion</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Objectives ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-[15px] font-semibold text-[#1b1e26] tracking-tight">What students will learn</h2>
              <p className="text-[12.5px] text-gray-400 mt-0.5">Each line becomes a checkmark on the course page. Codes are optional.</p>
            </div>

            <div className="space-y-2.5">
              {objectives.map((o, i) => (
                <div key={i} className="flex flex-wrap items-start gap-2.5">
                  <span className="w-7 h-[37px] flex items-center justify-center text-[11px] font-bold text-[#1b1e26]/30 shrink-0">{i + 1}</span>
                  <div className="w-[130px] shrink-0">
                    <input
                      type="text" value={o.code} placeholder="Code"
                      onChange={(e) => setObjectives((p) => p.map((x, xi) => (xi === i ? { ...x, code: e.target.value } : x)))}
                      className={fieldClass}
                    />
                  </div>
                  <div className="flex-1 min-w-[180px]">
                    <input
                      type="text" value={o.description} placeholder="e.g. Apply project management concepts to real projects"
                      onChange={(e) => setObjectives((p) => p.map((x, xi) => (xi === i ? { ...x, description: e.target.value } : x)))}
                      className={fieldClass}
                    />
                  </div>
                  <div className="flex items-center gap-0.5 pt-1.5 shrink-0">
                    <button className={miniBtnClass} disabled={i === 0} onClick={() => setObjectives((p) => move(p, i, i - 1))} aria-label="Move up">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                    <button className={miniBtnClass} disabled={i === objectives.length - 1} onClick={() => setObjectives((p) => move(p, i, i + 1))} aria-label="Move down">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                    <button
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      onClick={() => setObjectives((p) => (p.length > 1 ? p.filter((_, xi) => xi !== i) : p.map(() => newObjective())))}
                      aria-label="Remove objective"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setObjectives((p) => [...p, newObjective()])}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-[#1b1e26]/20 text-[13px] font-semibold text-[#1b1e26]/60 hover:text-[#1b1e26] hover:border-[#d0f24a] hover:bg-[#d0f24a]/10 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
              Add objective
            </button>
          </div>
        )}

        {/* ── STEP 3: Curriculum ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-[15px] font-semibold text-[#1b1e26] tracking-tight">Curriculum</h2>
              <p className="text-[12.5px] text-gray-400 mt-0.5">
                Build the modules and their content. Locked modules unlock when the previous one is completed.
              </p>
            </div>

            <div className="space-y-4">
              {modules.map((m, mi) => (
                <div key={mi} className="rounded-2xl border border-[#1b1e26]/[0.08] overflow-hidden">
                  {/* Module header */}
                  <div className="bg-[#fafbfc] px-4 py-3.5 space-y-3">
                    <p className="text-[10px] font-bold text-[#1b1e26]/40 uppercase tracking-[0.12em]">Module {mi + 1}</p>
                    {/* Title + type stay on ONE row — the input shrinks instead of the select wrapping */}
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-[#1b1e26] text-[#d0f24a] text-[12px] font-bold flex items-center justify-center shrink-0">
                        {mi + 1}
                      </span>
                      <input
                        type="text" value={m.title} placeholder={`Module ${mi + 1} title (required)`}
                        onChange={(e) => setModules((p) => p.map((x, xi) => (xi === mi ? { ...x, title: e.target.value } : x)))}
                        className={`${fieldClass} bg-white flex-1 min-w-[160px] text-sm border-[#1b1e26]/20`}
                      />
                      <select
                        value={m.moduleType}
                        onChange={(e) => setModules((p) => p.map((x, xi) => (xi === mi ? { ...x, moduleType: e.target.value } : x)))}
                        className={`${selectClass} bg-white w-[140px] shrink-0`}
                      >
                        {MODULE_TYPES.map((t) => <option key={t} value={t}>{humanize(t)}</option>)}
                      </select>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button className={miniBtnClass} disabled={mi === 0} onClick={() => setModules((p) => move(p, mi, mi - 1))} aria-label="Move module up">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </button>
                        <button className={miniBtnClass} disabled={mi === modules.length - 1} onClick={() => setModules((p) => move(p, mi, mi + 1))} aria-label="Move module down">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </button>
                        <button
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          onClick={() => setModules((p) => (p.length > 1 ? p.filter((_, xi) => xi !== mi) : p))}
                          aria-label="Remove module"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" /></svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 pl-11">
                      <input
                        type="text" value={m.description} placeholder="Module description (optional)"
                        onChange={(e) => setModules((p) => p.map((x, xi) => (xi === mi ? { ...x, description: e.target.value } : x)))}
                        className={`${fieldClass} bg-white flex-1 min-w-[200px]`}
                      />
                      {mi > 0 && (
                        <LimeCheck
                          checked={m.lockedAfterPrevious}
                          onChange={(e) => setModules((p) => p.map((x, xi) => (xi === mi ? { ...x, lockedAfterPrevious: e.target.checked } : x)))}
                          label="Unlocks after previous module"
                        />
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="p-4 space-y-2.5">
                    <p className="text-[10px] font-bold text-[#1b1e26]/40 uppercase tracking-[0.12em]">Lesson items</p>
                    {m.items.filter((i) => i.title.trim()).length === 0 && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold">
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        No lesson items yet — this module will look empty to learners until you add one below.
                      </div>
                    )}
                    {m.items.map((item, ii) => {
                      // One updater for every field of this item — keeps the JSX below readable.
                      const setItem = (patch) => setModules((p) => p.map((x, xi) => xi === mi
                        ? { ...x, items: x.items.map((y, yi) => (yi === ii ? { ...y, ...patch } : y)) }
                        : x));
                      const missingTitle = !item.title.trim() && !!(item.contentUrl.trim() || item.attachmentUrl.trim() || item.durationMinutes !== '');
                      return (
                        <div key={ii} className={`rounded-xl border p-3 space-y-2.5 transition-colors ${missingTitle ? 'border-amber-300 bg-amber-50/40' : 'border-[#1b1e26]/[0.07] bg-[#fdfdfe]'}`}>
                          {/* Row 1 — title + type share the line; the input shrinks, nothing wraps */}
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-md bg-[#f3f4f6] text-[#1b1e26]/40 text-[11px] font-bold flex items-center justify-center shrink-0">{ii + 1}</span>
                            <input
                              type="text" value={item.title} placeholder="Item title (required)"
                              onChange={(e) => setItem({ title: e.target.value })}
                              className={`${fieldClass} bg-white flex-1 min-w-[160px] border-[#1b1e26]/20 ${missingTitle ? 'border-amber-400 focus:border-amber-400 focus:ring-amber-200/60' : ''}`}
                            />
                            <select
                              value={item.itemType}
                              onChange={(e) => setItem({ itemType: e.target.value })}
                              className={`${selectClass} bg-white w-[130px] shrink-0`}
                            >
                              {ITEM_TYPES.map((t) => <option key={t} value={t}>{humanize(t)}</option>)}
                            </select>
                            <div className="flex items-center gap-0.5 shrink-0">
                              <button className={miniBtnClass} disabled={ii === 0} onClick={() => setModules((p) => p.map((x, xi) => (xi === mi ? { ...x, items: move(x.items, ii, ii - 1) } : x)))} aria-label="Move item up">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                              </button>
                              <button className={miniBtnClass} disabled={ii === m.items.length - 1} onClick={() => setModules((p) => p.map((x, xi) => (xi === mi ? { ...x, items: move(x.items, ii, ii + 1) } : x)))} aria-label="Move item down">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                              </button>
                              <button
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                onClick={() => setModules((p) => p.map((x, xi) => (xi === mi ? { ...x, items: x.items.filter((_, yi) => yi !== ii) } : x)))}
                                aria-label="Remove item"
                              >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" /></svg>
                              </button>
                            </div>
                          </div>

                          {missingTitle && (
                            <p className="pl-[34px] text-[11px] font-semibold text-amber-600">
                              This item has content but no title — give it a name above so it can be saved.
                            </p>
                          )}

                          {/* Row 2 — link + duration (the type select lives beside the title above).
                              READING gets a real writing surface below instead of a URL field. */}
                          <div className="flex items-center gap-2.5 pl-[34px]">
                            {item.itemType !== 'READING' && (
                              <input
                                type="text" value={item.contentUrl} placeholder="Content link (YouTube, article… optional)"
                                onChange={(e) => setItem({ contentUrl: e.target.value })}
                                className={`${fieldClass} bg-white flex-1 min-w-0`}
                              />
                            )}
                            <input
                              type="number" min="1" value={item.durationMinutes} placeholder="min"
                              onChange={(e) => setItem({ durationMinutes: e.target.value })}
                              className={`${fieldClass} bg-white w-[80px] shrink-0`}
                            />
                          </div>

                          {/* Reading body — learners see this as a formatted document */}
                          {item.itemType === 'READING' && (
                            <div className="pl-[34px] space-y-1.5">
                              <textarea
                                rows={9}
                                value={item.contentUrl}
                                onChange={(e) => setItem({ contentUrl: e.target.value })}
                                placeholder={'Write the lesson content here…\n\n# Course 1. The Lesson Banner\n\nWhy this course\nA short paragraph explaining the lesson.\n\n- First outcome\n- Second outcome\n\n+++ Who is this curriculum for?\nAnyone starting out — this expands when the learner clicks it.\n+++\n\n> Captions are available for all videos.'}
                                className={`${fieldClass} bg-white w-full resize-y leading-relaxed font-normal`}
                              />
                              <div className="flex flex-wrap items-start justify-between gap-2.5">
                                <p className="text-[11px] text-gray-400 leading-relaxed flex-1 min-w-[260px]">
                                  <span className="font-semibold text-gray-500">Formatting:</span>{' '}
                                  blank line = paragraph · short line = heading · <span className="font-mono"># Banner title</span> ·{' '}
                                  <span className="font-mono">- bullet</span> · <span className="font-mono">1. numbered</span> ·{' '}
                                  <span className="font-mono">**bold**</span> · <span className="font-mono">Label: value</span> ·{' '}
                                  <span className="font-mono">A: 1 | B: 2</span> = info row ·{' '}
                                  <span className="font-mono">+++ Title … +++</span> = click-to-expand ·{' '}
                                  <span className="font-mono">&gt; note</span> = info box ·{' '}
                                  <span className="font-mono">---</span> = divider ·{' '}
                                  add <span className="font-mono">|left</span>/<span className="font-mono">|right</span> to an image URL to wrap text beside it
                                </p>
                                <label className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer bg-[#f3f4f6] text-[#1b1e26]/70 hover:bg-[#d0f24a]/25 hover:text-[#1b1e26] transition-colors">
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                  Insert image
                                  <input
                                    type="file" accept="image/*" className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      e.target.value = '';
                                      if (!file) return;
                                      try {
                                        const up = await fileService.upload(file, { kind: 'image' });
                                        const caption = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
                                        const base = item.contentUrl ? `${item.contentUrl.trimEnd()}\n\n` : '';
                                        setItem({ contentUrl: `${base}![${caption}](${up.url})\n` });
                                        toast.success('Image added to the lesson content');
                                      } catch (err) {
                                        toast.error(err.message || 'Image upload failed');
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                            </div>
                          )}

                          {/* Row 3 — uploaded notes/video for this item */}
                          <div className="pl-[34px]">
                            <AttachmentDropzone
                              url={item.attachmentUrl}
                              name={item.attachmentName}
                              onChange={(file) => setItem({ attachmentUrl: file?.url || '', attachmentName: file?.name || '' })}
                            />
                          </div>
                        </div>
                      );
                    })}
                    <button
                      onClick={() => setModules((p) => p.map((x, xi) => (xi === mi ? { ...x, items: [...x.items, newItem()] } : x)))}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1b1e26]/50 hover:text-[#1b1e26] hover:bg-[#d0f24a]/15 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
                      Add item
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setModules((p) => [...p, newModule(true)])}
              className="w-full py-3 rounded-2xl border border-dashed border-[#1b1e26]/20 text-sm font-semibold text-[#1b1e26]/60 hover:text-[#1b1e26] hover:border-[#d0f24a] hover:bg-[#d0f24a]/10 transition-colors inline-flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
              Add module
            </button>
          </div>
        )}

        {/* ── STEP 4: Review ── */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-[15px] font-semibold text-[#1b1e26] tracking-tight">Review & save</h2>
              <p className="text-[12.5px] text-gray-400 mt-0.5">
                Everything below is saved in one atomic operation — nothing is written until you confirm.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Modules', value: modules.filter((m) => m.title.trim()).length },
                { label: 'Items', value: totalItems },
                { label: 'Objectives', value: objectives.filter((o) => o.description.trim()).length },
                { label: 'Delivery', value: humanize(basics.deliveryMode) },
              ].map((f) => (
                <div key={f.label} className="rounded-xl bg-[#f7f8fa] border border-[#1b1e26]/[0.05] px-4 py-3.5 text-center">
                  <p className="text-lg font-semibold text-[#1b1e26]">{f.value}</p>
                  <p className="text-[10px] font-bold text-[#1b1e26]/45 uppercase tracking-[0.12em] mt-0.5">{f.label}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-[#1b1e26]/[0.06] divide-y divide-[#1b1e26]/[0.05]">
              <div className="px-5 py-3.5 flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold text-[#1b1e26]/45 uppercase tracking-[0.1em]">Title</span>
                <span className="text-sm font-semibold text-[#1b1e26] text-right truncate">{basics.title || '—'}</span>
              </div>
              {[
                ['Code', basics.code], ['Category', categories.find((c) => c.id === basics.categoryId)?.name], ['Level', humanize(basics.level) === '—' ? '' : humanize(basics.level)],
                ['Enrollment', humanize(basics.enrollmentPolicy)], ['Instructor', staff.find((u) => u.id === basics.instructorId)?.name],
                ['Certificate', basics.certificateEnabled ? 'Yes' : 'No'],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label} className="px-5 py-3.5 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-semibold text-[#1b1e26]/45 uppercase tracking-[0.1em]">{label}</span>
                  <span className="text-sm text-[#1b1e26]/80 text-right truncate">{value}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {modules.filter((m) => m.title.trim()).map((m, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl bg-[#f7f8fa] border border-[#1b1e26]/[0.05] px-4 py-2.5">
                  <span className="w-6 h-6 rounded-md bg-[#1b1e26] text-[#d0f24a] text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span className="text-[13px] font-medium text-[#1b1e26] truncate flex-1">{m.title}</span>
                  <span className="text-[11px] text-gray-400 shrink-0">{m.items.filter((x) => x.title.trim()).length} items</span>
                  {i > 0 && m.lockedAfterPrevious && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-amber-50 text-amber-700 shrink-0">
                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                      Locked
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {stepError && (
          <p className="mt-5 text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">{stepError}</p>
        )}
      </div>

      {/* Footer navigation */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3">
        <button
          onClick={() => (step === 0 ? navigate(exitTo) : goTo(step - 1))}
          className="w-full sm:w-auto px-5 py-2 rounded-xl text-[13px] font-semibold text-[#1b1e26]/70 border border-[#1b1e26]/10 hover:bg-white transition-colors"
        >
          {step === 0 ? 'Cancel' : 'Back'}
        </button>

        {step < 3 ? (
          <button
            onClick={() => goTo(step + 1)}
            className="w-full sm:w-auto px-6 py-2 rounded-xl text-[13px] font-bold bg-[#1b1e26] text-white hover:bg-black transition-colors active:scale-[0.98] shadow-sm inline-flex items-center justify-center gap-2"
          >
            Continue
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <button
              onClick={() => save(false)}
              disabled={saving}
              className="w-full sm:w-auto px-5 py-2 rounded-xl text-[13px] font-semibold text-[#1b1e26] border border-[#1b1e26]/15 bg-white hover:bg-[#f7f8fa] transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save as draft'}
            </button>
            <button
              onClick={() => save(true)}
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2 rounded-xl text-[13px] font-bold bg-[#d0f24a] text-[#1b1e26] hover:bg-[#c4e83a] transition-colors active:scale-[0.98] shadow-sm disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save & publish'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseBuilderPage;
