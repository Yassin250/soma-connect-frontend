import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { BrandLockup } from '../../../components/shared/Brand';

/**
 * Full-screen gate shown to an entity administrator whose institution has not
 * yet been approved (PENDING) or was turned down (REJECTED). They can sign in,
 * but the school portal stays locked until a super admin decides.
 */
export const BlockedScreen = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const status = user?.entityApprovalStatus;
  const rejected = status === 'REJECTED';
  const reason = user?.entityRejectionReason;

  const handleSignOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0A0A0A] via-[#0d0d12] to-[#08080a] p-6 overflow-hidden relative">
      <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-[#3D7FFF]/15 blur-[100px]" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#3D7FFF]/[0.08] blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <BrandLockup />
        </div>

        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl text-center">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mx-auto mb-5 ${
              rejected ? 'bg-red-500/15 text-red-400' : 'bg-amber-400/15 text-amber-300'
            }`}
          >
            {rejected ? (
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <line x1="15" y1="9" x2="9" y2="15" strokeLinecap="round" />
                <line x1="9" y1="9" x2="15" y2="15" strokeLinecap="round" />
              </svg>
            ) : (
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>

          <h1 className="text-xl font-semibold text-white tracking-tight">
            {rejected ? 'Registration Not Approved' : 'Registration Under Review'}
          </h1>

          {user?.entityName && (
            <p className="text-white/50 text-sm mt-1.5">{user.entityName}</p>
          )}

          <p className="text-white/60 text-sm leading-relaxed mt-4">
            {rejected
              ? 'Your institution was not approved by the platform administrator. If you believe this is an error, contact support with the reason below.'
              : 'Your institution registration has been received and is awaiting review by a platform administrator. You will be able to access your portal once it is approved.'}
          </p>

          {rejected && reason && (
            <div className="mt-5 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-400/80 mb-1.5">
                Reason for rejection
              </p>
              <p className="text-sm text-white/80 leading-relaxed">{reason}</p>
            </div>
          )}

          <button
            onClick={handleSignOut}
            className="mt-7 w-full px-4 py-2.5 rounded-xl bg-white text-[#0A0A0A] text-sm font-semibold hover:bg-white/90 transition-colors"
          >
            Sign out
          </button>
        </div>

        <p className="text-center text-xs text-white/30 mt-6">© {new Date().getFullYear()} Soma Connect Platform</p>
      </div>
    </div>
  );
};

export default BlockedScreen;