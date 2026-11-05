import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Settings, 
  User, 
  LogOut, 
  TrendingUp, 
  ShieldCheck, 
  CloudLightning,
  ChevronRight,
  Calculator
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { crmApi } from '../services/api';

export default function Sidebar({ currentPage, onNavigate }) {
  const { user, logout, hasPermission } = useAuth();
  const isDemo = crmApi.isDemoMode();

  const navItems = [
    { id: 'home', label: 'Home (Dashboard)', icon: LayoutDashboard, module: 'Dashboard' },
    { id: 'customers', label: 'Customers', icon: Users, module: 'Customers' },
    { id: 'staff', label: 'Staff (Employees)', icon: UserCheck, module: 'Staff' },
    { id: 'sip', label: 'SIP Calculator', icon: Calculator, module: null },
    { id: 'settings', label: 'Settings', icon: Settings, module: 'Settings' },
    { id: 'profile', label: 'User Profile', icon: User, module: null }
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
      {/* Brand Header */}
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
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: '800',
          fontSize: '1.15rem',
          boxShadow: '0 4px 10px rgba(5, 150, 105, 0.3)'
        }}>
          SR
        </div>
        <div>
          <div style={{ fontWeight: '700', fontSize: '0.95rem', letterSpacing: '0.02em', color: '#ffffff' }}>
            SR INVESTMENTS
          </div>
          <div style={{ fontSize: '0.725rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <TrendingUp size={12} color="#10b981" /> Mutual Fund CRM
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
          backgroundColor: isDemo ? '#1e293b' : '#064e3b',
          color: isDemo ? '#cbd5e1' : '#a7f3d0'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isDemo ? '#38bdf8' : '#10b981'
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
                backgroundColor: isActive ? '#059669' : 'transparent',
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
      </nav>

      {/* User Card & Logout */}
      <div style={{
        padding: '1.25rem',
        borderTop: '1px solid #1e293b',
        backgroundColor: '#0b1120'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#059669',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            fontSize: '0.875rem'
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.825rem', fontWeight: '600', color: '#ffffff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {user?.name || 'Administrator'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {user?.role || 'Admin'}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.5rem',
            borderRadius: '6px',
            backgroundColor: '#1e293b',
            color: '#f87171',
            border: 'none',
            fontSize: '0.8rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2d1b24'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

