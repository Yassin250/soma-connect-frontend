import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog';

const API_BASE_URL = 'http://localhost:5050/api/school';

export const SchoolClassesPage = () => {
  const { token } = useAuth();
  const toast = useToast();

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [showSectionForm, setShowSectionForm] = useState(false);
  const [showSections, setShowSections] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', code: '', level: '', description: '' });
  const [newSection, setNewSection] = useState({ name: '', students: 0, teacher: '', room: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  const loadClasses = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/classes`, { headers: getHeaders() });
      if (!response.ok) {
        if (response.status === 404) {
          // Endpoint not yet available — fall through to empty state
          setClasses([]);
        } else {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
      } else {
        const data = await response.json();
        setClasses(data.data || data);
      }
    } catch (err) {
      toast.error(err.message);
      setClasses([]);
    } finally {
      setIsLoading(false);
    }
  }, [getHeaders, toast]);

  const loadSections = useCallback(async (classItem) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/classes/${classItem.id}/sections`, { headers: getHeaders() });
      if (!response.ok) {
        if (response.status === 404) {
          setSections([]);
        } else {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
      } else {
        const data = await response.json();
        setSections(data.data || data);
      }
    } catch (err) {
      toast.error(err.message);
      setSections([]);
    } finally {
      setIsLoading(false);
    }
  }, [getHeaders, toast]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const selectClass = (cls) => {
    setSelectedClass(cls);
    loadSections(cls);
    setShowSections(true);
  };

  const handleAddClass = async () => {
    if (!newClass.name.trim()) {
      toast.error('Please enter a class name');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/classes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newClass),
      });
      if (!response.ok) throw new Error(`Failed to create class: ${response.status}`);
      toast.success('Class added successfully');
      setShowForm(false);
      setNewClass({ name: '', code: '', level: '', description: '' });
      loadClasses();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteClass = (id, name) => {
    setConfirmDelete({
      title: 'Delete Class',
      message: 'You are about to permanently delete this class and all its sections.',
      itemName: name,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          const response = await fetch(`${API_BASE_URL}/classes/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
          });
          if (!response.ok) throw new Error(`Failed to delete: ${response.status}`);
          toast.success('Class deleted');
          setConfirmDelete(null);
          loadClasses();
        } catch (err) {
          toast.error(err.message);
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const handleAddSection = async () => {
    if (!newSection.name.trim()) {
      toast.error('Please enter a section name');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/classes/${selectedClass.id}/sections`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newSection),
      });
      if (!response.ok) throw new Error(`Failed to create section: ${response.status}`);
      toast.success('Section added');
      setShowSectionForm(false);
      setNewSection({ name: '', students: 0, teacher: '', room: '' });
      loadSections(selectedClass);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteSection = (id, name) => {
    setConfirmDelete({
      title: 'Delete Section',
      message: 'You are about to permanently delete this section.',
      itemName: name,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          const response = await fetch(`${API_BASE_URL}/sections/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
          });
          if (!response.ok) throw new Error(`Failed to delete: ${response.status}`);
          toast.success('Section deleted');
          setConfirmDelete(null);
          loadSections(selectedClass);
        } catch (err) {
          toast.error(err.message);
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  return (
    <div className="space-y-8 antialiased">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">Academic Management</span>
          <h1 className="text-2xl font-black tracking-tight mt-2 text-slate-900">Classes &amp; Sections</h1>
          <p className="text-sm text-slate-500 mt-1">Create and manage classes (S1A, Year 1 Computer Science, etc.) and their sections.</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setShowSections(false); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#5429FF] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Class
        </button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-slate-400">
            <svg className="w-8 h-8 mx-auto animate-spin text-[#5429FF]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="mt-3 text-sm font-medium">Loading classes...</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zM7 21v-2c0-.657.126-1.283.356-1.857M7 21v-2c0-.657.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0" />
            </svg>
            <p className="text-sm font-medium">No classes found</p>
            <p className="text-xs mt-1">Create your first class using the button above.</p>
          </div>
        ) : (
          classes.map((cls) => (
            <div
              key={cls.id}
              onClick={() => selectClass(cls)}
              className={`bg-white border rounded-2xl overflow-hidden transition-all cursor-pointer hover:shadow-lg ${
                selectedClass?.id === cls.id
                  ? 'border-[#5429FF] shadow-lg shadow-purple-200 ring-2 ring-purple-100'
                  : 'border-slate-200 hover:border-purple-300'
              }`}
            >
              <div className="h-32 bg-gradient-to-br from-[#5429FF] to-purple-700 flex items-center justify-center text-white">
                <div className="text-center">
                  <p className="text-3xl font-black">{cls.code}</p>
                  <p className="text-white/70 text-sm mt-1">{cls.level}</p>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-slate-900">{cls.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{cls.description}</p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); selectClass(cls); }}
                    className="flex-1 py-2 text-xs font-bold uppercase tracking-wider bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-all"
                  >
                    Sections
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteClass(cls.id, cls.name); }}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h18z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sections Table */}
      {showSections && selectedClass && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-900">{selectedClass.name} — Sections</h2>
              <p className="text-xs text-slate-500 mt-1">Managing {sections.length} sections</p>
            </div>
            <button
              onClick={() => setShowSectionForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#5429FF] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Section
            </button>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="text-center py-12 text-slate-400">
                <svg className="w-8 h-8 mx-auto animate-spin text-[#5429FF]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="mt-3 text-sm font-medium">Loading sections...</p>
              </div>
            ) : sections.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75M15 12h3.75M15 15h3.75M15 18h3.75" />
                </svg>
                <p className="text-sm font-medium">No sections found</p>
                <p className="text-xs mt-1">Add a section to start managing students.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400">Name</th>
                    <th className="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400">Teacher</th>
                    <th className="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400">Room</th>
                    <th className="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400">Students</th>
                    <th className="text-right py-3 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sections.map((section) => (
                    <tr key={section.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-6">
                        <span className="text-sm font-bold text-slate-900">{section.name}</span>
                      </td>
                      <td className="py-3 px-6 text-sm text-slate-600">{section.teacher}</td>
                      <td className="py-3 px-6 text-sm text-slate-500">{section.room}</td>
                      <td className="py-3 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100 tracking-wider">
                          {section.students}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-right">
                        <button
                          onClick={() => handleDeleteSection(section.id, section.name)}
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
      )}

      {/* Add Class Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 p-7 relative">
            <button onClick={() => setShowForm(false)} className="absolute top-5 right-6 text-slate-400 hover:text-slate-600 text-2xl focus:outline-none">&times;</button>
            <div className="text-left mb-6">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">New Class</h3>
              <p className="text-xs text-slate-400 mt-1">Create a new class for the academic year.</p>
            </div>
            <div className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Class Name</label>
                <input type="text" placeholder="e.g., Senior One" value={newClass.name} onChange={(e) => setNewClass({ ...newClass, name: e.target.value })} className="w-full text-xs px-4 py-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-purple-500 text-slate-800 placeholder-slate-300" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Code</label>
                <input type="text" placeholder="e.g., S1" value={newClass.code} onChange={(e) => setNewClass({ ...newClass, code: e.target.value })} className="w-full text-xs px-4 py-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-purple-500 text-slate-800 placeholder-slate-300" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Level</label>
                <select value={newClass.level} onChange={(e) => setNewClass({ ...newClass, level: e.target.value })} className="w-full text-xs px-4 py-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-purple-500 text-slate-800">
                  <option value="">Select level</option>
                  <option value="Primary">Primary</option>
                  <option value="Ordinary (O-Level)">Ordinary (O-Level)</option>
                  <option value="Advanced (A-Level)">Advanced (A-Level)</option>
                  <option value="University">University</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Description</label>
                <textarea rows={3} placeholder="Brief description..." value={newClass.description} onChange={(e) => setNewClass({ ...newClass, description: e.target.value })} className="w-full text-xs px-4 py-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-purple-500 text-slate-800 placeholder-slate-300 resize-none" />
              </div>
              <div className="border-t border-slate-100 pt-5 mt-6 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-sm">Cancel</button>
                <button type="button" onClick={handleAddClass} className="px-5 py-3 bg-[#5429FF] hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md">Create Class</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Section Modal */}
      {showSectionForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 p-7 relative">
            <button onClick={() => setShowSectionForm(false)} className="absolute top-5 right-6 text-slate-400 hover:text-slate-600 text-2xl focus:outline-none">&times;</button>
            <div className="text-left mb-6">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">New Section</h3>
              <p className="text-xs text-slate-400 mt-1">Create a new section for {selectedClass?.name}.</p>
            </div>
            <div className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Section Name</label>
                <input type="text" placeholder="e.g., Section A" value={newSection.name} onChange={(e) => setNewSection({ ...newSection, name: e.target.value })} className="w-full text-xs px-4 py-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-purple-500 text-slate-800 placeholder-slate-300" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Teacher</label>
                <input type="text" placeholder="Teacher name..." value={newSection.teacher} onChange={(e) => setNewSection({ ...newSection, teacher: e.target.value })} className="w-full text-xs px-4 py-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-purple-500 text-slate-800 placeholder-slate-300" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Room</label>
                <input type="text" placeholder="Room number..." value={newSection.room} onChange={(e) => setNewSection({ ...newSection, room: e.target.value })} className="w-full text-xs px-4 py-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-purple-500 text-slate-800 placeholder-slate-300" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Student Count</label>
                <input type="number" placeholder="0" min={0} value={newSection.students} onChange={(e) => setNewSection({ ...newSection, students: parseInt(e.target.value) || 0 })} className="w-full text-xs px-4 py-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-purple-500 text-slate-800 placeholder-slate-300" />
              </div>
              <div className="border-t border-slate-100 pt-5 mt-6 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowSectionForm(false)} className="px-5 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-sm">Cancel</button>
                <button type="button" onClick={handleAddSection} className="px-5 py-3 bg-[#5429FF] hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md">Create Section</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setConfirmDelete(null)}
          onConfirm={confirmDelete.onConfirm}
          title={confirmDelete.title}
          message={confirmDelete.message}
          itemName={confirmDelete.itemName}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};
