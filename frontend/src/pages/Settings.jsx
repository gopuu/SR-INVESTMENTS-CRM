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
  Download,
  History,
  FileSpreadsheet,
  FileCode,
  Search,
  RotateCcw
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

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditModuleFilter, setAuditModuleFilter] = useState('all');
  const [auditActionFilter, setAuditActionFilter] = useState('all');

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
  const [showDeletedGlobally, setShowDeletedGlobally] = useState(() => crmApi.getShowDeletedGlobally());
  const [pingResult, setPingResult] = useState(null);
  const [pinging, setPinging] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (activeTab === 'audit') {
      loadAuditLogs();
    }
  }, [activeTab, auditModuleFilter]);

  const loadAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const logs = await crmApi.call('getAuditLogs', {
        module: auditModuleFilter,
        search: auditSearch
      });
      setAuditLogs(logs || []);
    } catch (err) {
      console.warn('Failed to load audit logs:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  const exportAuditExcel = () => {
    if (!auditLogs.length) return alert('No audit records to export.');
    const dateTag = new Date().toISOString().slice(0, 10);
    const meta = [
      '# SEBI COMPLIANCE AUDIT TRAIL & MASTER CRUD ACTIVITY REGISTER',
      `# Entity: SR INVESTMENTS | AMFI Registration No: ARN-189241 | Principal EUIN: E345678`,
      `# Report Generated: ${new Date().toLocaleString()} IST | Total Audited Records: ${auditLogs.length}`,
      ''
    ].join('\n');

    const headers = ['Audit Log ID', 'Timestamp (IST)', 'User Email', 'Action', 'Module / Master', 'Record Reference', 'Change Description'];
    const rows = auditLogs.map(r => [
      r.LogId,
      new Date(r.Timestamp).toLocaleString() + ' IST',
      r.UserEmail,
      r.Action,
      r.Module,
      r.RecordId,
      r.Details
    ].map(val => `"${String(val || '').replace(/"/g, '""')}"`).join('\t'));

    const content = '\uFEFF' + meta + '\n' + headers.join('\t') + '\n' + rows.join('\n');
    const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SEBI_Audit_Trail_${dateTag}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportAuditJSON = () => {
    if (!auditLogs.length) return alert('No audit records to export.');
    const dateTag = new Date().toISOString().slice(0, 10);
    const blob = new Blob([JSON.stringify({ entity: 'SR INVESTMENTS', arn: 'ARN-189241', logs: auditLogs }, null, 2)], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SEBI_Audit_Trail_${dateTag}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
      setMsg({ text: 'Company settings updated successfully!', type: 'success' });
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

  const handleToggleShowDeleted = (val) => {
    crmApi.setShowDeletedGlobally(val);
    setShowDeletedGlobally(val);
    setMsg({
      text: val 
        ? 'Show Deleted Data ENABLED: All modules (Customers, Staff, etc.) will now display soft-deleted records.' 
        : 'Show Deleted Data DISABLED: Only active records are displayed across modules.',
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

          <button
            onClick={() => setActiveTab('audit')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'transparent',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: activeTab === 'audit' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'audit' ? '2px solid #2563eb' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <History size={16} /> SEBI Audit Trail & Logs
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

        {/* TAB 2: USER RIGHTS & PERMISSIONS */}
        {activeTab === 'rights' && (
          <div className="crm-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  Role-Based Access Control (RBAC) Matrix
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0 0' }}>
                  Manage View, Create, Edit, and Delete privileges per staff role, including Drive Backup access.
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
                      By default (unchecked), only active records are fetched. When checked, soft-deleted / archived records will be displayed across ALL CRM modules (Customers, Staff, etc.) with archival timestamps and one-click restore.
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
                        <li>Open your Apps Script project editor (<a href="https://script.google.com/home/projects/1lTQsf7yYtnp4HTI_MwVWqrSVQKtLoFZLXpjjEVSQnTxPzLhp6WC2SSOW/edit" target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>Click here</a>).</li>
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
          </div>
        )}

        {/* TAB 5: SEBI COMPLIANCE AUDIT TRAIL & LOGS */}
        {activeTab === 'audit' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="crm-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <History size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                      SEBI Compliance Audit Trail & Master CRUD Register
                    </h3>
                    <div style={{ fontSize: '0.785rem', color: '#64748b', marginTop: '2px' }}>
                      Audited non-repudiation log of all CREATE, UPDATE, SOFT_DELETE & RESTORE operations across masters.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-outline-blue btn-sm" onClick={exportAuditExcel} title="Export audit trail to Excel">
                    <FileSpreadsheet size={14} /> Excel
                  </button>
                  <button className="btn btn-outline-blue btn-sm" onClick={exportAuditJSON} title="Export audit trail to JSON">
                    <FileCode size={14} /> JSON
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={loadAuditLogs} title="Refresh audit log entries">
                    <RefreshCw size={14} className={auditLoading ? 'spin-animation' : ''} /> Refresh
                  </button>
                </div>
              </div>

              {/* Filters toolbar */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '380px' }}>
                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    className="form-input"
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    placeholder="Search by user, record code, or description..."
                    style={{ paddingLeft: '32px', height: '36px', fontSize: '0.825rem' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Master:</span>
                  <select
                    className="form-select"
                    value={auditModuleFilter}
                    onChange={(e) => setAuditModuleFilter(e.target.value)}
                    style={{ height: '36px', fontSize: '0.8rem', width: 'auto' }}
                  >
                    <option value="all">All Masters</option>
                    <option value="Customers">Customers</option>
                    <option value="Staff">Staff</option>
                    <option value="Settings">Settings</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Action:</span>
                  <select
                    className="form-select"
                    value={auditActionFilter}
                    onChange={(e) => setAuditActionFilter(e.target.value)}
                    style={{ height: '36px', fontSize: '0.8rem', width: 'auto' }}
                  >
                    <option value="all">All Actions</option>
                    <option value="CREATE">CREATE</option>
                    <option value="UPDATE">UPDATE</option>
                    <option value="SOFT_DELETE">SOFT_DELETE</option>
                    <option value="RESTORE">RESTORE</option>
                  </select>
                </div>
              </div>

              {/* Audit Table */}
              <div className="table-responsive">
                <table className="crm-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>Audit Log ID</th>
                      <th>Timestamp (IST)</th>
                      <th>Performer / User</th>
                      <th>Action</th>
                      <th>Master Module</th>
                      <th>Record Reference</th>
                      <th>Change Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLoading ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                          Loading SEBI compliance audit trail...
                        </td>
                      </tr>
                    ) : auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                          No audit entries match the selected filters.
                        </td>
                      </tr>
                    ) : (
                      auditLogs
                        .filter(l => auditActionFilter === 'all' || l.Action === auditActionFilter)
                        .filter(l => !auditSearch || (
                          (l.UserEmail && l.UserEmail.toLowerCase().includes(auditSearch.toLowerCase())) ||
                          (l.RecordId && l.RecordId.toLowerCase().includes(auditSearch.toLowerCase())) ||
                          (l.Details && l.Details.toLowerCase().includes(auditSearch.toLowerCase()))
                        ))
                        .map((l) => (
                          <tr key={l.LogId}>
                            <td>
                              <code style={{ fontFamily: 'monospace', fontSize: '0.72rem', backgroundColor: '#f1f5f9', padding: '2px 5px', borderRadius: '4px' }}>
                                {l.LogId}
                              </code>
                            </td>
                            <td>
                              <div style={{ fontWeight: '500' }}>
                                {new Date(l.Timestamp).toLocaleDateString()}
                              </div>
                              <div style={{ fontSize: '0.675rem', color: '#64748b' }}>
                                {new Date(l.Timestamp).toLocaleTimeString()} IST
                              </div>
                            </td>
                            <td>
                              <strong style={{ color: '#0f172a' }}>{l.UserEmail}</strong>
                            </td>
                            <td>
                              <span className="badge" style={{
                                backgroundColor: l.Action === 'CREATE' ? '#dbeafe' : (l.Action === 'SOFT_DELETE' ? '#fee2e2' : (l.Action === 'RESTORE' ? '#f3e8ff' : '#eff6ff')),
                                color: l.Action === 'CREATE' ? '#1e40af' : (l.Action === 'SOFT_DELETE' ? '#b91c1c' : (l.Action === 'RESTORE' ? '#7e22ce' : '#2563eb')),
                                fontSize: '0.675rem',
                                fontWeight: '700'
                              }}>
                                {l.Action}
                              </span>
                            </td>
                            <td>
                              <span className="badge badge-info" style={{ fontSize: '0.675rem' }}>
                                {l.Module}
                              </span>
                            </td>
                            <td>
                              <strong style={{ color: '#2563eb', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                {l.RecordId || '—'}
                              </strong>
                            </td>
                            <td>
                              <span style={{ color: '#334155' }}>
                                {l.Details}
                              </span>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
