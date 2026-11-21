import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Database, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Archive,
  Download
} from 'lucide-react';
import { crmApi, subscribeCrmEvents } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import RolesRights from './RolesRights';
import { showSuccess, showError, showWarning } from '../utils/swal';

export default function Settings({ onOpenBackup }) {
  const { user, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('company');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Company Settings State
  const [companySettings, setCompanySettings] = useState({
    CompanyName: 'SR GROWW',
    ArnNumber: 'ARN-189241',
    EuinNumber: 'E345678',
    GSTIN: '27AAACR1234F1Z5',
    SupportEmail: 'support@srinvestments.com',
    ContactPhone: '9876543210',
    OfficeAddress: '101, Fortune Hub, Financial District, Bandra-Kurla Complex, Mumbai 400051'
  });

  // User Rights Matrix State
  const [rights, setRights] = useState([]);

  // Backend connection State
  const [gasUrl, setGasUrl] = useState(crmApi.getBackendUrl());
  const [googleClientId, setGoogleClientId] = useState(() => crmApi.getGoogleClientId());
  const [isDemoMode, setIsDemoMode] = useState(crmApi.isDemoMode());
  const [showDeletedGlobally, setShowDeletedGlobally] = useState(() => crmApi.getShowDeletedGlobally());
  const [pingResult, setPingResult] = useState(null);
  const [pinging, setPinging] = useState(false);

  useEffect(() => {
    loadSettings();

    // Auto-refresh settings & rights if updated on another system
    const unsub = subscribeCrmEvents((ev) => {
      if (ev.module === 'Settings' || ev.module === 'RolesRights' || ev.type === 'DATA_CHANGED') {
        loadSettings();
      }
    });

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setMsg({ text: '', type: '' });
    try {
      const [comp, rts] = await Promise.all([
        crmApi.call('getCompanySettings'),
        crmApi.call('getRolesRights')
      ]);
      if (comp) {
        setCompanySettings({
          CompanyName: comp.CompanyName || comp.COMPANY_NAME || comp.companyName || 'SR GROWW',
          ArnNumber: comp.ArnNumber || comp.ARN_NUMBER || comp.arnNumber || '',
          EuinNumber: comp.EuinNumber || comp.EUIN_NUMBER || comp.euinNumber || '',
          GSTIN: comp.GSTIN || comp.Gstin || comp.gstin || '',
          SupportEmail: comp.SupportEmail || comp.SUPPORT_EMAIL || comp.supportEmail || '',
          ContactPhone: (comp.ContactPhone || comp.CONTACT_PHONE || comp.contactPhone) 
            ? String(comp.ContactPhone || comp.CONTACT_PHONE || comp.contactPhone).replace(/\D/g, '').slice(-10) 
            : '',
          OfficeAddress: comp.OfficeAddress || comp.OFFICE_ADDRESS || comp.officeAddress || ''
        });
      }
      if (rts) setRights(rts);

      // Dynamically fetch and sync Default-Config from Central DB sheet
      crmApi.fetchDefaultConfig().then(cfg => {
        const cid = cfg?.GoogleClientId || cfg?.googleclientid;
        if (cid) setGoogleClientId(cid);
      }).catch(() => {});
    } catch (err) {
      console.warn('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    const cleanPhone = companySettings.ContactPhone ? String(companySettings.ContactPhone).replace(/\D/g, '') : '';
    if (cleanPhone.length > 0 && cleanPhone.length !== 10) {
      setMsg({ text: 'Helpdesk Contact Phone must be a valid 10-digit number.', type: 'error' });
      showError('Validation Error', 'Helpdesk Contact Phone must be a valid 10-digit number.');
      return;
    }
    setSaving(true);
    setMsg({ text: '', type: '' });
    try {
      const payload = {
        CompanyName: (companySettings.CompanyName || '').trim(),
        ArnNumber: (companySettings.ArnNumber || '').trim(),
        EuinNumber: (companySettings.EuinNumber || '').trim(),
        GSTIN: (companySettings.GSTIN || '').trim(),
        SupportEmail: (companySettings.SupportEmail || '').trim(),
        ContactPhone: cleanPhone,
        OfficeAddress: (companySettings.OfficeAddress || '').trim()
      };
      await crmApi.call('saveCompanySettings', payload);
      setMsg({ text: 'Company settings updated successfully!', type: 'success' });
      showSuccess('Company settings updated successfully!');

      // Publish event so Sidebar & Header update company name live
      crmApi.publishEvent({ type: 'DATA_CHANGED', module: 'Settings', companyName: payload.CompanyName });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('CRM_NAVBAR_REFRESH'));
      }
    } catch (err) {
      setMsg({ text: err.message || 'Failed to save settings', type: 'error' });
      showError(err.message || 'Failed to save settings');
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
    let clean = (gasUrl || '').trim();
    if (clean && !clean.endsWith('/exec')) {
      clean = clean.replace(/\/+$/, '') + '/exec';
      setGasUrl(clean);
    }
    crmApi.setBackendUrl(clean);
    setMsg({ text: 'Backend URL saved! Click "Test Connection" to verify.', type: 'success' });
  };

  const handleSaveGoogleClientId = async () => {
    crmApi.setGoogleClientId(googleClientId);
    try {
      await crmApi.saveDefaultConfig({ GoogleClientId: googleClientId });
      setMsg({ text: 'Google OAuth Client ID saved to Central DB & local storage! All browsers and incognito sessions will use it automatically.', type: 'success' });
    } catch {
      setMsg({ text: 'Google OAuth Client ID saved locally (will sync to Central DB when backend is connected).', type: 'info' });
    }
  };

  const testConnection = async () => {
    setPinging(true);
    setPingResult(null);
    try {
      let clean = (gasUrl || '').trim();
      if (clean && !clean.endsWith('/exec')) {
        clean = clean.replace(/\/+$/, '') + '/exec';
        setGasUrl(clean);
      }
      if (clean) {
        crmApi.setBackendUrl(clean);
      }
      const res = await crmApi.testConnection(clean);
      setPingResult({ 
        success: true, 
        message: `Connected successfully! Google Apps Script is active (${res.timestamp || new Date().toISOString()}).` 
      });
    } catch (err) {
      setPingResult({ 
        success: false, 
        message: `Connection failed: ${err.message}` 
      });
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

  const handleToggleShowDeleted = (val) => {
    crmApi.setShowDeletedGlobally(val);
    setShowDeletedGlobally(val);
    setMsg({
      text: val 
        ? 'Show Deleted Data ENABLED: All modules (Customers, Staff, etc.) will now display deleted records.' 
        : 'Show Deleted Data DISABLED: Only active records are displayed across modules.',
      type: 'info'
    });
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header 
        title="Settings" 
        subtitle="Manage company profile, user permissions & backend settings"
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
                    value={companySettings.CompanyName || ''}
                    onChange={(e) => setCompanySettings({ ...companySettings, CompanyName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">AMFI Registration Number (ARN)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="ARN-189241"
                    value={companySettings.ArnNumber || ''}
                    onChange={(e) => setCompanySettings({ ...companySettings, ArnNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Principal EUIN</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="E345678"
                    value={companySettings.EuinNumber || ''}
                    onChange={(e) => setCompanySettings({ ...companySettings, EuinNumber: e.target.value })}
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
                    value={companySettings.SupportEmail || ''}
                    onChange={(e) => setCompanySettings({ ...companySettings, SupportEmail: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>Helpdesk Contact Phone</label>
                    <span style={{ fontSize: '0.675rem', color: '#64748b' }}>
                      {companySettings.ContactPhone ? `${companySettings.ContactPhone.length}/10` : '0/10'}
                    </span>
                  </div>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="10-digit phone number (e.g. 9876543210)"
                    maxLength={10}
                    value={companySettings.ContactPhone || ''}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setCompanySettings({ ...companySettings, ContactPhone: digits });
                    }}
                  />
                  <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '4px' }}>
                    Standard 10-digit contact / helpline number. Only digits allowed (max 10).
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label className="form-label">Registered Office Address</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={companySettings.OfficeAddress || ''}
                  onChange={(e) => setCompanySettings({ ...companySettings, OfficeAddress: e.target.value })}
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

        {/* TAB 2: USER RIGHTS & PERMISSIONS */}
        {activeTab === 'rights' && (
          <RolesRights inline={true} />
        )}

        {/* TAB 4: BACKEND CONNECTION */}
        {activeTab === 'backend' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Show Deleted Data Globally Setting (Admin Only) */}
            {(user?.role === 'Admin' || user?.isSuperUser || user?.IsSuperUser || user?.email?.includes('admin')) && (
              <div className="crm-card" style={{ padding: '1.75rem', borderLeft: '4px solid #2563eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <ShieldCheck size={18} color="#2563eb" />
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                        Show Deleted Data Globally (Admin / SuperUser Only)
                      </h3>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, maxWidth: '650px' }}>
                      By default (unchecked), only active records are fetched. When checked, deleted / archived records will be displayed across ALL CRM modules (Customers, Staff, etc.) with archival timestamps and one-click restore.
                    </p>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', backgroundColor: '#eff6ff', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    <input
                      type="checkbox"
                      checked={showDeletedGlobally}
                      onChange={(e) => handleToggleShowDeleted(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: showDeletedGlobally ? '#1d4ed8' : '#475569' }}>
                      {showDeletedGlobally ? 'Active: Showing Deleted Data' : 'Default: Active Data Only'}
                    </span>
                  </label>
                </div>
              </div>
            )}

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
                Configured with Central Database ID <code>1XkkOqiowqdxJfvaEbCCBVc0P0XslhA9i</code> and Root Drive folder <code>1rVz2OnKPDHbXuq-ujsJg2R3vzYDwnzMU</code>.
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
                  padding: '1rem 1.25rem',
                  borderRadius: '8px',
                  fontSize: '0.825rem',
                  backgroundColor: pingResult.success ? '#dbeafe' : '#fee2e2',
                  color: pingResult.success ? '#1e40af' : '#b91c1c',
                  border: `1px solid ${pingResult.success ? '#93c5fd' : '#fca5a5'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <div style={{ fontWeight: '700' }}>
                    {pingResult.message}
                  </div>

                  {!pingResult.success && (
                    <div style={{ marginTop: '0.35rem', paddingTop: '0.5rem', borderTop: '1px solid #fca5a5', color: '#7f1d1d', lineHeight: 1.5 }}>
                      <strong>Why did this happen?</strong> Your Google Apps Script project is still running the old monolithic template code.
                      <ol style={{ margin: '0.35rem 0 0 1.25rem', padding: 0 }}>
                        <li>Open your Apps Script project editor (<a href="https://script.google.com/u/1/home/projects/1KcIl2YiyEa6JI68Dw5SUsmA-qRYS-P6_upTd4GL-Yij1plzfeAIYJn39/edit" title="Central_SaaS_SR_CRM_Backend - Project editor - Apps Script" target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>Click here</a>).</li>
                        <li><strong>Delete the 5 old HTML files:</strong> <code>Common.html</code>, <code>Customer.html</code>, <code>Employee.html</code>, <code>Index.html</code>, <code>Login.html</code> (click 3 dots on each &gt; Delete).</li>
                        <li><strong>Create 1 new HTML file:</strong> Click <strong>+ &gt; HTML</strong>, name it <code>Bridge</code> (without .html), and paste the content of <code>apps-script/Bridge.html</code>.</li>
                        <li><strong>Paste updated code:</strong> Replace each <code>.gs</code> file (<code>Code.gs</code>, <code>Common_Code.gs</code>, <code>Customer_Code.gs</code>, <code>Employee_Code.gs</code>, <code>Login_Code.gs</code>) with the code from the repository.</li>
                        <li><strong>Deploy New Version:</strong> Click <strong>Deploy &gt; Manage deployments &gt; Edit (pencil) &gt; Version: New version &gt; Deploy</strong>.</li>
                        <li>Then re-click <strong>Test Connection</strong> above to connect instantly!</li>
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Google OAuth 2.0 Web Client ID */}
            <div className="crm-card" style={{ padding: '1.75rem', marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  Google OAuth 2.0 Web Client ID (Google Sign-In Account Chooser)
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
                Required to trigger Google's native popup listing your browser's logged-in Google accounts on the Login page.
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="xxxxxxxxxxxx-xxxxxxxxxxxxxxxx.apps.googleusercontent.com"
                  value={googleClientId}
                  onChange={(e) => setGoogleClientId(e.target.value)}
                />
                <button className="btn btn-primary" onClick={handleSaveGoogleClientId}>
                  Save Client ID
                </button>
              </div>

              <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div>
                  Get this from <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>Google Cloud Console &gt; Credentials</a> (Type: Web application, Authorized JavaScript origin: <code>{typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}</code>).
                </div>
                <div style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ShieldCheck size={14} />
                  <span>Stored centrally in <strong>Central_SaaS_Master_DB &gt; Default-Config</strong> tab. Any changes made in the sheet or here automatically take effect across all browsers &amp; incognito windows without redeploying code.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
