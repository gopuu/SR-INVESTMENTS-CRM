import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Save, 
  RefreshCw, 
  Check, 
  X, 
  Filter, 
  CheckSquare, 
  Square,
  Lock,
  Info
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
  const { user, hasPermission } = useAuth();
  const [rights, setRights] = useState([]);
  const [availableRoles, setAvailableRoles] = useState(['Admin', 'Relationship Manager', 'Backoffice Staff']);
  const [selectedRole, setSelectedRole] = useState('ALL'); // 'ALL' or specific role name
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const canEditRights = user?.role === 'Admin' || hasPermission('RolesRights', 'CanEdit');

  const loadRightsAndRoles = async () => {
    try {
      setLoading(true);
      const [rtsRes, rolesRes] = await Promise.all([
        crmApi.call('getRolesRights').catch(() => []),
        crmApi.call('getRoles', { includeDeleted: false }).catch(() => [])
      ]);

      const loadedRights = Array.isArray(rtsRes) ? rtsRes : [];
      const loadedRoles = Array.isArray(rolesRes) ? rolesRes : [];

      // Extract unique role names from roles master and rights
      const roleSet = new Set(['Admin', 'Relationship Manager', 'Backoffice Staff']);
      loadedRoles.forEach(r => {
        if (r.RoleName) roleSet.add(r.RoleName);
      });
      loadedRights.forEach(r => {
        if (r.Role) roleSet.add(r.Role);
      });

      const roleList = Array.from(roleSet);
      setAvailableRoles(roleList);

      // Build complete rights list ensuring all standard modules exist for each role
      const fullRightsList = [];
      roleList.forEach(role => {
        STANDARD_MODULES.forEach(mod => {
          const existing = loadedRights.find(
            r => r.Role && r.Role.toLowerCase() === role.toLowerCase() &&
                 r.Module && r.Module.toLowerCase() === mod.key.toLowerCase()
          );

          if (existing) {
            fullRightsList.push({
              ...existing,
              Role: role,
              Module: mod.key,
              CanView: Boolean(existing.CanView === true || existing.CanView === 'true' || existing.CanView === 1),
              CanCreate: Boolean(existing.CanCreate === true || existing.CanCreate === 'true' || existing.CanCreate === 1),
              CanEdit: Boolean(existing.CanEdit === true || existing.CanEdit === 'true' || existing.CanEdit === 1),
              CanDelete: Boolean(existing.CanDelete === true || existing.CanDelete === 'true' || existing.CanDelete === 1)
            });
          } else {
            const isAdmin = role.toLowerCase() === 'admin';
            fullRightsList.push({
              Role: role,
              Module: mod.key,
              CanView: isAdmin,
              CanCreate: isAdmin,
              CanEdit: isAdmin,
              CanDelete: isAdmin
            });
          }
        });
      });

      setRights(fullRightsList);

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
      if (evt.module === 'RolesRights' || evt.module === 'MasterRoles') {
        loadRightsAndRoles();
      }
    });
    return unsub;
  }, []);

  // Filtered rows based on selectedRole
  const displayedRights = useMemo(() => {
    if (selectedRole === 'ALL') {
      return rights;
    }
    return rights.filter(r => r.Role && r.Role.toLowerCase() === selectedRole.toLowerCase());
  }, [rights, selectedRole]);

  // Toggle single permission checkbox
  const togglePermission = (role, moduleKey, action) => {
    if (!canEditRights) {
      showWarning('Permission Denied', 'You do not have rights to edit user permissions.');
      return;
    }

    setRights(prev => prev.map(r => {
      if (r.Role === role && r.Module === moduleKey) {
        return {
          ...r,
          [action]: !r[action]
        };
      }
      return r;
    }));
  };

  // Bulk allow all for selected role
  const handleBulkAllowRole = () => {
    if (selectedRole === 'ALL') return;
    if (!canEditRights) return;

    setRights(prev => prev.map(r => {
      if (r.Role && r.Role.toLowerCase() === selectedRole.toLowerCase()) {
        return { ...r, CanView: true, CanCreate: true, CanEdit: true, CanDelete: true };
      }
      return r;
    }));
  };

  // Bulk deny all for selected role
  const handleBulkDenyRole = () => {
    if (selectedRole === 'ALL') return;
    if (!canEditRights) return;
    if (selectedRole.toLowerCase() === 'admin') {
      showWarning('Admin Protected', 'Admin role must retain permissions.');
      return;
    }

    setRights(prev => prev.map(r => {
      if (r.Role && r.Role.toLowerCase() === selectedRole.toLowerCase()) {
        return { ...r, CanView: false, CanCreate: false, CanEdit: false, CanDelete: false };
      }
      return r;
    }));
  };

  // Save all rights
  const handleSaveRights = async () => {
    if (!canEditRights) {
      showError('Restricted', 'Only Admins can save role rights.');
      return;
    }

    try {
      setSaving(true);
      await crmApi.call('saveRolesRights', rights);
      showSuccess('Permissions Saved', 'Role rights matrix has been updated in Google Sheets.');
    } catch (err) {
      console.error('Failed to save roles rights:', err);
      showError('Save Failed', err?.message || 'Could not save permissions.');
    } finally {
      setSaving(false);
    }
  };

  const content = (
    <div className="crm-card" style={{ padding: '2rem' }}>
      {/* Top Controls Bar: Role Dropdown on left side of Save button */}
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
              Role-Based Access Control (RBAC) Matrix
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Configure View, Create, Edit, and Delete privileges for each role across all CRM modules.
          </p>
        </div>

        {/* Right side group: ROLE dropdown kept on left side of SAVE btn */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          {/* Role Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.825rem', fontWeight: '700', color: '#334155', whiteSpace: 'nowrap' }}>
              Select Role:
            </label>
            <select
              className="form-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{
                width: 'auto',
                minWidth: '180px',
                fontWeight: '600',
                color: '#0f172a',
                borderColor: '#93c5fd',
                backgroundColor: '#ffffff',
                padding: '0.5rem 0.85rem'
              }}
            >
              <option value="ALL">ALL Roles ({availableRoles.length})</option>
              {availableRoles.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Quick Allow / Deny buttons when specific role selected */}
          {selectedRole !== 'ALL' && canEditRights && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
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

          {/* SAVE BUTTON */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSaveRights}
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
                <span>Saving Permissions...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>SAVE Permissions</span>
              </>
            )}
          </button>
        </div>
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
          Showing permissions for: <strong>{selectedRole === 'ALL' ? 'ALL Roles' : selectedRole}</strong>. 
          Admins automatically possess full privileges across all tenant modules. Non-admin roles strictly obey this matrix.
        </span>
      </div>

      {/* Permissions Table */}
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
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  <RefreshCw size={24} color="#2563eb" className="spin-animation" style={{ margin: '0 auto 0.5rem' }} />
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>Loading permissions matrix from Google Sheets...</p>
                </td>
              </tr>
            ) : displayedRights.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                  No permission records found for the selected role.
                </td>
              </tr>
            ) : (
              displayedRights.map((r, idx) => {
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
                        onChange={() => togglePermission(r.Role, r.Module, 'CanView')}
                        style={{ width: '18px', height: '18px', cursor: canEditRights ? 'pointer' : 'not-allowed', accentColor: '#2563eb' }}
                      />
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={Boolean(r.CanCreate)}
                        disabled={!canEditRights}
                        onChange={() => togglePermission(r.Role, r.Module, 'CanCreate')}
                        style={{ width: '18px', height: '18px', cursor: canEditRights ? 'pointer' : 'not-allowed', accentColor: '#2563eb' }}
                      />
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={Boolean(r.CanEdit)}
                        disabled={!canEditRights}
                        onChange={() => togglePermission(r.Role, r.Module, 'CanEdit')}
                        style={{ width: '18px', height: '18px', cursor: canEditRights ? 'pointer' : 'not-allowed', accentColor: '#2563eb' }}
                      />
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={Boolean(r.CanDelete)}
                        disabled={!canEditRights}
                        onChange={() => togglePermission(r.Role, r.Module, 'CanDelete')}
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
    </div>
  );

  if (inline) {
    return content;
  }

  return (
    <div className="main-content">
      <Header
        title="User Rights & Permissions"
        subtitle="Role-Based Access Control (RBAC) Matrix - Manage module privileges per role"
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
