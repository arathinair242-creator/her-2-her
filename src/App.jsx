import React, { useState, useEffect, useRef } from 'react';
import {
  Heart, Activity, Sparkles, Users, Bell, ChevronDown, Play,
  ArrowRight, ShieldCheck, CheckCircle2, MessageSquare, Video,
  Star, Smile, Info, Dumbbell, Apple, Moon, Brain, Compass,
  Mail, Phone, Calendar, Settings, HelpCircle, X, LayoutDashboard, User, LogOut, Menu
} from 'lucide-react';
import heroImg from './assets/hero_wellness.png';
import logoImg from './assets/logo.png';
import './App.css';

// Import subpages
import PlansPage from './components/PlansPage';
import AnalysisPage from './components/AnalysisPage';
import CommunityPage from './components/CommunityPage';
import ConsultPage from './components/ConsultPage';
import ProfilePage from './components/ProfilePage';
import AboutUsPage from './components/AboutUsPage';
import AssessmentWizard from './components/AssessmentWizard';
import MenstrualAssessmentWizard from './components/MenstrualAssessmentWizard';
import ExpertPortal from './components/ExpertPortal';
import UserLoginModal from './components/UserLoginModal';
import UserDashboard from './components/UserDashboard';
import ExpertDashboard from './components/ExpertDashboard';
import PartnerPortal from './components/PartnerPortal';
import PartnerLoginModal from './components/PartnerLoginModal';
import AdminDoctorManagement from './components/AdminDoctorManagement';
import AdminCentral from './components/admin/AdminCentral';
import { planDb } from './utils/planGenerator';
import { authApi, assessmentApi, consultApi, partnerApi, userApi, reviewApi } from './api/apiClient';
import './components/Pages.css';

