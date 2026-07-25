import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DataTable } from '../../../components/shared/DataTable';
import { RowActionMenu, DockIcons } from '../../../components/shared/RowActions';
import { ConfirmDeleteModal } from '../components/CurriculumModals';
import { useToast } from '../../../context/ToastContext';
import { adminService } from '../../../services/api';
import { AddSystemParameterModal } from '../components/AddSystemParameterModal';

const STATUS_STYLES = {
  Active: { pill: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  Inactive: { pill: 'bg-[#1b1e26]/[0.05] text-[#1b1e26]/45', dot: 'bg-[#1b1e26]/30' },
};

const StatusPill = ({ active }) => {
  const state = active === false ? 'Inactive' : 'Active';
  const style = STATUS_STYLES[state];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${style.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {state}
    </span>
  );
};

export const SystemParametersPage = () => {
  const toast = useToast();
  const [parameters, setParameters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParameter, setEditingParameter] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchParameters = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminService.getSystemParameters();
      setParameters(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = err.message || 'Failed to load system parameters';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchParameters();
  }, [fetchParameters]);

  const filteredParameters = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return parameters;
    return parameters.filter((parameter) =>
      [parameter.name, parameter.value, parameter.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [parameters, search]);

  const handleSave = async (payload) => {
    try {
      if (editingParameter) {
        await adminService.updateSystemParameter(editingParameter.id, {
          value: payload.value,
          description: payload.description,
          active: payload.active,
        });
        toast.success('System parameter updated');
      } else {
        await adminService.createSystemParameter({
          name: payload.name,
          value: payload.value,
          description: payload.description,
        });
        toast.success('System parameter created');
      }
      await fetchParameters();
      setIsModalOpen(false);
      setEditingParameter(null);
    } catch (err) {
      toast.error(err.message || 'Save failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminService.deleteSystemParameter(deleteTarget.id);
      await fetchParameters();
      toast.success('System parameter deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const handleToggleStatus = async (parameter) => {
    try {
      await adminService.updateSystemParameter(parameter.id, {
        active: parameter.active === false,
      });
      await fetchParameters();
      toast.success('System parameter status updated');
    } catch (err) {
      toast.error(err.message || 'Status update failed');
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      sortValue: (p) => p.name || '',
      render: (p) => <span className="font-medium text-[#1b1e26]">{p.name}</span>,
    },
    {
      key: 'value',
      header: 'Value',
      sortable: true,
      sortValue: (p) => p.value || '',
      render: (p) => <span className="text-[#1b1e26]/80 font-mono text-[12px]">{p.value || '—'}</span>,
    },
    {
      key: 'description',
      header: 'Description',
      sortable: true,
      sortValue: (p) => p.description || '',
      render: (p) => <span className="text-[#1b1e26]/55">{p.description || '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortValue: (p) => (p.active === false ? 'Inactive' : 'Active'),
      render: (p) => <StatusPill active={p.active} />,
    },
    {
      key: 'updatedAt',
      header: 'Updated At',
      sortable: true,
      sortValue: (p) => (p.updatedAt ? new Date(p.updatedAt).getTime() : 0),
      render: (p) => (
        <span className="text-gray-400">
          {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '132px',
      render: (parameter) => (
        <div className="flex justify-end">
          <RowActionMenu
            primary={{
              label: 'Edit',
              icon: DockIcons.edit,
              onClick: () => {
                setEditingParameter(parameter);
                setIsModalOpen(true);
              },
            }}
            items={[
              parameter.active === false
                ? {
                    label: 'Activate',
                    icon: DockIcons.power,
                    iconTone: 'text-emerald-500',
                    onClick: () => handleToggleStatus(parameter),
                  }
                : {
                    label: 'Deactivate',
                    icon: DockIcons.power,
                    onClick: () => handleToggleStatus(parameter),
                  },
              'divider',
              {
                label: 'Delete',
                icon: DockIcons.trash,
                danger: true,
                onClick: () => setDeleteTarget(parameter),
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-[19px] font-medium text-[#1b1e26] tracking-tight">System Parameters</h1>
          <p className="text-[12px] text-gray-500 mt-1">
            Configure platform-wide settings and key-value parameters.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingParameter(null);
            setIsModalOpen(true);
          }}
          className="bg-[#1b1e26] text-white text-[13px] font-semibold px-5 py-2 rounded-xl hover:bg-black transition-colors inline-flex items-center gap-2 shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 8V4m0 16v-4M4 12h4m12 0h-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          New Parameter
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#1b1e26]/[0.06] shadow-sm px-3 py-2.5">
        <div className="flex flex-wrap items-end gap-2.5">
          <div className="flex-1 min-w-[220px] max-w-[420px] flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-[#1b1e26]/45 uppercase tracking-[0.12em]">Search</label>
            <div className="relative">
              <svg className="w-4 h-4 text-[#1b1e26]/35 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Name, value, or description..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full text-[13px] px-3 py-2 rounded-lg border border-[#1b1e26]/10 bg-[#f7f8fa] text-[#1b1e26] pl-9 focus:bg-white focus:ring-4 focus:ring-[#d0f24a]/20 focus:border-[#d0f24a] focus:outline-none transition-all"
              />
            </div>
          </div>
          <button
            onClick={fetchParameters}
            className="shrink-0 h-[34px] px-5 rounded-full bg-[#d0f24a] text-[#1b1e26] text-[13px] font-semibold hover:bg-[#c4e83a] shadow-sm transition-colors active:scale-[0.98]"
          >
            Refresh
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={filteredParameters}
        keyField="id"
        loading={loading}
        error={error}
        minWidth={1040}
        skeletonRows={10}
        pageSize={10}
        rowLabel="parameters"
        emptyTitle={parameters.length === 0 ? 'No system parameters yet' : 'No matches'}
        emptyMessage={
          parameters.length === 0
            ? 'Create your first system parameter to get started.'
            : 'No system parameters match the current search.'
        }
      />

      {isModalOpen && (
        <AddSystemParameterModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingParameter(null);
          }}
          onSubmit={handleSave}
          editingParameter={editingParameter}
        />
      )}

      <ConfirmDeleteModal
        open={deleteTarget !== null}
        title="Delete parameter"
        message={`Are you sure you want to delete the parameter "${deleteTarget?.name || ''}"? This action cannot be undone.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default SystemParametersPage;
