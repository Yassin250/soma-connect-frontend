import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export const SchoolApprovalsPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const API_BASE_URL = 'http://localhost:5050/api/admin';

  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [simulatedEmail, setSimulatedEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  const loadSchools = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/schools`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error(`Failed to fetch schools: ${response.status}`);
      const data = await response.json();
      setSchools(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    loadSchools();
  }, [loadSchools]);

  const handleApprove = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/schools/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status: 'APPROVED' }),
      });
      if (!response.ok) throw new Error('Failed to approve school');
      
      const updated = await response.json();
      const schoolData = updated.data || updated;
      
      const portalLoginUrl = `${window.location.origin}/login`;
      await loadSchools();
      
      setSimulatedEmail({
        to: `admin@${schoolData.domain}`,
        subject: `SomaConnect Instance Approved - ${schoolData.name}`,
        body: `Hello ${schoolData.contactName},

We are pleased to inform you that your request for a SomaConnect instance for "${schoolData.name}" has been approved.

Your school admin portal is ready for setup. Please sign in with the following credentials to initialize your platform:

Email: admin@${schoolData.domain}
Temporary Password: AdminPassword123

Click the link below to configure your school profile, invite lecturers, and sync student CSV spreadsheets:
${portalLoginUrl}

Welcome to the SomaConnect community.

Warm regards,
SomaConnect Pilot Operations Team`
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOpenReject = (school) => {
    setSelectedSchool(school);
    setIsRejectModalOpen(true);
    setRejectReason('');
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) return;
    
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
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8 antialiased">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded">
            Internal Controls
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2 text-slate-900">
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
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">
            Registration Queue ({schools.filter(s => s.status === 'PENDING').length} Pending)
          </h3>

          {schools.length === 0 ? (
            <div className="bg-slate-50 p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
              No school registrations found.
            </div>
          ) : (
            <div className="space-y-3">
              {schools.map((school) => (
                <div
                  key={school.id}
                  className="p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-300 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2.5">
                      <h4 className="text-base font-bold text-slate-900">{school.name}</h4>
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider ${
                        school.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border border-green-200' :
                        school.status === 'APPROVED' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                        school.status === 'REJECTED' ? 'bg-red-100 text-red-700 border border-red-200' :
                        'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {school.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center">
                        <strong className="text-slate-700 font-semibold mr-1">Domain:</strong> @{school.domain}
                      </span>
                      <span>•</span>
                      <span>{school.location}</span>
                      <span>•</span>
                      <span className="uppercase font-mono text-[10px]">{school.type}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 pt-1">
                      Contact: {school.contactName} ({school.contactPhone})
                    </div>
                  </div>

                  {school.status === 'PENDING' && (
                    <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
                      <button
                        onClick={() => handleApprove(school.id)}
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
                    </div>
                  )}
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
              <span className="font-bold text-blue-600">
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

          <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg space-y-2">
            <h4 className="text-xs font-bold text-blue-700">Manual review protocol:</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Confirm domain records match official high-level registrar tables from UR/IPRC or HECC/WDA databases before clicking Approve.
            </p>
          </div>
        </div>
      </div>

      {isRejectModalOpen && selectedSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsRejectModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 shadow-2xl z-10 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Reject Registry Application</h3>
              <p className="text-xs text-slate-500">Provide feedback explanation for {selectedSchool.name}.</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Reason for Rejection</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Email domain '@gmail.com' does not represent an official university registry..."
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs p-3 focus:outline-none focus:border-blue-500 text-slate-900 placeholder-slate-400 resize-none"
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
        </div>
      )}
    </div>
  );
};
