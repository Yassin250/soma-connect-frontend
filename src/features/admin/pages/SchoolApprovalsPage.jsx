import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog';

export const SchoolApprovalsPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const API_BASE_URL = 'http://localhost:5050/api/admin';
  const SCHOOL_API_BASE_URL = 'http://localhost:5050/api/school';

  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [simulatedEmail, setSimulatedEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [approveForm, setApproveForm] = useState({ name: '', email: '', password: '' });

  const [form, setForm] = useState({ name: '', type: 'UNIVERSITY', slug: '', email: '', phone: '', address: '', website: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  const loadSchools = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/schools`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error(`Failed to fetch schools: ${response.status}`);
      const data = await response.json();
      setSchools(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [getHeaders]);

  const handleRegister = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast.warning('Name and slug are required');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/schools`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to register school');
      }
      setIsRegisterModalOpen(false);
      setForm({ name: '', type: 'UNIVERSITY', slug: '', email: '', phone: '', address: '', website: '' });
      toast.success('School registered successfully');
      await loadSchools();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    loadSchools();
  }, [loadSchools]);

  const handleOpenApprove = (school) => {
    setSelectedSchool(school);
    setApproveForm({
      name: school.name || '',
      email: school.email || `admin@${school.slug || ''}`,
      password: '',
    });
    setIsApproveModalOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!approveForm.password.trim()) {
      toast.warning('Please set an admin password');
      return;
    }
    setIsApproving(true);
    try {
      const userResponse = await fetch(`${SCHOOL_API_BASE_URL}/${selectedSchool.id}/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: approveForm.name.trim(),
          email: approveForm.email.trim(),
          role: 'SCHOOL_ADMIN',
          password: approveForm.password,
        }),
      });
      if (!userResponse.ok) {
        const errText = await userResponse.text();
        throw new Error(`Failed to create admin user: ${userResponse.status} ${errText}`);
      }

      const statusResponse = await fetch(`${API_BASE_URL}/schools/${selectedSchool.id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status: 'ACTIVE' }),
      });
      if (!statusResponse.ok) throw new Error('Failed to activate school');

      setIsApproveModalOpen(false);
      await loadSchools();

      toast.success(`${selectedSchool.name} approved — admin user created`);

      const portalLoginUrl = `${window.location.origin}/login`;
      setSimulatedEmail({
        to: approveForm.email.trim(),
        subject: `SomaConnect Instance Approved - ${selectedSchool.name}`,
        body: `Hello ${approveForm.name.trim()},

We are pleased to inform you that your request for a SomaConnect instance for "${selectedSchool.name}" has been approved.

Your school admin portal is ready. Sign in with the following credentials:

Email: ${approveForm.email.trim()}
Password: ${approveForm.password}

Click the link below to access your school dashboard:
${portalLoginUrl}

Welcome to the SomaConnect community.

Warm regards,
SomaConnect Pilot Operations Team`
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsApproving(false);
    }
  };

  const handleOpenDelete = (school) => {
    setSchoolToDelete(school);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!schoolToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/schools/${schoolToDelete.id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete school');
      toast.success(`${schoolToDelete.name} deleted permanently`);
      setIsDeleteModalOpen(false);
      setSchoolToDelete(null);
      await loadSchools();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenReject = (school) => {
    setSelectedSchool(school);
    setIsRejectModalOpen(true);
    setRejectReason('');
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      toast.warning('Please provide a rejection reason');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/schools/${selectedSchool.id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ 
          status: 'REJECTED',
          reason: rejectReason 
        }),
      });
      if (!response.ok) throw new Error('Failed to reject school');
      
      await loadSchools();
      setIsRejectModalOpen(false);

      toast.info(`${selectedSchool.name} has been rejected`);
      
      setSimulatedEmail({
        to: selectedSchool.contactPhone ? `${selectedSchool.contactName} (${selectedSchool.contactPhone})` : 'Registrar Office',
        subject: `SomaConnect Application Status Update - ${selectedSchool.name}`,
        body: `Dear Admin of ${selectedSchool.name},

Thank you for registering for a SomaConnect institution portal.

Upon manual KYC review, we were unable to approve your registration at this time for the following reason:

- ${rejectReason}

To re-apply or appeal this decision, please reply to this email with official accreditation documentation (such as a school charter or registrar license).

Best regards,
SomaConnect Operations Compliance`
      });
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-8 antialiased">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5b6b12] bg-[#d0f24a]/20 px-2.5 py-1 rounded">
            Internal Controls
          </span>
          <h1 className="text-[19px] font-medium tracking-tight mt-2 text-slate-900">
            School Review Panel
          </h1>
          <p className="text-xs text-slate-500">
            Verify credentials and approve official school domain registries in Rwanda (KYC Checks).
          </p>
        </div>
      </div>

      {simulatedEmail && (
        <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-5 space-y-3 relative overflow-hidden animate-pulse text-white">
          <div className="absolute top-0 left-0 w-1 bg-green-500 h-full" />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-green-400 font-semibold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
              </svg>
              <span>Automated Email Dispatched</span>
            </div>
            <button 
              onClick={() => setSimulatedEmail(null)} 
              className="text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          </div>
          <div className="text-xs space-y-1 font-mono bg-slate-950 p-3.5 rounded border border-slate-800 text-slate-300">
            <p><strong>To:</strong> {simulatedEmail.to}</p>
            <p><strong>Subject:</strong> {simulatedEmail.subject}</p>
            <hr className="border-slate-800 my-2" />
            <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-400">
              {simulatedEmail.body}
            </pre>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">
              Registration Queue ({schools.filter(s => s.status === 'PENDING').length} Pending)
            </h3>
            <button
              onClick={() => {
                {/* cleared via toast */}
                setIsRegisterModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#1b1e26] hover:bg-black text-xs font-bold text-white rounded-xl transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Register School
            </button>
          </div>

          {schools.length === 0 ? (
            <div className="bg-slate-50 p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
              No school registrations found.
            </div>
          ) : (
            <div className="space-y-3">
              {schools.map((school) => (
                <div
                  key={school.id}
                  className="p-5 bg-white border border-slate-200 rounded-xl hover:border-[#d0f24a]/50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2.5">
                      <h4 className="text-base font-bold text-slate-900">{school.name}</h4>
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider ${
                        school.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border border-green-200' :
                        school.status === 'APPROVED' ? 'bg-[#d0f24a]/20 text-[#5b6b12] border border-[#d0f24a]/50' :
                        school.status === 'REJECTED' ? 'bg-red-100 text-red-700 border border-red-200' :
                        'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {school.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center">
                        <strong className="text-slate-700 font-semibold mr-1">Email:</strong> {school.email || '---'}
                      </span>
                      <span>•</span>
                      <span className="uppercase font-mono text-[10px]">{school.type}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 pt-1">
                      {school.website || school.address || ''}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-stretch md:self-auto justify-end shrink-0">
                    {school.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleOpenApprove(school)}
                          className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-xs font-bold rounded text-white transition-all"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleOpenReject(school)}
                          className="px-4 py-1.5 bg-red-50 hover:bg-red-100 text-xs font-bold rounded text-red-600 border border-red-200 transition-all"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleOpenDelete(school)}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-all"
                      title="Delete school"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h18z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Registry Metrics
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
              <span className="text-slate-500">Total Registered</span>
              <span className="font-bold text-slate-900">{schools.length}</span>
            </div>
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
              <span className="text-slate-500">Approved (Pending Setup)</span>
              <span className="font-bold text-[#5b6b12]">
                {schools.filter(s => s.status === 'APPROVED').length}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
              <span className="text-slate-500">Active (Live)</span>
              <span className="font-bold text-green-600">
                {schools.filter(s => s.status === 'ACTIVE').length}
              </span>
            </div>
          </div>

          <div className="p-4 bg-[#d0f24a]/20 border border-[#d0f24a]/50 rounded-lg space-y-2">
            <h4 className="text-xs font-bold text-[#5b6b12]">Manual review protocol:</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Confirm domain records match official high-level registrar tables from UR/IPRC or HECC/WDA databases before clicking Approve.
            </p>
          </div>
        </div>
      </div>

      {isRegisterModalOpen && createPortal(
        <div className="fixed inset-0 w-full h-full min-h-screen bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[50]">
          <div className="absolute inset-0" onClick={() => setIsRegisterModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-xl p-6 shadow-2xl z-10 space-y-5">
            <div>
              <h3 className="text-[15px] font-semibold text-slate-900">Register New School</h3>
              <p className="text-xs text-slate-500">Create a new institution on the platform.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">School Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. University of Kigali" className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs p-2.5 focus:outline-none focus:border-[#d0f24a] text-slate-900 placeholder-slate-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Slug *</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="e.g. university-of-kigali" className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs p-2.5 focus:outline-none focus:border-[#d0f24a] text-slate-900 placeholder-slate-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs p-2.5 focus:outline-none focus:border-[#d0f24a] text-slate-900">
                  <option value="UNIVERSITY">University</option>
                  <option value="SECONDARY">Secondary School</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Email</label>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@school.rw" className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs p-2.5 focus:outline-none focus:border-[#d0f24a] text-slate-900 placeholder-slate-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+250 7XX XXX XXX" className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs p-2.5 focus:outline-none focus:border-[#d0f24a] text-slate-900 placeholder-slate-400" />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Address</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Kigali, Rwanda" className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs p-2.5 focus:outline-none focus:border-[#d0f24a] text-slate-900 placeholder-slate-400" />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Website</label>
                <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://school.rw" className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs p-2.5 focus:outline-none focus:border-[#d0f24a] text-slate-900 placeholder-slate-400" />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-medium rounded-lg text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRegister}
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#1b1e26] hover:bg-black text-xs font-medium rounded-lg text-white disabled:opacity-50"
              >
                {isSubmitting ? 'Registering...' : 'Register'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {isApproveModalOpen && selectedSchool && createPortal(
        <div className="fixed inset-0 w-full h-full min-h-screen bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[50]">
          <div className="absolute inset-0" onClick={() => setIsApproveModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 shadow-2xl z-10 space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Approve &amp; Create Admin</h3>
              <p className="text-xs text-slate-500">Set up the school admin account for {selectedSchool.name}.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Admin Name</label>
                <input
                  type="text"
                  value={approveForm.name}
                  onChange={(e) => setApproveForm({ ...approveForm, name: e.target.value })}
                  placeholder="e.g. Jean Bosco"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs px-3 py-2.5 focus:outline-none focus:border-blue-500 text-slate-900 placeholder-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Admin Email</label>
                <input
                  type="email"
                  value={approveForm.email}
                  onChange={(e) => setApproveForm({ ...approveForm, email: e.target.value })}
                  placeholder="admin@school.rw"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs px-3 py-2.5 focus:outline-none focus:border-blue-500 text-slate-900 placeholder-slate-400"
                />
                <p className="text-[9px] text-slate-400">Must match the email used during registration.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  value={approveForm.password}
                  onChange={(e) => setApproveForm({ ...approveForm, password: e.target.value })}
                  placeholder="Set admin password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs px-3 py-2.5 focus:outline-none focus:border-blue-500 text-slate-900 placeholder-slate-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsApproveModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-medium rounded-lg text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApproveConfirm}
                disabled={isApproving}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-xs font-medium rounded-lg text-white disabled:opacity-50"
              >
                {isApproving ? 'Creating Admin...' : 'Approve &amp; Create Admin'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSchoolToDelete(null); }}
        onConfirm={handleDeleteConfirm}
        title="Delete School"
        message="You are about to permanently delete this school. All associated data including users, courses, classes, and financial records will be permanently removed from the system. This cannot be reversed."
        itemName={schoolToDelete?.name}
        isLoading={isDeleting}
      />

      {isRejectModalOpen && selectedSchool && createPortal(
        <div className="fixed inset-0 w-full h-full min-h-screen bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[50]">
          <div className="absolute inset-0" onClick={() => setIsRejectModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 shadow-2xl z-10 space-y-4">
            <div>
              <h3 className="text-[15px] font-semibold text-slate-900">Reject Registry Application</h3>
              <p className="text-xs text-slate-500">Provide feedback explanation for {selectedSchool.name}.</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Reason for Rejection</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Email domain '@gmail.com' does not represent an official university registry..."
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs p-3 focus:outline-none focus:border-[#d0f24a] text-slate-900 placeholder-slate-400 resize-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-medium rounded-lg text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-xs font-medium rounded-lg text-white"
              >
                Send Rejection
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
