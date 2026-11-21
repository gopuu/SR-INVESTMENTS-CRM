import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Briefcase, 
  Shield, 
  Plus, 
  Edit2, 
  Trash2, 
  RotateCcw, 
  Search, 
  Archive, 
  CheckCircle2, 
  AlertCircle,
  FolderTree,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { crmApi, subscribeCrmEvents } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { showSuccess, showError, showWarning, showConfirm } from '../utils/swal';

export default function MasterHub({ onOpenBackup, initialTab = 'departments' }) {
  const { user, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab); // 'departments' | 'designations' | 'roles'

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);
  const [loading, setLoading] = useState(true);
  const [showDeleted, setShowDeleted] = useState(() => crmApi.getShowDeletedGlobally());
  const [search, setSearch] = useState('');

  // Progressive scroll pagination state (Initial 10 rows, auto-loads +10 on scroll)
  const PAGE_SIZE = 10;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

  // Reset pagination when active tab, search, or showDeleted changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeTab, search, showDeleted]);

  // Master Datasets
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [roles, setRoles] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('department'); // 'department' | 'designation' | 'role'
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const initialForm = {
    id: '',
    code: '',
    name: '',
    department: '',
    description: '',
    status: 'Active'
  };
  const [formData, setFormData] = useState(initialForm);

  const loadAllMasters = async () => {
    setLoading(true);
    try {
      const [deptRes, desigRes, roleRes] = await Promise.all([
        crmApi.call('getDepartments', { includeDeleted: showDeleted }),
        crmApi.call('getDesignations', { includeDeleted: showDeleted }),
        crmApi.call('getRoles', { includeDeleted: showDeleted })
      ]);
      setDepartments(Array.isArray(deptRes) ? deptRes : []);
      setDesignations(Array.isArray(desigRes) ? desigRes : []);
      setRoles(Array.isArray(roleRes) ? roleRes : []);
    } catch (e) {
      console.warn('Failed to load masters:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllMasters();
  }, [showDeleted]);

  useEffect(() => {
    const unsubscribe = subscribeCrmEvents((ev) => {
      if (ev.module === 'MasterHub' || ev.type === 'DATA_CHANGED') {
        loadAllMasters();
      }
    });
    return () => unsubscribe();
  }, []);

  // Auto-generate next integer serial number
  const getNextSerial = (items, codeKey) => {
    let maxNum = 0;
    (items || []).forEach(item => {
      if (item.IsDeleted) return;
      const raw = String(item[codeKey] || '').trim();
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

  const openAddModal = (type) => {
    setModalType(type);
    setEditingItem(null);
    let defaultCode = '1';
    if (type === 'department') defaultCode = getNextSerial(departments, 'DepartmentCode');
    if (type === 'designation') defaultCode = getNextSerial(designations, 'DesignationCode');
    if (type === 'role') defaultCode = getNextSerial(roles, 'RoleCode');

    setFormData({
      ...initialForm,
      code: defaultCode,
      department: departments[0]?.DepartmentName || 'Wealth Management'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (type, item) => {
    setModalType(type);
    setEditingItem(item);
    if (type === 'department') {
      setFormData({
        id: item.DepartmentId,
        code: item.DepartmentCode,
        name: item.DepartmentName,
        department: '',
        description: item.Description || '',
        status: item.Status || 'Active'
      });
    } else if (type === 'designation') {
      setFormData({
        id: item.DesignationId,
        code: item.DesignationCode,
        name: item.DesignationName,
        department: item.Department || departments[0]?.DepartmentName || '',
        description: item.Description || '',
        status: item.Status || 'Active'
      });
    } else if (type === 'role') {
      setFormData({
        id: item.RoleId,
        code: item.RoleCode,
        name: item.RoleName,
        department: '',
        description: item.Description || '',
        status: item.Status || 'Active'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const codeVal = String(formData.code || '').trim();
    const nameVal = String(formData.name || '').trim();

    if (!codeVal) {
      showError('Validation Error', 'Please enter a valid S.No / Code.');
      return;
    }
    if (!nameVal) {
      showError('Validation Error', 'Please enter a valid title/name.');
      return;
    }

    // Client-side duplicate check
    const currentList = modalType === 'department' ? departments : modalType === 'designation' ? designations : roles;
    const idKey = modalType === 'department' ? 'DepartmentId' : modalType === 'designation' ? 'DesignationId' : 'RoleId';
    const codeKey = modalType === 'department' ? 'DepartmentCode' : modalType === 'designation' ? 'DesignationCode' : 'RoleCode';
    const nameKey = modalType === 'department' ? 'DepartmentName' : modalType === 'designation' ? 'DesignationName' : 'RoleName';

    // 1. Check duplicate Code / S.No (case-insensitive)
    const dupCode = currentList.find(item => 
      item[idKey] !== formData.id &&
      !item.IsDeleted &&
      String(item[codeKey] || '').trim().toLowerCase() === codeVal.toLowerCase()
    );
    if (dupCode) {
      showError(
        'Duplicate S.No / Code Found',
        `"${codeVal}" is already assigned to "${dupCode[nameKey]}". Duplicate serial numbers or codes are not allowed.`
      );
      return;
    }

    // 2. Check duplicate Name (case-insensitive)
    const dupName = currentList.find(item => 
      item[idKey] !== formData.id &&
      !item.IsDeleted &&
      String(item[nameKey] || '').trim().toLowerCase() === nameVal.toLowerCase()
    );
    if (dupName) {
      showError(
        'Duplicate Name Found',
        `"${nameVal}" already exists in ${modalType} master. Duplicate names are not allowed.`
      );
      return;
    }

    setSaving(true);
    try {
      let dataPayload = {
        Status: formData.status,
        Description: formData.description
      };

      if (modalType === 'department') {
        dataPayload.DepartmentId = formData.id;
        dataPayload.DepartmentCode = codeVal;
        dataPayload.DepartmentName = nameVal;
      } else if (modalType === 'designation') {
        dataPayload.DesignationId = formData.id;
        dataPayload.DesignationCode = codeVal;
        dataPayload.DesignationName = nameVal;
        dataPayload.Department = formData.department;
      } else if (modalType === 'role') {
        dataPayload.RoleId = formData.id;
        dataPayload.RoleCode = codeVal;
        dataPayload.RoleName = nameVal;
      }

      await crmApi.call('saveMasterItem', {
        type: modalType,
        data: dataPayload,
        userEmail: user?.email
      });

      showSuccess(
        `${modalType.charAt(0).toUpperCase() + modalType.slice(1)} Saved`,
        `"${nameVal}" (${codeVal}) saved successfully.`
      );
      setIsModalOpen(false);
      await loadAllMasters();
    } catch (err) {
      showError('Save Failed', err.message || 'Failed to save master record');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type, id, name) => {
    const confirmed = await showConfirm(
      'Delete Record?',
      `Are you sure you want to delete "${name}"? Records are preserved in the deleted archive.`,
      'Yes, Delete'
    );
    if (!confirmed) return;
    try {
      await crmApi.call('deleteMasterItem', { type, id, userEmail: user?.email });
      showSuccess('Record Deleted', `"${name}" has been deleted.`);
      await loadAllMasters();
    } catch (err) {
      showError('Delete Failed', err.message || 'Failed to delete record');
    }
  };

  const handleRestore = async (type, id, name) => {
    const confirmed = await showConfirm(
      'Restore Master Record?',
      `Restore "${name}" back to active status?`,
      'Yes, Restore'
    );
    if (!confirmed) return;
    try {
      await crmApi.call('restoreMasterItem', { type, id, userEmail: user?.email });
      showSuccess('Record Restored', `"${name}" has been restored to active status.`);
      await loadAllMasters();
    } catch (err) {
      showError('Restore Failed', err.message || 'Failed to restore record');
    }
  };

  // Filter items by search keyword
  const filterList = (list, codeField, nameField) => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(item => 
      (item[codeField] && item[codeField].toLowerCase().includes(q)) ||
      (item[nameField] && item[nameField].toLowerCase().includes(q)) ||
      (item.Description && item.Description.toLowerCase().includes(q))
    );
  };

  const filteredDepartments = filterList(departments, 'DepartmentCode', 'DepartmentName');
  const filteredDesignations = filterList(designations, 'DesignationCode', 'DesignationName');
  const filteredRoles = filterList(roles, 'RoleCode', 'RoleName');

  // Active list count for current tab
  const currentTabCount = activeTab === 'departments' 
    ? filteredDepartments.length 
    : activeTab === 'designations' 
    ? filteredDesignations.length 
    : filteredRoles.length;

  // Infinite scroll intersection observer for high performance fast scrolling
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount(prev => Math.min(prev + PAGE_SIZE, currentTabCount));
      }
    }, { threshold: 0.1, rootMargin: '120px' });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [currentTabCount]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header 
        title="Master Hub" 
        subtitle="Manage departments, designations & system roles"
        onRefresh={loadAllMasters}
        refreshing={loading}
        onOpenBackup={onOpenBackup}
      />

      <div className="page-wrapper">
        {/* KPI Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          {/* Card 1: Departments */}
          <div 
            className="crm-card" 
            style={{ 
              padding: '1.25rem', 
              cursor: 'pointer', 
              borderLeft: activeTab === 'departments' ? '4px solid #2563eb' : '1px solid #e2e8f0',
              backgroundColor: activeTab === 'departments' ? '#f8fafc' : '#ffffff'
            }}
            onClick={() => setActiveTab('departments')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Departments</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {loading ? (
                    <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <RefreshCw size={14} className="spin-animation" color="#2563eb" /> Fetching data...
                    </span>
                  ) : (
                    departments.filter(d => !d.IsDeleted).length
                  )}
                </div>
              </div>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={22} color="#2563eb" />
              </div>
            </div>
            <div style={{ fontSize: '0.725rem', color: '#2563eb', fontWeight: '600', marginTop: '8px' }}>
              Used in Staff Master Dropdown
            </div>
          </div>

          {/* Card 2: Designations */}
          <div 
            className="crm-card" 
            style={{ 
              padding: '1.25rem', 
              cursor: 'pointer',
              borderLeft: activeTab === 'designations' ? '4px solid #2563eb' : '1px solid #e2e8f0',
              backgroundColor: activeTab === 'designations' ? '#f8fafc' : '#ffffff'
            }}
            onClick={() => setActiveTab('designations')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Designations</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {loading ? (
                    <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <RefreshCw size={14} className="spin-animation" color="#2563eb" /> Fetching data...
                    </span>
                  ) : (
                    designations.filter(d => !d.IsDeleted).length
                  )}
                </div>
              </div>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Briefcase size={22} color="#2563eb" />
              </div>
            </div>
            <div style={{ fontSize: '0.725rem', color: '#2563eb', fontWeight: '600', marginTop: '8px' }}>
              Mapped to Advisor Hierarchy
            </div>
          </div>

          {/* Card 3: Roles */}
          <div 
            className="crm-card" 
            style={{ 
              padding: '1.25rem', 
              cursor: 'pointer',
              borderLeft: activeTab === 'roles' ? '4px solid #2563eb' : '1px solid #e2e8f0',
              backgroundColor: activeTab === 'roles' ? '#f8fafc' : '#ffffff'
            }}
            onClick={() => setActiveTab('roles')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>CRM System Roles</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {loading ? (
                    <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <RefreshCw size={14} className="spin-animation" color="#2563eb" /> Fetching data...
                    </span>
                  ) : (
                    roles.filter(r => !r.IsDeleted).length
                  )}
                </div>
              </div>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={22} color="#2563eb" />
              </div>
            </div>
            <div style={{ fontSize: '0.725rem', color: '#2563eb', fontWeight: '600', marginTop: '8px' }}>
              Controls Access Rights & Permissions
            </div>
          </div>

          {/* Card 4: Tenant Master (SuperAdmin Only) */}
          {isSuperAdmin && (
            <div 
              className="crm-card" 
              style={{ 
                padding: '1.25rem', 
                cursor: 'pointer',
                borderLeft: '4px solid #10b981',
                backgroundColor: '#ffffff'
              }}
              onClick={() => window.dispatchEvent(new CustomEvent('crm_navigate', { detail: { page: 'superadmin' } }))}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '700' }}>Tenant Master</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
                    Client SaaS Orgs
                  </div>
                </div>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={22} color="#10b981" />
                </div>
              </div>
              <div style={{ fontSize: '0.725rem', color: '#059669', fontWeight: '600', marginTop: '8px' }}>
                Onboard Clients & Licenses →
              </div>
            </div>
          )}
        </div>

        {/* Master HUB Tabbed Interface */}
        <div className="crm-card">
          {/* Tab Navigation & Toolbar */}
          <div style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            backgroundColor: '#f8fafc'
          }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className={`btn btn-sm ${activeTab === 'departments' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('departments')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Building2 size={15} />
                <span>Department Master {loading ? '(…)' : `(${departments.length})`}</span>
              </button>

              <button
                className={`btn btn-sm ${activeTab === 'designations' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('designations')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Briefcase size={15} />
                <span>Designation Master {loading ? '(…)' : `(${designations.length})`}</span>
              </button>

              <button
                className={`btn btn-sm ${activeTab === 'roles' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('roles')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Shield size={15} />
                <span>Role Master {loading ? '(…)' : `(${roles.length})`}</span>
              </button>

              {isSuperAdmin && (
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => window.dispatchEvent(new CustomEvent('crm_navigate', { detail: { page: 'superadmin' } }))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    backgroundColor: '#ecfdf5',
                    borderColor: '#6ee7b7',
                    color: '#047857',
                    fontWeight: '700'
                  }}
                >
                  <Building2 size={15} color="#059669" />
                  <span>Tenant Master (Clients) ↗</span>
                </button>
              )}
            </div>

            {/* Actions: Search, Show Deleted, Add Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Search */}
              <div style={{ position: 'relative', width: '220px' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.2rem', paddingRight: '0.75rem', height: '36px', fontSize: '0.8rem' }}
                  placeholder="Filter master list..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>

              {/* Show Deleted Toggle */}
              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.775rem',
                color: showDeleted ? '#dc2626' : '#64748b',
                backgroundColor: showDeleted ? '#fee2e2' : '#ffffff',
                padding: '6px 10px',
                borderRadius: '6px',
                border: `1px solid ${showDeleted ? '#fca5a5' : '#cbd5e1'}`,
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

              {/* Add Button for active tab */}
              {activeTab === 'departments' && (
                <button className="btn btn-primary btn-sm" onClick={() => openAddModal('department')}>
                  <Plus size={15} /> Add Department
                </button>
              )}
              {activeTab === 'designations' && (
                <button className="btn btn-primary btn-sm" onClick={() => openAddModal('designation')}>
                  <Plus size={15} /> Add Designation
                </button>
              )}
              {activeTab === 'roles' && (
                <button className="btn btn-primary btn-sm" onClick={() => openAddModal('role')}>
                  <Plus size={15} /> Add Role
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="table-responsive">
            {/* 1. DEPARTMENTS TABLE */}
            {activeTab === 'departments' && (
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>S.No / Code</th>
                    <th>Department Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Audit Details</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                        <RefreshCw size={26} color="#2563eb" className="spin-animation" style={{ margin: '0 auto 0.75rem' }} />
                        <div style={{ fontWeight: '600', fontSize: '1rem', color: '#0f172a' }}>Fetching data...</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Please wait while department records are loaded from the database</div>
                      </td>
                    </tr>
                  ) : filteredDepartments.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                        <div style={{ fontWeight: '700', fontSize: '1rem', color: '#64748b' }}>No Data Found</div>
                        <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                          {showDeleted ? 'No deleted departments in archive.' : 'No departments found. Click "Add Department" to create one.'}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredDepartments.slice(0, visibleCount).map((dept) => (
                      <tr key={dept.DepartmentId} style={dept.IsDeleted ? { backgroundColor: '#fff5f5' } : {}}>
                        <td>
                          <span style={{ 
                            fontWeight: '700', 
                            color: dept.IsDeleted ? '#94a3b8' : '#2563eb',
                            textDecoration: dept.IsDeleted ? 'line-through' : 'none'
                          }}>
                            {dept.DepartmentCode}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: dept.IsDeleted ? '#64748b' : '#0f172a' }}>
                            {dept.DepartmentName}
                          </strong>
                        </td>
                        <td style={{ color: '#64748b', fontSize: '0.825rem' }}>
                          {dept.Description || '—'}
                        </td>
                        <td>
                          <span className={`badge ${dept.Status === 'Active' ? 'badge-primary' : 'badge-danger'}`}>
                            {dept.Status || 'Active'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                          {dept.Created_At ? new Date(dept.Created_At).toLocaleDateString() : '—'} ({dept.Created_By || 'System'})
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                            {dept.IsDeleted ? (
                              <button
                                className="btn btn-outline-blue btn-sm"
                                onClick={() => handleRestore('department', dept.DepartmentId, dept.DepartmentName)}
                                style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                              >
                                <RotateCcw size={12} /> Restore
                              </button>
                            ) : (
                              <>
                                <button
                                  className="btn-icon"
                                  title="Edit Department"
                                  onClick={() => openEditModal('department', dept)}
                                >
                                  <Edit2 size={15} color="#2563eb" />
                                </button>
                                <button
                                  className="btn-icon"
                                  title="Delete Department"
                                  onClick={() => handleDelete('department', dept.DepartmentId, dept.DepartmentName)}
                                >
                                  <Trash2 size={15} color="#ef4444" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* 2. DESIGNATIONS TABLE */}
            {activeTab === 'designations' && (
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>S.No / Code</th>
                    <th>Designation Name</th>
                    <th>Mapped Department</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Audit Details</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                        <RefreshCw size={26} color="#2563eb" className="spin-animation" style={{ margin: '0 auto 0.75rem' }} />
                        <div style={{ fontWeight: '600', fontSize: '1rem', color: '#0f172a' }}>Fetching data...</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Please wait while designation records are loaded from the database</div>
                      </td>
                    </tr>
                  ) : filteredDesignations.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                        <div style={{ fontWeight: '700', fontSize: '1rem', color: '#64748b' }}>No Data Found</div>
                        <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                          {showDeleted ? 'No deleted designations in archive.' : 'No designations found. Click "Add Designation" to create one.'}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredDesignations.slice(0, visibleCount).map((desig) => (
                      <tr key={desig.DesignationId} style={desig.IsDeleted ? { backgroundColor: '#fff5f5' } : {}}>
                        <td>
                          <span style={{ 
                            fontWeight: '700', 
                            color: desig.IsDeleted ? '#94a3b8' : '#2563eb',
                            textDecoration: desig.IsDeleted ? 'line-through' : 'none'
                          }}>
                            {desig.DesignationCode}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: desig.IsDeleted ? '#64748b' : '#0f172a' }}>
                            {desig.DesignationName}
                          </strong>
                        </td>
                        <td>
                          <span className="badge badge-info">
                            {desig.Department || 'General'}
                          </span>
                        </td>
                        <td style={{ color: '#64748b', fontSize: '0.825rem' }}>
                          {desig.Description || '—'}
                        </td>
                        <td>
                          <span className={`badge ${desig.Status === 'Active' ? 'badge-primary' : 'badge-danger'}`}>
                            {desig.Status || 'Active'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                          {desig.Created_At ? new Date(desig.Created_At).toLocaleDateString() : '—'} ({desig.Created_By || 'System'})
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                            {desig.IsDeleted ? (
                              <button
                                className="btn btn-outline-blue btn-sm"
                                onClick={() => handleRestore('designation', desig.DesignationId, desig.DesignationName)}
                                style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                              >
                                <RotateCcw size={12} /> Restore
                              </button>
                            ) : (
                              <>
                                <button
                                  className="btn-icon"
                                  title="Edit Designation"
                                  onClick={() => openEditModal('designation', desig)}
                                >
                                  <Edit2 size={15} color="#2563eb" />
                                </button>
                                <button
                                  className="btn-icon"
                                  title="Delete Designation"
                                  onClick={() => handleDelete('designation', desig.DesignationId, desig.DesignationName)}
                                >
                                  <Trash2 size={15} color="#ef4444" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* 3. ROLES TABLE */}
            {activeTab === 'roles' && (
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>S.No / Code</th>
                    <th>CRM System Role</th>
                    <th>Description & Permissions</th>
                    <th>Status</th>
                    <th>Audit Details</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                        <RefreshCw size={26} color="#2563eb" className="spin-animation" style={{ margin: '0 auto 0.75rem' }} />
                        <div style={{ fontWeight: '600', fontSize: '1rem', color: '#0f172a' }}>Fetching data...</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Please wait while role records are loaded from the database</div>
                      </td>
                    </tr>
                  ) : filteredRoles.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                        <div style={{ fontWeight: '700', fontSize: '1rem', color: '#64748b' }}>No Data Found</div>
                        <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                          {showDeleted ? 'No deleted roles in archive.' : 'No roles found. Click "Add Role" to create one.'}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRoles.slice(0, visibleCount).map((role) => (
                      <tr key={role.RoleId} style={role.IsDeleted ? { backgroundColor: '#fff5f5' } : {}}>
                        <td>
                          <span style={{ 
                            fontWeight: '700', 
                            color: role.IsDeleted ? '#94a3b8' : '#2563eb',
                            textDecoration: role.IsDeleted ? 'line-through' : 'none'
                          }}>
                            {role.RoleCode}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: role.IsDeleted ? '#64748b' : '#0f172a' }}>
                            {role.RoleName}
                          </strong>
                        </td>
                        <td style={{ color: '#64748b', fontSize: '0.825rem' }}>
                          {role.Description || '—'}
                        </td>
                        <td>
                          <span className={`badge ${role.Status === 'Active' ? 'badge-primary' : 'badge-danger'}`}>
                            {role.Status || 'Active'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                          {role.Created_At ? new Date(role.Created_At).toLocaleDateString() : '—'} ({role.Created_By || 'System'})
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                            {role.IsDeleted ? (
                              <button
                                className="btn btn-outline-blue btn-sm"
                                onClick={() => handleRestore('role', role.RoleId, role.RoleName)}
                                style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                              >
                                <RotateCcw size={12} /> Restore
                              </button>
                            ) : (
                              <>
                                <button
                                  className="btn-icon"
                                  title="Edit Role"
                                  onClick={() => openEditModal('role', role)}
                                >
                                  <Edit2 size={15} color="#2563eb" />
                                </button>
                                <button
                                  className="btn-icon"
                                  title="Delete Role"
                                  onClick={() => handleDelete('role', role.RoleId, role.RoleName)}
                                >
                                  <Trash2 size={15} color="#ef4444" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Progressive Infinite Scroll Sentinel & Counter */}
          {!loading && currentTabCount > 0 && (
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
                Showing <strong>{Math.min(visibleCount, currentTabCount)}</strong> of <strong>{currentTabCount}</strong> records
              </span>
              {visibleCount < currentTabCount ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.775rem', color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <RefreshCw size={13} className="spin-animation" /> Scroll for more (+10)
                  </span>
                  <button
                    className="btn btn-outline-blue btn-sm"
                    style={{ fontSize: '0.725rem', padding: '2px 8px' }}
                    onClick={() => setVisibleCount(prev => Math.min(prev + PAGE_SIZE, currentTabCount))}
                  >
                    Load More (+10)
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.725rem', padding: '2px 8px' }}
                    onClick={() => setVisibleCount(currentTabCount)}
                  >
                    Load All ({currentTabCount})
                  </button>
                </div>
              ) : (
                <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                  <CheckCircle2 size={14} /> All {currentTabCount} records loaded
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Master Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !saving && setIsModalOpen(false)}
        title={
          editingItem 
            ? `Edit ${modalType.charAt(0).toUpperCase() + modalType.slice(1)}: ${formData.code}` 
            : `Add New ${modalType.charAt(0).toUpperCase() + modalType.slice(1)}`
        }
        maxWidth="540px"
      >
        <form onSubmit={handleSave}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">
                S.No / Code (Primary Key) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. 1, 2, 3..."
                required
              />
              <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '4px' }}>
                Unique numeric serial number or primary key. Duplicate codes/IDs are strictly prevented.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                {modalType === 'department' ? 'Department Name' : modalType === 'designation' ? 'Designation Name' : 'Role Title'} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={
                  modalType === 'department' 
                    ? 'e.g. Wealth Management' 
                    : modalType === 'designation' 
                    ? 'e.g. Senior Investment Advisor' 
                    : 'e.g. Relationship Manager'
                }
                required
              />
            </div>

            {/* Mapped Department for Designations */}
            {modalType === 'designation' && (
              <div className="form-group">
                <label className="form-label">Mapped Department</label>
                <select
                  className="form-select"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  disabled={loading}
                >
                  {loading ? (
                    <option value="" disabled>Fetching data...</option>
                  ) : departments.filter(d => !d.IsDeleted && d.Status === 'Active').length === 0 ? (
                    <option value="" disabled>No Data Available</option>
                  ) : (
                    <>
                      <option value="">-- Select Department --</option>
                      {departments.filter(d => !d.IsDeleted && d.Status === 'Active').map(dept => (
                        <option key={dept.DepartmentId} value={dept.DepartmentName}>
                          {dept.DepartmentName} ({dept.DepartmentCode})
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Description / Responsibilities</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this master entity..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
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
              {saving ? 'Saving...' : editingItem ? 'Update Master' : 'Create Master'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

