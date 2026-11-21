import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Briefcase, 
  Plus, 
  Edit2, 
  Trash2, 
  RotateCcw, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  XCircle,
  Building2
} from 'lucide-react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { crmApi, subscribeCrmEvents } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { showSuccess, showError, showConfirm } from '../utils/swal';

export default function MasterDesignations({ onOpenBackup }) {
  const { user, hasPermission } = useAuth();
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleted, setShowDeleted] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    DesignationId: '',
    DesignationCode: '',
    DesignationName: '',
    Department: '',
    Description: '',
    Status: 'Active'
  });

  const canCreate = user?.role === 'Admin' || hasPermission('MasterDesignations', 'CanCreate');
  const canEdit = user?.role === 'Admin' || hasPermission('MasterDesignations', 'CanEdit');
  const canDelete = user?.role === 'Admin' || hasPermission('MasterDesignations', 'CanDelete');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [desRes, deptRes] = await Promise.all([
        crmApi.call('getDesignations', { includeDeleted: showDeleted }),
        crmApi.call('getDepartments', { includeDeleted: false })
      ]);
      setDesignations(Array.isArray(desRes) ? desRes : []);
      setDepartments(Array.isArray(deptRes) ? deptRes : []);
    } catch (err) {
      console.error('Failed to load designations:', err);
      showError('Load Error', err?.message || 'Failed to load designations.');
    } finally {
      setLoading(false);
    }
  }, [showDeleted]);

  useEffect(() => {
    loadData();
    const unsub = subscribeCrmEvents((evt) => {
      if (evt.module === 'MasterHub' || evt.module === 'MasterDesignations') {
        loadData();
      }
    });
    return unsub;
  }, [loadData]);

  const getNextSerial = (items) => {
    let maxNum = 0;
    (items || []).forEach(item => {
      if (item.IsDeleted) return;
      const raw = String(item.DesignationCode || '').trim();
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
      DesignationId: '',
      DesignationCode: getNextSerial(designations),
      DesignationName: '',
      Department: departments[0]?.DepartmentName || '',
      Description: '',
      Status: 'Active'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      DesignationId: item.DesignationId || '',
      DesignationCode: item.DesignationCode || '',
      DesignationName: item.DesignationName || '',
      Department: item.Department || departments[0]?.DepartmentName || '',
      Description: item.Description || '',
      Status: item.Status || 'Active'
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const codeVal = String(formData.DesignationCode || '').trim();
    const nameVal = String(formData.DesignationName || '').trim();

    if (!codeVal) {
      showError('Validation Error', 'S.No / Code is required.');
      return;
    }
    if (!nameVal) {
      showError('Validation Error', 'Designation Name is required.');
      return;
    }

    // Duplicate Code check
    const dupCode = designations.find(d => 
      d.DesignationId !== formData.DesignationId &&
      !d.IsDeleted &&
      String(d.DesignationCode || '').trim().toLowerCase() === codeVal.toLowerCase()
    );
    if (dupCode) {
      showError('Duplicate S.No / Code', `"${codeVal}" is already assigned to "${dupCode.DesignationName}".`);
      return;
    }

    // Duplicate Name check
    const dupName = designations.find(d => 
      d.DesignationId !== formData.DesignationId &&
      !d.IsDeleted &&
      String(d.DesignationName || '').trim().toLowerCase() === nameVal.toLowerCase()
    );
    if (dupName) {
      showError('Duplicate Designation Name', `"${nameVal}" already exists in Designation master.`);
      return;
    }

    try {
      setSaving(true);
      await crmApi.call('saveMasterItem', {
        type: 'designation',
        data: formData
      });

      showSuccess(
        editingItem ? 'Designation Updated' : 'Designation Created',
        `Designation "${formData.DesignationName}" saved successfully.`
      );

      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Save designation failed:', err);
      showError('Save Failed', err?.message || 'Could not save designation.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = await showConfirm(
      'Delete Designation?',
      `Are you sure you want to delete designation "${item.DesignationName}"?`,
      'Yes, Delete'
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      await crmApi.call('deleteMasterItem', {
        type: 'designation',
        id: item.DesignationId
      });
      showSuccess('Designation Deleted', `Designation "${item.DesignationName}" has been removed.`);
      await loadData();
    } catch (err) {
      console.error('Delete designation failed:', err);
      showError('Delete Failed', err?.message || 'Could not delete designation.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (item) => {
    try {
      setLoading(true);
      await crmApi.call('restoreMasterItem', {
        type: 'designation',
        id: item.DesignationId
      });
      showSuccess('Designation Restored', `Designation "${item.DesignationName}" restored.`);
      await loadData();
    } catch (err) {
      console.error('Restore designation failed:', err);
      showError('Restore Failed', err?.message || 'Could not restore designation.');
    } finally {
      setLoading(false);
    }
  };

  const filteredList = useMemo(() => {
    const q = search.toLowerCase().trim();
    return designations.filter(d => {
      const matchSearch = !q ||
        (d.DesignationName && d.DesignationName.toLowerCase().includes(q)) ||
        (d.DesignationCode && d.DesignationCode.toLowerCase().includes(q)) ||
        (d.Department && d.Department.toLowerCase().includes(q)) ||
        (d.Description && d.Description.toLowerCase().includes(q));

      const matchDept = deptFilter === 'all' || 
        String(d.Department || '').toLowerCase() === deptFilter.toLowerCase();

      const matchStatus = statusFilter === 'all' || 
        String(d.Status || 'Active').toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchDept && matchStatus;
    });
  }, [designations, search, deptFilter, statusFilter]);

  return (
    <div className="main-content">
      <Header
        title="Designation Master"
        subtitle="Manage job designations, professional titles and departmental mappings"
        onRefresh={loadData}
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
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Total Designations</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                <Briefcase size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a', marginTop: '0.5rem' }}>
              {designations.filter(d => !d.IsDeleted).length}
            </div>
            <div style={{ fontSize: '0.725rem', color: '#16a34a', marginTop: '0.25rem', fontWeight: '600' }}>
              Mapped to {departments.length} departments
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
                placeholder="Search designations by name, code or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <select
                className="form-select"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="all">All Departments</option>
                {departments.map(d => (
                  <option key={d.DepartmentId || d.DepartmentName} value={d.DepartmentName}>
                    {d.DepartmentName}
                  </option>
                ))}
              </select>

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
                  <span>Add Designation</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="crm-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Master Designations Directory
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Showing {filteredList.length} of {designations.length} records
            </span>
          </div>

          <div className="table-responsive">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>S.No / Code</th>
                  <th>Designation Name</th>
                  <th>Department</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      <RefreshCw size={24} color="#2563eb" className="spin-animation" style={{ margin: '0 auto 0.5rem' }} />
                      <p style={{ margin: 0, fontSize: '0.85rem' }}>Loading designations...</p>
                    </td>
                  </tr>
                ) : filteredList.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                      No designations found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item) => (
                    <tr key={item.DesignationId || item.DesignationCode}>
                      <td>
                        <strong style={{ fontFamily: 'monospace', color: '#2563eb' }}>
                          {item.DesignationCode || item.DesignationId}
                        </strong>
                      </td>
                      <td>
                        <strong style={{ color: '#0f172a' }}>{item.DesignationName}</strong>
                      </td>
                      <td>
                        <span className="badge badge-info" style={{ textTransform: 'none' }}>
                          {item.Department || 'General'}
                        </span>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.8rem', maxWidth: '280px' }}>
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
                                  title="Edit Designation"
                                >
                                  <Edit2 size={16} color="#2563eb" />
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  type="button"
                                  className="btn-icon"
                                  onClick={() => handleDelete(item)}
                                  title="Delete Designation"
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
        title={editingItem ? 'Edit Designation' : 'Add New Designation'}
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">S.No / Code (Primary Key) *</label>
            <input
              type="text"
              className="form-input"
              value={formData.DesignationCode}
              onChange={(e) => setFormData({ ...formData, DesignationCode: e.target.value })}
              placeholder="e.g. 1, 2, 3..."
              required
            />
            <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '4px' }}>
              Unique sequential serial number or primary key.
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Designation Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Senior Wealth Manager, Operations Executive"
              value={formData.DesignationName}
              onChange={(e) => setFormData({ ...formData, DesignationName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Associated Department *</label>
            <select
              className="form-select"
              value={formData.Department}
              onChange={(e) => setFormData({ ...formData, Department: e.target.value })}
              required
            >
              <option value="" disabled>-- Select Department --</option>
              {departments.map(d => (
                <option key={d.DepartmentId || d.DepartmentName} value={d.DepartmentName}>
                  {d.DepartmentName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Job scope and responsibility profile"
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
              {saving ? 'Saving...' : (editingItem ? 'Update Designation' : 'Save Designation')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
