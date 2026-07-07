import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

const REFRESH_ENDPOINT = 'http://localhost:5050/admin/auth/refresh-token';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const storedToken = localStorage.getItem('soma_token');
        const storedUser = localStorage.getItem('soma_user');
        if (!storedToken || !storedUser) {
          setLoading(false);
          return;
        }
        let parsedUser;
        try {
          parsedUser = JSON.parse(storedUser);
        } catch {
          localStorage.removeItem('soma_token');
          localStorage.removeItem('soma_user');
          localStorage.removeItem('soma_refresh_token');
          setLoading(false);
          return;
        }
        setToken(storedToken);
        setUser(parsedUser);
        // Try to silently refresh the token in case it's expired
        const refreshToken = localStorage.getItem('soma_refresh_token');
        if (refreshToken) {
          try {
            const response = await fetch(REFRESH_ENDPOINT, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });
            if (response.ok) {
              const data = await response.json();
              const newToken = data.token || data.data?.token;
              if (newToken) {
                localStorage.setItem('soma_token', newToken);
                setToken(newToken);
              }
            }
          } catch {
            // Refresh failed but we still have the old token — let it try
          }
        }
      } finally {
        setLoading(false);
      }
    };
    init();
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
      {loading ? (
        <div className="w-screen h-screen bg-[#0a0f1d] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-400 font-medium">Loading...</p>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};