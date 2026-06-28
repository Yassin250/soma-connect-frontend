import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';

export const PermissionsPage = () => {
  const { token } = useAuth();
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:5050/api/admin';

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  const fetchPermissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/permissions`, { headers: getHeaders() });
      if (!response.ok) throw new Error(`Failed to fetch permissions: ${response.status}`);
      const data = await response.json();
      setPermissions(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      setError(err.message);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h1 className="text-2xl font-bold text-[#1e293b] tracking-tight">Permissions</h1>
        <p className="text-xs text-gray-500 mt-0.5">Manage system Permissions</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fafafa] border-b border-gray-200 text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                <th className="p-3.5 pl-5">Name</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5 pr-5">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
              {permissions.map((perm) => (
                <tr key={perm.id} className="hover:bg-slate-50/70">
                  <td className="p-3.5 pl-5 font-mono text-[11px] text-blue-600 font-bold">{perm.name}</td>
                  <td className="p-3.5 text-gray-500 max-w-sm">{perm.description}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-[11px] font-semibold">{perm.category}</span>
                  </td>
                  <td className="p-3.5 pr-5 text-gray-400 font-normal">
                    {perm.createdAt ? new Date(perm.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading && <div className="p-8 text-center text-sm text-gray-500">Loading permissions...</div>}
          {error && <div className="p-8 text-center text-sm text-red-500 bg-red-50 rounded-b-xl">Error: {error}</div>}
          {!isLoading && !error && permissions.length === 0 && <div className="p-8 text-center text-sm text-gray-500">No permissions found.</div>}
        </div>
      </div>
    </div>
  );
};
