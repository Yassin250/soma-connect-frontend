import React, { createContext, useContext, useState, useEffect } from 'react';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from '../services/apiClient';

const AuthContext = createContext(undefined);

// Decode a JWT payload without a library. Returns null on any malformed token.
const decodeJwt = (token) => {
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(normalized);
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
};

// A token is usable only if it decodes and hasn't hit its `exp` (seconds).
export const isTokenValid = (token) => {
  if (!token) return false;
  const claims = decodeJwt(token);
  if (!claims || !claims.exp) return false;
  return claims.exp * 1000 > Date.now();
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    // Only restore a session when the access token is present AND still valid.
    // A stale/expired token used to slip through here and drop the user straight
    // into the app — now we clear it and fall back to the login screen.
    if (storedToken && storedUser && isTokenValid(storedToken)) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    setLoading(false);
  }, []);

  const login = (newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = Boolean(token && user && isTokenValid(token));

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
