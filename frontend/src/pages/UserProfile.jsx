import React, { useState } from 'react';
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
import { crmApi } from '../services/api';
import Header from '../components/Header';

export default function UserProfile() {
  const { user, rights, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });

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
                backgroundColor: '#059669',
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
                  <span className="badge badge-success">{user?.role || 'Admin'}</span>
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
                backgroundColor: profileMsg.type === 'success' ? '#dcfce7' : '#fee2e2',
                color: profileMsg.type === 'success' ? '#15803d' : '#b91c1c'
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
                  value={user?.role || 'Admin'}
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
            <ShieldCheck size={20} color="#059669" />
            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Your Active Permissions ({user?.role || 'Admin'})
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
                {['Dashboard', 'Customers', 'Staff', 'Settings'].map((mod) => {
                  const perm = rights.find(r => r.Module && r.Module.toLowerCase() === mod.toLowerCase());
                  const isAdmin = user?.role === 'Admin';
                  return (
                    <tr key={mod}>
                      <td><strong>{mod}</strong></td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${isAdmin || perm?.CanView ? 'badge-success' : 'badge-danger'}`}>
                          {isAdmin || perm?.CanView ? 'Allowed' : 'Restricted'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${isAdmin || perm?.CanCreate ? 'badge-success' : 'badge-danger'}`}>
                          {isAdmin || perm?.CanCreate ? 'Allowed' : 'Restricted'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${isAdmin || perm?.CanEdit ? 'badge-success' : 'badge-danger'}`}>
                          {isAdmin || perm?.CanEdit ? 'Allowed' : 'Restricted'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${isAdmin || perm?.CanDelete ? 'badge-success' : 'badge-danger'}`}>
                          {isAdmin || perm?.CanDelete ? 'Allowed' : 'Restricted'}
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

