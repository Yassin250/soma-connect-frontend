import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { platformEntityService } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { DataTable } from '../../../components/shared/DataTable';

const filterFieldClass =
  'w-full text-[12.5px] px-3 py-1.5 rounded-lg border border-[#1b1e26]/10 bg-[#f7f8fa] text-[#1b1e26] focus:bg-white focus:ring-2 focus:ring-[#d0f24a]/25 focus:border-[#d0f24a] focus:outline-none transition-all';

// Deterministic avatar tint from the name — same palette used across user tables.
const AVATAR_STYLES = [
  'bg-[#d0f24a]/20 text-[#5b6b12]', 'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700', 'bg-emerald-100 text-emerald-700',
  'bg-[#1b1e26]/[0.06] text-[#1b1e26]/70', 'bg-violet-100 text-violet-700',
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

const STATUS_STYLES = {
  Active: { pill: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  Inactive: { pill: 'bg-[#1b1e26]/[0.05] text-[#1b1e26]/45', dot: 'bg-[#1b1e26]/30' },
  Locked: { pill: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
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

const resolveStatus = (u) => {
  if (u.accountNonLocked === false) return 'Locked';
  if (u.active === false || u.enabled === false) return 'Inactive';
  return 'Active';
};
const roleNamesOf = (u) => {
  if (Array.isArray(u.roles)) return u.roles.map((r) => r?.name || r).filter(Boolean);
  if (typeof u.roles === 'string' && u.roles) return [u.roles];
  if (u.role) return [u.role?.name || u.role].filter(Boolean);
  if (u.roleName) return [u.roleName];
  return [];
};

/**
 * Read-only oversight of a single institution's users — reached by clicking an
 * entity's user count on the Entities page. Mirrors the Courses → Modules drill.
 */
export const AdminEntityUsersPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [entity, setEntity] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Entity summary (name/code for the header) + its users, in parallel.
      const [ent, list] = await Promise.all([
        platformEntityService.getOne(id),
        platformEntityService.getUsers(id),
      ]);
      setEntity(ent);
      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const allUsers = users;

  const roleOptions = useMemo(() => {
    const set = new Set();
    allUsers.forEach((u) => roleNamesOf(u).forEach((r) => set.add(r)));
    return [...set].sort((a, b) => a.localeCompare(b)).map((r) => ({ value: r, label: r }));
  }, [allUsers]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allUsers.filter((u) => {
      if (statusFilter !== 'ALL' && resolveStatus(u) !== statusFilter) return false;
      if (roleFilter !== 'ALL' && !roleNamesOf(u).includes(roleFilter)) return false;
      if (!q) return true;
      return (u.name || '').toLowerCase().includes(q)
        || (u.username || '').toLowerCase().includes(q)
        || (u.email || '').toLowerCase().includes(q);
    });
  }, [allUsers, search, roleFilter, statusFilter]);

  const columns = [
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
              <p className="text-[13px] font-medium text-[#1b1e26]/90 truncate max-w-[220px]">{label}</p>
              <p className="text-[11px] text-gray-400 truncate">{u.username ? `@${u.username}` : '—'}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'email', header: 'Email', sortable: true, sortValue: (u) => u.email || '',
      render: (u) => <span className="text-[13px] text-[#1b1e26]/70 truncate max-w-[240px] inline-block align-middle">{u.email || '—'}</span>,
    },
    {
      key: 'roles', header: 'Roles', sortable: true, sortValue: (u) => roleNamesOf(u).join(', '),
      render: (u) => {
        const roles = roleNamesOf(u);
        if (roles.length === 0) return <span className="text-[13px] text-[#1b1e26]/30">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {roles.slice(0, 3).map((r) => (
              <span key={r} className="px-2 py-0.5 rounded-full bg-[#d0f24a]/20 text-[#5b6b12] text-[10px] font-semibold">{r}</span>
            ))}
            {roles.length > 3 && <span className="text-[10px] text-gray-400">+{roles.length - 3}</span>}
          </div>
        );
      },
    },
    {
      key: 'status', header: 'Status', sortable: true, sortValue: (u) => resolveStatus(u),
      render: (u) => <StatusPill status={resolveStatus(u)} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb + header */}
      <div>
        <button
          onClick={() => navigate('/admin/entities')}
          className="flex w-fit items-center gap-1.5 text-[12px] font-medium text-[#1b1e26]/50 hover:text-[#1b1e26] transition-colors mb-3"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Back to Entities
        </button>
        <span className="block text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gray-400">
          Institution{entity?.code ? ` · ${entity.code}` : ''}
        </span>
        <h1 className="text-[19px] font-medium tracking-tight mt-1 text-[#1b1e26]">
          {entity ? `${entity.name} — Users` : 'Users'}
        </h1>
        <p className="text-[12px] text-gray-500 mt-0.5">
          {entity
            ? `${allUsers.length} user${allUsers.length === 1 ? '' : 's'} in this institution.`
            : 'The people who belong to this institution.'}
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-[#1b1e26]/[0.06] shadow-sm px-3 py-2.5 flex flex-wrap items-end gap-x-2.5 gap-y-2">
        <div className="w-[260px] flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-[#1b1e26]/45 uppercase tracking-[0.12em]">Search</label>
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

        <div className="w-[170px] flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-[#1b1e26]/45 uppercase tracking-[0.12em]">Role</label>
          <select className={`${filterFieldClass} cursor-pointer`} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="ALL">All roles</option>
            {roleOptions.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>

        <div className="w-[140px] flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-[#1b1e26]/45 uppercase tracking-[0.12em]">Status</label>
          <select className={`${filterFieldClass} cursor-pointer`} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Locked">Locked</option>
          </select>
        </div>

        <div className="flex-1" />
        <button
          type="button"
          onClick={() => { setSearch(''); setRoleFilter('ALL'); setStatusFilter('ALL'); }}
          className="text-[#1b1e26]/60 text-[12.5px] font-medium px-4 py-1.5 rounded-lg border border-[#1b1e26]/10 hover:bg-[#f7f8fa] transition-colors"
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
        emptyTitle={allUsers.length === 0 ? 'No users yet' : 'No matches'}
        emptyMessage={
          allUsers.length === 0
            ? 'This institution has no users yet.'
            : 'No users match the current filters.'
        }
      />
    </div>
  );
};

export default AdminEntityUsersPage;
