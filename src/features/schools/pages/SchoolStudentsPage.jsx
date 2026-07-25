import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { entityProfileService, entityUserService } from '../../../services/api';
import { RowActionMenu, DockIcons } from '../../../components/shared/RowActions';
import { AddUserModal } from '../../admin/components/AddUserModal';
import { ConfirmDeleteModal } from '../../admin/components/CurriculumModals';
import { useToast } from '../../../context/ToastContext';

const STATUS_STYLES = {
  Active: { pill: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  Inactive: { pill: 'bg-[#1b1e26]/[0.05] text-[#1b1e26]/45', dot: 'bg-[#1b1e26]/30' },
  Locked: { pill: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
};

const resolveStatus = (s) => {
  if (s.accountNonLocked === false) return 'Locked';
  return s.active === false ? 'Inactive' : 'Active';
};

const StatusPill = ({ status }) => {
  const style = STATUS_STYLES[status] || STATUS_STYLES.Inactive;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${style.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
};

const ENROLL_STATUS = {
  PENDING: 'bg-amber-50 text-amber-700',
  ACTIVE: 'bg-emerald-50 text-emerald-700',
  COMPLETED: 'bg-blue-50 text-blue-700',
  DROPPED: 'bg-red-50 text-red-600',
};

export const SchoolStudentsPage = () => {
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

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
    let list = students;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q));
    }
    if (filterStatus !== 'ALL') {
      list = list.filter((s) => resolveStatus(s) === filterStatus);
    }
    return list;
  }, [students, search, filterStatus]);

  const counts = useMemo(() => {
    const map = { ALL: students.length, Active: 0, Inactive: 0, Locked: 0 };
    students.forEach((s) => { map[resolveStatus(s)] += 1; });
    return map;
  }, [students]);

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

  const handleAction = async (fn, msg) => {
    if (msg && !window.confirm(msg)) return;
    try {
      await fn();
      await load();
    } catch {
      toast.addToast('Action failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gray-400">Student Records</span>
          <h1 className="text-[19px] font-medium tracking-tight mt-1.5 text-[#1b1e26]">Student Registry</h1>
          <p className="text-[12px] text-slate-500 mt-1">Browse enrolled students, view their courses, and manage accounts.</p>
        </div>
        <button
          onClick={() => setUserModalOpen(true)}
          className="bg-[#1b1e26] text-white text-[13px] font-semibold px-5 py-2 rounded-xl hover:bg-black transition-colors inline-flex items-center gap-2 shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Add Student
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text" placeholder="Search by name or email..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#1b1e26]/[0.08] text-sm bg-white outline-none focus:border-[#1b1e26]/30 transition-colors"
          />
        </div>
        <div className="inline-flex rounded-xl bg-white border border-[#1b1e26]/[0.06] shadow-sm p-0.5 gap-0.5">
          {['ALL', 'Active', 'Inactive', 'Locked'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                filterStatus === f ? 'bg-[#1b1e26] text-white shadow-sm' : 'text-gray-400 hover:text-[#1b1e26] hover:bg-[#f7f8fa]'
              }`}
            >
              {f === 'ALL' ? 'All' : f}
              <span className={`min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center ${
                filterStatus === f ? 'bg-[#d0f24a] text-[#1b1e26]' : 'bg-[#1b1e26]/[0.06] text-[#1b1e26]/50'
              }`}>
                {counts[f] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-[#1b1e26]/15 p-14 text-center">
          <span className="w-14 h-14 rounded-2xl bg-[#d0f24a]/20 text-[#1b1e26] flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </span>
          <p className="text-base font-semibold text-[#1b1e26]">No students found</p>
          <p className="text-sm text-gray-400 mt-1">{search ? 'Try a different search term.' : 'Add your first student to get started.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => {
            const status = resolveStatus(s);
            const initials = (s.name || '?').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
            return (
              <div key={s.id} className="bg-white rounded-2xl border border-[#1b1e26]/[0.06] shadow-sm px-5 py-4 flex items-center gap-4 transition-all duration-200 hover:shadow-md">
                <span className="w-10 h-10 rounded-full bg-[#f7f8fa] text-[#1b1e26]/60 text-xs font-bold flex items-center justify-center shrink-0">
                  {initials}
                </span>
                <div className="min-w-0 flex-1 grid grid-cols-5 gap-4 items-center">
                  <div className="col-span-2 min-w-0">
                    <p className="text-sm font-semibold text-[#1b1e26] truncate">{s.name || '—'}</p>
                    <p className="text-xs text-gray-400 truncate">{s.email || '—'}</p>
                  </div>
                  <div className="hidden sm:block">
                    <div className="flex flex-wrap gap-1">
                      {s.enrollments?.length > 0 ? (
                        s.enrollments.slice(0, 3).map((e) => (
                          <span key={e.courseId} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#f7f8fa] text-[#1b1e26]/70 truncate max-w-[120px]">
                            {e.courseTitle}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-gray-300">No enrollments</span>
                      )}
                      {s.enrollments?.length > 3 && (
                        <span className="text-[10px] text-gray-400 font-semibold">+{s.enrollments.length - 3}</span>
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    {s.enrollments?.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#d0f24a] rounded-full" style={{ width: `${Math.round(s.enrollments.reduce((a, e) => a + e.progressPercent, 0) / s.enrollments.length)}%` }} />
                        </div>
                        <span className="text-[10px] font-semibold text-[#1b1e26] tabular-nums">
                          {Math.round(s.enrollments.reduce((a, e) => a + e.progressPercent, 0) / s.enrollments.length)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-300">—</span>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <StatusPill status={status} />
                    <RowActionMenu
                      primary={{ label: 'Edit', icon: DockIcons.edit, onClick: () => {} }}
                      items={[
                        s.accountNonLocked === false
                          ? { label: 'Unlock account', icon: DockIcons.unlock, iconTone: 'text-amber-500', onClick: () => handleAction(() => entityUserService.unlock(s.id)) }
                          : { label: 'Lock account', icon: DockIcons.lock, iconTone: 'text-amber-500', onClick: () => handleAction(() => entityUserService.lock(s.id), `Lock ${s.name}?`) },
                        s.active === false
                          ? { label: 'Activate', icon: DockIcons.power, iconTone: 'text-emerald-500', onClick: () => handleAction(() => entityUserService.setStatus(s.id, true)) }
                          : { label: 'Deactivate', icon: DockIcons.power, onClick: () => handleAction(() => entityUserService.setStatus(s.id, false), `Deactivate ${s.name}?`) },
                        'divider',
                        { label: 'Delete', icon: DockIcons.trash, danger: true, onClick: () => setDeleteTarget(s) },
                      ]}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {userModalOpen && (
        <AddUserModal
          isOpen={userModalOpen}
          onClose={() => setUserModalOpen(false)}
          onSubmit={async (data) => {
            try {
              await entityUserService.create(data);
              toast.addToast('Student created', 'success');
              setUserModalOpen(false);
              await load();
            } catch (err) {
              toast.addToast(err.message || 'Failed to create student', 'error');
            }
          }}
          fetchRoles={async () => {
            const { entityRoleService } = await import('../../../services/api');
            return entityRoleService.list();
          }}
        />
      )}

      <ConfirmDeleteModal
        open={deleteTarget !== null}
        title="Delete student"
        message={`Are you sure you want to delete "${deleteTarget?.name || ''}"? This cannot be undone.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};


