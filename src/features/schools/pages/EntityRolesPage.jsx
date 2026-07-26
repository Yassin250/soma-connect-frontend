import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { entityRoleService } from '../../../services/api';
import { ConfirmDeleteModal } from '../../admin/components/CurriculumModals';
import { DataTable } from '../../../components/shared/DataTable';
import { RowActionMenu, DockIcons } from '../../../components/shared/RowActions';

const prettyPerm = (name) => name.replace(/_/g, ' ');

export const EntityRolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [permModalRole, setPermModalRole] = useState(null);
  const [selectedPermIds, setSelectedPermIds] = useState(new Set());
  const [permSaving, setPermSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const roleList = await entityRoleService.list();
      setRoles(Array.isArray(roleList) ? roleList : []);
    } catch (err) {
      setError(err.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAssignablePermissions = useCallback(async () => {
    try {
      const perms = await entityRoleService.assignablePermissions();
      setCatalog(Array.isArray(perms) ? perms : []);
    } catch {
      setCatalog([]);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
    fetchAssignablePermissions();
  }, [fetchRoles, fetchAssignablePermissions]);

  const flash = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3000);
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      await entityRoleService.remove(deleteTarget.id);
      await fetchRoles();
      flash('Role deleted.');
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message || 'Delete failed');
      setTimeout(() => setError(''), 4000);
    }
  };

  const openPermModal = async (role) => {
    setPermModalRole(role);
    const selected = new Set((role.permissions || []).map((permission) => permission.id));
    setSelectedPermIds(selected);
    if (catalog.length === 0) {
      await fetchAssignablePermissions();
    }
  };

  const togglePerm = (permId) =>
    setSelectedPermIds((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });

  const savePermissions = async () => {
    if (!permModalRole) return;
    setPermSaving(true);
    try {
      await entityRoleService.update(permModalRole.id, {
        name: permModalRole.name,
        description: permModalRole.description || '',
        permissionIds: Array.from(selectedPermIds),
      });
      await fetchRoles();
      flash('Permissions updated.');
      setPermModalRole(null);
    } catch (err) {
      setError(err.message || 'Failed to save permissions');
    } finally {
      setPermSaving(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      sortValue: (role) => role.name || '',
      render: (role) => <span className="font-medium text-[#1b1e26]">{role.name}</span>,
    },
    {
      key: 'description',
      header: 'Description',
      sortable: true,
      sortValue: (role) => role.description || '',
      render: (role) => <span className="text-[#1b1e26]/55">{role.description || '—'}</span>,
    },
    {
      key: 'permissions',
      header: 'Permissions',
      render: (role) => {
        const isPlatform = !role.ownerEntityId;
        return (
          <button
            onClick={() => !isPlatform && openPermModal(role)}
            disabled={isPlatform}
            title={isPlatform ? 'Predefined permissions' : 'Manage permissions'}
            className={`inline-flex items-center justify-center min-w-[1.75rem] h-7 px-2 rounded-full text-[11px] font-bold shadow-sm transition-all ${
              isPlatform
                ? 'bg-gray-200 text-gray-500 cursor-default'
                : 'bg-accent text-[#1b1e26] hover:bg-accent-hover cursor-pointer'
            }`}
          >
            {role.permissions?.length ?? 0}
          </button>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Created At',
      sortable: true,
      sortValue: (role) => (role.createdAt ? new Date(role.createdAt).getTime() : 0),
      render: (role) => (
        <span className="text-gray-400">{role.createdAt ? new Date(role.createdAt).toLocaleDateString() : '—'}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '132px',
      render: (role) => (
        <div className="flex justify-end">
          {role.ownerEntityId ? (
            <RowActionMenu
              items={[
                {
                  label: 'Permissions',
                  icon: DockIcons.shield,
                  iconTone: 'text-[#1b1e26]/60',
                  onClick: () => openPermModal(role),
                },
                'divider',
                {
                  label: 'Delete role',
                  icon: DockIcons.trash,
                  danger: true,
                  onClick: () => setDeleteTarget(role),
                },
              ]}
            />
          ) : (
            <span className="text-[11px] text-gray-400 italic">Predefined</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gray-400">Access Control</span>
          <h1 className="text-[19px] font-medium tracking-tight mt-1.5 text-[#1b1e26]">Roles &amp; Permissions</h1>
          <p className="text-[12px] text-slate-500 mt-1">Define roles for your institution and choose which permissions they grant.</p>
        </div>
      </div>

      {notice && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">{notice}</div>}
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>}

      <DataTable
        columns={columns}
        rows={roles}
        keyField="id"
        loading={loading}
        error={error}
        minWidth={900}
        skeletonRows={8}
        pageSize={10}
        rowLabel="roles"
        emptyTitle="No roles yet"
        emptyMessage="Create your first role to get started."
      />


      {permModalRole && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1b1e26]/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPermModalRole(null)}
          role="presentation"
        >
          <div
            className="relative w-full max-w-[960px] max-h-[92vh] overflow-y-auto bg-white rounded-3xl border border-[#1b1e26]/[0.06] shadow-[0_20px_60px_rgba(27,30,38,0.25)] p-6 sm:p-8 animate-in zoom-in-95 fade-in duration-200"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              onClick={() => setPermModalRole(null)}
              aria-label="Close"
              className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center text-[#1b1e26]/40 hover:text-[#1b1e26] hover:bg-[#f3f4f6] transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" /></svg>
            </button>

            <div className="mb-6 pr-8">
              <span className="w-11 h-11 rounded-2xl bg-accent/25 text-[#1b1e26] flex items-center justify-center mb-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15.5 7.5 21 2M18 5l-3 3M11 11a4 4 0 1 1-5.66 5.66A4 4 0 0 1 11 11z" />
                </svg>
              </span>
              <h3 className="text-xl font-semibold text-[#1b1e26] tracking-tight">Manage permissions</h3>
              <p className="text-sm text-gray-500 mt-1">
                Choose what people with the <span className="font-semibold text-[#1b1e26]">{permModalRole.name}</span> role can do.
              </p>
            </div>

            <div className="max-h-[420px] overflow-y-auto space-y-2 mb-6 -mx-2 px-2">
              {catalog.length === 0 ? (
                <p className="text-[11px] text-slate-400 px-3 py-2">No assignable permissions available.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
                  {catalog.map((permission) => (
                    <label
                      key={permission.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:bg-[#f7f8fa] hover:border-[#1b1e26]/[0.05] cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermIds.has(permission.id)}
                        onChange={() => togglePerm(permission.id)}
                        className="peer sr-only"
                      />
                      <span className="w-5 h-5 rounded-md border-2 border-[#1b1e26]/15 bg-white text-transparent peer-checked:bg-accent peer-checked:border-accent peer-checked:text-[#1b1e26] peer-focus-visible:ring-4 peer-focus-visible:ring-accent/30 flex items-center justify-center shrink-0 transition-all duration-150">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[13px] font-medium text-[#1b1e26] block">{prettyPerm(permission.name)}</span>
                        {permission.description && (
                          <span className="text-xs text-gray-400 block truncate">{permission.description}</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-1 flex items-center justify-end gap-2.5">
              <p className="mr-auto text-xs text-gray-400">{selectedPermIds.size} selected</p>
              <button
                type="button"
                onClick={() => setPermModalRole(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#1b1e26]/70 border border-[#1b1e26]/10 hover:bg-[#f3f4f6] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={savePermissions}
                disabled={permSaving}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-accent text-[#1b1e26] hover:bg-accent-hover transition-colors active:scale-[0.98] shadow-sm disabled:opacity-60"
              >
                {permSaving ? 'Saving…' : 'Save permissions'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <ConfirmDeleteModal
        open={deleteTarget !== null}
        title="Delete role"
        message={`Are you sure you want to delete the role "${deleteTarget?.name || ''}"? This action cannot be undone.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={remove}
      />
    </div>
  );
};

export default EntityRolesPage;
