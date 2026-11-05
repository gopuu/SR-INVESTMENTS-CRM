import React, { createContext, useContext, useState, useEffect } from 'react';
import { crmApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sr_crm_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [rights, setRights] = useState(() => {
    try {
      const saved = localStorage.getItem('sr_crm_auth_rights');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await crmApi.call('login', { email, password });
      setUser(res.user);
      setRights(res.rights || []);
      localStorage.setItem('sr_crm_auth_user', JSON.stringify(res.user));
      localStorage.setItem('sr_crm_auth_rights', JSON.stringify(res.rights || []));
      localStorage.setItem('sr_crm_auth_token', res.token);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setRights([]);
    localStorage.removeItem('sr_crm_auth_user');
    localStorage.removeItem('sr_crm_auth_rights');
    localStorage.removeItem('sr_crm_auth_token');
  };

  const updateProfile = (data) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('sr_crm_auth_user', JSON.stringify(updated));
  };

  const hasPermission = (moduleName, action = 'CanView') => {
    if (!user) return false;
    if (user.role === 'Admin') return true;
    const permission = rights.find(
      r => r.Module && r.Module.toLowerCase() === moduleName.toLowerCase()
    );
    if (!permission) return true; // Default viewable if unlisted
    return Boolean(permission[action]);
  };

  return (
    <AuthContext.Provider value={{ user, rights, loading, login, logout, updateProfile, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

