import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import BackupModal from './components/BackupModal';
import Login from './pages/Login';
import Home from './pages/Home';
import Customers from './pages/Customers';
import Staff from './pages/Staff';
import TaskTracker from './pages/TaskTracker';
import ToDoList from './pages/ToDoList';
import BulkMail from './pages/BulkMail';
import Settings from './pages/Settings';
import UserProfile from './pages/UserProfile';
import SipCalculator from './pages/SipCalculator';

export default function App() {
  const { user } = useAuth();
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
        onOpenBackup={openBackup}
      />

      {/* Main Dynamic Workspace */}
      <main className="main-content">
        {currentPage === 'home' && <Home onNavigate={setCurrentPage} onOpenBackup={openBackup} />}
        {currentPage === 'customers' && <Customers />}
        {currentPage === 'staff' && <Staff />}
        {currentPage === 'tasks' && <TaskTracker />}
        {currentPage === 'todos' && <ToDoList />}
        {currentPage === 'bulkmail' && <BulkMail />}
        {currentPage === 'sip' && <SipCalculator />}
        {currentPage === 'settings' && <Settings onOpenBackup={openBackup} />}
        {currentPage === 'profile' && <UserProfile />}
      </main>

      {/* Global Drive Backup ZIP Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />
    </div>
  );
}
