import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { entityUserService, entityRoleService } from '../../../services/api';
import { AddUserModal } from '../../admin/components/AddUserModal';
import { ConfirmDeleteModal } from '../../admin/components/CurriculumModals';
import { DataTable } from '../../../components/shared/DataTable';
import { RowActionMenu, DockIcons } from '../../../components/shared/RowActions';
import { useAuth } from '../../../context/AuthContext';
const AVATAR_STYLES = [
  'bg-[#d0f24a]/20 text-[#5b6b12]',
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-[#1b1e26]/[0.06] text-[#1b1e26]/70',
  'bg-violet-100 text-violet-700',
  'bg-fuchsia-100 text-fuchsia-700',
  'bg-teal-100 text-teal-700',
];

const initialsOf = (name) =>
  (name || '?')
    .split(/[\s_.-]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const avatarStyle = (seed) => {
  let hash = 0;
  const source = seed || '?';
  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) >>> 0;
  }
  return AVATAR_STYLES[hash % AVATAR_STYLES.length];
};

const STATUS_STYLES = {
  Active: { pill: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  Inactive: { pill: 'bg-[#1b1e26]/[0.05] text-[#1b1e26]/45', dot: 'bg-[#1b1e26]/30' },
  Locked: { pill: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
};

const resolveUserStatus = (user) => {
  if (user.accountNonLocked === false) return 'Locked';
  return user.active === false ? 'Inactive' : 'Active';
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

const normalizeUserRoles = (user, rolesByName) => {
  const values = [];
  if (Array.isArray(user?.roles)) values.push(...user.roles);
  if (user?.role) values.push(user.role);
  if (user?.roleName) values.push(user.roleName);

  const normalized = values.map((value) => {
    if (!value) return null;
    if (typeof value === 'object') {
      if (value.id != null || value.name) return value;
      return null;
    }
    if (typeof value === 'string') {
      const fromCatalog = rolesByName.get(value.toLowerCase());
      return fromCatalog || { id: value, name: value };
    }
    return { id: String(value), name: String(value) };
  });

  const uniqueByKey = new Map();
  normalized.filter(Boolean).forEach((role) => {
    const key = role.id != null ? String(role.id) : String(role.name || '').toLowerCase();
    if (key) uniqueByKey.set(key, role);
  });
  return [...uniqueByKey.values()];
};

const prettyPermission = (permissionName) => permissionName.replace(/_/g, ' ');

export const EntityUsersPage = () => {
  const { user: currentUser } = useAuth();

  // Own account is protected — no lock/deactivate/delete on yourself (the
  // backend rejects it too; hiding the options keeps the UI honest).
  const isSelf = (u) =>
    !!currentUser &&
    (u.id === currentUser.id ||
      (!!currentUser.username && u.username === currentUser.username));

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const rolesById = useMemo(
    () => new Map(roles.map((role) => [String(role.id), role])),
    [roles]
  );
  const rolesByName = useMemo(
    () => new Map(roles.map((role) => [String(role.name || '').toLowerCase(), role])),
    [roles]
  );

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const userList = await entityUserService.list();
      setUsers(Array.isArray(userList) ? userList : []);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const roleList = await entityRoleService.list();
      setRoles(Array.isArray(roleList) ? roleList : []);
    } catch {
      // roles are optional for table rendering fallback
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  const flash = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3000);
  };

  const getUserRoleName = useCallback((user) => {
    const userRoles = normalizeUserRoles(user, rolesByName);
    return userRoles.length > 0
      ? userRoles.map((role) => role.name || String(role.id)).join(', ')
      : 'None';
  }, [rolesByName]);

  const permissionNamesForUser = (user) => {
    const roleItems = normalizeUserRoles(user, rolesByName);
    const permissions = new Set();
    roleItems.forEach((role) => {
      if (Array.isArray(role.permissions)) {
        role.permissions.forEach((permission) => {
          const permissionName = permission?.name || permission;
          if (permissionName) permissions.add(String(permissionName));
        });
      }
      const catalogRole = role.id != null
        ? rolesById.get(String(role.id))
        : rolesByName.get(String(role.name || '').toLowerCase());
      if (catalogRole?.permissions) {
        catalogRole.permissions.forEach((permission) => {
          const permissionName = permission?.name || permission;
          if (permissionName) permissions.add(String(permissionName));
        });
      }
    });
    return [...permissions];
  };

  const handleSaveUser = async (userData) => {
    const roleIds = Array.isArray(userData.roleIds)
      ? userData.roleIds.filter(Boolean)
      : [];
    try {
      if (editingUser) {
        await entityUserService.update(editingUser.id, {
          name: userData.name,
          username: userData.username,
          roleIds,
        });
        flash('User updated.');
      } else {
        await entityUserService.create({
          name: userData.name,
          email: userData.email,
          username: userData.username || undefined,
          roleIds,
        });
        flash('User created. A temporary password was set — they must change it on first login.');
      }
      await fetchUsers();
      setIsUserModalOpen(false);
      setEditingUser(null);
    } catch (err) {
      setError(err.message || 'Save failed');
    }
  };

  const runAction = async (fn, confirmMsg) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    try {
      await fn();
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Action failed');
      setTimeout(() => setError(''), 4000);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      sortValue: (user) => user.name || user.username || '',
      render: (user) => {
        const label = user.name || user.username || '?';
        return (
          <div className="flex items-center gap-3">
            <span className={`w-9 h-9 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${avatarStyle(label)}`}>
              {initialsOf(label)}
            </span>
            <div>
              <span className="font-medium text-[#1b1e26] whitespace-nowrap inline-flex items-center gap-1.5">
                {user.name || '—'}
                {isSelf(user) && (
                  <span className="px-1.5 py-0.5 rounded-md bg-[#d0f24a] text-[#1b1e26] text-[9px] font-bold uppercase tracking-wide shrink-0">
                    You
                  </span>
                )}
              </span>
              <p className="text-[11px] text-slate-400">@{user.username || '—'}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      sortValue: (user) => user.email || '',
      render: (user) => <span className="text-[#1b1e26]/45">{user.email || '—'}</span>,
    },
    {
      key: 'roles',
      header: 'Roles',
      sortable: true,
      sortValue: getUserRoleName,
      render: (user) => {
        const userRoles = normalizeUserRoles(user, rolesByName);
        if (userRoles.length === 0) return <span className="text-[11px] text-gray-300">—</span>;
        return (
          <div className="flex flex-wrap gap-1.5">
            {userRoles.map((role) => (
              <span
                key={role.id || role.name}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#f7f8fa] text-[#1b1e26]/80 border border-[#1b1e26]/10"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#d0f24a] ring-1 ring-[#1b1e26]/20 shrink-0" />
                {role.name}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'permissions',
      header: 'Permissions',
      render: (user) => {
        const userPermissions = permissionNamesForUser(user);
        if (userPermissions.length === 0) return <span className="text-[11px] text-gray-300">—</span>;
        return (
          <div className="flex flex-wrap gap-1.5">
            {userPermissions.map((permissionName) => (
              <span
                key={permissionName}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200"
              >
                {prettyPermission(permissionName)}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortValue: resolveUserStatus,
      render: (user) => <StatusPill status={resolveUserStatus(user)} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '132px',
      render: (user) => (
        <div className="flex justify-end">
          <RowActionMenu
            primary={{
              label: 'Edit',
              icon: DockIcons.edit,
              onClick: () => {
                setEditingUser(user);
                setIsUserModalOpen(true);
              },
            }}
            items={
              isSelf(user)
                ? [] // own account: only Edit — no self lock/deactivate/delete
                : [
                    user.accountNonLocked === false
                      ? {
                          label: 'Unlock account',
                          icon: DockIcons.unlock,
                          iconTone: 'text-amber-500',
                          onClick: () => runAction(() => entityUserService.unlock(user.id)),
                        }
                      : {
                          label: 'Lock account',
                          icon: DockIcons.lock,
                          iconTone: 'text-amber-500',
                          onClick: () => runAction(() => entityUserService.lock(user.id), `Lock ${user.name}?`),
                        },
                    user.active === false
                      ? {
                          label: 'Activate user',
                          icon: DockIcons.power,
                          iconTone: 'text-emerald-500',
                          onClick: () => runAction(() => entityUserService.setStatus(user.id, true)),
                        }
                      : {
                          label: 'Deactivate user',
                          icon: DockIcons.power,
                          onClick: () => runAction(() => entityUserService.setStatus(user.id, false), `Deactivate ${user.name}?`),
                        },
                    'divider',
                    {
                      label: 'Delete user',
                      icon: DockIcons.trash,
                      danger: true,
                      onClick: () => setDeleteTarget(user),
                    },
                  ]
            }
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gray-400">Staff &amp; Student Records</span>
          <h1 className="text-[19px] font-medium tracking-tight mt-1 text-[#1b1e26]">Users</h1>
          <p className="text-[12px] text-slate-500 mt-1">Create and manage users within your institution, and assign them roles.</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setIsUserModalOpen(true);
          }}
          className="bg-[#1b1e26] text-white text-[13px] font-semibold px-5 py-2 rounded-xl hover:bg-black transition-colors inline-flex items-center gap-2 shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          New User
        </button>
      </div>

      {notice && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">{notice}</div>}
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>}

      <DataTable
        columns={columns}
        rows={users}
        keyField="id"
        loading={loading}
        error={error}
        minWidth={1000}
        skeletonRows={10}
        pageSize={10}
        rowLabel="users"
        filters={[
          { key: 'role', label: 'Role', getValue: (u) => u.roles?.[0]?.name || 'Unassigned' },
          { key: 'active', label: 'Status', getValue: (u) => (u.active ? 'Active' : 'Inactive') },
        ]}
        emptyTitle="No users yet"
        emptyMessage="Create your first user to get started."
      />

      {isUserModalOpen && (
        <AddUserModal
          isOpen={isUserModalOpen}
          onClose={() => {
            setIsUserModalOpen(false);
            setEditingUser(null);
          }}
          onSubmit={handleSaveUser}
          editingUser={editingUser}
          fetchRoles={entityRoleService.list}
        />
      )}

      {/* Delete confirmation modal */}
      <ConfirmDeleteModal
        open={deleteTarget !== null}
        title="Delete user"
        message={`Are you sure you want to delete "${deleteTarget?.name || deleteTarget?.username || ''}"? This action cannot be undone.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await entityUserService.remove(deleteTarget.id);
            await fetchUsers();
          } catch (err) {
            setError(err.message || 'Delete failed');
            setTimeout(() => setError(''), 4000);
          } finally {
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
};

export default EntityUsersPage;
