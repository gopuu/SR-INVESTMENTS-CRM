import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Database, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle,
  ExternalLink,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { crmApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

export default function Settings() {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('company');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Company Settings State
  const [companySettings, setCompanySettings] = useState({
    COMPANY_NAME: 'SR INVESTMENTS',
    ARN_NUMBER: 'ARN-189241',
    EUIN_NUMBER: 'E345678',
    GSTIN: '27AAACR1234F1Z5',
    SUPPORT_EMAIL: 'support@srinvestments.com',
    CONTACT_PHONE: '+91 98765 43210',
    OFFICE_ADDRESS: '101, Fortune Hub, Financial District, Bandra-Kurla Complex, Mumbai 400051'
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
      setMsg({ text: 'Company information updated successfully!', type: 'success' });
    } catch (err) {
      setMsg({ text: err.message || 'Failed to save company settings', type: 'error' });
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
        ? 'Switched to Local Storage Demo mode. All changes stay in browser.' 
        : 'Switched to Live Google Apps Script mode. Make sure your GAS URL is set.',
      type: 'info'
    });
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header 
        title="CRM Settings & Configurations" 
        subtitle="Manage company profile, role-based user rights & Google Sheets backend"
        onRefresh={loadSettings}
        refreshing={loading}
      />

      <div className="page-wrapper">
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setActiveTab('company')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'transparent',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: activeTab === 'company' ? '#059669' : '#64748b',
              borderBottom: activeTab === 'company' ? '2px solid #059669' : '2px solid transparent',
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
              color: activeTab === 'rights' ? '#059669' : '#64748b',
              borderBottom: activeTab === 'rights' ? '2px solid #059669' : '2px solid transparent',
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
              color: activeTab === 'backend' ? '#059669' : '#64748b',
              borderBottom: activeTab === 'backend' ? '2px solid #059669' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Database size={16} /> Google Apps Script / Drive Connection
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
            backgroundColor: msg.type === 'success' ? '#dcfce7' : (msg.type === 'error' ? '#fee2e2' : '#e0f2fe'),
            color: msg.type === 'success' ? '#15803d' : (msg.type === 'error' ? '#b91c1c' : '#0369a1'),
            border: `1px solid ${msg.type === 'success' ? '#86efac' : (msg.type === 'error' ? '#fca5a5' : '#7dd3fc')}`
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

        {/* TAB 2: USER RIGHTS & PERMISSIONS */}
        {activeTab === 'rights' && (
          <div className="crm-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  Role-Based Access Control (RBAC) Matrix
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0 0' }}>
                  Control view, create, edit, and delete permissions for each role across CRM modules.
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
                            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#059669' }}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={Boolean(r.CanCreate)}
                            onChange={() => toggleRight(i, 'CanCreate')}
                            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#059669' }}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={Boolean(r.CanEdit)}
                            onChange={() => toggleRight(i, 'CanEdit')}
                            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#059669' }}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={Boolean(r.CanDelete)}
                            onChange={() => toggleRight(i, 'CanDelete')}
                            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#059669' }}
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

        {/* TAB 3: BACKEND CONNECTION */}
        {activeTab === 'backend' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Mode Switch Card */}
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
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isDemoMode ? '#ffffff' : '#10b981' }}></span>
                  Local Storage Demo Mode (Instant, Offline Ready)
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

            {/* GAS URL Config Card */}
            <div className="crm-card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>
                Google Apps Script Web App Deployment URL
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
                Paste the <code>/exec</code> URL generated when you deploy the script in <code>apps-script/Code.gs</code> as a Web App.
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
                  backgroundColor: pingResult.success ? '#dcfce7' : '#fee2e2',
                  color: pingResult.success ? '#15803d' : '#b91c1c',
                  border: `1px solid ${pingResult.success ? '#86efac' : '#fca5a5'}`
                }}>
                  {pingResult.message}
                </div>
              )}
            </div>

            {/* Step-by-Step Architecture Guide Card */}
            <div className="crm-card" style={{ padding: '1.75rem', backgroundColor: '#f8fafc' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.75rem' }}>
                Setup Guide: Google Sheets + Drive + GitHub Pages
              </h4>

              <ol style={{ fontSize: '0.825rem', color: '#475569', lineHeight: '1.7', paddingLeft: '1.25rem' }}>
                <li><strong>Create Google Sheet:</strong> Create a new Google Spreadsheet (e.g. <code>SR Investments CRM DB</code>) and copy the Spreadsheet ID from the URL.</li>
                <li><strong>Paste Spreadsheet ID:</strong> In <code>apps-script/Code.gs</code>, replace <code>CONFIG.SPREADSHEET_ID</code> with your copied ID.</li>
                <li><strong>Create Apps Script:</strong> Open <a href="https://script.google.com" target="_blank" rel="noreferrer" style={{ color: '#059669', fontWeight: '600' }}>script.google.com</a>, create a project, and add <code>Code.gs</code>, <code>Bridge.html</code>, and <code>appsscript.json</code>.</li>
                <li><strong>Run Setup:</strong> In Apps Script editor, run <code>setupCRM()</code> once to automatically create all sheets (Users, Customers, Employees, CompanySettings, RolesRights, AuditLogs) and Google Drive folders!</li>
                <li><strong>Deploy Web App:</strong> Click <em>Deploy → New deployment → Web app</em>. Set <em>Execute as: Me</em>, <em>Who has access: Anyone</em>, then copy the <code>/exec</code> URL and paste it above.</li>
                <li><strong>Deploy to GitHub Pages:</strong> Run <code>npm run build</code> in the frontend folder, and publish the <code>dist/</code> folder to GitHub Pages!</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

