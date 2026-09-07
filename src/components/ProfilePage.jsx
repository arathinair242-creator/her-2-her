import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Camera, Save, ArrowLeft, Loader2, ShieldCheck, AlertCircle, Lock, Bell, Eye, EyeOff, Smartphone, Shield, CreditCard, Settings } from 'lucide-react';
import { userApi } from '../api/apiClient';
import './Pages.css';

export default function ProfilePage({ setActiveTab }) {
  const [activeSubTab, setActiveSubTab] = useState('profile');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(() => localStorage.getItem('her2her_avatar') || '🌸');

  const AVATARS = [
    '🌸', '🌺', '🌻', '🦋', '🌷', '💫', '🌈', '🌟',
    '🧚', '💖', '🌙', '🦄', '🍀', '🌿', '🦩', '💎',
    '🐝', '🌊', '🎀', '🌹', '🦊', '🐱', '🐼', '🌴'
  ];

  const handleAvatarSelect = (av) => {
    setSelectedAvatar(av);
    localStorage.setItem('her2her_avatar', av);
    setShowAvatarPicker(false);
  };
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    profilePicture: '',
    settings: {
      notifications: true,
      privacy: 'public'
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Password change states
  const [passwordData, setPasswordData] = useState({ current: '', next: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [showNextPass, setShowNextPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await userApi.getProfile();
      setProfile({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        bio: data.bio || '',
        profilePicture: data.profilePicture || '',
        settings: data.settings || { notifications: true, privacy: 'public' }
      });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await userApi.updateProfile(profile);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      localStorage.setItem('her2her_user_name', profile.name);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.next !== passwordData.confirm) {
      return setMessage({ type: 'error', text: 'Passwords do not match' });
    }
    setSaving(true);
    try {
      await userApi.changePassword({ 
        currentPassword: passwordData.current, 
        newPassword: passwordData.next 
      });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ current: '', next: '', confirm: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsSave = async (settings) => {
    setSaving(true);
    try {
      await userApi.updateSettings(settings);
      setProfile({ ...profile, settings });
      setMessage({ type: 'success', text: 'Preferences updated!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 className="animate-spin" size={48} color="var(--primary-pink)" />
      </div>
    );
  }

  return (
    <div className="page-container profile-page-responsive" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <button className="btn-back" onClick={() => setActiveTab('Dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,192,203,0.1)', border: '1px solid rgba(255,192,203,0.2)', color: 'var(--primary-pink)', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, transition: 'all 0.3s' }}>
            <ArrowLeft size={18} /> Back
          </button>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-dark)', margin: 0 }}>Account Settings</h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-gray)' }}>Manage your wellness journey</p>
          </div>
        </div>

        <div className="profile-layout-grid shadow-xl" style={{ borderRadius: '30px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
          {/* Sidebar / Tabs */}
          <div className="profile-sidebar" style={{ backgroundColor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)' }}>
            <div style={{ padding: '40px 20px', textAlign: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              {/* Avatar with click-to-change */}
              <div 
                style={{ position: 'relative', display: 'inline-block', cursor: 'pointer', marginBottom: '20px' }}
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                title="Click to change avatar"
              >
                <div className="profile-avatar-large" style={{ width: '120px', height: '120px', borderRadius: '40px', boxShadow: '0 15px 30px rgba(255,133,161,0.15)', fontSize: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selectedAvatar}
                </div>
                <div style={{
                  position: 'absolute', bottom: '-4px', right: '-4px',
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'var(--primary-pink)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', border: '2px solid white', fontSize: '13px'
                }}>✏️</div>
              </div>

              {/* Avatar Picker Dropdown */}
              {showAvatarPicker && (
                <div style={{
                  position: 'absolute', top: '160px', left: '50%', transform: 'translateX(-50%)',
                  background: 'white', borderRadius: '20px', padding: '16px',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid var(--border-color)',
                  zIndex: 100, width: '260px'
                }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-gray)', marginBottom: '12px', textAlign: 'center' }}>Choose your avatar</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                    {AVATARS.map(av => (
                      <button
                        key={av}
                        onClick={(e) => { e.stopPropagation(); handleAvatarSelect(av); }}
                        style={{
                          width: '36px', height: '36px', borderRadius: '50%', border: 'none',
                          fontSize: '20px', cursor: 'pointer',
                          background: selectedAvatar === av ? 'var(--primary-pink-light)' : 'transparent',
                          boxShadow: selectedAvatar === av ? '0 0 0 2px var(--primary-pink)' : 'none',
                          transform: selectedAvatar === av ? 'scale(1.2)' : 'scale(1)',
                          transition: 'all 0.15s ease'
                        }}
                      >{av}</button>
                    ))}
                  </div>
                </div>
              )}
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-dark)' }}>{profile.name}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-gray)', marginTop: '5px' }}>{profile.email}</p>
            </div>
            
            <div className="profile-nav-vertical" style={{ padding: '20px 10px' }}>
              <button className={`p-nav-btn ${activeSubTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveSubTab('profile')}>
                <User size={18} /> My Profile
              </button>
              <button className={`p-nav-btn ${activeSubTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveSubTab('settings')}>
                <Settings size={18} /> Settings
              </button>
            </div>

            <div style={{ marginTop: 'auto', padding: '30px 20px' }}>
              <div className="glass-card" style={{ padding: '15px', borderRadius: '20px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,133,161,0.1)' }}>
                <Shield size={20} color="var(--primary-pink)" style={{ marginBottom: '10px' }} />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', margin: 0 }}>Your data is encrypted and secure.</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="glass-card profile-main-content" style={{ padding: '40px', background: '#fff' }}>
            {message.text && (
              <div className={`status-banner ${message.type}`} style={{ borderRadius: '15px', padding: '15px 25px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                {message.type === 'success' ? <ShieldCheck size={20} /> : <AlertCircle size={20} />}
                {message.text}
              </div>
            )}

            {activeSubTab === 'profile' ? (
              <div className="tab-pane">
                <h2 style={{ marginBottom: '25px', fontWeight: 800 }}>Profile Details</h2>
                <form onSubmit={handleProfileSave} className="profile-form">
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="modal-form-input" />
                    </div>
                    <div className="form-group">
                      <label>Mobile Number</label>
                      <input type="tel" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="modal-form-input" placeholder="+1..." />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Bio / About Me</label>
                    <textarea value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} className="modal-form-input" style={{ minHeight: '100px' }} placeholder="Share your wellness story..." />
                  </div>

                  <div className="form-group">
                    <label>Profile Picture URL</label>
                    <input type="text" value={profile.profilePicture} onChange={(e) => setProfile({...profile, profilePicture: e.target.value})} className="modal-form-input" placeholder="https://..." />
                  </div>

                  <button type="submit" disabled={saving} className="btn-primary" style={{ width: '100%', marginTop: '20px', padding: '14px' }}>
                    {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />} Save Changes
                  </button>
                </form>
              </div>
            ) : (
              <div className="tab-pane">
                <h2 style={{ marginBottom: '25px', fontWeight: 800 }}>Account Settings</h2>
                
                {/* Change Password */}
                <div className="settings-section">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', marginBottom: '20px' }}>
                    <Lock size={18} /> Change Password
                  </h3>
                  <form onSubmit={handlePasswordChange} className="settings-form">
                    <div className="form-group">
                      <label>Current Password</label>
                      <div style={{ position: 'relative' }}>
                        <input type={showPass ? "text" : "password"} value={passwordData.current} onChange={(e) => setPasswordData({...passwordData, current: e.target.value})} className="modal-form-input" />
                        <div onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}>
                          {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                        </div>
                      </div>
                    </div>
                    <div className="form-row-2">
                      <div className="form-group">
                        <label>New Password</label>
                        <div style={{ position: 'relative' }}>
                          <input type={showNextPass ? "text" : "password"} value={passwordData.next} onChange={(e) => setPasswordData({...passwordData, next: e.target.value})} className="modal-form-input" style={{ width: '100%', paddingRight: '40px' }} />
                          <div onClick={() => setShowNextPass(!showNextPass)} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}>
                            {showNextPass ? <EyeOff size={18} color="var(--text-gray)" /> : <Eye size={18} color="var(--text-gray)" />}
                          </div>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                          <input type={showConfirmPass ? "text" : "password"} value={passwordData.confirm} onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})} className="modal-form-input" style={{ width: '100%', paddingRight: '40px' }} />
                          <div onClick={() => setShowConfirmPass(!showConfirmPass)} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}>
                            {showConfirmPass ? <EyeOff size={18} color="var(--text-gray)" /> : <Eye size={18} color="var(--text-gray)" />}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button type="submit" className="btn-secondary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>Update Password</button>
                  </form>
                </div>

                <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />

                {/* Notifications & Privacy */}
                <div className="settings-section">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', marginBottom: '20px' }}>
                    <Bell size={18} /> Preferences
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="toggle-setting">
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Email Notifications</h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-gray)' }}>Receive daily wellness tips and expert advice</p>
                      </div>
                      <label className="switch">
                        <input type="checkbox" checked={profile.settings.notifications} onChange={(e) => handleSettingsSave({...profile.settings, notifications: e.target.checked})} />
                        <span className="slider round"></span>
                      </label>
                    </div>

                    <div className="toggle-setting">
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Profile Privacy</h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-gray)' }}>Hide your profile from community members</p>
                      </div>
                      <select 
                        value={profile.settings.privacy} 
                        onChange={(e) => handleSettingsSave({...profile.settings, privacy: e.target.value})}
                        style={{ padding: '8px', borderRadius: '10px', border: '1px solid var(--border-color)' }}
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .profile-layout-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 30px;
        }
        .profile-nav-vertical {
          display: flex;
          flex-direction: column;
          padding: 15px;
        }
        .p-nav-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          border-radius: 12px;
          border: none;
          background: none;
          color: var(--text-gray);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }
        .p-nav-btn.active {
          background: var(--primary-pink-light);
          color: var(--primary-pink);
        }
        .p-nav-btn:hover:not(.active) {
          background: #f8f8f8;
          transform: translateX(5px);
        }
        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .status-banner {
          padding: 15px 20px;
          border-radius: 12px;
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 600;
          font-size: 0.9rem;
        }
        .status-banner.success { background: #def7ec; color: #03543f; }
        .status-banner.error { background: #fde8e8; color: #9b1c1c; }
        .profile-avatar-large {
          width: 80px;
          height: 80px;
          border-radius: 25px;
          background: var(--primary-pink-light);
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 3px solid white;
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
        }
        .profile-avatar-large img { width: 100%; height: 100%; object-fit: cover; }
        
        .toggle-setting {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* Switch UI */
        .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; }
        .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; }
        input:checked + .slider { background-color: var(--primary-pink); }
        input:checked + .slider:before { transform: translateX(20px); }
        .slider.round { border-radius: 34px; }
        .slider.round:before { border-radius: 50%; }

        @media (max-width: 768px) {
          .profile-layout-grid { grid-template-columns: 1fr; }
          .form-row-2 { grid-template-columns: 1fr; }
          .profile-sidebar { display: flex; flex-direction: row; align-items: center; }
          .profile-nav-vertical { flex-direction: row; overflow-x: auto; flex: 1; }
          .p-nav-btn { white-space: nowrap; }
        }
      `}} />
    </div>
  );
}
