import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AddRoleModal } from '../components/AddRoleModal';
import { useAuth } from '../../../context/AuthContext';

export const RolesPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

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
  const [error, setError] = useState(null);

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
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/roles`, { headers: getHeaders() });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch roles: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      setRoles(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      setError(err.message);
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
      }
      setIsRoleModalOpen(false);
      setEditingEntity(null);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const toggleRoleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const response = await fetch(`${API_BASE_URL}/roles/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update role status: ${response.status} ${errorText}`);
      }
      await fetchRoles();
    } catch (err) {
      console.error(err);
      alert(err.message);
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
    } catch (err) {
      alert(`Error: ${err.message}`);
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

  const getStatusBadgeClasses = (status) => status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700';
  const getStatusDotClasses = (status) => status === 'Active' ? 'bg-green-500' : 'bg-rose-500';

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

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fafafa] border-b border-gray-200 text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                <th className="p-3.5 pl-5 w-20">Actions</th>
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Type</th>
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
                  <td className="p-3.5 text-gray-500">{role.type}</td>
                  <td className="p-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${getStatusBadgeClasses(role.status)}`}>
                      <span className={`w-1 h-1 rounded-full mr-1.5 ${getStatusDotClasses(role.status)}`} />
                      {role.status}
                    </span>
                  </td>
                  <td className="p-3.5 pr-5 text-gray-400 font-normal">{role.createdAt ? new Date(role.createdAt).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading && <div className="p-8 text-center text-sm text-gray-500">Loading roles...</div>}
          {error && <div className="p-8 text-center text-sm text-red-500 bg-red-50 rounded-b-xl">Error: {error}</div>}
          {!isLoading && !error && filteredRoles.length === 0 && <div className="p-8 text-center text-sm text-gray-500">No roles found.</div>}
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
              if (role) toggleRoleStatus(role.id, role.status);
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
    </div>
  );
};
