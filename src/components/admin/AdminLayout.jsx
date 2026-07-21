import React from 'react';
import { LayoutDashboard, Users, UserPlus, Stethoscope, Calendar, Building, FileText, LogOut, Star } from 'lucide-react';
import '../Pages.css';

export default function AdminLayout({ activeChildTab, setActiveChildTab, onLogout, children }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'partners', label: 'Organizations', icon: Building },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'reviews', label: 'Reviews', icon: Star }
  ];

  return (
    <div className="admin-main-container">
      
      {/* Sidebar Navigation */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-logo" style={{ padding: '30px 24px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ backgroundColor: '#7c3aed', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            H
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#1f2937' }}>Admin Panel</span>
        </div>
 
        <div className="admin-sidebar-menu" style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeChildTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveChildTab(tab.id)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                  borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                  border: 'none', transition: 'all 0.2s ease',
                  backgroundColor: isActive ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
                  color: isActive ? '#7c3aed' : '#4b5563'
                }}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </div>
 
        <div className="admin-sidebar-logout-container" style={{ padding: '24px 16px', borderTop: '1px solid var(--border-color)' }}>
          <button 
            onClick={onLogout}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
              borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
              border: 'none', backgroundColor: '#fee2e2', color: '#ef4444', width: '100%'
            }}
          >
            <LogOut size={18} />
            Secure Logout
          </button>
        </div>
      </div>
 
      {/* Main Content Area */}
      <div className="admin-content-area">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </div>
      </div>
 
    </div>
  );
}
