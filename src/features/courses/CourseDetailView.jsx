import React from 'react';

/**
 * Read-only course landing view — shared by the school portal (author view)
 * and the admin portal (oversight view). Mirrors the reference layout:
 * header, "What you'll learn", syllabus, and a facts rail.
 */

export const COURSE_STATUS_STYLES = {
  DRAFT: { pill: 'bg-amber-50 text-amber-700 border border-amber-200', dot: 'bg-amber-500', label: 'Draft' },
  PUBLISHED: { pill: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500', label: 'Published' },
  ARCHIVED: { pill: 'bg-[#1b1e26]/[0.05] text-[#1b1e26]/50 border border-[#1b1e26]/10', dot: 'bg-[#1b1e26]/30', label: 'Archived' },
};

export const CourseStatusPill = ({ status }) => {
  const s = COURSE_STATUS_STYLES[status] || COURSE_STATUS_STYLES.DRAFT;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${s.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

export const humanize = (value) =>
  value ? String(value).replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : null;

const ITEM_TYPE_ICONS = {
  VIDEO: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  READING: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  QUIZ: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  ASSIGNMENT: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  FILE: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
  LINK: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
};

const MODULE_TYPE_STYLES = {
  OVERVIEW: 'bg-sky-50 text-sky-700',
  LESSON: 'bg-[#1b1e26]/[0.05] text-[#1b1e26]/60',
  ASSESSMENT: 'bg-violet-50 text-violet-700',
};

const initialsOf = (name) =>
  (name || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

const Fact = ({ label, value }) =>
  value == null || value === '' ? null : (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-[#1b1e26]/[0.05] last:border-0">
      <span className="text-[11px] font-semibold text-[#1b1e26]/45 uppercase tracking-[0.1em]">{label}</span>
      <span className="text-[13px] font-semibold text-[#1b1e26] text-right">{value}</span>
    </div>
  );

export const CourseDetailView = ({ course }) => {
  if (!course) return null;
  const totalMinutes = (course.modules || []).flatMap((m) => m.items || [])
    .reduce((sum, i) => sum + (i.durationMinutes || 0), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ── Main column ── */}
      <div className="lg:col-span-2 space-y-6 min-w-0">
        {/* Description */}
        {course.description && (
          <div className="bg-white rounded-2xl border border-[#1b1e26]/[0.06] shadow-sm p-6">
            <h2 className="text-sm font-semibold text-[#1b1e26] mb-3">About this course</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{course.description}</p>
          </div>
        )}

        {/* What you'll learn */}
        {(course.objectives || []).length > 0 && (
          <div className="bg-white rounded-2xl border border-[#1b1e26]/[0.06] shadow-sm p-6">
            <h2 className="text-sm font-semibold text-[#1b1e26] mb-4">What you'll learn</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {course.objectives.map((o) => (
                <div key={o.id || o.sortOrder} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-accent/30 text-[#1b1e26] flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <p className="text-[13px] text-gray-600 leading-relaxed min-w-0">
                    {o.code && <span className="font-semibold text-[#1b1e26]">{o.code} · </span>}
                    {o.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Syllabus */}
        <div className="bg-white rounded-2xl border border-[#1b1e26]/[0.06] shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#1b1e26]">Syllabus</h2>
            <span className="text-xs text-gray-400">
              {(course.modules || []).length} module{(course.modules || []).length === 1 ? '' : 's'}
            </span>
          </div>

          {(course.modules || []).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No modules yet.</p>
          ) : (
            <div className="space-y-2.5">
              {course.modules.map((m, idx) => (
                <div key={m.id || idx} className="rounded-xl border border-[#1b1e26]/[0.06] overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 bg-[#fafbfc]">
                    <span className="w-7 h-7 rounded-lg bg-[#1b1e26] text-accent text-[11px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-[#1b1e26] truncate">{m.title}</p>
                      {m.description && <p className="text-xs text-gray-400 truncate">{m.description}</p>}
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide shrink-0 ${MODULE_TYPE_STYLES[m.moduleType] || MODULE_TYPE_STYLES.LESSON}`}>
                      {humanize(m.moduleType)}
                    </span>
                    {m.lockedAfterPrevious && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide bg-amber-50 text-amber-700 shrink-0">
                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        Locked
                      </span>
                    )}
                  </div>

                  {(m.items || []).length > 0 && (
                    <div className="divide-y divide-[#1b1e26]/[0.04]">
                      {m.items.map((item, itemIdx) => (
                        <div key={item.id || itemIdx} className="flex items-center gap-3 px-4 py-2.5">
                          <span className="w-6 h-6 rounded-md bg-accent/20 text-[#1b1e26]/70 flex items-center justify-center shrink-0">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d={ITEM_TYPE_ICONS[item.itemType] || ITEM_TYPE_ICONS.READING} />
                            </svg>
                          </span>
                          <p className="text-[13px] text-gray-600 truncate flex-1">{item.title}</p>
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide shrink-0">
                            {humanize(item.itemType)}
                          </span>
                          {item.durationMinutes && (
                            <span className="text-[11px] text-gray-400 shrink-0">{item.durationMinutes} min</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Facts rail ── */}
      <div className="space-y-4">
        {/* Cover */}
        <div className="rounded-2xl overflow-hidden border border-[#1b1e26]/[0.06] shadow-sm bg-white">
          {course.coverImageUrl ? (
            <img src={course.coverImageUrl} alt={course.title} className="w-full h-44 object-cover" />
          ) : (
            <div className="w-full h-44 bg-gradient-to-br from-[#1b1e26] to-[#343b49] flex items-center justify-center">
              <span className="w-16 h-16 rounded-2xl bg-accent text-[#1b1e26] text-2xl font-bold flex items-center justify-center">
                {(course.title || '?').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="p-5">
            <Fact label="Delivery" value={humanize(course.deliveryMode)} />
            <Fact label="Level" value={humanize(course.level)} />
            <Fact label="Enrollment" value={humanize(course.enrollmentPolicy)} />
            <Fact label="Capacity" value={course.enrollmentLimit} />
            <Fact label="Effort" value={course.estimatedHours ? `${course.estimatedHours} hours` : null} />
            <Fact label="Content" value={totalMinutes > 0 ? `${totalMinutes} min` : null} />
            <Fact label="Language" value={course.language?.toUpperCase()} />
            <Fact label="Starts" value={course.startDate} />
            <Fact label="Ends" value={course.endDate} />
            <Fact label="Pass mark" value={course.passingScore != null ? `${course.passingScore}%` : null} />
            <Fact label="Certificate" value={course.certificateEnabled ? 'Yes' : 'No'} />
          </div>
        </div>

        {/* Instructor */}
        {course.instructorName && (
          <div className="bg-white rounded-2xl border border-[#1b1e26]/[0.06] shadow-sm p-5 flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-[#1b1e26] text-accent text-xs font-bold flex items-center justify-center shrink-0">
              {initialsOf(course.instructorName)}
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-[#1b1e26]/45 uppercase tracking-[0.12em]">Instructor</p>
              <p className="text-sm font-semibold text-[#1b1e26] truncate">{course.instructorName}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetailView;
