import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  RotateCcw, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  XCircle,
  Archive,
  Info
} from 'lucide-react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { crmApi, subscribeCrmEvents } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { showSuccess, showError, showConfirm } from '../utils/swal';

export default function MasterDepartments({ onOpenBackup }) {
  const { user, hasPermission } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleted, setShowDeleted] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    DepartmentId: '',
    DepartmentCode: '',
    DepartmentName: '',
    Description: '',
    Status: 'Active'
  });

  const canCreate = user?.role === 'Admin' || hasPermission('MasterDepartments', 'CanCreate');
  const canEdit = user?.role === 'Admin' || hasPermission('MasterDepartments', 'CanEdit');
  const canDelete = user?.role === 'Admin' || hasPermission('MasterDepartments', 'CanDelete');

  const loadDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await crmApi.call('getDepartments', { includeDeleted: showDeleted });
      setDepartments(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to load departments:', err);
      showError('Load Error', err?.message || 'Failed to load department records.');
    } finally {
      setLoading(false);
    }
  }, [showDeleted]);

  useEffect(() => {
    loadDepartments();
    const unsub = subscribeCrmEvents((evt) => {
      if (evt.module === 'MasterHub' || evt.module === 'MasterDepartments') {
        loadDepartments();
      }
    });
    return unsub;
  }, [loadDepartments]);

  const getNextSerial = (items) => {
    let maxNum = 0;
    (items || []).forEach(item => {
      if (item.IsDeleted) return;
      const raw = String(item.DepartmentCode || '').trim();
      const num = parseInt(raw, 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      } else {
        const match = raw.match(/\d+$/);
        if (match) {
          const val = parseInt(match[0], 10);
          if (val > maxNum) maxNum = val;
        }
      }
    });
    if (maxNum > 0) return String(maxNum + 1);
    const activeCount = (items || []).filter(i => !i.IsDeleted).length;
    return String(activeCount + 1);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      DepartmentId: '',
      DepartmentCode: getNextSerial(departments),
      DepartmentName: '',
      Description: '',
      Status: 'Active'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      DepartmentId: item.DepartmentId || '',
      DepartmentCode: item.DepartmentCode || '',
      DepartmentName: item.DepartmentName || '',
      Description: item.Description || '',
      Status: item.Status || 'Active'
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const codeVal = String(formData.DepartmentCode || '').trim();
    const nameVal = String(formData.DepartmentName || '').trim();

    if (!codeVal) {
      showError('Validation Error', 'S.No / Code is required.');
      return;
    }
    if (!nameVal) {
      showError('Validation Error', 'Department Name is required.');
      return;
    }

    // Duplicate S.No / Code check
    const dupCode = departments.find(d => 
      d.DepartmentId !== formData.DepartmentId &&
      !d.IsDeleted &&
      String(d.DepartmentCode || '').trim().toLowerCase() === codeVal.toLowerCase()
    );
    if (dupCode) {
      showError('Duplicate S.No / Code', `"${codeVal}" is already assigned to "${dupCode.DepartmentName}".`);
      return;
    }

    // Duplicate Name check
    const dupName = departments.find(d => 
      d.DepartmentId !== formData.DepartmentId &&
      !d.IsDeleted &&
      String(d.DepartmentName || '').trim().toLowerCase() === nameVal.toLowerCase()
    );
    if (dupName) {
      showError('Duplicate Department Name', `"${nameVal}" already exists in Department master.`);
      return;
    }

    try {
      setSaving(true);
      await crmApi.call('saveMasterItem', {
        type: 'department',
        data: formData
      });

      showSuccess(
        editingItem ? 'Department Updated' : 'Department Created',
        `Department "${formData.DepartmentName}" saved successfully.`
      );

      setIsModalOpen(false);
      await loadDepartments();
    } catch (err) {
      console.error('Save department failed:', err);
      showError('Save Failed', err?.message || 'Could not save department.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = await showConfirm(
      'Delete Department?',
      `Are you sure you want to delete department "${item.DepartmentName}"?`,
      'Yes, Delete'
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      await crmApi.call('deleteMasterItem', {
        type: 'department',
        id: item.DepartmentId
      });
      showSuccess('Department Deleted', `Department "${item.DepartmentName}" has been removed.`);
      await loadDepartments();
    } catch (err) {
      console.error('Delete department failed:', err);
      showError('Delete Failed', err?.message || 'Could not delete department.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (item) => {
    try {
      setLoading(true);
      await crmApi.call('restoreMasterItem', {
        type: 'department',
        id: item.DepartmentId
      });
      showSuccess('Department Restored', `Department "${item.DepartmentName}" restored.`);
      await loadDepartments();
    } catch (err) {
      console.error('Restore department failed:', err);
      showError('Restore Failed', err?.message || 'Could not restore department.');
    } finally {
      setLoading(false);
    }
  };

  const filteredList = useMemo(() => {
    const q = search.toLowerCase().trim();
    return departments.filter(d => {
      const matchSearch = !q ||
        (d.DepartmentName && d.DepartmentName.toLowerCase().includes(q)) ||
        (d.DepartmentCode && d.DepartmentCode.toLowerCase().includes(q)) ||
        (d.Description && d.Description.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'all' || 
        String(d.Status || 'Active').toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [departments, search, statusFilter]);

  return (
    <div className="main-content">
      <Header
        title="Department Master"
        subtitle="Manage company departments, divisions and organizational structure"
        onRefresh={loadDepartments}
        refreshing={loading}
        onOpenBackup={onOpenBackup}
      />

      <div className="page-wrapper">
        {/* KPI & Summary Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div className="crm-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Total Departments</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                <Building2 size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a', marginTop: '0.5rem' }}>
              {departments.filter(d => !d.IsDeleted).length}
            </div>
            <div style={{ fontSize: '0.725rem', color: '#16a34a', marginTop: '0.25rem', fontWeight: '600' }}>
              Operational divisions active
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
                placeholder="Search departments by name or code..."
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
                  <span>Add Department</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="crm-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Master Departments Directory
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Showing {filteredList.length} of {departments.length} records
            </span>
          </div>

          <div className="table-responsive">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>S.No / Code</th>
                  <th>Department Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      <RefreshCw size={24} color="#2563eb" className="spin-animation" style={{ margin: '0 auto 0.5rem' }} />
                      <p style={{ margin: 0, fontSize: '0.85rem' }}>Loading departments...</p>
                    </td>
                  </tr>
                ) : filteredList.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                      No departments found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item) => (
                    <tr key={item.DepartmentId || item.DepartmentCode}>
                      <td>
                        <strong style={{ fontFamily: 'monospace', color: '#2563eb' }}>
                          {item.DepartmentCode || item.DepartmentId}
                        </strong>
                      </td>
                      <td>
                        <strong style={{ color: '#0f172a' }}>{item.DepartmentName}</strong>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.8rem', maxWidth: '300px' }}>
                        {item.Description || '-'}
                      </td>
                      <td>
                        <span className={`badge ${item.IsDeleted ? 'badge-danger' : (item.Status === 'Active' ? 'badge-success' : 'badge-neutral')}`}>
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
                                  title="Edit Department"
                                >
                                  <Edit2 size={16} color="#2563eb" />
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  type="button"
                                  className="btn-icon"
                                  onClick={() => handleDelete(item)}
                                  title="Delete Department"
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
        title={editingItem ? 'Edit Department' : 'Add New Department'}
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">S.No / Code (Primary Key) *</label>
            <input
              type="text"
              className="form-input"
              value={formData.DepartmentCode}
              onChange={(e) => setFormData({ ...formData, DepartmentCode: e.target.value })}
              placeholder="e.g. 1, 2, 3..."
              required
            />
            <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '4px' }}>
              Unique sequential serial number or primary key.
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Department Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Wealth Advisory, Mutual Funds"
              value={formData.DepartmentName}
              onChange={(e) => setFormData({ ...formData, DepartmentName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Functional responsibilities and scope"
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
              {saving ? 'Saving...' : (editingItem ? 'Update Department' : 'Save Department')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
