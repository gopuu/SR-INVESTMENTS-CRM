import React, { useState, useEffect, useMemo } from 'react';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Check, 
  Sparkles, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  XCircle,
  Building2,
  Calendar,
  Layers,
  Star
} from 'lucide-react';
import { crmApi, subscribeCrmEvents } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Modal from '../components/Modal';

const PRESET_FEATURES = [
  'Core CRM & KYC Management',
  'SIP & Investment Tracker',
  'Comprehensive Financial Reports',
  'Dedicated Google Drive Storage Vault',
  'Multi-User RBAC & Audit Trail',
  'Priority SLA & Dedicated Support',
  'Automated Daily Cloud Backups'
];

export default function SubscriptionPlans({ onOpenBackup }) {
  const { isSuperAdmin, user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    PlanId: '',
    PlanName: '',
    PlanCode: '',
    Price: 25000,
    DurationMonths: 12,
    StaffLimit: 5,
    CustomerLimit: 1000,
    Features: '',
    IsPopular: false,
    Badge: '',
    Description: '',
    Color: '#2563eb',
    Status: 'Active'
  });

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await crmApi.getSubscriptionPlans(false);
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load subscription plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
    const unsub = subscribeCrmEvents((evt) => {
      if (evt.module === 'SubscriptionPlans') {
        loadPlans();
      }
    });
    return unsub;
  }, []);

  // Filtered plans
  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        (p.PlanName && p.PlanName.toLowerCase().includes(q)) ||
        (p.PlanCode && p.PlanCode.toLowerCase().includes(q)) ||
        (p.Features && p.Features.toLowerCase().includes(q)) ||
        (p.Description && p.Description.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && p.Status === 'Active') ||
        (statusFilter === 'inactive' && p.Status !== 'Active');

      return matchSearch && matchStatus;
    });
  }, [plans, searchQuery, statusFilter]);

  // Metric stats
  const metrics = useMemo(() => {
    const active = plans.filter((p) => p.Status === 'Active');
    const totalRevenue = active.reduce((acc, p) => acc + (Number(p.Price) || 0), 0);
    const avgPrice = active.length > 0 ? Math.round(totalRevenue / active.length) : 0;
    const popular = active.find((p) => p.IsPopular) || active[0];
    return {
      total: plans.length,
      active: active.length,
      avgPrice,
      popularPlan: popular ? popular.PlanName : 'None'
    };
  }, [plans]);

  // Modal Handlers
  const handleOpenAdd = () => {
    setEditingPlan(null);
    setFormData({
      PlanId: '',
      PlanName: '',
      PlanCode: '',
      Price: 30000,
      DurationMonths: 12,
      StaffLimit: 10,
      CustomerLimit: 2500,
      Features: 'Core CRM & KYC Management, SIP & Investment Tracker, Financial Reports',
      IsPopular: false,
      Badge: '',
      Description: 'Up to 10 Staff • 2.5k Investors • Core CRM & SIP Reports',
      Color: '#2563eb',
      Status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      PlanId: plan.PlanId || '',
      PlanName: plan.PlanName || '',
      PlanCode: plan.PlanCode || '',
      Price: plan.Price !== undefined ? plan.Price : 0,
      DurationMonths: plan.DurationMonths || 12,
      StaffLimit: plan.StaffLimit !== undefined ? plan.StaffLimit : 5,
      CustomerLimit: plan.CustomerLimit !== undefined ? plan.CustomerLimit : 1000,
      Features: plan.Features || '',
      IsPopular: Boolean(plan.IsPopular),
      Badge: plan.Badge || '',
      Description: plan.Description || '',
      Color: plan.Color || '#2563eb',
      Status: plan.Status || 'Active'
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.PlanName.trim()) {
      alert('Plan Name is required.');
      return;
    }
    try {
      setSaving(true);
      await crmApi.saveSubscriptionPlan({
        ...formData,
        Price: Number(formData.Price || 0),
        DurationMonths: Number(formData.DurationMonths || 12),
        StaffLimit: Number(formData.StaffLimit !== undefined ? formData.StaffLimit : 5),
        CustomerLimit: Number(formData.CustomerLimit !== undefined ? formData.CustomerLimit : 1000),
        PlanCode: (formData.PlanCode || formData.PlanName.replace(/\s+/g, '_')).toUpperCase()
      });
      setIsModalOpen(false);
      loadPlans();
    } catch (err) {
      alert(err.message || 'Failed to save subscription plan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (plan) => {
    if (!window.confirm(`Are you sure you want to delete the plan "${plan.PlanName}"?`)) return;
    try {
      setSaving(true);
      await crmApi.deleteSubscriptionPlan(plan.PlanId);
      loadPlans();
    } catch (err) {
      alert(err.message || 'Failed to delete plan.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (plan) => {
    try {
      setSaving(true);
      const newStatus = plan.Status === 'Active' ? 'Inactive' : 'Active';
      await crmApi.saveSubscriptionPlan({
        ...plan,
        Status: newStatus
      });
      loadPlans();
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    } finally {
      setSaving(false);
    }
  };

  // Toggle feature tag in form
  const handleToggleFeature = (feat) => {
    const list = formData.Features.split(',').map(s => s.trim()).filter(Boolean);
    const exists = list.some(f => f.toLowerCase() === feat.toLowerCase());
    let updated;
    if (exists) {
      updated = list.filter(f => f.toLowerCase() !== feat.toLowerCase());
    } else {
      updated = [...list, feat];
    }
    setFormData({ ...formData, Features: updated.join(', ') });
  };

  // SuperAdmin Guard
  if (!isSuperAdmin) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h3 style={{ color: '#ef4444' }}>Access Denied</h3>
        <p style={{ color: '#64748b' }}>Only Super Administrators have permission to manage SaaS Subscription Plans.</p>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Subscription Plans Master (SaaS Tiers)"
        subtitle="Manage client subscription tiers, pricing quotas, staff limits, and included SaaS capabilities."
        onOpenBackup={onOpenBackup}
        actions={
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={loadPlans}
              title="Refresh Plans"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <RefreshCw size={14} className={loading ? 'spin-animation' : ''} />
              <span>Refresh</span>
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleOpenAdd}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                fontWeight: '700'
              }}
            >
              <Plus size={16} />
              <span>Add New Plan</span>
            </button>
          </div>
        }
      />

      <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* TOP STATS CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          <div className="crm-card" style={{ padding: '1.15rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #bfdbfe'
            }}>
              <Layers size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                Total Plans
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0f172a' }}>
                {metrics.total}
              </div>
            </div>
          </div>

          <div className="crm-card" style={{ padding: '1.15rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #a7f3d0'
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                Active Offerings
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#059669' }}>
                {metrics.active}
              </div>
            </div>
          </div>

          <div className="crm-card" style={{ padding: '1.15rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #fde68a'
            }}>
              <Star size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                Flagship Tier
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#b45309' }}>
                {metrics.popularPlan}
              </div>
            </div>
          </div>

          <div className="crm-card" style={{ padding: '1.15rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#faf5ff',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #ddd6fe'
            }}>
              <CreditCard size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                Avg Plan Value
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#7c3aed' }}>
                ₹{metrics.avgPrice.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH, FILTER & VIEW CONTROLS */}
        <div className="crm-card" style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search plans by name, code or features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '32px', height: '36px', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Filter size={15} color="#64748b" />
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ height: '36px', fontSize: '0.825rem', width: '130px' }}
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              style={{
                border: 'none',
                background: viewMode === 'cards' ? '#ffffff' : 'transparent',
                color: viewMode === 'cards' ? '#2563eb' : '#64748b',
                fontWeight: '600',
                fontSize: '0.78rem',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: viewMode === 'cards' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              Plan Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                border: 'none',
                background: viewMode === 'table' ? '#ffffff' : 'transparent',
                color: viewMode === 'table' ? '#2563eb' : '#64748b',
                fontWeight: '600',
                fontSize: '0.78rem',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: viewMode === 'table' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              Table View
            </button>
          </div>
        </div>

        {/* LOADING INDICATOR */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
            <RefreshCw size={24} className="spin-animation" style={{ margin: '0 auto 0.5rem' }} />
            <div>Loading Subscription Plans Master...</div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredPlans.length === 0 && (
          <div className="crm-card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <CreditCard size={42} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
            <h4 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: '700', margin: '0 0 0.35rem' }}>No Subscription Plans Found</h4>
            <p style={{ fontSize: '0.825rem', margin: '0 0 1rem' }}>
              {searchQuery ? 'No plans match your search query.' : 'Configure your first SaaS subscription tier.'}
            </p>
            <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
              <Plus size={14} /> Add First Plan
            </button>
          </div>
        )}

        {/* VIEW MODE 1: CARDS GRID (MATCHING THE USER'S ATTACHED IMAGE) */}
        {!loading && viewMode === 'cards' && filteredPlans.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {filteredPlans.map((plan) => {
              const featuresList = (plan.Features || '').split(',').map(f => f.trim()).filter(Boolean);
              const isPopular = Boolean(plan.IsPopular);
              const cardColor = plan.Color || (isPopular ? '#2563eb' : (plan.Price > 60000 ? '#7c3aed' : '#0284c7'));
              const monthlyRate = plan.DurationMonths > 0 ? Math.round(plan.Price / plan.DurationMonths) : plan.Price;

              return (
                <div
                  key={plan.PlanId}
                  className="crm-card"
                  style={{
                    position: 'relative',
                    border: isPopular ? `2px solid ${cardColor}` : '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '1.5rem',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    boxShadow: isPopular ? '0 10px 25px -5px rgba(37, 99, 235, 0.15)' : undefined
                  }}
                >
                  {/* POPULAR BADGE */}
                  {isPopular && (
                    <div style={{
                      position: 'absolute',
                      top: '-11px',
                      right: '16px',
                      backgroundColor: cardColor,
                      color: '#ffffff',
                      fontSize: '0.65rem',
                      fontWeight: '800',
                      padding: '2px 9px',
                      borderRadius: '9999px',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      boxShadow: '0 2px 6px rgba(37, 99, 235, 0.35)'
                    }}>
                      {plan.Badge || 'POPULAR'}
                    </div>
                  )}

                  {/* HEADER ROW */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                        {plan.PlanName}
                      </h3>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', fontFamily: 'monospace' }}>
                        {plan.PlanCode || plan.PlanId}
                      </span>
                    </div>

                    <span className={`badge ${plan.Status === 'Active' ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '0.72rem' }}>
                      {plan.Status}
                    </span>
                  </div>

                  {/* PRICE DISPLAY */}
                  <div style={{ margin: '0.5rem 0 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                      <span style={{ fontSize: '2rem', fontWeight: '800', color: cardColor, letterSpacing: '-0.02em' }}>
                        ₹{Number(plan.Price).toLocaleString('en-IN')}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                        / {plan.DurationMonths}m
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                      Effective: <strong>₹{monthlyRate.toLocaleString('en-IN')}</strong> / month
                    </div>
                  </div>

                  {/* DESCRIPTION / SUMMARY */}
                  {plan.Description && (
                    <p style={{
                      fontSize: '0.8rem',
                      color: '#475569',
                      backgroundColor: '#f8fafc',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #f1f5f9',
                      margin: '0 0 1rem',
                      lineHeight: 1.35
                    }}>
                      {plan.Description}
                    </p>
                  )}

                  {/* QUOTA CAPACITY LIMITS */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                    padding: '0.65rem',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Users size={16} color="#2563eb" />
                      <div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Staff Limit</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
                          {plan.StaffLimit >= 999 || plan.StaffLimit < 0 ? 'Unlimited' : `${plan.StaffLimit} Staff`}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <TrendingUp size={16} color="#059669" />
                      <div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Investor Limit</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
                          {plan.CustomerLimit >= 99999 || plan.CustomerLimit < 0 ? 'Unlimited' : `${plan.CustomerLimit.toLocaleString('en-IN')} Investors`}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FEATURES LIST */}
                  <div style={{ flex: 1, marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.45rem', letterSpacing: '0.04em' }}>
                      Included Capabilities
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {featuresList.length === 0 ? (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Standard CRM feature set</span>
                      ) : (
                        featuresList.map((f, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', fontSize: '0.78rem', color: '#334155' }}>
                            <Check size={14} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{f}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* CARD ACTIONS FOOTER */}
                  <div style={{
                    paddingTop: '0.85rem',
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem'
                  }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleToggleStatus(plan)}
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                      title="Toggle active status"
                    >
                      {plan.Status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenEdit(plan)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleDelete(plan)}
                        style={{ color: '#ef4444', padding: '0.35rem 0.55rem' }}
                        title="Delete Plan"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW MODE 2: TABLE VIEW */}
        {!loading && viewMode === 'table' && filteredPlans.length > 0 && (
          <div className="crm-card" style={{ overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Plan Name & Code</th>
                    <th>Price & Billing Cycle</th>
                    <th>Capacity Limits</th>
                    <th>Highlights</th>
                    <th>Popular Tier</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlans.map((plan) => (
                    <tr key={plan.PlanId}>
                      <td>
                        <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>
                          {plan.PlanName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>
                          {plan.PlanCode || plan.PlanId}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '800', color: '#1e40af', fontSize: '0.95rem' }}>
                          ₹{Number(plan.Price).toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          Valid for {plan.DurationMonths} Months
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                          👥 {plan.StaffLimit >= 999 || plan.StaffLimit < 0 ? 'Unlimited' : plan.StaffLimit} Staff
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                          📈 {plan.CustomerLimit >= 99999 || plan.CustomerLimit < 0 ? 'Unlimited' : Number(plan.CustomerLimit).toLocaleString('en-IN')} Investors
                        </div>
                      </td>
                      <td style={{ maxWidth: '280px' }}>
                        <div style={{ fontSize: '0.75rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {plan.Features || plan.Description || 'Core CRM'}
                        </div>
                      </td>
                      <td>
                        {plan.IsPopular ? (
                          <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                            {plan.Badge || 'POPULAR'}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>—</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${plan.Status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>
                          {plan.Status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenEdit(plan)}
                            style={{ padding: '0.35rem 0.55rem' }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleDelete(plan)}
                            style={{ padding: '0.35rem 0.55rem', color: '#ef4444' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* ADD / EDIT SUBSCRIPTION PLAN MODAL (CRUD)                      */}
      {/* ============================================================== */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => !saving && setIsModalOpen(false)}
          headerContent={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                flexShrink: 0
              }}>
                <CreditCard size={22} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>
                  {editingPlan ? `Edit Subscription Plan: ${editingPlan.PlanName}` : 'Create New Subscription Plan'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0' }}>
                  Define pricing, cycle duration, staff & customer quota limits, and SaaS features.
                </p>
              </div>
            </div>
          }
          maxWidth="720px"
        >
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <div className="modal-body" style={{ overflowY: 'auto', flex: 1, padding: '1.5rem', maxHeight: 'calc(90vh - 140px)' }}>
              {/* ROW 1: PLAN NAME & CODE */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: '1.1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">
                    Plan Display Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Starter, Professional, Enterprise"
                    value={formData.PlanName}
                    onChange={(e) => setFormData({ ...formData, PlanName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">
                    Plan Code (Unique Key)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. STARTER, PRO_YEARLY"
                    value={formData.PlanCode}
                    onChange={(e) => setFormData({ ...formData, PlanCode: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>

              {/* ROW 2: PRICE & DURATION */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">
                    Subscription Price (₹ INR) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 60000"
                    value={formData.Price}
                    onChange={(e) => setFormData({ ...formData, Price: Number(e.target.value) })}
                    min="0"
                    required
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px', display: 'block' }}>
                    Total fee charged for the duration cycle
                  </span>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">
                    Cycle Duration (Months) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    className="form-select"
                    value={formData.DurationMonths}
                    onChange={(e) => setFormData({ ...formData, DurationMonths: Number(e.target.value) })}
                  >
                    <option value="1">1 Month (Monthly)</option>
                    <option value="3">3 Months (Quarterly)</option>
                    <option value="6">6 Months (Half-Yearly)</option>
                    <option value="12">12 Months (1 Year)</option>
                    <option value="24">24 Months (2 Years)</option>
                    <option value="36">36 Months (3 Years)</option>
                  </select>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px', display: 'block' }}>
                    Effective ₹{formData.DurationMonths > 0 ? Math.round(formData.Price / formData.DurationMonths).toLocaleString('en-IN') : formData.Price}/mo
                  </span>
                </div>
              </div>

              {/* ROW 3: STAFF & INVESTOR LIMITS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">
                    Staff / Employee Seat Limit <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 15 (use 999 for unlimited)"
                    value={formData.StaffLimit}
                    onChange={(e) => setFormData({ ...formData, StaffLimit: Number(e.target.value) })}
                    required
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px', display: 'block' }}>
                    Tip: Enter <code>999</code> or <code>-1</code> for Unlimited staff
                  </span>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">
                    Customer / Investor Record Limit <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 10000 (use 99999 for unlimited)"
                    value={formData.CustomerLimit}
                    onChange={(e) => setFormData({ ...formData, CustomerLimit: Number(e.target.value) })}
                    required
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px', display: 'block' }}>
                    Tip: Enter <code>99999</code> or <code>-1</code> for Unlimited investors
                  </span>
                </div>
              </div>

              {/* ROW 4: POPULAR BADGE & ACCENT COLOR */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1rem', marginBottom: '1.1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Flagship / Popular Tier</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                    <input
                      type="checkbox"
                      id="isPopularToggle"
                      checked={formData.IsPopular}
                      onChange={(e) => setFormData({ ...formData, IsPopular: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }}
                    />
                    <label htmlFor="isPopularToggle" style={{ fontSize: '0.825rem', color: '#334155', cursor: 'pointer', fontWeight: '600' }}>
                      Mark as Featured / Popular
                    </label>
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Badge Text</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. POPULAR, BEST VALUE"
                    value={formData.Badge}
                    onChange={(e) => setFormData({ ...formData, Badge: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
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

              {/* ROW 5: SHORT SUMMARY DESCRIPTION */}
              <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                <label className="form-label">One-Line Plan Summary</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Up to 15 Staff • 10k Investors • SIP Tracker • Reports"
                  value={formData.Description}
                  onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                />
              </div>

              {/* ROW 6: PRESET FEATURE TAGS */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Included Features (Click to Toggle or Type Below)</span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Comma-separated</span>
                </label>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.65rem' }}>
                  {PRESET_FEATURES.map((feat) => {
                    const active = formData.Features.toLowerCase().includes(feat.toLowerCase());
                    return (
                      <button
                        type="button"
                        key={feat}
                        onClick={() => handleToggleFeature(feat)}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: '600',
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          border: active ? '1px solid #2563eb' : '1px solid #cbd5e1',
                          backgroundColor: active ? '#eff6ff' : '#ffffff',
                          color: active ? '#1d4ed8' : '#475569',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {active && <Check size={11} />}
                        <span>{feat}</span>
                      </button>
                    );
                  })}
                </div>

                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="e.g. Core CRM, SIP Tracker, Priority SLA, Custom Drive Vault"
                  value={formData.Features}
                  onChange={(e) => setFormData({ ...formData, Features: e.target.value })}
                  style={{ fontSize: '0.825rem' }}
                />
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="modal-footer" style={{
              flexShrink: 0,
              padding: '0.85rem 1.5rem',
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem'
            }}>
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
                disabled={saving || !formData.PlanName.trim()}
                style={{
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                }}
              >
                {saving ? (
                  <>
                    <RefreshCw size={14} className="spin-animation" />
                    <span>Saving Plan...</span>
                  </>
                ) : (
                  <span>{editingPlan ? 'Update Plan' : 'Create Subscription Plan'}</span>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

