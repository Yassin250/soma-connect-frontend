import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AddRoleModal } from '../components/AddRoleModal';
import { RowActionMenu, DockIcons } from '../../../components/shared/RowActions';
import { useToast } from '../../../context/ToastContext';
import { adminService } from '../../../services/api';

const resolveRoleStatus = (role) => (role.active === false ? 'Inactive' : 'Active');

export const RolesPage = () => {
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

  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      if (filterRoleStatus !== 'All' && resolveRoleStatus(r) !== filterRoleStatus) return false;
      if (filterRoleDateFrom || filterRoleDateTo) {
        // ISO yyyy-mm-dd substrings compare correctly as strings
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
      const data = await adminService.getRoles();
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  // Close the permissions modal on Escape — same behavior as the other modals.
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
        await adminService.updateRole(editingEntity.id, {
          name: roleData.name,
          description: roleData.description,
        });
        toast.success('Role updated');
      } else {
        await adminService.createRole({
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
      await adminService.setRoleStatus(role.id, role.active === false);
      await fetchRoles();
      toast.success('Role status updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = async (role) => {
    if (!window.confirm(`Delete role "${role.name}"?`)) return;
    try {
      await adminService.deleteRole(role.id);
      await fetchRoles();
      toast.success('Role deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ── Permissions modal ────────────────────────────────────────────────────────
  const openPermModal = async (role) => {
    setPermModalRole(role);
    setPermSearch('');
    try {
      const perms = await adminService.getPermissions();
      setAllPermissions(Array.isArray(perms) ? perms : []);
      setSelectedPermIds(new Set((role.permissions || []).map((p) => p.id)));
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

  // Select / clear every permission in a category at once.
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
      await adminService.assignRolePermissions(permModalRole.id, Array.from(selectedPermIds));
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[19px] font-medium text-[#1b1e26] tracking-tight">Roles &amp; Access</h1>
          <p className="text-[12px] text-gray-500 mt-1">Define roles and the permissions that govern platform access.</p>
        </div>
        <button
          onClick={() => { setEditingEntity(null); setIsRoleModalOpen(true); }}
          className="bg-[#1b1e26] text-white text-[13px] font-semibold px-5 py-2 rounded-xl hover:bg-black transition-colors inline-flex items-center gap-2 shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 8v6M9 11h6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          New Role
        </button>
      </div>

      {/* Filters — content-width card, platform field recipe, divider before actions */}
      <div className="bg-white rounded-2xl border border-[#1b1e26]/[0.06] shadow-sm p-4 w-fit max-w-full">
        <div className="flex flex-wrap items-end gap-3.5">
          <div className="w-[160px] flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-[#1b1e26]/45 uppercase tracking-[0.12em]">Status</label>
            <select
              className="w-full text-[13px] px-3.5 py-2.5 rounded-xl border border-[#1b1e26]/10 bg-[#f7f8fa] text-[#1b1e26] hover:border-[#1b1e26]/20 focus:bg-white focus:ring-4 focus:ring-[#d0f24a]/20 focus:border-[#d0f24a] focus:outline-none transition-all cursor-pointer"
              value={filterRoleStatus}
              onChange={(e) => setFilterRoleStatus(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          {/* Created date range — labeled From / To with leading calendar icons */}
          <div className="w-[180px] flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-[#1b1e26]/45 uppercase tracking-[0.12em]">From</label>
            <div className="relative">
              <svg className="w-4 h-4 text-[#1b1e26]/35 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="17" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <input
                type="date"
                aria-label="Created from"
                className="w-full text-[13px] pl-9 pr-3 py-2.5 rounded-xl border border-[#1b1e26]/10 bg-[#f7f8fa] text-[#1b1e26] hover:border-[#1b1e26]/20 focus:bg-white focus:ring-4 focus:ring-[#d0f24a]/20 focus:border-[#d0f24a] focus:outline-none transition-all"
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
                className="w-full text-[13px] pl-9 pr-3 py-2.5 rounded-xl border border-[#1b1e26]/10 bg-[#f7f8fa] text-[#1b1e26] hover:border-[#1b1e26]/20 focus:bg-white focus:ring-4 focus:ring-[#d0f24a]/20 focus:border-[#d0f24a] focus:outline-none transition-all"
                value={filterRoleDateTo}
                onChange={(e) => setFilterRoleDateTo(e.target.value)}
              />
            </div>
          </div>

          {/* Divider between fields and actions */}
          <span className="hidden sm:block w-px h-10 bg-[#1b1e26]/[0.07] mx-0.5" />

          <button
            onClick={fetchRoles}
            className="shrink-0 h-10 px-5 rounded-full bg-[#d0f24a] text-[#1b1e26] text-[13px] font-semibold hover:bg-[#c4e83a] shadow-sm transition-colors active:scale-[0.98]"
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
                <th className="px-4 py-2.5 pl-6">Name</th>
                <th className="px-4 py-2.5">Description</th>
                <th className="px-4 py-2.5">Permissions</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Created At</th>
                <th className="px-4 py-2.5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-[13px] text-[#1b1e26]/80">
              {filteredRoles.map((role) => {
                const status = resolveRoleStatus(role);
                return (
                  <tr key={role.id} className="hover:bg-[#d0f24a]/[0.08] transition-colors">
                    <td className="px-4 py-2.5 pl-6 font-medium text-[#1b1e26]">{role.name}</td>
                    <td className="px-4 py-2.5 text-gray-500 max-w-xs truncate">{role.description || '—'}</td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => openPermModal(role)}
                        title="Manage permissions"
                        className="inline-flex items-center justify-center min-w-[1.75rem] h-7 px-2 rounded-full bg-[#d0f24a] text-[#1b1e26] text-[11px] font-bold shadow-sm hover:bg-[#c4e83a] transition-all"
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
                    <td className="px-4 py-2.5text-gray-400">
                      {role.createdAt ? new Date(role.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-2.5pr-6">
                      <div className="flex justify-end">
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
                            { label: 'Delete role', icon: DockIcons.trash, danger: true, onClick: () => handleDelete(role) },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {loading && <div className="p-8 text-center text-sm text-gray-400">Loading roles…</div>}
          {!loading && filteredRoles.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-400">
              {roles.length === 0 ? 'No roles yet. Create one to get started.' : 'No roles match the current filters.'}
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

      {/* Permission assignment modal — one internal scroll region only:
          fixed header + toolbar, a single scrolling body, fixed footer. */}
      {permModalRole && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1b1e26]/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPermModalRole(null)}
          role="presentation"
        >
          <div
            className="relative w-full max-w-[880px] h-[min(86vh,680px)] flex flex-col bg-white rounded-3xl border border-[#1b1e26]/[0.06] shadow-[0_20px_60px_rgba(27,30,38,0.25)] overflow-hidden animate-in zoom-in-95 fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
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
                <span className="w-11 h-11 rounded-2xl bg-[#d0f24a]/25 text-[#1b1e26] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15.5 7.5 21 2M18 5l-3 3M11 11a4 4 0 1 1-5.66 5.66A4 4 0 0 1 11 11z" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-semibold text-[#1b1e26] tracking-tight">Manage permissions</h3>
                  <p className="text-sm text-gray-500 mt-0.5 truncate">
                    What the <span className="font-semibold text-[#1b1e26]">{permModalRole.name}</span> role can do.
                  </p>
                </div>
              </div>

              {/* Search — filters the checklist below */}
              <div className="relative mt-5">
                <svg className="w-4 h-4 text-[#1b1e26]/35 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" /></svg>
                <input
                  type="text"
                  autoFocus
                  value={permSearch}
                  onChange={(e) => setPermSearch(e.target.value)}
                  placeholder="Search permissions…"
                  className="w-full text-[13px] pl-10 pr-3 py-2.5 rounded-xl border border-[#1b1e26]/10 bg-[#f7f8fa] text-[#1b1e26] focus:bg-white focus:ring-4 focus:ring-[#d0f24a]/20 focus:border-[#d0f24a] focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* ── Body (the ONLY scroll) ── */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 sm:px-8 py-5 space-y-5">
              {(() => {
                const q = permSearch.trim().toLowerCase();
                const match = (p) => !q || (p.name || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
                const cats = ['PLATFORM', 'ENTITY'];
                const known = cats.flatMap((cat) => allPermissions.filter((p) => p.category === cat));
                const other = allPermissions.filter((p) => !cats.includes(p.category));
                const groups = [
                  ...cats.map((cat) => ({ cat, perms: allPermissions.filter((p) => p.category === cat).filter(match) })),
                  ...(other.length ? [{ cat: 'OTHER', perms: other.filter(match) }] : []),
                ].filter((g) => g.perms.length > 0);

                if (groups.length === 0) {
                  return <p className="text-sm text-gray-400 text-center py-10">No permissions match “{permSearch}”.</p>;
                }

                return groups.map(({ cat, perms }) => {
                  const allOn = perms.every((p) => selectedPermIds.has(p.id));
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between px-1 pb-2">
                        <p className="text-[10px] font-bold text-[#1b1e26]/40 uppercase tracking-[0.14em]">{cat}</p>
                        <button
                          type="button"
                          onClick={() => toggleCategory(perms, !allOn)}
                          className="text-[11px] font-semibold text-[#5b6b12] hover:text-[#1b1e26] transition-colors"
                        >
                          {allOn ? 'Clear all' : 'Select all'}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
                        {perms.map((perm) => (
                          <label
                            key={perm.id}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:bg-[#f7f8fa] hover:border-[#1b1e26]/[0.05] cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedPermIds.has(perm.id)}
                              onChange={() => togglePerm(perm.id)}
                              className="peer sr-only"
                            />
                            <span className="w-5 h-5 rounded-md border-2 border-[#1b1e26]/15 bg-white text-transparent peer-checked:bg-[#d0f24a] peer-checked:border-[#d0f24a] peer-checked:text-[#1b1e26] peer-focus-visible:ring-4 peer-focus-visible:ring-[#d0f24a]/30 flex items-center justify-center shrink-0 transition-all duration-150">
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
                Cancel
              </button>
              <button
                type="button"
                onClick={savePermissions}
                disabled={permSaving}
                className="px-5 py-2 rounded-xl text-[13px] font-bold bg-[#d0f24a] text-[#1b1e26] hover:bg-[#c4e83a] transition-colors active:scale-[0.98] shadow-sm disabled:opacity-60"
              >
                {permSaving ? 'Saving…' : 'Save permissions'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {confirmDelete && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setConfirmDelete(null)}
          onConfirm={executeDelete}
          title={confirmDelete.title}
          message={confirmDelete.message}
          itemName={confirmDelete.itemName}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};
