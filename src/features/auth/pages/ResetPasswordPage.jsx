import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthRecoveryShell } from '../components/AuthRecoveryShell';
import { ForgotPasswordForm, FORGOT_PASSWORD_STEPS, FORGOT_PASSWORD_STEP_ORDER } from '../components/ForgotPasswordForm';

/**
 * Landing page for the reset link emailed to the user
 * (e.g. /reset-password?token=abc123). It drops the shared form straight into
 * the "set new password" step with the token prefilled.
 */
const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';
  const [step, setStep] = useState('reset');
  const copy = FORGOT_PASSWORD_STEPS[step] ?? FORGOT_PASSWORD_STEPS.reset;

  return (
    <AuthRecoveryShell
      copy={copy}
      stepKey={step}
      stepIndex={FORGOT_PASSWORD_STEP_ORDER.indexOf(step)}
      stepCount={FORGOT_PASSWORD_STEP_ORDER.length}
    >
      <ForgotPasswordForm onStepChange={setStep} initialStep="reset" initialToken={tokenFromUrl} />
    </AuthRecoveryShell>
  );
};

export default ResetPasswordPage;
