import React, { useState, useEffect } from 'react';
import { Search, Activity } from 'lucide-react';
import { adminApi } from '../../api/apiClient';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAppointments();
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(app => {
    const pName = app.user?.name || '';
    const dName = app.expert?.name || '';
    return pName.toLowerCase().includes(searchTerm.toLowerCase()) || dName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1f2937', marginBottom: '4px' }}>Appointments Management</h2>
          <p style={{ color: '#6b7280', margin: 0 }}>Review all scheduled expert consultations.</p>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', color: '#9ca3af' }} />
            <input 
              type="text" 
              placeholder="Search patient/doctor" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '10px 10px 10px 38px', borderRadius: '12px', border: '1px solid var(--border-color)', outline: 'none', width: '220px' }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Activity className="animate-pulse-soft" color="#7c3aed" size={40} />
        </div>
      ) : (
        <div className="glass-card admin-table-container">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Date/Time</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Patient</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Doctor</th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Channel</th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map(app => (
                <tr key={app._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px', color: '#1f2937', fontWeight: 600, fontSize: '0.9rem' }}>
                    {new Date(app.date).toLocaleDateString()} <br/>
                    <span style={{ color: '#6b7280', fontWeight: 400, fontSize: '0.8rem' }}>{app.time}</span>
                  </td>
                  <td style={{ padding: '16px', color: '#4b5563', fontSize: '0.9rem' }}>{app.user?.name || 'Unknown'}</td>
                  <td style={{ padding: '16px', color: '#4b5563', fontSize: '0.9rem' }}>Dr. {app.expert?.name || 'Unknown'}<br/><span style={{fontSize:'0.75rem', color:'#9ca3af'}}>{app.expert?.specialty}</span></td>
                  <td style={{ padding: '16px', textAlign: 'center', fontSize: '0.9rem' }}>{app.type || 'Video'}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700,
                      backgroundColor: app.status === 'Completed' ? 'rgba(5, 205, 153, 0.1)' : (app.status === 'Pending' ? 'rgba(255, 166, 32, 0.1)' : 'rgba(124, 58, 237, 0.1)'),
                      color: app.status === 'Completed' ? '#05CD99' : (app.status === 'Pending' ? '#FFA620' : '#7c3aed')
                    }}>
                      {app.status?.toUpperCase() || 'SCHEDULED'}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredAppointments.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>No appointments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
