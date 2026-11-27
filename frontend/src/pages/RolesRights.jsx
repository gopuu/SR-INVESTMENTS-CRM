import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Save, 
  RefreshCw, 
  Users,
  UserCheck,
  RotateCcw,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { crmApi, subscribeCrmEvents } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { showSuccess, showError, showWarning } from '../utils/swal';

const STANDARD_MODULES = [
  { key: 'Dashboard', label: 'Dashboard' },
  { key: 'Customers', label: 'Customers' },
  { key: 'Staff', label: 'Staff (Employees)' },
  { key: 'MasterDepartments', label: 'Department Master' },
  { key: 'MasterDesignations', label: 'Designation Master' },
  { key: 'MasterRoles', label: 'Role Master' },
  { key: 'RolesRights', label: 'User Rights' },
  { key: 'MasterHub', label: 'Master HUB' },
  { key: 'Settings', label: 'Settings' },
  { key: 'DriveBackup', label: 'Drive Backup' }
];

export default function RolesRights({ onOpenBackup, inline = false }) {
  const { user, tenant, hasPermission } = useAuth();
  
  // Tab Mode: 'ROLE' (default for all users in role) vs 'USER' (specific customized user)
  const [permissionMode, setPermissionMode] = useState('ROLE');

  // Role Baseline state
  const [roleRights, setRoleRights] = useState([]);
  const [availableRoles, setAvailableRoles] = useState(['Admin', 'Relationship Manager', 'Backoffice Staff']);
  const [selectedRole, setSelectedRole] = useState('ALL');

  // Specific User state
  const [userCustomRights, setUserCustomRights] = useState([]); // Array of all custom user rows
  const [tenantUsers, setTenantUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userDraftRights, setUserDraftRights] = useState({}); // { [userId]: [ { Module, CanView, ... } ] }

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resettingUser, setResettingUser] = useState(false);

  // Approval Governance state
  const [approvalSettings, setApprovalSettings] = useState({
    enabled: false,
    onAdd: true,
    onEdit: true,
    onDelete: true
  });
  const [savingApproval, setSavingApproval] = useState(false);

  const canEditRights = user?.role === 'Admin' || hasPermission('RolesRights', 'CanEdit');

  // Load all data
  const loadRightsAndRoles = async () => {
    try {
      setLoading(true);
      const [rtsRes, rolesRes, appRes, empsRes, mapRes, usrRes] = await Promise.all([
        crmApi.call('getRolesRights').catch(() => []),
        crmApi.call('getRoles', { includeDeleted: false }).catch(() => []),
        crmApi.call('getApprovalSettings').catch(() => ({ enabled: false, onAdd: true, onEdit: true, onDelete: true })),
        crmApi.call('getEmployees', { includeDeleted: false }).catch(() => []),
        crmApi.call('getTenantUserMappings', { tenantId: tenant?.TenantId }).catch(() => []),
        crmApi.call('getCentralUsers', { includeDeleted: false }).catch(() => [])
      ]);

      if (appRes) {
        setApprovalSettings({
          enabled: Boolean(appRes.enabled),
          onAdd: appRes.onAdd !== false,
          onEdit: appRes.onEdit !== false,
          onDelete: appRes.onDelete !== false
        });
      }

      const rawRights = Array.isArray(rtsRes) ? rtsRes : [];
      const loadedRoles = Array.isArray(rolesRes) ? rolesRes : [];
      const employees = Array.isArray(empsRes) ? empsRes : [];
      const mappings = Array.isArray(mapRes) ? mapRes : [];
      const centralUsers = Array.isArray(usrRes) ? usrRes : [];

      // 1. Separate role-level rights (UserId empty) from user custom rights (UserId present)
      const roleLevelRights = rawRights.filter(r => !r.UserId || String(r.UserId).trim() === '');
      const userLevelRights = rawRights.filter(r => r.UserId && String(r.UserId).trim() !== '');

      setUserCustomRights(userLevelRights);

      // 2. Extract available roles
      const roleSet = new Set(['Admin', 'Relationship Manager', 'Backoffice Staff']);
      loadedRoles.forEach(r => {
        if (r.RoleName) roleSet.add(r.RoleName);
      });
      roleLevelRights.forEach(r => {
        if (r.Role) roleSet.add(r.Role);
      });
      const roleList = Array.from(roleSet);
      setAvailableRoles(roleList);

      // 3. Build complete baseline rights list ensuring all standard modules exist for each role
      const fullRoleRights = [];
      roleList.forEach(role => {
        STANDARD_MODULES.forEach(mod => {
          const existing = roleLevelRights.find(
            r => r.Role && r.Role.toLowerCase() === role.toLowerCase() &&
                 r.Module && r.Module.toLowerCase() === mod.key.toLowerCase()
          );

          if (existing) {
            fullRoleRights.push({
              ...existing,
              Role: role,
              UserId: '',
              Module: mod.key,
              CanView: Boolean(existing.CanView === true || existing.CanView === 'true' || existing.CanView === 1),
              CanCreate: Boolean(existing.CanCreate === true || existing.CanCreate === 'true' || existing.CanCreate === 1),
              CanEdit: Boolean(existing.CanEdit === true || existing.CanEdit === 'true' || existing.CanEdit === 1),
              CanDelete: Boolean(existing.CanDelete === true || existing.CanDelete === 'true' || existing.CanDelete === 1)
            });
          } else {
            const isAdmin = role.toLowerCase() === 'admin';
            fullRoleRights.push({
              Role: role,
              UserId: '',
              Module: mod.key,
              CanView: isAdmin,
              CanCreate: isAdmin,
              CanEdit: isAdmin,
              CanDelete: isAdmin
            });
          }
        });
      });
      setRoleRights(fullRoleRights);

      // 4. Resolve tenant user list (combining Employees and Tenant_User_Mapping)
      const userMap = new Map();

      employees.forEach(emp => {
        const uid = emp.EmployeeCode || emp.EmployeeId || emp.Email;
        if (!uid) return;
        userMap.set(String(uid).toLowerCase(), {
          userId: uid,
          name: emp.FullName || emp.Name || uid,
          email: emp.Email || '',
          role: emp.Role || 'Staff',
          source: 'Employee'
        });
      });

      mappings.forEach(m => {
        if (m.TenantId && tenant?.TenantId && String(m.TenantId).toUpperCase() !== String(tenant.TenantId).toUpperCase()) return;
        if (m.IsDeleted || String(m.IsDeleted).toLowerCase() === 'true') return;
        const uid = m.UserId;
        if (!uid) return;
        const key = String(uid).toLowerCase();
        const cu = centralUsers.find(u => String(u.UserId).toLowerCase() === key);
        if (!userMap.has(key)) {
          userMap.set(key, {
            userId: uid,
            name: cu ? (cu.FullName || cu.Email) : uid,
            email: cu ? cu.Email : '',
            role: m.Role || 'Staff',
            source: 'Mapped User'
          });
        }
      });

      // Always include current logged in user if not already present
      if (user?.userId) {
        const myKey = String(user.userId).toLowerCase();
        if (!userMap.has(myKey)) {
          userMap.set(myKey, {
            userId: user.userId,
            name: user.name || user.email || user.userId,
            email: user.email || '',
            role: user.role || 'Staff',
            source: 'Current Session'
          });
        }
      }

      const userList = Array.from(userMap.values());
      setTenantUsers(userList);

      if (userList.length > 0 && !selectedUserId) {
        setSelectedUserId(userList[0].userId);
      }

    } catch (err) {
      console.error('Failed to load user rights:', err);
      showError('Load Error', err?.message || 'Failed to load roles and permissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRightsAndRoles();

    const unsub = subscribeCrmEvents((evt) => {
      if (evt.module === 'RolesRights' || evt.module === 'MasterRoles' || evt.module === 'Employees') {
        loadRightsAndRoles();
      }
    });
    return unsub;
  }, []);

  // Currently selected user object
  const selectedUserObj = useMemo(() => {
    return tenantUsers.find(u => String(u.userId).toLowerCase() === String(selectedUserId).toLowerCase()) || null;
  }, [tenantUsers, selectedUserId]);

  // Check if selected user has saved custom overrides
  const userHasCustomOverride = useMemo(() => {
    if (!selectedUserId) return false;
    return userCustomRights.some(r => String(r.UserId).toLowerCase() === String(selectedUserId).toLowerCase());
  }, [userCustomRights, selectedUserId]);

  // Effective permissions for selected user
  const effectiveUserPermissions = useMemo(() => {
    if (!selectedUserObj) return [];

    const userRole = selectedUserObj.role || 'Staff';
    const uid = selectedUserObj.userId;

    // Check if user has unsaved draft changes
    if (userDraftRights[uid]) {
      return userDraftRights[uid];
    }

    // Check if user has saved custom permissions in userCustomRights
    const savedCustom = userCustomRights.filter(r => String(r.UserId).toLowerCase() === String(uid).toLowerCase());

    return STANDARD_MODULES.map(mod => {
      if (savedCustom.length > 0) {
        const customMod = savedCustom.find(r => r.Module && r.Module.toLowerCase() === mod.key.toLowerCase());
        if (customMod) {
          return {
            Role: userRole,
            UserId: uid,
            Module: mod.key,
            CanView: Boolean(customMod.CanView === true || customMod.CanView === 'true' || customMod.CanView === 1),
            CanCreate: Boolean(customMod.CanCreate === true || customMod.CanCreate === 'true' || customMod.CanCreate === 1),
            CanEdit: Boolean(customMod.CanEdit === true || customMod.CanEdit === 'true' || customMod.CanEdit === 1),
            CanDelete: Boolean(customMod.CanDelete === true || customMod.CanDelete === 'true' || customMod.CanDelete === 1),
            IsCustom: true
          };
        }
      }

      // Fallback to Role baseline
      const roleMod = roleRights.find(
        r => r.Role && r.Role.toLowerCase() === userRole.toLowerCase() &&
             r.Module && r.Module.toLowerCase() === mod.key.toLowerCase()
      );

      const isAdmin = userRole.toLowerCase() === 'admin';
      return {
        Role: userRole,
        UserId: uid,
        Module: mod.key,
        CanView: roleMod ? Boolean(roleMod.CanView) : isAdmin,
        CanCreate: roleMod ? Boolean(roleMod.CanCreate) : isAdmin,
        CanEdit: roleMod ? Boolean(roleMod.CanEdit) : isAdmin,
        CanDelete: roleMod ? Boolean(roleMod.CanDelete) : isAdmin,
        IsCustom: false
      };
    });
  }, [selectedUserObj, userDraftRights, userCustomRights, roleRights]);

  // Filtered rows for Role mode
  const displayedRoleRights = useMemo(() => {
    if (selectedRole === 'ALL') {
      return roleRights;
    }
    return roleRights.filter(r => r.Role && r.Role.toLowerCase() === selectedRole.toLowerCase());
  }, [roleRights, selectedRole]);

  // Toggle single permission for Role mode
  const toggleRolePermission = (role, moduleKey, action) => {
    if (!canEditRights) {
      showWarning('Permission Denied', 'You do not have rights to edit user permissions.');
      return;
    }

    setRoleRights(prev => prev.map(r => {
      if (r.Role === role && r.Module === moduleKey) {
        return {
          ...r,
          [action]: !r[action]
        };
      }
      return r;
    }));
  };

  // Toggle single permission for User mode
  const toggleUserPermission = (moduleKey, action) => {
    if (!canEditRights) {
      showWarning('Permission Denied', 'You do not have rights to edit user permissions.');
      return;
    }
    if (!selectedUserId) return;

    setUserDraftRights(prev => {
      const currentList = prev[selectedUserId] || effectiveUserPermissions;
      const updated = currentList.map(item => {
        if (item.Module.toLowerCase() === moduleKey.toLowerCase()) {
          return {
            ...item,
            [action]: !item[action],
            IsCustom: true
          };
        }
        return item;
      });
      return {
        ...prev,
        [selectedUserId]: updated
      };
    });
  };

  // Bulk allow all for selected role
  const handleBulkAllowRole = () => {
    if (selectedRole === 'ALL' || !canEditRights) return;

    setRoleRights(prev => prev.map(r => {
      if (r.Role && r.Role.toLowerCase() === selectedRole.toLowerCase()) {
        return { ...r, CanView: true, CanCreate: true, CanEdit: true, CanDelete: true };
      }
      return r;
    }));
  };

  // Bulk deny all for selected role
  const handleBulkDenyRole = () => {
    if (selectedRole === 'ALL' || !canEditRights) return;
    if (selectedRole.toLowerCase() === 'admin') {
      showWarning('Admin Protected', 'Admin role must retain permissions.');
      return;
    }

    setRoleRights(prev => prev.map(r => {
      if (r.Role && r.Role.toLowerCase() === selectedRole.toLowerCase()) {
        return { ...r, CanView: false, CanCreate: false, CanEdit: false, CanDelete: false };
      }
      return r;
    }));
  };

  // Bulk allow all for selected user
  const handleBulkAllowUser = () => {
    if (!selectedUserId || !canEditRights) return;
    setUserDraftRights(prev => ({
      ...prev,
      [selectedUserId]: effectiveUserPermissions.map(item => ({
        ...item,
        CanView: true,
        CanCreate: true,
        CanEdit: true,
        CanDelete: true,
        IsCustom: true
      }))
    }));
  };

  // Bulk deny all for selected user
  const handleBulkDenyUser = () => {
    if (!selectedUserId || !canEditRights) return;
    if (selectedUserObj?.role?.toLowerCase() === 'admin') {
      showWarning('Admin Protected', 'Admin user must retain permissions.');
      return;
    }
    setUserDraftRights(prev => ({
      ...prev,
      [selectedUserId]: effectiveUserPermissions.map(item => ({
        ...item,
        CanView: false,
        CanCreate: false,
        CanEdit: false,
        CanDelete: false,
        IsCustom: true
      }))
    }));
  };

  // Reset user custom permissions back to Role default
  const handleResetUserToRoleDefaults = async () => {
    if (!selectedUserId || !canEditRights) return;

    try {
      setResettingUser(true);
      await crmApi.call('saveRolesRights', {
        targetType: 'RESET_USER',
        targetUserId: selectedUserId,
        tenantId: tenant?.TenantId
      });

      // Clear draft and update state
      setUserDraftRights(prev => {
        const copy = { ...prev };
        delete copy[selectedUserId];
        return copy;
      });

      setUserCustomRights(prev => prev.filter(r => String(r.UserId).toLowerCase() !== String(selectedUserId).toLowerCase()));
      showSuccess('Reset Complete', `User ${selectedUserObj?.name || selectedUserId} has been reset to their Role defaults (${selectedUserObj?.role || 'Staff'}).`);
    } catch (err) {
      console.error('Reset user rights failed:', err);
      showError('Reset Failed', err?.message || 'Could not reset user permissions.');
    } finally {
      setResettingUser(false);
    }
  };

  // Save Role Rights
  const handleSaveRoleRights = async () => {
    if (!canEditRights) {
      showError('Restricted', 'Only Admins can save role rights.');
      return;
    }

    try {
      setSaving(true);
      await crmApi.call('saveRolesRights', {
        targetType: 'ROLE',
        targetRole: selectedRole,
        rights: selectedRole === 'ALL' ? roleRights : roleRights.filter(r => r.Role.toLowerCase() === selectedRole.toLowerCase()),
        tenantId: tenant?.TenantId
      });
      showSuccess('Role Permissions Saved', `Baseline permissions for ${selectedRole === 'ALL' ? 'ALL Roles' : selectedRole} updated successfully.`);
    } catch (err) {
      console.error('Failed to save roles rights:', err);
      showError('Save Failed', err?.message || 'Could not save permissions.');
    } finally {
      setSaving(false);
    }
  };

  // Save User Custom Rights
  const handleSaveUserRights = async () => {
    if (!canEditRights) {
      showError('Restricted', 'Only Admins can save user rights.');
      return;
    }
    if (!selectedUserId) return;

    try {
      setSaving(true);
      const rowsToSave = effectiveUserPermissions.map(r => ({
        ...r,
        UserId: selectedUserId,
        Role: selectedUserObj?.role || 'Staff'
      }));

      await crmApi.call('saveRolesRights', {
        targetType: 'USER',
        targetUserId: selectedUserId,
        targetRole: selectedUserObj?.role || 'Staff',
        rights: rowsToSave,
        tenantId: tenant?.TenantId
      });

      // Update local custom rights cache
      setUserCustomRights(prev => {
        const other = prev.filter(r => String(r.UserId).toLowerCase() !== String(selectedUserId).toLowerCase());
        return other.concat(rowsToSave);
      });

      // Clear draft
      setUserDraftRights(prev => {
        const copy = { ...prev };
        delete copy[selectedUserId];
        return copy;
      });

      showSuccess('User Permissions Saved', `Customized privileges saved for user ${selectedUserObj?.name || selectedUserId}.`);
    } catch (err) {
      console.error('Failed to save user rights:', err);
      showError('Save Failed', err?.message || 'Could not save user permissions.');
    } finally {
      setSaving(false);
    }
  };

  // Save approval workflow settings
  const handleSaveApprovalSettings = async () => {
    if (!canEditRights) {
      showError('Restricted', 'Only Admins can change approval governance.');
      return;
    }
    setSavingApproval(true);
    try {
      await crmApi.call('saveApprovalSettings', approvalSettings);
      showSuccess(
        'Approval Settings Saved',
        approvalSettings.enabled 
          ? 'Admin Approval Workflow is now ENABLED. Non-admin operations will be marked as "Approval Pending".' 
          : 'Admin Approval Workflow is now DISABLED. All authorized staff can add/edit/delete directly.'
      );
    } catch (err) {
      showError('Save Failed', err.message || 'Failed to save approval settings.');
    } finally {
      setSavingApproval(false);
    }
  };

  const content = (
    <div className="crm-card" style={{ padding: '2rem' }}>
      {/* Admin Approval Governance Card */}
      <div style={{
        marginBottom: '1.75rem',
        padding: '1.25rem 1.5rem',
        borderRadius: '12px',
        backgroundColor: approvalSettings.enabled ? '#eff6ff' : '#f8fafc',
        border: `1.5px solid ${approvalSettings.enabled ? '#93c5fd' : '#e2e8f0'}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: approvalSettings.enabled ? '#2563eb' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>
                  Admin Approval Workflow (Data Change Governance)
                </h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.775rem', color: '#64748b' }}>
                  When enabled, any record added, edited, or deleted by Non-Admin users is marked with Status <strong>'Approval Pending'</strong> and requires an Admin to approve it before it becomes active.
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: canEditRights ? 'pointer' : 'not-allowed', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={approvalSettings.enabled}
                onChange={(e) => setApprovalSettings({ ...approvalSettings, enabled: e.target.checked })}
                disabled={!canEditRights || savingApproval}
                style={{ width: '20px', height: '20px', accentColor: '#2563eb', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: '700', fontSize: '0.875rem', color: approvalSettings.enabled ? '#1d4ed8' : '#64748b' }}>
                {approvalSettings.enabled ? 'APPROVAL ENABLED' : 'APPROVAL DISABLED (Direct Access)'}
              </span>
            </label>

            {canEditRights && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSaveApprovalSettings}
                disabled={savingApproval}
                style={{ fontSize: '0.78rem', padding: '0.45rem 1rem' }}
              >
                <Save size={14} /> {savingApproval ? 'Saving...' : 'Save Approval Config'}
              </button>
            )}
          </div>
        </div>

        {/* Granular Add/Edit/Delete approval options */}
        {approvalSettings.enabled && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            paddingTop: '0.65rem',
            borderTop: '1px solid #bfdbfe',
            fontSize: '0.8rem',
            color: '#1e3a8a',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontWeight: '700' }}>Require Approval for:</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={approvalSettings.onAdd}
                onChange={(e) => setApprovalSettings({ ...approvalSettings, onAdd: e.target.checked })}
                disabled={!canEditRights}
                style={{ accentColor: '#2563eb' }}
              />
              <span>Add / New Records</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={approvalSettings.onEdit}
                onChange={(e) => setApprovalSettings({ ...approvalSettings, onEdit: e.target.checked })}
                disabled={!canEditRights}
                style={{ accentColor: '#2563eb' }}
              />
              <span>Edit / Updates</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={approvalSettings.onDelete}
                onChange={(e) => setApprovalSettings({ ...approvalSettings, onDelete: e.target.checked })}
                disabled={!canEditRights}
                style={{ accentColor: '#2563eb' }}
              />
              <span>Delete Operations</span>
            </label>
          </div>
        )}
      </div>

      {/* Target Selector Tabs: Role-Based vs Specific User */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={22} color="#2563eb" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Access Control & Permissions Matrix
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Configure default permissions by Role for all users, or customize privileges for a specific user.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'inline-flex',
          padding: '4px',
          backgroundColor: '#f1f5f9',
          borderRadius: '10px',
          border: '1px solid #cbd5e1'
        }}>
          <button
            type="button"
            onClick={() => setPermissionMode('ROLE')}
            style={{
              padding: '0.5rem 1.15rem',
              borderRadius: '7px',
              fontWeight: '700',
              fontSize: '0.825rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: permissionMode === 'ROLE' ? '#2563eb' : 'transparent',
              color: permissionMode === 'ROLE' ? '#ffffff' : '#475569',
              boxShadow: permissionMode === 'ROLE' ? '0 1px 3px rgba(37,99,235,0.25)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Users size={15} />
            <span>Role Permissions (All Users)</span>
          </button>
          <button
            type="button"
            onClick={() => setPermissionMode('USER')}
            style={{
              padding: '0.5rem 1.15rem',
              borderRadius: '7px',
              fontWeight: '700',
              fontSize: '0.825rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: permissionMode === 'USER' ? '#2563eb' : 'transparent',
              color: permissionMode === 'USER' ? '#ffffff' : '#475569',
              boxShadow: permissionMode === 'USER' ? '0 1px 3px rgba(37,99,235,0.25)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <UserCheck size={15} />
            <span>Specific User (Custom Override)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: ROLE-BASED ACCESS CONTROL (ALL USERS IN ROLE)                    */}
      {/* ========================================================================= */}
      {permissionMode === 'ROLE' && (
        <>
          {/* Controls Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem'
          }}>
            {/* Role Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap' }}>
                Select Role:
              </label>
              <select
                className="form-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                disabled={loading}
                style={{
                  width: 'auto',
                  minWidth: '220px',
                  fontWeight: '600',
                  color: '#0f172a',
                  borderColor: '#93c5fd',
                  backgroundColor: '#ffffff',
                  padding: '0.5rem 0.85rem'
                }}
              >
                {loading ? (
                  <option value="" disabled>Fetching data...</option>
                ) : availableRoles.length === 0 ? (
                  <option value="" disabled>No Data Available</option>
                ) : (
                  <>
                    <option value="ALL">ALL Roles ({availableRoles.length})</option>
                    {availableRoles.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </>
                )}
              </select>

              {/* Quick Allow / Deny buttons */}
              {selectedRole !== 'ALL' && canEditRights && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleBulkAllowRole}
                    title="Allow all permissions for this role"
                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.65rem' }}
                  >
                    Allow All
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleBulkDenyRole}
                    title="Deny all permissions for this role"
                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.65rem' }}
                  >
                    Deny All
                  </button>
                </div>
              )}
            </div>

            {/* SAVE BUTTON */}
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveRoleRights}
              disabled={saving || !canEditRights}
              style={{
                padding: '0.55rem 1.25rem',
                fontWeight: '700',
                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
              }}
            >
              {saving ? (
                <>
                  <RefreshCw size={16} className="spin-animation" />
                  <span>Saving Role Permissions...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>SAVE Role Permissions</span>
                </>
              )}
            </button>
          </div>

          {/* Info note */}
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            marginBottom: '1.25rem',
            fontSize: '0.8rem',
            color: '#1e40af'
          }}>
            <Info size={16} color="#2563eb" style={{ flexShrink: 0 }} />
            <span>
              Configuring default baseline permissions for: <strong>{selectedRole === 'ALL' ? 'ALL Roles' : selectedRole}</strong>. 
              These baseline privileges apply automatically to all users assigned to this role unless a custom user override is specified.
            </span>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="crm-table">
              <thead>
                <tr>
                  <th style={{ width: '22%' }}>Role</th>
                  <th style={{ width: '30%' }}>CRM Module</th>
                  <th style={{ textAlign: 'center', width: '12%' }}>Can View</th>
                  <th style={{ textAlign: 'center', width: '12%' }}>Can Create</th>
                  <th style={{ textAlign: 'center', width: '12%' }}>Can Edit</th>
                  <th style={{ textAlign: 'center', width: '12%' }}>Can Delete</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                      <RefreshCw size={26} color="#2563eb" className="spin-animation" style={{ margin: '0 auto 0.75rem' }} />
                      <div style={{ fontWeight: '600', fontSize: '1rem', color: '#0f172a' }}>Fetching data...</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Please wait while permissions matrix is loaded from Google Sheets</div>
                    </td>
                  </tr>
                ) : displayedRoleRights.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                      <div style={{ fontWeight: '700', fontSize: '1rem', color: '#64748b' }}>No Data Found</div>
                      <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>No permission records found for the selected role.</div>
                    </td>
                  </tr>
                ) : (
                  displayedRoleRights.map((r, idx) => {
                    const isAdmin = r.Role.toLowerCase() === 'admin';
                    const modObj = STANDARD_MODULES.find(m => m.key.toLowerCase() === r.Module.toLowerCase());
                    const moduleLabel = modObj ? modObj.label : r.Module;

                    return (
                      <tr 
                        key={`${r.Role}_${r.Module}_${idx}`}
                        style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fcfcfd' }}
                      >
                        <td>
                          <span className={`badge ${isAdmin ? 'badge-primary' : 'badge-neutral'}`} style={{ fontSize: '0.75rem' }}>
                            {r.Role}
                          </span>
                        </td>

                        <td>
                          <strong style={{ color: '#0f172a', fontSize: '0.85rem' }}>
                            {moduleLabel}
                          </strong>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', fontFamily: 'monospace' }}>
                            {r.Module}
                          </span>
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={Boolean(r.CanView)}
                            disabled={!canEditRights}
                            onChange={() => toggleRolePermission(r.Role, r.Module, 'CanView')}
                            style={{ width: '18px', height: '18px', cursor: canEditRights ? 'pointer' : 'not-allowed', accentColor: '#2563eb' }}
                          />
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={Boolean(r.CanCreate)}
                            disabled={!canEditRights}
                            onChange={() => toggleRolePermission(r.Role, r.Module, 'CanCreate')}
                            style={{ width: '18px', height: '18px', cursor: canEditRights ? 'pointer' : 'not-allowed', accentColor: '#2563eb' }}
                          />
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={Boolean(r.CanEdit)}
                            disabled={!canEditRights}
                            onChange={() => toggleRolePermission(r.Role, r.Module, 'CanEdit')}
                            style={{ width: '18px', height: '18px', cursor: canEditRights ? 'pointer' : 'not-allowed', accentColor: '#2563eb' }}
                          />
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={Boolean(r.CanDelete)}
                            disabled={!canEditRights}
                            onChange={() => toggleRolePermission(r.Role, r.Module, 'CanDelete')}
                            style={{ width: '18px', height: '18px', cursor: canEditRights ? 'pointer' : 'not-allowed', accentColor: '#2563eb' }}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: SPECIFIC USER CUSTOMIZED PERMISSIONS                             */}
      {/* ========================================================================= */}
      {permissionMode === 'USER' && (
        <>
          {/* Controls Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem'
          }}>
            {/* User Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap' }}>
                Select User:
              </label>
              <select
                className="form-select"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={loading}
                style={{
                  width: 'auto',
                  minWidth: '280px',
                  fontWeight: '600',
                  color: '#0f172a',
                  borderColor: '#93c5fd',
                  backgroundColor: '#ffffff',
                  padding: '0.5rem 0.85rem'
                }}
              >
                {loading ? (
                  <option value="" disabled>Fetching users...</option>
                ) : tenantUsers.length === 0 ? (
                  <option value="" disabled>No Users Found</option>
                ) : (
                  tenantUsers.map(u => {
                    const hasCustom = userCustomRights.some(r => String(r.UserId).toLowerCase() === String(u.userId).toLowerCase());
                    return (
                      <option key={u.userId} value={u.userId}>
                        {u.userId} - {u.name} ({u.role}){hasCustom ? ' ★ [Custom Override]' : ''}
                      </option>
                    );
                  })
                )}
              </select>

              {/* Status Badge */}
              {selectedUserObj && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {userHasCustomOverride ? (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      border: '1px solid #fde68a'
                    }}>
                      <AlertCircle size={13} />
                      Custom User Override Active
                    </span>
                  ) : (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      border: '1px solid #bfdbfe'
                    }}>
                      <CheckCircle size={13} />
                      Inheriting Role Baseline ({selectedUserObj.role})
                    </span>
                  )}
                </div>
              )}

              {/* Quick Actions for User */}
              {canEditRights && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleBulkAllowUser}
                    title="Allow all permissions for this user"
                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.65rem' }}
                  >
                    Allow All
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleBulkDenyUser}
                    title="Deny all permissions for this user"
                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.65rem' }}
                  >
                    Deny All
                  </button>

                  {userHasCustomOverride && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={handleResetUserToRoleDefaults}
                      disabled={resettingUser}
                      title="Clear custom overrides and revert to Role defaults"
                      style={{ fontSize: '0.75rem', padding: '0.4rem 0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <RotateCcw size={13} />
                      <span>{resettingUser ? 'Resetting...' : 'Reset to Role Defaults'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* SAVE BUTTON */}
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveUserRights}
              disabled={saving || !canEditRights || !selectedUserId}
              style={{
                padding: '0.55rem 1.25rem',
                fontWeight: '700',
                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
              }}
            >
              {saving ? (
                <>
                  <RefreshCw size={16} className="spin-animation" />
                  <span>Saving User Permissions...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>SAVE User Permissions</span>
                </>
              )}
            </button>
          </div>

          {/* Info note */}
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            backgroundColor: userHasCustomOverride ? '#fffbeb' : '#eff6ff',
            border: `1px solid ${userHasCustomOverride ? '#fde68a' : '#bfdbfe'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            marginBottom: '1.25rem',
            fontSize: '0.8rem',
            color: userHasCustomOverride ? '#92400e' : '#1e40af'
          }}>
            <Info size={16} color={userHasCustomOverride ? '#d97706' : '#2563eb'} style={{ flexShrink: 0 }} />
            <span>
              {userHasCustomOverride ? (
                <>
                  Custom privileges are active for <strong>{selectedUserObj?.name}</strong> (User ID: <code>{selectedUserObj?.userId}</code>).
                  These customized privileges override their assigned role (<strong>{selectedUserObj?.role}</strong>). Click "Reset to Role Defaults" anytime to revert.
                </>
              ) : (
                <>
                  Currently showing inherited privileges from Role: <strong>{selectedUserObj?.role}</strong> for <strong>{selectedUserObj?.name}</strong>.
                  Toggling any checkbox and clicking "SAVE User Permissions" will establish a custom override specifically for this user.
                </>
              )}
            </span>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="crm-table">
              <thead>
                <tr>
                  <th style={{ width: '18%' }}>User</th>
                  <th style={{ width: '16%' }}>Assigned Role</th>
                  <th style={{ width: '26%' }}>CRM Module</th>
                  <th style={{ textAlign: 'center', width: '10%' }}>Can View</th>
                  <th style={{ textAlign: 'center', width: '10%' }}>Can Create</th>
                  <th style={{ textAlign: 'center', width: '10%' }}>Can Edit</th>
                  <th style={{ textAlign: 'center', width: '10%' }}>Can Delete</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                      <RefreshCw size={26} color="#2563eb" className="spin-animation" style={{ margin: '0 auto 0.75rem' }} />
                      <div style={{ fontWeight: '600', fontSize: '1rem', color: '#0f172a' }}>Fetching user permissions...</div>
                    </td>
                  </tr>
                ) : !selectedUserObj ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                      <div style={{ fontWeight: '700', fontSize: '1rem', color: '#64748b' }}>No User Selected</div>
                      <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Please select a user from the dropdown above.</div>
                    </td>
                  </tr>
                ) : (
                  effectiveUserPermissions.map((r, idx) => {
                    const isAdmin = selectedUserObj.role?.toLowerCase() === 'admin';
                    const modObj = STANDARD_MODULES.find(m => m.key.toLowerCase() === r.Module.toLowerCase());
                    const moduleLabel = modObj ? modObj.label : r.Module;

                    return (
                      <tr 
                        key={`${selectedUserId}_${r.Module}_${idx}`}
                        style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fcfcfd' }}
                      >
                        <td>
                          <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.85rem' }}>
                            {selectedUserObj.name}
                          </div>
                          <span style={{ fontSize: '0.725rem', color: '#64748b', fontFamily: 'monospace' }}>
                            {selectedUserObj.userId}
                          </span>
                        </td>

                        <td>
                          <span className={`badge ${isAdmin ? 'badge-primary' : 'badge-neutral'}`} style={{ fontSize: '0.75rem' }}>
                            {selectedUserObj.role}
                          </span>
                        </td>

                        <td>
                          <strong style={{ color: '#0f172a', fontSize: '0.85rem' }}>
                            {moduleLabel}
                          </strong>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', fontFamily: 'monospace' }}>
                            {r.Module}
                          </span>
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={Boolean(r.CanView)}
                            disabled={!canEditRights}
                            onChange={() => toggleUserPermission(r.Module, 'CanView')}
                            style={{ width: '18px', height: '18px', cursor: canEditRights ? 'pointer' : 'not-allowed', accentColor: '#2563eb' }}
                          />
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={Boolean(r.CanCreate)}
                            disabled={!canEditRights}
                            onChange={() => toggleUserPermission(r.Module, 'CanCreate')}
                            style={{ width: '18px', height: '18px', cursor: canEditRights ? 'pointer' : 'not-allowed', accentColor: '#2563eb' }}
                          />
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={Boolean(r.CanEdit)}
                            disabled={!canEditRights}
                            onChange={() => toggleUserPermission(r.Module, 'CanEdit')}
                            style={{ width: '18px', height: '18px', cursor: canEditRights ? 'pointer' : 'not-allowed', accentColor: '#2563eb' }}
                          />
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={Boolean(r.CanDelete)}
                            disabled={!canEditRights}
                            onChange={() => toggleUserPermission(r.Module, 'CanDelete')}
                            style={{ width: '18px', height: '18px', cursor: canEditRights ? 'pointer' : 'not-allowed', accentColor: '#2563eb' }}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );

  if (inline) {
    return content;
  }

  return (
    <div className="main-content">
      <Header
        title="User Rights & Permissions"
        subtitle="Role-Based Access Control (RBAC) & User-Level Privilege Customization"
        onRefresh={loadRightsAndRoles}
        refreshing={loading}
        onOpenBackup={onOpenBackup}
      />
      <div className="page-wrapper">
        {content}
      </div>
    </div>
  );
}
