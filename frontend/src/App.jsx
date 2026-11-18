import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import BackupModal from './components/BackupModal';
import Login from './pages/Login';
import Home from './pages/Home';
import Customers from './pages/Customers';
import Staff from './pages/Staff';
import Settings from './pages/Settings';
import UserProfile from './pages/UserProfile';
import SipCalculator from './pages/SipCalculator';
import MasterHub from './pages/MasterHub';
import SuperAdminPortal from './pages/SuperAdminPortal';
import SubscriptionPlans from './pages/SubscriptionPlans';
import TenantUserMapping from './pages/TenantUserMapping';

export default function App() {
  const { user, isSuperAdmin } = useAuth();
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

  // Guard SuperAdmin portals
  useEffect(() => {
    if ((currentPage === 'superadmin' || currentPage === 'subscription-plans' || currentPage === 'tenant-user-mapping') && !isSuperAdmin) {
      setCurrentPage('home');
    }
  }, [currentPage, isSuperAdmin]);

  if (!user) {
    return <Login />;
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
        {currentPage === 'home' && <Home onNavigate={setCurrentPage} onOpenBackup={openBackup} />}
        {currentPage === 'customers' && <Customers onOpenBackup={openBackup} />}
        {currentPage === 'staff' && <Staff onOpenBackup={openBackup} />}
        {currentPage === 'masters' && <MasterHub onOpenBackup={openBackup} />}
        {currentPage === 'sip' && <SipCalculator onOpenBackup={openBackup} />}
        {currentPage === 'settings' && <Settings onOpenBackup={openBackup} />}
        {currentPage === 'profile' && <UserProfile onOpenBackup={openBackup} />}
        {currentPage === 'superadmin' && isSuperAdmin && <SuperAdminPortal onOpenBackup={openBackup} />}
        {currentPage === 'tenant-user-mapping' && isSuperAdmin && <TenantUserMapping onOpenBackup={openBackup} />}
        {currentPage === 'subscription-plans' && isSuperAdmin && <SubscriptionPlans onOpenBackup={openBackup} />}
      </main>

      {/* Global Drive Backup ZIP Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />
    </div>
  );
}
