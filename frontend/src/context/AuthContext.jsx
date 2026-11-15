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
    (String(user?.role || '').toLowerCase() === 'admin' && String(user?.email || '').toLowerCase().includes('admin')) ||
    String(user?.email || '').toLowerCase() === 'admin@srinvestments.com' ||
    String(user?.email || '').toLowerCase() === 'kgopal8306@gmail.com' ||
    String(user?.userId || '').toLowerCase() === 'user1' ||
    String(user?.UserId || '').toLowerCase() === 'user1'
  );

  // Synchronize company name with template/tenant CompanySettings tab after login
  useEffect(() => {
    if (!user) return;
    crmApi.call('getCompanySettings', {}, { silent: true }).then(settings => {
      const liveName = settings?.CompanyName || settings?.COMPANY_NAME;
      if (liveName) {
        setTenant(prev => {
          if (!prev) return { tenantId: user.activeTenantId || 'TEN001', companyName: liveName, CompanyName: liveName };
          if (prev.companyName !== liveName || prev.CompanyName !== liveName) {
            const updated = { ...prev, companyName: liveName, CompanyName: liveName };
            crmApi.setActiveTenant(updated);
            localStorage.setItem('sr_crm_auth_tenant', JSON.stringify(updated));
            return updated;
          }
          return prev;
        });
      }
    }).catch(() => {});
  }, [user?.userId, user?.activeTenantId]);

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
    if (user.role === 'Admin' || isSuperAdmin) return true;
    const permission = rights.find(
      r => r.Module && r.Module.toLowerCase() === moduleName.toLowerCase()
    );
    if (!permission) return true; // Default viewable if unlisted
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
