import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Database, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Mail,
  Archive,
  Download
} from 'lucide-react';
import { crmApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

export default function Settings({ onOpenBackup }) {
  const { user, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('company');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Company & SES Settings State
  const [companySettings, setCompanySettings] = useState({
    COMPANY_NAME: 'SR INVESTMENTS',
    ARN_NUMBER: 'ARN-189241',
    EUIN_NUMBER: 'E345678',
    GSTIN: '27AAACR1234F1Z5',
    SUPPORT_EMAIL: 'support@srinvestments.com',
    CONTACT_PHONE: '+91 98765 43210',
    OFFICE_ADDRESS: '101, Fortune Hub, Financial District, Bandra-Kurla Complex, Mumbai 400051',
    SES_REGION: 'ap-south-1',
    SES_SENDER_EMAIL: 'notifications@srinvestments.com',
    SES_ACCESS_KEY: 'AKIA_DEMO_SR_INVESTMENTS',
    SES_SECRET_KEY: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
  });

  // User Rights Matrix State
  const [rights, setRights] = useState([]);

  // Backend connection State
  const [gasUrl, setGasUrl] = useState(crmApi.getBackendUrl());
  const [isDemoMode, setIsDemoMode] = useState(crmApi.isDemoMode());
  const [pingResult, setPingResult] = useState(null);
  const [pinging, setPinging] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setMsg({ text: '', type: '' });
    try {
      const [comp, rts] = await Promise.all([
        crmApi.call('getCompanySettings'),
        crmApi.call('getRolesRights')
      ]);
      if (comp) setCompanySettings((prev) => ({ ...prev, ...comp }));
      if (rts) setRights(rts);
    } catch (err) {
      console.warn('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ text: '', type: '' });
    try {
      await crmApi.call('saveCompanySettings', companySettings);
      setMsg({ text: 'Company & Amazon SES settings updated successfully!', type: 'success' });
    } catch (err) {
      setMsg({ text: err.message || 'Failed to save settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRights = async () => {
    setSaving(true);
    setMsg({ text: '', type: '' });
    try {
      await crmApi.call('saveRolesRights', rights);
      setMsg({ text: 'Role rights & permissions matrix saved successfully!', type: 'success' });
    } catch (err) {
      setMsg({ text: err.message || 'Failed to save rights matrix', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const toggleRight = (index, field) => {
    const updated = [...rights];
    updated[index][field] = !updated[index][field];
    setRights(updated);
  };

  const handleSaveBackendUrl = () => {
    crmApi.setBackendUrl(gasUrl);
    setMsg({ text: 'Backend URL saved! Click "Test Connection" to verify.', type: 'success' });
  };

  const testConnection = async () => {
    setPinging(true);
    setPingResult(null);
    try {
      const res = await crmApi.call('health');
      setPingResult({ success: true, message: `Connected! Service timestamp: ${res.timestamp || new Date().toISOString()}` });
    } catch (err) {
      setPingResult({ success: false, message: `Connection failed: ${err.message}` });
    } finally {
      setPinging(false);
    }
  };

  const toggleDemoMode = (val) => {
    crmApi.setDemoMode(val);
    setIsDemoMode(val);
    setMsg({
      text: val 
        ? 'Switched to Local Storage Demo mode.' 
        : 'Switched to Live Google Apps Script mode.',
      type: 'info'
    });
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header 
        title="CRM Settings & Configurations" 
        subtitle="Manage company profile, Amazon SES mailer, role-based user rights & Google Sheets backend"
        onRefresh={loadSettings}
        refreshing={loading}
        onOpenBackup={onOpenBackup}
      />

      <div className="page-wrapper">
        {/* Navigation Tabs - Blue Family */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('company')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'transparent',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: activeTab === 'company' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'company' ? '2px solid #2563eb' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Building2 size={16} /> Company Details
          </button>

          <button
            onClick={() => setActiveTab('ses')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'transparent',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: activeTab === 'ses' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'ses' ? '2px solid #2563eb' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Mail size={16} /> Amazon SES Mailer Config
          </button>

          <button
            onClick={() => setActiveTab('rights')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'transparent',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: activeTab === 'rights' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'rights' ? '2px solid #2563eb' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <ShieldCheck size={16} /> User Rights & Permissions
          </button>

          <button
            onClick={() => setActiveTab('backend')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'transparent',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: activeTab === 'backend' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'backend' ? '2px solid #2563eb' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Database size={16} /> Google Apps Script / Drive Sync
          </button>
        </div>

        {/* Message Banner */}
        {msg.text && (
          <div style={{
            padding: '0.85rem 1.25rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: msg.type === 'success' ? '#dbeafe' : (msg.type === 'error' ? '#fee2e2' : '#eff6ff'),
            color: msg.type === 'success' ? '#1e40af' : (msg.type === 'error' ? '#b91c1c' : '#2563eb'),
            border: `1px solid ${msg.type === 'success' ? '#93c5fd' : (msg.type === 'error' ? '#fca5a5' : '#bfdbfe')}`
          }}>
            {msg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{msg.text}</span>
          </div>
        )}

        {/* TAB 1: COMPANY SETTINGS */}
        {activeTab === 'company' && (
          <div className="crm-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>
              Firm Information & AMFI Credentials
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.5rem' }}>
              These credentials appear on investor statements, account forms, and CRM correspondence.
            </p>

            <form onSubmit={handleSaveCompany}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Mutual Fund Firm Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={companySettings.COMPANY_NAME || ''}
                    onChange={(e) => setCompanySettings({ ...companySettings, COMPANY_NAME: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">AMFI Registration Number (ARN)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="ARN-189241"
                    value={companySettings.ARN_NUMBER || ''}
                    onChange={(e) => setCompanySettings({ ...companySettings, ARN_NUMBER: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Principal EUIN</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="E345678"
                    value={companySettings.EUIN_NUMBER || ''}
                    onChange={(e) => setCompanySettings({ ...companySettings, EUIN_NUMBER: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">GSTIN Identification Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="27AAACR1234F1Z5"
                    value={companySettings.GSTIN || ''}
                    onChange={(e) => setCompanySettings({ ...companySettings, GSTIN: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Official Support Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={companySettings.SUPPORT_EMAIL || ''}
                    onChange={(e) => setCompanySettings({ ...companySettings, SUPPORT_EMAIL: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Helpdesk Contact Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={companySettings.CONTACT_PHONE || ''}
                    onChange={(e) => setCompanySettings({ ...companySettings, CONTACT_PHONE: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label className="form-label">Registered Office Address</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={companySettings.OFFICE_ADDRESS || ''}
                  onChange={(e) => setCompanySettings({ ...companySettings, OFFICE_ADDRESS: e.target.value })}
                />
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <Save size={16} /> {saving ? 'Saving...' : 'Save Company Details'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: AMAZON SES CONFIGURATION */}
        {activeTab === 'ses' && (
          <div className="crm-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>
              Amazon Simple Email Service (SES) API Credentials
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.5rem' }}>
              Used by the Bulk Mailing module for sending personalized portfolio statements and newsletters with lowest billing cost.
            </p>

            <form onSubmit={handleSaveCompany}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">AWS Region</label>
                  <select
                    className="form-select"
                    value={companySettings.SES_REGION || 'ap-south-1'}
                    onChange={(e) => setCompanySettings({ ...companySettings, SES_REGION: e.target.value })}
                  >
                    <option value="ap-south-1">Asia Pacific (Mumbai) - ap-south-1</option>
                    <option value="us-east-1">US East (N. Virginia) - us-east-1</option>
                    <option value="eu-west-1">Europe (Ireland) - eu-west-1</option>
                    <option value="ap-southeast-1">Asia Pacific (Singapore) - ap-southeast-1</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Verified Sender Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="notifications@srinvestments.com"
                    value={companySettings.SES_SENDER_EMAIL || ''}
                    onChange={(e) => setCompanySettings({ ...companySettings, SES_SENDER_EMAIL: e.target.value })}
                    required
                  />
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>
                    Must be verified in your AWS SES console.
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">AWS Access Key ID</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="AKIAIOSFODNN7EXAMPLE"
                    value={companySettings.SES_ACCESS_KEY || ''}
                    onChange={(e) => setCompanySettings({ ...companySettings, SES_ACCESS_KEY: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">AWS Secret Access Key</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                    value={companySettings.SES_SECRET_KEY || ''}
                    onChange={(e) => setCompanySettings({ ...companySettings, SES_SECRET_KEY: e.target.value })}
                  />
                </div>
              </div>

              <div style={{
                marginTop: '1.25rem',
                padding: '1rem',
                backgroundColor: '#eff6ff',
                borderRadius: '8px',
                border: '1px solid #bfdbfe',
                fontSize: '0.8rem',
                color: '#1e40af'
              }}>
                <strong>Amazon SES Billing Rate:</strong> $0.10 per 1,000 emails sent. Invoices are billed directly by Amazon Web Services to your AWS account. The CRM tracks every sent message with timestamps and estimated cost breakdowns.
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <Save size={16} /> {saving ? 'Saving...' : 'Save Amazon SES Configuration'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: USER RIGHTS & PERMISSIONS */}
        {activeTab === 'rights' && (
          <div className="crm-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  Role-Based Access Control (RBAC) Matrix
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0 0' }}>
                  Manage View, Create, Edit, and Delete privileges per staff role, including Drive Backup and Bulk Mailing access.
                </p>
              </div>
              <button className="btn btn-primary" onClick={handleSaveRights} disabled={saving}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save Permissions'}
              </button>
            </div>

            <div className="table-responsive">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>CRM Module</th>
                    <th style={{ textAlign: 'center' }}>Can View</th>
                    <th style={{ textAlign: 'center' }}>Can Create</th>
                    <th style={{ textAlign: 'center' }}>Can Edit</th>
                    <th style={{ textAlign: 'center' }}>Can Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {rights.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                        No permission rules loaded.
                      </td>
                    </tr>
                  ) : (
                    rights.map((r, i) => (
                      <tr key={`${r.Role}_${r.Module}_${i}`}>
                        <td>
                          <strong>{r.Role}</strong>
                        </td>
                        <td>
                          <span className="badge badge-info">{r.Module}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={Boolean(r.CanView)}
                            onChange={() => toggleRight(i, 'CanView')}
                            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#2563eb' }}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={Boolean(r.CanCreate)}
                            onChange={() => toggleRight(i, 'CanCreate')}
                            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#2563eb' }}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={Boolean(r.CanEdit)}
                            onChange={() => toggleRight(i, 'CanEdit')}
                            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#2563eb' }}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={Boolean(r.CanDelete)}
                            onChange={() => toggleRight(i, 'CanDelete')}
                            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#2563eb' }}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: BACKEND CONNECTION */}
        {activeTab === 'backend' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="crm-card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>
                Operating Environment
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
                Toggle between the browser local storage demo environment and your live Google Apps Script web app.
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  className={`btn ${isDemoMode ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => toggleDemoMode(true)}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isDemoMode ? '#ffffff' : '#2563eb' }}></span>
                  Local Storage Demo Mode
                </button>

                <button
                  className={`btn ${!isDemoMode ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => toggleDemoMode(false)}
                >
                  <Database size={15} />
                  Live Google Apps Script + Sheets + Drive Mode
                </button>
              </div>
            </div>

            <div className="crm-card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>
                Google Apps Script Web App Deployment URL
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
                Configured with Spreadsheet ID <code>1Bll7386rIJD2CIl1VX--0Okcn-jxXOpII0OHh9FSKSM</code> and Drive folder <code>1IxulBQJTKrxYAyYMUhz5bllvaMZUYvy</code>.
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://script.google.com/macros/s/AKfycby.../exec"
                  value={gasUrl}
                  onChange={(e) => setGasUrl(e.target.value)}
                />
                <button className="btn btn-primary" onClick={handleSaveBackendUrl}>
                  Save URL
                </button>
                <button className="btn btn-secondary" onClick={testConnection} disabled={pinging}>
                  <RefreshCw size={14} className={pinging ? 'spin-animation' : ''} />
                  {pinging ? 'Pinging...' : 'Test Connection'}
                </button>
              </div>

              {pingResult && (
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.825rem',
                  backgroundColor: pingResult.success ? '#dbeafe' : '#fee2e2',
                  color: pingResult.success ? '#1e40af' : '#b91c1c',
                  border: `1px solid ${pingResult.success ? '#93c5fd' : '#fca5a5'}`
                }}>
                  {pingResult.message}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
