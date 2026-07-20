import React, { useState } from 'react';
import { 
  Users, Lock, Mail, ChevronRight, X, Sparkles, 
  ShieldCheck, Upload, Save, HelpCircle, Eye, EyeOff 
} from 'lucide-react';
import { authApi, consultApi } from '../api/apiClient';
import { useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = '1008261506362-1ta526ufb172q963i83en9c9gecjdh6j.apps.googleusercontent.com';

const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('JWT decode error:', err);
    return null;
  }
};

export default function ExpertPortal() {
  const [activeFormTab, setActiveFormTab] = useState('register'); // register, login
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoggedExpert, setIsLoggedExpert] = useState(false);
  const [expertAppointments, setExpertAppointments] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');

  // File upload states
  const [profilePhoto, setProfilePhoto] = useState({ url: '', name: '' });
  const [degreeCertificate, setDegreeCertificate] = useState({ url: '', name: '' });
  const [governmentId, setGovernmentId] = useState({ url: '', name: '' });
  const [medicalRegistration, setMedicalRegistration] = useState({ url: '', name: '' });
  const [uploadLoading, setUploadLoading] = useState({
    profilePhoto: false,
    degreeCertificate: false,
    governmentId: false,
    medicalRegistration: false
  });

  const handleFileUpload = async (e, fieldName, setFieldState) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit: Profile: 2MB, others: 5MB
    const maxSize = fieldName === 'profilePhoto' ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File size exceeds the limit (${fieldName === 'profilePhoto' ? '2MB' : '5MB'}).`);
      return;
    }

    setUploadLoading(prev => ({ ...prev, [fieldName]: true }));
    try {
      const result = await authApi.uploadFile(file);
      if (result && result.success) {
        setFieldState({ url: result.fileUrl, name: file.name });
      } else {
        alert('File upload failed: ' + (result?.message || 'Unknown error'));
      }
    } catch (err) {
      alert('File upload failed: ' + err.message);
    } finally {
      setUploadLoading(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const [qualification, setQualification] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('');

  const [consultTypes, setConsultTypes] = useState({
    video: false,
    chat: false,
    audio: false,
    inPerson: false
  });

  const [services, setServices] = useState({
    pcos: false,
    pregnancy: false,
    fertility: false,
    diet: false,
    weight: false,
    mental: false,
    yoga: false,
    fitness: false,
    skin: false,
    menopause: false
  });

  const [charges, setCharges] = useState({
    video: '',
    chat: '',
    audio: '',
    inPerson: ''
  });

  const [availableDays, setAvailableDays] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [aboutMe, setAboutMe] = useState('');

  const [bankAccountName, setBankAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankNumber, setBankNumber] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankUpi, setBankUpi] = useState('');

  // Handle day selection toggle
  const toggleDay = (day) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter(d => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regPassword || regPassword.length < 6) {
      alert('Please enter a password with at least 6 characters.');
      return;
    }

    const payload = {
      name: fullName,
      email,
      password: regPassword,
      phone,
      gender,
      dob,
      qualification,
      specialization,
      experience,
      consultationTypes: consultTypes,
      services: Object.keys(services).filter(k => services[k]),
      charges,
      availability: {
        days: availableDays,
        startTime,
        endTime
      },
      aboutMe,
      bankingDetails: {
        accountName: bankAccountName,
        bankName,
        accountNumber: bankNumber,
        ifscCode: bankIfsc,
        upiId: bankUpi
      },
      profilePicture: profilePhoto.url,
      degreeCertificate: degreeCertificate.url,
      governmentId: governmentId.url,
      medicalRegistration: medicalRegistration.url
    };

    try {
      const data = await authApi.registerExpert(payload);
      if (data && data.token) {
        localStorage.setItem('her2her_token', data.token);
        setSuccessMsg('Your application has been submitted successfully for verification! Our team will review it and get back to you within 24-48 hours.');
      }
    } catch (err) {
      alert('Registration failed: ' + err.message);
    }
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    if (isLoggedExpert) {
      const fetchAppointments = async () => {
        setIsDataLoading(true);
        try {
          const data = await consultApi.getExpertSessions();
          setExpertAppointments(data);
        } catch (err) {
          console.error("Failed to fetch appointments:", err);
        } finally {
          setIsDataLoading(false);
        }
      };
      fetchAppointments();
    }
  }, [isLoggedExpert]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await authApi.loginExpert({ email, password: loginPassword });
      if (data && data.token) {
        // Clear any existing user session before setting expert session
        localStorage.removeItem('her2her_token');
        localStorage.removeItem('her2her_role');
        localStorage.removeItem('her2her_is_logged_in');
        localStorage.setItem('her2her_token', data.token);
        localStorage.setItem('her2her_role', 'expert');
        localStorage.setItem('her2her_is_logged_in', 'true');
        setIsLoggedExpert(true);
        setSuccessMsg('Successfully logged into your partner dashboard!');
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (err) {
      alert('Login failed: ' + err.message);
    }
    window.scrollTo(0, 0);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = decodeJwt(credentialResponse.credential);
      if (!decoded) throw new Error('Failed to decode Google token');

      const data = await authApi.googleLogin({
        email: decoded.email,
        name: decoded.name,
        googleId: decoded.sub,
        profilePicture: decoded.picture,
        role: 'expert'
      });

      if (data && data.token) {
        localStorage.setItem('her2her_token', data.token);
        localStorage.setItem('her2her_role', 'expert');
        localStorage.setItem('her2her_is_logged_in', 'true');
        setIsLoggedExpert(true);
        setSuccessMsg('Successfully logged into your partner dashboard!');
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (err) {
      console.error('Google Auth error:', err);
      alert('Google Auth failed: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="page-container" style={{ maxWidth: '1200px' }}>
      
      {/* Banner */}
      <div className="page-banner-card" style={{ background: 'linear-gradient(135deg, rgba(255, 75, 139, 0.1) 0%, rgba(124, 92, 255, 0.1) 100%)' }}>
        <div className="page-banner-content" style={{ maxWidth: '100%' }}>
          <h1 className="page-banner-title">Expert Partner Program</h1>
          <p className="page-banner-desc">
            Join Her-2-Her as a verified gynecologist, nutritionist, or trainer. Partner with us to deliver high-quality, compassionate care to women globally.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="glass-card" style={{ padding: '20px', background: 'var(--teal-light)', border: '2px solid var(--teal-accent)', color: 'var(--text-dark)', marginBottom: '30px', textAlign: 'center', fontWeight: 'bold' }}>
          ✓ {successMsg}
          <button className="btn-ghost" onClick={() => setSuccessMsg('')} style={{ float: 'right', fontWeight: 'bold' }}>Close</button>
        </div>
      )}

      {isLoggedExpert ? (
        <div className="glass-card" style={{ padding: '30px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Welcome to your Dashboard</h2>
            <button className="btn-secondary" onClick={() => {
              // FIX: Clear all session data on expert logout
              localStorage.removeItem('her2her_token');
              localStorage.removeItem('her2her_role');
              localStorage.removeItem('her2her_is_logged_in');
              setIsLoggedExpert(false);
            }}>Logout</button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '40px' }}>
            <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: 600 }}>Total Patients</p>
              <h3 style={{ fontSize: '2rem', color: 'var(--secondary-violet)' }}>{expertAppointments.length}</h3>
            </div>
            <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: 600 }}>Video Sessions</p>
              <h3 style={{ fontSize: '2rem', color: 'var(--primary-pink)' }}>{expertAppointments.filter(a => a.type === 'Video').length}</h3>
            </div>
            <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: 600 }}>Pending Reviews</p>
              <h3 style={{ fontSize: '2rem', color: '#f59e0b' }}>2</h3>
            </div>
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px' }}>Upcoming Appointments</h3>
          {isDataLoading ? (
            <p>Loading your schedule...</p>
          ) : expertAppointments.length === 0 ? (
            <p style={{ color: 'var(--text-light)' }}>No upcoming appointments found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {expertAppointments.map(app => (
                <div key={app._id} className="glass-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {app.user?.name?.[0] || 'U'}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, margin: 0 }}>{app.user?.name || 'Anonymous User'}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', margin: 0 }}>{app.user?.email || 'No email'}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 700, margin: 0, color: 'var(--secondary-violet)' }}>{app.date}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', margin: 0 }}>{app.time} ({app.type})</p>
                  </div>
                  <button className="btn-primary" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem' }}>Join Call</button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', alignItems: 'start', marginBottom: '40px' }}>
        
        {/* Left Column: Register Form */}
        <div className="glass-card" style={{ padding: '30px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '24px', borderBottom: '2px solid var(--border-color)', paddingBottom: '12px' }}>Expert Registration Form</h2>
          
          <form onSubmit={handleRegisterSubmit}>
            
            {/* 1. Personal Information */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontWeight: 800, color: 'var(--secondary-violet)', marginBottom: '14px', fontSize: '0.95rem' }}>1. Personal Information</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="modal-form-group">
                  <label>Full Name *</label>
                  <input type="text" className="modal-form-input" placeholder="Enter your full name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="modal-form-group">
                  <label>Email Address *</label>
                  <input type="email" className="modal-form-input" placeholder="Enter your email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
              <div className="modal-form-group" style={{ marginBottom: '16px' }}>
                <label>Password * <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 400 }}>(min. 6 characters)</span></label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input type={showRegPassword ? "text" : "password"} className="modal-form-input" placeholder="Create a password" required minLength={6} style={{ paddingRight: '40px', width: '100%' }} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
                  <button 
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '16px' }}>
                <div className="modal-form-group">
                  <label>Mobile Number *</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ padding: '12px 10px', background: 'var(--border-color)', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600 }}>🇮🇳 +91</span>
                    <input type="tel" className="modal-form-input" placeholder="Enter phone" required value={phone} onChange={(e) => setPhone(e.target.value)} style={{ flexGrow: 1 }} />
                  </div>
                </div>
                <div className="modal-form-group">
                  <label>Gender *</label>
                  <select className="modal-form-input" required value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="">Select gender</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="modal-form-group">
                  <label>Date of Birth *</label>
                  <input type="date" className="modal-form-input" required value={dob} onChange={(e) => setDob(e.target.value)} />
                </div>
              </div>
            </div>

            {/* 2. Professional Information */}
            <div style={{ marginBottom: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <h4 style={{ fontWeight: 800, color: 'var(--secondary-violet)', marginBottom: '14px', fontSize: '0.95rem' }}>2. Professional Information</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="modal-form-group">
                  <label>Qualification *</label>
                  <input type="text" className="modal-form-input" placeholder="Enter qualification" required value={qualification} onChange={(e) => setQualification(e.target.value)} />
                </div>
                <div className="modal-form-group">
                  <label>Specialization *</label>
                  <select className="modal-form-input" required value={specialization} onChange={(e) => setSpecialization(e.target.value)}>
                    <option value="">Select specialty</option>
                    <option value="Gynecologist">Gynecologist</option>
                    <option value="Nutritionist">Nutritionist</option>
                    <option value="Fitness Trainer">Fitness Trainer</option>
                  </select>
                </div>
                <div className="modal-form-group">
                  <label>Years of Experience *</label>
                  <select className="modal-form-input" required value={experience} onChange={(e) => setExperience(e.target.value)}>
                    <option value="">Select experience</option>
                    <option value="0-2 years">0 - 2 years</option>
                    <option value="3-5 years">3 - 5 years</option>
                    <option value="6-9 years">6 - 9 years</option>
                    <option value="10+ years">10+ years</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Consultation Type */}
            <div style={{ marginBottom: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <h4 style={{ fontWeight: 800, color: 'var(--secondary-violet)', marginBottom: '14px', fontSize: '0.95rem' }}>3. Consultation Type</h4>
              
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {[
                  { key: 'video', label: 'Video Consultation' },
                  { key: 'chat', label: 'Chat Consultation' },
                  { key: 'audio', label: 'Audio Consultation' },
                  { key: 'inPerson', label: 'In-Person Consultation' }
                ].map(type => (
                  <label key={type.key} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                    <input type="checkbox" checked={consultTypes[type.key]} onChange={() => setConsultTypes({ ...consultTypes, [type.key]: !consultTypes[type.key] })} style={{ width: '18px', height: '18px' }} />
                    {type.label}
                  </label>
                ))}
              </div>
            </div>

            {/* 4. Services Offered */}
            <div style={{ marginBottom: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <h4 style={{ fontWeight: 800, color: 'var(--secondary-violet)', marginBottom: '14px', fontSize: '0.95rem' }}>4. Services Offered <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 500 }}>(Select all that apply)</span></h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { key: 'pcos', label: 'PCOS Consultation' },
                  { key: 'pregnancy', label: 'Pregnancy Guidance' },
                  { key: 'fertility', label: 'Fertility Counseling' },
                  { key: 'diet', label: 'Diet Planning' },
                  { key: 'weight', label: 'Weight Management' },
                  { key: 'mental', label: 'Mental Wellness' },
                  { key: 'yoga', label: 'Yoga Sessions' },
                  { key: 'fitness', label: 'Fitness Coaching' },
                  { key: 'skin', label: 'Skin & Hair Health' },
                  { key: 'menopause', label: 'Menopause Support' }
                ].map(serv => (
                  <label key={serv.key} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                    <input type="checkbox" checked={services[serv.key]} onChange={() => setServices({ ...services, [serv.key]: !services[serv.key] })} style={{ width: '16px', height: '16px' }} />
                    {serv.label}
                  </label>
                ))}
              </div>
            </div>

            {/* 5. Consultation Charges */}
            <div style={{ marginBottom: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <h4 style={{ fontWeight: 800, color: 'var(--secondary-violet)', marginBottom: '14px', fontSize: '0.95rem' }}>5. Consultation Charges <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 500 }}>(in ₹)</span></h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="modal-form-group">
                  <label>Video Session Fee</label>
                  <input type="number" className="modal-form-input" placeholder="₹ Amount" value={charges.video} onChange={(e) => setCharges({ ...charges, video: e.target.value })} />
                </div>
                <div className="modal-form-group">
                  <label>Chat Consultation Fee</label>
                  <input type="number" className="modal-form-input" placeholder="₹ Amount" value={charges.chat} onChange={(e) => setCharges({ ...charges, chat: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="modal-form-group">
                  <label>Audio Consultation Fee</label>
                  <input type="number" className="modal-form-input" placeholder="₹ Amount" value={charges.audio} onChange={(e) => setCharges({ ...charges, audio: e.target.value })} />
                </div>
                <div className="modal-form-group">
                  <label>In-Person Session Fee</label>
                  <input type="number" className="modal-form-input" placeholder="₹ Amount" value={charges.inPerson} onChange={(e) => setCharges({ ...charges, inPerson: e.target.value })} />
                </div>
              </div>
            </div>

            {/* 6. Availability */}
            <div style={{ marginBottom: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <h4 style={{ fontWeight: 800, color: 'var(--secondary-violet)', marginBottom: '14px', fontSize: '0.95rem' }}>6. Availability</h4>
              
              <div className="modal-form-group" style={{ marginBottom: '16px' }}>
                <label>Available Days *</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                    const isSel = availableDays.includes(day);
                    return (
                      <button 
                        type="button"
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`calendar-day-col ${isSel ? 'active' : ''}`}
                        style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="modal-form-group">
                  <label>Start Time *</label>
                  <input type="time" className="modal-form-input" required value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
                <div className="modal-form-group">
                  <label>End Time *</label>
                  <input type="time" className="modal-form-input" required value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
              </div>
            </div>

            {/* 7. Documents Upload */}
            <div style={{ marginBottom: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <h4 style={{ fontWeight: 800, color: 'var(--secondary-violet)', marginBottom: '14px', fontSize: '0.95rem' }}>7. Documents Upload</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                {/* Profile Photo */}
                <div className="glass-card" style={{ padding: '14px', textAlign: 'center', borderStyle: 'dashed', borderColor: 'var(--secondary-violet)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)', display: 'block', marginBottom: '8px' }}>Upload Profile Photo (JPG, PNG. Max 2MB)</span>
                  <input 
                    type="file" 
                    id="profilePhotoInput" 
                    accept="image/jpeg,image/png" 
                    style={{ display: 'none' }} 
                    onChange={(e) => handleFileUpload(e, 'profilePhoto', setProfilePhoto)} 
                  />
                  <label htmlFor="profilePhotoInput" className="btn-secondary" style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', justifyContent: 'center' }}>
                    <Upload size={12} /> {uploadLoading.profilePhoto ? 'Uploading...' : 'Upload File'}
                  </label>
                  {profilePhoto.name && (
                    <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: 'green', fontWeight: 650 }}>✓ {profilePhoto.name}</p>
                  )}
                </div>

                {/* Degree Certificate */}
                <div className="glass-card" style={{ padding: '14px', textAlign: 'center', borderStyle: 'dashed', borderColor: 'var(--secondary-violet)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)', display: 'block', marginBottom: '8px' }}>Upload Degree Certificate (PDF, JPG, PNG. Max 5MB)</span>
                  <input 
                    type="file" 
                    id="degreeCertificateInput" 
                    accept=".pdf,image/jpeg,image/png" 
                    style={{ display: 'none' }} 
                    onChange={(e) => handleFileUpload(e, 'degreeCertificate', setDegreeCertificate)} 
                  />
                  <label htmlFor="degreeCertificateInput" className="btn-secondary" style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', justifyContent: 'center' }}>
                    <Upload size={12} /> {uploadLoading.degreeCertificate ? 'Uploading...' : 'Upload File'}
                  </label>
                  {degreeCertificate.name && (
                    <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: 'green', fontWeight: 650 }}>✓ {degreeCertificate.name}</p>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Government ID */}
                <div className="glass-card" style={{ padding: '14px', textAlign: 'center', borderStyle: 'dashed', borderColor: 'var(--secondary-violet)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)', display: 'block', marginBottom: '8px' }}>Upload Government ID (PDF, JPG, PNG. Max 5MB)</span>
                  <input 
                    type="file" 
                    id="governmentIdInput" 
                    accept=".pdf,image/jpeg,image/png" 
                    style={{ display: 'none' }} 
                    onChange={(e) => handleFileUpload(e, 'governmentId', setGovernmentId)} 
                  />
                  <label htmlFor="governmentIdInput" className="btn-secondary" style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', justifyContent: 'center' }}>
                    <Upload size={12} /> {uploadLoading.governmentId ? 'Uploading...' : 'Upload File'}
                  </label>
                  {governmentId.name && (
                    <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: 'green', fontWeight: 650 }}>✓ {governmentId.name}</p>
                  )}
                </div>

                {/* Medical Registration Certificate */}
                <div className="glass-card" style={{ padding: '14px', textAlign: 'center', borderStyle: 'dashed', borderColor: 'var(--secondary-violet)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)', display: 'block', marginBottom: '8px' }}>Medical Registration Certificate (PDF, JPG, PNG. Max 5MB)</span>
                  <input 
                    type="file" 
                    id="medicalRegistrationInput" 
                    accept=".pdf,image/jpeg,image/png" 
                    style={{ display: 'none' }} 
                    onChange={(e) => handleFileUpload(e, 'medicalRegistration', setMedicalRegistration)} 
                  />
                  <label htmlFor="medicalRegistrationInput" className="btn-secondary" style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', justifyContent: 'center' }}>
                    <Upload size={12} /> {uploadLoading.medicalRegistration ? 'Uploading...' : 'Upload File'}
                  </label>
                  {medicalRegistration.name && (
                    <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: 'green', fontWeight: 650 }}>✓ {medicalRegistration.name}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 8. About Yourself */}
            <div style={{ marginBottom: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <h4 style={{ fontWeight: 800, color: 'var(--secondary-violet)', marginBottom: '14px', fontSize: '0.95rem' }}>8. About Yourself</h4>
              <div className="modal-form-group">
                <label>Tell patients about your experience, expertise, and approach to health</label>
                <textarea className="modal-form-textarea" placeholder="Write about yourself..." value={aboutMe} onChange={(e) => setAboutMe(e.target.value)} maxLength={1000} />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', textAlign: 'right', display: 'block', marginTop: '4px' }}>{aboutMe.length} / 1000 characters</span>
              </div>
            </div>

            {/* 9. Banking Details */}
            <div style={{ marginBottom: '30px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <h4 style={{ fontWeight: 800, color: 'var(--secondary-violet)', marginBottom: '14px', fontSize: '0.95rem' }}>9. Banking Details</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="modal-form-group">
                  <label>Account Holder Name *</label>
                  <input type="text" className="modal-form-input" placeholder="Account holder name" value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)} />
                </div>
                <div className="modal-form-group">
                  <label>Bank Name *</label>
                  <input type="text" className="modal-form-input" placeholder="Bank name" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                </div>
                <div className="modal-form-group">
                  <label>Account Number *</label>
                  <input type="text" className="modal-form-input" placeholder="Account number" value={bankNumber} onChange={(e) => setBankNumber(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '16px' }}>
                <div className="modal-form-group">
                  <label>IFSC Code *</label>
                  <input type="text" className="modal-form-input" placeholder="IFSC code" value={bankIfsc} onChange={(e) => setBankIfsc(e.target.value)} />
                </div>
                <div className="modal-form-group">
                  <label>UPI ID (optional)</label>
                  <input type="text" className="modal-form-input" placeholder="UPI ID" value={bankUpi} onChange={(e) => setBankUpi(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <button type="button" className="btn-secondary" style={{ padding: '12px 30px', borderRadius: '99px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}><Save size={16} /> Save Draft</button>
              <button type="submit" className="btn-primary" style={{ padding: '12px 36px', borderRadius: '99px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '8px' }}><ShieldCheck size={18} /> Submit For Verification</button>
            </div>
            
            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px', justifyContent: 'center' }}>
              🔒 Your information is secure and will only be used for verification purposes.
            </div>

          </form>
        </div>

        {/* Right Column: Expert Login */}
        <div className="glass-card" style={{ padding: '30px', position: 'sticky', top: '100px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-dark)' }}>Expert Login</h3>
          <p style={{ fontSize: '1.25rem', color: 'var(--primary-pink)', fontFamily: 'var(--font-serif)', margin: '8px 0 16px 0' }}>Welcome Back Expert!</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '24px' }}>Login to manage your consultations, updates, and appointments.</p>
          
          <form onSubmit={handleLoginSubmit}>
            <div className="modal-form-group" style={{ marginBottom: '16px' }}>
              <label>Email Address *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-light)' }} />
                <input type="email" className="modal-form-input" placeholder="Enter your email" required style={{ paddingLeft: '40px', width: '100%' }} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="modal-form-group" style={{ marginBottom: '16px' }}>
              <label>Password *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-light)' }} />
                <input type={showLoginPassword ? "text" : "password"} className="modal-form-input" placeholder="Enter password" required style={{ paddingLeft: '40px', paddingRight: '40px', width: '100%' }} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                <button 
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-gray)', fontWeight: 600 }}>
                <input type="checkbox" style={{ width: '14px', height: '14px' }} /> Remember Me
              </label>
              <span style={{ color: 'var(--primary-pink)', fontWeight: 600, cursor: 'pointer' }}>Forgot Password?</span>
            </div>

            <button type="submit" className="btn-primary w-full" style={{ padding: '12px', borderRadius: '99px', fontWeight: 700 }}>Login</button>
          </form>

          <div style={{ textAlign: 'center', margin: '20px 0', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: 'var(--border-color)', zIndex: 1 }} />
            <span style={{ background: 'var(--card-bg)', padding: '0 10px', fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 700, position: 'relative', zIndex: 2 }}>OR</span>
          </div>

          {/* Social Logins */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert('Google Login Failed')}
            />
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-gray)' }}>
            Don't have an account? <span style={{ color: 'var(--primary-pink)', fontWeight: 600, cursor: 'pointer' }}>Sign up now</span>
          </div>
        </div>
      </div>
      )}

    </div>
    </GoogleOAuthProvider>
  );
}
