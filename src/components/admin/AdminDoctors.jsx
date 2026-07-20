import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Eye, Activity } from 'lucide-react';
import { adminApi } from '../../api/apiClient';

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'pending', 'approved'

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getDoctors();
      setDoctors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await adminApi.updateDoctorStatus(id, status);
      // Optimistically update
      setDoctors(doctors.map(d => d._id === id ? { ...d, status: status.toLowerCase() } : d));
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doctor.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterMode === 'all' ? true : doctor.status?.toLowerCase() === filterMode;
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1f2937', marginBottom: '4px' }}>Doctor Verification</h2>
          <p style={{ color: '#6b7280', margin: 0 }}>Review and manage expert applications.</p>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <select 
            value={filterMode} 
            onChange={(e) => setFilterMode(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', outline: 'none' }}
          >
            <option value="all">All Doctors</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
          </select>
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
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Doctor Info</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Specialty</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Organization</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'right', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map(doc => (
                <tr key={doc._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={doc.profilePicture || 'https://via.placeholder.com/40'} alt={doc.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, color: '#1f2937', fontSize: '0.95rem' }}>{doc.name}</p>
                        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.8rem' }}>{doc.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '0.9rem', color: '#4b5563', fontWeight: 500 }}>{doc.specialty || 'General'}</td>
                  <td style={{ padding: '16px', fontSize: '0.9rem', color: '#4b5563' }}>{doc.hospital || 'Independent'}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700,
                      backgroundColor: doc.status?.toLowerCase() === 'approved' ? 'rgba(5, 205, 153, 0.1)' : (doc.status?.toLowerCase() === 'pending' ? 'rgba(255, 166, 32, 0.1)' : 'rgba(244, 63, 94, 0.1)'),
                      color: doc.status?.toLowerCase() === 'approved' ? '#05CD99' : (doc.status?.toLowerCase() === 'pending' ? '#FFA620' : '#F43F5E')
                    }}>
                      {doc.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button style={{ padding: '6px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#4b5563' }} title="View Details">
                        <Eye size={18} />
                      </button>
                      {doc.status?.toLowerCase() !== 'approved' && (
                        <button onClick={() => handleUpdateStatus(doc._id, 'Approved')} style={{ padding: '6px', backgroundColor: 'rgba(5, 205, 153, 0.1)', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#05CD99' }} title="Approve">
                          <CheckCircle size={18} />
                        </button>
                      )}
                      {doc.status?.toLowerCase() !== 'rejected' && (
                        <button onClick={() => handleUpdateStatus(doc._id, 'Rejected')} style={{ padding: '6px', backgroundColor: 'rgba(244, 63, 94, 0.1)', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#F43F5E' }} title="Reject">
                          <XCircle size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDoctors.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>No doctors found matching criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
