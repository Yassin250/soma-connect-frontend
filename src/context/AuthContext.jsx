import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(undefined);

let logoutHandler = null;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('soma_token');
    const storedUser = localStorage.getItem('soma_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('soma_token');
        localStorage.removeItem('soma_user');
        localStorage.removeItem('soma_refresh_token');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((newToken, newUser) => {
    localStorage.setItem('soma_token', newToken);
    localStorage.setItem('soma_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('soma_token');
    localStorage.removeItem('soma_user');
    localStorage.removeItem('soma_refresh_token');
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, token, login, logout, loading }), [user, token, login, logout, loading]);

  logoutHandler = logout;

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const getLogoutHandler = () => logoutHandler;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
