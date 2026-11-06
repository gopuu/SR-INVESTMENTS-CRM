import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Mail, 
  Phone, 
  Upload, 
  Camera,
  Briefcase,
  Sparkles,
  Shield,
  RotateCcw,
  Archive,
  Clock
} from 'lucide-react';
import { crmApi, getNextEmployeeCode, subscribeCrmEvents } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Modal from '../components/Modal';

export default function Staff() {
  const { hasPermission } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showDeleted, setShowDeleted] = useState(() => crmApi.getShowDeletedGlobally());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const initialFormState = {
    EmployeeId: '',
    EmployeeCode: '',
    FullName: '',
    Email: '',
    GoogleEmails: '', // Multiple Google IDs
    Mobile: '',
    Department: 'Wealth Management',
    Designation: 'Relationship Manager',
    Role: 'Staff',
    Password: 'password123',
    JoiningDate: '',
    Status: 'Active',
    Address: '',
    City: '',
    State: '',
    PhotoUrl: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const loadStaff = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await crmApi.call('getEmployees', { 
        search,
        includeDeleted: showDeleted
      });
      setEmployees(res || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch staff members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, [showDeleted]);

  useEffect(() => {
    const unsubscribe = subscribeCrmEvents((ev) => {
      if (ev.module === 'Staff' || ev.type === 'DATA_CHANGED') {
        if (ev.subType === 'SHOW_DELETED_CHANGED') {
          setShowDeleted(Boolean(ev.value));
        } else {
          loadStaff();
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadStaff();
  };

  const openAddModal = () => {
    setEditingEmployee(null);
    const nextCode = getNextEmployeeCode(employees);
    setFormData({
      ...initialFormState,
      EmployeeCode: nextCode // Auto-calculated preview
    });
    setImagePreview('');
    setSelectedImage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      EmployeeId: emp.EmployeeId || '',
      EmployeeCode: emp.EmployeeCode || '',
      FullName: emp.FullName || '',
      Email: emp.Email || '',
      GoogleEmails: emp.GoogleEmails || '',
      Mobile: emp.Mobile || '',
      Department: emp.Department || 'Wealth Management',
      Designation: emp.Designation || 'Relationship Manager',
      Role: emp.Role || 'Staff',
      Password: emp.Password || 'password123',
      JoiningDate: emp.JoiningDate || '',
      Status: emp.Status || 'Active',
      Address: emp.Address || '',
      City: emp.City || '',
      State: emp.State || '',
      PhotoUrl: emp.PhotoUrl || ''
    });
    setImagePreview(emp.PhotoUrl || '');
    setSelectedImage(null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
      setSelectedImage({
        name: file.name,
        mimeType: file.type,
        base64: event.target.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        image: selectedImage
      };
      await crmApi.call('saveEmployee', payload);
      setIsModalOpen(false);
      await loadStaff();
    } catch (err) {
      alert(err.message || 'Failed to save staff member');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to soft-delete staff member "${name}"?\n\nPer SEBI compliance, records are soft-deleted and preserved in the audit trail.`)) return;
    try {
      await crmApi.call('deleteEmployee', { employeeId: id });
      await loadStaff();
    } catch (err) {
      alert(err.message || 'Failed to delete staff member');
    }
  };

  const handleRestore = async (id, name) => {
    if (!window.confirm(`Restore soft-deleted staff member "${name}" to active status?`)) return;
    try {
      await crmApi.call('restoreEmployee', { employeeId: id });
      await loadStaff();
    } catch (err) {
      alert(err.message || 'Failed to restore staff member');
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header 
        title="Staff & Advisory Team Master" 
        subtitle="Manage mutual fund distributors, relationship managers & backoffice staff"
        onRefresh={loadStaff}
        refreshing={loading}
      />

      <div className="page-wrapper">
        {/* Actions bar */}
        <div className="crm-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '280px', maxWidth: '450px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="Search by name, code, email, designation..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              <button type="submit" className="btn btn-secondary">Search</button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Soft-Delete Compliance Archive Toggle */}
              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                color: showDeleted ? '#dc2626' : '#64748b',
                backgroundColor: showDeleted ? '#fee2e2' : '#f8fafc',
                padding: '5px 10px',
                borderRadius: '6px',
                border: `1px solid ${showDeleted ? '#fca5a5' : '#e2e8f0'}`,
                cursor: 'pointer',
                fontWeight: showDeleted ? '700' : '500'
              }}>
                <input
                  type="checkbox"
                  checked={showDeleted}
                  onChange={(e) => setShowDeleted(e.target.checked)}
                  style={{ accentColor: '#dc2626', cursor: 'pointer' }}
                />
                <Archive size={13} />
                <span>Show Soft-Deleted</span>
              </label>

              {hasPermission('Staff', 'CanCreate') && (
                <button className="btn btn-primary" onClick={openAddModal}>
                  <Plus size={16} /> Add Staff Member
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {/* Staff Table */}
        <div className="crm-card">
          <div className="table-responsive">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Staff Profile & Audit</th>
                  <th>Employee Code</th>
                  <th>Designation & Role</th>
                  <th>Department</th>
                  <th>Official & Google Emails</th>
                  <th>Mobile</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      Loading team members...
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                      {showDeleted ? 'No soft-deleted staff members in audit archive.' : 'No staff records found. Click "Add Staff Member" to add one.'}
                    </td>
                  </tr>
                ) : (
                  employees.map((e) => (
                    <tr key={e.EmployeeId || e.EmployeeCode} style={e.IsDeleted ? { backgroundColor: '#fff5f5' } : {}}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          {e.PhotoUrl ? (
                            <img 
                              src={e.PhotoUrl} 
                              alt={e.FullName} 
                              className="avatar" 
                              onError={(ev) => { ev.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="avatar">
                              {e.FullName ? e.FullName.charAt(0).toUpperCase() : 'E'}
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: '600', color: e.IsDeleted ? '#64748b' : '#0f172a' }}>{e.FullName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{e.Role || 'Staff'}</div>
                            <div style={{ fontSize: '0.675rem', color: '#94a3b8', marginTop: '2px' }}>
                              Created: {e.Created_At ? new Date(e.Created_At).toLocaleDateString() : '—'} ({e.Created_By || 'System'})
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong style={{ color: e.IsDeleted ? '#94a3b8' : '#2563eb', textDecoration: e.IsDeleted ? 'line-through' : 'none' }}>
                            {e.EmployeeCode}
                          </strong>
                          {e.IsDeleted && (
                            <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '0.625rem' }}>
                              Soft-Deleted
                            </span>
                          )}
                        </div>
                        {e.IsDeleted && e.Deleted_By && (
                          <div style={{ fontSize: '0.65rem', color: '#b91c1c', marginTop: '2px' }}>
                            By {e.Deleted_By} on {new Date(e.Deleted_At).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>{e.Designation || '—'}</div>
                      </td>
                      <td>
                        <span className="badge badge-info">{e.Department || 'General'}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8125rem', fontWeight: '500' }}>{e.Email || 'No email'}</div>
                        {e.GoogleEmails && (
                          <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '2px' }}>
                            <span style={{ color: '#2563eb', fontWeight: '600' }}>Google IDs:</span> {e.GoogleEmails}
                          </div>
                        )}
                      </td>
                      <td>{e.Mobile || '—'}</td>
                      <td>
                        <span className={`badge ${e.Status === 'Active' ? 'badge-primary' : 'badge-danger'}`}>
                          {e.Status || 'Active'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          {e.IsDeleted ? (
                            <button
                              className="btn btn-outline-blue btn-sm"
                              title="Restore Soft-Deleted Staff"
                              onClick={() => handleRestore(e.EmployeeId, e.FullName)}
                              style={{ fontSize: '0.72rem', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <RotateCcw size={12} />
                              <span>Restore</span>
                            </button>
                          ) : (
                            <>
                              {hasPermission('Staff', 'CanEdit') && (
                                <button
                                  className="btn-icon"
                                  title="Edit Staff Member"
                                  onClick={() => openEditModal(e)}
                                >
                                  <Edit2 size={15} color="#2563eb" />
                                </button>
                              )}
                              {hasPermission('Staff', 'CanDelete') && (
                                <button
                                  className="btn-icon"
                                  title="Soft-Delete Staff Member (Audit preserved)"
                                  onClick={() => handleDelete(e.EmployeeId, e.FullName)}
                                >
                                  <Trash2 size={15} color="#ef4444" />
                                </button>
                              )}
                            </>
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

      {/* Staff Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !saving && setIsModalOpen(false)}
        title={editingEmployee ? `Edit Staff: ${editingEmployee.EmployeeCode}` : 'Add Staff / Team Member'}
        maxWidth="720px"
      >
        <form onSubmit={handleSave}>
          <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            {/* Photo preview and upload */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ position: 'relative' }}>
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2563eb' }}
                  />
                ) : (
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                    <Camera size={26} />
                  </div>
                )}
              </div>
              <div>
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                  <Upload size={14} /> Upload Staff Photo
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />
                </label>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.35rem' }}>
                  JPG, PNG or WebP under 2MB (Saved to Drive, automatically replaces previous photo)
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Employee Code - Autoincrement & Non-Editable */}
              <div className="form-group">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Employee Code <span style={{ color: '#2563eb', fontSize: '0.75rem' }}>(Autoincrement)</span>
                  </label>
                  <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>Backend Auto</span>
                </div>
                <input
                  type="text"
                  className="form-input"
                  style={{ backgroundColor: '#f1f5f9', fontWeight: '700', color: '#1e40af' }}
                  value={formData.EmployeeCode || 'Auto-generated on save'}
                  disabled
                  readOnly
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rajesh Sharma"
                  value={formData.FullName}
                  onChange={(e) => setFormData({ ...formData, FullName: e.target.value })}
                  required
                />
              </div>

              {/* Primary Email */}
              <div className="form-group">
                <label className="form-label">Primary Official Email <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="rajesh@srinvestments.com"
                  value={formData.Email}
                  onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                  required
                />
              </div>

              {/* Mobile */}
              <div className="form-group">
                <label className="form-label">Mobile Number (Login Allowed) <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+91 98201 11223"
                  value={formData.Mobile}
                  onChange={(e) => setFormData({ ...formData, Mobile: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Multiple Google IDs Field */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ margin: 0 }}>
                  Linked Google IDs / Alternate Emails (For "Login with Google")
                </label>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Comma-separated</span>
              </div>
              <input
                type="text"
                className="form-input"
                placeholder="rajesh.mf@gmail.com, rajesh.personal@gmail.com"
                value={formData.GoogleEmails}
                onChange={(e) => setFormData({ ...formData, GoogleEmails: e.target.value })}
              />
              <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '0.3rem' }}>
                Staff can sign in via Google using ANY of these registered email addresses.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={formData.Department}
                  onChange={(e) => setFormData({ ...formData, Department: e.target.value })}
                >
                  <option value="Wealth Management">Wealth Management</option>
                  <option value="Operations & KYC">Operations & KYC</option>
                  <option value="Mutual Funds">Mutual Funds</option>
                  <option value="Accounts & Finance">Accounts & Finance</option>
                  <option value="Administration">Administration</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Designation</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Senior Investment Advisor"
                  value={formData.Designation}
                  onChange={(e) => setFormData({ ...formData, Designation: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">CRM System Role</label>
                <select
                  className="form-select"
                  value={formData.Role}
                  onChange={(e) => setFormData({ ...formData, Role: e.target.value })}
                >
                  <option value="Relationship Manager">Relationship Manager</option>
                  <option value="Backoffice Staff">Backoffice Staff</option>
                  <option value="Staff">General Staff</option>
                  <option value="Admin">Administrator</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Account Password</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="password123"
                  value={formData.Password}
                  onChange={(e) => setFormData({ ...formData, Password: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Joining Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.JoiningDate}
                  onChange={(e) => setFormData({ ...formData, JoiningDate: e.target.value })}
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
            </div>

            <div className="form-group">
              <label className="form-label">Residential Address</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Full address..."
                value={formData.Address}
                onChange={(e) => setFormData({ ...formData, Address: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
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
              {saving ? 'Saving...' : (editingEmployee ? 'Update Staff Member' : 'Register Staff Member')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
