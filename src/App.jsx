import React, { useState } from 'react';
import { LoginPage } from './features/auth/pages/LoginPage';
import { UserManagementPage } from './features/admin/pages/UserManagementPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Clean state switch: only triggers when LoginForm explicitly says it's ok!
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // Pass the logout handler down to your authenticated view
  return <UserManagementPage onLogout={() => setIsAuthenticated(false)} />;
}

export default App;