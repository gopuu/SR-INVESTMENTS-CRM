import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { startRealtimeSyncPoller, stopRealtimeSyncPoller } from './services/api';
import Sidebar from './components/Sidebar';
import BackupModal from './components/BackupModal';
import GlobalDbLoader from './components/GlobalDbLoader';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Home from './pages/Home';
import Customers from './pages/Customers';
import Staff from './pages/Staff';
import Settings from './pages/Settings';
import UserProfile from './pages/UserProfile';
import SipCalculator from './pages/SipCalculator';
import MasterHub from './pages/MasterHub';
import SuperAdminPortal from './pages/SuperAdminPortal';
import UserMaster from './pages/UserMaster';
import SubscriptionPlans from './pages/SubscriptionPlans';
import TenantUserMapping from './pages/TenantUserMapping';
import RolesRights from './pages/RolesRights';

const PAGE_MODULE_MAP = {
  'home': 'Dashboard',
  'customers': 'Customers',
  'staff': 'Staff',
  'user-rights': 'RolesRights',
  'masters': 'MasterHub',
  'settings': 'Settings'
};

export default function App() {
  const { user, isSuperAdmin, hasPermission } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  useEffect(() => {
    const handleCrmNavigate = (e) => {
      if (e.detail && e.detail.page) {
        setCurrentPage(e.detail.page);
      }
    };
    window.addEventListener('crm_navigate', handleCrmNavigate);
    return () => window.removeEventListener('crm_navigate', handleCrmNavigate);
  }, []);

  // Multi-User Cross-Device Real-Time Sync Poller for active tenant
  useEffect(() => {
    if (user) {
      startRealtimeSyncPoller();
    } else {
      stopRealtimeSyncPoller();
    }
    return () => {
      stopRealtimeSyncPoller();
    };
  }, [user]);

  // Guard SuperAdmin portals
  useEffect(() => {
    if ((currentPage === 'superadmin' || currentPage === 'user-master' || currentPage === 'subscription-plans' || currentPage === 'tenant-user-mapping') && !isSuperAdmin) {
      setCurrentPage('home');
    }
  }, [currentPage, isSuperAdmin]);

  // Guard Module Permissions for non-Admins
  useEffect(() => {
    const requiredModule = PAGE_MODULE_MAP[currentPage];
    if (requiredModule && !hasPermission(requiredModule, 'CanView')) {
      setCurrentPage('home');
    }
  }, [currentPage, hasPermission]);

  if (!user) {
    return (
      <>
        <Login />
        <GlobalDbLoader />
      </>
    );
  }

  const openBackup = () => setIsBackupModalOpen(true);

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
      />

      {/* Main Dynamic Workspace */}
      <main className="main-content">
        <ErrorBoundary onReset={() => setCurrentPage('home')}>
          {currentPage === 'home' && <Home onNavigate={setCurrentPage} onOpenBackup={openBackup} />}
          {currentPage === 'customers' && <Customers onOpenBackup={openBackup} />}
          {currentPage === 'staff' && <Staff onOpenBackup={openBackup} />}
          {currentPage === 'user-rights' && <RolesRights onOpenBackup={openBackup} />}
          {(currentPage === 'masters' || currentPage === 'departments' || currentPage === 'designations' || currentPage === 'roles') && (
            <MasterHub 
              initialTab={
                currentPage === 'designations' ? 'designations' : 
                currentPage === 'roles' ? 'roles' : 'departments'
              } 
              onOpenBackup={openBackup} 
            />
          )}
          {currentPage === 'sip' && <SipCalculator onOpenBackup={openBackup} />}
          {currentPage === 'settings' && <Settings onOpenBackup={openBackup} />}
          {currentPage === 'profile' && <UserProfile onOpenBackup={openBackup} />}
          {currentPage === 'superadmin' && <SuperAdminPortal onOpenBackup={openBackup} />}
          {currentPage === 'user-master' && <UserMaster onOpenBackup={openBackup} />}
          {currentPage === 'tenant-user-mapping' && <TenantUserMapping onOpenBackup={openBackup} />}
          {currentPage === 'subscription-plans' && <SubscriptionPlans onOpenBackup={openBackup} />}
        </ErrorBoundary>
      </main>

      {/* Global Drive Backup ZIP Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />

      {/* Global Excel/DB Transaction Loader (Bottom-Right) */}
      <GlobalDbLoader />
    </div>
  );
}
