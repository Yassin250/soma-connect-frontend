import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '../layouts/AdminLayout';
import { AddUserModal } from '../components/AddUserModal';
import { mockDb } from '../../../services/mockDb';
import { Badge } from '../../../components/shared/Badge';

const ROLE_VARIANT = {
  ADMIN: 'purple',
  SCHOOL_ADMIN: 'info',
  LECTURER: 'warning',
  STUDENT: 'success',
};

const ROLE_LABEL = {
  ADMIN: 'Super Admin',
  SCHOOL_ADMIN: 'School Admin',
  LECTURER: 'Lecturer',
  STUDENT: 'Student',
};

export const UserManagementPage = () => {
  const [currentView, setCurrentView] = useState('users');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [schoolFilter, setSchoolFilter] = useState('ALL');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadUsers = useCallback(() => {
    setUsers(mockDb.getUsers());
    setSchools(mockDb.getSchools());
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleAddUser = (userData) => {
    try {
      mockDb.addUser(userData);
      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = (userId) => {
    mockDb.removeUser(userId);
    setDeleteConfirm(null);
    loadUsers();
  };

  const getSchoolName = (schoolId) => {
    const school = schools.find(s => s.id === schoolId);
    return school ? school.name : schoolId || '—';
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesSchool = schoolFilter === 'ALL' || u.schoolId === schoolFilter;
    return matchesSearch && matchesRole && matchesSchool;
  });

  const uniqueRoles = [...new Set(users.map(u => u.role).filter(Boolean))];

  return (
    <AdminLayout currentSubPage={currentView} onSubPageChange={setCurrentView}>

      {currentView === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Users Directory</h1>
              <p className="text-xs text-gray-500">{users.length} total users across {schools.length} schools</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#1064ff] text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
            >
              + Add New User
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg text-xs px-3 py-2 w-64 focus:outline-none focus:border-[#1064ff]"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg text-xs px-2 py-2 focus:outline-none focus:border-[#1064ff]"
            >
              <option value="ALL">All Roles</option>
              {uniqueRoles.map(r => (
                <option key={r} value={r}>{ROLE_LABEL[r] || r}</option>
              ))}
            </select>
            <select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg text-xs px-2 py-2 focus:outline-none focus:border-[#1064ff]"
            >
              <option value="ALL">All Schools</option>
              {schools.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider">School</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[10px] font-bold text-[#1064ff]">
                          {u.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={ROLE_VARIANT[u.role] || 'default'}>{ROLE_LABEL[u.role] || u.role}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{getSchoolName(u.schoolId)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={u.status === 'Active' ? 'success' : 'warning'}>{u.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {deleteConfirm === u.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-[10px] text-red-500 font-medium">Delete?</span>
                          <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-800 text-[10px] font-semibold">Yes</button>
                          <button onClick={() => setDeleteConfirm(null)} className="text-gray-500 hover:text-gray-700 text-[10px] font-semibold">No</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(u.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          disabled={u.role === 'ADMIN'}
                          title={u.role === 'ADMIN' ? 'Cannot delete super admin' : 'Remove user'}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No users match your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {currentView === 'roles' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Roles Configuration</h1>
            <p className="text-xs text-gray-500">Role definitions and their assigned permissions.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['ADMIN', 'SCHOOL_ADMIN', 'LECTURER', 'STUDENT'].map(role => {
              const count = users.filter(u => u.role === role).length;
              return (
                <div key={role} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={ROLE_VARIANT[role]}>{ROLE_LABEL[role]}</Badge>
                    <span className="text-xs text-gray-400 font-medium">{count} user{count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="text-[11px] text-gray-600 leading-relaxed">
                    {role === 'ADMIN' && 'Full system access. Manages school approvals, user directory, and platform configuration.'}
                    {role === 'SCHOOL_ADMIN' && 'Manages school profile, departments, lecturer accounts, and student enrollment for their school.'}
                    {role === 'LECTURER' && 'Creates modules, quizzes, and assignments. Grades submissions and reviews plagiarism flags.'}
                    {role === 'STUDENT' && 'Enrolls in courses, completes modules, takes quizzes, submits assignments, and builds portfolio.'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {currentView === 'permissions' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Permissions Matrix</h1>
            <p className="text-xs text-gray-500">Access control for each role across platform resources.</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider">Resource</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider">Admin</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider">School Admin</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider">Lecturer</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ['School Approvals',       '✓', '—',     '—',     '—'],
                  ['User Management',        '✓', 'Own',   '—',     '—'],
                  ['School Setup',           '✓', '✓',    '—',     '—'],
                  ['Course / Module CRUD',   '—', '✓',    '✓',    '—'],
                  ['Quiz Builder',           '—', '—',     '✓',    '—'],
                  ['Assignment Builder',     '—', '—',     '✓',    '—'],
                  ['Grade Submissions',      '—', '—',     '✓',    '—'],
                  ['Plagiarism Review',      '—', '—',     '✓',    '—'],
                  ['View Modules',           '—', '✓',    '✓',    '✓'],
                  ['Take Quizzes',           '—', '—',     '—',     '✓'],
                  ['Submit Assignments',     '—', '—',     '—',     '✓'],
                  ['Portfolio / Discovery',  '—', '—',     '—',     '✓'],
                ].map(([resource, ...perms]) => (
                  <tr key={resource} className="hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 font-medium text-gray-800">{resource}</td>
                    {perms.map((p, i) => (
                      <td key={i} className={`text-center px-4 py-2.5 font-semibold ${p === '✓' ? 'text-emerald-600' : p === '—' ? 'text-gray-300' : 'text-blue-600'}`}>
                        {p}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddUser={handleAddUser}
        schools={schools}
      />
    </AdminLayout>
  );
};
