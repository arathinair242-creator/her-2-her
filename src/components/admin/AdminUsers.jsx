import React, { useState, useEffect } from 'react';
import { Search, Activity } from 'lucide-react';
import { adminApi } from '../../api/apiClient';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(usr => 
    usr.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    usr.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1f2937', marginBottom: '4px' }}>Registered Users</h2>
          <p style={{ color: '#6b7280', margin: 0 }}>View all users array and their platform metrics.</p>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', color: '#9ca3af' }} />
            <input 
              type="text" 
              placeholder="Search by name/email" 
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
        <div className="glass-card" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Email</th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Member Status</th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Total Sessions</th>
                <th style={{ padding: '16px', textAlign: 'right', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Registration Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(usr => (
                <tr key={usr._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px', fontWeight: 600, color: '#1f2937', fontSize: '0.95rem' }}>{usr.name || 'Anonymous User'}</td>
                  <td style={{ padding: '16px', color: '#4b5563', fontSize: '0.9rem' }}>{usr.email}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700,
                      backgroundColor: usr.membershipStatus === 'Premium' ? 'rgba(124, 58, 237, 0.1)' : 'rgba(0,0,0,0.05)',
                      color: usr.membershipStatus === 'Premium' ? '#7c3aed' : '#6b7280'
                    }}>
                      {usr.membershipStatus?.toUpperCase() || 'FREE'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center', fontWeight: 700, color: '#1f2937' }}>{usr.appointmentCount || 0}</td>
                  <td style={{ padding: '16px', textAlign: 'right', color: '#6b7280', fontSize: '0.85rem' }}>
                    {new Date(usr.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
