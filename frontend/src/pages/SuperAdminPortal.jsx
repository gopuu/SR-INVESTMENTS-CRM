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
  Shield,
  Save,
  Zap
} from 'lucide-react';
import { crmApi, subscribeCrmEvents } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { showSuccess, showError, showWarning, showConfirm } from '../utils/swal';

// Helper to calculate the next unique auto-generated TenantId
const getNextTenantId = (tenantsList) => {
  let maxNum = 0;
  (tenantsList || []).forEach(t => {
    const m = String(t.TenantId || '').match(/^TEN(\d+)$/i);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > maxNum) maxNum = n;
    }
  });
  let next = maxNum + 1;
  let candidate = 'TEN' + String(next).padStart(3, '0');
  const existing = new Set((tenantsList || []).map(t => String(t.TenantId || '').toUpperCase()));
  while (existing.has(candidate)) {
    next++;
    candidate = 'TEN' + String(next).padStart(3, '0');
  }
  return candidate;
};

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
    initialLicenseAmount: 60000,
    initialPaymentMode: 'UPI',
    initialTxnDate: new Date().toISOString().slice(0, 10),
    initialPaymentAccount: 'Cash in Hand',
    initialReferenceNo: ''
  });

  // Central DB Payment Receiving Accounts
  const [paymentAccounts, setPaymentAccounts] = useState([
    { AccountId: 'ACC001', AccountName: 'Cash in Hand', AccountType: 'Cash' },
    { AccountId: 'ACC002', AccountName: 'Bank1 (Primary Current)', AccountType: 'Bank' },
    { AccountId: 'ACC003', AccountName: 'Bank2 (Operating)', AccountType: 'Bank' }
  ]);

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
    paymentMode: 'UPI',
    txnDate: new Date().toISOString().slice(0, 10),
    paymentAccount: 'Cash in Hand',
    referenceNo: '',
    status: 'Active',
    notes: 'Standard 1-Year Subscription Renewal'
  });

  const [saving, setSaving] = useState(false);
  const [availablePlans, setAvailablePlans] = useState(LICENSE_PRESETS);

  const loadPaymentAccounts = async () => {
    try {
      const data = await crmApi.call('getPaymentAccounts');
      if (Array.isArray(data) && data.length > 0) {
        setPaymentAccounts(data);
      }
    } catch (e) {
      console.warn('Failed to load payment accounts:', e);
    }
  };

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
    loadPaymentAccounts();
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
    const nextId = getNextTenantId(tenants);
    setTenantFormData({
      TenantId: nextId,
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
      initialLicenseAmount: 60000,
      initialPaymentMode: 'UPI',
      initialTxnDate: new Date().toISOString().slice(0, 10),
      initialPaymentAccount: paymentAccounts[0]?.AccountName || 'Cash in Hand',
      initialReferenceNo: ''
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
      Status: t.Status || 'Active',
      initialLicenseType: 'Professional',
      initialLicenseDurationMonths: 12,
      initialLicenseAmount: 60000,
      initialPaymentMode: 'UPI',
      initialTxnDate: new Date().toISOString().slice(0, 10),
      initialPaymentAccount: paymentAccounts[0]?.AccountName || 'Cash in Hand',
      initialReferenceNo: ''
    });
    setIsTenantModalOpen(true);
  };

  const handleSaveTenant = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...tenantFormData,
        isEdit: Boolean(editingTenant),
        initialLicense: !editingTenant ? {
          licenseType: tenantFormData.initialLicenseType,
          startDate: new Date().toISOString().slice(0, 10),
          endDate: new Date(Date.now() + tenantFormData.initialLicenseDurationMonths * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          amount: Number(tenantFormData.initialLicenseAmount) || 0,
          paymentMode: tenantFormData.initialPaymentMode,
          txnDate: tenantFormData.initialTxnDate,
          paymentAccount: tenantFormData.initialPaymentAccount,
          referenceNo: tenantFormData.initialReferenceNo
        } : null
      };

      await crmApi.call('saveTenant', payload);
      setIsTenantModalOpen(false);
      loadTenants();
      showSuccess(editingTenant ? `Organization "${tenantFormData.CompanyName}" updated successfully!` : `New Client Organization "${tenantFormData.CompanyName}" (${tenantFormData.TenantId}) onboarded successfully!`);
    } catch (err) {
      showError(err.message || 'Failed to save tenant');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTenant = async (t) => {
    const confirmed = await showConfirm(
      'Soft Delete Organization?',
      `Are you sure you want to deactivate and soft delete client organization "${t.CompanyName}" (${t.TenantId})? This will suspend workspace access.`
    );
    if (!confirmed) return;

    try {
      await crmApi.call('deleteTenant', { tenantId: t.TenantId });
      loadTenants();
      showSuccess(`Client organization "${t.CompanyName}" soft deleted.`);
    } catch (err) {
      showError(err.message || 'Failed to delete client');
    }
  };

  // Licensing Drawer / Modal Handlers
  const openLicenseModal = async (t) => {
    setSelectedTenantForLicense(t);
    setIsLicenseModalOpen(true);
    setLicenseLoading(true);
    try {
      const history = await crmApi.call('getTenantLicenses', { tenantId: t.TenantId });
      const histList = Array.isArray(history) ? history : [];
      setLicenseHistory(histList);

      const today = new Date().toISOString().slice(0, 10);
      
      // Determine if there is currently an unexpired active license
      const currentActive = histList.find(l => 
        (Boolean(l.IsActive) || String(l.Status).toLowerCase() === 'active') &&
        l.EndDate && l.EndDate >= today
      );

      let startDate = today;
      if (currentActive && currentActive.EndDate) {
        // Next license starts the day after current active expires
        const nextDay = new Date(new Date(currentActive.EndDate).getTime() + 24 * 60 * 60 * 1000);
        if (!isNaN(nextDay.getTime())) {
          startDate = nextDay.toISOString().slice(0, 10);
        }
      }
      
      const startD = new Date(startDate);
      const endD = new Date(startD.getTime() + 365 * 24 * 60 * 60 * 1000);
      const endDate = !isNaN(endD.getTime()) ? endD.toISOString().slice(0, 10) : '';

      setNewLicenseForm({
        licenseType: t.activeLicense?.licenseType || 'Professional',
        startDate,
        endDate,
        amount: Number(t.activeLicense?.amount) || 60000,
        paymentMode: 'UPI',
        txnDate: today,
        paymentAccount: paymentAccounts[0]?.AccountName || 'Cash in Hand',
        referenceNo: '',
        status: currentActive ? 'NEW' : (startDate <= today ? 'Active' : 'NEW'),
        notes: `Subscription License for ${t.CompanyName}`
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
      const today = new Date().toISOString().slice(0, 10);
      
      // Check if tenant currently has an active license that is not expired
      const currentActive = licenseHistory.find(l => 
        (Boolean(l.IsActive) || String(l.Status).toLowerCase() === 'active') &&
        l.EndDate && l.EndDate >= today
      );

      let targetStatus = 'NEW';
      if (currentActive) {
        // Rule 1, 2, 3: Current is not expired -> Add as NEW (queued)
        targetStatus = 'NEW';
      } else {
        // Rule 2, 4, 5: Current is expired or none.
        // If Start-Date <= Current Date, consider it ACTIVE
        // If Start-Date > Current Date (Start-Date <> Current), save as NEW with Activate button
        if (newLicenseForm.startDate <= today && (!newLicenseForm.endDate || newLicenseForm.endDate >= today)) {
          targetStatus = 'Active';
        } else {
          targetStatus = 'NEW';
        }
      }

      await crmApi.call('saveTenantLicense', {
        tenantId: selectedTenantForLicense.TenantId,
        Amount: Number(newLicenseForm.amount) || 0,
        amount: Number(newLicenseForm.amount) || 0,
        licenseType: newLicenseForm.licenseType,
        startDate: newLicenseForm.startDate,
        endDate: newLicenseForm.endDate,
        paymentMode: newLicenseForm.paymentMode,
        txnDate: newLicenseForm.txnDate,
        paymentAccount: newLicenseForm.paymentAccount,
        referenceNo: newLicenseForm.referenceNo,
        notes: newLicenseForm.notes,
        Status: targetStatus
      });

      // Reload license history & tenants
      const history = await crmApi.call('getTenantLicenses', { tenantId: selectedTenantForLicense.TenantId });
      setLicenseHistory(Array.isArray(history) ? history : []);
      
      const refreshedTenants = await crmApi.getTenants(false);
      setTenants(Array.isArray(refreshedTenants) ? refreshedTenants : []);
      const refreshed = (refreshedTenants || []).find(x => x.TenantId === selectedTenantForLicense.TenantId);
      if (refreshed) {
        setSelectedTenantForLicense(refreshed);
      }

      if (targetStatus === 'Active') {
        showSuccess(`Subscription license saved and ACTIVATED successfully for ${selectedTenantForLicense.CompanyName}!`);
      } else {
        showSuccess(`Subscription license saved as NEW for ${selectedTenantForLicense.CompanyName}! It will auto-activate on start date, or click 'Activate' in the table to activate immediately.`);
      }
    } catch (err) {
      showError(err.message || 'Failed to save license');
    } finally {
      setSaving(false);
    }
  };

  const handleActivateLicense = async (lic) => {
    if (!selectedTenantForLicense) return;
    const confirmed = await showConfirm(
      'Activate Subscription License?',
      `Are you sure you want to activate license "${lic.Id}" (${lic.LicenseType}) now? This will immediately make it ACTIVE and mark any previous active license as EXPIRED (Locked).`
    );
    if (!confirmed) return;

    try {
      await crmApi.activateTenantLicense(lic.Id, selectedTenantForLicense.TenantId);
      
      // Reload license history & tenants
      const history = await crmApi.call('getTenantLicenses', { tenantId: selectedTenantForLicense.TenantId });
      setLicenseHistory(Array.isArray(history) ? history : []);
      
      const refreshedTenants = await crmApi.getTenants(false);
      setTenants(Array.isArray(refreshedTenants) ? refreshedTenants : []);
      const refreshed = (refreshedTenants || []).find(x => x.TenantId === selectedTenantForLicense.TenantId);
      if (refreshed) {
        setSelectedTenantForLicense(refreshed);
      }
      showSuccess(`License "${lic.Id}" is now ACTIVE! Previous active license is marked as EXPIRED.`);
    } catch (err) {
      showError(err.message || 'Failed to activate license');
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
        Amount: Number(lic.Amount) || 0,
        PaymentMode: lic.PaymentMode,
        TxnDate: lic.TxnDate,
        PaymentAccount: lic.PaymentAccount,
        ReferenceNo: lic.ReferenceNo,
        Notes: lic.Notes
      });
      const history = await crmApi.call('getTenantLicenses', { tenantId: selectedTenantForLicense.TenantId });
      setLicenseHistory(Array.isArray(history) ? history : []);
      const refreshedTenants = await crmApi.getTenants(false);
      setTenants(Array.isArray(refreshedTenants) ? refreshedTenants : []);
      const refreshed = (refreshedTenants || []).find(x => x.TenantId === selectedTenantForLicense.TenantId);
      if (refreshed) {
        setSelectedTenantForLicense(refreshed);
      }
      showSuccess(`License marked as ${newStatus}.`);
    } catch (err) {
      showError(err.message || 'Failed to update license status');
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
        title="Tenant Master" 
        subtitle="Manage client organizations & licenses"
        onRefresh={loadTenants}
        refreshing={loading}
        onOpenBackup={onOpenBackup}
      />

      <div className="page-wrapper">
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
                      <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        🔒 Auto-Generated (Unique)
                      </span>
                    </div>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. TEN004"
                      value={tenantFormData.TenantId}
                      disabled={true}
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: '700',
                        letterSpacing: '0.05em',
                        backgroundColor: '#f1f5f9',
                        color: '#334155',
                        cursor: 'not-allowed',
                        border: '1px solid #cbd5e1'
                      }}
                    />
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>
                      Workspace URI: <code>/org/{tenantFormData.TenantId || 'TEN00X'}</code> (System managed)
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label className="form-label" style={{ margin: 0 }}>Contact Phone / Mobile</label>
                      <span style={{ fontSize: '0.675rem', color: '#64748b' }}>
                        {tenantFormData.ContactPhone ? `${tenantFormData.ContactPhone.length}/10` : '10 digits'}
                      </span>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="10-digit mobile (e.g. 9822012345)"
                        maxLength={10}
                        value={tenantFormData.ContactPhone}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setTenantFormData({ ...tenantFormData, ContactPhone: digits });
                        }}
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

                  {/* Payment Details Subsection */}
                  <div style={{
                    marginTop: '0.85rem',
                    padding: '0.9rem',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1.5px dashed #cbd5e1'
                  }}>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: '800',
                      color: '#0f172a',
                      marginBottom: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}>
                      <DollarSign size={15} color="#2563eb" />
                      <span>Payment Receipt & Billing Account</span>
                      <span style={{ fontSize: '0.675rem', color: '#64748b', fontWeight: '500' }}>
                        (Auto-synced with Central DB Accounts)
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: '600' }}>Payment Mode</label>
                        <select
                          className="form-select"
                          value={tenantFormData.initialPaymentMode}
                          onChange={(e) => setTenantFormData({ ...tenantFormData, initialPaymentMode: e.target.value })}
                          style={{ minHeight: '38px', height: '38px', padding: '0.35rem 0.65rem', fontSize: '0.825rem', lineHeight: '1.4' }}
                        >
                          <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                          <option value="Cash">Cash</option>
                          <option value="Cheque">Cheque</option>
                          <option value="Net Banking">Net Banking (NEFT/RTGS/IMPS)</option>
                          <option value="Card">Debit / Credit Card</option>
                        </select>
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: '600' }}>Transaction Date</label>
                        <input
                          type="date"
                          className="form-input"
                          value={tenantFormData.initialTxnDate}
                          onChange={(e) => setTenantFormData({ ...tenantFormData, initialTxnDate: e.target.value })}
                          style={{ minHeight: '38px', height: '38px', padding: '0.35rem 0.65rem', fontSize: '0.825rem' }}
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: '600' }}>Deposit Account</label>
                        <select
                          className="form-select"
                          value={tenantFormData.initialPaymentAccount}
                          onChange={(e) => setTenantFormData({ ...tenantFormData, initialPaymentAccount: e.target.value })}
                          style={{ minHeight: '38px', height: '38px', padding: '0.35rem 0.65rem', fontSize: '0.825rem', lineHeight: '1.4' }}
                        >
                          {paymentAccounts && paymentAccounts.length > 0 ? (
                            paymentAccounts.map((acc) => (
                              <option key={acc.AccountId || acc.AccountName} value={acc.AccountName}>
                                {acc.AccountName} {acc.AccountType ? `(${acc.AccountType})` : ''}
                              </option>
                            ))
                          ) : (
                            <>
                              <option value="Cash in Hand">Cash in Hand (Cash)</option>
                              <option value="Bank1 (Primary Current)">Bank1 (Primary Current) (Bank)</option>
                              <option value="Bank2 (Operating)">Bank2 (Operating) (Bank)</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: '600' }}>Txn / Cheque Ref #</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. UPI-98218128"
                          value={tenantFormData.initialReferenceNo}
                          onChange={(e) => setTenantFormData({ ...tenantFormData, initialReferenceNo: e.target.value })}
                          style={{ minHeight: '38px', height: '38px', padding: '0.35rem 0.65rem', fontSize: '0.825rem' }}
                        />
                      </div>
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
                <Sparkles size={16} color="#2563eb" /> Issue / Add Subscription License
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

              {/* Renewal Payment Details */}
              <div style={{
                padding: '0.75rem',
                backgroundColor: '#ffffff',
                borderRadius: '6px',
                border: '1px dashed #cbd5e1',
                marginBottom: '0.75rem'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <DollarSign size={13} color="#2563eb" />
                  <span>Renewal Payment Details</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.65rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: '600' }}>Payment Mode</label>
                    <select
                      className="form-select"
                      value={newLicenseForm.paymentMode}
                      onChange={(e) => setNewLicenseForm({ ...newLicenseForm, paymentMode: e.target.value })}
                      style={{ minHeight: '38px', height: '38px', padding: '0.35rem 0.65rem', fontSize: '0.825rem', lineHeight: '1.4' }}
                    >
                      <option value="UPI">UPI</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Net Banking">Net Banking</option>
                      <option value="Card">Card</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: '600' }}>Txn Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={newLicenseForm.txnDate}
                      onChange={(e) => setNewLicenseForm({ ...newLicenseForm, txnDate: e.target.value })}
                      style={{ minHeight: '38px', height: '38px', padding: '0.35rem 0.65rem', fontSize: '0.825rem' }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: '600' }}>Receiving Account</label>
                    <select
                      className="form-select"
                      value={newLicenseForm.paymentAccount}
                      onChange={(e) => setNewLicenseForm({ ...newLicenseForm, paymentAccount: e.target.value })}
                      style={{ minHeight: '38px', height: '38px', padding: '0.35rem 0.65rem', fontSize: '0.825rem', lineHeight: '1.4' }}
                    >
                      {paymentAccounts && paymentAccounts.length > 0 ? (
                        paymentAccounts.map((acc) => (
                          <option key={acc.AccountId || acc.AccountName} value={acc.AccountName}>
                            {acc.AccountName} {acc.AccountType ? `(${acc.AccountType})` : ''}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="Cash in Hand">Cash in Hand (Cash)</option>
                          <option value="Bank1 (Primary Current)">Bank1 (Primary Current) (Bank)</option>
                          <option value="Bank2 (Operating)">Bank2 (Operating) (Bank)</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: '600' }}>Ref #</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. UPI-12345"
                      value={newLicenseForm.referenceNo}
                      onChange={(e) => setNewLicenseForm({ ...newLicenseForm, referenceNo: e.target.value })}
                      style={{ minHeight: '38px', height: '38px', padding: '0.35rem 0.65rem', fontSize: '0.825rem' }}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={saving}
                style={{ 
                  width: '100%', 
                  marginTop: '0.25rem',
                  height: '38px',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  letterSpacing: '0.5px'
                }}
              >
                <Save size={15} />
                <span>{saving ? 'Saving...' : 'SAVE'}</span>
              </button>
            </form>

            {/* Historical Licenses Trail */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 0.5rem 0' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  Historical Subscription Trail
                </h4>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  Auto-transitions on expiry & start dates
                </span>
              </div>
              <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <table className="crm-table" style={{ fontSize: '0.75rem' }}>
                  <thead>
                    <tr>
                      <th>License ID</th>
                      <th>Type</th>
                      <th>Period</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {licenseLoading ? (
                      <tr><td colSpan={7} style={{ textAlign: 'center', padding: '1rem' }}>Loading trail...</td></tr>
                    ) : licenseHistory.length === 0 ? (
                      <tr><td colSpan={7} style={{ textAlign: 'center', padding: '1rem', color: '#64748b' }}>No license records found.</td></tr>
                    ) : (
                      licenseHistory.map((lic) => {
                        const statusUpper = String(lic.Status || '').toUpperCase();
                        const isCurrentlyActive = Boolean(lic.IsActive) || statusUpper === 'ACTIVE';
                        const isNewQueued = statusUpper === 'NEW' || (!isCurrentlyActive && statusUpper !== 'EXPIRED' && statusUpper !== 'CANCELLED');
                        const isExpiredOrCancelled = statusUpper === 'EXPIRED' || statusUpper === 'CANCELLED';

                        return (
                          <tr key={lic.Id} style={isCurrentlyActive ? { backgroundColor: '#f0fdf4' } : {}}>
                            <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>{lic.Id}</td>
                            <td style={{ fontWeight: '600' }}>{lic.LicenseType}</td>
                            <td>
                              {lic.StartDate ? new Date(lic.StartDate).toLocaleDateString() : '—'} to{' '}
                              {lic.EndDate ? new Date(lic.EndDate).toLocaleDateString() : '—'}
                            </td>
                            <td style={{ fontWeight: '600' }}>₹{Number(lic.Amount || 0).toLocaleString()}</td>
                            <td>
                              <span style={{ fontSize: '0.7rem', color: '#475569' }}>
                                {lic.PaymentMode || '—'} {lic.PaymentAccount ? `(${lic.PaymentAccount})` : ''}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${
                                isCurrentlyActive ? 'badge-success' : 
                                (statusUpper === 'NEW' ? 'badge-info' : 
                                (statusUpper === 'EXPIRED' ? 'badge-neutral' : 'badge-danger'))
                              }`} style={statusUpper === 'NEW' ? { backgroundColor: '#e0e7ff', color: '#4338ca', fontWeight: '700' } : {}}>
                                {isCurrentlyActive ? 'ACTIVE' : (statusUpper === 'NEW' ? 'NEW' : lic.Status)}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              {isCurrentlyActive ? (
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => handleToggleLicenseStatus(lic, 'Cancelled')}
                                  style={{ fontSize: '0.65rem', padding: '2px 7px', color: '#ef4444' }}
                                  title="Cancel Active License"
                                >
                                  Cancel
                                </button>
                              ) : isNewQueued ? (
                                <button
                                  type="button"
                                  className="btn btn-sm"
                                  onClick={() => handleActivateLicense(lic)}
                                  style={{ 
                                    backgroundColor: '#10b981', 
                                    color: '#ffffff', 
                                    fontSize: '0.675rem', 
                                    padding: '3px 8px', 
                                    borderRadius: '5px', 
                                    fontWeight: '700',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    border: 'none',
                                    cursor: 'pointer'
                                  }}
                                  title="Click to manually activate this license immediately"
                                >
                                  <Zap size={11} />
                                  <span>Activate</span>
                                </button>
                              ) : isExpiredOrCancelled ? (
                                <span style={{ color: '#94a3b8', fontSize: '0.675rem', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '3px', userSelect: 'none' }} title="Historical license is expired and locked (non-editable / non-deletable)">
                                  <Lock size={10} />
                                  <span>Expired</span>
                                </span>
                              ) : null}
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
