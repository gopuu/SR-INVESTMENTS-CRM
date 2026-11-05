import React, { useState } from 'react';
import { 
  Archive, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  ShieldAlert, 
  ShieldCheck, 
  FolderArchive, 
  FileSpreadsheet,
  Clock,
  Layers
} from 'lucide-react';
import { crmApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';

export default function BackupModal({ isOpen, onClose }) {
  const { user, hasPermission } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [fileName, setFileName] = useState('');

  const canBackup = user?.role === 'Admin' || hasPermission('DriveBackup', 'CanView');

  const triggerBackup = async () => {
    if (!canBackup) {
      alert('Access Denied: You do not have permission to download system backups.');
      return;
    }

    setDownloading(true);
    setDownloadSuccess(false);

    try {
      const res = await crmApi.call('downloadDriveBackup');
      setDownloadUrl(res.downloadUrl);
      setFileName(res.fileName || 'SR_Investments_Drive_Backup.zip');
      setDownloadSuccess(true);

      // Auto trigger browser download
      const link = document.createElement('a');
      link.href = res.downloadUrl;
      link.download = res.fileName || 'SR_Investments_Drive_Backup.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert(err.message || 'Failed to prepare Drive backup.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Google Drive Full Data Backup"
      maxWidth="580px"
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
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1.25rem',
              backgroundColor: '#eff6ff',
              borderRadius: '12px',
              border: '1px solid #bfdbfe',
              marginBottom: '1.5rem'
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
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e40af', margin: 0 }}>
                  Complete Drive & Database Backup (.ZIP)
                </h4>
                <div style={{ fontSize: '0.775rem', color: '#1e3a8a', marginTop: '3px' }}>
                  Compresses all investor KYC files, staff directories, and Google Spreadsheet records into an encrypted ZIP file.
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: '#475569', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                Backup Package Contents:
              </div>
              <ul style={{ fontSize: '0.825rem', color: '#334155', lineHeight: '1.7', paddingLeft: '1.25rem' }}>
                <li><strong>Customer Documents:</strong> <code>SR_CRM_CustomerFiles/</code> (PAN, KYC, Folio scans)</li>
                <li><strong>Staff Photos & Records:</strong> <code>SR_CRM_EmployeeFiles/</code></li>
                <li><strong>Full Relational DB:</strong> Customers, Staff, AppTracker, Roles & Settings</li>
                <li><strong>Amazon SES Campaign Logs:</strong> Delivery manifests & billing audit</li>
              </ul>
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
                <span>Backup archive generated successfully: <strong>{fileName}</strong></span>
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
          >
            <Download size={15} />
            {downloading ? 'Compressing & Generating ZIP...' : 'Download Full ZIP Backup'}
          </button>
        )}
      </div>
    </Modal>
  );
}

