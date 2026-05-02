import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

const loadStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  // Sync guest cart after login
  const syncGuestCart = useCallback(async () => {
    try {
      const raw = localStorage.getItem('guest_cart');
      if (!raw) return;
      const items = JSON.parse(raw);
      if (!Array.isArray(items) || items.length === 0) return;
      await api.post('/api/Cart/sync', { items });
      localStorage.removeItem('guest_cart');
    } catch { /* ignore sync errors */ }
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/api/Auth/login', { email, password });
    setToken(data.token);
    setUser({ email: data.email, fullName: data.fullName, role: data.role });
    // Sync guest cart after login
    setTimeout(syncGuestCart, 100);
  }, [syncGuestCart]);

  const register = useCallback(async (email, fullName, password) => {
    const { data } = await api.post('/api/Auth/register', { email, fullName, password });
    setToken(data.token);
    setUser({ email: data.email, fullName: data.fullName, role: data.role });
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, isAuthenticated: !!token, isAdmin: user?.role === 'Admin', login, register, logout }),
    [user, token, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
