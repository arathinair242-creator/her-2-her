import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, CheckCircle, XCircle, User, AlertCircle } from 'lucide-react';
import { consultApi } from '../api/apiClient';
import VideoCallModal from './VideoCallModal';
import './Pages.css';

export default function ExpertDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [activeUser, setActiveUser] = useState(null);
  const [activeAppointmentId, setActiveAppointmentId] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const data = await consultApi.getExpertSessions();
      setAppointments(data);
    } catch (err) {
      console.error("Error fetching expert appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await consultApi.updateStatus(id, status);
      fetchAppointments();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const startCall = (appointment) => {
    console.log('--- STARTING CONSULTATION CALL ---', appointment.user.name);
    setActiveUser(appointment.user);
    setActiveAppointmentId(appointment._id);
    setShowVideoCall(true);
  };

  return (
    <div className="dashboard-container" style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-dark)' }}>Patient Appointments</h2>

      {loading ? (
        <p>Loading appointments...</p>
      ) : appointments.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <AlertCircle size={48} style={{ color: 'var(--secondary-violet)', opacity: 0.5, marginBottom: '16px' }} />
          <h3>No appointments scheduled</h3>
          <p style={{ color: 'var(--text-gray)' }}>You don't have any upcoming consultations at the moment.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {appointments.map(app => (
            <div key={app._id} className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(5, 205, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {app.user.profilePicture ? (
                    <img src={app.user.profilePicture} alt={app.user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <User size={24} style={{ color: 'var(--teal-accent)' }} />
                  )}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontWeight: 700 }}>{app.user.name}</h4>
                  <p style={{ margin: '4px 0', fontSize: '0.85rem', color: 'var(--text-gray)' }}>User Email: {app.user.email}</p>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} /> {new Date(app.date).toLocaleDateString()}
                    </span>
                    <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} /> {app.time}
                    </span>
                    <span className={`status-pill ${app.status.toLowerCase()}`}>{app.status}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                {app.status === 'Pending' && (
                  <>
                    <button className="btn-primary" onClick={() => handleStatusUpdate(app._id, 'Confirmed')} style={{ backgroundColor: 'var(--teal-accent)', padding: '8px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle size={16} /> Accept
                    </button>
                    <button onClick={() => handleStatusUpdate(app._id, 'Rejected')} style={{ border: 'none', background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                      <XCircle size={16} /> Reject
                    </button>
                  </>
                )}
                {app.status === 'Confirmed' && app.type === 'Video' && (
                  <button className="btn-primary" onClick={() => startCall(app)} style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Video size={18} /> Start Consultation
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showVideoCall && (
        <VideoCallModal
          expert={null}
          user={activeUser}
          onClose={() => setShowVideoCall(false)}
          appointmentId={activeAppointmentId}
        />
      )}
    </div>
  );
}
