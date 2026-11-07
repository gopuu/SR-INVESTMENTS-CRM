import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Search, 
  RefreshCw, 
  Shield, 
  Archive, 
  CheckCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  ArrowRight,
  Sparkles,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { crmApi, subscribeCrmEvents } from '../services/api';

export default function Header({ title, subtitle, onRefresh, refreshing, onOpenBackup, onNavigate }) {
  const { user, hasPermission } = useAuth();
  const isDemo = crmApi.isDemoMode();
  const canBackup = user?.role === 'Admin' || hasPermission('DriveBackup', 'CanView');

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [toastNotif, setToastNotif] = useState(null);
  const drawerRef = useRef(null);

  const isAdmin = user?.role === 'Admin' || user?.isSuperUser === true || user?.IsSuperUser === true || user?.email?.includes('admin');

  useEffect(() => {
    loadNotifications();

    // Subscribe to realtime cross-user / cross-tab events
    const unsubscribe = subscribeCrmEvents((event) => {
      if (event.type === 'NOTIFICATION_DISPATCHED' && event.notification) {
        const notif = event.notification;
        // Audience rule:
        // Admin actions notify Admin users only.
        // Non-Admin actions notify All staff members.
        if (notif.targetAudience === 'ADMIN_ONLY' && !isAdmin) {
          return; // Ignore
        }

        // Prepend to notifications
        setNotifications((prev) => [notif, ...prev]);

        // Show instant live notification toast
        setToastNotif(notif);
        setTimeout(() => setToastNotif(null), 6000);
      } else if (event.type === 'DATA_CHANGED') {
        // Silently reload notifications
        loadNotifications();
      }
    });

    // Close dropdown on outside click
    const handleOutsideClick = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setShowDrawer(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      unsubscribe();
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [user]);

  const loadNotifications = async () => {
    try {
      const list = await crmApi.call('getNotifications', {
        userEmail: user?.email,
        isSuperUser: isAdmin,
        role: user?.role
      });
      if (Array.isArray(list)) {
        setNotifications(list);
      }
    } catch (e) {
      console.warn('Failed to load notifications:', e);
    }
  };

  const unreadCount = notifications.filter(
    (n) => !n.readBy || !n.readBy.includes(user?.email)
  ).length;

  const handleMarkAllRead = async () => {
    try {
      await crmApi.call('markAllNotificationsRead', { userEmail: user?.email });
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          readBy: [...(n.readBy || []), user?.email]
        }))
      );
    } catch (e) {
      console.warn('Failed to mark all read:', e);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      await crmApi.call('markNotificationRead', { notifId: notif.id, userEmail: user?.email });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, readBy: [...(n.readBy || []), user?.email] } : n))
      );
    } catch (e) {}

    // Check RBAC access for module
    const targetModule = notif.module || 'Dashboard';
    const canAccess = isAdmin || hasPermission(targetModule, 'CanView');

    if (!canAccess) {
      alert(`Access Restricted: You do not have permission to access the ${targetModule} module. Please contact your CRM Administrator.`);
      return;
    }

    setShowDrawer(false);
    const targetPage = notif.targetRoute || (targetModule.toLowerCase() === 'staff' ? 'staff' : targetModule.toLowerCase());
    
    if (onNavigate) {
      onNavigate(targetPage);
    } else {
      window.dispatchEvent(new CustomEvent('crm_navigate', { detail: { page: targetPage } }));
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'CREATE':
        return { bg: '#dcfce7', color: '#15803d', label: 'Created' };
      case 'UPDATE':
        return { bg: '#dbeafe', color: '#1d4ed8', label: 'Updated' };
      case 'DELETE':
      case 'SOFT_DELETE':
        return { bg: '#fee2e2', color: '#b91c1c', label: 'Soft Deleted' };
      case 'RESTORE':
        return { bg: '#f3e8ff', color: '#7e22ce', label: 'Restored' };
      default:
        return { bg: '#f1f5f9', color: '#475569', label: action || 'Activity' };
    }
  };

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }} ref={drawerRef}>
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

        {/* Operating Mode badge */}
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

        {/* Notification Bell with Badge */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDrawer(!showDrawer)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: showDrawer ? '#eff6ff' : '#f8fafc',
              border: showDrawer ? '1px solid #2563eb' : '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.15s ease'
            }}
            title="Notifications & Activity Alerts"
          >
            <Bell size={18} color={showDrawer ? '#2563eb' : '#475569'} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                fontSize: '0.65rem',
                fontWeight: '700',
                height: '18px',
                minWidth: '18px',
                padding: '0 4px',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 5px rgba(239, 68, 68, 0.4)'
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Drawer Dropdown */}
          {showDrawer && (
            <div style={{
              position: 'absolute',
              top: '46px',
              right: 0,
              width: '380px',
              maxHeight: '480px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1000,
              overflow: 'hidden'
            }}>
              {/* Header */}
              <div style={{
                padding: '0.85rem 1rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f8fafc'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Bell size={16} color="#2563eb" />
                  <span style={{ fontWeight: '700', fontSize: '0.875rem', color: '#0f172a' }}>
                    Realtime Activity
                  </span>
                  {unreadCount > 0 && (
                    <span style={{
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe',
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      fontSize: '0.7rem',
                      fontWeight: '700'
                    }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <CheckCheck size={14} /> Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div style={{ overflowY: 'auto', flex: 1, maxHeight: '400px' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                    <Bell size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '500' }}>No activity notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const isRead = n.readBy && n.readBy.includes(user?.email);
                    const badge = getActionBadge(n.action);
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        style={{
                          padding: '0.85rem 1rem',
                          borderBottom: '1px solid #f1f5f9',
                          backgroundColor: isRead ? '#ffffff' : '#f0f7ff',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.35rem'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isRead ? '#f8fafc' : '#e0effe'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isRead ? '#ffffff' : '#f0f7ff'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.675rem',
                            fontWeight: '700',
                            backgroundColor: badge.bg,
                            color: badge.color
                          }}>
                            {badge.label} • {n.module}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={11} />
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.825rem', fontWeight: isRead ? '600' : '700', color: '#0f172a' }}>
                          {n.title}
                        </div>

                        <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.35 }}>
                          {n.message}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                            By: {n.actorName || n.actorEmail}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: '600' }}>
                            View <ArrowRight size={11} />
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

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

      {/* Floating Instant Toast on Realtime Event */}
      {toastNotif && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          borderRadius: '10px',
          padding: '0.85rem 1.15rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          zIndex: 9999,
          maxWidth: '380px',
          cursor: 'pointer',
          borderLeft: '4px solid #2563eb'
        }}
        onClick={() => handleNotificationClick(toastNotif)}
        >
          <Sparkles size={20} color="#60a5fa" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#ffffff' }}>
              {toastNotif.title}
            </div>
            <div style={{ fontSize: '0.725rem', color: '#94a3b8', marginTop: '2px' }}>
              {toastNotif.message}
            </div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); setToastNotif(null); }}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </header>
  );
}
