import React, { useState } from 'react';
import { AuthRecoveryShell } from '../components/AuthRecoveryShell';
import { ForgotPasswordForm, FORGOT_PASSWORD_STEPS, FORGOT_PASSWORD_STEP_ORDER } from '../components/ForgotPasswordForm';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState('email');

  return (
    <AuthRecoveryShell
      copy={FORGOT_PASSWORD_STEPS[step]}
      stepKey={step}
      stepIndex={FORGOT_PASSWORD_STEP_ORDER.indexOf(step)}
      stepCount={FORGOT_PASSWORD_STEP_ORDER.length}
    >
      <ForgotPasswordForm onStepChange={setStep} />
    </AuthRecoveryShell>
  );
};

export default ForgotPasswordPage;
