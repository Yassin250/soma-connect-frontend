import React, { useState } from 'react';
import logo from '../../../assets/2.png';
import { motion, AnimatePresence } from 'framer-motion';
import { ForgotPasswordForm, FORGOT_PASSWORD_STEPS } from '../components/ForgotPasswordForm';

const STEP_ORDER = ['email', 'otp', 'newPassword'];

const ForgotPasswordPage = () => {
  const [step, setStep] = useState('email');
  const copy = FORGOT_PASSWORD_STEPS[step];
  const stepIndex = STEP_ORDER.indexOf(step);

  return (
    <div className="min-h-screen w-full flex bg-white font-sans antialiased select-none">

      {/* Left panel — same blue split-panel as LoginPage, copy reacts to step */}
      <div className="hidden md:flex relative flex-col justify-center items-center w-3/5 bg-[#1660FF] text-white p-20 [clip-path:polygon(0_0,100%_0,88%_100%,0_100%)] z-10 overflow-hidden">
        <div className="absolute top-[20%] right-[20%] w-32 h-32 bg-white/10 rounded-3xl rotate-12 backdrop-blur-md animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="absolute bottom-[20%] left-[10%] w-20 h-20 bg-cyan-400/20 rounded-full backdrop-blur-md animate-[bounce_8s_ease-in-out_infinite]" />
        <div className="absolute top-12 left-12">
          <img src={logo} alt="SomaConnect" className="h-12 w-auto object-contain brightness-0 invert" />
        </div>

        <div className="max-w-md text-left transform -translate-x-10 space-y-6 relative z-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-blue-100/70 mb-3">
                {copy.eyebrow}
              </p>
              <h2 className="text-5xl font-extrabold tracking-tight leading-tight">
                {copy.heading}
              </h2>
              <p className="text-blue-100/80 text-base leading-relaxed font-medium mt-4">
                {copy.sub}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Step tracker — reuses the panel's own decorative-shape language
              (rounded pill, soft fill) instead of a generic progress bar */}
          <div className="flex items-center gap-2 pt-6 relative z-20">
            {STEP_ORDER.map((s, i) => (
              <span
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === stepIndex
                    ? 'w-10 bg-white'
                    : i < stepIndex
                    ? 'w-5 bg-white/50'
                    : 'w-5 bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form, same corner/position as LoginForm */}
      <div className="w-full md:w-2/5 flex flex-col justify-center p-8 sm:p-16 lg:px-20 bg-white">
        <motion.div
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-[400px] mx-auto"
        >
          <ForgotPasswordForm onStepChange={setStep} />
          <div className="mt-12" />
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;