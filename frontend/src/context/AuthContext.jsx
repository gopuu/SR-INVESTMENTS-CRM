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

  const [tenant, setTenant] = useState(() => {
    try {
      const saved = localStorage.getItem('sr_crm_auth_tenant');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [workspaces, setWorkspaces] = useState(() => {
    try {
      const saved = localStorage.getItem('sr_crm_auth_workspaces');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
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

  const isSuperAdmin = Boolean(
    user?.isSuperAdmin === true ||
    String(user?.isSuperAdmin).toLowerCase() === 'true' ||
    user?.IsSuperAdmin === true ||
    String(user?.IsSuperAdmin).toLowerCase() === 'true' ||
    user?.role === 'SuperAdmin' ||
    user?.Role === 'SuperAdmin' ||
    user?.role === 'SUPER_ADMIN' ||
    user?.Role === 'SUPER_ADMIN'
  );

  const applyAuthSession = (res) => {
    setUser(res.user);
    setRights(res.rights || []);
    if (res.tenant) {
      setTenant(res.tenant);
      crmApi.setActiveTenant(res.tenant);
      localStorage.setItem('sr_crm_auth_tenant', JSON.stringify(res.tenant));
    }
    const ws = res.user?.workspaces || (res.tenant ? [res.tenant] : []);
    setWorkspaces(ws);
    localStorage.setItem('sr_crm_auth_workspaces', JSON.stringify(ws));
    localStorage.setItem('sr_crm_auth_user', JSON.stringify(res.user));
    localStorage.setItem('sr_crm_auth_rights', JSON.stringify(res.rights || []));
    if (res.token) localStorage.setItem('sr_crm_auth_token', res.token);
  };

  // Supports login via StaffId (EmployeeCode) / Email / Mobile + Password
  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await crmApi.call('login', { username, password });
      if (res.multiTenant) {
        // Returns pre-auth workspace picker payload without completing session yet
        return res;
      }
      applyAuthSession(res);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  // Supports login with Google (matches primary or any registered Google email)
  const loginWithGoogle = async (googleEmail, googleName) => {
    setLoading(true);
    try {
      const res = await crmApi.call('googleLogin', { googleEmail, googleName });
      if (res.multiTenant) {
        return res;
      }
      applyAuthSession(res);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  // Select workspace from Multi-Tenant Picker on Login
  const selectWorkspace = async (workspace, preAuthData) => {
    setLoading(true);
    try {
      const res = await crmApi.call('selectTenant', {
        tenantId: workspace.tenantId,
        userId: preAuthData.user?.userId,
        userEmail: preAuthData.user?.email,
        userName: preAuthData.user?.name,
        isSuperAdmin: preAuthData.user?.isSuperAdmin,
        role: workspace.role
      });
      applyAuthSession(res);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  // In-App 1-Click Workspace Switcher
  const switchWorkspace = async (targetTenantId) => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await crmApi.call('selectTenant', {
        tenantId: targetTenantId,
        userId: user.userId,
        userEmail: user.email,
        userName: user.name,
        isSuperAdmin: isSuperAdmin
      });
      applyAuthSession(res);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setTenant(null);
    setWorkspaces([]);
    setRights([]);
    crmApi.setActiveTenant(null);
    localStorage.removeItem('sr_crm_auth_user');
    localStorage.removeItem('sr_crm_auth_tenant');
    localStorage.removeItem('sr_crm_auth_workspaces');
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
    // 1. If role is Admin in any Tenant, give all rights always
    if (user.role === 'Admin') return true;

    // 2. If non-Admin (or pure SuperAdmin when inside a tenant workspace where they are not Admin),
    // rights must be assigned from the active tenant's RolesRights matrix
    if (!moduleName) return true;
    const permission = rights.find(
      r => r.Module && r.Module.toLowerCase() === moduleName.toLowerCase()
    );
    if (!permission) return false; // Default restricted for non-Admin if not explicitly assigned
    return Boolean(permission[action]);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      tenant,
      workspaces,
      isSuperAdmin,
      rights, 
      loading, 
      login, 
      loginWithGoogle, 
      selectWorkspace,
      switchWorkspace,
      logout, 
      updateProfile, 
      hasPermission 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
