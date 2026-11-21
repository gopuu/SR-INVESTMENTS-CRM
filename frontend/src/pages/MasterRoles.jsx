import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Shield, 
  Plus, 
  Edit2, 
  Trash2, 
  RotateCcw, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  XCircle,
  Key
} from 'lucide-react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { crmApi, subscribeCrmEvents, getInitialsCode } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { showSuccess, showError, showConfirm } from '../utils/swal';

export default function MasterRoles({ onOpenBackup }) {
  const { user, hasPermission } = useAuth();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleted, setShowDeleted] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isCodeManual, setIsCodeManual] = useState(false);
  const [formData, setFormData] = useState({
    RoleId: '',
    RoleCode: '',
    RoleName: '',
    Description: '',
    Status: 'Active'
  });

  const canCreate = user?.role === 'Admin' || hasPermission('MasterRoles', 'CanCreate');
  const canEdit = user?.role === 'Admin' || hasPermission('MasterRoles', 'CanEdit');
  const canDelete = user?.role === 'Admin' || hasPermission('MasterRoles', 'CanDelete');

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await crmApi.call('getRoles', { includeDeleted: showDeleted });
      setRoles(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to load roles:', err);
      showError('Load Error', err?.message || 'Failed to load roles.');
    } finally {
      setLoading(false);
    }
  }, [showDeleted]);

  useEffect(() => {
    loadRoles();
    const unsub = subscribeCrmEvents((evt) => {
      if (evt.module === 'MasterHub' || evt.module === 'MasterRoles') {
        loadRoles();
      }
    });
    return unsub;
  }, [loadRoles]);

  const getNextSerial = (items) => {
    let maxNum = 0;
    (items || []).forEach(item => {
      const raw = String(item.RoleCode || '').trim();
      const num = parseInt(raw, 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      } else {
        const match = raw.match(/\d+/g);
        if (match) {
          const val = parseInt(match[match.length - 1], 10);
          if (val > maxNum) maxNum = val;
        }
      }
    });
    return String(Math.max(maxNum, (items || []).length) + 1);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setIsCodeManual(false);
    setFormData({
      RoleId: '',
      RoleCode: '',
      RoleName: '',
      Description: '',
      Status: 'Active'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setIsCodeManual(true);
    setFormData({
      RoleId: item.RoleId || '',
      RoleCode: item.RoleCode || '',
      RoleName: item.RoleName || '',
      Description: item.Description || '',
      Status: item.Status || 'Active'
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const codeVal = String(formData.RoleCode || '').trim().toUpperCase();
    const nameVal = String(formData.RoleName || '').trim();

    if (!nameVal) {
      showError('Validation Error', 'Role Name is required.');
      return;
    }
    if (!codeVal) {
      showError('Validation Error', 'Role Code is required.');
      return;
    }

    // Duplicate Code check
    const dupCode = roles.find(r => 
      r.RoleId !== formData.RoleId &&
      !r.IsDeleted &&
      String(r.RoleCode || '').trim().toLowerCase() === codeVal.toLowerCase()
    );
    if (dupCode) {
      showError('Duplicate Role Code', `"${codeVal}" is already assigned to "${dupCode.RoleName}". Role Code must be unique.`);
      return;
    }

    // Duplicate Name check
    const dupName = roles.find(r => 
      r.RoleId !== formData.RoleId &&
      !r.IsDeleted &&
      String(r.RoleName || '').trim().toLowerCase() === nameVal.toLowerCase()
    );
    if (dupName) {
      showError('Duplicate Role Name', `"${nameVal}" already exists in Role master.`);
      return;
    }

    try {
      setSaving(true);
      await crmApi.call('saveMasterItem', {
        type: 'role',
        data: formData
      });

      showSuccess(
        editingItem ? 'Role Updated' : 'Role Created',
        `Role "${formData.RoleName}" saved successfully.`
      );

      setIsModalOpen(false);
      await loadRoles();
    } catch (err) {
      console.error('Save role failed:', err);
      showError('Save Failed', err?.message || 'Could not save role.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (item.RoleName && item.RoleName.toLowerCase() === 'admin') {
      showError('Restricted', 'The Admin role cannot be deleted.');
      return;
    }

    const confirmed = await showConfirm(
      'Delete Role?',
      `Are you sure you want to delete role "${item.RoleName}"?`,
      'Yes, Delete'
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      await crmApi.call('deleteMasterItem', {
        type: 'role',
        id: item.RoleId
      });
      showSuccess('Role Deleted', `Role "${item.RoleName}" has been removed.`);
      await loadRoles();
    } catch (err) {
      console.error('Delete role failed:', err);
      showError('Delete Failed', err?.message || 'Could not delete role.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (item) => {
    try {
      setLoading(true);
      await crmApi.call('restoreMasterItem', {
        type: 'role',
        id: item.RoleId
      });
      showSuccess('Role Restored', `Role "${item.RoleName}" restored.`);
      await loadRoles();
    } catch (err) {
      console.error('Restore role failed:', err);
      showError('Restore Failed', err?.message || 'Could not restore role.');
    } finally {
      setLoading(false);
    }
  };

  const filteredList = useMemo(() => {
    const q = search.toLowerCase().trim();
    return roles.filter(r => {
      const matchSearch = !q ||
        (r.RoleName && r.RoleName.toLowerCase().includes(q)) ||
        (r.RoleCode && r.RoleCode.toLowerCase().includes(q)) ||
        (r.Description && r.Description.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'all' || 
        String(r.Status || 'Active').toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [roles, search, statusFilter]);

  return (
    <div className="main-content">
      <Header
        title="Role Master"
        subtitle="Define system roles, operational access tiers and privilege hierarchies"
        onRefresh={loadRoles}
        refreshing={loading}
        onOpenBackup={onOpenBackup}
      />

      <div className="page-wrapper">
        {/* KPI Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div className="crm-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Configured Roles</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                <Shield size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a', marginTop: '0.5rem' }}>
              {roles.filter(r => !r.IsDeleted).length}
            </div>
            <div style={{ fontSize: '0.725rem', color: '#16a34a', marginTop: '0.25rem', fontWeight: '600' }}>
              Privilege levels available in RBAC matrix
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="crm-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '380px' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search roles by name, code or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#475569', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showDeleted}
                  onChange={(e) => setShowDeleted(e.target.checked)}
                />
                <span>Show Deleted</span>
              </label>

              {canCreate && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={openAddModal}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Plus size={16} />
                  <span>Add Role</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="crm-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Master Roles Directory
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Showing {filteredList.length} of {roles.length} records
            </span>
          </div>

          <div className="table-responsive">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Role Code</th>
                  <th>Role Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                      <RefreshCw size={26} color="#2563eb" className="spin-animation" style={{ margin: '0 auto 0.75rem' }} />
                      <div style={{ fontWeight: '600', fontSize: '1rem', color: '#0f172a' }}>Fetching data...</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Please wait while roles are loaded from the database</div>
                    </td>
                  </tr>
                ) : filteredList.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                      <div style={{ fontWeight: '700', fontSize: '1rem', color: '#64748b' }}>No Data Found</div>
                      <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>No roles found matching your search.</div>
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item) => (
                    <tr key={item.RoleId || item.RoleCode}>
                      <td>
                        <strong style={{ fontFamily: 'monospace', color: '#2563eb' }}>
                          {item.RoleCode || item.RoleId}
                        </strong>
                      </td>
                      <td>
                        <strong style={{ color: '#0f172a' }}>{item.RoleName}</strong>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.8rem', maxWidth: '320px' }}>
                        {item.Description || '-'}
                      </td>
                      <td>
                        <span className={`badge ${item.IsDeleted ? 'badge-danger' : (item.Status === 'Active' ? 'badge-primary' : 'badge-neutral')}`}>
                          {item.IsDeleted ? 'Deleted' : (item.Status || 'Active')}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          {!item.IsDeleted ? (
                            <>
                              {canEdit && (
                                <button
                                  type="button"
                                  className="btn-icon"
                                  onClick={() => openEditModal(item)}
                                  title="Edit Role"
                                >
                                  <Edit2 size={16} color="#2563eb" />
                                </button>
                              )}
                              {canDelete && item.RoleName?.toLowerCase() !== 'admin' && (
                                <button
                                  type="button"
                                  className="btn-icon"
                                  onClick={() => handleDelete(item)}
                                  title="Delete Role"
                                  style={{ color: '#ef4444' }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </>
                          ) : (
                            canEdit && (
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleRestore(item)}
                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                              >
                                <RotateCcw size={13} /> Restore
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Role' : 'Add New Role'}
      >
        <form onSubmit={handleSave}>
          {/* 1st Input: Role Name */}
          <div className="form-group">
            <label className="form-label">Role Name <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Relationship Manager, Backoffice Staff"
              value={formData.RoleName}
              onChange={(e) => {
                const val = e.target.value;
                const updated = { ...formData, RoleName: val };
                if (!isCodeManual) {
                  updated.RoleCode = getInitialsCode(val);
                }
                setFormData(updated);
              }}
              required
            />
          </div>

          {/* 2nd Input: Role Code (Enabled Alphanumeric, defaults to initials of Name) */}
          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <label className="form-label" style={{ margin: 0 }}>
                Role Code <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>Alphanumeric</span>
            </div>
            <input
              type="text"
              className="form-input"
              value={formData.RoleCode}
              onChange={(e) => {
                setIsCodeManual(true);
                setFormData({ ...formData, RoleCode: e.target.value.toUpperCase() });
              }}
              placeholder="e.g. ADMIN, RM, BO..."
              required
            />
            <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '4px' }}>
              Alphanumeric unique code (auto-derived from initials, editable). Must be unique.
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Operational responsibilities and scope"
              value={formData.Description}
              onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={formData.Status}
              onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : (editingItem ? 'Update Role' : 'Save Role')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
