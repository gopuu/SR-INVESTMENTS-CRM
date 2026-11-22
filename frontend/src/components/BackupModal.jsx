import React, { useState, useEffect } from 'react';
import { 
  Archive, 
  Download, 
  CheckCircle, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  FolderArchive, 
  Clock,
  ExternalLink,
  Copy,
  Check,
  HardDrive,
  RefreshCw,
  FileArchive,
  Mail,
  Send
} from 'lucide-react';
import { crmApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';

export default function BackupModal({ isOpen, onClose }) {
  const { user, isSuperAdmin, hasPermission } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [fileName, setFileName] = useState('');
  const [copiedPath, setCopiedPath] = useState(false);
  const [latestBackup, setLatestBackup] = useState(null);
  const [downloadedLocally, setDownloadedLocally] = useState(false);

  // Email delivery state
  const [companyEmail, setCompanyEmail] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [activeEmailTarget, setActiveEmailTarget] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null); // { success: boolean, message: string }
  const [emailStats, setEmailStats] = useState(null); // { emailCount, emailMaxLimit, remainingEmails, isLimitReached }

  // Drive folder & backups retention list state
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [backupsList, setBackupsList] = useState([]);
  const [driveFolderUrl, setDriveFolderUrl] = useState('');
  const [driveFolderPath, setDriveFolderPath] = useState('');
  const [companyName, setCompanyName] = useState('SR_Investments');
  const [tenantId, setTenantId] = useState('TEN001');

  const canBackup = user?.role === 'Admin' || hasPermission('DriveBackup', 'CanView');

  // Load existing backups whenever modal is opened
  const loadExistingBackups = async () => {
    if (!isOpen || !canBackup) return;
    try {
      setLoadingBackups(true);
      const res = await crmApi.call('getDriveBackupsList', {
        isSuperAdmin: Boolean(isSuperAdmin),
        tenantId: tenantId
      });
      if (res && res.success) {
        setBackupsList(res.backups || []);
        if (res.driveFolderUrl) setDriveFolderUrl(res.driveFolderUrl);
        if (res.driveFolderPath) setDriveFolderPath(res.driveFolderPath);
        if (res.companyName) setCompanyName(res.companyName);
        if (res.tenantId) setTenantId(res.tenantId);
        if (res.companyEmail) {
          setCompanyEmail(res.companyEmail);
          setRecipientEmail(prev => prev || res.companyEmail || user?.email || '');
        } else if (user?.email) {
          setRecipientEmail(prev => prev || user.email);
        }
        if (res.emailStats) {
          setEmailStats(res.emailStats);
        }
      }
    } catch (err) {
      console.warn('Failed to load drive backups list:', err);
    } finally {
      setLoadingBackups(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setDownloadSuccess(false);
      setLatestBackup(null);
      setDownloadedLocally(false);
      setShowEmailForm(false);
      setEmailStatus(null);
      setActiveEmailTarget(null);
      setFileName('');
      loadExistingBackups();
    }
  }, [isOpen]);

  const triggerBackup = async () => {
    if (!canBackup) {
      alert('Access Denied: You do not have permission to download system backups.');
      return;
    }

    setDownloading(true);
    setDownloadSuccess(false);
    setLatestBackup(null);
    setDownloadedLocally(false);
    setShowEmailForm(false);
    setEmailStatus(null);

    try {
      const res = await crmApi.call('downloadDriveBackup', { 
        userEmail: user?.email,
        isSuperAdmin: Boolean(isSuperAdmin),
        tenantId: tenantId
      });
      const currentFileName = res.fileName || (isSuperAdmin ? `SR_Investments_CRM_ROOT_Backup.zip` : `${companyName}_CRM_${tenantId}_Backup.zip`);
      setFileName(currentFileName);
      setLatestBackup(res);
      setDownloadSuccess(true);

      // Auto-trigger direct download to device
      if (res.downloadUrl) {
        handleDownloadFile(res);
      }

      if (res.companyEmail) {
        setCompanyEmail(res.companyEmail);
        setRecipientEmail(res.companyEmail);
      } else if (user?.email) {
        setRecipientEmail(user.email);
      }

      if (res.emailStats) {
        setEmailStats(res.emailStats);
      }

      if (res.backups) {
        setBackupsList(res.backups);
      } else {
        await loadExistingBackups();
      }
      if (res.driveFolderUrl) setDriveFolderUrl(res.driveFolderUrl);
      if (res.driveFolderPath) setDriveFolderPath(res.driveFolderPath);
    } catch (err) {
      alert(err.message || 'Failed to prepare Drive backup.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadFile = (backupItem) => {
    const item = backupItem || latestBackup;
    if (!item?.downloadUrl) {
      alert('Download link is not available for this archive.');
      return;
    }
    const link = document.createElement('a');
    link.href = item.downloadUrl;
    link.download = item.fileName || item.name || `${companyName}_CRM_${tenantId}_Backup.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadedLocally(true);
  };

  const handleSendEmail = async (targetItem) => {
    const item = targetItem || activeEmailTarget || latestBackup;
    const emailToUse = (recipientEmail || companyEmail || user?.email || '').trim();
    if (!emailToUse) {
      alert('Please enter a valid recipient email address.');
      return;
    }

    if (emailStats?.isLimitReached) {
      alert(`Daily email limit reached (${emailStats.emailCount}/${emailStats.emailMaxLimit} emails sent today). Please opt for manual download or try again after 24 hours.`);
      return;
    }

    setSendingEmail(true);
    setEmailStatus(null);
    try {
      const res = await crmApi.call('sendBackupToEmail', {
        fileId: item?.fileId || item?.id,
        recipientEmail: emailToUse,
        tenantId: tenantId,
        isSuperAdmin: Boolean(isSuperAdmin)
      });
      setEmailStatus({
        success: true,
        message: res.message || `Backup sent successfully to ${emailToUse}`
      });
      if (res.emailCount !== undefined && res.emailMaxLimit !== undefined) {
        setEmailStats({
          emailCount: res.emailCount,
          emailMaxLimit: res.emailMaxLimit,
          remainingEmails: res.remainingEmails,
          isLimitReached: res.emailCount >= res.emailMaxLimit
        });
      }
    } catch (err) {
      const errMsg = err?.message || 'Failed to send backup email.';
      setEmailStatus({
        success: false,
        message: errMsg
      });
      if (errMsg.toLowerCase().includes('limit reached')) {
        setEmailStats(prev => ({
          ...(prev || {}),
          isLimitReached: true
        }));
      }
    } finally {
      setSendingEmail(false);
    }
  };

  const handleCopyPath = () => {
    const textToCopy = driveFolderPath || `My Drive > SRInvestmentsCRM > org > ${tenantId}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  const prefixBase = `${companyName}_CRM_${tenantId}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Google Drive Full Data Backup"
      maxWidth="680px"
    >
      <div className="modal-body">
        {/* Permission Check Header */}
        {!canBackup ? (
          <div style={{
            padding: '1.25rem',
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '10px',
            color: '#b91c1c',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <ShieldAlert size={28} />
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem' }}>Access Restricted</strong>
              <span style={{ fontSize: '0.785rem' }}>
                Your assigned role ({user?.role || 'Staff'}) does not have permission to download company drive backups. Please contact your CRM Administrator.
              </span>
            </div>
          </div>
        ) : (
          <div>
            {/* Header info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1.25rem',
              backgroundColor: isSuperAdmin ? '#eff6ff' : '#eff6ff',
              borderRadius: '12px',
              border: isSuperAdmin ? '1.5px solid #93c5fd' : '1px solid #bfdbfe',
              marginBottom: '1.25rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                backgroundColor: isSuperAdmin ? '#1d4ed8' : '#2563eb',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FolderArchive size={26} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e40af', margin: 0 }}>
                    {isSuperAdmin ? 'SuperAdmin Platform Root Backup (.ZIP)' : 'Complete Drive & Database Backup (.ZIP)'}
                  </h4>
                  {isSuperAdmin && (
                    <span className="badge" style={{ backgroundColor: '#dbeafe', color: '#1e40af', fontSize: '0.65rem', fontWeight: '700' }}>
                      Entire CRM Root
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.775rem', color: '#1e3a8a', marginTop: '3px' }}>
                  {isSuperAdmin 
                    ? 'Generates a full backup ZIP of the entire CRM root folder (all tenant workspaces, templates, spreadsheets, files, and central registers).'
                    : 'Compresses all investor KYC files, staff directories, and Google Spreadsheet records into an encrypted ZIP file.'}
                </div>
              </div>
            </div>

            {/* Google Drive Location Path Box */}
            <div style={{
              padding: '0.85rem 1rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '220px' }}>
                <HardDrive size={18} color="#2563eb" />
                <div>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '700' }}>
                    Google Drive Location Path
                  </div>
                  <div style={{ fontSize: '0.825rem', fontWeight: '600', color: '#0f172a', fontFamily: 'monospace' }}>
                    {driveFolderPath || (isSuperAdmin ? 'My Drive > SRInvestmentsCRM' : `My Drive > SRInvestmentsCRM > org > ${tenantId}`)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleCopyPath}
                  style={{ fontSize: '0.725rem', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  title="Copy Drive Path"
                >
                  {copiedPath ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                  <span>{copiedPath ? 'Copied' : 'Copy Path'}</span>
                </button>
                {driveFolderUrl && (
                  <a
                    href={driveFolderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-blue btn-sm"
                    style={{ fontSize: '0.725rem', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                  >
                    <ExternalLink size={12} />
                    <span>Open in Drive</span>
                  </a>
                )}
              </div>
            </div>

            {/* Backup Contents Info */}
            <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#475569', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
                Zip Package Structure:
              </div>
              {isSuperAdmin ? (
                <ul style={{ fontSize: '0.785rem', color: '#334155', lineHeight: '1.6', margin: 0, paddingLeft: '1.25rem' }}>
                  <li><strong>All Client Workspaces & Organizations:</strong> <code>SRInvestmentsCRM/org/</code> (Contains every client tenant directory)</li>
                  <li><strong>Global Document Vaults:</strong> <code>SRInvestmentsCRM/CustomerFiles/</code>, <code>SRInvestmentsCRM/EmployeeFiles/</code></li>
                  <li><strong>Central Databases:</strong> <code>Central_SaaS_Master_DB</code>, <code>_CRM_DATABASE_TEMPLATE</code>, <code>DevAppTracker</code></li>
                  <li><strong>Master Relational Snapshot:</strong> <code>SRInvestmentsCRM/Central_DB_Master_Snapshot.json</code></li>
                </ul>
              ) : (
                <ul style={{ fontSize: '0.785rem', color: '#334155', lineHeight: '1.6', margin: 0, paddingLeft: '1.25rem' }}>
                  <li><strong>Customer Documents:</strong> <code>{prefixBase}_CustomerFiles/</code> (PAN, KYC, Folio scans)</li>
                  <li><strong>Staff Photos & Records:</strong> <code>{prefixBase}_EmployeeFiles/</code></li>
                  <li><strong>Relational DB Snapshot:</strong> <code>{prefixBase}_Database_Snapshot.json</code></li>
                </ul>
              )}
            </div>

            {/* Retention Notice & Existing Backups List */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.785rem', fontWeight: '700', textTransform: 'uppercase', color: '#475569', letterSpacing: '0.05em' }}>
                  Drive Backups (Max 3: Current + Last 2 Backups)
                </div>
                <button
                  type="button"
                  className="btn-icon"
                  onClick={loadExistingBackups}
                  disabled={loadingBackups}
                  title="Refresh Backups List"
                  style={{ width: '26px', height: '26px' }}
                >
                  <RefreshCw size={13} className={loadingBackups ? 'spin-animation' : ''} />
                </button>
              </div>

              {loadingBackups ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b', fontSize: '0.8rem' }}>
                  <RefreshCw size={18} className="spin-animation" style={{ margin: '0 auto 0.4rem' }} />
                  Checking existing backups on Google Drive...
                </div>
              ) : backupsList.length === 0 ? (
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#ffffff',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '8px',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontSize: '0.8rem'
                }}>
                  No backup archives currently stored in this tenant's Drive folder. Click "Create New Backup" below.
                </div>
              ) : (
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <table className="crm-table" style={{ margin: 0, fontSize: '0.785rem' }}>
                    <thead style={{ backgroundColor: '#f8fafc' }}>
                      <tr>
                        <th style={{ padding: '8px 12px' }}>Backup Archive</th>
                        <th style={{ padding: '8px 12px' }}>Created Date & Time</th>
                        <th style={{ padding: '8px 12px' }}>Size</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backupsList.map((b, idx) => (
                        <tr key={b.id || b.name} style={{ backgroundColor: idx === 0 ? '#f0fdf4' : '#ffffff' }}>
                          <td style={{ padding: '8px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <FileArchive size={14} color={idx === 0 ? '#16a34a' : '#2563eb'} />
                              <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{b.name}</strong>
                              {idx === 0 && (
                                <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#15803d', fontSize: '0.65rem' }}>
                                  Current / Latest
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '8px 12px', color: '#64748b' }}>
                            {b.createdDate ? new Date(b.createdDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                          </td>
                          <td style={{ padding: '8px 12px', color: '#475569', fontWeight: '500' }}>
                            {b.sizeFormatted || '—'}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                              {b.downloadUrl && (
                                <button
                                  type="button"
                                  onClick={() => handleDownloadFile(b)}
                                  className="btn btn-outline-blue btn-sm"
                                  style={{ fontSize: '0.7rem', padding: '2px 7px' }}
                                  title="Download ZIP"
                                >
                                  <Download size={11} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveEmailTarget(b);
                                  setShowEmailForm(true);
                                  setEmailStatus(null);
                                }}
                                className="btn btn-outline-blue btn-sm"
                                style={{ fontSize: '0.7rem', padding: '2px 7px', opacity: emailStats?.isLimitReached ? 0.5 : 1 }}
                                title={emailStats?.isLimitReached ? "Daily email limit reached. Please opt for manual download or try again after 24 hours." : "Send Archive to Company Email"}
                                disabled={emailStats?.isLimitReached}
                              >
                                <Mail size={11} />
                              </button>
                              {b.viewUrl && (
                                <a
                                  href={b.viewUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-secondary btn-sm"
                                  style={{ fontSize: '0.7rem', padding: '2px 7px', textDecoration: 'none' }}
                                  title="View in Google Drive"
                                >
                                  <ExternalLink size={11} />
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '6px' }}>
                ℹ️ <strong>Retention Rule:</strong> The CRM strictly retains Current + Last 2 backups (Max 3). On creating a new backup, the oldest backup is automatically pruned to save storage space.
              </div>
            </div>

            {/* Post-Backup Generation Delivery Choice: Download or Send to Company Email */}
            {downloadSuccess && latestBackup && (
              <div style={{
                padding: '1.15rem',
                backgroundColor: '#f0fdf4',
                border: '1.5px solid #86efac',
                borderRadius: '10px',
                marginBottom: '1rem',
                boxShadow: '0 2px 6px rgba(22, 163, 74, 0.08)'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <CheckCircle2 size={24} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                      <strong style={{ fontSize: '0.925rem', color: '#15803d' }}>
                        Backup Archive Generated Successfully!
                      </strong>
                      <span style={{ fontSize: '0.725rem', fontWeight: '700', padding: '2px 8px', borderRadius: '12px', backgroundColor: '#dcfce7', color: '#166534' }}>
                        {latestBackup.sizeFormatted || 'Ready'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#334155', fontFamily: 'monospace', marginTop: '4px', wordBreak: 'break-all' }}>
                      {latestBackup.fileName}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '3px' }}>
                      Archive stored in your tenant Google Drive. Select delivery method below:
                    </div>

                    {/* Action Choice Buttons */}
                    <div style={{ marginTop: '0.85rem', display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleDownloadFile(latestBackup)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 14px', fontSize: '0.8rem' }}
                      >
                        <Download size={13} />
                        <span>Download (.ZIP) to Device</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline-blue btn-sm"
                        onClick={() => {
                          setActiveEmailTarget(latestBackup);
                          setShowEmailForm(true);
                          setEmailStatus(null);
                        }}
                        disabled={emailStats?.isLimitReached}
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '5px', 
                          padding: '6px 14px', 
                          fontSize: '0.8rem',
                          opacity: emailStats?.isLimitReached ? 0.6 : 1
                        }}
                        title={emailStats?.isLimitReached ? "Daily email limit reached. Please opt for manual download or try again after 24 hours." : "Send to Company Email"}
                      >
                        <Mail size={13} />
                        <span>Send to Company Email</span>
                        {emailStats?.isLimitReached && <span style={{ fontSize: '0.65rem', color: '#b91c1c' }}>(Limit Reached)</span>}
                      </button>
                    </div>

                    {/* Limit Reached Warning Notice */}
                    {emailStats?.isLimitReached && (
                      <div style={{
                        marginTop: '0.85rem',
                        padding: '0.65rem 0.85rem',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fca5a5',
                        borderRadius: '8px',
                        color: '#991b1b',
                        fontSize: '0.785rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
                        <div>
                          <div><strong>Daily Email Limit Reached ({emailStats.emailCount}/{emailStats.emailMaxLimit} emails sent today):</strong></div>
                          <div style={{ fontSize: '0.725rem', color: '#b91c1c', marginTop: '2px' }}>
                            Email dispatch quota reached in central tracker. Please opt for manual download or try again after 24 hours.
                          </div>
                        </div>
                      </div>
                    )}

                    {downloadedLocally && (
                      <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={13} />
                        <span>Backup package downloaded to your device.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Send to Company Email Form / Modal Strip */}
            {showEmailForm && (
              <div style={{
                padding: '1rem 1.15rem',
                backgroundColor: '#eff6ff',
                border: '1.5px solid #93c5fd',
                borderRadius: '10px',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={16} color="#2563eb" />
                    <strong style={{ fontSize: '0.85rem', color: '#1e40af' }}>
                      Send Backup to Company Email
                    </strong>
                  </div>
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => { setShowEmailForm(false); setEmailStatus(null); }}
                    style={{ width: '22px', height: '22px', fontSize: '11px' }}
                    title="Close"
                  >
                    ✕
                  </button>
                </div>

                <div style={{ fontSize: '0.775rem', color: '#334155', marginBottom: '0.5rem' }}>
                  Target Archive: <strong style={{ fontFamily: 'monospace' }}>{(activeEmailTarget || latestBackup)?.fileName || (activeEmailTarget || latestBackup)?.name}</strong>
                  {' '}({(activeEmailTarget || latestBackup)?.sizeFormatted})
                </div>

                {/* Dispatch Tracker Daily Limit Info */}
                {emailStats && (
                  <div style={{
                    fontSize: '0.735rem',
                    color: emailStats.isLimitReached ? '#dc2626' : '#1e40af',
                    fontWeight: '600',
                    marginBottom: '0.65rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    <span>📊 Central Dispatch Tracker: <strong>{emailStats.emailCount} / {emailStats.emailMaxLimit}</strong> emails sent today {emailStats.isLimitReached ? '(Limit reached - Resets in 24 hrs)' : `(${emailStats.remainingEmails} remaining)`}</span>
                  </div>
                )}

                {/* Email Delivery Mode Notice */}
                {emailStats?.isLimitReached ? (
                  <div style={{
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fca5a5',
                    borderRadius: '6px',
                    color: '#991b1b',
                    fontSize: '0.75rem',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <AlertCircle size={15} color="#dc2626" style={{ flexShrink: 0 }} />
                    <span>
                      <strong>Daily Email Limit Reached ({emailStats.emailCount}/{emailStats.emailMaxLimit}):</strong> Please opt for manual download or try again after 24 hours.
                    </span>
                  </div>
                ) : (activeEmailTarget || latestBackup)?.isLarge ? (
                  <div style={{
                    padding: '0.6rem 0.75rem',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: '6px',
                    color: '#92400e',
                    fontSize: '0.75rem',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <AlertCircle size={15} color="#d97706" style={{ flexShrink: 0 }} />
                    <span>
                      <strong>Large Archive (&gt;20MB):</strong> Delivered to company email via secure Google Drive link &amp; location path to avoid email attachment limits.
                    </span>
                  </div>
                ) : (
                  <div style={{
                    padding: '0.6rem 0.75rem',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '6px',
                    color: '#166534',
                    fontSize: '0.75rem',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <CheckCircle2 size={15} color="#16a34a" style={{ flexShrink: 0 }} />
                    <span>
                      Package size is {(activeEmailTarget || latestBackup)?.sizeFormatted || 'standard'}. Will be attached directly as a <strong>.ZIP file</strong> to the email (+ Google Drive link included).
                    </span>
                  </div>
                )}

                {/* Recipient Email Input & Dispatch */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="Enter recipient company email..."
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    disabled={emailStats?.isLimitReached}
                    style={{ flex: 1, fontSize: '0.8125rem', padding: '6px 10px' }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleSendEmail(activeEmailTarget || latestBackup)}
                    disabled={sendingEmail || !recipientEmail || emailStats?.isLimitReached}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', padding: '6px 14px', whiteSpace: 'nowrap' }}
                  >
                    {sendingEmail ? (
                      <>
                        <RefreshCw size={13} className="spin-animation" />
                        <span>Sending...</span>
                      </>
                    ) : emailStats?.isLimitReached ? (
                      <span>Limit Reached (24h)</span>
                    ) : (
                      <>
                        <Send size={13} />
                        <span>Send Email</span>
                      </>
                    )}
                  </button>
                </div>

                {emailStatus && (
                  <div style={{
                    marginTop: '0.65rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    backgroundColor: emailStatus.success ? '#dcfce7' : '#fee2e2',
                    color: emailStatus.success ? '#15803d' : '#b91c1c',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {emailStatus.success ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    <span>{emailStatus.message}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
        {canBackup && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={triggerBackup}
            disabled={downloading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            {downloading ? (
              <>
                <RefreshCw size={15} className="spin-animation" />
                <span>{isSuperAdmin ? 'Compressing Root Folder & Generating ZIP...' : 'Compressing & Generating ZIP...'}</span>
              </>
            ) : (
              <>
                <Download size={15} />
                <span>{isSuperAdmin ? 'Generate & Download Root Backup (.ZIP)' : 'Create & Download Backup (.ZIP)'}</span>
              </>
            )}
          </button>
        )}
      </div>
    </Modal>
  );
}

