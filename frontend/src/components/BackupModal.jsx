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
  FileArchive
} from 'lucide-react';
import { crmApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';

export default function BackupModal({ isOpen, onClose }) {
  const { user, hasPermission } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [fileName, setFileName] = useState('');
  const [copiedPath, setCopiedPath] = useState(false);

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
      const res = await crmApi.call('getDriveBackupsList');
      if (res && res.success) {
        setBackupsList(res.backups || []);
        if (res.driveFolderUrl) setDriveFolderUrl(res.driveFolderUrl);
        if (res.driveFolderPath) setDriveFolderPath(res.driveFolderPath);
        if (res.companyName) setCompanyName(res.companyName);
        if (res.tenantId) setTenantId(res.tenantId);
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

    try {
      const res = await crmApi.call('downloadDriveBackup');
      setFileName(res.fileName || `${companyName}_CRM_${tenantId}_Backup.zip`);
      setDownloadSuccess(true);
      if (res.backups) {
        setBackupsList(res.backups);
      } else {
        await loadExistingBackups();
      }
      if (res.driveFolderUrl) setDriveFolderUrl(res.driveFolderUrl);
      if (res.driveFolderPath) setDriveFolderPath(res.driveFolderPath);

      // Auto trigger browser download
      if (res.downloadUrl) {
        const link = document.createElement('a');
        link.href = res.downloadUrl;
        link.download = res.fileName || `${companyName}_CRM_${tenantId}_Backup.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      alert(err.message || 'Failed to prepare Drive backup.');
    } finally {
      setDownloading(false);
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
              backgroundColor: '#eff6ff',
              borderRadius: '12px',
              border: '1px solid #bfdbfe',
              marginBottom: '1.25rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FolderArchive size={26} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e40af', margin: 0 }}>
                  Complete Drive & Database Backup (.ZIP)
                </h4>
                <div style={{ fontSize: '0.775rem', color: '#1e3a8a', marginTop: '3px' }}>
                  Compresses all investor KYC files, staff directories, and Google Spreadsheet records into an encrypted ZIP file.
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
                    {driveFolderPath || `My Drive > SRInvestmentsCRM > org > ${tenantId}`}
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
              <ul style={{ fontSize: '0.785rem', color: '#334155', lineHeight: '1.6', margin: 0, paddingLeft: '1.25rem' }}>
                <li><strong>Customer Documents:</strong> <code>{prefixBase}_CustomerFiles/</code> (PAN, KYC, Folio scans)</li>
                <li><strong>Staff Photos & Records:</strong> <code>{prefixBase}_EmployeeFiles/</code></li>
                <li><strong>Relational DB Snapshot:</strong> <code>{prefixBase}_Database_Snapshot.json</code></li>
              </ul>
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
                                <a
                                  href={b.downloadUrl}
                                  download={b.name}
                                  className="btn btn-outline-blue btn-sm"
                                  style={{ fontSize: '0.7rem', padding: '2px 7px', textDecoration: 'none' }}
                                  title="Download ZIP"
                                >
                                  <Download size={11} />
                                </a>
                              )}
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

            {downloadSuccess && (
              <div style={{
                padding: '0.85rem 1rem',
                backgroundColor: '#dbeafe',
                border: '1px solid #93c5fd',
                borderRadius: '8px',
                color: '#1e40af',
                fontSize: '0.825rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                marginBottom: '1rem'
              }}>
                <CheckCircle size={18} color="#2563eb" />
                <div>
                  <div>New backup generated: <strong>{fileName}</strong></div>
                  <div style={{ fontSize: '0.75rem', color: '#1e3a8a', marginTop: '2px' }}>
                    Archive saved to Google Drive and retained under the 3-backup limit. Download started automatically.
                  </div>
                </div>
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
                <span>Compressing & Generating ZIP...</span>
              </>
            ) : (
              <>
                <Download size={15} />
                <span>Create New Backup (.ZIP)</span>
              </>
            )}
          </button>
        )}
      </div>
    </Modal>
  );
}

