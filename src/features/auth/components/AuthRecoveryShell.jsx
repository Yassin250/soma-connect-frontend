import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BrandLockup } from '../../../components/shared/Brand';

/**
 * Split-panel shell for the account-recovery pages (forgot / reset password).
 * Mirrors LoginPage's layout exactly — dark ink brand panel with diagonal edge
 * and lime accents on the left, white form panel on the right — so the whole
 * auth journey reads as one continuous surface.
 *
 * The left copy is step-driven: pass the active step's { eyebrow, heading, sub }
 * plus the tracker position and the form as children.
 */
export const AuthRecoveryShell = ({ copy, stepKey, stepIndex, stepCount, children }) => {
  const year = new Date().getFullYear();

  return (
    <div className="h-screen w-full flex bg-white antialiased overflow-hidden">

      {/* Left — full-bleed dark brand panel with diagonal edge (same as LoginPage) */}
      <div className="hidden md:flex md:w-[52%] relative flex-col justify-between bg-gradient-to-br from-[#0A0A0A] via-[#0d0d12] to-[#08080a] text-white p-12 lg:p-20 overflow-hidden [clip-path:polygon(0_0,100%_0,90%_100%,0_100%)] z-10">
        {/* Ambient glow — lime brand accent up top, cool depth toward the middle */}
        <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-[#3D7FFF]/20 blur-[100px]" />
        <div className="absolute top-1/3 right-0 w-72 h-72 rounded-full bg-[#0A0A0A]/40 blur-[100px]" />

        {/* Floating glass shapes near the diagonal */}
        <div className="absolute top-[16%] right-[7%] w-44 h-44 rounded-[2.5rem] border border-white/10 rotate-[18deg]" />
        <div className="absolute top-[29%] right-[15%] w-24 h-24 rounded-[1.5rem] bg-white/[0.05] backdrop-blur-md -rotate-6" />
        <div className="absolute top-[23%] right-[3%] w-11 h-11 rounded-2xl bg-[#3D7FFF]/25 rotate-12" />
        <div className="absolute bottom-24 left-6 w-24 h-24 rounded-full border border-white/[0.08]" />

        <div className="relative z-10">
          <Link to="/" className="inline-block" aria-label="Go to Soma Connect landing page">
            <span style={{ '--clr-accent': '#3D7FFF' }}><BrandLockup /></span>
          </Link>
        </div>

        {/* Step-driven headline */}
        <div className="relative z-10 max-w-xl space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepKey}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="space-y-6"
            >
              <p className="text-[11px] font-semibold text-[#3D7FFF]/80 uppercase tracking-[0.22em]">
                {copy.eyebrow}
              </p>
              <h1 className="text-[2.75rem] xl:text-[3.5rem] font-semibold tracking-tight leading-[1.12]">
                {copy.heading}
              </h1>
              <p className="text-white/60 text-base lg:text-lg leading-relaxed max-w-md">
                {copy.sub}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Step tracker pills — lime marks the active step */}
          <div className="flex items-center gap-2">
            {Array.from({ length: stepCount }, (_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === stepIndex
                    ? 'w-10 bg-[#3D7FFF]'
                    : i < stepIndex
                    ? 'w-5 bg-[#3D7FFF]/40'
                    : 'w-5 bg-white/15'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-xs text-white/35">© {year} Soma Connect Platform. All rights reserved.</p>
        </div>
      </div>

      {/* Right — form panel, fills remaining height (same as LoginPage) */}
      <div className="w-full md:w-[48%] flex flex-col justify-center p-8 sm:p-16 lg:px-24 bg-white overflow-y-auto">
        {/* Mobile-only brand mark (left panel is hidden below md) */}
        <div className="md:hidden mb-10">
          <Link to="/" className="inline-block" aria-label="Go to Soma Connect landing page">
            <span style={{ '--clr-accent': '#3D7FFF' }}><BrandLockup dark /></span>
          </Link>
        </div>

        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="w-full max-w-md mx-auto"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthRecoveryShell;
