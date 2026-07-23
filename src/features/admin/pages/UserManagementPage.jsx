import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AddUserModal } from '../components/AddUserModal';
import { ConfirmDeleteModal } from '../components/CurriculumModals';
import { DataTable } from '../../../components/shared/DataTable';
import { RowActionMenu, DockIcons } from '../../../components/shared/RowActions';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { adminService, platformEntityService } from '../../../services/api';

// ── Avatar helpers ────────────────────────────────────────────────────────────
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

// ── Status badge ──────────────────────────────────────────────────────────────
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

const resolveUserStatus = (user) => {
  if (user.accountNonLocked === false) return 'Locked';
  return user.enabled === false ? 'Inactive' : 'Active';
};

// ── Shared style constants — compact filter recipe ───────────────────────────
const filterFieldClass =
  'w-full text-[13px] px-3 py-2 rounded-lg border border-[#1b1e26]/10 bg-[#f7f8fa] text-[#1b1e26] focus:bg-white focus:ring-4 focus:ring-[#d0f24a]/20 focus:border-[#d0f24a] focus:outline-none transition-all';
const filterSelectClass = `${filterFieldClass} appearance-none pr-8 cursor-pointer`;
const filterLabelClass = 'text-[10px] font-semibold text-[#1b1e26]/45 uppercase tracking-[0.12em]';

