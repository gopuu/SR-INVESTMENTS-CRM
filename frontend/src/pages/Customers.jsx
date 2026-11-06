import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  Building,
  CreditCard,
  UserCheck,
  RotateCcw,
  Archive,
  Clock
} from 'lucide-react';
import { crmApi, subscribeCrmEvents } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Modal from '../components/Modal';

export default function Customers() {
  const { hasPermission } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [kycFilter, setKycFilter] = useState('');
  const [showDeleted, setShowDeleted] = useState(() => crmApi.getShowDeletedGlobally());
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const initialFormState = {
    CustomerId: '',
    CustomerCode: '',
    FullName: '',
    Email: '',
    Mobile: '',
    PanNumber: '',
    AadhaarLast4: '',
    KycStatus: 'Compliant',
    InvestorCategory: 'Individual',
    DateOfBirth: '',
    NomineeName: '',
    NomineeRelation: 'Spouse',
    BankName: '',
    AccountNumber: '',
    IfscCode: '',
    City: '',
    State: '',
    RiskProfile: 'Moderate',
    Notes: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const loadCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await crmApi.call('getCustomers', { 
        search, 
        kycStatus: kycFilter,
        includeDeleted: showDeleted
      });
      setCustomers(res || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch investors list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [kycFilter, showDeleted]);

  useEffect(() => {
    const unsubscribe = subscribeCrmEvents((ev) => {
      if (ev.module === 'Customers' || ev.type === 'DATA_CHANGED') {
        if (ev.subType === 'SHOW_DELETED_CHANGED') {
          setShowDeleted(Boolean(ev.value));
        } else {
          loadCustomers();
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCustomers();
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (cust) => {
    setEditingCustomer(cust);
    setFormData({
      CustomerId: cust.CustomerId || '',
      CustomerCode: cust.CustomerCode || '',
      FullName: cust.FullName || '',
      Email: cust.Email || '',
      Mobile: cust.Mobile || '',
      PanNumber: cust.PanNumber || '',
      AadhaarLast4: cust.AadhaarLast4 || '',
      KycStatus: cust.KycStatus || 'Compliant',
      InvestorCategory: cust.InvestorCategory || 'Individual',
      DateOfBirth: cust.DateOfBirth || '',
      NomineeName: cust.NomineeName || '',
      NomineeRelation: cust.NomineeRelation || 'Spouse',
      BankName: cust.BankName || '',
      AccountNumber: cust.AccountNumber || '',
      IfscCode: cust.IfscCode || '',
      City: cust.City || '',
      State: cust.State || '',
      RiskProfile: cust.RiskProfile || 'Moderate',
      Notes: cust.Notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await crmApi.call('saveCustomer', formData);
      setIsModalOpen(false);
      await loadCustomers();
    } catch (err) {
      alert(err.message || 'Failed to save customer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to soft-delete investor "${name}"?\n\nPer SEBI compliance, records are soft-deleted and preserved in the audit trail.`)) return;
    try {
      await crmApi.call('deleteCustomer', { customerId: id });
      await loadCustomers();
    } catch (err) {
      alert(err.message || 'Failed to delete customer');
    }
  };

  const handleRestore = async (id, name) => {
    if (!window.confirm(`Restore soft-deleted investor "${name}" to active status?`)) return;
    try {
      await crmApi.call('restoreCustomer', { customerId: id });
      await loadCustomers();
    } catch (err) {
      alert(err.message || 'Failed to restore customer');
    }
  };

  const exportCSV = () => {
    if (!customers.length) return alert('No data to export');
    const headers = ['CustomerCode', 'FullName', 'Email', 'Mobile', 'PAN', 'AadhaarLast4', 'KYC', 'Category', 'Bank', 'AccountNo', 'IFSC', 'City', 'RiskProfile'];
    const rows = customers.map(c => [
      c.CustomerCode,
      `"${c.FullName}"`,
      c.Email,
      c.Mobile,
      c.PanNumber,
      c.AadhaarLast4,
      c.KycStatus,
      c.InvestorCategory,
      `"${c.BankName}"`,
      `"${c.AccountNumber}"`,
      c.IfscCode,
      c.City,
      c.RiskProfile
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SR_Investments_Investors_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header 
        title="Mutual Fund Customer Master" 
        subtitle="Manage client folios, KYC compliance, risk profiling & bank mandates"
        onRefresh={loadCustomers}
        refreshing={loading}
      />

      <div className="page-wrapper">
        {/* Actions bar */}
        <div className="crm-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Search form */}
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '280px', maxWidth: '450px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="Search by name, PAN, mobile or code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              <button type="submit" className="btn btn-secondary">Search</button>
            </form>

            {/* Filter & Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                className="form-select"
                style={{ width: 'auto' }}
                value={kycFilter}
                onChange={(e) => setKycFilter(e.target.value)}
              >
                <option value="">All KYC Status</option>
                <option value="Compliant">Compliant</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>

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

              <button className="btn btn-secondary" onClick={exportCSV} title="Export to CSV">
                <Download size={15} /> Export
              </button>

              {hasPermission('Customers', 'CanCreate') && (
                <button className="btn btn-primary" onClick={openAddModal}>
                  <Plus size={16} /> Add Investor
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

        {/* Customer Table */}
        <div className="crm-card">
          <div className="table-responsive">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Investor Code</th>
                  <th>Full Name & Audit</th>
                  <th>PAN & Aadhaar</th>
                  <th>Contact Details</th>
                  <th>Bank Mandate</th>
                  <th>Category</th>
                  <th>Risk Profile</th>
                  <th>KYC Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      Loading mutual fund investors...
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                      {showDeleted ? 'No soft-deleted investors in audit archive.' : 'No investor records found. Click "Add Investor" to create one.'}
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.CustomerId || c.CustomerCode} style={c.IsDeleted ? { backgroundColor: '#fff5f5' } : {}}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong style={{ color: c.IsDeleted ? '#94a3b8' : '#2563eb', textDecoration: c.IsDeleted ? 'line-through' : 'none' }}>
                            {c.CustomerCode}
                          </strong>
                          {c.IsDeleted && (
                            <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '0.625rem' }}>
                              Soft-Deleted
                            </span>
                          )}
                        </div>
                        {c.IsDeleted && c.Deleted_By && (
                          <div style={{ fontSize: '0.65rem', color: '#b91c1c', marginTop: '2px' }}>
                            By {c.Deleted_By} on {new Date(c.Deleted_At).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: '600', color: c.IsDeleted ? '#64748b' : '#0f172a' }}>{c.FullName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Nominee: {c.NomineeName ? `${c.NomineeName} (${c.NomineeRelation || 'Nominee'})` : 'None'}
                        </div>
                        <div style={{ fontSize: '0.675rem', color: '#94a3b8', marginTop: '2px' }}>
                          Created: {c.Created_At ? new Date(c.Created_At).toLocaleDateString() : '—'} ({c.Created_By || 'System'})
                        </div>
                      </td>
                      <td>
                        <div>
                          <code style={{ backgroundColor: '#f1f5f9', padding: '2px 5px', borderRadius: '4px', fontWeight: '600' }}>
                            {c.PanNumber || 'NO PAN'}
                          </code>
                        </div>
                        {c.AadhaarLast4 && (
                          <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '2px' }}>
                            Aadhaar: •••• {c.AadhaarLast4}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8125rem' }}>{c.Mobile}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.Email || 'No email'}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8125rem', fontWeight: '500' }}>{c.BankName || '—'}</div>
                        <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                          {c.IfscCode ? `IFSC: ${c.IfscCode}` : ''}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-neutral">{c.InvestorCategory || 'Individual'}</span>
                      </td>
                      <td>
                        <span style={{
                          fontSize: '0.775rem',
                          fontWeight: '600',
                          color: c.RiskProfile === 'Aggressive' ? '#dc2626' : (c.RiskProfile === 'High' ? '#ea580c' : '#2563eb')
                        }}>
                          {c.RiskProfile || 'Moderate'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${c.KycStatus === 'Compliant' ? 'badge-primary' : (c.KycStatus === 'Pending' ? 'badge-warning' : 'badge-danger')}`}>
                          {c.KycStatus || 'Pending'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          {c.IsDeleted ? (
                            <button
                              className="btn btn-outline-blue btn-sm"
                              title="Restore Soft-Deleted Investor"
                              onClick={() => handleRestore(c.CustomerId, c.FullName)}
                              style={{ fontSize: '0.72rem', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <RotateCcw size={12} />
                              <span>Restore</span>
                            </button>
                          ) : (
                            <>
                              {hasPermission('Customers', 'CanEdit') && (
                                <button
                                  className="btn-icon"
                                  title="Edit Investor"
                                  onClick={() => openEditModal(c)}
                                >
                                  <Edit2 size={15} color="#2563eb" />
                                </button>
                              )}
                              {hasPermission('Customers', 'CanDelete') && (
                                <button
                                  className="btn-icon"
                                  title="Soft-Delete Investor (Audit preserved)"
                                  onClick={() => handleDelete(c.CustomerId, c.FullName)}
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !saving && setIsModalOpen(false)}
        title={editingCustomer ? `Edit Investor: ${editingCustomer.CustomerCode}` : 'Add New Mutual Fund Investor'}
        maxWidth="740px"
      >
        <form onSubmit={handleSave}>
          <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: '#2563eb', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
              1. Basic Investor Details
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ramesh Kumar Sharma"
                  value={formData.FullName}
                  onChange={(e) => setFormData({ ...formData, FullName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Investor Category</label>
                <select
                  className="form-select"
                  value={formData.InvestorCategory}
                  onChange={(e) => setFormData({ ...formData, InvestorCategory: e.target.value })}
                >
                  <option value="Individual">Individual (Resident)</option>
                  <option value="NRI">NRI (Non-Resident Indian)</option>
                  <option value="HUF">HUF (Hindu Undivided Family)</option>
                  <option value="Corporate">Corporate / Private Limited</option>
                  <option value="Trust">Trust / Partnership</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">PAN Number (Permanent Account No) <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  style={{ textTransform: 'uppercase' }}
                  value={formData.PanNumber}
                  onChange={(e) => setFormData({ ...formData, PanNumber: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Aadhaar (Last 4 Digits)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 5678"
                  maxLength={4}
                  value={formData.AadhaarLast4}
                  onChange={(e) => setFormData({ ...formData, AadhaarLast4: e.target.value.replace(/\D/g, '') })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.DateOfBirth}
                  onChange={(e) => setFormData({ ...formData, DateOfBirth: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">KYC Compliance Status</label>
                <select
                  className="form-select"
                  value={formData.KycStatus}
                  onChange={(e) => setFormData({ ...formData, KycStatus: e.target.value })}
                >
                  <option value="Compliant">Compliant (Verified)</option>
                  <option value="Pending">Pending Documentation</option>
                  <option value="Rejected">Rejected / Under Review</option>
                </select>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: '#2563eb', margin: '1rem 0 0.75rem', letterSpacing: '0.05em' }}>
              2. Contact & Address
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Mobile Number <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={formData.Mobile}
                  onChange={(e) => setFormData({ ...formData, Mobile: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="investor@example.com"
                  value={formData.Email}
                  onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
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

              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Maharashtra"
                  value={formData.State}
                  onChange={(e) => setFormData({ ...formData, State: e.target.value })}
                />
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: '#2563eb', margin: '1rem 0 0.75rem', letterSpacing: '0.05em' }}>
              3. Banking & Nominee Details (For Mutual Fund Redemptions/SIP)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Bank Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. HDFC Bank, ICICI Bank"
                  value={formData.BankName}
                  onChange={(e) => setFormData({ ...formData, BankName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Account Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Account Number"
                  value={formData.AccountNumber}
                  onChange={(e) => setFormData({ ...formData, AccountNumber: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">IFSC Code</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. HDFC0000128"
                  style={{ textTransform: 'uppercase' }}
                  value={formData.IfscCode}
                  onChange={(e) => setFormData({ ...formData, IfscCode: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Risk Profile Appetite</label>
                <select
                  className="form-select"
                  value={formData.RiskProfile}
                  onChange={(e) => setFormData({ ...formData, RiskProfile: e.target.value })}
                >
                  <option value="Conservative">Conservative (Debt oriented)</option>
                  <option value="Moderate">Moderate (Balanced / Hybrid)</option>
                  <option value="High">High (Equity Large & Mid cap)</option>
                  <option value="Aggressive">Aggressive (Small Cap & Sectoral)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Nominee Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nominee Name"
                  value={formData.NomineeName}
                  onChange={(e) => setFormData({ ...formData, NomineeName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nominee Relationship</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Spouse / Father / Son / Daughter"
                  value={formData.NomineeRelation}
                  onChange={(e) => setFormData({ ...formData, NomineeRelation: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <label className="form-label">Portfolio & Advisory Notes</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Special notes, preferred AMCs, monthly SIP commitments..."
                value={formData.Notes}
                onChange={(e) => setFormData({ ...formData, Notes: e.target.value })}
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
              {saving ? 'Saving to Database...' : (editingCustomer ? 'Update Investor' : 'Register Investor')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

