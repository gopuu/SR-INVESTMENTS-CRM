import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Settings, 
  TrendingUp, 
  ShieldCheck, 
  Calculator,
  ChevronRight,
  Boxes,
  Building2,
  Crown,
  CreditCard,
  Briefcase,
  Shield,
  Key,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { crmApi, subscribeCrmEvents } from '../services/api';
import { showError } from '../utils/swal';

export default function Sidebar({ currentPage, onNavigate }) {
  const { user, tenant, hasPermission, isSuperAdmin } = useAuth();
  const [navKey, setNavKey] = useState(0);

  // Subscribe to real-time role / permission updates to re-render navbar locks instantly
  useEffect(() => {
    const handleRefresh = () => setNavKey(k => k + 1);
    window.addEventListener('CRM_NAVBAR_REFRESH', handleRefresh);

    const unsub = subscribeCrmEvents((evt) => {
      if (
        evt.module === 'Auth' || 
        evt.module === 'TenantUserMapping' || 
        evt.module === 'TenantMaster' || 
        evt.action === 'roleChanged' ||
        evt.subType === 'ROLE_MAPPING_UPDATED'
      ) {
        setNavKey(k => k + 1);
      }
    });

    return () => {
      window.removeEventListener('CRM_NAVBAR_REFRESH', handleRefresh);
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const currentCompanyName = tenant?.CompanyName || tenant?.companyName || user?.companyName || 'SR GROWW';
  const currentTagLine = tenant?.TagLine || tenant?.tagLine || user?.tagLine || user?.TagLine || 'Mutual Fund CRM';
  const companyInitials = (() => {
    const words = currentCompanyName.split(' ').filter(Boolean);
    return words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : (words[0]?.slice(0, 2).toUpperCase() || 'SG');
  })();

  const moduleNavItems = [
    { id: 'home', label: 'Home (Dashboard)', icon: LayoutDashboard, module: 'Dashboard' },
    { id: 'customers', label: 'Customers', icon: Users, module: 'Customers' },
    { id: 'staff', label: 'Staff (Employees)', icon: UserCheck, module: 'Staff' },
    { id: 'user-rights', label: 'User Rights', icon: Key, module: 'RolesRights' },
    { id: 'masters', label: 'Master HUB', icon: Boxes, module: 'MasterHub' },
    { id: 'sip', label: 'SIP Calculator', icon: Calculator, module: null },
    { id: 'settings', label: 'Settings', icon: Settings, module: 'Settings' }
  ];

  const superAdminNavItems = [
    { id: 'superadmin', label: 'Tenant Master', icon: Building2, module: null },
    { id: 'tenant-user-mapping', label: 'Tenant-User Mapping', icon: UserCheck, module: null },
    { id: 'subscription-plans', label: 'Subscription Plans', icon: CreditCard, module: null }
  ];

  const renderNavItem = (item) => {
    const canAccess = !item.module || hasPermission(item.module, 'CanView');
    const isActive = currentPage === item.id;
    const Icon = item.icon;

    const handleClick = () => {
      if (item.module && !hasPermission(item.module, 'CanView')) {
        showError(
          'Access Denied',
          `You do not have permission to access the "${item.label}" module. Please contact your administrator.`
        );
        return;
      }
      onNavigate(item.id);
    };

    return (
      <button
        key={item.id}
        onClick={handleClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '0.65rem 0.85rem',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: isActive ? '#2563eb' : 'transparent',
          color: isActive ? '#ffffff' : canAccess ? '#94a3b8' : '#64748b',
          fontWeight: isActive ? '600' : '500',
          fontSize: '0.85rem',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          textAlign: 'left',
          opacity: canAccess ? 1 : 0.65
        }}
        onMouseEnter={(e) => {
          if (!isActive) e.currentTarget.style.backgroundColor = '#1e293b';
          if (!isActive) e.currentTarget.style.color = canAccess ? '#ffffff' : '#cbd5e1';
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
          if (!isActive) e.currentTarget.style.color = canAccess ? '#94a3b8' : '#64748b';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Icon size={18} color={isActive ? '#ffffff' : canAccess ? '#94a3b8' : '#64748b'} />
          <span>{item.label}</span>
          {item.badge && (
            <span style={{
              backgroundColor: '#f59e0b',
              color: '#0f172a',
              fontSize: '0.625rem',
              padding: '1px 6px',
              borderRadius: '4px',
              fontWeight: '800',
              letterSpacing: '0.04em'
            }}>
              {item.badge}
            </span>
          )}
        </div>
        {!canAccess ? (
          <Lock size={13} color="#f87171" title="Access Restricted" />
        ) : isActive ? (
          <ChevronRight size={14} color="#ffffff" />
        ) : null}
      </button>
    );
  };

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
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
          letterSpacing: '0.04em'
        }}>
          {companyInitials}
        </div>
        <div>
          <div style={{ fontWeight: '700', fontSize: '0.95rem', letterSpacing: '0.02em', color: '#ffffff' }}>
            {currentCompanyName}
          </div>
          <div style={{ fontSize: '0.725rem', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <TrendingUp size={12} color="#60a5fa" /> {currentTagLine}
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '1.25rem 0.85rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto' }}>
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', padding: '0 0.5rem 0.5rem', letterSpacing: '0.05em' }}>
          Modules
        </div>
        {moduleNavItems.map(renderNavItem)}

        {/* Separate Super Admin Section */}
        {isSuperAdmin && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.85rem' }}>
            <div style={{
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              color: '#64748b',
              fontWeight: '700',
              padding: '1rem 0.5rem 0.5rem',
              letterSpacing: '0.05em',
              borderTop: '1px solid #1e293b'
            }}>
              Super Admin
            </div>
            {superAdminNavItems.map(renderNavItem)}
          </div>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', overflow: 'hidden' }}>
          <ShieldCheck size={14} color="#3b82f6" style={{ flexShrink: 0 }} />
          <span style={{ color: '#94a3b8', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentCompanyName} CRM
          </span>
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
