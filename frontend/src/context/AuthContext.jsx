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
    if (res.tenant && res.tenant.tenantId) {
      setTenant(res.tenant);
      crmApi.setActiveTenant(res.tenant);
      localStorage.setItem('sr_crm_auth_tenant', JSON.stringify(res.tenant));
    } else {
      setTenant(null);
      crmApi.setActiveTenant(null);
      localStorage.removeItem('sr_crm_auth_tenant');
    }
    const ws = res.user?.workspaces || (res.tenant?.tenantId ? [res.tenant] : []);
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

  const syncUserTenantRole = (tenantId, newRole) => {
    if (!user) return;
    const cleanRole = String(newRole || 'Staff').trim();
    const updatedUser = { 
      ...user, 
      role: cleanRole, 
      Role: cleanRole 
    };

    const updatedWorkspaces = (workspaces || []).map(w => {
      if (String(w.tenantId || '').toUpperCase() === String(tenantId).toUpperCase()) {
        return { ...w, role: cleanRole, Role: cleanRole };
      }
      return w;
    });

    if (!updatedWorkspaces.some(w => String(w.tenantId || '').toUpperCase() === String(tenantId).toUpperCase())) {
      updatedWorkspaces.push({
        tenantId: tenantId,
        companyName: tenant?.CompanyName || tenantId,
        role: cleanRole
      });
    }

    updatedUser.workspaces = updatedWorkspaces;
    setUser(updatedUser);
    setWorkspaces(updatedWorkspaces);
    localStorage.setItem('sr_crm_auth_user', JSON.stringify(updatedUser));
    localStorage.setItem('sr_crm_auth_workspaces', JSON.stringify(updatedWorkspaces));

    // Force publish event to immediately refresh side-navbar and workspace
    crmApi.publishEvent({ type: 'DATA_CHANGED', module: 'Auth', action: 'roleChanged', role: cleanRole, tenantId });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('CRM_NAVBAR_REFRESH', { detail: { role: cleanRole, tenantId } }));
    }
  };

  // SuperAdmin role & workspace sanitization:
  // - If user is SuperAdmin and NOT mapped to any tenant -> role is 'SuperAdmin', activeTenantId is null, tenant is null!
  // - If SuperAdmin IS mapped to a tenant workspace -> reflects that active workspace!
  useEffect(() => {
    if (user && isSuperAdmin) {
      const activeTenantId = tenant?.TenantId || user.activeTenantId;
      const activeWs = Array.isArray(workspaces) && workspaces.length > 0
        ? workspaces.find(w => String(w.tenantId || w.TenantId || '').toUpperCase() === String(activeTenantId || '').toUpperCase())
        : null;

      if (!activeWs) {
        // SuperAdmin has NO tenant mapping: clean up any legacy/fake tenant data
        let changed = false;
        let updatedUser = { ...user };
        if (updatedUser.role !== 'SuperAdmin') {
          updatedUser.role = 'SuperAdmin';
          updatedUser.Role = 'SuperAdmin';
          changed = true;
        }
        if (updatedUser.activeTenantId) {
          updatedUser.activeTenantId = null;
          changed = true;
        }
        if (String(updatedUser.employeeCode || '').startsWith('GOOGLE_TEN') || String(updatedUser.employeeCode || '').startsWith('EMP_TEN')) {
          updatedUser.employeeCode = updatedUser.userId || '';
          changed = true;
        }
        if (changed) {
          setUser(updatedUser);
          localStorage.setItem('sr_crm_auth_user', JSON.stringify(updatedUser));
        }
        if (tenant) {
          setTenant(null);
          crmApi.setActiveTenant(null);
          localStorage.removeItem('sr_crm_auth_tenant');
        }
      }
    }
  }, [user, isSuperAdmin, workspaces, tenant]);

  // Synchronize branding (CompanyName & TagLine):
  // 1. if User is SuperAdmin=TRUE: from Default-Config
  // 2. if User is SuperAdmin=FALSE: get UserId, TenantId from Selected Workspace (Tenant User Mapping),
  //    then using TenantId, fetch CompanyName & Tagline from CENTRAL DB (Tenant_Master tab)
  useEffect(() => {
    if (!user) return;
    const activeTenantId = tenant?.TenantId || tenant?.tenantId || user?.activeTenantId || null;
    crmApi.call('getTenantBranding', { 
      tenantId: activeTenantId,
      userId: user?.userId,
      isSuperAdmin: Boolean(isSuperAdmin)
    })
      .then(res => {
        if (res && res.companyName) {
          const newCompName = res.companyName;
          const newTagLine = res.tagLine || (isSuperAdmin ? 'SuperAdmin App' : 'Mutual Fund CRM');

          if (!isSuperAdmin || activeTenantId) {
            setTenant(prev => {
              if (!prev && !activeTenantId) return null;
              if (prev?.CompanyName === newCompName && prev?.TagLine === newTagLine) return prev;
              const updated = {
                ...(prev || {}),
                TenantId: res.tenantId || activeTenantId,
                tenantId: res.tenantId || activeTenantId,
                CompanyName: newCompName,
                companyName: newCompName,
                TagLine: newTagLine,
                tagLine: newTagLine,
                arnNumber: res.arnNumber || prev?.arnNumber || '',
                ArnNumber: res.arnNumber || prev?.ArnNumber || ''
              };
              localStorage.setItem('sr_crm_auth_tenant', JSON.stringify(updated));
              return updated;
            });

            crmApi.setActiveTenant({
              TenantId: res.tenantId || activeTenantId,
              tenantId: res.tenantId || activeTenantId,
              CompanyName: newCompName,
              companyName: newCompName,
              TagLine: newTagLine,
              tagLine: newTagLine
            });
          }

          setUser(prev => {
            if (!prev) return prev;
            if (prev?.companyName === newCompName && prev?.tagLine === newTagLine) return prev;
            const updated = {
              ...prev,
              companyName: newCompName,
              CompanyName: newCompName,
              tagLine: newTagLine,
              TagLine: newTagLine
            };
            localStorage.setItem('sr_crm_auth_user', JSON.stringify(updated));
            return updated;
          });

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('CRM_NAVBAR_REFRESH'));
          }
        }
      })
      .catch(err => {
        console.warn('Failed to sync tenant branding:', err);
      });
  }, [user?.userId, user?.activeTenantId, tenant?.TenantId, isSuperAdmin]);

  const hasPermission = (moduleName, action = 'CanView') => {
    if (!user) return false;

    // 1. If role is Admin in active Tenant (case-insensitive), give all rights always
    const currentRole = String(user.role || user.Role || '').trim().toLowerCase();
    if (currentRole === 'admin') return true;

    // Check active workspace membership in user.workspaces
    const activeTenantId = tenant?.TenantId || user.activeTenantId;
    const activeWs = Array.isArray(workspaces)
      ? workspaces.find(w => String(w.tenantId || w.TenantId || '').toUpperCase() === String(activeTenantId || '').toUpperCase())
      : null;

    if (activeWs && String(activeWs.role || activeWs.Role || '').trim().toLowerCase() === 'admin') {
      return true;
    }

    // 2. SuperAdmin handling:
    // - If SuperAdmin = Admin in Tenant -> UNLOCK!
    // - If SuperAdmin NOT in Tenant -> UNLOCK!
    // - Only if SuperAdmin is explicitly in Tenant as non-Admin (e.g. Staff) -> Check rights matrix below!
    if (isSuperAdmin) {
      if (!activeWs) {
        // SuperAdmin not in tenant -> UNLOCK!
        return true;
      }
      const wsRole = String(activeWs.role || activeWs.Role || currentRole).trim().toLowerCase();
      if (wsRole === 'admin' || wsRole === 'superadmin' || wsRole === 'super_admin' || !wsRole) {
        // SuperAdmin is Admin in Tenant (or unmapped) -> UNLOCK!
        return true;
      }
    }

    // 3. If non-Admin (or SuperAdmin explicitly mapped as non-Admin),
    // rights are evaluated hierarchically: User-level custom override -> Role baseline -> General matrix
    if (!moduleName) return true;

    const curUserId = String(user.userId || user.UserId || user.employeeCode || user.email || '').trim().toLowerCase();

    // 3a. Check User-specific custom permission override
    const userCustom = rights.find(
      r => r.UserId && String(r.UserId).trim().toLowerCase() === curUserId &&
           r.Module && r.Module.toLowerCase() === moduleName.toLowerCase()
    );
    if (userCustom) {
      return Boolean(userCustom[action]);
    }

    // 3b. Check Role-level baseline permission (where UserId is empty)
    const rolePermission = rights.find(
      r => (!r.UserId || String(r.UserId).trim() === '') &&
           r.Role && r.Role.toLowerCase() === currentRole.toLowerCase() &&
           r.Module && r.Module.toLowerCase() === moduleName.toLowerCase()
    );
    if (rolePermission) {
      return Boolean(rolePermission[action]);
    }

    // 3c. Fallback for pre-resolved effective permissions (e.g. from login session)
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
      syncUserTenantRole,
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
