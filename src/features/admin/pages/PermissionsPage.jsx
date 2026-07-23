import React, { useState, useEffect, useRef } from 'react';
import { adminService } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { DataTable } from '../../../components/shared/DataTable';

const columns = [
  {
    key: 'name',
    header: 'Name',
    sortable: true,
    sortValue: (p) => p.name || '',
    render: (p) => (
      <span className="text-[13px] font-medium text-[#1b1e26]">{p.name}</span>
    ),
  },
  {
    key: 'description',
    header: 'Description',
    sortable: true,
    sortValue: (p) => p.description || '',
    render: (p) => <span className="text-gray-500 max-w-sm block">{p.description || '—'}</span>,
  },
  {
    key: 'category',
    header: 'Category',
    sortable: true,
    sortValue: (p) => p.category || '',
    render: (p) => (
      <span className="px-2.5 py-1 bg-[#d0f24a]/25 text-[#1b1e26] rounded-full text-[11px] font-semibold">
        {p.category || 'General'}
      </span>
    ),
  },
  {
    key: 'createdAt',
    header: 'Created At',
    sortable: true,
    sortValue: (p) => (p.createdAt ? new Date(p.createdAt).getTime() : 0),
    render: (p) => (
      <span className="text-gray-400">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'}</span>
    ),
  },
];

export const PermissionsPage = () => {
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await adminService.getPermissions();
        if (!cancelled) setPermissions(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load permissions');
          toastRef.current.error(err.message || 'Failed to load permissions');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[19px] font-medium text-[#1b1e26] tracking-tight">Permissions</h1>
        <p className="text-[12px] text-gray-500 mt-0.5">Fine-grained privileges that power every role.</p>
      </div>

      <DataTable
        columns={columns}
        rows={permissions}
        loading={isLoading}
        error={error}
        minWidth={780}
        skeletonRows={10}
        pageSize={10}
        rowLabel="permissions"
        filters={[
          { key: 'category', label: 'Category', getValue: (p) => p.category },
        ]}
        emptyTitle="No permissions yet"
        emptyMessage="Permissions will appear here once configured on the server."
      />
    </div>
  );
};

export default PermissionsPage;
