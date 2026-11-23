import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  UserPlus,
  UserCheck,
  ShieldCheck,
  Shield,
  Search,
  RefreshCw,
  Edit3,
  Trash2,
  RotateCcw,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Calendar,
  X,
  User,
  Hash,
  Smartphone,
  AtSign,
  Activity,
  Check
} from 'lucide-react';
import { crmApi, subscribeCrmEvents } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { showSuccess, showError, showConfirm } from '../utils/swal';

export default function UserMaster({ onOpenBackup }) {
  const { user, isSuperAdmin } = useAuth();

  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [adminFilter, setAdminFilter] = useState('all'); // 'all' | 'superadmin' | 'standard'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Active' | 'Inactive'
  const [showDeleted, setShowDeleted] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    UserId: '',
    FullName: '',
    Email: '',
    AlternateEmailsList: '',
    Mobile: '',
    AlternateMobile: '',
    Password: '',
    IsSuperAdmin: false,
    Status: 'Active'
  });

  // Load Users
  const loadUsers = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const res = await crmApi.getCentralUsers(true);
      setUsers(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to load Central Users:', err);
      showError('Failed to load users: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();

    const unsub = subscribeCrmEvents((evt) => {
      if (
        evt.module === 'UserMaster' ||
        evt.module === 'TenantUserMapping' ||
        evt.action === 'userUpdated' ||
        evt.subType === 'USER_MASTER_UPDATED' ||
        evt.subType === 'USER_MASTER_DELETED' ||
        evt.subType === 'USER_MASTER_RESTORED'
      ) {
        loadUsers(true);
      }
    });

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [loadUsers]);

  // Compute next candidate UserId
  const nextUserIdPreview = useMemo(() => {
    let max = 0;
    (users || []).forEach(u => {
      const m = String(u.UserId || '').match(/USER(\d+)/i);
      if (m) {
        const val = parseInt(m[1], 10);
        if (val > max) max = val;
      }
    });
    return `USER${max + 1}`;
  }, [users]);

  // KPIs
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => !u.IsDeleted && (u.Status || 'Active').toLowerCase() === 'active').length;
    const superAdmins = users.filter(u => !u.IsDeleted && (u.IsSuperAdmin === true || String(u.IsSuperAdmin).toLowerCase() === 'true')).length;
    const inactiveOrDeleted = users.filter(u => u.IsDeleted || (u.Status || '').toLowerCase() === 'inactive').length;
    return { total, active, superAdmins, inactiveOrDeleted };
  }, [users]);

  // Filtered list
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const isDel = u.IsDeleted === true || String(u.IsDeleted).toLowerCase() === 'true';
      if (!showDeleted && isDel) return false;

      // Admin filter
      const isSuper = u.IsSuperAdmin === true || String(u.IsSuperAdmin).toLowerCase() === 'true';
      if (adminFilter === 'superadmin' && !isSuper) return false;
      if (adminFilter === 'standard' && isSuper) return false;

      // Status filter
      if (statusFilter !== 'all') {
        const curStatus = (u.Status || 'Active').toLowerCase();
        if (curStatus !== statusFilter.toLowerCase()) return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const nameMatch = String(u.FullName || '').toLowerCase().includes(q);
        const emailMatch = String(u.Email || '').toLowerCase().includes(q);
        const altEmailMatch = String(u.AlternateEmailsList || u.AlternateEmails || '').toLowerCase().includes(q);
        const mobileMatch = String(u.Mobile || '').toLowerCase().includes(q);
        const altMobileMatch = String(u.AlternateMobile || '').toLowerCase().includes(q);
        const idMatch = String(u.UserId || '').toLowerCase().includes(q);
        if (!nameMatch && !emailMatch && !altEmailMatch && !mobileMatch && !altMobileMatch && !idMatch) {
          return false;
        }
      }

      return true;
    });
  }, [users, showDeleted, adminFilter, statusFilter, search]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingUser(null);
    setShowPassword(false);
    setFormData({
      UserId: nextUserIdPreview,
      FullName: '',
      Email: '',
      AlternateEmailsList: '',
      Mobile: '',
      AlternateMobile: '',
      Password: '',
      IsSuperAdmin: false,
      Status: 'Active'
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setShowPassword(false);
    setFormData({
      UserId: u.UserId || '',
      FullName: u.FullName || '',
      Email: u.Email || '',
      AlternateEmailsList: u.AlternateEmailsList || u.AlternateEmails || '',
      Mobile: u.Mobile || '',
      AlternateMobile: u.AlternateMobile || '',
      Password: '', // keep blank unless user wants to change it
      IsSuperAdmin: u.IsSuperAdmin === true || String(u.IsSuperAdmin).toLowerCase() === 'true',
      Status: u.Status || 'Active'
    });
    setIsModalOpen(true);
  };

  // Save User
  const handleSave = async (e) => {
    if (e) e.preventDefault();

    if (!formData.FullName.trim()) {
      showError('Please enter the user full name.');
      return;
    }
    if (!formData.Email.trim()) {
      showError('Please enter a valid primary email address.');
      return;
    }
    if (!formData.Mobile.trim()) {
      showError('Please enter a primary mobile number.');
      return;
    }
    if (!editingUser && !formData.Password.trim()) {
      showError('Please set an initial account password.');
      return;
    }

    try {
      setSaving(true);
      await crmApi.saveCentralUser({
        ...formData,
        requesterEmail: user?.email,
        userEmail: user?.email,
        isSuperAdmin: true
      });

      showSuccess(editingUser ? 'User details updated successfully.' : 'New user created successfully.');
      setIsModalOpen(false);
      loadUsers(true);
    } catch (err) {
      console.error('Save user failed:', err);
      showError(err.message || 'Failed to save user.');
    } finally {
      setSaving(false);
    }
  };

  // Soft Delete User
  const handleDelete = async (u) => {
    const isSelf = String(u.Email || '').toLowerCase() === String(user?.email || '').toLowerCase();
    if (isSelf) {
      showError('You cannot delete your own logged-in Super Admin account.');
      return;
    }

    const confirmed = await showConfirm(
      'Delete User?',
      `Are you sure you want to delete "${u.FullName}" (${u.UserId})? This will deactivate their workspace logins across all tenants.`
    );
    if (!confirmed) return;

    try {
      await crmApi.deleteCentralUser(u.UserId);
      showSuccess(`User "${u.FullName}" has been deleted.`);
      loadUsers(true);
    } catch (err) {
      console.error('Delete failed:', err);
      showError(err.message || 'Failed to delete user.');
    }
  };

  // Restore User
  const handleRestore = async (u) => {
    const confirmed = await showConfirm(
      'Restore User?',
      `Do you want to restore access for "${u.FullName}" (${u.UserId})?`
    );
    if (!confirmed) return;

    try {
      await crmApi.restoreCentralUser(u.UserId);
      showSuccess(`User "${u.FullName}" has been restored.`);
      loadUsers(true);
    } catch (err) {
      console.error('Restore failed:', err);
      showError(err.message || 'Failed to restore user.');
    }
  };

  return (
    <div className="crm-page-container">
      <Header
        title="User Master"
        subtitle="Central SaaS Identity Management & Authentication Registry"
        onOpenBackup={onOpenBackup}
      />

      <div className="crm-page-content" style={{ padding: '1.5rem 2rem' }}>
        {/* Top KPI Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          {/* Card 1: Total Users */}
          <div className="crm-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Total Central Users</span>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb'
              }}>
                <Users size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a', marginTop: '0.5rem' }}>
              {stats.total}
            </div>
            <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '0.25rem' }}>
              Registered in Central User_Master
            </div>
          </div>

          {/* Card 2: Active Users */}
          <div className="crm-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Active Users</span>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#ecfdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669'
              }}>
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#059669', marginTop: '0.5rem' }}>
              {stats.active}
            </div>
            <div style={{ fontSize: '0.725rem', color: '#059669', marginTop: '0.25rem', fontWeight: '600' }}>
              Enabled for tenant workspace logins
            </div>
          </div>

          {/* Card 3: Super Admins */}
          <div className="crm-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Super Admins</span>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#f5f3ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7c3aed'
              }}>
                <ShieldCheck size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#7c3aed', marginTop: '0.5rem' }}>
              {stats.superAdmins}
            </div>
            <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '0.25rem' }}>
              Full SaaS platform management
            </div>
          </div>

          {/* Card 4: Inactive / Deleted */}
          <div className="crm-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Inactive / Deleted</span>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626'
              }}>
                <XCircle size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: stats.inactiveOrDeleted > 0 ? '#dc2626' : '#64748b', marginTop: '0.5rem' }}>
              {stats.inactiveOrDeleted}
            </div>
            <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '0.25rem' }}>
              Access revoked or deactivated
            </div>
          </div>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="crm-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            {/* Search Box */}
            <div style={{ position: 'relative', flex: 1, minWidth: '260px', maxWidth: '400px' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search by name, email, mobile, User ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>

            {/* Filters & Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <select
                className="form-select"
                value={adminFilter}
                onChange={(e) => setAdminFilter(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="all">All Roles</option>
                <option value="superadmin">Super Admins Only</option>
                <option value="standard">Standard Users Only</option>
              </select>

              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#475569', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={showDeleted}
                  onChange={(e) => setShowDeleted(e.target.checked)}
                />
                <span>Show Deleted</span>
              </label>

              <button
                className="btn btn-neutral"
                onClick={() => loadUsers(true)}
                disabled={loading || refreshing}
                title="Refresh user list"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <RefreshCw size={14} className={refreshing ? 'spin-anim' : ''} />
                <span>Refresh</span>
              </button>

              <button
                className="btn btn-primary"
                onClick={handleOpenAdd}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <UserPlus size={16} />
                <span>Add User</span>
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="crm-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#fafafa'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={16} color="#64748b" />
              <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#1e293b' }}>
                Central Users Directory
              </span>
              <span style={{
                backgroundColor: '#e2e8f0',
                color: '#475569',
                fontSize: '0.75rem',
                fontWeight: '700',
                padding: '1px 8px',
                borderRadius: '999px'
              }}>
                {filteredUsers.length}
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Primary sign-in credentials & identity mapping
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="crm-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>User ID & Full Name</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Email Accounts</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Mobile Contacts</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Role</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Updated</th>
                  <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                      <RefreshCw size={24} className="spin-anim" style={{ margin: '0 auto 0.75rem', color: '#3b82f6' }} />
                      <p style={{ margin: 0, fontWeight: '500' }}>Loading central users...</p>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                      <Info size={28} style={{ margin: '0 auto 0.5rem', color: '#94a3b8' }} />
                      <p style={{ margin: 0, fontWeight: '600', color: '#334155' }}>No central users found</p>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                        {search ? 'Try clearing your search query or filters.' : 'Click "Add User" above to register a new user in Central DB.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => {
                    const isDel = u.IsDeleted === true || String(u.IsDeleted).toLowerCase() === 'true';
                    const isSuper = u.IsSuperAdmin === true || String(u.IsSuperAdmin).toLowerCase() === 'true';
                    const isActive = (u.Status || 'Active').toLowerCase() === 'active';
                    const initials = (u.FullName || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

                    return (
                      <tr
                        key={u.UserId}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          backgroundColor: isDel ? '#fff5f5' : 'transparent',
                          opacity: isDel ? 0.75 : 1
                        }}
                      >
                        {/* User ID & Full Name */}
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              backgroundColor: isSuper ? '#7c3aed' : '#2563eb',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '700',
                              fontSize: '0.85rem'
                            }}>
                              {initials}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.875rem' }}>
                                  {u.FullName || 'Unnamed User'}
                                </span>
                                <span style={{
                                  backgroundColor: '#f1f5f9',
                                  color: '#475569',
                                  fontSize: '0.675rem',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  fontFamily: 'monospace',
                                  fontWeight: '600'
                                }}>
                                  {u.UserId}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.725rem', color: '#64748b' }}>
                                Central SaaS Account
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Email Accounts */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Mail size={13} color="#2563eb" />
                            <span style={{ fontSize: '0.825rem', fontWeight: '600', color: '#1e293b' }}>
                              {u.Email}
                            </span>
                          </div>
                          {(u.AlternateEmailsList || u.AlternateEmails) && (
                            <div style={{ marginTop: '0.2rem', fontSize: '0.725rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <span style={{ fontWeight: '500', color: '#94a3b8' }}>Alt:</span>
                              <span style={{ wordBreak: 'break-all' }}>{u.AlternateEmailsList || u.AlternateEmails}</span>
                            </div>
                          )}
                        </td>

                        {/* Mobile Contacts */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Phone size={13} color="#059669" />
                            <span style={{ fontSize: '0.825rem', fontWeight: '600', color: '#1e293b' }}>
                              {u.Mobile || '—'}
                            </span>
                          </div>
                          {u.AlternateMobile && (
                            <div style={{ marginTop: '0.2rem', fontSize: '0.725rem', color: '#64748b' }}>
                              <span style={{ fontWeight: '500', color: '#94a3b8' }}>Alt: </span>
                              <span>{u.AlternateMobile}</span>
                            </div>
                          )}
                        </td>

                        {/* Role / SuperAdmin */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {isSuper ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              backgroundColor: '#f5f3ff',
                              color: '#7c3aed',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              border: '1px solid #ddd6fe'
                            }}>
                              <ShieldCheck size={13} />
                              Super Admin
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              backgroundColor: '#f1f5f9',
                              color: '#475569',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}>
                              <Shield size={13} />
                              Standard User
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {isDel ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              backgroundColor: '#fee2e2',
                              color: '#b91c1c',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '700'
                            }}>
                              <XCircle size={12} />
                              Deleted
                            </span>
                          ) : isActive ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              backgroundColor: '#ecfdf5',
                              color: '#059669',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '700'
                            }}>
                              <CheckCircle2 size={12} />
                              Active
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              backgroundColor: '#f1f5f9',
                              color: '#64748b',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}>
                              Inactive
                            </span>
                          )}
                        </td>

                        {/* Updated / Audit */}
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', color: '#64748b' }}>
                          {u.Updated_At ? (
                            <div>
                              <div>{new Date(u.Updated_At).toLocaleDateString()}</div>
                              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                {new Date(u.Updated_At).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          ) : u.Created_At ? (
                            <div>
                              <div>{new Date(u.Created_At).toLocaleDateString()}</div>
                              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Created</div>
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                            {isDel ? (
                              <button
                                className="btn btn-neutral"
                                onClick={() => handleRestore(u)}
                                title="Restore User"
                                style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                              >
                                <RotateCcw size={13} />
                                <span>Restore</span>
                              </button>
                            ) : (
                              <>
                                <button
                                  className="btn btn-neutral"
                                  onClick={() => handleOpenEdit(u)}
                                  title="Edit User"
                                  style={{ padding: '6px', color: '#2563eb' }}
                                >
                                  <Edit3 size={15} />
                                </button>
                                <button
                                  className="btn btn-neutral"
                                  onClick={() => handleDelete(u)}
                                  title="Delete User"
                                  style={{ padding: '6px', color: '#ef4444' }}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !saving && setIsModalOpen(false)}
        hideHeader={true}
        maxWidth="720px"
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Custom Header with Primary Color */}
          <div style={{
            background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
            color: '#ffffff',
            padding: '1.25rem 1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)'
              }}>
                {editingUser ? <Edit3 size={20} /> : <UserPlus size={20} />}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.01em' }}>
                  {editingUser ? `Edit Central User (${formData.UserId})` : 'Add Central User'}
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.785rem', color: '#dbeafe', fontWeight: '400' }}>
                  Central SaaS Authentication & Platform Identity Registry
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => !saving && setIsModalOpen(false)}
              aria-label="Close modal"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Body with Padding & Input Icons */}
          <form onSubmit={handleSave} style={{ margin: 0 }}>
            <div style={{
              padding: '1.75rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.35rem',
              maxHeight: '72vh',
              overflowY: 'auto'
            }}>
              {/* Row 1: User ID & Full Name */}
              <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '1.25rem' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '0.825rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.45rem' }}>
                    <Hash size={14} color="#64748b" />
                    <span>User ID</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.UserId}
                      readOnly
                      disabled
                      style={{
                        backgroundColor: '#f1f5f9',
                        fontWeight: '700',
                        color: '#475569',
                        height: '42px',
                        borderRadius: '8px',
                        cursor: 'not-allowed',
                        fontFamily: 'monospace',
                        letterSpacing: '0.04em'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '0.825rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.45rem' }}>
                    <User size={14} color="#2563eb" />
                    <span>Full Name <span style={{ color: '#ef4444' }}>*</span></span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Gopal Kushwaha"
                      value={formData.FullName}
                      onChange={(e) => setFormData({ ...formData, FullName: e.target.value })}
                      required
                      style={{ paddingLeft: '2.5rem', height: '42px', borderRadius: '8px', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Official Email & Alternate Emails */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '0.825rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.45rem' }}>
                    <Mail size={14} color="#2563eb" />
                    <span>Primary Official Email <span style={{ color: '#ef4444' }}>*</span></span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type="email"
                      className="form-input"
                      placeholder="e.g. user@domain.com"
                      value={formData.Email}
                      onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                      required
                      style={{ paddingLeft: '2.5rem', height: '42px', borderRadius: '8px', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '0.825rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.45rem' }}>
                    <AtSign size={14} color="#64748b" />
                    <span>Alternate Emails (Comma-separated)</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <AtSign size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. personal@gmail.com, alt@domain.com"
                      value={formData.AlternateEmailsList}
                      onChange={(e) => setFormData({ ...formData, AlternateEmailsList: e.target.value })}
                      style={{ paddingLeft: '2.5rem', height: '42px', borderRadius: '8px', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Mobile & Alternate Mobile */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '0.825rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.45rem' }}>
                    <Phone size={14} color="#059669" />
                    <span>Primary Mobile Number <span style={{ color: '#ef4444' }}>*</span></span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="e.g. 9820199999"
                      value={formData.Mobile}
                      onChange={(e) => setFormData({ ...formData, Mobile: e.target.value })}
                      required
                      style={{ paddingLeft: '2.5rem', height: '42px', borderRadius: '8px', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '0.825rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.45rem' }}>
                    <Smartphone size={14} color="#64748b" />
                    <span>Alternate Mobile (Optional)</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Smartphone size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="e.g. 9820188888"
                      value={formData.AlternateMobile}
                      onChange={(e) => setFormData({ ...formData, AlternateMobile: e.target.value })}
                      style={{ paddingLeft: '2.5rem', height: '42px', borderRadius: '8px', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Account Password */}
              <div>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '0.825rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.45rem' }}>
                  <Lock size={14} color="#2563eb" />
                  <span>
                    {editingUser ? 'Change Account Password (Leave blank to keep unchanged)' : 'Account Password'} {!editingUser && <span style={{ color: '#ef4444' }}>*</span>}
                  </span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder={editingUser ? '•••••••• (leave blank to retain existing)' : 'Enter initial secure password'}
                    value={formData.Password}
                    onChange={(e) => setFormData({ ...formData, Password: e.target.value })}
                    required={!editingUser}
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem', height: '42px', borderRadius: '8px', fontSize: '0.875rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.35rem' }}>
                  <Info size={12} color="#64748b" />
                  <span style={{ fontSize: '0.725rem', color: '#64748b' }}>
                    Passwords are securely hashed with SHA-256 before storage in Central DB.
                  </span>
                </div>
              </div>

              {/* Row 5: Role & Account Status Elevated Box */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 0.8fr',
                gap: '1.25rem',
                padding: '1.25rem',
                backgroundColor: '#f8fafc',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                alignItems: 'center'
              }}>
                {/* Is SuperAdmin */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={formData.IsSuperAdmin}
                      onChange={(e) => setFormData({ ...formData, IsSuperAdmin: e.target.checked })}
                      style={{ marginTop: '0.25rem', width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <ShieldCheck size={16} color={formData.IsSuperAdmin ? '#7c3aed' : '#64748b'} />
                        <span style={{ fontSize: '0.875rem', fontWeight: '700', color: formData.IsSuperAdmin ? '#7c3aed' : '#1e293b' }}>
                          Grant Super Admin Access
                        </span>
                      </div>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.725rem', color: '#64748b', lineHeight: 1.4 }}>
                        Provides unrestricted access to manage all tenants, license plans, backups, and user identities.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Status */}
                <div>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '0.825rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.45rem' }}>
                    <Activity size={14} color="#059669" />
                    <span>Account Status</span>
                  </label>
                  <select
                    className="form-select"
                    value={formData.Status}
                    onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
                    style={{ height: '42px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600' }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer with Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.85rem',
              padding: '1.25rem 2rem',
              borderTop: '1px solid #f1f5f9',
              backgroundColor: '#fafafa',
              borderBottomLeftRadius: '12px',
              borderBottomRightRadius: '12px'
            }}>
              <button
                type="button"
                className="btn btn-neutral"
                onClick={() => !saving && setIsModalOpen(false)}
                disabled={saving}
                style={{ padding: '0.65rem 1.4rem', fontSize: '0.875rem', fontWeight: '600' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                style={{
                  padding: '0.65rem 1.6rem',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)'
                }}
              >
                {saving ? (
                  <RefreshCw size={15} className="spin-anim" />
                ) : editingUser ? (
                  <Check size={16} />
                ) : (
                  <UserPlus size={16} />
                )}
                <span>{editingUser ? 'Update User' : 'Create User'}</span>
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
