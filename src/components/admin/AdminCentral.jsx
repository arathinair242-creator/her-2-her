import React, { useState, useEffect } from 'react';
import AdminLogin from '../AdminLogin';
import AdminLayout from './AdminLayout';
import AdminDashboard from './AdminDashboard';
import AdminDoctors from './AdminDoctors';
import AdminUsers from './AdminUsers';
import AdminAppointments from './AdminAppointments';
import AdminPartners from './AdminPartners';
import AdminReports from './AdminReports';
import AdminReviews from './AdminReviews';

export default function AdminCentral({ onExitAdmin }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [activeChildTab, setActiveChildTab] = useState('dashboard');

  useEffect(() => {
    const role = localStorage.getItem('her2her_role');
    const token = localStorage.getItem('her2her_token');
    if (role === 'admin' && token) {
      setIsAdminLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = (token) => {
    setIsAdminLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('her2her_token');
    localStorage.removeItem('her2her_role');
    localStorage.removeItem('her2her_is_logged_in');
    setIsAdminLoggedIn(false);
    onExitAdmin();
  };

  if (!isAdminLoggedIn) {
    return (
      <div style={{ position: 'relative' }}>
          <button 
              onClick={onExitAdmin} 
              style={{ position: 'absolute', top: '20px', left: '20px', padding: '10px 20px', borderRadius: '12px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', zIndex: 10 }}
          >
              ← Back to Main Site
          </button>
          <AdminLogin onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', width: '100vw', margin: 0, padding: 0 }}>
      {/* Hide global app header and footer inside the Admin interface directly, assuming App.jsx hides it when handling AdminCentral */}
      <AdminLayout activeChildTab={activeChildTab} setActiveChildTab={setActiveChildTab} onLogout={handleLogout}>
        {activeChildTab === 'dashboard' && <AdminDashboard />}
        {activeChildTab === 'doctors' && <AdminDoctors />}
        {activeChildTab === 'users' && <AdminUsers />}
        {activeChildTab === 'appointments' && <AdminAppointments />}
        {activeChildTab === 'partners' && <AdminPartners />}
        {activeChildTab === 'reports' && <AdminReports />}
        {activeChildTab === 'reviews' && <AdminReviews />}
      </AdminLayout>
    </div>
  );
}
