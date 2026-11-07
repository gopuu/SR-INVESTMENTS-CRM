import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Settings, 
  TrendingUp, 
  ShieldCheck, 
  Calculator,
  Archive,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { crmApi } from '../services/api';

export default function Sidebar({ currentPage, onNavigate, onOpenBackup }) {
  const { user, hasPermission } = useAuth();
  const isDemo = crmApi.isDemoMode();

  const navItems = [
    { id: 'home', label: 'Home (Dashboard)', icon: LayoutDashboard, module: 'Dashboard' },
    { id: 'customers', label: 'Customers', icon: Users, module: 'Customers' },
    { id: 'staff', label: 'Staff (Employees)', icon: UserCheck, module: 'Staff' },
    { id: 'sip', label: 'SIP Calculator', icon: Calculator, module: null },
    { id: 'settings', label: 'Settings', icon: Settings, module: 'Settings' }
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      borderRight: '1px solid #1e293b'
    }}>
      {/* Brand Header - Royal Blue Family */}
      <div style={{
        padding: '1.5rem 1.25rem',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem'
      }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: '800',
          fontSize: '1.15rem',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
        }}>
          SR
        </div>
        <div>
          <div style={{ fontWeight: '700', fontSize: '0.95rem', letterSpacing: '0.02em', color: '#ffffff' }}>
            SR INVESTMENTS
          </div>
          <div style={{ fontSize: '0.725rem', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <TrendingUp size={12} color="#60a5fa" /> Mutual Fund CRM
          </div>
        </div>
      </div>

      {/* Backend Status indicator */}
      <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #1e293b' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.725rem',
          padding: '0.4rem 0.65rem',
          borderRadius: '6px',
          backgroundColor: isDemo ? '#1e293b' : '#1e3a8a',
          color: isDemo ? '#cbd5e1' : '#bfdbfe'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isDemo ? '#38bdf8' : '#60a5fa'
            }}></span>
            {isDemo ? 'Local Storage Mode' : 'GAS Live Backend'}
          </span>
          <button 
            onClick={() => onNavigate('settings')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '0.7rem'
            }}>
            Config
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '1.25rem 0.85rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', padding: '0 0.5rem 0.5rem', letterSpacing: '0.05em' }}>
          Modules
        </div>
        {navItems.map((item) => {
          if (item.module && !hasPermission(item.module, 'CanView')) return null;
          const isActive = currentPage === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isActive ? '#2563eb' : 'transparent',
                color: isActive ? '#ffffff' : '#94a3b8',
                fontWeight: isActive ? '600' : '500',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = '#1e293b';
                if (!isActive) e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                if (!isActive) e.currentTarget.style.color = '#94a3b8';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Icon size={18} color={isActive ? '#ffffff' : '#94a3b8'} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight size={14} color="#ffffff" />}
            </button>
          );
        })}

        {/* Quick Backup Action in Sidebar */}
        {(user?.role === 'Admin' || hasPermission('DriveBackup', 'CanView')) && onOpenBackup && (
          <button
            onClick={onOpenBackup}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              padding: '0.65rem 0.85rem',
              marginTop: '0.5rem',
              borderRadius: '8px',
              border: '1px dashed #334155',
              backgroundColor: 'transparent',
              color: '#93c5fd',
              fontSize: '0.825rem',
              fontWeight: '500',
              cursor: 'pointer',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Archive size={16} color="#60a5fa" />
            <span>Drive Backup (.ZIP)</span>
          </button>
        )}
      </nav>

      {/* Sidebar Footer */}
      <div style={{
        padding: '1rem 1.25rem',
        borderTop: '1px solid #1e293b',
        backgroundColor: '#0b1120',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.725rem',
        color: '#64748b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <ShieldCheck size={14} color="#3b82f6" />
          <span style={{ color: '#94a3b8', fontWeight: '500' }}>SR Investments CRM</span>
        </div>
        <span style={{ 
          backgroundColor: '#1e293b', 
          color: '#93c5fd', 
          padding: '2px 7px', 
          borderRadius: '4px',
          fontWeight: '700',
          fontSize: '0.675rem',
          border: '1px solid #334155'
        }}>v2.0</span>
      </div>
    </aside>
  );
}
