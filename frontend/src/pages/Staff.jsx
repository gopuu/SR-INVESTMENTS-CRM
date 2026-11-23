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
  CheckCircle2,
  Check,
  X
} from 'lucide-react';
import { crmApi, getInitialsCode, subscribeCrmEvents } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { showSuccess, showError, showWarning, showConfirm } from '../utils/swal';

export default function Staff({ onOpenBackup }) {
  const { user, hasPermission, isSuperAdmin } = useAuth();
  const isAdmin = user?.role === 'Admin' || user?.role?.toLowerCase() === 'admin' || isSuperAdmin;
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
  const [isCodeManual, setIsCodeManual] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const initialFormState = {
    EmployeeId: '',
    EmployeeCode: '',
    FullName: '',
    Email: '',
    AlternateEmails: '',
    GoogleEmails: '', // Multiple Google IDs / Alternate Emails
    Mobile: '',
    AlternateMobile: '', // Alternate Mobile numbers
    Department: '',
    Designation: '',
    Role: '',
    BirthDate: '',
    JoiningDate: '',
    BloodGroup: '',
    AadharNo: '',
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
    setIsCodeManual(false);
    setFormData({
      ...initialFormState,
      EmployeeCode: '',
      FullName: '',
      BirthDate: '',
      BloodGroup: '',
      AadharNo: '',
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
    setIsCodeManual(true);
    const safeStatus = String(emp.Status || '').trim().toLowerCase() === 'inactive' ? 'Inactive' : 'Active';
    setFormData({
      EmployeeId: emp.EmployeeId || '',
      EmployeeCode: emp.EmployeeCode || '',
      FullName: emp.FullName || '',
      Email: emp.Email || '',
      AlternateEmails: emp.AlternateEmails || emp.GoogleEmails || '',
      GoogleEmails: emp.AlternateEmails || emp.GoogleEmails || '',
      Mobile: emp.Mobile || '',
      AlternateMobile: emp.AlternateMobile || '',
      Department: emp.Department || departments[0]?.DepartmentName || 'Wealth Management',
      Designation: emp.Designation || designations[0]?.DesignationName || 'Senior Investment Advisor',
      Role: emp.Role || roles[0]?.RoleName || 'Staff',
      BirthDate: emp.BirthDate || emp.birthDate || '',
      JoiningDate: emp.JoiningDate || emp.joiningDate || '',
      BloodGroup: emp.BloodGroup || emp.bloodGroup || '',
      AadharNo: emp.AadharNo || emp.aadharNo || '',
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
    const empCode = String(formData.EmployeeCode || '').trim().toUpperCase();
    if (!empCode) {
      showWarning('Employee Code is compulsory.');
      return;
    }

    // Duplicate Employee Code validation
    const dupCode = employees.find(emp => 
      emp.EmployeeId !== formData.EmployeeId &&
      !emp.IsDeleted &&
      String(emp.EmployeeCode || '').trim().toLowerCase() === empCode.toLowerCase()
    );
    if (dupCode) {
      showError('Duplicate Employee Code', `"${empCode}" is already assigned to "${dupCode.FullName}". Employee Code must be unique.`);
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

  const handleApprove = async (employeeId, name) => {
    const confirmed = await showConfirm(
      'Approve Staff Change?',
      `Approve pending changes/creation for "${name}"? This will make the record Active.`,
      'Yes, Approve'
    );
    if (!confirmed) return;
    try {
      await crmApi.call('approveRecord', { type: 'employee', id: employeeId, adminEmail: user?.email });
      showSuccess('Approved', `"${name}" approved successfully.`);
      await loadStaff();
    } catch (err) {
      showError('Approval Failed', err.message || 'Failed to approve staff record');
    }
  };

  const handleReject = async (employeeId, name) => {
    const confirmed = await showConfirm(
      'Reject Staff Request?',
      `Reject pending request for "${name}"?`,
      'Yes, Reject'
    );
    if (!confirmed) return;
    try {
      await crmApi.call('rejectRecord', { type: 'employee', id: employeeId, adminEmail: user?.email });
      showSuccess('Rejected', `"${name}" request has been rejected.`);
      await loadStaff();
    } catch (err) {
      showError('Rejection Failed', err.message || 'Failed to reject staff record');
    }
  };

  const renderAuditDetails = (item) => {
    let historyList = [];
    if (item.Approval_History) {
      if (typeof item.Approval_History === 'string') {
        try {
          const parsed = JSON.parse(item.Approval_History);
          if (Array.isArray(parsed)) historyList = parsed;
        } catch (e) {
          // ignore
        }
      } else if (Array.isArray(item.Approval_History)) {
        historyList = item.Approval_History;
      }
    }

    const createdAppBy = item.Created_Approved_By;
    const createdAppAt = item.Created_Approved_At;
    const updatedAppBy = item.Updated_Approved_By;
    const updatedAppAt = item.Updated_Approved_At;
    const deletedAppBy = item.Deleted_Approved_By;
    const deletedAppAt = item.Deleted_Approved_At;
    const legacyAppBy = item.Approved_By;

    const historyTooltip = historyList.length > 0 
      ? historyList.map(h => `• ${h.action || 'EVENT'}: ${h.status || ''} by ${h.approvedBy || h.submittedBy || h.user || 'Admin'} on ${h.approvedAt || h.submittedAt || h.date || ''}`).join('\n')
      : '';

    return (
      <div style={{ fontSize: '0.675rem', color: '#64748b', lineHeight: 1.35, marginTop: '2px' }}>
        <div style={{ color: '#94a3b8' }}>
          Created: {item.Created_At ? new Date(item.Created_At).toLocaleDateString() : '—'} ({item.Created_By || 'System'})
        </div>

        {createdAppBy && (
          <div style={{ color: '#059669', fontWeight: '600', marginTop: '1px' }}>
            ✓ Create Appr: {createdAppBy} {createdAppAt ? `(${new Date(createdAppAt).toLocaleDateString()})` : ''}
          </div>
        )}

        {updatedAppBy && (
          <div style={{ color: '#2563eb', fontWeight: '600', marginTop: '1px' }}>
            ✎ Edit Appr: {updatedAppBy} {updatedAppAt ? `(${new Date(updatedAppAt).toLocaleDateString()})` : ''}
          </div>
        )}

        {deletedAppBy && (
          <div style={{ color: '#dc2626', fontWeight: '600', marginTop: '1px' }}>
            ✕ Del Appr: {deletedAppBy} {deletedAppAt ? `(${new Date(deletedAppAt).toLocaleDateString()})` : ''}
          </div>
        )}

        {!createdAppBy && !updatedAppBy && !deletedAppBy && legacyAppBy && (
          <div style={{ color: '#059669', fontWeight: '600', marginTop: '1px' }}>
            ✓ Approved by: {legacyAppBy}
          </div>
        )}

        {historyList.length > 0 && (
          <div 
            title={historyTooltip}
            style={{ 
              cursor: 'pointer', 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '0.625rem', 
              backgroundColor: '#f1f5f9', 
              color: '#334155', 
              border: '1px solid #e2e8f0',
              borderRadius: '4px', 
              padding: '1px 5px', 
              marginTop: '2px',
              fontWeight: 500
            }}
          >
            📋 {historyList.length} approval record{historyList.length > 1 ? 's' : ''}
          </div>
        )}
      </div>
    );
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
                            {renderAuditDetails(e)}
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
                        {(e.AlternateEmails || e.GoogleEmails) && (
                          <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '2px' }}>
                            <span style={{ color: '#2563eb', fontWeight: '600' }}>Alternate Emails:</span> {e.AlternateEmails || e.GoogleEmails}
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
                          if (statusStr.includes('pending')) {
                            return (
                              <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={11} /> {e.Status}
                              </span>
                            );
                          }
                          if (statusStr === 'rejected') {
                            return (
                              <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' }}>
                                Rejected
                              </span>
                            );
                          }
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
                          {isAdmin && e.Status?.toLowerCase().includes('pending') && (
                            <>
                              <button
                                className="btn-icon"
                                title="Approve Staff Request"
                                onClick={() => handleApprove(e.EmployeeId, e.FullName)}
                                style={{ backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }}
                              >
                                <Check size={15} color="#059669" />
                              </button>
                              <button
                                className="btn-icon"
                                title="Reject Staff Request"
                                onClick={() => handleReject(e.EmployeeId, e.FullName)}
                                style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}
                              >
                                <X size={15} color="#dc2626" />
                              </button>
                            </>
                          )}
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
        hideHeader={true}
        maxWidth="760px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '88vh', minHeight: 0, overflow: 'hidden' }}>
          {/* Custom Header with Primary Color (Fixed Top) */}
          <div style={{
            background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
            color: '#ffffff',
            padding: '1.25rem 1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
            zIndex: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                flexShrink: 0
              }}>
                <UserCheck size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.01em' }}>
                  {editingEmployee ? `Edit Staff: ${editingEmployee.FullName || editingEmployee.EmployeeCode}` : 'Add Staff / Team Member'}
                </h3>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.775rem', color: '#dbeafe', fontWeight: '400' }}>
                  Staff Profile, Department & Tenant Workspace Assignment
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
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'; }}
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden', margin: 0 }}>
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
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
              {/* 1st Input: Full Name */}
              <div className="form-group">
                <label className="form-label">Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rajesh Sharma"
                  value={formData.FullName}
                  onChange={(e) => {
                    const val = e.target.value;
                    const updated = { ...formData, FullName: val };
                    if (!isCodeManual) {
                      updated.EmployeeCode = getInitialsCode(val);
                    }
                    setFormData(updated);
                  }}
                  required
                />
              </div>

              {/* 2nd Input: Employee Code (Enabled Alphanumeric, defaults to initials of Name) */}
              <div className="form-group">
                <label className="form-label">
                  Employee Code <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. RS, EMP01"
                  value={formData.EmployeeCode}
                  onChange={(e) => {
                    setIsCodeManual(true);
                    setFormData({ ...formData, EmployeeCode: e.target.value.toUpperCase() });
                  }}
                  required
                />
                <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '4px' }}>
                  Alphanumeric staff code (defaults to name initials, editable). Must be unique.
                </div>
              </div>
            </div>

            {/* ROW 2: Mobile Numbers (Same type together!) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">
                  Primary Mobile Number <span style={{ color: '#ef4444' }}>*</span>
                </label>
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
            </div>

            {/* ROW 3: Email Addresses (Same type together!) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">
                  Primary Official Email <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="rajesh@srinvestments.com"
                  value={formData.Email}
                  onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                  required
                />
              </div>

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
                  value={formData.AlternateEmails || formData.GoogleEmails || ''}
                  onChange={(e) => setFormData({ ...formData, AlternateEmails: e.target.value, GoogleEmails: e.target.value })}
                />
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.3rem' }}>
                  Staff can sign in via Google using ANY of these addresses.
                </div>
              </div>
            </div>

            {/* ROW 4: Birthdate, Joining Date, Blood Group, Aadhaar Number (UID) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Birthdate</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.BirthDate || ''}
                  onChange={(e) => setFormData({ ...formData, BirthDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Joining Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.JoiningDate || ''}
                  onChange={(e) => setFormData({ ...formData, JoiningDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select
                  className="form-select"
                  value={formData.BloodGroup || ''}
                  onChange={(e) => setFormData({ ...formData, BloodGroup: e.target.value })}
                >
                  <option value="">-- Select Blood Group --</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Aadhaar Number (UID)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="12-digit Aadhaar Number"
                  maxLength={14}
                  value={formData.AadharNo || ''}
                  onChange={(e) => setFormData({ ...formData, AadharNo: e.target.value })}
                />
              </div>
            </div>

            {/* ROW 7: Department, Designation, Role, Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              {/* Department */}
              <div className="form-group">
                <label className="form-label">Department</label>
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

              {/* Designation */}
              <div className="form-group">
                <label className="form-label">Designation</label>
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

              {/* CRM System Role */}
              <div className="form-group">
                <label className="form-label">CRM System Role</label>
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

              {/* Status */}
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

            {/* ROW 8: Address */}
            <div className="form-group" style={{ marginTop: '1rem' }}>
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

            {/* Non-scrolling pinned footer */}
            <div style={{
              flexShrink: 0,
              padding: '1rem 2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.85rem',
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              borderBottomLeftRadius: '12px',
              borderBottomRightRadius: '12px',
              boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.04)',
              zIndex: 10
            }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsModalOpen(false)}
                disabled={saving}
                style={{ padding: '0.65rem 1.4rem', fontSize: '0.875rem' }}
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
                {saving && <RefreshCw size={15} className="spin-anim" />}
                <span>{saving ? 'Saving...' : (editingEmployee ? 'Update Staff Member' : 'Register Staff Member')}</span>
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
