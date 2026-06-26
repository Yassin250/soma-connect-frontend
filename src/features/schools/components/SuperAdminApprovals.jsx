import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockDb } from '../../../services/mockDb';

export const SuperAdminApprovals = () => {
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [simulatedEmail, setSimulatedEmail] = useState(null);
  const navigate = useNavigate();

  const loadSchools = () => {
    setSchools(mockDb.getSchools());
  };

  useEffect(() => {
    loadSchools();
  }, []);

  const handleApprove = (id) => {
    try {
      const updated = mockDb.updateSchoolStatus(id, 'APPROVED');
      const portalLoginUrl = `${window.location.origin}/login`;
      loadSchools();
      
      // Simulate sending approval onboarding email
      setSimulatedEmail({
        to: `admin@${updated.domain}`,
        subject: `SomaConnect Instance Approved - ${updated.name}`,
        body: `Hello ${updated.contactName},\n\nWe are pleased to inform you that your request for a SomaConnect instance for "${updated.name}" has been approved.\n\nYour school admin portal is ready for setup. Please sign in with the following credentials to initialize your platform:\n\nEmail: admin@${updated.domain}\nTemporary Password: AdminPassword123\n\nClick the link below to configure your school profile, invite lecturers, and sync student CSV spreadsheets:\n${portalLoginUrl}\n\nWelcome to the SomaConnect community.\n\nWarm regards,\nSomaConnect Pilot Operations Team`
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

  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) return;
    
    try {
      // For mock purposes, update school status to REJECTED
      mockDb.updateSchoolStatus(selectedSchool.id, 'REJECTED');
      loadSchools();
      setIsRejectModalOpen(false);

      // Simulate sending rejection email
      setSimulatedEmail({
        to: selectedSchool.contactPhone ? `${selectedSchool.contactName} (${selectedSchool.contactPhone})` : 'Registrar Office',
        subject: `SomaConnect Application Status Update - ${selectedSchool.name}`,
        body: `Dear Admin of ${selectedSchool.name},\n\nThank you for registering for a SomaConnect institution portal.\n\nUpon manual KYC review, we were unable to approve your registration at this time for the following reason:\n\n- ${rejectReason}\n\nTo re-apply or appeal this decision, please reply to this email with official accreditation documentation (such as a school charter or registrar license).\n\nBest regards,\nSomaConnect Operations Compliance`
      });
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white p-6 md:p-12 antialiased">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded">
              Internal Controls
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight mt-2 text-white">
              SomaConnect Platform Review Panel
            </h1>
            <p className="text-xs text-slate-400">
              Verify credentials and approve official school domain registries in Rwanda (KYC Checks).
            </p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg transition-all"
          >
            Go to Portal Login
          </button>
        </div>

        {/* Email Simulation Alert */}
        {simulatedEmail && (
          <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-5 space-y-3 relative overflow-hidden animate-pulse">
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

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Schools Queue */}
          <div className="lg:col-span-8 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
              Registration Queue ({schools.filter(s => s.status === 'PENDING').length} Pending)
            </h3>

            {schools.length === 0 ? (
              <div className="bg-slate-900/40 p-8 rounded-xl border border-slate-800 text-center text-slate-500 text-xs">
                No school registrations registered. Try going to the registration form first.
              </div>
            ) : (
              <div className="space-y-3">
                {schools.map((school) => (
                  <div
                    key={school.id}
                    className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2.5">
                        <h4 className="text-base font-bold text-white">{school.name}</h4>
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider ${
                          school.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          school.status === 'APPROVED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          school.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {school.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span className="flex items-center">
                          <strong className="text-slate-300 font-semibold mr-1">Domain:</strong> @{school.domain}
                        </span>
                        <span>•</span>
                        <span>{school.location}</span>
                        <span>•</span>
                        <span className="uppercase font-mono text-[10px]">{school.type}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 pt-1">
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
                          className="px-4 py-1.5 bg-red-900/50 hover:bg-red-950 text-xs font-bold rounded text-red-400 border border-red-900 transition-all"
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

          {/* Quick Stats sidebar */}
          <div className="lg:col-span-4 space-y-6 bg-slate-900/30 p-6 rounded-xl border border-slate-800/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pilot Registry Metrics
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
                <span className="text-slate-400">Total Registered</span>
                <span className="font-bold text-white">{schools.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
                <span className="text-slate-400">Approved (Pending Setup)</span>
                <span className="font-bold text-blue-400">
                  {schools.filter(s => s.status === 'APPROVED').length}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
                <span className="text-slate-400">Active (Live)</span>
                <span className="font-bold text-green-400">
                  {schools.filter(s => s.status === 'ACTIVE').length}
                </span>
              </div>
            </div>

            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-lg space-y-2">
              <h4 className="text-xs font-bold text-blue-400">Manual review protocol:</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Confirm domain records match official high-level registrar tables from UR/IPRC or HECC/WDA databases before clicking Approve.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Rejection Modal */}
      {isRejectModalOpen && selectedSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsRejectModalOpen(false)} />
          <div className="relative w-full max-w-md bg-[#0c1226] border border-slate-800 rounded-xl p-6 shadow-2xl z-10 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white">Reject Registry Application</h3>
              <p className="text-xs text-slate-400">Provide feedback explanation for {selectedSchool.name}.</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Reason for Rejection</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Email domain '@gmail.com' does not represent an official university or TVET registry. Please re-register with your academic domain."
                rows={4}
                className="w-full bg-[#141c33] border border-slate-800 rounded-lg text-xs p-3 focus:outline-none focus:border-blue-500 text-white placeholder-slate-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg text-slate-300"
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
