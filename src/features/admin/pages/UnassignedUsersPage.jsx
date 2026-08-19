import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { platformEntityService } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { DataTable } from '../../../components/shared/DataTable';
import { createPortal } from 'react-dom';

const filterFieldClass =
  'w-full text-[12.5px] px-3 py-1.5 rounded-lg border border-[#0A0A0A]/10 bg-[#f7f8fa] text-[#0A0A0A] focus:bg-white focus:ring-2 focus:ring-[#3D7FFF]/25 focus:border-[#3D7FFF] focus:outline-none transition-all';

const AVATAR_STYLES = [
  'bg-[#3D7FFF]/20 text-[#FFFFFF]', 'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700', 'bg-emerald-100 text-emerald-700',
  'bg-[#0A0A0A]/[0.06] text-[#0A0A0A]/70', 'bg-violet-100 text-violet-700',
  'bg-fuchsia-100 text-fuchsia-700', 'bg-teal-100 text-teal-700',
];
const initialsOf = (name) =>
  (name || '?').split(/[\s_.-]+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
const avatarStyle = (seed) => {
  let h = 0;
  const s = seed || '?';
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return AVATAR_STYLES[h % AVATAR_STYLES.length];
};

const roleNamesOf = (u) => {
  if (Array.isArray(u.roles)) return u.roles.map((r) => r?.name || r).filter(Boolean);
  if (typeof u.roles === 'string' && u.roles) return [u.roles];
  if (u.role) return [u.role?.name || u.role].filter(Boolean);
  if (u.roleName) return [u.roleName];
  return [];
};

export const UnassignedUsersPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [entities, setEntities] = useState([]);
  const [targetEntityId, setTargetEntityId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await platformEntityService.listUnassignedUsers();
      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadEntities = useCallback(async () => {
    try {
      const result = await platformEntityService.list({ page: 0, size: 500 });
      const list = Array.isArray(result?.content) ? result.content : Array.isArray(result) ? result : [];
      setEntities(list);
    } catch (err) {
      toast.error(err.message);
    }
  }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (!q) return true;
      return (u.name || '').toLowerCase().includes(q)
        || (u.username || '').toLowerCase().includes(q)
        || (u.email || '').toLowerCase().includes(q);
    });
  }, [users, search]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === visible.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visible.map((u) => u.id)));
    }
  };

  const openAssignModal = () => {
    setTargetEntityId('');
    loadEntities();
    setShowAssignModal(true);
  };

  const handleAssign = async () => {
    if (!targetEntityId || selectedIds.size === 0) return;
    setAssigning(true);
    try {
      await platformEntityService.assignUsers(targetEntityId, [...selectedIds]);
      toast.success(`${selectedIds.size} user${selectedIds.size === 1 ? '' : 's'} assigned successfully`);
      setShowAssignModal(false);
      setSelectedIds(new Set());
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAssigning(false);
    }
  };

  const columns = [
    {
      key: 'select', header: '',
      width: '48px',
      render: (u) => (
        <input
          type="checkbox"
          checked={selectedIds.has(u.id)}
          onChange={() => toggleSelect(u.id)}
          className="w-4 h-4 rounded border-gray-300 text-[#3D7FFF] focus:ring-[#3D7FFF] cursor-pointer accent-[#3D7FFF]"
        />
      ),
      headerRender: () => (
        <input
          type="checkbox"
          checked={visible.length > 0 && selectedIds.size === visible.length}
          onChange={toggleSelectAll}
          className="w-4 h-4 rounded border-gray-300 text-[#3D7FFF] focus:ring-[#3D7FFF] cursor-pointer accent-[#3D7FFF]"
        />
      ),
    },
    {
      key: 'name', header: 'Name', sortable: true, sortValue: (u) => u.name || u.username || '',
      render: (u) => {
        const label = u.name || u.username || '?';
        return (
          <div className="flex items-center gap-3 min-w-0">
            <span className={`w-9 h-9 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${avatarStyle(label)}`}>
              {initialsOf(label)}
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-[#0A0A0A]/90 truncate max-w-[220px]">{label}</p>
              <p className="text-[11px] text-gray-400 truncate">{u.username ? `@${u.username}` : '—'}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'email', header: 'Email', sortable: true, sortValue: (u) => u.email || '',
      render: (u) => <span className="text-[13px] text-[#0A0A0A]/70 truncate max-w-[240px] inline-block align-middle">{u.email || '—'}</span>,
    },
    {
      key: 'roles', header: 'Roles', sortable: true, sortValue: (u) => roleNamesOf(u).join(', '),
      render: (u) => {
        const roles = roleNamesOf(u);
        if (roles.length === 0) return <span className="text-[13px] text-[#0A0A0A]/30">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {roles.slice(0, 3).map((r) => (
              <span key={r} className="px-2 py-0.5 rounded-full bg-[#3D7FFF]/20 text-[#FFFFFF] text-[10px] font-semibold">{r}</span>
            ))}
            {roles.length > 3 && <span className="text-[10px] text-gray-400">+{roles.length - 3}</span>}
          </div>
        );
      },
    },
    {
      key: 'createdAt', header: 'Registered', sortable: true, sortValue: (u) => u.createdAt || '',
      render: (u) => {
        if (!u.createdAt) return <span className="text-[13px] text-[#0A0A0A]/30">—</span>;
        const d = new Date(u.createdAt);
        return <span className="text-[13px] text-[#0A0A0A]/70">{d.toLocaleDateString()}</span>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gray-400">User Management</span>
          <h1 className="text-[19px] font-medium tracking-tight mt-1 text-[#0A0A0A]">Unassigned Users</h1>
          <p className="text-[12px] text-gray-500 mt-0.5">
            {users.length > 0
              ? `${users.length} user${users.length === 1 ? '' : 's'} registered individually with no entity.`
              : 'Users who registered individually without an institution.'}
          </p>
        </div>
        <button
          onClick={openAssignModal}
          disabled={selectedIds.size === 0}
          className="shrink-0 px-4 py-2 rounded-xl bg-[#0A0A0A] text-white text-sm font-semibold hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Assign to Entity ({selectedIds.size})
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#0A0A0A]/[0.06] shadow-sm px-3 py-2.5 flex flex-wrap items-end gap-x-2.5 gap-y-2">
        <div className="w-[260px] flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-[#0A0A0A]/45 uppercase tracking-[0.12em]">Search</label>
          <div className="relative">
            <svg className="w-4 h-4 text-[#0A0A0A]/35 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setSearch('')}
          className="text-[#0A0A0A]/60 text-[12.5px] font-medium px-4 py-1.5 rounded-lg border border-[#0A0A0A]/10 hover:bg-[#f7f8fa] transition-colors"
        >
          Reset
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={visible}
        keyField="id"
        loading={loading}
        error={error}
        minWidth={720}
        skeletonRows={8}
        pageSize={12}
        rowLabel="users"
        emptyTitle={users.length === 0 ? 'No unassigned users' : 'No matches'}
        emptyMessage={
          users.length === 0
            ? 'All users are assigned to an entity.'
            : 'No users match the current search.'
        }
      />

      {showAssignModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !assigning && setShowAssignModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-[#0A0A0A]">Assign Users to Entity</h2>
              <button onClick={() => !assigning && setShowAssignModal(false)} className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#0A0A0A] flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
            <p className="text-[13px] text-gray-500 mb-4">
              Assigning <strong>{selectedIds.size}</strong> user{selectedIds.size === 1 ? '' : 's'} to an institution.
            </p>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold text-[#0A0A0A]/60 uppercase tracking-[0.1em]">Target Institution</label>
              <select
                value={targetEntityId}
                onChange={(e) => setTargetEntityId(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 bg-white text-[#0A0A0A] focus:ring-2 focus:ring-[#3D7FFF]/25 focus:border-[#3D7FFF] outline-none transition-all"
                required
              >
                <option value="">Select an entity…</option>
                {entities.map((e) => (
                  <option key={e.id} value={e.id} className="text-[#0A0A0A]">{e.name} ({e.code})</option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-end gap-3 pt-5">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                disabled={assigning}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssign}
                disabled={!targetEntityId || assigning}
                className="px-5 py-2 rounded-xl bg-[#0A0A0A] text-white text-sm font-semibold hover:bg-black transition-colors disabled:opacity-50"
              >
                {assigning ? 'Assigning…' : 'Assign'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default UnassignedUsersPage;
