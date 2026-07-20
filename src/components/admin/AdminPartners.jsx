import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Activity, Building2, Mail, Phone, MapPin, Globe, Clock } from 'lucide-react';
import { adminApi } from '../../api/apiClient';

const STATUS_CONFIG = {
  Verified:  { bg: 'rgba(5,205,153,0.1)',  color: '#05CD99', label: 'VERIFIED'  },
  Pending:   { bg: 'rgba(255,166,32,0.1)', color: '#FFA620', label: 'PENDING'   },
  Rejected:  { bg: 'rgba(244,63,94,0.1)',  color: '#F43F5E', label: 'REJECTED'  },
};

export default function AdminPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { fetchPartners(); }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getPartners();
      setPartners(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await adminApi.updatePartnerStatus(id, status);
      setPartners(prev => prev.map(p => p._id === id ? { ...p, status } : p));
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = partners.filter(p => {
    const matchSearch =
      p.organizationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterMode === 'all' || p.status === filterMode;
    return matchSearch && matchFilter;
  });

  const counts = {
    all: partners.length,
    Pending: partners.filter(p => p.status === 'Pending').length,
    Verified: partners.filter(p => p.status === 'Verified').length,
    Rejected: partners.filter(p => p.status === 'Rejected').length,
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1f2937', marginBottom: '4px' }}>Partner Verification</h2>
          <p style={{ color: '#6b7280', margin: 0 }}>Review and manage institutional partnership applications.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            value={filterMode}
            onChange={e => setFilterMode(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', outline: 'none', fontWeight: 600, cursor: 'pointer' }}
          >
            <option value="all">All ({counts.all})</option>
            <option value="Pending">Pending ({counts.Pending})</option>
            <option value="Verified">Verified ({counts.Verified})</option>
            <option value="Rejected">Rejected ({counts.Rejected})</option>
          </select>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search by name / email…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ padding: '10px 10px 10px 38px', borderRadius: '12px', border: '1px solid var(--border-color)', outline: 'none', width: '230px' }}
            />
          </div>
        </div>
      </div>

      {/* Summary pills */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { label: 'Total', val: counts.all, color: '#6366f1', bg: 'rgba(99,102,241,0.08)' },
          { label: 'Pending Review', val: counts.Pending, color: '#FFA620', bg: 'rgba(255,166,32,0.1)' },
          { label: 'Verified', val: counts.Verified, color: '#05CD99', bg: 'rgba(5,205,153,0.1)' },
          { label: 'Rejected', val: counts.Rejected, color: '#F43F5E', bg: 'rgba(244,63,94,0.08)' },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 18px', borderRadius: '20px', background: s.bg }}>
            <span style={{ fontWeight: 900, fontSize: '1.1rem', color: s.color }}>{s.val}</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: s.color }}>{s.label}</span>
          </div>
        ))}
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
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Organization</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Type</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Contact</th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Joined</th>
                <th style={{ padding: '16px', textAlign: 'right', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(org => {
                const cfg = STATUS_CONFIG[org.status] || STATUS_CONFIG.Pending;
                const isExpanded = expandedId === org._id;
                const isUpdating = updatingId === org._id;
                return (
                  <React.Fragment key={org._id}>
                    <tr
                      style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.15s', background: isExpanded ? 'rgba(99,102,241,0.03)' : 'transparent' }}
                      onClick={() => setExpandedId(isExpanded ? null : org._id)}
                    >
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--primary-pink-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Building2 size={20} color="var(--primary-pink)" />
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 700, color: '#1f2937', fontSize: '0.95rem' }}>{org.organizationName}</p>
                            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.78rem' }}>Reg: {org.registrationNumber || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, background: 'rgba(99,102,241,0.08)', color: '#6366f1' }}>
                          {org.organizationType}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#1f2937', fontWeight: 600 }}>{org.contactPerson}</p>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#6b7280' }}>{org.email}</p>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <span style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, background: cfg.bg, color: cfg.color, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          {org.status === 'Pending' && <Clock size={12} />}
                          {org.status === 'Verified' && <CheckCircle size={12} />}
                          {org.status === 'Rejected' && <XCircle size={12} />}
                          {cfg.label}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', color: '#6b7280', fontSize: '0.82rem' }}>
                        {new Date(org.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {org.status !== 'Verified' && (
                            <button
                              onClick={() => handleUpdateStatus(org._id, 'Verified')}
                              disabled={isUpdating}
                              title="Verify"
                              style={{ padding: '7px 14px', backgroundColor: 'rgba(5,205,153,0.1)', border: 'none', borderRadius: '10px', cursor: 'pointer', color: '#05CD99', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px', opacity: isUpdating ? 0.5 : 1 }}
                            >
                              <CheckCircle size={15} /> {isUpdating ? '…' : 'Verify'}
                            </button>
                          )}
                          {org.status !== 'Rejected' && (
                            <button
                              onClick={() => handleUpdateStatus(org._id, 'Rejected')}
                              disabled={isUpdating}
                              title="Reject"
                              style={{ padding: '7px 14px', backgroundColor: 'rgba(244,63,94,0.1)', border: 'none', borderRadius: '10px', cursor: 'pointer', color: '#F43F5E', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px', opacity: isUpdating ? 0.5 : 1 }}
                            >
                              <XCircle size={15} /> {isUpdating ? '…' : 'Reject'}
                            </button>
                          )}
                          {org.status !== 'Pending' && (
                            <button
                              onClick={() => handleUpdateStatus(org._id, 'Pending')}
                              disabled={isUpdating}
                              title="Reset to Pending"
                              style={{ padding: '7px 10px', backgroundColor: 'rgba(255,166,32,0.1)', border: 'none', borderRadius: '10px', cursor: 'pointer', color: '#FFA620', fontWeight: 700, fontSize: '0.8rem', opacity: isUpdating ? 0.5 : 1 }}
                            >
                              <Clock size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded details row */}
                    {isExpanded && (
                      <tr style={{ background: 'rgba(99,102,241,0.03)', borderBottom: '1px solid var(--border-color)' }}>
                        <td colSpan={6} style={{ padding: '0 16px 20px 72px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', paddingTop: '12px' }}>
                            {org.mobileNumber && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#4b5563' }}>
                                <Phone size={14} color="#6b7280" /> {org.mobileNumber}
                              </div>
                            )}
                            {org.address && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#4b5563' }}>
                                <MapPin size={14} color="#6b7280" /> {org.address}
                              </div>
                            )}
                            {org.website && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#4b5563' }}>
                                <Globe size={14} color="#6b7280" />
                                <a href={org.website} target="_blank" rel="noreferrer" style={{ color: '#6366f1' }}>{org.website}</a>
                              </div>
                            )}
                            {org.email && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#4b5563' }}>
                                <Mail size={14} color="#6b7280" /> {org.email}
                              </div>
                            )}
                            <div style={{ fontSize: '0.82rem', color: '#6b7280' }}>
                              Referrals: <strong>{org.referrals?.length || 0}</strong> &nbsp;|&nbsp; Events: <strong>{org.events?.length || 0}</strong>
                            </div>
                            {org.description && (
                              <div style={{ fontSize: '0.82rem', color: '#6b7280', gridColumn: '1 / -1' }}>
                                {org.description}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '50px', textAlign: 'center', color: '#6b7280' }}>
                    <Building2 size={36} style={{ opacity: 0.2, marginBottom: '10px', display: 'block', margin: '0 auto 10px' }} />
                    No partners found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
