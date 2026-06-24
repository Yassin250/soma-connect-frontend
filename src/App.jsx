import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppRouter } from './routes/AppRouter';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Clean state switch: only triggers when LoginForm explicitly says it's ok!
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // Pass the logout handler down to your authenticated view
  return <UserManagementPage onLogout={() => setIsAuthenticated(false)} />;
}

export default App;