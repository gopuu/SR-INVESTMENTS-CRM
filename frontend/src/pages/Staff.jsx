import React, { useState, useEffect, useRef } from 'react';
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
  Clock,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { crmApi, getNextEmployeeCode, subscribeCrmEvents } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { showSuccess, showError, showWarning, showConfirm } from '../utils/swal';

export default function Staff({ onOpenBackup }) {
  const { hasPermission } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showDeleted, setShowDeleted] = useState(() => crmApi.getShowDeletedGlobally());

  // Progressive scroll pagination state (Initial 10 rows, auto-loads +10 on scroll)
  const PAGE_SIZE = 10;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

  // Reset pagination to initial 10 rows when search or filter criteria change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, showDeleted]);

  // Infinite scroll intersection observer for high performance fast scrolling
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount(prev => Math.min(prev + PAGE_SIZE, employees.length));
      }
    }, { threshold: 0.1, rootMargin: '120px' });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [employees.length]);

  // Master Hub Datasets for Dropdowns
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loadingMasters, setLoadingMasters] = useState(true);

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
    AlternateMobile: '', // Alternate Mobile numbers
    Department: '',
    Designation: '',
    Role: '',
    Password: 'password123',
    JoiningDate: '',
    Status: 'Active',
    Address: '',
    City: '',
    State: '',
    PhotoUrl: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const loadMasters = async () => {
    setLoadingMasters(true);
    try {
      const res = await crmApi.call('getMasters');
      if (res) {
        if (Array.isArray(res.departments)) setDepartments(res.departments);
        if (Array.isArray(res.designations)) setDesignations(res.designations);
        if (Array.isArray(res.roles)) setRoles(res.roles);
      }
    } catch (e) {
      console.warn('Could not fetch masters for staff dropdowns:', e);
    } finally {
      setLoadingMasters(false);
    }
  };

  const loadStaff = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await crmApi.call('getEmployees', { 
        search,
        includeDeleted: showDeleted
      });
      // Sanitize status to avoid any historical column offset bugs
      const cleaned = (res || []).map(emp => ({
        ...emp,
        Status: String(emp.Status || '').trim().toLowerCase() === 'inactive' ? 'Inactive' : 'Active'
      }));
      setEmployees(cleaned);
    } catch (err) {
      setError(err.message || 'Failed to fetch staff members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
    loadMasters();
  }, [showDeleted]);

  useEffect(() => {
    const unsubscribe = subscribeCrmEvents((ev) => {
      if (ev.module === 'Staff' || ev.type === 'DATA_CHANGED') {
        if (ev.subType === 'SHOW_DELETED_CHANGED') {
          setShowDeleted(Boolean(ev.value));
        } else if (ev.module === 'MasterHub') {
          loadMasters();
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
      EmployeeCode: nextCode,
      Department: departments[0]?.DepartmentName || 'Wealth Management',
      Designation: designations[0]?.DesignationName || 'Senior Investment Advisor',
      Role: roles[0]?.RoleName || 'Staff',
      Status: 'Active'
    });
    setImagePreview('');
    setSelectedImage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (emp) => {
    setEditingEmployee(emp);
    const safeStatus = String(emp.Status || '').trim().toLowerCase() === 'inactive' ? 'Inactive' : 'Active';
    setFormData({
      EmployeeId: emp.EmployeeId || '',
      EmployeeCode: emp.EmployeeCode || '',
      FullName: emp.FullName || '',
      Email: emp.Email || '',
      GoogleEmails: emp.GoogleEmails || '',
      Mobile: emp.Mobile || '',
      AlternateMobile: emp.AlternateMobile || '',
      Department: emp.Department || departments[0]?.DepartmentName || 'Wealth Management',
      Designation: emp.Designation || designations[0]?.DesignationName || 'Senior Investment Advisor',
      Role: emp.Role || roles[0]?.RoleName || 'Staff',
      Password: emp.Password || 'password123',
      JoiningDate: emp.JoiningDate || '',
      Status: safeStatus,
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
      showWarning('Please select an image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showWarning('Image size must be less than 2MB.');
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
    if (!formData.FullName || !formData.FullName.trim()) {
      showWarning('Staff Member Name is required.');
      return;
    }
    if (!formData.Email || !formData.Email.trim()) {
      showWarning('Primary Email is compulsory (required for inner join & authentication).');
      return;
    }
    if (!formData.Mobile || !formData.Mobile.trim()) {
      showWarning('Primary Mobile Number is compulsory.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        image: selectedImage
      };
      await crmApi.call('saveEmployee', payload);
      setIsModalOpen(false);
      await loadStaff();
      showSuccess(`Staff member "${formData.FullName}" saved successfully!`);
    } catch (err) {
      showError(err.message || 'Failed to save staff member');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    const confirmed = await showConfirm(
      'Delete Staff Member?',
      `Are you sure you want to delete staff member "${name}"? Records are preserved in the deleted archive.`
    );
    if (!confirmed) return;
    try {
      await crmApi.call('deleteEmployee', { employeeId: id });
      await loadStaff();
      showSuccess(`Staff member "${name}" deleted.`);
    } catch (err) {
      showError(err.message || 'Failed to delete staff member');
    }
  };

  const handleRestore = async (id, name) => {
    const confirmed = await showConfirm(
      'Restore Staff Member?',
      `Restore deleted staff member "${name}" to active status?`
    );
    if (!confirmed) return;
    try {
      await crmApi.call('restoreEmployee', { employeeId: id });
      await loadStaff();
      showSuccess(`Staff member "${name}" restored.`);
    } catch (err) {
      showError(err.message || 'Failed to restore staff member');
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header 
        title="Staff" 
        subtitle="Manage advisors, relationship managers & backoffice staff"
        onRefresh={loadStaff}
        refreshing={loading}
        onOpenBackup={onOpenBackup}
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
                  placeholder="Search by name, code, email, mobile, alternate..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              <button type="submit" className="btn btn-secondary">Search</button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Deleted Records Archive Toggle */}
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
                <span>Show Deleted</span>
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
                    <td colSpan="8" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                      <RefreshCw size={26} color="#2563eb" className="spin-animation" style={{ margin: '0 auto 0.75rem' }} />
                      <div style={{ fontWeight: '600', fontSize: '1rem', color: '#0f172a' }}>Fetching data...</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Please wait while staff records are loaded from the database</div>
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                      <div style={{ fontWeight: '700', fontSize: '1rem', color: '#64748b' }}>No Data Found</div>
                      <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                        {showDeleted ? 'No deleted staff members in archive.' : 'No staff records found. Click "Add Staff Member" to add one.'}
                      </div>
                    </td>
                  </tr>
                ) : (
                  employees.slice(0, visibleCount).map((e) => (
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
                              Deleted
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
                        <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#0f172a' }}>{e.Email || 'No email'}</div>
                        {e.GoogleEmails && (
                          <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '2px' }}>
                            <span style={{ color: '#2563eb', fontWeight: '600' }}>Google IDs:</span> {e.GoogleEmails}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#0f172a' }}>{e.Mobile || '—'}</div>
                        {e.AlternateMobile && (
                          <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '2px' }}>
                            <span style={{ color: '#059669', fontWeight: '600' }}>Alt:</span> {e.AlternateMobile}
                          </div>
                        )}
                      </td>
                      <td>
                        {(() => {
                          const statusStr = String(e.Status || '').trim().toLowerCase();
                          const isEmpActive = statusStr === 'active';
                          return (
                            <span className={`badge ${isEmpActive ? 'badge-primary' : 'badge-danger'}`}>
                              {isEmpActive ? 'Active' : 'Inactive'}
                            </span>
                          );
                        })()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          {e.IsDeleted ? (
                            <button
                              className="btn btn-outline-blue btn-sm"
                              title="Restore Deleted Staff"
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
                                  title="Delete Staff Member"
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

          {/* Progressive Infinite Scroll Sentinel & Counter */}
          {!loading && employees.length > 0 && (
            <div ref={sentinelRef} style={{
              padding: '0.85rem 1.25rem',
              backgroundColor: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '0.785rem', color: '#64748b' }}>
                Showing <strong>{Math.min(visibleCount, employees.length)}</strong> of <strong>{employees.length}</strong> staff members
              </span>
              {visibleCount < employees.length ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.775rem', color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <RefreshCw size={13} className="spin-animation" /> Scroll for more (+10)
                  </span>
                  <button
                    className="btn btn-outline-blue btn-sm"
                    style={{ fontSize: '0.725rem', padding: '2px 8px' }}
                    onClick={() => setVisibleCount(prev => Math.min(prev + PAGE_SIZE, employees.length))}
                  >
                    Load More (+10)
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.725rem', padding: '2px 8px' }}
                    onClick={() => setVisibleCount(employees.length)}
                  >
                    Load All ({employees.length})
                  </button>
                </div>
              ) : (
                <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                  <CheckCircle2 size={14} /> All {employees.length} records loaded
                </span>
              )}
            </div>
          )}
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

            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              {/* Primary Email */}
              <div className="form-group">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Primary Official Email <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <span style={{ fontSize: '0.675rem', color: '#2563eb', fontWeight: '700' }}>Inner Join Key</span>
                </div>
                <input
                  type="email"
                  className="form-input"
                  placeholder="rajesh@srinvestments.com"
                  value={formData.Email}
                  onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                  required
                />
              </div>

              {/* Primary Mobile */}
              <div className="form-group">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Primary Mobile Number <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <span style={{ fontSize: '0.675rem', color: '#2563eb', fontWeight: '700' }}>Login Key</span>
                </div>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  value={formData.Mobile}
                  onChange={(e) => setFormData({ ...formData, Mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', marginBottom: '1.25rem' }}>
              {/* Alternate Mobile Numbers */}
              <div className="form-group">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Alternate Mobile Number(s)
                  </label>
                  <span style={{ fontSize: '0.675rem', color: '#64748b' }}>Comma-separated</span>
                </div>
                <input
                  type="text"
                  className="form-input"
                  placeholder="9820199999, 9820188888"
                  value={formData.AlternateMobile}
                  onChange={(e) => setFormData({ ...formData, AlternateMobile: e.target.value })}
                />
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.3rem' }}>
                  Alternate phone numbers can also be used to sign in.
                </div>
              </div>

              {/* Multiple Google IDs Field */}
              <div className="form-group">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Linked Google IDs / Alternate Emails
                  </label>
                  <span style={{ fontSize: '0.675rem', color: '#64748b' }}>Comma-separated</span>
                </div>
                <input
                  type="text"
                  className="form-input"
                  placeholder="rajesh.mf@gmail.com, rajesh.personal@gmail.com"
                  value={formData.GoogleEmails}
                  onChange={(e) => setFormData({ ...formData, GoogleEmails: e.target.value })}
                />
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.3rem' }}>
                  Staff can sign in via Google using ANY of these addresses.
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Department (Loaded from Department Master) */}
              <div className="form-group">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Department</label>
                  <span style={{ fontSize: '0.675rem', color: '#2563eb', fontWeight: '600' }}>Master Hub</span>
                </div>
                <select
                  className="form-select"
                  value={formData.Department}
                  onChange={(e) => setFormData({ ...formData, Department: e.target.value })}
                  disabled={loadingMasters}
                >
                  {loadingMasters ? (
                    <option value="" disabled>Fetching data...</option>
                  ) : departments.filter(d => !d.IsDeleted && d.Status === 'Active').length === 0 ? (
                    <option value="" disabled>No Data Available</option>
                  ) : (
                    <>
                      <option value="">-- Select Department --</option>
                      {departments.filter(d => !d.IsDeleted && d.Status === 'Active').map(d => (
                        <option key={d.DepartmentId || d.DepartmentCode} value={d.DepartmentName}>
                          {d.DepartmentName} ({d.DepartmentCode})
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Designation (Loaded from Designation Master) */}
              <div className="form-group">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Designation</label>
                  <span style={{ fontSize: '0.675rem', color: '#2563eb', fontWeight: '600' }}>Master Hub</span>
                </div>
                <select
                  className="form-select"
                  value={formData.Designation}
                  onChange={(e) => setFormData({ ...formData, Designation: e.target.value })}
                  disabled={loadingMasters}
                >
                  {loadingMasters ? (
                    <option value="" disabled>Fetching data...</option>
                  ) : designations.filter(d => !d.IsDeleted && d.Status === 'Active').length === 0 ? (
                    <option value="" disabled>No Data Available</option>
                  ) : (
                    <>
                      <option value="">-- Select Designation --</option>
                      {designations.filter(d => !d.IsDeleted && d.Status === 'Active').map(d => (
                        <option key={d.DesignationId || d.DesignationCode} value={d.DesignationName}>
                          {d.DesignationName} ({d.Department || d.DesignationCode})
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* CRM System Role (Loaded from Role Master) */}
              <div className="form-group">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>CRM System Role</label>
                  <span style={{ fontSize: '0.675rem', color: '#2563eb', fontWeight: '600' }}>Master Hub</span>
                </div>
                <select
                  className="form-select"
                  value={formData.Role}
                  onChange={(e) => setFormData({ ...formData, Role: e.target.value })}
                  disabled={loadingMasters}
                >
                  {loadingMasters ? (
                    <option value="" disabled>Fetching data...</option>
                  ) : roles.filter(r => !r.IsDeleted && r.Status === 'Active').length === 0 ? (
                    <option value="" disabled>No Data Available</option>
                  ) : (
                    <>
                      <option value="">-- Select Role --</option>
                      {roles.filter(r => !r.IsDeleted && r.Status === 'Active').map(r => (
                        <option key={r.RoleId || r.RoleCode} value={r.RoleName}>
                          {r.RoleName} ({r.RoleCode})
                        </option>
                      ))}
                    </>
                  )}
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
