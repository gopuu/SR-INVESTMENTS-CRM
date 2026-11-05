import React from 'react';
import { Bell, Search, RefreshCw, Shield, Archive, Download, HardDrive } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { crmApi } from '../services/api';

export default function Header({ title, subtitle, onRefresh, refreshing, onOpenBackup }) {
  const { user, hasPermission } = useAuth();
  const isDemo = crmApi.isDemoMode();
  const canBackup = user?.role === 'Admin' || hasPermission('DriveBackup', 'CanView');

  return (
    <header style={{
      height: '70px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Title & Subtitle */}
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Drive Backup Button */}
        {canBackup && onOpenBackup && (
          <button 
            className="btn btn-outline-blue btn-sm"
            onClick={onOpenBackup}
            title="Download complete Drive and Database Backup (.ZIP)"
          >
            <Archive size={14} />
            <span>Drive Backup (ZIP)</span>
          </button>
        )}

        {/* Mode badge */}
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.3rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: '600',
          backgroundColor: isDemo ? '#eff6ff' : '#dbeafe',
          color: isDemo ? '#2563eb' : '#1e40af',
          border: '1px solid #bfdbfe'
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#2563eb'
          }}></span>
          {isDemo ? 'Local Storage Mode' : 'Live Google Sheet Sync'}
        </span>

        {/* Refresh button */}
        {onRefresh && (
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onRefresh}
            disabled={refreshing}
            title="Refresh Data"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={14} className={refreshing ? 'spin-animation' : ''} />
            <span>Refresh</span>
          </button>
        )}

        {/* User Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.35rem 0.85rem',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '9999px'
        }}>
          <Shield size={14} color="#2563eb" />
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#1e40af' }}>
            {user?.role || 'Staff'}
          </span>
        </div>
      </div>
    </header>
  );
}
