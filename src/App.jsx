import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppRouter } from './routes/AppRouter';

const themeVars = `
:root {
  --clr-accent: #d0f24a;
  --clr-accent-hover: #c4e83a;
  --clr-accent-dark: #a3d420;
  --clr-accent-text: #5b6b12;
  --clr-accent-surface: rgba(208,242,74,0.22);
  --clr-accent-ring: rgba(208,242,74,0.25);
  --clr-accent-glow: rgba(208,242,74,0.35);
  --clr-accent-10: rgba(208,242,74,0.10);
  --clr-accent-15: rgba(208,242,74,0.15);
  --clr-accent-20: rgba(208,242,74,0.20);
  --clr-accent-6: rgba(208,242,74,0.06);
}
.theme-school {
  --clr-accent: #22c55e;
  --clr-accent-hover: #4ade80;
  --clr-accent-dark: #16a34a;
  --clr-accent-text: #166534;
  --clr-accent-surface: rgba(34,197,94,0.22);
  --clr-accent-ring: rgba(34,197,94,0.25);
  --clr-accent-glow: rgba(34,197,94,0.35);
  --clr-accent-10: rgba(34,197,94,0.10);
  --clr-accent-15: rgba(34,197,94,0.15);
  --clr-accent-20: rgba(34,197,94,0.20);
  --clr-accent-6: rgba(34,197,94,0.06);
}
.theme-learner {
  --clr-accent: #f59e0b;
  --clr-accent-hover: #fbbf24;
  --clr-accent-dark: #d97706;
  --clr-accent-text: #92400e;
  --clr-accent-surface: rgba(245,158,11,0.22);
  --clr-accent-ring: rgba(245,158,11,0.25);
  --clr-accent-glow: rgba(245,158,11,0.35);
  --clr-accent-10: rgba(245,158,11,0.10);
  --clr-accent-15: rgba(245,158,11,0.15);
  --clr-accent-20: rgba(245,158,11,0.20);
  --clr-accent-6: rgba(245,158,11,0.06);
}
.theme-lecturer {
  --clr-accent: #0ea5e9;
  --clr-accent-hover: #38bdf8;
  --clr-accent-dark: #0284c7;
  --clr-accent-text: #075985;
  --clr-accent-surface: rgba(14,165,233,0.22);
  --clr-accent-ring: rgba(14,165,233,0.25);
  --clr-accent-glow: rgba(14,165,233,0.35);
  --clr-accent-10: rgba(14,165,233,0.10);
  --clr-accent-15: rgba(14,165,233,0.15);
  --clr-accent-20: rgba(14,165,233,0.20);
  --clr-accent-6: rgba(14,165,233,0.06);
}
`;

function App() {
  return (
    <>
      <style>{themeVars}</style>
      <AuthProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </AuthProvider>
    </>
  );
}

export default App;