import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AddRoleModal } from '../components/AddRoleModal';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

export const RolesPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [currentView, setCurrentView] = useState('roles');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null);
  const [dropdownConfig, setDropdownConfig] = useState({
    visible: false,
    type: null,
    id: null,
    coords: { top: 0, left: 0 },
  });

  const [filterRoleStatus, setFilterRoleStatus] = useState('All');
  const [filterRoleDate, setFilterRoleDate] = useState('');
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [permModalRole, setPermModalRole] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedPermIds, setSelectedPermIds] = useState(new Set());
  const API_BASE_URL = 'http://localhost:5050/api/admin';

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      const matchStatus = filterRoleStatus === 'All' || r.status === filterRoleStatus;
      const matchDate = !filterRoleDate || r.createdAt?.startsWith(filterRoleDate);
      return matchStatus && matchDate;
    });
  }, [roles, filterRoleStatus, filterRoleDate]);

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/roles`, { headers: getHeaders() });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch roles: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      setRoles(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      toast.error(err.message);
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleAddOrUpdateRole = async (roleData) => {
    try {
      if (editingEntity) {
        const response = await fetch(`${API_BASE_URL}/roles/${editingEntity.id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(roleData),
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to update role: ${response.status} ${errorText}`);
        }
        await fetchRoles();
        toast.success('Role updated successfully');
      } else {
        const payload = {
          ...roleData,
          permissions: 'CUSTOM_' + roleData.name.replace(/\s+/g, '_').toUpperCase(),
          status: 'Active',
        };
        const response = await fetch(`${API_BASE_URL}/roles`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to create role: ${response.status} ${errorText}`);
        }
        await fetchRoles();
        toast.success('Role created successfully');
      }
      setIsRoleModalOpen(false);
      setEditingEntity(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleRoleStatus = async (id, currentActive) => {
    const newActive = typeof currentActive === 'boolean' ? !currentActive : true;
    try {
      const response = await fetch(`${API_BASE_URL}/roles/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ active: newActive }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update role status: ${response.status} ${errorText}`);
      }
      await fetchRoles();
      toast.success('Role status updated successfully');
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
    closeDropdown();
  };

  const deleteEntity = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) {
      closeDropdown();
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete ${type}: ${response.status} ${errorText}`);
      }
      await fetchRoles();
      toast.success('Role deleted successfully');
    } catch (err) {
      toast.error(err.message);
    }
    closeDropdown();
  };

  const handleActionClick = (e, type, id) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownConfig({
      visible: true,
      type,
      id,
      coords: { top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX },
    });
  };

  const closeDropdown = () => setDropdownConfig({ visible: false, type: null, id: null, coords: { top: 0, left: 0 } });

  const getStatusBadgeClasses = (status) => status === 'Active' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-rose-100 text-rose-700 border border-rose-300';
  const getStatusDotClasses = (status) => status === 'Active' ? 'bg-green-500' : 'bg-rose-500';

  const openPermModal = async (role) => {
    setPermModalRole(role);
    try {
      const response = await fetch(`${API_BASE_URL}/permissions`, { headers: getHeaders() });
      if (!response.ok) throw new Error('Failed to load permissions');
      const data = await response.json();
      const perms = Array.isArray(data) ? data : data?.data || [];
      setAllPermissions(perms);
      setSelectedPermIds(new Set(role.permissions?.map(p => p.id) || []));
    } catch (err) {
      toast.error(err.message);
      setPermModalRole(null);
    }
  };

  const togglePerm = (permId) => {
    setSelectedPermIds(prev => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });
  };

  const savePermissions = async () => {
    if (!permModalRole) return;
    try {
      const response = await fetch(`${API_BASE_URL}/roles/${permModalRole.id}/permissions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ permissionIds: Array.from(selectedPermIds) }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to assign permissions: ${response.status} ${errorText}`);
      }
      await fetchRoles();
      toast.success('Permissions updated successfully');
      setPermModalRole(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-left">
          <h1 className="text-2xl font-bold text-[#1e293b] tracking-tight">Roles</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage system roles</p>
        </div>
        <button
          onClick={() => { setEditingEntity(null); setIsRoleModalOpen(true); }}
          className="bg-[#1064ff] text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-blue-600"
        >
          + New Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm items-end">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Status</label>
          <select
            className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={filterRoleStatus}
            onChange={(e) => setFilterRoleStatus(e.target.value)}
          >
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Date Created</label>
          <input
            type="date"
            className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={filterRoleDate}
            onChange={(e) => setFilterRoleDate(e.target.value)}
          />
        </div>
        <button
          onClick={() => { setFilterRoleStatus('All'); setFilterRoleDate(''); }}
          className="h-[42px] px-4 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors col-start-1 md:col-start-auto"
        >
          Reset Filters
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fafafa] border-b border-gray-200 text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                <th className="p-3.5 pl-5 w-20">Actions</th>
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Permissions</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-5">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
              {filteredRoles.map((role) => (
                <tr key={role.id} className="hover:bg-slate-50/70">
                  <td className="p-3.5 pl-5">
                    <button
                      onClick={(e) => handleActionClick(e, 'role', role.id)}
                      className="text-gray-400 hover:text-blue-600 p-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </td>
                  <td className="p-3.5 font-semibold text-gray-900">{role.name}</td>
                  <td className="p-3.5 text-gray-500 max-w-xs truncate">{role.description}</td>
                  <td className="p-3.5">
                    <button
                      onClick={() => openPermModal(role)}
                      title="Manage permissions"
                      className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-500 text-white text-[11px] font-bold shadow-sm hover:bg-blue-600 hover:shadow-md transition-all cursor-pointer"
                    >
                      {role.permissions?.length ?? 0}
                    </button>
                  </td>
                  <td className="p-3.5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-md text-[10px] font-extrabold tracking-wider uppercase border ${getStatusBadgeClasses(role.active != null ? (role.active ? 'Active' : 'Inactive') : role.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${getStatusDotClasses(role.active != null ? (role.active ? 'Active' : 'Inactive') : role.status)}`} />
                      {role.active != null ? (role.active ? 'Active' : 'Inactive') : role.status}
                    </span>
                  </td>
                  <td className="p-3.5 pr-5 text-gray-400 font-normal">{role.createdAt ? new Date(role.createdAt).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading && <div className="p-8 text-center text-sm text-gray-500">Loading roles...</div>}
          {!isLoading && filteredRoles.length === 0 && <div className="p-8 text-center text-sm text-gray-500">No roles found.</div>}
        </div>
      </div>

      {dropdownConfig.visible && (
        <div
          style={{ top: dropdownConfig.coords.top, left: dropdownConfig.coords.left }}
          className="fixed w-44 bg-white border border-gray-200 rounded-lg shadow-2xl z-[9999] py-1.5"
        >
          <button
            onClick={() => {
              const match = roles.find((r) => r.id === dropdownConfig.id);
              setEditingEntity(match);
              setIsRoleModalOpen(true);
              closeDropdown();
            }}
            className="w-full px-4 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-slate-50 transition-colors flex items-center space-x-2"
          >
            <span>Edit</span>
          </button>
          <button
            onClick={() => {
              const role = roles.find((r) => r.id === dropdownConfig.id);
              if (role) toggleRoleStatus(role.id, role.active != null ? role.active : role.status === 'Active');
            }}
            className="w-full px-4 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-slate-50 transition-colors flex items-center space-x-2"
          >
            <span>Toggle Status</span>
          </button>
          <button
            onClick={() => {
              const role = roles.find((r) => r.id === dropdownConfig.id);
              if (role) deleteEntity('role', role.id);
            }}
            className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center space-x-2"
          >
            <span>Delete Role</span>
          </button>
        </div>
      )}

      {isRoleModalOpen && (
        <AddRoleModal
          isOpen={isRoleModalOpen}
          onClose={() => { setIsRoleModalOpen(false); setEditingEntity(null); }}
          onSubmit={handleAddOrUpdateRole}
          editingRole={editingEntity}
        />
      )}

      {permModalRole && createPortal(
        <div className="fixed inset-0 w-full h-full min-h-screen bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[50]">
          <div className="bg-white rounded-[24px] shadow-xl w-full max-w-lg overflow-hidden border border-gray-200 p-6 relative">
            <button
              type="button"
              onClick={() => setPermModalRole(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-lg"
            >
              &times;
            </button>
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                Manage Permissions — {permModalRole.name}
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Select the permissions this role should have. Changes take effect immediately on save.
              </p>
            </div>
            <div className="max-h-72 overflow-y-auto space-y-1.5 mb-6">
              {allPermissions.map((perm) => (
                <label
                  key={perm.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedPermIds.has(perm.id)}
                    onChange={() => togglePerm(perm.id)}
                    className="accent-blue-600 w-4 h-4 rounded border-gray-300"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-gray-800 block">{perm.name}</span>
                    {perm.description && (
                      <span className="text-[10px] text-gray-400 block truncate">{perm.description}</span>
                    )}
                  </div>
                  {perm.category && (
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
                      {perm.category}
                    </span>
                  )}
                </label>
              ))}
            </div>
            <div className="flex justify-end space-x-2.5">
              <button
                type="button"
                onClick={() => setPermModalRole(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={savePermissions}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
