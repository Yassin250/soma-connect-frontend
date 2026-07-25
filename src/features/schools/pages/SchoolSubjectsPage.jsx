import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { ConfirmDeleteModal } from '../../admin/components/CurriculumModals';

const API_BASE_URL = 'http://localhost:5050/api/school';

export const SchoolSubjectsPage = () => {
  const { token } = useAuth();
  const toast = useToast();

  const [allocations, setAllocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newAllocation, setNewAllocation] = useState({ subject: '', className: '', teacher: '', hours: 0, code: '' });
  const [filterClass, setFilterClass] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  const loadAllocations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/subject-allocations`, { headers: getHeaders() });
      if (!response.ok) {
        if (response.status === 404) {
          setAllocations([]);
        } else {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
      } else {
        const data = await response.json();
        setAllocations(data.data || data);
      }
    } catch (err) {
      toast.error(err.message);
      setAllocations([]);
    } finally {
      setIsLoading(false);
    }
  }, [getHeaders, toast]);

  useEffect(() => {
    loadAllocations();
  }, [loadAllocations]);

  const filteredAllocations = useCallback(() => {
    if (!filterClass) return allocations;
    return allocations.filter((a) => a.className === filterClass);
  }, [allocations, filterClass])();

  const handleAddAllocation = async () => {
    if (!newAllocation.subject.trim() || !newAllocation.className || !newAllocation.teacher) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/subject-allocations`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newAllocation),
      });
      if (!response.ok) throw new Error(`Failed to create: ${response.status}`);
      toast.success('Subject allocation added successfully');
      setShowForm(false);
      setNewAllocation({ subject: '', className: '', teacher: '', hours: 0, code: '' });
      loadAllocations();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteAllocation = (id, subjectName) => {
    setConfirmDelete({
      title: 'Remove Subject Allocation',
      message: 'You are about to permanently remove this subject allocation.',
      itemName: subjectName,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          const response = await fetch(`${API_BASE_URL}/subject-allocations/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
          });
          if (!response.ok) throw new Error(`Failed to delete: ${response.status}`);
          toast.success('Allocation removed');
          setConfirmDelete(null);
          loadAllocations();
        } catch (err) {
          toast.error(err.message);
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const uniqueClasses = [...new Set(allocations.map((a) => a.className))];

  const getSubjectColor = (code) => {
    const colors = {
      MAT: 'from-[#1b1e26] to-[#3a4150]',
      PHY: 'from-amber-500 to-orange-600',
      KIN: 'from-emerald-500 to-teal-600',
      CHEM: 'from-amber-500 to-orange-600',
      BIO: 'from-lime-500 to-green-600',
      ICT: 'from-teal-500 to-emerald-600',
      ENG: 'from-rose-500 to-pink-600',
      HIS: 'from-amber-600 to-yellow-700',
      ENT: 'from-orange-500 to-amber-600',
      GEO: 'from-emerald-500 to-teal-600',
    };
    return colors[code] || 'from-[#1b1e26] to-[#343b49]';
  };

  return (
    <div className="space-y-8 antialiased">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gray-400">Academic Management</span>
          <h1 className="text-[19px] font-medium tracking-tight mt-1.5 text-[#1b1e26]">Subject Allocation</h1>
          <p className="text-[12px] text-slate-500 mt-1">Assign subjects to classes and teachers. Manage weekly hours for each allocation.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1b1e26] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-black transition-all shadow-lg shadow-[#1b1e26]/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Subject
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Filter by Class:</span>
        <button
          onClick={() => setFilterClass('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!filterClass ? 'bg-[#1b1e26] text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          All Classes
        </button>
        {uniqueClasses.map((cls) => (
          <button
            key={cls}
            onClick={() => setFilterClass(cls)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterClass === cls ? 'bg-[#1b1e26] text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {cls}
          </button>
        ))}
      </div>

      {/* Allocations Grid (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-slate-400">
            <svg className="w-8 h-8 mx-auto animate-spin text-[#5429FF]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="mt-3 text-sm font-medium">Loading allocations...</p>
          </div>
        ) : filteredAllocations.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <p className="text-sm font-medium">No allocations found</p>
            <p className="text-xs mt-1">Create your first subject allocation using the button above.</p>
          </div>
        ) : (
          filteredAllocations.map((alloc) => (
            <div
              key={alloc.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:border-[#d0f24a]"
            >
              <div className={`h-28 bg-gradient-to-br ${getSubjectColor(alloc.code)} flex items-center justify-center text-white`}>
                <div className="text-center">
                  <p className="text-xl font-semibold">{alloc.code}</p>
                  <p className="text-white/70 text-xs mt-1">{alloc.subject}</p>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.499 5.221c-.896.207-1.817.484-2.659.813m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-5.238m-15.482 0a50.688 50.688 0 00-2.658.81c-.577.157-1.148.338-1.71.53" />
                  </svg>
                  <span className="text-sm font-medium text-slate-700">{alloc.className}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <span className="text-sm text-slate-600">{alloc.teacher}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#d0f24a]/20 text-[#1b1e26] border border-[#d0f24a]/50 tracking-wider">
                    {alloc.hours} hours/week
                  </span>
                </div>
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleDeleteAllocation(alloc.id, alloc.subject)}
                    className="flex-1 py-2 text-xs font-bold uppercase tracking-wider bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Allocations Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-[15px] font-semibold text-[#1b1e26]">Allocations</h2>
            <p className="text-xs text-slate-500 mt-1">Managing {filteredAllocations.length} subject allocations</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12 text-slate-400">
              <svg className="w-8 h-8 mx-auto animate-spin text-[#5429FF]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="mt-3 text-sm font-medium">Loading allocations...</p>
            </div>
          ) : filteredAllocations.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              <p className="text-sm font-medium">No allocations found</p>
              <p className="text-xs mt-1">Add a subject allocation to start managing subjects.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1b1e26]/[0.06] bg-[#f4f6f8]">
                  <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#1b1e26]/45">Subject</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#1b1e26]/45">Class</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#1b1e26]/45">Teacher</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#1b1e26]/45">Hours/Week</th>
                  <th className="text-right px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#1b1e26]/45">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAllocations.map((alloc) => (
                  <tr key={alloc.id} className="hover:bg-[#d0f24a]/[0.08] transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getSubjectColor(alloc.code)} flex items-center justify-center text-white text-[10px] font-bold`}>
                          {alloc.code}
                        </div>
                        <span className="text-[13px] font-bold text-slate-900">{alloc.subject}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[13px] text-[#1b1e26]/80">{alloc.className}</td>
                    <td className="px-4 py-2.5 text-[13px] text-[#1b1e26]/80">{alloc.teacher}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#d0f24a]/20 text-[#1b1e26] border border-[#d0f24a]/50 tracking-wider">
                        {alloc.hours}h
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => handleDeleteAllocation(alloc.id, alloc.subject)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h18z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Subject Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 p-7 relative">
            <button onClick={() => setShowForm(false)} className="absolute top-5 right-6 text-slate-400 hover:text-slate-600 text-2xl focus:outline-none">&times;</button>
            <div className="text-left mb-6">
              <h3 className="text-[15px] font-semibold text-[#1b1e26] tracking-tight">New Subject Allocation</h3>
              <p className="text-xs text-slate-400 mt-1">Assign a subject to a class and teacher.</p>
            </div>
            <div className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g., Mathematics"
                  value={newAllocation.subject}
                  onChange={(e) => setNewAllocation({ ...newAllocation, subject: e.target.value })}
                  className="w-full text-xs px-4 py-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#d0f24a] text-slate-800 placeholder-slate-300"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Class</label>
                <select
                  value={newAllocation.className}
                  onChange={(e) => setNewAllocation({ ...newAllocation, className: e.target.value })}
                  className="w-full text-xs px-4 py-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#d0f24a] text-slate-800"
                >
                  <option value="">Select class</option>
                  {mockClassesList.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Teacher</label>
                <select
                  value={newAllocation.teacher}
                  onChange={(e) => setNewAllocation({ ...newAllocation, teacher: e.target.value })}
                  className="w-full text-xs px-4 py-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#d0f24a] text-slate-800"
                >
                  <option value="">Select teacher</option>
                  {mockTeachersList.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Weekly Hours</label>
                <input
                  type="number"
                  min={1}
                  max={40}
                  placeholder="e.g., 6"
                  value={newAllocation.hours || ''}
                  onChange={(e) => setNewAllocation({ ...newAllocation, hours: parseInt(e.target.value) || 0 })}
                  className="w-full text-xs px-4 py-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#d0f24a] text-slate-800 placeholder-slate-300"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Subject Code (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., MAT"
                  value={newAllocation.code}
                  onChange={(e) => setNewAllocation({ ...newAllocation, code: e.target.value })}
                  className="w-full text-xs px-4 py-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#d0f24a] text-slate-800 placeholder-slate-300"
                />
              </div>
              <div className="border-t border-slate-100 pt-5 mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddAllocation}
                  className="px-5 py-2 bg-[#1b1e26] hover:bg-black text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Create Allocation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmDelete?.onConfirm}
        title={confirmDelete?.title}
        message={confirmDelete?.message}
        itemName={confirmDelete?.itemName}
        isLoading={isDeleting}
      />
    </div>
  );
};
