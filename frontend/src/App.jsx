import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Home from './pages/Home';
import Customers from './pages/Customers';
import Staff from './pages/Staff';
import Settings from './pages/Settings';
import UserProfile from './pages/UserProfile';
import SipCalculator from './pages/SipCalculator';

export default function App() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* Main Dynamic Workspace */}
      <main className="main-content">
        {currentPage === 'home' && <Home onNavigate={setCurrentPage} />}
        {currentPage === 'customers' && <Customers />}
        {currentPage === 'staff' && <Staff />}
        {currentPage === 'sip' && <SipCalculator />}
        {currentPage === 'settings' && <Settings />}
        {currentPage === 'profile' && <UserProfile />}
      </main>
    </div>
  );
}

