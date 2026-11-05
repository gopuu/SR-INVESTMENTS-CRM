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
  Briefcase
} from 'lucide-react';
import { crmApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Modal from '../components/Modal';

export default function Staff() {
  const { hasPermission } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

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
    Mobile: '',
    Department: 'Wealth Management',
    Designation: 'Relationship Manager',
    Role: 'Staff',
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
      const res = await crmApi.call('getEmployees', { search });
      setEmployees(res || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch staff members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadStaff();
  };

  const openAddModal = () => {
    setEditingEmployee(null);
    setFormData(initialFormState);
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
      Mobile: emp.Mobile || '',
      Department: emp.Department || 'Wealth Management',
      Designation: emp.Designation || 'Relationship Manager',
      Role: emp.Role || 'Staff',
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
    if (!window.confirm(`Are you sure you want to remove team member "${name}"?`)) return;
    try {
      await crmApi.call('deleteEmployee', { employeeId: id });
      await loadStaff();
    } catch (err) {
      alert(err.message || 'Failed to delete staff member');
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

            <div>
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
                  <th>Staff Profile</th>
                  <th>Employee Code</th>
                  <th>Designation & Role</th>
                  <th>Department</th>
                  <th>Contact Info</th>
                  <th>Joining Date</th>
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
                      No staff records found. Click "Add Staff Member" to add one.
                    </td>
                  </tr>
                ) : (
                  employees.map((e) => (
                    <tr key={e.EmployeeId || e.EmployeeCode}>
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
                            <div style={{ fontWeight: '600', color: '#0f172a' }}>{e.FullName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{e.Role || 'Staff'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: '#059669' }}>{e.EmployeeCode}</strong>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>{e.Designation || '—'}</div>
                      </td>
                      <td>
                        <span className="badge badge-info">{e.Department || 'General'}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8125rem' }}>{e.Mobile || '—'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{e.Email || 'No email'}</div>
                      </td>
                      <td>{e.JoiningDate || '—'}</td>
                      <td>
                        <span className={`badge ${e.Status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                          {e.Status || 'Active'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                          {hasPermission('Staff', 'CanEdit') && (
                            <button
                              className="btn-icon"
                              title="Edit Staff Member"
                              onClick={() => openEditModal(e)}
                            >
                              <Edit2 size={15} color="#0284c7" />
                            </button>
                          )}
                          {hasPermission('Staff', 'CanDelete') && (
                            <button
                              className="btn-icon"
                              title="Delete Staff Member"
                              onClick={() => handleDelete(e.EmployeeId, e.FullName)}
                            >
                              <Trash2 size={15} color="#ef4444" />
                            </button>
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
        title={editingEmployee ? `Edit Staff: ${editingEmployee.FullName}` : 'Add Staff / Team Member'}
        maxWidth="680px"
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
                    style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #059669' }}
                  />
                ) : (
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
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
                  JPG, PNG or WebP under 2MB (Saved to Google Drive in Live mode)
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Employee Code <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. SR-EMP04"
                  value={formData.EmployeeCode}
                  onChange={(e) => setFormData({ ...formData, EmployeeCode: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Sunita Deshmukh"
                  value={formData.FullName}
                  onChange={(e) => setFormData({ ...formData, FullName: e.target.value })}
                  required
                />
              </div>

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
                  <option value="Accounts">Accounts & Finance</option>
                  <option value="Administration">Administration</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Designation</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Relationship Manager"
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

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@srinvestments.com"
                  value={formData.Email}
                  onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={formData.Mobile}
                  onChange={(e) => setFormData({ ...formData, Mobile: e.target.value })}
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
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Mumbai"
                  value={formData.City}
                  onChange={(e) => setFormData({ ...formData, City: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Residential Address</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Full street address..."
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

