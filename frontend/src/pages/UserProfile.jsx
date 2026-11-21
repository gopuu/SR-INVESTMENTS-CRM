import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Save, 
  Clock, 
  Mail,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { crmApi, subscribeCrmEvents } from '../services/api';
import Header from '../components/Header';

export default function UserProfile({ onOpenBackup }) {
  const { user, rights, updateProfile, hasPermission, isSuperAdmin } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });
  const [profileRefresh, setProfileRefresh] = useState(0);

  useEffect(() => {
    const handleRefresh = () => setProfileRefresh(k => k + 1);
    window.addEventListener('CRM_NAVBAR_REFRESH', handleRefresh);
    const unsub = subscribeCrmEvents(evt => {
      if (evt.module === 'Auth' || evt.module === 'TenantUserMapping') {
        setProfileRefresh(k => k + 1);
      }
    });
    return () => {
      window.removeEventListener('CRM_NAVBAR_REFRESH', handleRefresh);
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState({ text: '', type: '' });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg({ text: '', type: '' });
    try {
      await crmApi.call('updateUserProfile', { userId: user.userId, name });
      updateProfile({ name });
      setProfileMsg({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setProfileMsg({ text: err.message || 'Failed to update profile', type: 'error' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg({ text: '', type: '' });

    if (newPassword.length < 6) {
      setPwMsg({ text: 'New password must be at least 6 characters long.', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwMsg({ text: 'New password and confirmation do not match.', type: 'error' });
      return;
    }

    setPwSaving(true);
    try {
      await crmApi.call('changePassword', {
        userId: user.userId,
        oldPassword,
        newPassword
      });
      setPwMsg({ text: 'Password updated successfully!', type: 'success' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwMsg({ text: err.message || 'Failed to change password', type: 'error' });
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header 
        title="User Profile & Security" 
        subtitle="Manage your personal credentials, session details and active role permissions"
        onOpenBackup={onOpenBackup}
      />

      <div className="page-wrapper">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          {/* Profile Details Card */}
          <div className="crm-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                fontWeight: '700'
              }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  {user?.name || 'Administrator'}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
                  <span className="badge badge-primary">{user?.role || 'Admin'}</span>
                  <span className="badge badge-neutral">{user?.status || 'Active'}</span>
                </div>
              </div>
            </div>

            {profileMsg.text && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1.25rem',
                fontSize: '0.825rem',
                backgroundColor: profileMsg.type === 'success' ? '#dbeafe' : '#fee2e2',
                color: profileMsg.type === 'success' ? '#1e40af' : '#b91c1c'
              }}>
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Read-only)</label>
                <input
                  type="email"
                  className="form-input"
                  style={{ backgroundColor: '#f8fafc', color: '#64748b' }}
                  value={user?.email || ''}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Role</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ backgroundColor: '#f8fafc', color: '#64748b' }}
                  value={user?.role || (isSuperAdmin ? 'Admin' : 'Staff')}
                  disabled
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button type="submit" className="btn btn-primary" disabled={profileSaving}>
                  <Save size={15} /> {profileSaving ? 'Saving...' : 'Update Name'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="crm-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Lock size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  Change Password
                </h3>
                <p style={{ fontSize: '0.785rem', color: '#64748b', margin: '2px 0 0 0' }}>
                  Update your security credentials
                </p>
              </div>
            </div>

            {pwMsg.text && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1.25rem',
                fontSize: '0.825rem',
                backgroundColor: pwMsg.type === 'success' ? '#dcfce7' : '#fee2e2',
                color: pwMsg.type === 'success' ? '#15803d' : '#b91c1c'
              }}>
                {pwMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button type="submit" className="btn btn-secondary" disabled={pwSaving}>
                  <Lock size={15} /> {pwSaving ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* User Permissions Table */}
        <div className="crm-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <ShieldCheck size={20} color="#2563eb" />
            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Your Active Permissions ({user?.role || (isSuperAdmin ? 'Admin' : 'Staff')})
            </h4>
          </div>

          <div className="table-responsive">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th style={{ textAlign: 'center' }}>View</th>
                  <th style={{ textAlign: 'center' }}>Create</th>
                  <th style={{ textAlign: 'center' }}>Edit</th>
                  <th style={{ textAlign: 'center' }}>Delete</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key: 'Dashboard', label: 'Dashboard' },
                  { key: 'Customers', label: 'Customers' },
                  { key: 'Staff', label: 'Staff' },
                  { key: 'RolesRights', label: 'User Rights' },
                  { key: 'MasterHub', label: 'Master HUB' },
                  { key: 'Settings', label: 'Settings' },
                  { key: 'DriveBackup', label: 'DriveBackup' }
                ].map((mod) => {
                  const perm = rights.find(r => r.Module && r.Module.toLowerCase() === mod.key.toLowerCase());
                  const canView = hasPermission ? hasPermission(mod.key, 'CanView') : (user?.role === 'Admin' || Boolean(perm?.CanView));
                  const canCreate = hasPermission ? hasPermission(mod.key, 'CanCreate') : (user?.role === 'Admin' || Boolean(perm?.CanCreate));
                  const canEdit = hasPermission ? hasPermission(mod.key, 'CanEdit') : (user?.role === 'Admin' || Boolean(perm?.CanEdit));
                  const canDelete = hasPermission ? hasPermission(mod.key, 'CanDelete') : (user?.role === 'Admin' || Boolean(perm?.CanDelete));

                  return (
                    <tr key={mod.key}>
                      <td><strong>{mod.label}</strong></td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${canView ? 'badge-primary' : 'badge-danger'}`}>
                          {canView ? 'Allowed' : 'Restricted'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${canCreate ? 'badge-primary' : 'badge-danger'}`}>
                          {canCreate ? 'Allowed' : 'Restricted'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${canEdit ? 'badge-primary' : 'badge-danger'}`}>
                          {canEdit ? 'Allowed' : 'Restricted'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${canDelete ? 'badge-primary' : 'badge-danger'}`}>
                          {canDelete ? 'Allowed' : 'Restricted'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

