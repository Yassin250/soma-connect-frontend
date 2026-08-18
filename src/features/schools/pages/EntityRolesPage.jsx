import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AddRoleModal } from '../../admin/components/AddRoleModal';
import { ConfirmDeleteModal } from '../../admin/components/CurriculumModals';
import { RowActionMenu, DockIcons } from '../../../components/shared/RowActions';
import { useToast } from '../../../context/ToastContext';
import { entityRoleService } from '../../../services/api';

const resolveRoleStatus = (role) => (role.active === false ? 'Inactive' : 'Active');

export const EntityRolesPage = () => {
  const toast = useToast();

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null);

  const [filterRoleStatus, setFilterRoleStatus] = useState('All');
  const [filterRoleDateFrom, setFilterRoleDateFrom] = useState('');
  const [filterRoleDateTo, setFilterRoleDateTo] = useState('');
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Permissions modal
  const [permModalRole, setPermModalRole] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedPermIds, setSelectedPermIds] = useState(new Set());
  const [permSaving, setPermSaving] = useState(false);
  const [permSearch, setPermSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      if (filterRoleStatus !== 'All' && resolveRoleStatus(r) !== filterRoleStatus) return false;
      if (filterRoleDateFrom || filterRoleDateTo) {
        const created = r.createdAt ? r.createdAt.slice(0, 10) : '';
        if (!created) return false;
        if (filterRoleDateFrom && created < filterRoleDateFrom) return false;
        if (filterRoleDateTo && created > filterRoleDateTo) return false;
      }
      return true;
    });
  }, [roles, filterRoleStatus, filterRoleDateFrom, filterRoleDateTo]);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await entityRoleService.list();
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  useEffect(() => {
    if (!permModalRole) return;
    const onKey = (e) => { if (e.key === 'Escape') setPermModalRole(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [permModalRole]);

  // ── CRUD ────────────────────────────────────────────────────────────────────
  const handleAddOrUpdateRole = async (roleData) => {
    try {
      if (editingEntity) {
        await entityRoleService.update(editingEntity.id, {
          name: roleData.name,
          description: roleData.description,
        });
        toast.success('Role updated');
      } else {
        await entityRoleService.create({
          name: roleData.name,
          description: roleData.description,
        });
        toast.success('Role created');
      }
      await fetchRoles();
      setIsRoleModalOpen(false);
      setEditingEntity(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleToggleStatus = async (role) => {
    try {
      await entityRoleService.setRoleStatus(role.id, role.active === false);
      await fetchRoles();
      toast.success('Role status updated');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    setIsDeleting(true);
    try {
      await entityRoleService.remove(confirmDelete.id);
      await fetchRoles();
      toast.success('Role deleted');
      setConfirmDelete(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Permissions modal ────────────────────────────────────────────────────────
  const openPermModal = async (role) => {
    setPermModalRole(role);
    setPermSearch('');
    const platform = isPlatformRole(role);
    try {
      if (platform) {
        setAllPermissions(role.permissions || []);
        setSelectedPermIds(new Set((role.permissions || []).map((p) => p.id)));
      } else {
        const perms = await entityRoleService.assignablePermissions();
        setAllPermissions(Array.isArray(perms) ? perms : []);
        setSelectedPermIds(new Set((role.permissions || []).map((p) => p.id)));
      }
    } catch (err) {
      toast.error(err.message);
      setPermModalRole(null);
    }
  };

  const togglePerm = (permId) =>
    setSelectedPermIds((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });

  const toggleCategory = (perms, selectAll) =>
    setSelectedPermIds((prev) => {
      const next = new Set(prev);
      perms.forEach((p) => (selectAll ? next.add(p.id) : next.delete(p.id)));
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
      toast.success('Permissions updated');
      setPermModalRole(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPermSaving(false);
    }
  };

  const statusStyle = (status) =>
    status === 'Active'
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      : 'bg-gray-100 text-gray-500 border border-gray-200';

  const isPlatformRole = (role) => !role.ownerEntityId;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[19px] font-medium text-[#1b1e26] tracking-tight">Roles &amp; Access</h1>
          <p className="text-[12px] text-gray-500 mt-1">Define roles and the permissions that govern entity access.</p>
        </div>
      </div>

      {/* Filters — content-width card, platform field recipe, divider before actions */}
      <div className="bg-white rounded-2xl border border-[#1b1e26]/[0.06] shadow-sm p-4 w-fit max-w-full">
        <div className="flex flex-wrap items-end gap-3.5">
          <div className="w-[160px] flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-[#1b1e26]/45 uppercase tracking-[0.12em]">Status</label>
            <select
              className="w-full text-[13px] px-3.5 py-2.5 rounded-xl border border-[#1b1e26]/10 bg-[#f7f8fa] text-[#1b1e26] hover:border-[#1b1e26]/20 focus:bg-white focus:ring-4 focus:ring-[#10B981]/20 focus:border-[#10B981] focus:outline-none transition-all cursor-pointer"
              value={filterRoleStatus}
              onChange={(e) => setFilterRoleStatus(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="w-[180px] flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-[#1b1e26]/45 uppercase tracking-[0.12em]">From</label>
            <div className="relative">
              <svg className="w-4 h-4 text-[#1b1e26]/35 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="17" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <input
                type="date"
                aria-label="Created from"
                className="w-full text-[13px] pl-9 pr-3 py-2.5 rounded-xl border border-[#1b1e26]/10 bg-[#f7f8fa] text-[#1b1e26] hover:border-[#1b1e26]/20 focus:bg-white focus:ring-4 focus:ring-[#10B981]/20 focus:border-[#10B981] focus:outline-none transition-all"
                value={filterRoleDateFrom}
                onChange={(e) => setFilterRoleDateFrom(e.target.value)}
              />
            </div>
          </div>
          <div className="w-[180px] flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-[#1b1e26]/45 uppercase tracking-[0.12em]">To</label>
            <div className="relative">
              <svg className="w-4 h-4 text-[#1b1e26]/35 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="17" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <input
                type="date"
                aria-label="Created to"
                className="w-full text-[13px] pl-9 pr-3 py-2.5 rounded-xl border border-[#1b1e26]/10 bg-[#f7f8fa] text-[#1b1e26] hover:border-[#1b1e26]/20 focus:bg-white focus:ring-4 focus:ring-[#10B981]/20 focus:border-[#10B981] focus:outline-none transition-all"
                value={filterRoleDateTo}
                onChange={(e) => setFilterRoleDateTo(e.target.value)}
              />
            </div>
          </div>

          <span className="hidden sm:block w-px h-10 bg-[#1b1e26]/[0.07] mx-0.5" />

          <button
            onClick={fetchRoles}
            className="shrink-0 h-10 px-5 rounded-full bg-[#10B981] text-white text-[13px] font-semibold hover:bg-[#34D399] shadow-sm transition-colors active:scale-[0.98]"
          >
            Apply
          </button>
          <button
            onClick={() => { setFilterRoleStatus('All'); setFilterRoleDateFrom(''); setFilterRoleDateTo(''); }}
            className="shrink-0 h-10 px-4 rounded-full border border-red-200 text-red-500 text-[13px] font-semibold hover:bg-red-50 hover:border-red-300 inline-flex items-center gap-1.5 transition-colors active:scale-[0.98]"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            Clear All
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#1b1e26]/[0.06] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f4f6f8] border-b border-[#1b1e26]/[0.06] text-[10px] font-bold text-[#1b1e26]/45 uppercase tracking-[0.14em]">
                <th className="px-4 py-2.5 pl-6 text-left">Actions</th>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Description</th>
                <th className="px-4 py-2.5">Permissions</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 pr-6">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-[13px] text-[#1b1e26]/80">
              {filteredRoles.map((role) => {
                const status = resolveRoleStatus(role);
                const platform = isPlatformRole(role);
                return (
                  <tr key={role.id} className="hover:bg-[#10B981]/[0.08] transition-colors">
                    <td className="px-4 py-2.5 pl-6">
                      <div className="flex justify-start">
                        {platform ? (
                          <RowActionMenu
                            primary={{
                              label: 'View permissions',
                              icon: DockIcons.shield,
                              onClick: () => openPermModal(role),
                            }}
                            items={[]}
                          />
                        ) : (
                          <RowActionMenu
                            primary={{
                              label: 'Edit',
                              icon: DockIcons.edit,
                              onClick: () => { setEditingEntity(role); setIsRoleModalOpen(true); },
                            }}
                            items={[
                              { label: 'Permissions', icon: DockIcons.shield, iconTone: 'text-[#1b1e26]/60', onClick: () => openPermModal(role) },
                              role.active === false
                                ? { label: 'Activate role', icon: DockIcons.power, iconTone: 'text-emerald-500', onClick: () => handleToggleStatus(role) }
                                : { label: 'Deactivate role', icon: DockIcons.power, onClick: () => handleToggleStatus(role) },
                              'divider',
                              { label: 'Delete role', icon: DockIcons.trash, danger: true, onClick: () => setConfirmDelete(role) },
                            ]}
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-[#1b1e26]">{role.name}</td>
                    <td className="px-4 py-2.5 text-gray-500 max-w-xs truncate">{role.description || '—'}</td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => openPermModal(role)}
                        title={platform ? 'View permissions' : 'Manage permissions'}
                        className={`inline-flex items-center justify-center min-w-[1.75rem] h-7 px-2 rounded-full text-[11px] font-bold shadow-sm transition-all ${
                          platform
                            ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20 hover:bg-[#10B981]/25 cursor-pointer'
                            : 'bg-[#10B981] text-white hover:bg-[#34D399] cursor-pointer'
                        }`}
                      >
                        {role.permissions?.length ?? 0}
                      </button>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusStyle(status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 pr-6 text-gray-400">
                      {role.createdAt ? new Date(role.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {loading && <div className="p-8 text-center text-sm text-gray-400">Loading roles…</div>}
          {!loading && filteredRoles.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-400">
              {roles.length === 0 ? 'No roles yet.' : 'No roles match the current filters.'}
            </div>
          )}
        </div>
      </div>

      {/* Role form modal */}
      {isRoleModalOpen && (
        <AddRoleModal
          isOpen={isRoleModalOpen}
          onClose={() => { setIsRoleModalOpen(false); setEditingEntity(null); }}
          onSubmit={handleAddOrUpdateRole}
          editingRole={editingEntity}
        />
      )}

      {/* Permission assignment modal */}
      {permModalRole && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E1412]/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPermModalRole(null)}
          role="presentation"
        >
          <div
            className="relative w-full max-w-[880px] h-[min(86vh,680px)] flex flex-col bg-white rounded-3xl border border-[#1b1e26]/[0.06] shadow-[0_20px_60px_rgba(27,30,38,0.25)] overflow-hidden animate-in zoom-in-95 fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {(() => {
              const platform = isPlatformRole(permModalRole);
              return (<>
              {/* ── Header (fixed) ── */}
              <div className="shrink-0 px-6 sm:px-8 pt-7 pb-5 border-b border-gray-100">
                <button
                  type="button"
                  onClick={() => setPermModalRole(null)}
                  aria-label="Close"
                  className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center text-[#1b1e26]/40 hover:text-[#1b1e26] hover:bg-[#f3f4f6] transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" /></svg>
                </button>

                <div className="flex items-center gap-3.5 pr-10">
                  <span className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${platform ? 'bg-gray-100 text-gray-500' : 'bg-[#10B981]/25 text-[#1b1e26]'}`}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15.5 7.5 21 2M18 5l-3 3M11 11a4 4 0 1 1-5.66 5.66A4 4 0 0 1 11 11z" />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold text-[#1b1e26] tracking-tight">
                      {platform ? 'Role permissions' : 'Manage permissions'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5 truncate">
                      {platform
                        ? <>The <span className="font-semibold text-[#1b1e26]">{permModalRole.name}</span> role has these predefined permissions.</>
                        : <>What the <span className="font-semibold text-[#1b1e26]">{permModalRole.name}</span> role can do.</>
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Body (the ONLY scroll) ── */}
              <div className="flex-1 min-h-0 overflow-y-auto px-6 sm:px-8 py-5 space-y-5">
                {(() => {
                  const q = permSearch.trim().toLowerCase();
                  const match = (p) => !q || (p.name || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
                  const cats = [...new Set(allPermissions.map((p) => p.category).filter(Boolean))];
                  const groups = cats
                    .map((cat) => ({ cat, perms: allPermissions.filter((p) => p.category === cat).filter(match) }))
                    .filter((g) => g.perms.length > 0);

                  if (groups.length === 0) {
                    return <p className="text-sm text-gray-400 text-center py-10">No permissions match &ldquo;{permSearch}&rdquo;.</p>;
                  }

                  return groups.map(({ cat, perms }) => {
                    const allOn = perms.every((p) => selectedPermIds.has(p.id));
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between px-1 pb-2">
                          <p className="text-[10px] font-bold text-[#1b1e26]/40 uppercase tracking-[0.14em]">{cat}</p>
                          {!platform && (
                            <button
                              type="button"
                              onClick={() => toggleCategory(perms, !allOn)}
                              className="text-[11px] font-semibold text-[#059669] hover:text-[#1b1e26] transition-colors"
                            >
                              {allOn ? 'Clear all' : 'Select all'}
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
                          {perms.map((perm) => (
                            <label
                              key={perm.id}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent transition-colors ${platform ? '' : 'hover:bg-[#f7f8fa] hover:border-[#1b1e26]/[0.05] cursor-pointer'}`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedPermIds.has(perm.id)}
                                onChange={() => !platform && togglePerm(perm.id)}
                                disabled={platform}
                                className="peer sr-only"
                              />
                              <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-150 ${
                                platform
                                  ? 'border-[#1b1e26]/15 bg-gray-100 peer-checked:bg-gray-300 peer-checked:border-gray-300 peer-checked:text-gray-500'
                                  : 'border-[#1b1e26]/15 bg-white text-transparent peer-checked:bg-[#10B981] peer-checked:border-[#10B981] peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-[#10B981]/30'
                              }`}>
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </span>
                              <div className="flex-1 min-w-0">
                                <span className="text-[13px] font-medium text-[#1b1e26] block truncate">{perm.name}</span>
                                {perm.description && (
                                  <span className="text-xs text-gray-400 block truncate">{perm.description}</span>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* ── Footer (fixed) ── */}
              <div className="shrink-0 px-6 sm:px-8 py-4 border-t border-gray-100 flex items-center justify-end gap-2.5 bg-white">
                <p className="mr-auto text-xs font-semibold text-gray-400">{selectedPermIds.size} selected</p>
                <button
                  type="button"
                  onClick={() => setPermModalRole(null)}
                  className="px-5 py-2 rounded-xl text-[13px] font-semibold text-[#1b1e26]/70 border border-[#1b1e26]/10 hover:bg-[#f3f4f6] transition-colors"
                >
                  {platform ? 'Close' : 'Cancel'}
                </button>
                {!platform && (
                  <button
                    type="button"
                    onClick={savePermissions}
                    disabled={permSaving}
                    className="px-5 py-2 rounded-xl text-[13px] font-bold bg-[#10B981] text-white hover:bg-[#34D399] transition-colors active:scale-[0.98] shadow-sm disabled:opacity-60"
                  >
                    {permSaving ? 'Saving…' : 'Save permissions'}
                  </button>
                )}
              </div>
              </>);
            })()}
          </div>
        </div>,
        document.body
      )}

      <ConfirmDeleteModal
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={executeDelete}
        title="Delete role"
        message="Are you sure you want to delete the role "
        itemName={confirmDelete?.name}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default EntityRolesPage;