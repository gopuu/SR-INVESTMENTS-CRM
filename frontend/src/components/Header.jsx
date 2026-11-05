import React from 'react';
import { Bell, Search, RefreshCw, Shield, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { crmApi } from '../services/api';

export default function Header({ title, subtitle, onRefresh, refreshing }) {
  const { user } = useAuth();
  const isDemo = crmApi.isDemoMode();

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Mode badge */}
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.3rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: '600',
          backgroundColor: isDemo ? '#f0fdf4' : '#ecfdf5',
          color: isDemo ? '#15803d' : '#047857',
          border: '1px solid #bbf7d0'
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#10b981'
          }}></span>
          {isDemo ? 'Offline / Demo Ready' : 'Live Google Sheet Sync'}
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
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '9999px'
        }}>
          <Shield size={14} color="#059669" />
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#334155' }}>
            {user?.role || 'Admin'}
          </span>
        </div>
      </div>
    </header>
  );
}

