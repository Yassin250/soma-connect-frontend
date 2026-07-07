import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

const REFRESH_ENDPOINT = 'http://localhost:5050/admin/auth/refresh-token';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('soma_token');
    const storedUser = localStorage.getItem('soma_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (newToken, newUser) => {
    localStorage.setItem('soma_token', newToken);
    localStorage.setItem('soma_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('soma_token');
    localStorage.removeItem('soma_user');
    localStorage.removeItem('soma_refresh_token');
    setToken(null);
    setUser(null);
  };

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('soma_refresh_token');
    if (!refreshToken) {
      logout();
      return null;
    }
    try {
      const response = await fetch(REFRESH_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!response.ok) {
        logout();
        return null;
      }
      const data = await response.json();
      const newToken = data.token || data.data?.token;
      if (!newToken) {
        logout();
        return null;
      }
      localStorage.setItem('soma_token', newToken);
      setToken(newToken);
      return newToken;
    } catch {
      logout();
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, refreshAccessToken }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};