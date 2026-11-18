import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Building2, 
  Users, 
  UserCheck, 
  UserX, 
  Search, 
  Filter, 
  Save, 
  Trash2, 
  ShieldCheck, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Check, 
  UserPlus, 
  Briefcase, 
  Info,
  CheckSquare,
  Square
} from 'lucide-react';
import { crmApi, subscribeCrmEvents } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { showSuccess, showError, showWarning, showConfirm } from '../utils/swal';

const ROLE_OPTIONS = [
  { value: 'Admin', label: 'Admin', badgeClass: 'badge-primary' },
  { value: 'Manager', label: 'Manager', badgeClass: 'badge-info' },
  { value: 'Staff', label: 'Staff', badgeClass: 'badge-success' },
  { value: 'Viewer', label: 'Viewer', badgeClass: 'badge-neutral' }
];

export default function TenantUserMapping({ onOpenBackup }) {
  const { isSuperAdmin } = useAuth();
  
  // Data states
  const [tenants, setTenants] = useState([]);
  const [centralUsers, setCentralUsers] = useState([]);
  const [allMappings, setAllMappings] = useState([]);
  
  // Selection & Form State
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [userAssignments, setUserAssignments] = useState({}); // { [userId]: { selected: boolean, role: string } }
  
  // UI & Loading states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Search & Filter states for Assignment Box
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [assignmentFilterTab, setAssignmentFilterTab] = useState('all'); // 'all' | 'assigned' | 'unassigned'
  
  // Search & Filter states for Directory Table
  const [tableSearchQuery, setTableSearchQuery] = useState('');
  const [tableTenantFilter, setTableTenantFilter] = useState('all');
  const [tableRoleFilter, setTableRoleFilter] = useState('all');

  // Load initial data
  const loadData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const [tenantsRes, usersRes, mappingsRes] = await Promise.all([
        crmApi.getTenants(false).catch(err => {
          console.error('Failed to load tenants:', err);
          return [];
        }),
        crmApi.getCentralUsers(false).catch(err => {
          console.error('Failed to load central users:', err);
          return [];
        }),
        crmApi.getTenantUserMappings(null, false).catch(err => {
          console.error('Failed to load mappings:', err);
          return [];
        })
      ]);

      const tList = Array.isArray(tenantsRes) ? tenantsRes : [];
      const uList = Array.isArray(usersRes) ? usersRes : [];
      const mList = Array.isArray(mappingsRes) ? mappingsRes : [];

      setTenants(tList);
      setCentralUsers(uList);
      setAllMappings(mList);

      // Auto-select first active tenant if none selected
      setSelectedTenantId(prev => {
        if (prev && tList.some(t => t.TenantId === prev)) return prev;
        const firstActive = tList.find(t => (t.Status || 'Active').toLowerCase() === 'active') || tList[0];
        return firstActive ? firstActive.TenantId : '';
      });

    } catch (err) {
      console.error('Error loading Tenant-User Mapping data:', err);
      showError('Failed to load mapping data', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Listen for cross-tab or remote events
    const unsub = subscribeCrmEvents((evt) => {
      if (evt.module === 'TenantUserMapping' || evt.module === 'TenantMaster' || evt.action === 'saveTenantUserMappings') {
        loadData(true);
      }
    });
    return unsub;
  }, [loadData]);

  // Sync userAssignments when selectedTenantId or allMappings/centralUsers change
  useEffect(() => {
    if (!selectedTenantId) {
      setUserAssignments({});
      return;
    }

    const currentTenantMappings = allMappings.filter(
      m => String(m.TenantId || '').toUpperCase() === selectedTenantId.toUpperCase() &&
           !m.IsDeleted && String(m.Status || 'Active').toLowerCase() === 'active'
    );

    const mappedMap = {};
    currentTenantMappings.forEach(m => {
      const uKey = String(m.UserId || '').trim();
      if (uKey) {
        mappedMap[uKey] = {
          selected: true,
          role: m.Role || 'Staff',
          mappingId: m.MappingId
        };
      }
    });

    const newAssignments = {};
    centralUsers.forEach(u => {
      const uId = u.UserId;
      if (mappedMap[uId]) {
        newAssignments[uId] = {
          selected: true,
          role: mappedMap[uId].role || 'Staff',
          mappingId: mappedMap[uId].mappingId
        };
      } else {
        newAssignments[uId] = {
          selected: false,
          role: 'Staff',
          mappingId: null
        };
      }
    });

    setUserAssignments(newAssignments);
  }, [selectedTenantId, allMappings, centralUsers]);

  // Selected Tenant Object
  const selectedTenant = useMemo(() => {
    return tenants.find(t => t.TenantId === selectedTenantId) || null;
  }, [tenants, selectedTenantId]);

  // Toggle User Selection
  const toggleUserSelection = (userId) => {
    setUserAssignments(prev => {
      const current = prev[userId] || { selected: false, role: 'Staff' };
      return {
        ...prev,
        [userId]: {
          ...current,
          selected: !current.selected
        }
      };
    });
  };

  // Change Role for User
  const handleRoleChange = (userId, newRole) => {
    setUserAssignments(prev => {
      const current = prev[userId] || { selected: false, role: 'Staff' };
      return {
        ...prev,
        [userId]: {
          ...current,
          role: newRole
        }
      };
    });
  };

  // Bulk Actions
  const handleSelectAllFiltered = (filteredUserList) => {
    setUserAssignments(prev => {
      const next = { ...prev };
      filteredUserList.forEach(u => {
        next[u.UserId] = {
          ...(next[u.UserId] || { role: 'Staff' }),
          selected: true
        };
      });
      return next;
    });
  };

  const handleDeselectAllFiltered = (filteredUserList) => {
    setUserAssignments(prev => {
      const next = { ...prev };
      filteredUserList.forEach(u => {
        next[u.UserId] = {
          ...(next[u.UserId] || { role: 'Staff' }),
          selected: false
        };
      });
      return next;
    });
  };

  // Save Mappings
  const handleSaveMappings = async () => {
    if (!selectedTenantId) {
      showWarning('Select Tenant', 'Please choose a tenant before saving mappings.');
      return;
    }

    try {
      setSaving(true);

      const mappingsToSave = Object.entries(userAssignments)
        .filter(([_, data]) => data.selected)
        .map(([userId, data]) => ({
          userId: userId,
          role: data.role || 'Staff',
          status: 'Active'
        }));

      await crmApi.saveTenantUserMappings(selectedTenantId, mappingsToSave, true);

      showSuccess(
        'Mappings Saved Successfully!',
        `${mappingsToSave.length} user${mappingsToSave.length === 1 ? '' : 's'} assigned to ${selectedTenant?.CompanyName || selectedTenantId}.`
      );

      // Refresh data to reflect latest state
      await loadData(true);

    } catch (err) {
      console.error('Failed to save tenant user mappings:', err);
      showError('Save Failed', err?.message || 'Could not save mappings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Individual Mapping from Master Table
  const handleDeleteMapping = async (mapping) => {
    const confirm = await showConfirm(
      'Remove Tenant User Mapping?',
      `Are you sure you want to unmap user "${mapping.UserName || mapping.UserId}" from "${mapping.TenantName || mapping.TenantId}"?`,
      'Yes, Remove Mapping'
    );

    if (!confirm) return;

    try {
      setSaving(true);
      await crmApi.deleteTenantUserMapping(mapping.MappingId, mapping.TenantId, mapping.UserId);
      showSuccess('Mapping Removed', 'The user mapping has been removed.');
      await loadData(true);
    } catch (err) {
      console.error('Failed to delete mapping:', err);
      showError('Delete Failed', err?.message || 'Could not remove mapping.');
    } finally {
      setSaving(false);
    }
  };

  // Filtered Central Users for Assignment Panel
  const filteredAssignmentUsers = useMemo(() => {
    const q = userSearchQuery.toLowerCase().trim();
    return centralUsers.filter(u => {
      const matchSearch = !q ||
        (u.FullName && u.FullName.toLowerCase().includes(q)) ||
        (u.Email && u.Email.toLowerCase().includes(q)) ||
        (u.UserId && u.UserId.toLowerCase().includes(q)) ||
        (u.Mobile && String(u.Mobile).includes(q));

      const isSelected = Boolean(userAssignments[u.UserId]?.selected);
      let matchTab = true;
      if (assignmentFilterTab === 'assigned') matchTab = isSelected;
      if (assignmentFilterTab === 'unassigned') matchTab = !isSelected;

      return matchSearch && matchTab;
    });
  }, [centralUsers, userSearchQuery, assignmentFilterTab, userAssignments]);

  // Selected Count for Active Tenant
  const selectedCountForTenant = useMemo(() => {
    return Object.values(userAssignments).filter(a => a.selected).length;
  }, [userAssignments]);

  // Filtered Mappings for Directory Table
  const filteredTableMappings = useMemo(() => {
    const q = tableSearchQuery.toLowerCase().trim();
    return allMappings.filter(m => {
      if (m.IsDeleted) return false;

      const matchTenant = tableTenantFilter === 'all' || 
        String(m.TenantId || '').toUpperCase() === tableTenantFilter.toUpperCase();

      const matchRole = tableRoleFilter === 'all' || 
        String(m.Role || '').toLowerCase() === tableRoleFilter.toLowerCase();

      const matchSearch = !q ||
        (m.TenantName && m.TenantName.toLowerCase().includes(q)) ||
        (m.TenantId && m.TenantId.toLowerCase().includes(q)) ||
        (m.UserName && m.UserName.toLowerCase().includes(q)) ||
        (m.UserEmail && m.UserEmail.toLowerCase().includes(q)) ||
        (m.UserId && m.UserId.toLowerCase().includes(q)) ||
        (m.Role && m.Role.toLowerCase().includes(q));

      return matchTenant && matchRole && matchSearch;
    });
  }, [allMappings, tableSearchQuery, tableTenantFilter, tableRoleFilter]);

  // Statistics KPI
  const stats = useMemo(() => {
    const activeMappings = allMappings.filter(m => !m.IsDeleted && String(m.Status || 'Active').toLowerCase() === 'active');
    const mappedUserIds = new Set(activeMappings.map(m => String(m.UserId || '').trim().toLowerCase()));
    const unmappedUsersCount = centralUsers.filter(u => !mappedUserIds.has(String(u.UserId || '').trim().toLowerCase())).length;
    const configuredTenantsCount = new Set(activeMappings.map(m => String(m.TenantId || '').trim().toUpperCase())).size;

    return {
      totalMappings: activeMappings.length,
      configuredTenants: configuredTenantsCount,
      totalUsers: centralUsers.length,
      unmappedUsers: unmappedUsersCount
    };
  }, [allMappings, centralUsers]);

  if (!isSuperAdmin) {
    return (
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '2rem' }}>
        <div className="crm-card" style={{ padding: '2.5rem', maxWidth: '420px', textAlign: 'center', border: '1px solid #fee2e2' }}>
          <XCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>Access Denied</h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Tenant-User Mapping is restricted to SuperAdmin accounts only.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <Header
        title="Tenant-User Mapping"
        subtitle="Manage and assign registered users to client tenant organizations"
        onRefresh={() => loadData(true)}
        refreshing={refreshing}
        onOpenBackup={onOpenBackup}
      />

      <div className="page-wrapper">
        {/* KPI Top 4 Metric Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          {/* Card 1: Active Mappings */}
          <div className="crm-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Total Active Mappings</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                <UserCheck size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a', marginTop: '0.5rem' }}>
              {stats.totalMappings}
            </div>
            <div style={{ fontSize: '0.725rem', color: '#16a34a', marginTop: '0.25rem', fontWeight: '600' }}>
              Across all tenant workspaces
            </div>
          </div>

          {/* Card 2: Configured Tenants */}
          <div className="crm-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Configured Tenants</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333ea' }}>
                <Building2 size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a', marginTop: '0.5rem' }}>
              {stats.configuredTenants} <span style={{ fontSize: '1rem', fontWeight: '500', color: '#64748b' }}>/ {tenants.length}</span>
            </div>
            <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '0.25rem' }}>
              Tenants with assigned users
            </div>
          </div>

          {/* Card 3: Central Registered Users */}
          <div className="crm-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Central Registered Users</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                <Users size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a', marginTop: '0.5rem' }}>
              {stats.totalUsers}
            </div>
            <div style={{ fontSize: '0.725rem', color: '#16a34a', marginTop: '0.25rem', fontWeight: '600' }}>
              Available in User_Master
            </div>
          </div>

          {/* Card 4: Unassigned Users */}
          <div className="crm-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Unassigned Users</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                <UserX size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: stats.unmappedUsers > 0 ? '#d97706' : '#0f172a', marginTop: '0.5rem' }}>
              {stats.unmappedUsers}
            </div>
            <div style={{ fontSize: '0.725rem', color: stats.unmappedUsers > 0 ? '#b45309' : '#64748b', marginTop: '0.25rem', fontWeight: stats.unmappedUsers > 0 ? '700' : '500' }}>
              {stats.unmappedUsers > 0 ? 'Pending tenant assignment' : 'All users assigned'}
            </div>
          </div>
        </div>

        {/* PRIMARY ASSIGNMENT CARD */}
        <div className="crm-card" style={{ padding: 0, marginBottom: '1.5rem', overflow: 'hidden' }}>
          {/* Card Top Banner: Select Tenant */}
          <div style={{
            padding: '1.25rem 1.5rem',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                  <UserPlus size={16} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  Assign Users to Tenant
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                Select a tenant organization from the dropdown, then select multiple users and specify their roles.
              </p>
            </div>

            {/* Tenant Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <label style={{ fontSize: '0.825rem', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
                <Building2 size={16} color="#2563eb" />
                Select Tenant:
              </label>
              <select
                className="form-select"
                value={selectedTenantId}
                onChange={(e) => setSelectedTenantId(e.target.value)}
                style={{
                  minWidth: '280px',
                  fontWeight: '600',
                  color: '#0f172a',
                  borderColor: '#93c5fd',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="" disabled>-- Choose Client Tenant --</option>
                {tenants.map(t => (
                  <option key={t.TenantId} value={t.TenantId}>
                    {t.TenantId} - {t.CompanyName || 'Unnamed Organization'} ({t.Status || 'Active'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Tenant Info Strip */}
          {selectedTenant && (
            <div style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#eff6ff',
              borderBottom: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              fontSize: '0.8125rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span className="badge badge-primary">{selectedTenant.TenantId}</span>
                <strong style={{ color: '#1e40af', fontSize: '0.875rem' }}>{selectedTenant.CompanyName}</strong>
                {selectedTenant.ContactEmail && (
                  <span style={{ color: '#64748b' }}>• {selectedTenant.ContactEmail}</span>
                )}
                <span className={`badge ${String(selectedTenant.Status).toLowerCase() === 'active' ? 'badge-success' : 'badge-danger'}`}>
                  {selectedTenant.Status || 'Active'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e40af', fontWeight: '600' }}>
                <UserCheck size={16} color="#16a34a" />
                <span>
                  Currently Assigned: <strong style={{ color: '#2563eb', fontSize: '0.95rem' }}>{selectedCountForTenant}</strong> / {centralUsers.length} users
                </span>
              </div>
            </div>
          )}

          {/* Filter & Search Toolbar */}
          <div style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            {/* Search Box */}
            <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '400px' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search users by name, email, ID, mobile..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.3rem' }}
              />
              {userSearchQuery && (
                <button
                  type="button"
                  onClick={() => setUserSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '0.65rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Tabs & Bulk Selection */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <div style={{
                display: 'inline-flex',
                borderRadius: '8px',
                padding: '3px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0'
              }}>
                <button
                  type="button"
                  onClick={() => setAssignmentFilterTab('all')}
                  className={`btn btn-sm ${assignmentFilterTab === 'all' ? 'btn-primary' : ''}`}
                  style={{
                    backgroundColor: assignmentFilterTab === 'all' ? '#2563eb' : 'transparent',
                    color: assignmentFilterTab === 'all' ? '#ffffff' : '#475569',
                    border: 'none',
                    padding: '0.25rem 0.65rem',
                    fontSize: '0.75rem'
                  }}
                >
                  All ({centralUsers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAssignmentFilterTab('assigned')}
                  className={`btn btn-sm ${assignmentFilterTab === 'assigned' ? 'btn-primary' : ''}`}
                  style={{
                    backgroundColor: assignmentFilterTab === 'assigned' ? '#2563eb' : 'transparent',
                    color: assignmentFilterTab === 'assigned' ? '#ffffff' : '#475569',
                    border: 'none',
                    padding: '0.25rem 0.65rem',
                    fontSize: '0.75rem'
                  }}
                >
                  Selected ({selectedCountForTenant})
                </button>
                <button
                  type="button"
                  onClick={() => setAssignmentFilterTab('unassigned')}
                  className={`btn btn-sm ${assignmentFilterTab === 'unassigned' ? 'btn-primary' : ''}`}
                  style={{
                    backgroundColor: assignmentFilterTab === 'unassigned' ? '#2563eb' : 'transparent',
                    color: assignmentFilterTab === 'unassigned' ? '#ffffff' : '#475569',
                    border: 'none',
                    padding: '0.25rem 0.65rem',
                    fontSize: '0.75rem'
                  }}
                >
                  Unselected ({centralUsers.length - selectedCountForTenant})
                </button>
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleSelectAllFiltered(filteredAssignmentUsers)}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
              >
                Select All
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleDeselectAllFiltered(filteredAssignmentUsers)}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* Multi-User Grid */}
          <div style={{ padding: '1.25rem 1.5rem', maxHeight: '460px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
                <RefreshCw size={28} color="#2563eb" className="spin-animation" style={{ margin: '0 auto 0.75rem' }} />
                <p style={{ fontSize: '0.875rem' }}>Loading central users and mappings from Google Sheets...</p>
              </div>
            ) : filteredAssignmentUsers.length === 0 ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', border: '2px dashed #e2e8f0', borderRadius: '12px' }}>
                <Users size={36} color="#cbd5e1" style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569', margin: 0 }}>No users found</p>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Try adjusting your search query or filter tab.</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '0.85rem'
              }}>
                {filteredAssignmentUsers.map(user => {
                  const assignment = userAssignments[user.UserId] || { selected: false, role: 'Staff' };
                  const isChecked = Boolean(assignment.selected);

                  return (
                    <div
                      key={user.UserId}
                      style={{
                        padding: '0.85rem',
                        borderRadius: '10px',
                        border: isChecked ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                        backgroundColor: isChecked ? '#eff6ff' : '#ffffff',
                        boxShadow: isChecked ? '0 1px 3px rgba(37,99,235,0.12)' : 'none',
                        transition: 'all 0.15s ease-in-out'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                        {/* Checkbox */}
                        <div style={{ paddingTop: '2px' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleUserSelection(user.UserId)}
                            style={{
                              width: '18px',
                              height: '18px',
                              cursor: 'pointer',
                              accentColor: '#2563eb'
                            }}
                          />
                        </div>

                        {/* User Details */}
                        <div
                          style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                          onClick={() => toggleUserSelection(user.UserId)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <strong style={{ fontSize: '0.875rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {user.FullName || 'Unnamed User'}
                            </strong>
                            {user.IsSuperAdmin && (
                              <span className="badge badge-warning" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                                SuperAdmin
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                            {user.Email || user.UserId}
                          </div>
                          {user.Mobile && (
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                              📞 {user.Mobile}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Role Selector */}
                      <div style={{
                        marginTop: '0.65rem',
                        paddingTop: '0.5rem',
                        borderTop: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem'
                      }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>
                          Tenant Role:
                        </span>
                        <select
                          className="form-select"
                          value={assignment.role || 'Staff'}
                          disabled={!isChecked}
                          onChange={(e) => handleRoleChange(user.UserId, e.target.value)}
                          style={{
                            width: 'auto',
                            padding: '0.25rem 0.55rem',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backgroundColor: isChecked ? '#ffffff' : '#f8fafc',
                            borderColor: isChecked ? '#93c5fd' : '#e2e8f0',
                            color: isChecked ? '#0f172a' : '#94a3b8'
                          }}
                        >
                          {ROLE_OPTIONS.map(r => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Footer with Primary SAVE Button */}
          <div style={{
            padding: '1rem 1.5rem',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.775rem', color: '#64748b' }}>
              <Info size={16} color="#2563eb" />
              <span>
                Saving commits assigned records to the <code style={{ backgroundColor: '#e2e8f0', padding: '2px 5px', borderRadius: '4px', color: '#0f172a', fontWeight: '600' }}>Tenant_User_Mapping</code> tab in real-time.
              </span>
            </div>

            <div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveMappings}
                disabled={saving || !selectedTenantId}
                style={{
                  padding: '0.65rem 1.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)'
                }}
              >
                {saving ? (
                  <>
                    <RefreshCw size={16} className="spin-animation" />
                    <span>Saving Mappings...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>SAVE Tenant-User Mappings ({selectedCountForTenant})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ACTIVE MAPPINGS DIRECTORY (MASTER TABLE) */}
        <div className="crm-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                  <Briefcase size={16} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  Active Tenant-User Mappings Directory
                </h3>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.25rem 0 0' }}>
                Full live record of all tenant-user associations stored in Google Sheets.
              </p>
            </div>

            {/* Table Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              {/* Tenant Filter */}
              <select
                className="form-select"
                value={tableTenantFilter}
                onChange={(e) => setTableTenantFilter(e.target.value)}
                style={{ width: 'auto', fontSize: '0.8rem', padding: '0.4rem 0.65rem' }}
              >
                <option value="all">All Tenants ({tenants.length})</option>
                {tenants.map(t => (
                  <option key={t.TenantId} value={t.TenantId}>
                    {t.TenantId} - {t.CompanyName}
                  </option>
                ))}
              </select>

              {/* Role Filter */}
              <select
                className="form-select"
                value={tableRoleFilter}
                onChange={(e) => setTableRoleFilter(e.target.value)}
                style={{ width: 'auto', fontSize: '0.8rem', padding: '0.4rem 0.65rem' }}
              >
                <option value="all">All Roles</option>
                {ROLE_OPTIONS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>

              {/* Search Table */}
              <div style={{ position: 'relative', width: '200px' }}>
                <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filter directory..."
                  value={tableSearchQuery}
                  onChange={(e) => setTableSearchQuery(e.target.value)}
                  style={{ paddingLeft: '2rem', fontSize: '0.8rem', padding: '0.4rem 0.65rem 0.4rem 2rem' }}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Mapping ID</th>
                  <th>Tenant Organization</th>
                  <th>Assigned User</th>
                  <th>Tenant Role</th>
                  <th>Status</th>
                  <th>Created / Updated</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTableMappings.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                      No tenant user mappings found matching the filters.
                    </td>
                  </tr>
                ) : (
                  filteredTableMappings.map((mapping) => {
                    const roleBadge = ROLE_OPTIONS.find(r => r.value.toLowerCase() === (mapping.Role || '').toLowerCase()) || ROLE_OPTIONS[2];

                    return (
                      <tr key={mapping.MappingId || `${mapping.TenantId}-${mapping.UserId}`}>
                        {/* Mapping ID */}
                        <td style={{ fontFamily: 'monospace', fontWeight: '600', color: '#475569', fontSize: '0.8rem' }}>
                          {mapping.MappingId || '-'}
                        </td>

                        {/* Tenant */}
                        <td>
                          <div style={{ fontWeight: '700', color: '#0f172a' }}>
                            {mapping.TenantName || mapping.TenantId}
                          </div>
                          <div style={{ fontSize: '0.725rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                            {mapping.TenantId}
                          </div>
                        </td>

                        {/* User */}
                        <td>
                          <div style={{ fontWeight: '600', color: '#0f172a' }}>
                            {mapping.UserName || mapping.UserId}
                          </div>
                          <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                            {mapping.UserEmail || mapping.UserId}
                          </div>
                        </td>

                        {/* Role */}
                        <td>
                          <span className={`badge ${roleBadge.badgeClass}`}>
                            {mapping.Role || 'Staff'}
                          </span>
                        </td>

                        {/* Status */}
                        <td>
                          <span className={`badge ${String(mapping.Status || 'Active').toLowerCase() === 'active' ? 'badge-success' : 'badge-danger'}`}>
                            {mapping.Status || 'Active'}
                          </span>
                        </td>

                        {/* Created / Updated */}
                        <td style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {mapping.Updated_At ? (
                            new Date(mapping.Updated_At).toLocaleDateString()
                          ) : mapping.Created_At ? (
                            new Date(mapping.Created_At).toLocaleDateString()
                          ) : (
                            '-'
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => handleDeleteMapping(mapping)}
                            title="Remove mapping"
                            style={{ color: '#ef4444' }}
                          >
                            <Trash2 size={16} />
                          </button>
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
    </div>
  );
}
