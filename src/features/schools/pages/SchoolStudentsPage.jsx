import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { entityProfileService, entityUserService } from '../../../services/api';
import { DataTable } from '../../../components/shared/DataTable';
import { RowActionMenu, DockIcons } from '../../../components/shared/RowActions';
import { ConfirmDeleteModal } from '../../admin/components/CurriculumModals';
import { useToast } from '../../../context/ToastContext';

const AVATAR_STYLES = [
  'bg-[#d0f24a]/20 text-[#5b6b12]', 'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',   'bg-emerald-100 text-emerald-700',
  'bg-[#1b1e26]/[0.06] text-[#1b1e26]/70', 'bg-violet-100 text-violet-700',
  'bg-fuchsia-100 text-fuchsia-700','bg-teal-100 text-teal-700',
];

const initialsOf = (name) =>
  (name || '?').split(/[\s_.-]+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

const avatarStyle = (seed) => {
  let h = 0;
  const s = seed || '?';
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return AVATAR_STYLES[h % AVATAR_STYLES.length];
};

const STATUS_STYLES = {
  Active:   { pill: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  Inactive: { pill: 'bg-[#1b1e26]/[0.05] text-[#1b1e26]/45', dot: 'bg-[#1b1e26]/30' },
  Locked:   { pill: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
};

const StatusPill = ({ status }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Inactive;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${s.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
};

const resolveStatus = (s) => {
  if (s.accountNonLocked === false) return 'Locked';
  return s.active === false ? 'Inactive' : 'Active';
};

const ENROLL_BADGE = {
  ACTIVE: 'bg-emerald-50 text-emerald-700',
  PENDING: 'bg-amber-50 text-amber-700',
  COMPLETED: 'bg-blue-50 text-blue-700',
  DROPPED: 'bg-red-50 text-red-600',
};

const filterFieldClass =
  'w-full text-[13px] px-3 py-2 rounded-lg border border-[#1b1e26]/10 bg-[#f7f8fa] text-[#1b1e26] focus:bg-white focus:ring-4 focus:ring-[#d0f24a]/20 focus:border-[#d0f24a] focus:outline-none transition-all';
const filterSelectClass = `${filterFieldClass} appearance-none pr-8 cursor-pointer`;
const filterLabelClass = 'text-[10px] font-semibold text-[#1b1e26]/45 uppercase tracking-[0.12em]';

const SelectChevron = () => (
  <svg className="w-3.5 h-3.5 text-[#1b1e26]/40 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CoursesModal = ({ student, onClose }) => {
  if (!student) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-[#1b1e26]/[0.06] shadow-[0_20px_60px_rgba(27,30,38,0.25)] w-full max-w-lg max-h-[80vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-150" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1b1e26]/[0.06]">
          <h3 className="text-[15px] font-semibold text-[#1b1e26]">{student.name} — Enrolled Courses</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1b1e26] hover:bg-[#f7f8fa] transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-5 space-y-3">
          {student.enrollments?.length > 0 ? student.enrollments.map((e) => (
            <div key={e.courseId} className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-[#f7f8fa]">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#1b1e26] truncate">{e.courseTitle}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Enrolled {new Date(e.enrolledAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${ENROLL_BADGE[e.status] || 'bg-gray-100 text-gray-500'}`}>{e.status}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#d0f24a] rounded-full" style={{ width: `${e.progressPercent}%` }} />
                  </div>
                  <span className="text-[10px] font-semibold text-[#1b1e26] tabular-nums">{e.progressPercent}%</span>
                </div>
              </div>
            </div>
          )) : (
            <p className="text-sm text-gray-400 text-center py-6">Not enrolled in any courses.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export const SchoolStudentsPage = () => {
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [coursesTarget, setCoursesTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await entityProfileService.listStudents();
      setStudents(Array.isArray(data) ? data : []);
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      if (q) {
        const hit = (s.name || '').toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (filterStatus !== 'All' && resolveStatus(s) !== filterStatus) return false;
      if (filterDateFrom || filterDateTo) {
        const created = s.createdAt ? s.createdAt.slice(0, 10) : '';
        if (!created) return false;
        if (filterDateFrom && created < filterDateFrom) return false;
        if (filterDateTo && created > filterDateTo) return false;
      }
      return true;
    });
  }, [students, search, filterStatus, filterDateFrom, filterDateTo]);

  const resetFilters = () => {
    setSearch('');
    setFilterStatus('All');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await entityUserService.remove(deleteTarget.id);
      toast.addToast('Student deleted', 'success');
      setDeleteTarget(null);
      await load();
    } catch {
      toast.addToast('Failed to delete student', 'error');
    }
  };

  const handleLock = async (s) => {
    try {
      await entityUserService.lock(s.id);
      toast.addToast('Account locked', 'success');
      await load();
    } catch {
      toast.addToast('Failed to lock account', 'error');
    }
  };

  const handleUnlock = async (s) => {
    try {
      await entityUserService.unlock(s.id);
      toast.addToast('Account unlocked', 'success');
      await load();
    } catch {
      toast.addToast('Failed to unlock account', 'error');
    }
  };

  const handleToggleStatus = async (s) => {
    try {
      await entityUserService.setStatus(s.id, s.active === false);
      toast.addToast('Status updated', 'success');
      await load();
    } catch {
      toast.addToast('Failed to update status', 'error');
    }
  };

  const columns = [
    {
      key: 'name', header: 'Name', sortable: true, sortValue: (s) => s.name || s.username || '',
      render: (s) => {
        const label = s.name || s.username || '?';
        return (
          <div className="flex items-center gap-3">
            <span className={`w-9 h-9 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${avatarStyle(label)}`}>
              {initialsOf(label)}
            </span>
            <span className="font-medium text-[#1b1e26] whitespace-nowrap">{s.name || '—'}</span>
          </div>
        );
      },
    },
    {
      key: 'email', header: 'Email', sortable: true, sortValue: (s) => s.email || '',
      render: (s) => <span className="text-[#1b1e26]/45">{s.email || '—'}</span>,
    },
    {
      key: 'courses', header: 'Courses', sortable: true, sortValue: (s) => s.enrollments?.length || 0,
      render: (s) => {
        const count = s.enrollments?.length || 0;
        return (
          <button
            onClick={() => setCoursesTarget(s)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold bg-[#f7f8fa] text-[#1b1e26]/80 border border-[#1b1e26]/10 hover:bg-[#d0f24a]/20 hover:border-[#d0f24a]/30 transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            {count} {count === 1 ? 'course' : 'courses'}
          </button>
        );
      },
    },
    {
      key: 'status', header: 'Status', sortable: true, sortValue: resolveStatus,
      render: (s) => <StatusPill status={resolveStatus(s)} />,
    },
    {
      key: 'createdAt', header: 'Created', sortable: true,
      sortValue: (s) => (s.createdAt ? new Date(s.createdAt).getTime() : 0),
      render: (s) => (
        <span className="text-gray-400">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}</span>
      ),
    },
    {
      key: 'actions', header: 'Actions', width: '132px',
      render: (s) => (
        <div className="flex justify-end">
          <RowActionMenu
            primary={{ label: 'Edit', icon: DockIcons.edit, onClick: () => {} }}
            items={[
              s.accountNonLocked === false
                ? { label: 'Unlock account', icon: DockIcons.unlock, iconTone: 'text-amber-500', onClick: () => handleUnlock(s) }
                : { label: 'Lock account', icon: DockIcons.lock, iconTone: 'text-amber-500', onClick: () => handleLock(s) },
              s.active === false
                ? { label: 'Activate', icon: DockIcons.power, iconTone: 'text-emerald-500', onClick: () => handleToggleStatus(s) }
                : { label: 'Deactivate', icon: DockIcons.power, onClick: () => handleToggleStatus(s) },
              'divider',
              { label: 'Delete', icon: DockIcons.trash, danger: true, onClick: () => setDeleteTarget(s) },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gray-400">Student Records</span>
          <h1 className="text-[19px] font-medium tracking-tight mt-1 text-[#1b1e26]">Student Registry</h1>
          <p className="text-[12px] text-slate-500 mt-1">Browse enrolled students, view their courses, and manage accounts.</p>
        </div>
        <button
          onClick={load}
          className="bg-[#1b1e26] text-white text-[13px] font-semibold px-5 py-2 rounded-xl hover:bg-black transition-colors inline-flex items-center gap-2 shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Add Student
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#1b1e26]/[0.06] shadow-sm px-3 py-2.5">
        <div className="flex flex-wrap items-end gap-2.5">
          <div className="flex-1 min-w-[200px] max-w-[340px] flex flex-col gap-1">
            <label className={filterLabelClass}>Search</label>
            <div className="relative">
              <svg className="w-4 h-4 text-[#1b1e26]/35 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
              </svg>
              <input
                type="text" placeholder="Name or email…"
                value={search} onChange={(e) => setSearch(e.target.value)}
                className={`${filterFieldClass} pl-9`}
              />
            </div>
          </div>
          <div className="w-[118px] flex flex-col gap-1">
            <label className={filterLabelClass}>Status</label>
            <div className="relative">
              <select className={filterSelectClass} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Locked">Locked</option>
              </select>
              <SelectChevron />
            </div>
          </div>
          <div className="w-[160px] flex flex-col gap-1">
            <label className={filterLabelClass}>From</label>
            <div className="relative">
              <svg className="w-4 h-4 text-[#1b1e26]/35 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="17" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <input
                type="date" aria-label="Created from"
                className={`${filterFieldClass} pl-9`}
                value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)}
              />
            </div>
          </div>
          <div className="w-[160px] flex flex-col gap-1">
            <label className={filterLabelClass}>To</label>
            <div className="relative">
              <svg className="w-4 h-4 text-[#1b1e26]/35 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="17" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <input
                type="date" aria-label="Created to"
                className={`${filterFieldClass} pl-9`}
                value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={resetFilters}
            className="shrink-0 h-[34px] px-4 rounded-full border border-red-200 text-red-500 text-[13px] font-semibold hover:bg-red-50 hover:border-red-300 inline-flex items-center gap-1.5 transition-colors active:scale-[0.98]"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            Clear All
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        keyField="id"
        loading={loading}
        minWidth={1020}
        skeletonRows={10}
        pageSize={10}
        rowLabel="students"
        emptyTitle={students.length === 0 ? 'No students yet' : 'No matches'}
        emptyMessage={students.length === 0 ? 'Add your first student to get started.' : 'No students match the current filters.'}
      />

      <ConfirmDeleteModal
        open={deleteTarget !== null}
        title="Delete student"
        message={`Are you sure you want to delete "${deleteTarget?.name || ''}"? This action cannot be undone.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <CoursesModal student={coursesTarget} onClose={() => setCoursesTarget(null)} />
    </div>
  );
};
