import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  PlusCircle, 
  Search, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  RotateCcw, 
  Key, 
  FileText, 
  DollarSign, 
  ArrowUpRight, 
  Users, 
  Database, 
  Folder, 
  X,
  Sparkles,
  Lock,
  Mail,
  Phone,
  MapPin,
  Check,
  ArrowRight,
  HelpCircle,
  Info,
  Shield
} from 'lucide-react';
import { crmApi, subscribeCrmEvents } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Modal from '../components/Modal';
import SubscriptionPlans from './SubscriptionPlans';

const cleanSpreadsheetId = (val) => {
  if (!val) return '';
  const trimmed = String(val).trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : trimmed;
};

const cleanDriveFolderId = (val) => {
  if (!val) return '';
  const trimmed = String(val).trim();
  const match = trimmed.match(/\/folders\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : trimmed;
};

const LICENSE_PRESETS = [
  {
    tier: 'Starter',
    duration: 3,
    amount: 25000,
    tag: 'Quick Launch',
    desc: 'Up to 3 Staff • 1k Investors • Core CRM',
    color: '#0284c7',
    badgeBg: '#e0f2fe'
  },
  {
    tier: 'Professional',
    duration: 12,
    amount: 60000,
    tag: 'Most Popular',
    desc: 'Up to 15 Staff • 10k Investors • SIP Tracker • Reports',
    color: '#2563eb',
    badgeBg: '#dbeafe',
    popular: true
  },
  {
    tier: 'Enterprise',
    duration: 24,
    amount: 120000,
    tag: 'Enterprise Scale',
    desc: 'Unlimited Staff & Investors • Custom Drive Vault • Priority SLA',
    color: '#7c3aed',
    badgeBg: '#ede9fe'
  }
];

export default function SuperAdminPortal({ onOpenBackup }) {
  const { user, isSuperAdmin } = useAuth();

  // State
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleted, setShowDeleted] = useState(false);

  // Tenant Modal (Add / Edit)
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [tenantFormData, setTenantFormData] = useState({
    TenantId: '',
    CompanyName: '',
    ArnNumber: '',
    SpreadsheetId: '',
    DriveRootFolderId: '',
    SupportEmail: '',
    ContactPhone: '',
    OfficeAddress: '',
    Status: 'Active',
    initialLicenseType: 'Professional',
    initialLicenseDurationMonths: 12,
    initialLicenseAmount: 60000
  });

  // Licensing Modal (History & Renewal)
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [selectedTenantForLicense, setSelectedTenantForLicense] = useState(null);
  const [licenseHistory, setLicenseHistory] = useState([]);
  const [licenseLoading, setLicenseLoading] = useState(false);
  const [newLicenseForm, setNewLicenseForm] = useState({
    licenseType: 'Professional',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    amount: 60000,
    status: 'Active',
    notes: 'Standard 1-Year Subscription Renewal'
  });

  const [saving, setSaving] = useState(false);
  const [adminSubTab, setAdminSubTab] = useState('tenants'); // 'tenants' | 'plans'
  const [availablePlans, setAvailablePlans] = useState(LICENSE_PRESETS);

  const loadPlans = async () => {
    try {
      const data = await crmApi.getSubscriptionPlans(false);
      if (Array.isArray(data) && data.length > 0) {
        setAvailablePlans(data.map(p => ({
          tier: p.PlanName,
          duration: Number(p.DurationMonths) || 12,
          amount: Number(p.Price) || 0,
          desc: p.Description || p.Features || 'Core CRM capabilities',
          color: p.Color || (p.IsPopular ? '#2563eb' : (p.Price > 60000 ? '#7c3aed' : '#0284c7')),
          popular: Boolean(p.IsPopular),
          badge: p.Badge || (p.IsPopular ? 'Popular' : '')
        })));
      }
    } catch (e) {
      console.warn('Failed to load dynamic plans, using presets:', e);
    }
  };

  useEffect(() => {
    loadTenants();
    loadPlans();
    const unsubscribe = subscribeCrmEvents((ev) => {
      if (ev.module === 'Tenants' || ev.module === 'Licenses') {
        loadTenants();
      }
      if (ev.module === 'SubscriptionPlans') {
        loadPlans();
      }
    });
    return () => unsubscribe();
  }, [showDeleted]);

  const loadTenants = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await crmApi.call('getTenants', { showDeleted });
      setTenants(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load client organizations');
    } finally {
      setLoading(false);
    }
  };

  // Guard: Viewable only by CRM Founder / Owner (`isSuperAdmin`)
  if (!isSuperAdmin) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header 
          title="SuperAdmin Portal Restricted" 
          subtitle="Access Control Surveillance"
          onOpenBackup={onOpenBackup}
        />
        <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div className="crm-card" style={{ maxWidth: '480px', textAlign: 'center', padding: '2.5rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#ef4444',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <Lock size={32} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.5rem 0' }}>
              Restricted Founder / SuperAdmin Portal
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              This central client management & licensing portal is strictly reserved for the CRM platform founder/owner (<code>IsSuperAdmin = true</code> in User Master).
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Stats Calculations
  const totalTenants = tenants.filter(t => !t.IsDeleted).length;
  const activeTenants = tenants.filter(t => !t.IsDeleted && t.Status === 'Active').length;
  
  // Calculate licenses expiring within 30 days
  const nowMs = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const expiringSoonCount = tenants.filter(t => {
    if (t.IsDeleted || !t.activeLicense || !t.activeLicense.endDate) return false;
    const endMs = new Date(t.activeLicense.endDate).getTime();
    return endMs > nowMs && endMs <= (nowMs + thirtyDaysMs);
  }).length;

  const totalLicenseValue = tenants
    .filter(t => !t.IsDeleted && t.activeLicense)
    .reduce((sum, t) => sum + (Number(t.activeLicense.amount) || 0), 0);

  // Tenant Handlers
  const openAddTenantModal = () => {
    setEditingTenant(null);
    setTenantFormData({
      TenantId: '',
      CompanyName: '',
      ArnNumber: '',
      SpreadsheetId: '',
      DriveRootFolderId: '',
      SupportEmail: '',
      ContactPhone: '',
      OfficeAddress: '',
      Status: 'Active',
      initialLicenseType: 'Professional',
      initialLicenseDurationMonths: 12,
      initialLicenseAmount: 60000
    });
    setIsTenantModalOpen(true);
  };

  const openEditTenantModal = (t) => {
    setEditingTenant(t);
    setTenantFormData({
      TenantId: t.TenantId || '',
      CompanyName: t.CompanyName || '',
      ArnNumber: t.ArnNumber || '',
      SpreadsheetId: t.SpreadsheetId || '',
      DriveRootFolderId: t.DriveRootFolderId || '',
      SupportEmail: t.SupportEmail || '',
      ContactPhone: t.ContactPhone || '',
      OfficeAddress: t.OfficeAddress || '',
      Status: t.Status || 'Active'
    });
    setIsTenantModalOpen(true);
  };

  const handleSaveTenant = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...tenantFormData,
        initialLicense: !editingTenant ? {
          licenseType: tenantFormData.initialLicenseType,
          startDate: new Date().toISOString().slice(0, 10),
          endDate: new Date(Date.now() + tenantFormData.initialLicenseDurationMonths * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          amount: tenantFormData.initialLicenseAmount
        } : null
      };

      await crmApi.call('saveTenant', payload);
      setIsTenantModalOpen(false);
      loadTenants();
    } catch (err) {
      alert(err.message || 'Failed to save tenant');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTenant = async (t) => {
    const confirmMsg = `Are you sure you want to soft delete client organization "${t.CompanyName}" (${t.TenantId})?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await crmApi.call('deleteTenant', { tenantId: t.TenantId });
      loadTenants();
    } catch (err) {
      alert(err.message || 'Failed to delete client');
    }
  };

  // Licensing Drawer / Modal Handlers
  const openLicenseModal = async (t) => {
    setSelectedTenantForLicense(t);
    setIsLicenseModalOpen(true);
    setLicenseLoading(true);
    try {
      const history = await crmApi.call('getTenantLicenses', { tenantId: t.TenantId });
      setLicenseHistory(Array.isArray(history) ? history : []);
      // Pre-fill renewal form
      const startDate = new Date().toISOString().slice(0, 10);
      const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      setNewLicenseForm({
        licenseType: t.activeLicense?.licenseType || 'Professional',
        startDate,
        endDate,
        amount: t.activeLicense?.amount || 60000,
        status: 'Active',
        notes: `Subscription Renewal for ${t.CompanyName}`
      });
    } catch (err) {
      console.warn('Failed to load license history:', err);
    } finally {
      setLicenseLoading(false);
    }
  };

  const handleRenewLicense = async (e) => {
    e.preventDefault();
    if (!selectedTenantForLicense) return;
    setSaving(true);
    try {
      await crmApi.call('saveTenantLicense', {
        tenantId: selectedTenantForLicense.TenantId,
        ...newLicenseForm
      });
      // Reload license history & tenants
      const history = await crmApi.call('getTenantLicenses', { tenantId: selectedTenantForLicense.TenantId });
      setLicenseHistory(Array.isArray(history) ? history : []);
      loadTenants();
      alert(`License renewal applied successfully for ${selectedTenantForLicense.CompanyName}!`);
    } catch (err) {
      alert(err.message || 'Failed to renew license');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleLicenseStatus = async (lic, newStatus) => {
    if (!selectedTenantForLicense) return;
    try {
      await crmApi.call('saveTenantLicense', {
        id: lic.Id,
        tenantId: selectedTenantForLicense.TenantId,
        Status: newStatus,
        LicenseType: lic.LicenseType,
        StartDate: lic.StartDate,
        EndDate: lic.EndDate,
        Amount: lic.Amount,
        Notes: lic.Notes
      });
      const history = await crmApi.call('getTenantLicenses', { tenantId: selectedTenantForLicense.TenantId });
      setLicenseHistory(Array.isArray(history) ? history : []);
      loadTenants();
    } catch (err) {
      alert(err.message || 'Failed to update license status');
    }
  };

  // Filtered tenants list
  const filteredTenants = tenants
    .filter(t => {
      if (statusFilter === 'all') return true;
      return t.Status === statusFilter;
    })
    .filter(t => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        (t.CompanyName && t.CompanyName.toLowerCase().includes(q)) ||
        (t.TenantId && t.TenantId.toLowerCase().includes(q)) ||
        (t.ArnNumber && t.ArnNumber.toLowerCase().includes(q)) ||
        (t.SupportEmail && t.SupportEmail.toLowerCase().includes(q))
      );
    });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header 
        title="Tenant Master (SaaS Client Organizations & Licensing)" 
        subtitle="Centralized Tenant Management — Onboard Clients, Isolate Drive/Sheets & Manage Licenses"
        onRefresh={loadTenants}
        refreshing={loading}
        onOpenBackup={onOpenBackup}
      />

      <div className="page-wrapper">
        {/* Top Sub-Tab Navigation: Organizations vs Subscription Plans */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '1.5rem',
          paddingBottom: '0.25rem'
        }}>
          <button
            type="button"
            onClick={() => setAdminSubTab('tenants')}
            style={{
              padding: '0.65rem 1.25rem',
              fontWeight: '700',
              fontSize: '0.875rem',
              border: 'none',
              background: 'transparent',
              color: adminSubTab === 'tenants' ? '#2563eb' : '#64748b',
              borderBottom: adminSubTab === 'tenants' ? '2px solid #2563eb' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Building2 size={16} />
            <span>Client Organizations (Tenants)</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminSubTab('plans')}
            style={{
              padding: '0.65rem 1.25rem',
              fontWeight: '700',
              fontSize: '0.875rem',
              border: 'none',
              background: 'transparent',
              color: adminSubTab === 'plans' ? '#2563eb' : '#64748b',
              borderBottom: adminSubTab === 'plans' ? '2px solid #2563eb' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease'
            }}
          >
            <CreditCard size={16} />
            <span>Subscription Plans Master</span>
            <span style={{
              fontSize: '0.65rem',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              border: '1px solid #bfdbfe',
              padding: '1px 6px',
              borderRadius: '9999px',
              fontWeight: '800'
            }}>
              CRUD
            </span>
          </button>
        </div>

        {adminSubTab === 'plans' ? (
          <SubscriptionPlans onOpenBackup={onOpenBackup} />
        ) : (
          <>
            {/* Top 4 KPI Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
          {/* Card 1: Total Tenants */}
          <div className="crm-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Client Organizations</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                <Building2 size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a', marginTop: '0.5rem' }}>
              {totalTenants}
            </div>
            <div style={{ fontSize: '0.725rem', color: '#16a34a', marginTop: '0.25rem', fontWeight: '600' }}>
              {activeTenants} active clients onboarded
            </div>
          </div>

          {/* Card 2: Active Subscriptions */}
          <div className="crm-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Active Licenses</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                <CreditCard size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a', marginTop: '0.5rem' }}>
              {activeTenants}
            </div>
            <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '0.25rem' }}>
              Multi-tenant isolated data
            </div>
          </div>

          {/* Card 3: Expiring Soon */}
          <div className="crm-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Expiring &lt; 30 Days</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                <AlertTriangle size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: expiringSoonCount > 0 ? '#d97706' : '#0f172a', marginTop: '0.5rem' }}>
              {expiringSoonCount}
            </div>
            <div style={{ fontSize: '0.725rem', color: expiringSoonCount > 0 ? '#b45309' : '#64748b', marginTop: '0.25rem', fontWeight: expiringSoonCount > 0 ? '700' : '500' }}>
              {expiringSoonCount > 0 ? 'Requires subscription renewal' : 'All subscriptions healthy'}
            </div>
          </div>

          {/* Card 4: Platform ARR */}
          <div className="crm-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Total Contract Value</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                <DollarSign size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#2563eb', marginTop: '0.5rem' }}>
              ₹{(totalLicenseValue / 100000).toFixed(2)} L
            </div>
            <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '0.25rem' }}>
              Annual platform recurring revenue
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="crm-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            {/* Search Box */}
            <div style={{ position: 'relative', flex: 1, minWidth: '260px', maxWidth: '380px' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search by company name, ARN, tenant ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>

            {/* Filter Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Suspended">Suspended</option>
                <option value="Trial">Trial Subscriptions</option>
              </select>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#475569', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showDeleted}
                  onChange={(e) => setShowDeleted(e.target.checked)}
                />
                <span>Show Soft Deleted</span>
              </label>

              <button
                className="btn btn-primary"
                onClick={openAddTenantModal}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <PlusCircle size={16} />
                <span>Onboard New Client</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#b91c1c', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {/* Client Organizations Table */}
        <div className="crm-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Registered SaaS Tenants & Resources
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Showing {filteredTenants.length} of {tenants.length} organizations
            </span>
          </div>

          <div className="table-responsive">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Organization / Tenant</th>
                  <th>AMFI ARN</th>
                  <th>Isolated Google Resources</th>
                  <th>Subscription Package</th>
                  <th>License Status & Expiry</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                      Loading client organizations & subscriptions...
                    </td>
                  </tr>
                ) : filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                      No client organizations match your filters. Click "Onboard New Client" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map((t) => {
                    const activeLic = t.activeLicense;
                    const isExpiringSoon = activeLic?.endDate && (new Date(activeLic.endDate).getTime() - nowMs < thirtyDaysMs);

                    return (
                      <tr key={t.TenantId} style={{ opacity: t.IsDeleted ? 0.6 : 1 }}>
                        {/* Company & ID */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '8px',
                              backgroundColor: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#2563eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '800',
                              fontSize: '1rem',
                              flexShrink: 0
                            }}>
                              {t.CompanyName ? t.CompanyName.charAt(0).toUpperCase() : 'T'}
                            </div>
                            <div>
                              <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>
                                {t.CompanyName}
                              </div>
                              <div style={{ fontSize: '0.725rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '2px' }}>
                                <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#2563eb' }}>{t.TenantId}</span>
                                {t.SupportEmail && <span>· {t.SupportEmail}</span>}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* ARN Number */}
                        <td>
                          <span style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.825rem' }}>
                            {t.ArnNumber || '—'}
                          </span>
                        </td>

                        {/* Dedicated Sheet & Drive Status */}
                        <td>
                          <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Database size={12} color="#2563eb" />
                              <span style={{ color: t.SpreadsheetId ? '#16a34a' : '#d97706', fontWeight: '500' }}>
                                {t.SpreadsheetId ? 'Dedicated Sheet Linked' : 'Default DB'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Folder size={12} color="#2563eb" />
                              <span style={{ color: t.DriveRootFolderId ? '#16a34a' : '#d97706', fontWeight: '500' }}>
                                {t.DriveRootFolderId ? 'Dedicated Drive Linked' : 'Root Drive'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Subscription Package */}
                        <td>
                          <span className="badge" style={{
                            backgroundColor: activeLic?.licenseType === 'Enterprise' ? '#eff6ff' : '#f0fdf4',
                            color: activeLic?.licenseType === 'Enterprise' ? '#1d4ed8' : '#15803d',
                            border: `1px solid ${activeLic?.licenseType === 'Enterprise' ? '#bfdbfe' : '#bbf7d0'}`,
                            fontWeight: '700'
                          }}>
                            {activeLic?.licenseType || 'Standard'}
                          </span>
                        </td>

                        {/* License Status & Expiry */}
                        <td>
                          {activeLic ? (
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <span className={`badge ${activeLic.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                                  {activeLic.status}
                                </span>
                                {isExpiringSoon && (
                                  <span style={{ fontSize: '0.675rem', color: '#d97706', fontWeight: '700' }}>
                                    Expiring Soon!
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '3px' }}>
                                Until: {activeLic.endDate ? new Date(activeLic.endDate).toLocaleDateString() : 'Perpetual'}
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No Active License</span>
                          )}
                        </td>

                        {/* Tenant Status */}
                        <td>
                          <span className={`badge ${t.Status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                            {t.Status || 'Active'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                            {/* Manage Licenses Button */}
                            <button
                              className="btn btn-outline-blue btn-sm"
                              onClick={() => openLicenseModal(t)}
                              title="View License History & Issue Renewals"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.725rem', padding: '0.35rem 0.65rem' }}
                            >
                              <CreditCard size={13} />
                              <span>Licensing</span>
                            </button>

                            {/* Edit Tenant */}
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => openEditTenantModal(t)}
                              title="Edit Client Organization Details"
                              style={{ padding: '0.35rem 0.5rem' }}
                            >
                              <Edit3 size={14} />
                            </button>

                            {/* Soft Delete */}
                            {!t.IsDeleted && (
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleDeleteTenant(t)}
                                title="Soft Delete Client Organization"
                                style={{ padding: '0.35rem 0.5rem', color: '#ef4444' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        </>
        )}
      </div>

      {/* ============================================================== */}
      {/* 1. ONBOARD / EDIT TENANT CLIENT MODAL (REDESIGNED SAAS UI)       */}
      {/* ============================================================== */}
      {isTenantModalOpen && (
        <Modal
          isOpen={isTenantModalOpen}
          onClose={() => setIsTenantModalOpen(false)}
          headerContent={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.28)',
                flexShrink: 0
              }}>
                <Building2 size={22} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>
                    {editingTenant ? `Edit Organization: ${editingTenant.CompanyName}` : 'Onboard New Client Organization'}
                  </h3>
                  <span style={{
                    fontSize: '0.675rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    letterSpacing: '0.04em'
                  }}>
                    SaaS Multi-Tenant
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0', lineHeight: 1.3 }}>
                  Configure dedicated Google Cloud Sheets, Drive folder storage isolation & subscription licensing.
                </p>
              </div>
            </div>
          }
          maxWidth="820px"
        >
          <form onSubmit={handleSaveTenant} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <div className="modal-body" style={{ overflowY: 'auto', flex: 1, padding: '1.5rem', maxHeight: 'calc(90vh - 140px)' }}>
              {/* SECTION 1: ORGANIZATION IDENTITY & PROFILE */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  fontSize: '0.825rem',
                  fontWeight: '700',
                  color: '#1e40af',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '0.85rem'
                }}>
                  <Building2 size={15} color="#2563eb" />
                  <span>1. Organization Profile & Credentials</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: '600' }}>
                      Organization Legal Trade Name *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. ABC Investments & Wealth Management"
                      value={tenantFormData.CompanyName}
                      onChange={(e) => setTenantFormData({ ...tenantFormData, CompanyName: e.target.value })}
                      required
                      autoFocus
                      style={{ fontWeight: '600', fontSize: '0.9rem' }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label className="form-label" style={{ margin: 0, fontWeight: '600' }}>Tenant Code (ID)</label>
                      {!editingTenant && (
                        <button
                          type="button"
                          onClick={() => {
                            const count = tenants.length + 1;
                            setTenantFormData(prev => ({ ...prev, TenantId: 'TEN' + String(count).padStart(3, '0') }));
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#2563eb',
                            fontSize: '0.725rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          ⚡ Auto-Generate
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. TEN004"
                      value={tenantFormData.TenantId}
                      onChange={(e) => setTenantFormData({ ...tenantFormData, TenantId: e.target.value.toUpperCase().trim() })}
                      disabled={Boolean(editingTenant)}
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: '700',
                        letterSpacing: '0.05em',
                        backgroundColor: editingTenant ? '#f8fafc' : '#ffffff'
                      }}
                    />
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>
                      Workspace URI: <code>/org/{tenantFormData.TenantId || 'TEN00X'}</code>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">AMFI Registration Number (ARN)</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. ARN-189241"
                        value={tenantFormData.ArnNumber}
                        onChange={(e) => setTenantFormData({ ...tenantFormData, ArnNumber: e.target.value.toUpperCase() })}
                        style={{ paddingLeft: '2.4rem', fontFamily: 'monospace' }}
                      />
                      <Shield size={15} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Account Operating Status</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {[
                        { val: 'Active', label: 'Active', color: '#16a34a', bg: '#dcfce7', border: '#86efac' },
                        { val: 'Trial', label: 'Trial Period', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
                        { val: 'Suspended', label: 'Suspended', color: '#e11d48', bg: '#ffe4e6', border: '#fecdd3' }
                      ].map(st => {
                        const isSelected = tenantFormData.Status === st.val;
                        return (
                          <button
                            key={st.val}
                            type="button"
                            onClick={() => setTenantFormData({ ...tenantFormData, Status: st.val })}
                            style={{
                              flex: 1,
                              padding: '0.55rem 0.5rem',
                              borderRadius: '8px',
                              fontSize: '0.78rem',
                              fontWeight: isSelected ? '700' : '500',
                              border: `1.5px solid ${isSelected ? st.color : '#e2e8f0'}`,
                              backgroundColor: isSelected ? st.bg : '#ffffff',
                              color: isSelected ? st.color : '#64748b',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.35rem',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {isSelected && <Check size={13} color={st.color} />}
                            <span>{st.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Support Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="support@abcinvestments.com"
                        value={tenantFormData.SupportEmail}
                        onChange={(e) => setTenantFormData({ ...tenantFormData, SupportEmail: e.target.value })}
                        style={{ paddingLeft: '2.4rem' }}
                      />
                      <Mail size={15} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Contact Phone / Mobile</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="+91 98220 12345"
                        value={tenantFormData.ContactPhone}
                        onChange={(e) => setTenantFormData({ ...tenantFormData, ContactPhone: e.target.value })}
                        style={{ paddingLeft: '2.4rem' }}
                      />
                      <Phone size={15} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Registered Office Address (Optional)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 504, Nariman Point, Mumbai - 400021"
                      value={tenantFormData.OfficeAddress}
                      onChange={(e) => setTenantFormData({ ...tenantFormData, OfficeAddress: e.target.value })}
                      style={{ paddingLeft: '2.4rem' }}
                    />
                    <MapPin size={15} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>
              </div>

              {/* SECTION 2: DEDICATED GOOGLE CLOUD RESOURCES (100% DATA ISOLATION) */}
              <div style={{
                background: 'linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)',
                border: '1.5px solid #bfdbfe',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '1.5rem',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{
                    fontSize: '0.85rem',
                    fontWeight: '800',
                    color: '#1d4ed8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Database size={17} color="#2563eb" />
                    <span>2. Dedicated Google Cloud Resources</span>
                  </div>
                  <span style={{
                    fontSize: '0.675rem',
                    fontWeight: '700',
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}>
                    100% Data Isolation
                  </span>
                </div>

                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 1rem', lineHeight: 1.45 }}>
                  Each organization owns its isolated database & Drive folder. You can paste the <strong>raw ID</strong> or the <strong>full URL</strong> from Google Sheets/Drive — the system automatically strips the URL and extracts clean IDs.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {/* Spreadsheet ID Field */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label className="form-label" style={{ margin: 0, fontSize: '0.78rem', fontWeight: '700', color: '#0f172a' }}>
                        Dedicated Spreadsheet ID
                      </label>
                      {tenantFormData.SpreadsheetId && (
                        <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <Check size={11} /> ID Extracted
                        </span>
                      )}
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Paste Sheet URL or ID (from _CRM_DATABASE_TEMPLATE)"
                        value={tenantFormData.SpreadsheetId}
                        onChange={(e) => setTenantFormData({ ...tenantFormData, SpreadsheetId: cleanSpreadsheetId(e.target.value) })}
                        style={{
                          fontSize: '0.8rem',
                          fontFamily: 'monospace',
                          paddingLeft: '2.4rem',
                          borderColor: tenantFormData.SpreadsheetId ? '#93c5fd' : '#cbd5e1'
                        }}
                      />
                      <FileText size={15} color="#16a34a" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.3rem' }}>
                      Duplicate from: <code>_CRM_DATABASE_TEMPLATE</code>
                    </div>
                  </div>

                  {/* Drive Folder ID Field */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label className="form-label" style={{ margin: 0, fontSize: '0.78rem', fontWeight: '700', color: '#0f172a' }}>
                        Dedicated Drive Folder ID
                      </label>
                      {tenantFormData.DriveRootFolderId && (
                        <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <Check size={11} /> Folder ID Extracted
                        </span>
                      )}
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Paste Drive Folder URL or ID"
                        value={tenantFormData.DriveRootFolderId}
                        onChange={(e) => setTenantFormData({ ...tenantFormData, DriveRootFolderId: cleanDriveFolderId(e.target.value) })}
                        style={{
                          fontSize: '0.8rem',
                          fontFamily: 'monospace',
                          paddingLeft: '2.4rem',
                          borderColor: tenantFormData.DriveRootFolderId ? '#93c5fd' : '#cbd5e1'
                        }}
                      />
                      <Folder size={15} color="#d97706" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.3rem' }}>
                      Drive directory: <code>SRInvestmentsCRM/org/{tenantFormData.CompanyName || '<ClientName>'}</code>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: INITIAL SUBSCRIPTION LICENSE (NEW ONBOARDING ONLY) */}
              {!editingTenant && (
                <div style={{
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{
                      fontSize: '0.85rem',
                      fontWeight: '800',
                      color: '#0f172a',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem'
                    }}>
                      <CreditCard size={16} color="#2563eb" />
                      <span>3. Initial Subscription Plan</span>
                    </div>
                    <span style={{ fontSize: '0.725rem', color: '#64748b' }}>
                      Select plan preset or customize terms
                    </span>
                  </div>

                  {/* Interactive Plan Selector Cards from Subscription Plans Master */}
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(availablePlans.length, 3)}, 1fr)`, gap: '0.85rem', marginBottom: '1rem' }}>
                    {availablePlans.map((preset) => {
                      const isSelected = String(tenantFormData.initialLicenseType).toLowerCase() === String(preset.tier).toLowerCase();
                      return (
                        <div
                          key={preset.tier}
                          onClick={() => {
                            setTenantFormData({
                              ...tenantFormData,
                              initialLicenseType: preset.tier,
                              initialLicenseDurationMonths: preset.duration,
                              initialLicenseAmount: preset.amount
                            });
                          }}
                          style={{
                            border: `2px solid ${isSelected ? preset.color : '#e2e8f0'}`,
                            backgroundColor: isSelected ? '#f8fafc' : '#ffffff',
                            borderRadius: '10px',
                            padding: '0.85rem',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.12)' : 'none'
                          }}
                        >
                          {preset.popular && (
                            <span style={{
                              position: 'absolute',
                              top: '-9px',
                              right: '10px',
                              backgroundColor: preset.color || '#2563eb',
                              color: '#ffffff',
                              fontSize: '0.625rem',
                              fontWeight: '800',
                              padding: '1px 7px',
                              borderRadius: '9999px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em'
                            }}>
                              {preset.badge || 'Popular'}
                            </span>
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>
                              {preset.tier}
                            </span>
                            <div style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              border: `2px solid ${isSelected ? preset.color : '#cbd5e1'}`,
                              backgroundColor: isSelected ? preset.color : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {isSelected && <Check size={11} color="#ffffff" />}
                            </div>
                          </div>

                          <div style={{ fontSize: '1.2rem', fontWeight: '800', color: preset.color, margin: '2px 0' }}>
                            ₹{Number(preset.amount).toLocaleString('en-IN')}
                            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '500' }}> / {preset.duration}m</span>
                          </div>

                          <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '4px 0 0', lineHeight: 1.35 }}>
                            {preset.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Overrides row for custom duration and amount */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #f1f5f9'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '600', whiteSpace: 'nowrap' }}>
                        Custom Duration:
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        value={tenantFormData.initialLicenseDurationMonths}
                        onChange={(e) => setTenantFormData({ ...tenantFormData, initialLicenseDurationMonths: Number(e.target.value) })}
                        style={{ height: '32px', fontSize: '0.8rem', width: '90px' }}
                        min="1"
                      />
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Months</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '600', whiteSpace: 'nowrap' }}>
                        Subscription Fee:
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        value={tenantFormData.initialLicenseAmount}
                        onChange={(e) => setTenantFormData({ ...tenantFormData, initialLicenseAmount: Number(e.target.value) })}
                        style={{ height: '32px', fontSize: '0.8rem', width: '130px' }}
                      />
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>₹ INR</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="modal-footer" style={{
              flexShrink: 0,
              padding: '0.85rem 1.5rem',
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div style={{
                fontSize: '0.75rem',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#16a34a'
                }}></span>
                <span>
                  Summary: <strong>{tenantFormData.TenantId || 'Auto ID'}</strong> • {tenantFormData.CompanyName || 'New Organization'} • {tenantFormData.initialLicenseType} (₹{Number(tenantFormData.initialLicenseAmount || 0).toLocaleString('en-IN')})
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsTenantModalOpen(false)}
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving || !tenantFormData.CompanyName.trim()}
                  style={{
                    padding: '0.6rem 1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  {saving ? (
                    <>
                      <RefreshCw size={15} className="spin-animation" />
                      <span>Provisioning Tenant...</span>
                    </>
                  ) : (
                    <>
                      <span>{editingTenant ? 'Update Client Organization' : 'Complete Onboarding'}</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* ============================================================== */}
      {/* 2. TENANT LICENSING & RENEWALS MODAL                            */}
      {/* ============================================================== */}
      {isLicenseModalOpen && selectedTenantForLicense && (
        <Modal
          isOpen={isLicenseModalOpen}
          onClose={() => setIsLicenseModalOpen(false)}
          title={`Licensing & Subscription: ${selectedTenantForLicense.CompanyName} (${selectedTenantForLicense.TenantId})`}
          maxWidth="760px"
        >
          <div className="modal-body" style={{ overflowY: 'auto', flex: 1, padding: '1.25rem 1.5rem', maxHeight: 'calc(90vh - 140px)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Active Subscription Banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              backgroundColor: '#eff6ff',
              borderRadius: '8px',
              border: '1px solid #bfdbfe'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: '600', textTransform: 'uppercase' }}>
                  Current Active Subscription
                </span>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1e3a8a', marginTop: '2px' }}>
                  {selectedTenantForLicense.activeLicense?.licenseType || 'No Active License'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>
                  Expires:{' '}
                  {selectedTenantForLicense.activeLicense?.endDate
                    ? new Date(selectedTenantForLicense.activeLicense.endDate).toLocaleDateString()
                    : 'Not set'}
                </div>
              </div>

              <span className={`badge ${selectedTenantForLicense.activeLicense?.status === 'Active' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                {selectedTenantForLicense.activeLicense?.status || 'Inactive'}
              </span>
            </div>

            {/* License Renewal / Extension Form */}
            <form onSubmit={handleRenewLicense} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', backgroundColor: '#f8fafc' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sparkles size={16} color="#2563eb" /> Issue New License / Renew Subscription
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>License Type</label>
                  <select
                    className="form-select"
                    value={newLicenseForm.licenseType}
                    onChange={(e) => {
                      const selectedTier = e.target.value;
                      const matched = availablePlans.find(p => p.tier.toLowerCase() === selectedTier.toLowerCase());
                      setNewLicenseForm({
                        ...newLicenseForm,
                        licenseType: selectedTier,
                        amount: matched ? matched.amount : newLicenseForm.amount
                      });
                    }}
                    style={{ fontSize: '0.8rem' }}
                  >
                    {availablePlans.map(p => (
                      <option key={p.tier} value={p.tier}>{p.tier} (₹{Number(p.amount).toLocaleString('en-IN')})</option>
                    ))}
                    <option value="Custom">Custom Enterprise</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Start Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newLicenseForm.startDate}
                    onChange={(e) => setNewLicenseForm({ ...newLicenseForm, startDate: e.target.value })}
                    style={{ fontSize: '0.8rem' }}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>End / Expiry Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newLicenseForm.endDate}
                    onChange={(e) => setNewLicenseForm({ ...newLicenseForm, endDate: e.target.value })}
                    style={{ fontSize: '0.8rem' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Amount (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newLicenseForm.amount}
                    onChange={(e) => setNewLicenseForm({ ...newLicenseForm, amount: Number(e.target.value) })}
                    style={{ fontSize: '0.8rem' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Notes / Renewal Terms</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 1-Year AMC contract renewed"
                    value={newLicenseForm.notes}
                    onChange={(e) => setNewLicenseForm({ ...newLicenseForm, notes: e.target.value })}
                    style={{ fontSize: '0.8rem' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={saving}
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                {saving ? 'Processing License...' : 'Apply & Activate License'}
              </button>
            </form>

            {/* Historical Licenses Trail */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                Historical Subscription Trail
              </h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <table className="crm-table" style={{ fontSize: '0.75rem' }}>
                  <thead>
                    <tr>
                      <th>License ID</th>
                      <th>Type</th>
                      <th>Period</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {licenseLoading ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: '1rem' }}>Loading trail...</td></tr>
                    ) : licenseHistory.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: '1rem', color: '#64748b' }}>No license records found.</td></tr>
                    ) : (
                      licenseHistory.map((lic) => (
                        <tr key={lic.Id}>
                          <td style={{ fontFamily: 'monospace' }}>{lic.Id}</td>
                          <td style={{ fontWeight: '600' }}>{lic.LicenseType}</td>
                          <td>
                            {lic.StartDate ? new Date(lic.StartDate).toLocaleDateString() : '—'} to{' '}
                            {lic.EndDate ? new Date(lic.EndDate).toLocaleDateString() : '—'}
                          </td>
                          <td>₹{Number(lic.Amount || 0).toLocaleString()}</td>
                          <td>
                            <span className={`badge ${lic.Status === 'Active' ? 'badge-success' : (lic.Status === 'Renewed' ? 'badge-info' : 'badge-danger')}`}>
                              {lic.Status}
                            </span>
                          </td>
                          <td>
                            {lic.Status === 'Active' ? (
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleToggleLicenseStatus(lic, 'Cancelled')}
                                style={{ fontSize: '0.65rem', padding: '2px 6px', color: '#ef4444' }}
                              >
                                Cancel
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleToggleLicenseStatus(lic, 'Active')}
                                style={{ fontSize: '0.65rem', padding: '2px 6px', color: '#16a34a' }}
                              >
                                Re-activate
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'flex-end', flexShrink: 0, borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsLicenseModalOpen(false)}>
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
