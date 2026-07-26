import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { ConfirmDeleteModal } from '../../admin/components/CurriculumModals';

const API_BASE_URL = 'http://localhost:5050/api/school';

export const StudentDirectoryPage = () => {
  const { user, token } = useAuth();
  const toast = useToast();

  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  const loadStudents = useCallback(async () => {
    if (!user?.schoolId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/${user.schoolId}/users`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        const users = Array.isArray(data) ? data : data.data || [];
        setStudents(users.filter(u => u.role === 'STUDENT' || u.roles?.includes('STUDENT')));
      }
    } catch (err) { toast.error(err.message); }
    finally { setIsLoading(false); }
  }, [user, getHeaders]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName || !newEmail || !user?.schoolId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/${user.schoolId}/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name: newName, email: newEmail, role: 'STUDENT' }),
      });
      if (!res.ok) throw new Error('Failed to add student');
      toast.success('Student registered successfully.');
      setNewName(''); setNewEmail(''); setShowAddForm(false);
      await loadStudents();
    } catch (err) { toast.error(err.message); }
  };

  const handleRemove = (userId) => {
    setConfirmDelete({
      title: 'Remove Student',
      message: 'You are about to permanently remove this student from the school.',
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          const res = await fetch(`${API_BASE_URL}/${user.schoolId}/users/${userId}`, {
            method: 'DELETE', headers: getHeaders(),
          });
          if (!res.ok) throw new Error('Failed to remove');
          toast.success('Student removed.');
          setConfirmDelete(null);
          await loadStudents();
        } catch (err) { toast.error(err.message); }
        finally { setIsDeleting(false); }
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-[19px] font-medium text-[#1b1e26] tracking-tight">Student Directory</h1>
          <p className="text-[12px] text-slate-400 mt-1">Manage enrolled student profiles.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-2 bg-[#1b1e26] hover:bg-black text-xs font-bold rounded-xl text-white shadow-md transition-all self-start sm:self-center"
        >
          {showAddForm ? 'Cancel' : '+ Register Student'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4 max-w-xl">
          <h4 className="text-xs font-semibold text-[#1b1e26] uppercase tracking-wider">New Student Profile</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Name</label>
              <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Ganza Kenny"
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl text-xs px-3 py-2.5 text-slate-800 outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email</label>
              <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                placeholder="e.g. g.kenny@domain.edu"
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl text-xs px-3 py-2.5 text-slate-800 outline-none focus:border-accent" />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-slate-100 text-slate-500 font-bold text-xs rounded-xl">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-[#1b1e26] text-white font-bold text-xs rounded-xl shadow-sm">Save Profile</button>
          </div>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-sm font-mono">Loading...</div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857" />
            </svg>
            <p className="text-sm font-medium">No students enrolled.</p>
            <p className="text-xs mt-1">Register a student to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#f4f6f8] border-b border-[#1b1e26]/[0.06]">
                  <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#1b1e26]/45">Name</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#1b1e26]/45">Email</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#1b1e26]/45 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.map((stud) => (
                  <tr key={stud.id} className="hover:bg-accent/[0.08] transition-colors">
                    <td className="px-4 py-2.5 text-[13px] font-bold text-slate-900">{stud.name}</td>
                    <td className="px-4 py-2.5 text-[13px] font-mono text-slate-500">{stud.email}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 rounded-lg font-bold tracking-wider uppercase">Verified</span>
                        <button onClick={() => handleRemove(stud.id)} className="text-slate-400 hover:text-red-500 text-[13px] px-1 transition-colors" title="Remove">✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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