function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'dashboard' || hash === 'expert-dashboard') return 'Dashboard';
    return 'Home';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals visibility states
  const [showAssessment, setShowAssessment] = useState(false);
  const [showMenstrualWizard, setShowMenstrualWizard] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Reminder: Log your mood today.", time: "2m ago", read: false, type: 'mood' },
    { id: 2, text: "New Tip: Cycle health & Magnesium.", time: "1h ago", read: false, type: 'tip' },
    { id: 3, text: "Consultation booked successfully!", time: "5h ago", read: true, type: 'success' }
  ]);
  const [showUserLoginModal, setShowUserLoginModal] = useState(false);
  const [showPartnerLoginModal, setShowPartnerLoginModal] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [trialEndDate, setTrialEndDate] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('her2her_is_logged_in') === 'true');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const profileDropdownRef = useRef(null);
  const navRef = useRef(null);
  const [navDropdown, setNavDropdown] = useState(null); // which tab's dropdown is open

  // Nav dropdown config
  const navDropdownConfig = {
    Home: [
      { label: '🌸 Wellness Assessment', action: () => setShowAssessment(true) },
      { label: '💬 Community Forum', action: () => setActiveTab('Community') },
      { label: '⭐ Meet Experts', action: () => setActiveTab('Consult') },
      { label: '🤖 AI Health Analysis', action: () => setActiveTab('AI Analysis') },
    ],
    Consult: [
      { label: '📅 Book Appointment', action: () => setActiveTab('Consult') },
      { label: '👩‍⚕️ Browse Experts', action: () => setActiveTab('Consult') },
      { label: '💊 PCOS / PCOD Help', action: () => setActiveTab('Consult') },
      { label: '🧘 Mental Wellness', action: () => setActiveTab('Consult') },
    ],
    Plans: [
      { label: '🥗 Nutrition Plans', action: () => setActiveTab('Plans') },
      { label: '🏋️ Fitness Plans', action: () => setActiveTab('Plans') },
      { label: '🌙 Sleep & Recovery', action: () => setActiveTab('Plans') },
      { label: '📊 Track Progress', action: () => setActiveTab('Plans') },
    ],
    Community: [
      { label: '💬 Join Discussions', action: () => setActiveTab('Community') },
      { label: '🤝 Find Support Groups', action: () => setActiveTab('Community') },
      { label: '📣 Share Your Story', action: () => setActiveTab('Community') },
      { label: '🎉 Events & Webinars', action: () => setActiveTab('Community') },
    ],
    'About Us': [
      { label: '💜 Our Story', action: () => setActiveTab('About Us') },
      { label: '👩 Meet the Team', action: () => setActiveTab('About Us') },
      { label: '📩 Contact Us', action: () => setActiveTab('About Us') },
      { label: '🤝 Partner With Us', action: () => setShowPartnerLoginModal(true) },
    ],
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
      if (navRef.current && !navRef.current.contains(e.target)) {
        setNavDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    localStorage.setItem('her2her_is_logged_in', isLoggedIn);
    if (!isLoggedIn) {
      localStorage.removeItem('her2her_token');
    } else {
      if (localStorage.getItem('intent_assessment') === 'true') {
        localStorage.removeItem('intent_assessment');
        setShowMenstrualWizard(true);
      }
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        if (isLoggedIn) {
          const assessment = await assessmentApi.getMyPlan();
          if (assessment && assessment.plan) {
            setUserProfile(assessment.plan);
            planDb.savePlan(assessment.plan);
          }
        } else {
          const activePlan = planDb.loadPlan();
          if (activePlan) {
            setUserProfile(activePlan);
          }
        }
      } catch (err) {
        console.error("Error fetching plan:", err);
        const activePlan = planDb.loadPlan();
        if (activePlan) {
          setUserProfile(activePlan);
        }
      }
    };

    fetchUserPlan();
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      const role = localStorage.getItem('her2her_role')?.toLowerCase();
      if (role === 'partner') {
        const fetchPartner = async () => {
          try {
            const data = await partnerApi.getProfile();
            setPartnerProfile(data);
          } catch (err) {
            console.error("Partner profile fetch error:", err);
          }
        };
        fetchPartner();
      }
    }
  }, [isLoggedIn]);

  const [featuredExperts, setFeaturedExperts] = useState([]);

  useEffect(() => {
    const fetchFeaturedExperts = async () => {
      try {
        const data = await expertApi.getExperts();
        // Get up to 3 verified experts
        setFeaturedExperts(data.slice(0, 3));
      } catch (err) {
        console.error('Error fetching featured experts:', err);
      }
    };
    fetchFeaturedExperts();
  }, []);

  // Interactive Wellness Score States
  const [nutrition, setNutrition] = useState(82);
  const [fitness, setFitness] = useState(76);
  const [sleep, setSleep] = useState(68);
  const [stress, setStress] = useState(71);
  const [overallScore, setOverallScore] = useState(82);

  // Dynamic Overall Score Calculation
  useEffect(() => {
    const calculated = Math.round(
      (nutrition * 0.35) +
      (fitness * 0.25) +
      (sleep * 0.20) +
      ((100 - stress) * 0.20) // Less stress = higher score contribution
    );
    setOverallScore(calculated);
  }, [nutrition, fitness, sleep, stress]);

  // Score description helper
  const getScoreStatus = (score) => {
    if (score >= 85) return { text: 'Excellent', color: '#05CD99' };
    if (score >= 70) return { text: 'Good', color: '#7C5CFF' };
    if (score >= 50) return { text: 'Fair', color: '#FFA620' };
    return { text: 'Needs Care', color: '#F43F5E' };
  };

  // AI Chatbot overlay states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your AI Health Companion. How are you feeling today?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setChatInput('');

    try {
      const responseData = await consultApi.getAiResponse(userMessage);
      setChatMessages((prev) => [...prev, { sender: 'bot', text: responseData.response }]);
    } catch (err) {
      console.error("AI Chat error:", err);
      // Fallback
      setTimeout(() => {
        setChatMessages(prev => [...prev, { sender: 'bot', text: "I'm here to help! How can I support your wellness today?" }]);
      }, 1000);
    }
  };

  // Newsletter Email
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Live reviews from DB
  const [publicReviews, setPublicReviews] = useState([]);

  useEffect(() => {
    reviewApi.getPublicReviews()
      .then(data => setPublicReviews(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Feedback form state
  const [feedbackForm, setFeedbackForm] = useState({ name: '', email: '', rating: 0, message: '' });
  const [feedbackHover, setFeedbackHover] = useState(0);
  const [feedbackStatus, setFeedbackStatus] = useState(null); // null | 'loading' | 'success' | 'error'

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackForm.name || !feedbackForm.rating || !feedbackForm.message) {
      setFeedbackStatus('error');
      setTimeout(() => setFeedbackStatus(null), 3000);
      return;
    }
    setFeedbackStatus('loading');
    try {
      await reviewApi.submitReview(feedbackForm);
      setFeedbackStatus('success');
      setFeedbackForm({ name: '', email: '', rating: 0, message: '' });
      // Refresh live reviews
      const updated = await reviewApi.getPublicReviews();
      setPublicReviews(Array.isArray(updated) ? updated : []);
      setTimeout(() => setFeedbackStatus(null), 4000);
    } catch {
      setFeedbackStatus('error');
      setTimeout(() => setFeedbackStatus(null), 3000);
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const handleTakeMenstrualAssessment = () => {
    if (!isLoggedIn) {
      localStorage.setItem('intent_assessment', 'true');
      setShowUserLoginModal(true);
    } else {
      setShowMenstrualWizard(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('her2her_token');
    localStorage.removeItem('her2her_is_logged_in');
    localStorage.removeItem('her2her_role');
    setPartnerProfile(null);
    setUserEmail(null);
    window.location.reload();
  };

  const handleStartTrial = async () => {
    if (!isLoggedIn) {
      setShowUserLoginModal(true);
      return;
    }
    try {
      const res = await userApi.activateTrial();
      const endDate = res.trialEndDate
        ? new Date(res.trialEndDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        : '7 days from today';
      setTrialEndDate(endDate);
      setShowTrialModal(true);
    } catch (err) {
      // If trial already active, still show the modal with a message
      if (err.message && err.message.toLowerCase().includes('already')) {
        setTrialEndDate('already active');
        setShowTrialModal(true);
      } else {
        alert('Could not activate trial: ' + err.message);
      }
    }
  };

  // Super secure admin login bypass fallback
  const handleAdminLogin = (email, password) => {
    if ((email === 'admin@her2her.com' || email === 'arathinair242@gmail.com') && (password === 'Arathi123' || password === 'admin123')) {
      localStorage.setItem('her2her_token', 'admin_secure_token_abc123');
      setShowAdminLogin(false);
      setActiveTab('Admin');
      window.scrollTo(0, 0);
    } else {
      alert('Incorrect secure access key. This area is for administrators only.');
    }
  };

  const handleAdminLoginSubmit = (e) => {
    e.preventDefault();
    if (adminPassword === 'Arathi123') {
      localStorage.setItem('her2her_role', 'admin');
      setShowAdminLogin(false);
      setActiveTab('Admin');
      window.scrollTo(0, 0);
    } else {
      alert('Incorrect secure access key. This area is for administrators only.');
    }
  };

  const handlePartnerLogin = (token, partner) => {
    localStorage.setItem('her2her_token', token);
    localStorage.setItem('her2her_role', 'partner');
    localStorage.setItem('her2her_is_logged_in', 'true');
    setPartnerProfile(partner);
    setUserEmail(partner.email);
    setShowPartnerLoginModal(false);
    setActiveTab('Dashboard');
  };

  // Intercept render completely for Admin Interface
  if (activeTab === 'Admin') {
    return <AdminCentral onExitAdmin={() => setActiveTab('Home')} />;
  }

  return (
    <div className="app-container">
      {/* HEADER / NAVBAR */}
      <header className="navbar-header glass-card">
        <div className="nav-container">
          <div className="logo-section" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onDoubleClick={() => setShowAdminLogin(true)} title="Double-click for secure access">
            <img src={logoImg} alt="Her-2-Her Logo" style={{ height: '90px', objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(255,75,139,0.18))' }} />
          </div>

          <nav className="nav-links" ref={navRef}>
            {['Home', 'Consult', 'Plans', 'Community', 'About Us'].map((tab) => (
              <a
                key={tab}
                href={`#${tab.toLowerCase().replace(' ', '-')}`}
                className={`nav-link-item ${activeTab === tab ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(tab);
                  setNavDropdown(null);
                }}
              >
                {tab}
                {activeTab === tab && <span className="active-dot" />}
              </a>
            ))}
            {isLoggedIn && (
              <a
                href="#dashboard"
                className={`nav-link-item ${activeTab === 'Dashboard' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setActiveTab('Dashboard'); setNavDropdown(null); }}
              >
                {localStorage.getItem('her2her_role')?.toLowerCase() === 'expert' ? 'Expert Dashboard' : localStorage.getItem('her2her_role')?.toLowerCase() === 'partner' ? 'Partner Dashboard' : 'My Dashboard'}
                {activeTab === 'Dashboard' && <span className="active-dot" />}
              </a>
            )}
            {!userEmail && (
              <a
                href="#partners"
                className="nav-link-item"
                style={{ color: 'var(--primary-pink)', fontWeight: 800 }}
                onClick={(e) => { e.preventDefault(); setShowPartnerLoginModal(true); setNavDropdown(null); }}
              >
                For Partners
              </a>
            )}
          </nav>

          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button className="btn-ghost expert-btn" onClick={() => setActiveTab('Expert Portal')}>Login as Expert</button>
            <button 
              onClick={handleTakeMenstrualAssessment} 
              className="pulse-glow"
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: 'rgba(255, 75, 139, 0.1)', padding: '6px', width: '36px', height: '36px', transition: 'all 0.3s ease' }}
              title="Menstrual Wellness Check"
            >
              🌸
            </button>
            
            {isLoggedIn ? (
              <div className="profile-nav-wrapper" style={{ position: 'relative' }} ref={profileDropdownRef}>
                <div 
                  className="profile-avatar-trigger" 
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  style={{ 
                    cursor: 'pointer',
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--primary-pink-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid transparent',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden'
                  }}
                >
                  {userProfile?.profilePicture ? (
                    <img src={userProfile.profilePicture} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={20} color="var(--primary-pink)" />
                  )}
                </div>

                {showProfileDropdown && (
                  <div className="profile-dropdown glass-card shadow-lg" style={{ 
                    position: 'absolute', 
                    top: '50px', 
                    right: 0, 
                    width: '200px', 
                    padding: '8px',
                    zIndex: 1000,
                    animation: 'fadeIn 0.2s ease-out'
                  }}>
                    <div style={{ padding: '10px', borderBottom: '1px solid var(--border-color)', marginBottom: '5px' }}>
                      <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700 }}>{localStorage.getItem('her2her_user_name') || 'Member'}</p>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-gray)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{localStorage.getItem('her2her_user_email')}</p>
                    </div>
                    <div className="dropdown-item" onClick={() => { setActiveTab('Profile'); setShowProfileDropdown(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer' }}>
                      <User size={14} /> My Profile
                    </div>
                    <div className="dropdown-item" onClick={() => { setActiveTab('Profile'); setShowProfileDropdown(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer' }}>
                      <Settings size={14} /> Settings
                    </div>
                    <div className="dropdown-item" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', color: 'var(--red-accent)' }}>
                      <LogOut size={14} /> Logout
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button className="btn-primary login-btn" onClick={() => setShowUserLoginModal(true)}>Login</button>
            )}

            <div className="notification-bell-wrapper hide-mobile" style={{ position: 'relative', marginRight: '10px' }}>
              <div 
                className={`notification-bell ${showNotifications ? 'active' : ''}`} 
                onClick={() => { setShowNotifications(!showNotifications); setShowProfileDropdown(false); }}
                style={{ cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', transition: 'all 0.3s' }}
              >
                <Bell size={22} color={showNotifications ? 'var(--primary-pink)' : 'var(--text-dark)'} />
                {notifications.some(n => !n.read) && <span className="bell-badge" style={{ position: 'absolute', top: '-2px', right: '-2px', width: '10px', height: '10px', backgroundColor: 'var(--primary-pink)', borderRadius: '50%', border: '2px solid #fff' }} />}
              </div>

              {showNotifications && (
                <div className="notification-dropdown glass-card shadow-lg" style={{ 
                  position: 'absolute', 
                  top: '50px', 
                  right: 0, 
                  width: '320px', 
                  padding: '15px', 
                  zIndex: 1001,
                  animation: 'fadeIn 0.2s ease-out'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                    <h4 style={{ margin: 0, fontWeight: 800 }}>Notifications</h4>
                    <button 
                      onClick={() => setNotifications(notifications.map(n => ({...n, read: true})))}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-pink)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.map(noti => (
                      <div key={noti.id} className={`notification-item ${noti.read ? 'read' : 'unread'}`} style={{ 
                        padding: '12px', 
                        borderRadius: '12px', 
                        backgroundColor: noti.read ? 'rgba(0,0,0,0.02)' : 'rgba(255,133,161,0.05)',
                        border: noti.read ? '1px solid transparent' : '1px solid rgba(255,133,161,0.1)',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}>
                        <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', fontWeight: noti.read ? 500 : 700, color: 'var(--text-dark)' }}>{noti.text}</p>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-gray)' }}>{noti.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-menu-drawer glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <div className="logo-section">
                <img src={logoImg} alt="Her-2-Her Logo" style={{ height: '44px', objectFit: 'contain' }} />
              </div>
              <button className="mobile-menu-close" onClick={() => setMobileMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            {isLoggedIn && (
              <div className="mobile-menu-profile" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
                <div className="mobile-avatar" style={{ width: '44px', height: '44px', borderRadius: '12px', overflow: 'hidden', background: 'var(--primary-pink-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {userProfile?.profilePicture ? (
                    <img src={userProfile.profilePicture} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={22} color="var(--primary-pink)" />
                  )}
                </div>
                <div className="mobile-profile-info" style={{ overflow: 'hidden' }}>
                  <p className="mobile-username" style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-dark)' }}>{localStorage.getItem('her2her_user_name') || 'Member'}</p>
                  <p className="mobile-email" style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-gray)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{localStorage.getItem('her2her_user_email')}</p>
                </div>
              </div>
            )}

            <nav className="mobile-nav-links" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              {['Home', 'Consult', 'Plans', 'Community', 'About Us'].map((tab) => (
                <a
                  key={tab}
                  href={`#${tab.toLowerCase().replace(' ', '-')}`}
                  className={`mobile-nav-link-item ${activeTab === tab ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab(tab);
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: activeTab === tab ? 'var(--primary-pink)' : 'var(--text-dark)',
                    background: activeTab === tab ? 'rgba(255, 75, 139, 0.08)' : 'transparent',
                    display: 'block',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab}
                </a>
              ))}
              {isLoggedIn && (
                <a
                  href="#dashboard"
                  className={`mobile-nav-link-item ${activeTab === 'Dashboard' ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('Dashboard');
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: activeTab === 'Dashboard' ? 'var(--primary-pink)' : 'var(--text-dark)',
                    background: activeTab === 'Dashboard' ? 'rgba(255, 75, 139, 0.08)' : 'transparent',
                    display: 'block',
                    transition: 'all 0.2s'
                  }}
                >
                  {localStorage.getItem('her2her_role')?.toLowerCase() === 'expert' ? 'Expert Dashboard' : localStorage.getItem('her2her_role')?.toLowerCase() === 'partner' ? 'Partner Dashboard' : 'My Dashboard'}
                </a>
              )}
              {!userEmail && (
                <a
                  href="#partners"
                  className="mobile-nav-link-item partners-link"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPartnerLoginModal(true);
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '1rem',
                    color: 'var(--primary-pink)',
                    display: 'block',
                    transition: 'all 0.2s'
                  }}
                >
                  For Partners
                </a>
              )}
            </nav>

            <div className="mobile-menu-actions" style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <button 
                className="btn-ghost mobile-expert-btn" 
                onClick={() => { setActiveTab('Expert Portal'); setMobileMenuOpen(false); }}
                style={{ width: '100%', padding: '12px', borderRadius: '99px', fontSize: '0.95rem' }}
              >
                Login as Expert
              </button>
              {isLoggedIn ? (
                <>
                  <button 
                    className="btn-ghost mobile-profile-btn" 
                    onClick={() => { setActiveTab('Profile'); setMobileMenuOpen(false); }}
                    style={{ width: '100%', padding: '12px', borderRadius: '99px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <User size={16} /> Profile Settings
                  </button>
                  <button 
                    className="btn-secondary mobile-logout-btn" 
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    style={{ width: '100%', padding: '12px', borderRadius: '99px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--red-accent)', borderColor: 'rgba(244,63,94,0.2)' }}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                <button 
                  className="btn-primary mobile-login-btn" 
                  onClick={() => { setShowUserLoginModal(true); setMobileMenuOpen(false); }}
                  style={{ width: '100%', padding: '12px', borderRadius: '99px', fontSize: '0.95rem' }}
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MAIN BODY PAGES RENDERING */}
      {activeTab === 'Home' && (
        <>
          {/* HERO SECTION */}
          <section className="hero-section" id="home">
            <div className="hero-content">
              <div className="hero-text-area">
                <h1 className="hero-title">
                  Your Complete <br />
                  <span className="gradient-text">Women's Wellness</span> <br />
                  Companion
                </h1>
                <p className="hero-subtitle">
                  Expert consultations, personalized plans, AI insights & a supportive community – all in one place.
                </p>

                <div className="hero-actions" style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
                  <button 
                    className="btn-primary hero-btn-main pulse-glow" 
                    onClick={() => setShowAssessment(true)}
                    style={{ padding: '18px 36px', fontSize: '1.1rem', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}
                  >
                    Start Assessment <ArrowRight />
                  </button>
                  <button 
                    className="btn-secondary hero-btn-sub" 
                    onClick={handleStartTrial}
                    style={{ padding: '18px 36px', fontSize: '1.1rem', borderRadius: '18px', background: 'rgba(255, 75, 139, 0.1)', color: 'var(--primary-pink)', border: '2px solid var(--primary-pink)' }}
                  >
                    Start 7-Day Free Trial
                  </button>
                </div>

                <div className="hero-trust-badge">
                  <ShieldCheck size={16} className="shield-icon" />
                  <span>Your data is private, secure & 100% confidential.</span>
                </div>
              </div>

              <div className="hero-image-area">
                <div className="hero-bg-glow" />
                <div className="hero-image-wrapper">
                  <img src={heroImg} alt="Women's Wellness Companion" className="main-hero-img" />

                  {/* Floating Widgets */}
                  <div className="floating-card top-left animate-float-slow">
                    <div className="floating-icon-wrapper pink">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <p className="floating-title">Better You</p>
                      <p className="floating-sub">Daily Goals</p>
                    </div>
                  </div>

                  <div className="floating-card top-right animate-float-medium">
                    <div className="floating-icon-wrapper red">
                      <Heart size={16} />
                    </div>
                    <div>
                      <p className="floating-title">Healthy Mind</p>
                      <p className="floating-sub">Mindfulness</p>
                    </div>
                  </div>

                  <div className="floating-card bottom-right animate-float-slow">
                    <div className="floating-icon-wrapper blue">
                      <Dumbbell size={16} />
                    </div>
                    <div>
                      <p className="floating-title">Stronger Every Day</p>
                      <p className="floating-sub">Workout Logs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* QUICK CORE CATEGORIES GRID */}
          <section className="categories-section">
            <div className="section-container">
              <div className="categories-grid">

                <div className="category-card glass-card" onClick={() => setActiveTab('Consult')} style={{ cursor: 'pointer' }}>
                  <div className="category-icon-box pink">
                    <Users size={24} />
                  </div>
                  <h3 className="category-title">Expert Consultations</h3>
                  <p className="category-desc">Connect with verified gynecologists, nutritionists & trainers.</p>
                </div>

                <div className="category-card glass-card" onClick={() => setActiveTab('Plans')} style={{ cursor: 'pointer' }}>
                  <div className="category-icon-box green">
                    <Apple size={24} />
                  </div>
                  <h3 className="category-title">Personalized Plans</h3>
                  <p className="category-desc">Get customized diet, fitness & wellness plans just for you.</p>
                </div>

                <div className="category-card glass-card" onClick={() => setActiveTab('AI Analysis')} style={{ cursor: 'pointer' }}>
                  <div className="category-icon-box purple">
                    <Brain size={24} />
                  </div>
                  <h3 className="category-title">AI Health Analysis</h3>
                  <p className="category-desc">Smart insights that understand your body & lifestyle.</p>
                </div>

                <div className="category-card glass-card" onClick={() => setActiveTab('Community')} style={{ cursor: 'pointer' }}>
                  <div className="category-icon-box blue">
                    <Heart size={24} />
                  </div>
                  <h3 className="category-title">Women-Only Community</h3>
                  <p className="category-desc">Join a safe space to share, support & grow together.</p>
                </div>

              </div>
            </div>
          </section>

          {/* INTERACTIVE WELLNESS SCORE SECTION */}
          <section className="wellness-score-section">
            <div className="section-container">
              <div className="wellness-layout">

                {/* Score Calculator Card */}
                <div className="wellness-score-card glass-card">
                  <div className="card-header">
                    <h3 className="card-title">Your Wellness Score</h3>
                    <div className="info-tooltip">
                      <Info size={16} />
                      <span className="tooltip-text">Calculated dynamically based on your lifestyle entries.</span>
                    </div>
                  </div>

                  <div className="score-widget-body">
                    {/* Dynamic Dial Gauge */}
                    <div className="score-dial-container">
                      <svg className="score-dial-svg" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" className="dial-track" />
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          className="dial-fill"
                          style={{
                            strokeDasharray: '264',
                            strokeDashoffset: `${264 - (264 * overallScore) / 100}`,
                            stroke: getScoreStatus(overallScore).color
                          }}
                        />
                      </svg>
                      <div className="score-display">
                        <span className="score-number">{overallScore}</span>
                        <span className="score-label" style={{ color: getScoreStatus(overallScore).color }}>
                          {getScoreStatus(overallScore).text}
                        </span>
                      </div>
                      <div className="score-heart-badge">
                        <Heart size={14} fill="#FF4B8B" color="#FF4B8B" />
                      </div>
                    </div>

                    {/* Slider Inputs for Wellness Parameters */}
                    <div className="score-sliders">
                      <div className="slider-item">
                        <div className="slider-label">
                          <span className="slider-title-wrapper">
                            <Apple size={16} className="icon-nutrition" /> Nutrition
                          </span>
                          <span className="slider-value">{nutrition}%</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="100"
                          value={nutrition}
                          onChange={(e) => setNutrition(parseInt(e.target.value))}
                          className="range-slider nutrition-slider"
                        />
                      </div>

                      <div className="slider-item">
                        <div className="slider-label">
                          <span className="slider-title-wrapper">
                            <Dumbbell size={16} className="icon-fitness" /> Fitness
                          </span>
                          <span className="slider-value">{fitness}%</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="100"
                          value={fitness}
                          onChange={(e) => setFitness(parseInt(e.target.value))}
                          className="range-slider fitness-slider"
                        />
                      </div>

                      <div className="slider-item">
                        <div className="slider-label">
                          <span className="slider-title-wrapper">
                            <Moon size={16} className="icon-sleep" /> Sleep Quality
                          </span>
                          <span className="slider-value">{sleep}%</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="100"
                          value={sleep}
                          onChange={(e) => setSleep(parseInt(e.target.value))}
                          className="range-slider sleep-slider"
                        />
                      </div>

                      <div className="slider-item">
                        <div className="slider-label">
                          <span className="slider-title-wrapper">
                            <Brain size={16} className="icon-stress" /> Stress Level
                          </span>
                          <span className="slider-value">{stress}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={stress}
                          onChange={(e) => setStress(parseInt(e.target.value))}
                          className="range-slider stress-slider"
                        />
                      </div>
                    </div>
                  </div>

                  <button className="btn-secondary wellness-analyze-btn w-full" onClick={() => setActiveTab('AI Analysis')}>
                    Analyze My Health <ArrowRight size={16} />
                  </button>
                </div>

                {/* Discover Wellness Profile Banner */}
                <div className="wellness-promo-card glass-card">
                  <div className="promo-text-side">
                    <h3 className="promo-title">Discover Your Wellness Profile</h3>
                    <p className="promo-subtitle">
                      Take a quick 3-minute assessment and unlock your personalized health roadmap.
                    </p>

                    <ul className="promo-list">
                      <li>
                        <span className="bullet-check"><CheckCircle2 size={16} /></span>
                        Understand your current health status
                      </li>
                      <li>
                        <span className="bullet-check"><CheckCircle2 size={16} /></span>
                        Get expert-recommended action plans
                      </li>
                      <li>
                        <span className="bullet-check"><CheckCircle2 size={16} /></span>
                        Track & scientifically improve your wellness
                      </li>
                    </ul>

                    <button className="btn-primary promo-btn pulse-glow" onClick={() => setShowAssessment(true)}>
                      Start Free Assessment <ArrowRight size={18} />
                    </button>
                  </div>

                  <div className="promo-image-side">
                    <div className="checklist-illustration">
                      <div className="illustration-sheet">
                        <div className="sheet-header">
                          <span className="sheet-clip" />
                        </div>
                        <div className="sheet-lines">
                          <div className="sheet-line check">
                            <div className="line-checkbox-checked" />
                            <div className="line-text text-sm" />
                          </div>
                          <div className="sheet-line check">
                            <div className="line-checkbox-checked" />
                            <div className="line-text text-md" />
                          </div>
                          <div className="sheet-line check">
                            <div className="line-checkbox-checked" />
                            <div className="line-text text-lg" />
                          </div>
                        </div>
                      </div>
                      <div className="floating-heart-illustration animate-float-medium">
                        <Heart size={32} fill="#FF4B8B" color="transparent" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* MEET YOUR EXPERTS SECTION */}
          <section className="experts-section" id="consult">
            <div className="section-container">
              <div className="section-header">
                <h2 className="section-title">Meet Your Experts</h2>
                <a href="#view-all-experts" className="view-all-link">View All</a>
              </div>

              <div className="experts-grid">
                {featuredExperts.length > 0 ? featuredExperts.map((expert, index) => (
                  <div className="expert-card glass-card" key={expert._id || index}>
                    <div className="expert-image-container">
                      {expert.profilePicture ? (
                        <div className="expert-avatar-placeholder" style={{ backgroundImage: `url(http://localhost:5001${expert.profilePicture})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                      ) : (
                        <div className="expert-avatar-placeholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', color: '#ffecf3', backgroundColor: 'var(--primary-pink)' }}>
                          {expert.name ? expert.name.charAt(0).toUpperCase() : '?'}
                        </div>
                      )}
                      <span className="availability-dot" />
                    </div>
                    <div className="expert-details">
                      <h4 className="expert-name">{expert.name}</h4>
                      <p className="expert-role">{expert.specialization}</p>
                      <p className="expert-exp">{expert.experience ? `${expert.experience} Years Experience` : 'Experienced Professional'}</p>

                      <div className="expert-rating">
                        <Star size={16} className="star-icon" fill="currentColor" />
                        <span className="rating-score">4.9</span>
                        <span className="rating-count">(New)</span>
                      </div>

                      <div className="expert-actions">
                        <button className="btn-chat" onClick={() => setChatOpen(true)}>
                          <MessageSquare size={16} /> Chat
                        </button>
                        <button className="btn-video">
                          <Video size={16} /> Video
                        </button>
                      </div>
                      <button className="btn-primary expert-book-btn" onClick={() => setActiveTab('Consult')}>Book Appointment</button>
                    </div>
                  </div>
                )) : (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-gray)' }}>
                    No verified experts available at the moment.
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* AI INSIGHTS & COMMUNITY SPOTLIGHT */}
          <section className="spotlight-section">
            <div className="section-container">
              <div className="spotlight-grid">

                {/* AI Health Insights */}
                <div className="spotlight-card glass-card purple-gradient-border">
                  <div className="spotlight-content">
                    <h3 className="spotlight-title">AI-Powered Health Insights</h3>
                    <p className="spotlight-desc">
                      Our AI analyzes your lifestyle, symptoms & health data to give smarter, personalized recommendations.
                    </p>
                    <button className="btn-secondary spotlight-btn" onClick={() => setActiveTab('AI Analysis')}>
                      Explore AI Analysis <ArrowRight size={16} />
                    </button>
                  </div>
                  <div className="spotlight-visual-ai">
                    <div className="ai-phone-mockup">
                      <div className="ai-phone-screen">
                        <div className="ai-circle animate-pulse-soft">
                          <Sparkles size={24} color="#7C5CFF" />
                        </div>
                        <div className="ai-bubble">
                          <p className="ai-bubble-title">Recommendation</p>
                          <p className="ai-bubble-text">Drink more water & sleep at least 7.5 hours today.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Community Spotlight */}
                <div className="spotlight-card glass-card pink-gradient-border">
                  <div className="spotlight-content">
                    <h3 className="spotlight-title">You're Not Alone</h3>
                    <p className="spotlight-desc">
                      Join a community of thousands of women who inspire, support & motivate each other every day.
                    </p>
                    <button className="btn-primary spotlight-btn flex-center" onClick={() => setActiveTab('Community')}>
                      Join Our Community <ArrowRight size={16} />
                    </button>
                  </div>
                  <div className="spotlight-visual-comm">
                    <div className="comm-avatars-cluster">
                      <div className="comm-avatar c1" />
                      <div className="comm-avatar c2" />
                      <div className="comm-avatar c3" />
                      <div className="comm-heart animate-float-medium">
                        <Heart size={20} fill="#FF4B8B" color="transparent" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* TESTIMONIALS SECTION */}
          <section className="testimonials-section">
            <div className="section-container">
              <div className="section-header">
                <h2 className="section-title">Loved by Thousands of Women</h2>
                <a href="#all-testimonials" className="view-all-link">View All</a>
              </div>

              <div className="testimonials-grid">
                {/* Static seed cards always shown */}
                <div className="testimonial-card glass-card">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#FFA620" color="#FFA620" />)}
                  </div>
                  <p className="testimonial-quote">
                    "Her-2-Her changed my life! The diet plan and expert guidance helped me feel healthier, happier and more confident."
                  </p>
                  <div className="testimonial-author">
                    <div className="author-avatar r1" />
                    <div>
                      <h5 className="author-name">Riya S.</h5>
                      <p className="author-verify">Verified Member</p>
                    </div>
                  </div>
                </div>

                <div className="testimonial-card glass-card">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#FFA620" color="#FFA620" />)}
                  </div>
                  <p className="testimonial-quote">
                    "The AI analysis is so accurate and the community support is incredible. I never feel alone on my wellness journey."
                  </p>
                  <div className="testimonial-author">
                    <div className="author-avatar r2" />
                    <div>
                      <h5 className="author-name">Kavya M.</h5>
                      <p className="author-verify">Verified Member</p>
                    </div>
                  </div>
                </div>

                <div className="testimonial-card glass-card">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#FFA620" color="#FFA620" />)}
                  </div>
                  <p className="testimonial-quote">
                    "From consultations to fitness plans, everything I need is in one beautiful app. Highly recommended!"
                  </p>
                  <div className="testimonial-author">
                    <div className="author-avatar r3" />
                    <div>
                      <h5 className="author-name">Simran K.</h5>
                      <p className="author-verify">Verified Member</p>
                    </div>
                  </div>
                </div>

                {/* Live reviews from DB */}
                {publicReviews.map((review) => (
                  <div className="testimonial-card glass-card" key={review._id}>
                    <div className="stars">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill={i < review.rating ? '#FFA620' : 'transparent'} color={i < review.rating ? '#FFA620' : '#d1d5db'} />
                      ))}
                    </div>
                    <p className="testimonial-quote">"{review.message}"</p>
                    <div className="testimonial-author">
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #FF4B8B, #7c3aed)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 800, fontSize: '1rem', flexShrink: 0
                      }}>
                        {review.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h5 className="author-name">{review.name}</h5>
                        <p className="author-verify">Community Member</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA BOTTOM BANNER */}
          <section className="cta-banner-section">
            <div className="section-container">
              <div className="cta-banner-card">
                <div className="cta-gradient-overlay" />

                <div className="cta-banner-content">
                  <div className="cta-left">
                    <div className="yoga-illustration-placeholder">
                      {/* Styled CSS SVG yoga pose */}
                      <div className="yoga-body animate-float-slow">
                        <div className="yoga-head" />
                        <div className="yoga-limbs" />
                      </div>
                    </div>
                  </div>

                  <div className="cta-center text-left">
                    <h2 className="cta-title">Ready to Prioritize Your Health?</h2>
                    <p className="cta-desc">Take the first step towards a healthier, happier and stronger you today.</p>
                  </div>

                  <div className="cta-right">
                    <button className="btn-white cta-btn font-semibold" onClick={() => setShowAssessment(true)}>
                      Start My Journey <ArrowRight size={18} />
                    </button>
                    <span className="cta-time-notice">It only takes 3 minutes!</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* STATS COUNT STRIP */}
          <section className="stats-strip-section">
            <div className="section-container">
              <div className="stats-strip">
                <div className="stat-item">
                  <div className="stat-icon-wrapper pink">
                    <Users size={20} />
                  </div>
                  <div>
                    <h4 className="stat-number">10,000+</h4>
                    <p className="stat-label">Women Empowered</p>
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-icon-wrapper violet">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h4 className="stat-number">500+</h4>
                    <p className="stat-label">Expert Consultations</p>
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-icon-wrapper green">
                    <Smile size={20} />
                  </div>
                  <div>
                    <h4 className="stat-number">95%</h4>
                    <p className="stat-label">User Satisfaction</p>
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-icon-wrapper blue">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 className="stat-number">24/7</h4>
                    <p className="stat-label">AI Health Support</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── FEEDBACK FORM SECTION ── */}
          <section className="feedback-form-section">
            <div className="section-container">
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '8px' }}>
                  Share Your Experience 💜
                </h2>
                <p style={{ color: 'var(--text-gray)', fontSize: '1rem' }}>
                  We'd love to hear from you! Your feedback helps us improve.
                </p>
              </div>

              <form
                onSubmit={handleFeedbackSubmit}
                className="glass-card"
                style={{
                  maxWidth: '680px', margin: '0 auto',
                  padding: '40px', borderRadius: '24px',
                  display: 'flex', flexDirection: 'column', gap: '20px',
                  boxShadow: '0 8px 32px rgba(255,75,139,0.08)'
                }}
              >
                {/* Star Rating Picker */}
                <div>
                  <label style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-dark)', display: 'block', marginBottom: '10px' }}>
                    Your Rating *
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1,2,3,4,5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackForm(f => ({ ...f, rating: star }))}
                        onMouseEnter={() => setFeedbackHover(star)}
                        onMouseLeave={() => setFeedbackHover(0)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', transition: 'transform 0.15s' }}
                      >
                        <Star
                          size={32}
                          fill={(feedbackHover || feedbackForm.rating) >= star ? '#FFA620' : 'transparent'}
                          color={(feedbackHover || feedbackForm.rating) >= star ? '#FFA620' : '#d1d5db'}
                          style={{ transition: 'all 0.2s', transform: feedbackHover === star ? 'scale(1.2)' : 'scale(1)' }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div className="feedback-form-row">
                  <div>
                    <label style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-dark)', display: 'block', marginBottom: '6px' }}>Name *</label>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={feedbackForm.name}
                      onChange={e => setFeedbackForm(f => ({ ...f, name: e.target.value }))}
                      style={{
                        width: '100%', padding: '12px 16px', borderRadius: '12px',
                        border: '1.5px solid var(--border-color)', fontSize: '0.95rem',
                        background: 'rgba(255,255,255,0.8)', outline: 'none',
                        transition: 'border-color 0.2s', boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-dark)', display: 'block', marginBottom: '6px' }}>Email <span style={{fontWeight:400,color:'var(--text-gray)'}}>(optional)</span></label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={feedbackForm.email}
                      onChange={e => setFeedbackForm(f => ({ ...f, email: e.target.value }))}
                      style={{
                        width: '100%', padding: '12px 16px', borderRadius: '12px',
                        border: '1.5px solid var(--border-color)', fontSize: '0.95rem',
                        background: 'rgba(255,255,255,0.8)', outline: 'none',
                        transition: 'border-color 0.2s', boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-dark)', display: 'block', marginBottom: '6px' }}>Your Review *</label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your experience with Her-2-Her…"
                    value={feedbackForm.message}
                    onChange={e => setFeedbackForm(f => ({ ...f, message: e.target.value }))}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: '12px',
                      border: '1.5px solid var(--border-color)', fontSize: '0.95rem',
                      background: 'rgba(255,255,255,0.8)', outline: 'none', resize: 'vertical',
                      fontFamily: 'inherit', transition: 'border-color 0.2s', boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Status messages */}
                {feedbackStatus === 'success' && (
                  <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(5,205,153,0.1)', border: '1px solid rgba(5,205,153,0.3)', color: '#059669', fontWeight: 600, fontSize: '0.9rem' }}>
                    ✅ Thank you! Your review has been submitted and will appear in the community section.
                  </div>
                )}
                {feedbackStatus === 'error' && (
                  <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#e11d48', fontWeight: 600, fontSize: '0.9rem' }}>
                    ⚠️ Please fill in your name, a star rating, and a message before submitting.
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={feedbackStatus === 'loading'}
                  className="btn-primary pulse-glow"
                  style={{ padding: '14px 32px', fontSize: '1rem', borderRadius: '14px', alignSelf: 'flex-start', opacity: feedbackStatus === 'loading' ? 0.7 : 1 }}
                >
                  {feedbackStatus === 'loading' ? 'Submitting…' : 'Submit Review ✨'}
                </button>
              </form>
            </div>
          </section>
        </>
      )}

      {/* SUBPAGE COMPONENT INJECTIONS */}
      {activeTab === 'Consult' && <ConsultPage setChatOpen={setChatOpen} />}
      {activeTab === 'Plans' && (
        <PlansPage
          setChatOpen={setChatOpen}
          userProfile={userProfile}
          onStartAssessment={() => setShowAssessment(true)}
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          onOpenLogin={() => setShowUserLoginModal(true)}
        />
      )}
      {activeTab === 'AI Analysis' && <AnalysisPage userProfile={userProfile} />}
      {activeTab === 'Community' && <CommunityPage userProfile={userProfile} />}
      {activeTab === 'Profile' && <ProfilePage userProfile={userProfile} />}
      {activeTab === 'About Us' && <AboutUsPage />}
      {activeTab === 'Expert Portal' && <ExpertPortal />}
      {activeTab === 'Dashboard' && (
        <main>
          {localStorage.getItem('her2her_role')?.toLowerCase() === 'partner' ? 
          <PartnerPortal partnerData={partnerProfile} /> : 
          (localStorage.getItem('her2her_role')?.toLowerCase() === 'expert' ? <ExpertDashboard /> : <UserDashboard setActiveTab={setActiveTab} />)}
        </main>
      )}

      {/* FOOTER */}
      {activeTab === 'Home' && (
        <footer className="main-footer">
          <div className="section-container">
            <div className="footer-top-grid">
              <div className="footer-brand-column">
                <div className="logo-section" style={{ display: 'flex', alignItems: 'center' }}>
                  <img src={logoImg} alt="Her-2-Her Logo" style={{ height: '44px', objectFit: 'contain' }} />
                </div>
                <p className="brand-pitch">
                  Empowering every woman to live healthier, happier & confident every single day.
                </p>
                <div className="social-links-row">
                  <a href="https://www.instagram.com/hertoher_heart?igsh=ZTNrZ3RqOWF6NDlr" target="_blank" rel="noreferrer" className="social-link-icon">i</a>
                  <a href="https://www.youtube.com/@Her-2-Her" target="_blank" rel="noreferrer" className="social-link-icon">▶</a>
                </div>
              </div>

              <div className="footer-links-column">
                <h5 className="footer-column-heading">Quick Links</h5>
                <ul className="footer-links-list">
                  <li><a href="#home" onClick={(e) => { e.preventDefault(); setActiveTab('Home'); window.scrollTo(0, 0); }}>Home</a></li>
                  <li><a href="#consult" onClick={(e) => { e.preventDefault(); setActiveTab('Consult'); window.scrollTo(0, 0); }}>Consult</a></li>
                  <li><a href="#plans" onClick={(e) => { e.preventDefault(); setActiveTab('Plans'); window.scrollTo(0, 0); }}>Plans</a></li>
                  <li><a href="#community" onClick={(e) => { e.preventDefault(); setActiveTab('Community'); window.scrollTo(0, 0); }}>Community</a></li>
                  <li><a href="#about" onClick={(e) => { e.preventDefault(); setActiveTab('About Us'); window.scrollTo(0, 0); }}>About Us</a></li>
                </ul>
              </div>

              <div className="footer-links-column">
                <h5 className="footer-column-heading">For You</h5>
                <ul className="footer-links-list">
                  <li><a href="#" onClick={(e) => { e.preventDefault(); setShowAssessment(true); }}>Wellness Assessment</a></li>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('AI Analysis'); window.scrollTo(0, 0); }}>AI Health Analysis</a></li>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Blog coming soon!'); }}>Health Blog</a></li>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Success stories coming soon!'); }}>Success Stories</a></li>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Contact us at support@her2her.com'); }}>Contact Us</a></li>
                </ul>
              </div>

              <div className="footer-links-column">
                <h5 className="footer-column-heading">For Experts</h5>
                <ul className="footer-links-list">
                  <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('Expert Portal'); window.scrollTo(0, 0); }}>Become an Expert</a></li>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('Expert Portal'); window.scrollTo(0, 0); }}>Expert Login</a></li>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Expert resources coming soon!'); }}>Resources</a></li>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Platform guidelines coming soon!'); }}>Guidelines</a></li>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Partner support is available 24/7.'); }}>Support</a></li>
                </ul>
              </div>

              <div className="footer-newsletter-column">
                <h5 className="footer-column-heading">Subscribe to Our Newsletter</h5>
                <p className="newsletter-pitch">Stay updated with health tips, expert advice & latest updates.</p>
                <form onSubmit={handleSubscribe} className="newsletter-form">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="newsletter-input"
                    required
                  />
                  <button type="submit" className="newsletter-submit-btn">
                    <ArrowRight size={18} />
                  </button>
                </form>
                {subscribed && <p className="subscribe-success">✓ Subscribed successfully!</p>}
              </div>
            </div>

            <div className="footer-bottom">
              <p className="copyright-text">© {new Date().getFullYear()} Her-2-Her. All rights reserved.</p>
              <div className="footer-legal-links">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Refund Policy</a>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="mobile-bottom-nav">
        <div
          className={`bottom-nav-item ${activeTab === 'Home' ? 'active' : ''}`}
          onClick={() => setActiveTab('Home')}
        >
          <Heart size={20} fill={activeTab === 'Home' ? 'currentColor' : 'none'} />
          <span>Home</span>
        </div>
        <div
          className={`bottom-nav-item ${activeTab === 'Consult' ? 'active' : ''}`}
          onClick={() => setActiveTab('Consult')}
        >
          <Activity size={20} />
          <span>Consult</span>
        </div>

        {/* Dynamic 3rd slot: Shows AI Analysis if active, otherwise Plans */}
        {activeTab === 'AI Analysis' ? (
          <div
            className="bottom-nav-item active"
            onClick={() => setActiveTab('AI Analysis')}
          >
            <Sparkles size={20} fill="currentColor" />
            <span>AI Analysis</span>
          </div>
        ) : (
          <div
            className={`bottom-nav-item ${activeTab === 'Plans' ? 'active' : ''}`}
            onClick={() => setActiveTab('Plans')}
          >
            <Calendar size={20} />
            <span>Plans</span>
          </div>
        )}

        <div
          className={`bottom-nav-item ${activeTab === 'Community' ? 'active' : ''}`}
          onClick={() => setActiveTab('Community')}
        >
          <Users size={20} />
          <span>Community</span>
        </div>
        <div
          className={`bottom-nav-item ${activeTab === 'Profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('Profile')}
        >
          <Smile size={20} />
          <span>Profile</span>
        </div>
      </div>

      {/* FLOATING CHAT WIDGET */}
      <div className={`chat-widget-wrapper ${chatOpen ? 'open' : ''}`}>
        {!chatOpen ? (
          <button className="chat-trigger-btn pulse-glow" onClick={() => setChatOpen(true)}>
            <div className="chat-trigger-icon">
              <Sparkles size={20} />
            </div>
            <span className="chat-trigger-label">Ask Health AI</span>
          </button>
        ) : (
          <div className="chat-window glass-card">
            <div className="chat-header">
              <div className="chat-header-title">
                <Sparkles size={16} className="text-pink animate-pulse-soft" />
                <div>
                  <h4 className="chat-bot-name">Her-2-Her Health AI</h4>
                  <p className="chat-bot-status">Online • Health Companion</p>
                </div>
              </div>
              <button className="chat-close-btn" onClick={() => setChatOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="chat-messages-box">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`chat-message-bubble ${msg.sender}`}>
                  <p className="message-text">{msg.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="chat-input-row">
              <input
                type="text"
                placeholder="Ask me about cycle cramps, PCOS diets, workouts..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="chat-text-input"
              />
              <button type="submit" className="chat-send-btn">
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        )}
      </div>

      {showAssessment && (
        <AssessmentWizard
          onClose={() => setShowAssessment(false)}
          onComplete={(results) => {
            console.log("Assessment completed:", results);
            setUserProfile(results);
            setShowAssessment(false);
            alert("Assessment complete! Your personalized wellness profile has been updated.");
          }}
        />
      )}

      {showMenstrualWizard && (
        <MenstrualAssessmentWizard 
          onClose={() => setShowMenstrualWizard(false)}
          onComplete={(recommendedSpecialist) => {
            setShowMenstrualWizard(false);
            setActiveTab('Consult');
            if (recommendedSpecialist) {
              // Can set this to trigger UI change in Consult Page, but we'll modify ConsultPage logic via local state or URL
              sessionStorage.setItem('her2her_recommended_specialist', recommendedSpecialist);
            }
          }}
        />
      )}

      {showUserLoginModal && (
        <UserLoginModal
          onClose={() => setShowUserLoginModal(false)}
          onLoginSuccess={(email) => {
            setIsLoggedIn(true);
            setUserEmail(email);
            const plan = planDb.loadPlan();
            if (plan) {
              setUserProfile(plan);
            }
            // Auto-redirect to dashboard
            setActiveTab('Dashboard');
          }}
        />
      )}

      {showPartnerLoginModal && (
        <PartnerLoginModal 
          onClose={() => setShowPartnerLoginModal(false)} 
          onLoginSuccess={handlePartnerLogin} 
        />
      )}

      {/* 7-Day Free Trial Success Modal */}
      {showTrialModal && (
        <div className="modal-overlay" style={{ zIndex: 3000 }}>
          <div className="modal-card glass-card" style={{ maxWidth: '440px', padding: '36px', textAlign: 'center', position: 'relative' }}>
            <button
              onClick={() => setShowTrialModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}
            >
              <X size={20} />
            </button>

            {/* Celebration icon */}
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF4B8B, #7C5CFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Sparkles size={32} color="#fff" />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '8px' }}>
              {trialEndDate === 'already active' ? 'Trial Already Active! 🎉' : '7-Day Free Trial Started! 🎉'}
            </h2>
            <p style={{ color: 'var(--text-gray)', fontSize: '0.95rem', marginBottom: '24px' }}>
              {trialEndDate === 'already active'
                ? 'Your premium trial is already running. Enjoy all premium features!'
                : `Your premium access is active until ${trialEndDate}. Enjoy everything Her-2-Her has to offer!`}
            </p>

            {/* Benefits list */}
            <div style={{ background: 'rgba(255,75,139,0.04)', borderRadius: '16px', padding: '18px', marginBottom: '24px', textAlign: 'left' }}>
              <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-dark)', marginBottom: '12px' }}>✨ What's unlocked:</p>
              {[
                '🩺 Unlimited expert consultations',
                '🤖 Full AI health analysis & insights',
                '📋 Personalized nutrition & fitness plans',
                '💬 Priority community access',
                '📅 Advance appointment booking',
              ].map((benefit, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: 500 }}>
                  {benefit}
                </div>
              ))}
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', padding: '14px', borderRadius: '99px', fontWeight: 700, fontSize: '1rem' }}
              onClick={() => { setShowTrialModal(false); setActiveTab('Consult'); }}
            >
              Start Exploring Experts →
            </button>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '12px' }}>No credit card required. Cancel anytime.</p>
          </div>
        </div>
      )}
      {showAdminLogin && (
        <div className="modal-overlay" style={{ zIndex: 3000 }}>
          <div className="modal-card glass-card" style={{ maxWidth: '400px', padding: '30px', position: 'relative' }}>
            <button className="modal-close-btn" onClick={() => setShowAdminLogin(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            <h3 style={{ marginBottom: '20px', fontWeight: 800 }}>Admin Access</h3>
            <form onSubmit={handleAdminLoginSubmit}>
              <div className="modal-form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Admin Access Key</label>
                <input 
                  type="password" 
                  value={adminPassword} 
                  onChange={(e) => setAdminPassword(e.target.value)} 
                  className="modal-form-input" 
                  placeholder="Enter access key..."
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
                  required 
                />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', border: 'none', cursor: 'pointer' }}>Verify Access</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
