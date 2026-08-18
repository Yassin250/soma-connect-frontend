import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppRouter } from './routes/AppRouter';

const themeVars = `
:root {
  --clr-accent: #8B5CF6;
  --clr-accent-hover: #A78BFA;
  --clr-accent-dark: #7C3AED;
  --clr-accent-text: #FFFFFF;
  --clr-accent-surface: rgba(139,92,246,0.22);
  --clr-accent-ring: rgba(139,92,246,0.25);
  --clr-accent-glow: rgba(139,92,246,0.35);
  --clr-accent-10: rgba(139,92,246,0.10);
  --clr-accent-15: rgba(139,92,246,0.15);
  --clr-accent-20: rgba(139,92,246,0.20);
  --clr-accent-6: rgba(139,92,246,0.06);
}
.theme-school {
  --clr-accent: #10B981;
  --clr-accent-hover: #34D399;
  --clr-accent-dark: #059669;
  --clr-accent-text: #FFFFFF;
  --clr-accent-surface: rgba(16,185,129,0.22);
  --clr-accent-ring: rgba(16,185,129,0.25);
  --clr-accent-glow: rgba(16,185,129,0.35);
  --clr-accent-10: rgba(16,185,129,0.10);
  --clr-accent-15: rgba(16,185,129,0.15);
  --clr-accent-20: rgba(16,185,129,0.20);
  --clr-accent-6: rgba(16,185,129,0.06);
}
.theme-learner {
  --clr-accent: #C6FF34;
  --clr-accent-hover: #d4ff66;
  --clr-accent-dark: #aaee00;
  --clr-accent-text: #171717;
  --clr-accent-surface: rgba(198,255,52,0.22);
  --clr-accent-ring: rgba(198,255,52,0.25);
  --clr-accent-glow: rgba(198,255,52,0.35);
  --clr-accent-10: rgba(198,255,52,0.10);
  --clr-accent-15: rgba(198,255,52,0.15);
  --clr-accent-20: rgba(198,255,52,0.20);
  --clr-accent-6: rgba(198,255,52,0.06);
}
.theme-lecturer {
  --clr-accent: #3D7FFF;
  --clr-accent-hover: #5C96FF;
  --clr-accent-dark: #2A6BE0;
  --clr-accent-text: #FFFFFF;
  --clr-accent-surface: rgba(61,127,255,0.22);
  --clr-accent-ring: rgba(61,127,255,0.25);
  --clr-accent-glow: rgba(61,127,255,0.35);
  --clr-accent-10: rgba(61,127,255,0.10);
  --clr-accent-15: rgba(61,127,255,0.15);
  --clr-accent-20: rgba(61,127,255,0.20);
  --clr-accent-6: rgba(61,127,255,0.06);
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