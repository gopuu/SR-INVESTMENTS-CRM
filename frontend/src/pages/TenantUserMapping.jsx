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
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { crmApi, subscribeCrmEvents } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { showSuccess, showError, showWarning, showConfirm } from '../utils/swal';

const ROLE_OPTIONS = [
  { value: 'Admin', label: 'Admin', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-300 dark:border-purple-700' },
  { value: 'Manager', label: 'Manager', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300 dark:border-blue-700' },
  { value: 'Staff', label: 'Staff', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' },
  { value: 'Viewer', label: 'Viewer', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700' }
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

  const handleSetAllRole = (filteredUserList, role) => {
    setUserAssignments(prev => {
      const next = { ...prev };
      filteredUserList.forEach(u => {
        if (next[u.UserId]?.selected) {
          next[u.UserId] = {
            ...next[u.UserId],
            role: role
          };
        }
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

      const res = await crmApi.saveTenantUserMappings(selectedTenantId, mappingsToSave, true);

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
      <div className="flex-1 flex items-center justify-center min-h-[60vh] p-6">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-red-200 dark:border-red-900/50 max-w-md text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Access Denied</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tenant-User Mapping is restricted to SuperAdmin accounts only.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <Header
        title="Tenant-User Mapping"
        subtitle="Manage and assign registered users to client tenant organizations"
        onRefresh={() => loadData(true)}
        refreshing={refreshing}
        onOpenBackup={onOpenBackup}
      />

      <div className="flex-1 p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3.5">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Active Mappings</p>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">{stats.totalMappings}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3.5">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Configured Tenants</p>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">{stats.configuredTenants} / {tenants.length}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3.5">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Central Registered Users</p>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">{stats.totalUsers}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3.5">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-lg">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Unassigned Users</p>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">{stats.unmappedUsers}</h3>
            </div>
          </div>
        </div>

        {/* PRIMARY ASSIGNMENT SECTION */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Card Header & Tenant Selector */}
          <div className="p-5 md:p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50/50 via-indigo-50/20 to-transparent dark:from-slate-800/80 dark:to-slate-800">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1.5 bg-blue-600 text-white rounded-lg shadow-sm">
                    <UserPlus className="w-4 h-4" />
                  </span>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                    Assign Users to Tenant
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select a tenant organization from the dropdown, then select multiple users and specify their roles.
                </p>
              </div>

              {/* Tenant Dropdown */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 whitespace-nowrap">
                  <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Select Tenant:
                </label>
                <div className="relative min-w-[280px]">
                  <select
                    value={selectedTenantId}
                    onChange={(e) => setSelectedTenantId(e.target.value)}
                    className="w-full pl-3 pr-8 py-2.5 bg-white dark:bg-slate-900 border-2 border-blue-500/40 hover:border-blue-500 focus:border-blue-600 rounded-xl text-sm font-semibold text-slate-800 dark:text-white shadow-sm transition-all outline-none cursor-pointer"
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
            </div>

            {/* Selected Tenant Quick Info Banner */}
            {selectedTenant && (
              <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold rounded-md">
                    {selectedTenant.TenantId}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedTenant.CompanyName}
                  </span>
                  {selectedTenant.ContactEmail && (
                    <span className="text-slate-400 dark:text-slate-500">
                      • {selectedTenant.ContactEmail}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full font-medium ${
                    (selectedTenant.Status || 'Active').toLowerCase() === 'active'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
                  }`}>
                    {selectedTenant.Status || 'Active'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>
                    Currently Assigned: <strong className="text-blue-600 dark:text-blue-400 font-bold">{selectedCountForTenant}</strong> / {centralUsers.length} users
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* User Selection Controls & Filter Toolbar */}
          <div className="p-4 md:p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search users by name, email, ID or mobile..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs md:text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {userSearchQuery && (
                <button
                  onClick={() => setUserSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Tabs & Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-lg p-1 bg-slate-200/70 dark:bg-slate-800 border border-slate-300/50 dark:border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setAssignmentFilterTab('all')}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    assignmentFilterTab === 'all'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All ({centralUsers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAssignmentFilterTab('assigned')}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    assignmentFilterTab === 'assigned'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Selected ({selectedCountForTenant})
                </button>
                <button
                  type="button"
                  onClick={() => setAssignmentFilterTab('unassigned')}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    assignmentFilterTab === 'unassigned'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Unselected ({centralUsers.length - selectedCountForTenant})
                </button>
              </div>

              {/* Bulk Toggle Buttons */}
              <button
                type="button"
                onClick={() => handleSelectAllFiltered(filteredAssignmentUsers)}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium transition-colors shadow-sm"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() => handleDeselectAllFiltered(filteredAssignmentUsers)}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium transition-colors shadow-sm"
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* User Selection Multi-Card Grid */}
          <div className="p-4 md:p-6 max-h-[460px] overflow-y-auto">
            {loading ? (
              <div className="py-16 text-center">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Loading central users and mappings...</p>
              </div>
            ) : filteredAssignmentUsers.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No users found</p>
                <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or filter tab.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredAssignmentUsers.map(user => {
                  const assignment = userAssignments[user.UserId] || { selected: false, role: 'Staff' };
                  const isChecked = Boolean(assignment.selected);

                  return (
                    <div
                      key={user.UserId}
                      className={`relative rounded-xl p-3.5 border transition-all ${
                        isChecked
                          ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-500 shadow-sm ring-1 ring-blue-500/50'
                          : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Custom Checkbox */}
                        <div className="pt-0.5">
                          <input
                            type="checkbox"
                            id={`user-chk-${user.UserId}`}
                            checked={isChecked}
                            onChange={() => toggleUserSelection(user.UserId)}
                            className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 dark:bg-slate-700 dark:border-slate-600 cursor-pointer"
                          />
                        </div>

                        {/* User Details */}
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleUserSelection(user.UserId)}>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                              {user.FullName || 'Unnamed User'}
                            </span>
                            {user.IsSuperAdmin && (
                              <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-[10px] font-bold rounded">
                                SA
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {user.Email || user.UserId}
                          </p>
                          {user.Mobile && (
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                              📞 {user.Mobile}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Role Selector (visible always, active styling when checked) */}
                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          Tenant Role:
                        </span>
                        <select
                          value={assignment.role || 'Staff'}
                          disabled={!isChecked}
                          onChange={(e) => handleRoleChange(user.UserId, e.target.value)}
                          className={`text-xs font-semibold py-1 px-2 rounded-lg border transition-all ${
                            isChecked
                              ? 'bg-white dark:bg-slate-900 border-blue-400 dark:border-blue-600 text-slate-800 dark:text-white cursor-pointer shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed'
                          }`}
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
          <div className="p-4 md:p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span>
                Saving updates the <code className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-800 dark:text-slate-200 font-mono">Tenant_User_Mapping</code> sheet in real-time.
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSaveMappings}
                disabled={saving || !selectedTenantId}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Mappings...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>SAVE Tenant-User Mappings ({selectedCountForTenant})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ACTIVE MAPPINGS DIRECTORY (MASTER TABLE) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-600 text-white rounded-lg shadow-sm">
                  <Briefcase className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                  Active Tenant-User Mappings Directory
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Full live record of all tenant-user associations stored in Google Sheets.
              </p>
            </div>

            {/* Table Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Tenant Filter */}
              <select
                value={tableTenantFilter}
                onChange={(e) => setTableTenantFilter(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                value={tableRoleFilter}
                onChange={(e) => setTableRoleFilter(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                {ROLE_OPTIONS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>

              {/* Table Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter directory..."
                  value={tableSearchQuery}
                  onChange={(e) => setTableSearchQuery(e.target.value)}
                  className="pl-8 pr-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-44"
                />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Mapping ID</th>
                  <th className="py-3 px-4">Tenant Organization</th>
                  <th className="py-3 px-4">Assigned User</th>
                  <th className="py-3 px-4">Tenant Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created / Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
                {filteredTableMappings.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      No tenant user mappings found matching the filters.
                    </td>
                  </tr>
                ) : (
                  filteredTableMappings.map((mapping) => {
                    const roleBadge = ROLE_OPTIONS.find(r => r.value.toLowerCase() === (mapping.Role || '').toLowerCase()) || ROLE_OPTIONS[2];

                    return (
                      <tr 
                        key={mapping.MappingId || `${mapping.TenantId}-${mapping.UserId}`}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-750/50 transition-colors"
                      >
                        {/* Mapping ID */}
                        <td className="py-3 px-4 font-mono font-medium text-slate-600 dark:text-slate-300">
                          {mapping.MappingId || '-'}
                        </td>

                        {/* Tenant */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {mapping.TenantName || mapping.TenantId}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {mapping.TenantId}
                          </div>
                        </td>

                        {/* User */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {mapping.UserName || mapping.UserId}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {mapping.UserEmail || mapping.UserId}
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${roleBadge.color}`}>
                            {mapping.Role || 'Staff'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            String(mapping.Status || 'Active').toLowerCase() === 'active'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
                          }`}>
                            {mapping.Status || 'Active'}
                          </span>
                        </td>

                        {/* Created / Updated */}
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                          {mapping.Updated_At ? (
                            new Date(mapping.Updated_At).toLocaleDateString()
                          ) : mapping.Created_At ? (
                            new Date(mapping.Created_At).toLocaleDateString()
                          ) : (
                            '-'
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteMapping(mapping)}
                            title="Remove mapping"
                            className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
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