const SelectChevron = () => (
  <svg className="w-3.5 h-3.5 text-[#1b1e26]/40 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Main component ────────────────────────────────────────────────────────────
export const UserManagementPage = () => {
  const toast = useToast();
  const { user: currentUser } = useAuth();

  // Own account is protected — no lock/disable/delete on yourself (backend
  // rejects it too; hiding the options keeps the UI honest).
  const isSelf = (u) =>
    !!currentUser &&
    (u.id === currentUser.id ||
      (!!currentUser.username && u.username === currentUser.username));

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterLock, setFilterLock] = useState('All');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const data = await adminService.getRoles();
      setRoles(Array.isArray(data) ? data : []);
    } catch {
      // roles are supplementary (for filter); silently ignore
    }
  }, []);

  const fetchEntities = useCallback(async () => {
    try {
      return await platformEntityService.listAll();
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  // ── Filtering ─────────────────────────────────────────────────────────────
  const getUserRoleName = useCallback(
    (u) => {
      if (Array.isArray(u.roles) && u.roles.length > 0)
        return u.roles.map((r) => r?.name || r).join(', ');
      if (typeof u.roles === 'string' && u.roles) return u.roles;
      if (u.role && typeof u.role === 'object') return u.role.name || 'None';
      if (u.roleId != null) {
        const m = roles.find((r) => String(r.id) === String(u.roleId));
        return m ? m.name : 'None';
      }
      return 'None';
    },
    [roles]
  );

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (q) {
        const hit =
          (u.name || '').toLowerCase().includes(q) ||
          (u.username || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (filterRole !== 'All' && getUserRoleName(u) !== filterRole) return false;
      if (filterStatus !== 'All' && resolveUserStatus(u) !== filterStatus) return false;
      if (filterLock === 'Locked' && u.accountNonLocked !== false) return false;
      if (filterLock === 'Unlocked' && u.accountNonLocked === false) return false;
      if (filterDateFrom || filterDateTo) {
        // ISO yyyy-mm-dd substrings compare correctly as strings
        const created = u.createdAt ? u.createdAt.slice(0, 10) : '';
        if (!created) return false;
        if (filterDateFrom && created < filterDateFrom) return false;
        if (filterDateTo && created > filterDateTo) return false;
      }
      return true;
    });
  }, [users, search, filterRole, filterStatus, filterLock, filterDateFrom, filterDateTo, getUserRoleName]);

  const resetFilters = () => {
    setSearch('');
    setFilterRole('All');
    setFilterStatus('All');
    setFilterLock('All');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleSaveUser = async (userData) => {
    const roleIds = Array.isArray(userData.roleIds)
      ? userData.roleIds.filter(Boolean)
      : userData.roleId ? [userData.roleId] : [];

    try {
      if (editingUser) {
        await adminService.updateUser(editingUser.id, {
          name: userData.name,
          username: userData.username,
          email: userData.email,
          enabled: userData.status !== 'Inactive',
          roleIds,
        });
        toast.success('User updated');
      } else {
        await adminService.createUser({
          name: userData.name,
          username: userData.username,
          email: userData.email,
          password: userData.password,
          roleIds,
        };
        if (userData.entityId) payload.entityId = userData.entityId;
        await adminService.createUser(payload);
        toast.success('User created');
      }
      await fetchUsers();
      setIsUserModalOpen(false);
      setEditingUser(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await adminService.setUserStatus(user.id, user.enabled === false);
      await fetchUsers();
      toast.success('User status updated');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleLock = async (user) => {
    try {
      await adminService.lockUser(user.id);
      await fetchUsers();
      toast.success('User locked');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUnlock = async (user) => {
    try {
      await adminService.unlockUser(user.id);
      await fetchUsers();
      toast.success('User unlocked');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (user) => {
    setDeleteTarget(user);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminService.deleteUser(deleteTarget.id);
      await fetchUsers();
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleteTarget(null);
    }
  };

  // ── Column definitions ────────────────────────────────────────────────────
  const columns = [
    {
      key: 'name', header: 'Name', sortable: true, sortValue: (u) => u.name || u.username || '',
      render: (u) => {
        const label = u.name || u.username || '?';
        return (
          <div className="flex items-center gap-3">
            <span className={`w-9 h-9 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${avatarStyle(label)}`}>
              {initialsOf(label)}
            </span>
            <span className="font-medium text-[#1b1e26] whitespace-nowrap">{u.name || '—'}</span>
            {isSelf(u) && (
              <span className="px-1.5 py-0.5 rounded-md bg-[#d0f24a] text-[#1b1e26] text-[9px] font-bold uppercase tracking-wide shrink-0">
                You
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'username', header: 'Username', sortable: true, sortValue: (u) => u.username || '',
      render: (u) => <span className="text-[13px] text-[#1b1e26]/60">{u.username || '—'}</span>,
    },
    {
      key: 'email', header: 'Email', sortable: true, sortValue: (u) => u.email || '',
      render: (u) => <span className="text-[#1b1e26]/45">{u.email || '—'}</span>,
    },
    {
      key: 'roles', header: 'Roles', sortable: true, sortValue: getUserRoleName,
      render: (u) => {
        const list = Array.isArray(u.roles) && u.roles.length > 0 ? u.roles : null;
        if (!list) return <span className="text-[11px] text-gray-300">—</span>;
        return (
          <div className="flex flex-wrap gap-1.5">
            {list.map((r) => {
              const name = r?.name || String(r);
              return (
                <span
                  key={r?.id || name}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#f7f8fa] text-[#1b1e26]/80 border border-[#1b1e26]/10"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d0f24a] ring-1 ring-[#1b1e26]/20 shrink-0" />
                  {name}
                </span>
              );
            })}
          </div>
        );
      },
    },
    {
      key: 'status', header: 'Status', sortable: true, sortValue: resolveUserStatus,
      render: (u) => <StatusPill status={resolveUserStatus(u)} />,
    },
    {
      key: 'createdAt', header: 'Created At', sortable: true,
      sortValue: (u) => (u.createdAt ? new Date(u.createdAt).getTime() : 0),
      render: (u) => (
        <span className="text-gray-400">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</span>
      ),
    },
    {
      key: 'actions', header: 'Actions', width: '132px',
      render: (u) => (
        <div className="flex justify-end">
          <RowActionMenu
            primary={{
              label: 'Edit',
              icon: DockIcons.edit,
              onClick: () => { setEditingUser(u); setIsUserModalOpen(true); },
            }}
            items={
              isSelf(u)
                ? [] // own account: only Edit — no self lock/disable/delete
                : [
                    u.accountNonLocked !== false
                      ? { label: 'Lock account', icon: DockIcons.lock, iconTone: 'text-amber-500', onClick: () => handleLock(u) }
                      : { label: 'Unlock account', icon: DockIcons.unlock, iconTone: 'text-amber-500', onClick: () => handleUnlock(u) },
                    u.enabled === false
                      ? { label: 'Enable user', icon: DockIcons.power, iconTone: 'text-emerald-500', onClick: () => handleToggleStatus(u) }
                      : { label: 'Disable user', icon: DockIcons.power, onClick: () => handleToggleStatus(u) },
                    'divider',
                    { label: 'Delete user', icon: DockIcons.trash, danger: true, onClick: () => handleDelete(u) },
                  ]
            }
          />
        </div>
      ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-[19px] font-medium text-[#1b1e26] tracking-tight">User Management</h1>
          <p className="text-[12px] text-gray-500 mt-1">Manage platform accounts and their assigned roles.</p>
        </div>
        <button
          onClick={() => { setEditingUser(null); setIsUserModalOpen(true); }}
          className="bg-[#1b1e26] text-white text-[13px] font-semibold px-5 py-2 rounded-xl hover:bg-black transition-colors inline-flex items-center gap-2 shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          New User
        </button>
      </div>

      {/* Filter toolbar — compact single-strip */}
      <div className="bg-white rounded-xl border border-[#1b1e26]/[0.06] shadow-sm px-3 py-2.5">
        <div className="flex flex-wrap items-end gap-2.5">
          {/* Text search — grows a little, never dominates the strip */}
          <div className="flex-1 min-w-[200px] max-w-[340px] flex flex-col gap-1">
            <label className={filterLabelClass}>Search</label>
            <div className="relative">
              <svg className="w-4 h-4 text-[#1b1e26]/35 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Name, username or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${filterFieldClass} pl-9`}
              />
            </div>
          </div>
          {/* Role */}
          <div className="w-[130px] flex flex-col gap-1">
            <label className={filterLabelClass}>Role</label>
            <div className="relative">
              <select className={filterSelectClass} value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                <option value="All">All</option>
                {roles.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
              </select>
              <SelectChevron />
            </div>
          </div>
          {/* Status */}
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
          {/* Lock state */}
          <div className="w-[118px] flex flex-col gap-1">
            <label className={filterLabelClass}>Lock</label>
            <div className="relative">
              <select className={filterSelectClass} value={filterLock} onChange={(e) => setFilterLock(e.target.value)}>
                <option value="All">All</option>
                <option value="Unlocked">Unlocked</option>
                <option value="Locked">Locked</option>
              </select>
              <SelectChevron />
            </div>
          </div>
          {/* Created date range — labeled From / To with leading calendar icons */}
          <div className="w-[160px] flex flex-col gap-1">
            <label className={filterLabelClass}>From</label>
            <div className="relative">
              <svg className="w-4 h-4 text-[#1b1e26]/35 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="17" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <input
                type="date"
                aria-label="Created from"
                className={`${filterFieldClass} pl-9`}
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
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
                type="date"
                aria-label="Created to"
                className={`${filterFieldClass} pl-9`}
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
              />
            </div>
          </div>
          {/* Actions — pinned to the right end of the strip */}
          <button
            onClick={fetchUsers}
            className="shrink-0 ml-auto h-[34px] px-5 rounded-full bg-[#d0f24a] text-[#1b1e26] text-[13px] font-semibold hover:bg-[#c4e83a] shadow-sm transition-colors active:scale-[0.98]"
          >
            Apply
          </button>
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

      {/* Data table */}
      <DataTable
        columns={columns}
        rows={filteredUsers}
        keyField="id"
        loading={loading}
        error={error}
        minWidth={1020}
        skeletonRows={10}
        pageSize={10}
        rowLabel="users"
        emptyTitle={users.length === 0 ? 'No users yet' : 'No matches'}
        emptyMessage={users.length === 0 ? 'Create your first user to get started.' : 'No users match the current filters.'}
      />

      {/* User form modal */}
      {isUserModalOpen && (
        <AddUserModal
          isOpen={isUserModalOpen}
          onClose={() => { setIsUserModalOpen(false); setEditingUser(null); }}
          onSubmit={handleSaveUser}
          editingUser={editingUser}
          fetchEntities={fetchEntities}
        />
      )}

      {/* Delete confirmation modal */}
      <ConfirmDeleteModal
        open={deleteTarget !== null}
        title="Delete user"
        message={`Are you sure you want to delete "${deleteTarget?.name || deleteTarget?.username || ''}"? This action cannot be undone.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};
