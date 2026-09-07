import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, XCircle, ChevronRight, AlertCircle, Heart, Sparkles, Activity, ShieldCheck, ArrowRight, Star, Smile, Meh, Frown, Droplets, Zap } from 'lucide-react';
import { consultApi, assessmentApi, userApi } from '../api/apiClient';
import VideoCallModal from './VideoCallModal';
import OrderHistory from './OrderHistory';
import './Pages.css';

export default function UserDashboard({ setActiveTab }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [activeCallExpert, setActiveCallExpert] = useState(null);
  const [activeAppointmentId, setActiveAppointmentId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [assessmentHistory, setAssessmentHistory] = useState([]);
  const [wellnessScore, setWellnessScore] = useState(72);
  const [userName, setUserName] = useState("Heroine");
  const [trialInfo, setTrialInfo] = useState(null);
  const [startingTrial, setStartingTrial] = useState(false);
  
  // Period Tracker States
  const [lastPeriod, setLastPeriod] = useState(() => {
    const val = localStorage.getItem('her2her_last_period');
    return (val && val !== 'null' && val !== 'undefined') ? val : '';
  });
  const [cycleLength, setCycleLength] = useState(28);
  const [nextPeriod, setNextPeriod] = useState(null);
  const [activeDashboardTab, setActiveDashboardTab] = useState('overview'); // overview, payments, profile
  const [selectedAvatar, setSelectedAvatar] = useState(() => localStorage.getItem('her2her_avatar') || '🌸');

  const AVATARS = [
    '🌸', '🌺', '🌻', '🦋', '🌷', '💫', '🌈', '🌟',
    '🧚', '💖', '🌙', '🦄', '🍀', '🌿', '🦩', '💎',
    '🐝', '🌊', '🎀', '🌹', '🦊', '🐱', '🐼', '🌴'
  ];

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
    localStorage.setItem('her2her_avatar', avatar);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#10b981',
            background: '#ecfdf5',
            padding: '2px 8px',
            borderRadius: '12px'
          }}>
            Confirmed
          </span>
        );
      case 'Pending':
        return (
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#d97706',
            background: '#fffbeb',
            padding: '2px 8px',
            borderRadius: '12px'
          }}>
            Pending
          </span>
        );
      case 'Cancelled':
        return (
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#ef4444',
            background: '#fef2f2',
            padding: '2px 8px',
            borderRadius: '12px'
          }}>
            Cancelled
          </span>
        );
      default:
        return (
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: 'var(--text-gray)',
            background: '#f3f4f6',
            padding: '2px 8px',
            borderRadius: '12px'
          }}>
            {status}
          </span>
        );
    }
  };

  useEffect(() => {
    fetchData();
    const storedName = localStorage.getItem('her2her_user_name');
    const storedEmail = localStorage.getItem('her2her_user_email');
    if (storedName && storedName !== "null") {
      setUserName(storedName.split(' ')[0]);
    } else if (storedEmail) {
      setUserName(storedEmail.split('@')[0]);
    }
  }, []);

  useEffect(() => {
    if (lastPeriod && lastPeriod !== 'null' && lastPeriod !== 'undefined') {
      const date = new Date(lastPeriod);
      if (!isNaN(date.getTime())) {
        date.setDate(date.getDate() + cycleLength);
        setNextPeriod(date);
        localStorage.setItem('her2her_last_period', lastPeriod);
      } else {
        setNextPeriod(null);
      }
    } else {
      setNextPeriod(null);
    }
  }, [lastPeriod, cycleLength]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appData, planData, profileData, historyData] = await Promise.all([
        consultApi.getMySessions().catch(() => []),
        assessmentApi.getMyPlan().catch(() => null),
        userApi.getProfile().catch(() => null),
        assessmentApi.getHistory().catch(() => [])
      ]);
      setAppointments(appData || []);
      setAssessmentHistory(historyData || []);
      if (planData && planData.plan) {
        setUserProfile(planData.plan);
        setWellnessScore(planData.plan.wellnessScore || 78);
      }
      if (profileData && profileData.membershipStatus === 'Trial') {
        setTrialInfo({ status: 'Trial', trialEndDate: profileData.trialEndDate });
      } else if (profileData && profileData.membershipStatus === 'Premium') {
        setTrialInfo({ status: 'Premium' });
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        await consultApi.updateStatus(id, 'Cancelled');
        fetchData();
      } catch (err) {
        alert("Error: " + err.message);
      }
    }
  };

  const joinCall = (appointment) => {
    setActiveCallExpert(appointment.expert);
    setActiveAppointmentId(appointment._id);
    setShowVideoCall(true);
  };

  const pendingAppointments = appointments.filter(a => a.status === 'Confirmed' || a.status === 'Pending');

  const handleStartTrial = async () => {
    setStartingTrial(true);
    try {
      const res = await userApi.activateTrial();
      setTrialInfo({ status: 'Trial', trialEndDate: res.trialEndDate });
      alert(res.message || '🎉 7-Day Free Trial activated! Enjoy premium access.');
    } catch (err) {
      alert(err.message || 'Error activating trial');
    } finally {
      setStartingTrial(false);
    }
  };

  // Calculate days remaining in trial
  const trialDaysLeft = trialInfo?.trialEndDate
    ? Math.max(0, Math.ceil((new Date(trialInfo.trialEndDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="page-container" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      {/* Header & Greeting Section */}
      <div className="page-banner-card glass-card" style={{ marginBottom: '30px', background: 'linear-gradient(135deg, var(--primary-pink-light) 0%, #fff 100%)' }}>
        <div className="page-banner-content">
          <h2 className="page-banner-title" style={{ fontSize: '1.8rem' }}>Welcome back, {userName}! ✨</h2>
          <p className="page-banner-desc">How are you feeling today? Your wellness journey is our priority.</p>
          
          <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
            <button className="mood-btn" onClick={() => alert("Glad you're feeling great!")}><Smile size={24} /> Happy</button>
            <button className="mood-btn" onClick={() => alert("Stay steady, you got this!")}><Meh size={24} /> Neutral</button>
            <button className="mood-btn" onClick={() => alert("Take a deep breath. We're here for you.")}><Frown size={24} /> Low</button>
          </div>
        </div>
      </div>

      {/* Trial Status Banner */}
      {trialInfo?.status === 'Trial' ? (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #7c3aed, #db2777)',
          borderRadius: '16px', padding: '16px 24px', marginBottom: '20px', color: '#fff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Zap size={22} fill="#fff" />
            <div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem' }}>Premium Trial Active 🎉</p>
              <p style={{ margin: 0, fontSize: '0.82rem', opacity: 0.85 }}>{trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} remaining in your free trial</p>
            </div>
          </div>
          <button onClick={() => setActiveTab('Plans')} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', borderRadius: '10px', padding: '8px 18px', fontWeight: 700, cursor: 'pointer' }}>
            Upgrade Now
          </button>
        </div>
      ) : !trialInfo ? (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #fdf2ff, #fff0f7)',
          border: '1.5px dashed var(--primary-pink)', borderRadius: '16px',
          padding: '16px 24px', marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Zap size={22} color="var(--primary-pink)" />
            <div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: 'var(--text-dark)' }}>Try Premium Free for 7 Days</p>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-gray)' }}>Unlock expert consultations, AI analysis &amp; more.</p>
            </div>
          </div>
          <button onClick={handleStartTrial} disabled={startingTrial} className="btn-modal-submit" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
            {startingTrial ? 'Activating...' : 'Start Free Trial'}
          </button>
        </div>
      ) : null}

        {/* Header Tabs */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <button 
            onClick={() => setActiveDashboardTab('overview')} 
            style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: activeDashboardTab === 'overview' ? '3px solid var(--primary-pink)' : 'none', fontWeight: 700, color: activeDashboardTab === 'overview' ? 'var(--primary-pink)' : 'var(--text-gray)', cursor: 'pointer' }}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveDashboardTab('payments')} 
            style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: activeDashboardTab === 'payments' ? '3px solid var(--primary-pink)' : 'none', fontWeight: 700, color: activeDashboardTab === 'payments' ? 'var(--primary-pink)' : 'var(--text-gray)', cursor: 'pointer' }}
          >
            Payments & History
          </button>
          <button 
            onClick={() => setActiveDashboardTab('profile')} 
            style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: activeDashboardTab === 'profile' ? '3px solid var(--primary-pink)' : 'none', fontWeight: 700, color: activeDashboardTab === 'profile' ? 'var(--primary-pink)' : 'var(--text-gray)', cursor: 'pointer' }}
          >
            My Profile
          </button>
        </div>

        {activeDashboardTab === 'overview' ? (
          <div className="page-grid-1-2">
            {/* Left Column: Stats & Tracker */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              
              {/* Wellness Score */}
              <div className="glass-card" style={{ padding: '25px', textAlign: 'center' }}>
                <h3 style={{ marginBottom: '15px', fontSize: '1.1rem', fontWeight: 700 }}>Wellness Progress</h3>
                <div className="score-dial-container" style={{ margin: '0 auto', width: '140px', height: '140px' }}>
                  <svg className="score-dial-svg" viewBox="0 0 100 100">
                    <circle className="dial-track" cx="50" cy="50" r="45" fill="none" strokeWidth="8" stroke="#f0f0f0" />
                    <circle 
                      className="dial-fill" 
                      cx="50" cy="50" r="45" 
                      fill="none" 
                      strokeWidth="8" 
                      stroke="url(#score-gradient)"
                      strokeDasharray="282.7"
                      strokeDashoffset={282.7 - (282.7 * wellnessScore) / 100}
                    />
                  </svg>
                  <div className="score-display">
                    <span style={{ fontSize: '2rem', fontWeight: 800 }}>{wellnessScore}</span>
                  </div>
                </div>
                <p style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-gray)' }}>Update assessment to improve score</p>
                <button className="btn-modal-submit" style={{ marginTop: '24px', width: '100%', fontSize: '0.9rem' }} onClick={() => setActiveTab('Plans')}>
                  View Daily Plan <ArrowRight size={16} />
                </button>
              </div>

              {/* PERIOD TRACKER */}
              <div className="glass-card" style={{ padding: '25px', borderLeft: '5px solid var(--primary-pink)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                  <Droplets color="var(--primary-pink)" fill="var(--primary-pink)" size={20} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Period Tracker</h3>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginBottom: '5px', display: 'block' }}>Last Period Start Date</label>
                  <input 
                    type="date" 
                    value={lastPeriod} 
                    onChange={(e) => setLastPeriod(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)' }}
                  />
                </div>

                {nextPeriod && !isNaN(nextPeriod.getTime()) && (
                  <div className="highlight-item" style={{ background: 'var(--primary-pink-light)', padding: '15px', borderRadius: '15px', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--primary-pink)', fontWeight: 600 }}>PREDICTED NEXT PERIOD</p>
                    <p style={{ margin: '5px 0 0', fontSize: '1.1rem', fontWeight: 700 }}>{nextPeriod.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
                  </div>
                )}
                
                <button className="btn-modal-submit" style={{ width: '100%', marginTop: '15px', padding: '12px' }} onClick={() => setLastPeriod(new Date().toISOString().split('T')[0])}>
                  Log Period Today
                </button>
              </div>

              {/* Quick Actions */}
              <div className="glass-card" style={{ padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <h4 style={{ marginBottom: '18px', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-dark)' }}>Quick Links</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="quick-link-card" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '15px', 
                    padding: '16px 20px', 
                    borderRadius: '16px', 
                    background: 'var(--primary-pink-light)', 
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    border: '1px solid rgba(255, 75, 139, 0.1)'
                  }} onClick={() => setActiveTab('Consult')}>
                    <div style={{ background: '#fff', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-pink)', boxShadow: '0 4px 10px rgba(255, 75, 139, 0.2)' }}>
                      <Video size={20} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-dark)' }}>Talk to Expert</span>
                    <ChevronRight size={18} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                  </div>
                  
                  <div className="quick-link-card" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '15px', 
                    padding: '16px 20px', 
                    borderRadius: '16px', 
                    background: 'var(--secondary-violet-light)', 
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    border: '1px solid rgba(138, 75, 255, 0.1)'
                  }} onClick={() => setActiveTab('Plans')}>
                    <div style={{ background: '#fff', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary-violet)', boxShadow: '0 4px 10px rgba(138, 75, 255, 0.2)' }}>
                      <Activity size={20} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-dark)' }}>View My Plan</span>
                    <ChevronRight size={18} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                  </div>
                </div>
              </div>

              {/* Assessment History */}
              <div className="glass-card" style={{ padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <h4 style={{ marginBottom: '18px', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-dark)' }}>Assessment History</h4>
                {assessmentHistory.length === 0 ? (
                  <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>No past assessments found.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                    {assessmentHistory.map(history => (
                      <div key={history._id} style={{ 
                        padding: '12px', border: '1px solid var(--border-color)', borderRadius: '12px', 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
                      }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                            {history.type} Assessment
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} /> {history.createdAt && !isNaN(new Date(history.createdAt).getTime()) ? new Date(history.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ 
                            fontSize: '0.8rem', fontWeight: 700, 
                            color: history.plan?.score >= 80 ? '#05CD99' : (history.plan?.score >= 60 ? '#FFA620' : '#F43F5E')
                          }}>
                            Score: {history.plan?.score || 'N/A'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Appointments */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div className="glass-card" style={{ padding: '25px', minHeight: '450px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>My Appointments</h3>
                  <span className="badge" style={{ background: 'var(--secondary-violet-light)', color: 'var(--secondary-violet)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>{pendingAppointments.length} Active</span>
                </div>

                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                    <Activity className="animate-pulse-soft" style={{ color: 'var(--primary-pink)' }} />
                  </div>
                ) : appointments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                    <div style={{ background: '#f9f9f9', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                      <Calendar size={32} style={{ color: 'var(--text-light)' }} />
                    </div>
                    <p style={{ color: 'var(--text-gray)', fontSize: '0.95rem' }}>Your schedule is clear. Need guidance?</p>
                    <button className="btn-primary" style={{ marginTop: '15px' }} onClick={() => setActiveTab('Consult')}>Consult Expert</button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '15px' }}>
                    {appointments.map(app => (
                      <div key={app._id} className="appointment-card-item" style={{ 
                        padding: '15px', 
                        borderRadius: '18px', 
                        background: '#fff', 
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <div style={{ width: '50px', height: '50px', borderRadius: '14px', backgroundColor: 'var(--primary-pink-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {app.expert?.profilePicture ? (
                              <img src={app.expert.profilePicture} alt={app.expert.name || 'Expert'} style={{ width: '100%', height: '100%', borderRadius: '14px', objectFit: 'cover' }} />
                            ) : (
                              <Star size={20} style={{ color: 'var(--primary-pink)' }} />
                            )}
                          </div>
                          <div>
                            <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>{app.expert?.name || 'Expert'}</h4>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '4px', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--text-gray)' }}>
                                <Calendar size={12} /> {app.date && !isNaN(new Date(app.date).getTime()) ? new Date(app.date).toLocaleDateString() : 'N/A'}
                              </span>
                              <span style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--text-gray)' }}>
                                <Clock size={12} /> {app.time}
                              </span>
                              {getStatusBadge(app.status)}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {app.status === 'Confirmed' && app.type === 'Video' && (
                            <button className="btn-modal-submit" onClick={() => joinCall(app)} style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Video size={12} /> Join
                            </button>
                          )}
                          <button onClick={() => handleCancel(app._id)} style={{ padding: '6px', borderRadius: '8px', background: 'var(--red-light)', color: 'var(--red-accent)', border: 'none', cursor: 'pointer' }}>
                            <XCircle size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeDashboardTab === 'payments' ? (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <OrderHistory />
          </div>
        ) : (
          /* ── My Profile Tab ── */
          <div style={{ animation: 'fadeIn 0.5s ease-out', maxWidth: '680px', margin: '0 auto' }}>
            {/* Current Avatar Display */}
            <div className="glass-card" style={{ padding: '36px', textAlign: 'center', marginBottom: '24px', borderRadius: '20px' }}>
              <div style={{
                width: '110px', height: '110px', borderRadius: '50%', margin: '0 auto 16px',
                background: 'linear-gradient(135deg, var(--primary-pink-light), #f3e8ff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '56px', border: '4px solid white',
                boxShadow: '0 8px 30px rgba(255,75,139,0.2)'
              }}>
                {selectedAvatar}
              </div>
              <h3 style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: '4px', color: 'var(--text-dark)' }}>
                {localStorage.getItem('her2her_user_name') || userName}
              </h3>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>
                {localStorage.getItem('her2her_user_email') || ''}
              </p>
              <span style={{
                display: 'inline-block', marginTop: '10px', padding: '4px 14px',
                background: 'var(--primary-pink-light)', color: 'var(--primary-pink)',
                borderRadius: '99px', fontSize: '0.8rem', fontWeight: 700
              }}>
                {trialInfo?.status === 'Premium' ? '⭐ Premium Member' : trialInfo?.status === 'Trial' ? '🚀 Trial Member' : '🌸 Free Member'}
              </span>
            </div>

            {/* Avatar Picker Grid */}
            <div className="glass-card" style={{ padding: '28px', borderRadius: '20px' }}>
              <h4 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '6px', color: 'var(--text-dark)' }}>Choose Your Avatar</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '20px' }}>Pick an avatar that represents you!</p>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '12px'
              }}>
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    onClick={() => handleAvatarSelect(av)}
                    style={{
                      width: '52px', height: '52px', borderRadius: '50%', border: 'none',
                      fontSize: '28px', cursor: 'pointer', transition: 'all 0.2s ease',
                      background: selectedAvatar === av
                        ? 'linear-gradient(135deg, var(--primary-pink-light), #f3e8ff)'
                        : '#f9fafb',
                      boxShadow: selectedAvatar === av
                        ? '0 0 0 3px var(--primary-pink), 0 4px 12px rgba(255,75,139,0.2)'
                        : '0 1px 4px rgba(0,0,0,0.06)',
                      transform: selectedAvatar === av ? 'scale(1.15)' : 'scale(1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    title={av}
                  >
                    {av}
                  </button>
                ))}
              </div>
              <p style={{ marginTop: '18px', fontSize: '0.8rem', color: 'var(--text-gray)', textAlign: 'center' }}>
                ✅ Avatar saved automatically when selected!
              </p>
            </div>
          </div>
        )}

      {showVideoCall && (
        <VideoCallModal
          expert={activeCallExpert}
          onClose={() => setShowVideoCall(false)}
          appointmentId={activeAppointmentId}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .mood-btn {
          background: #fff;
          border: 1px solid var(--border-color);
          padding: 8px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .mood-btn:hover {
          background: var(--primary-pink-light);
          border-color: var(--primary-pink);
          transform: translateY(-2px);
        }
        .quick-link-card:hover {
          transform: translateX(5px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }
        .badge {
          display: inline-block;
          line-height: 1;
        }
      `}} />
    </div>
  );
}
