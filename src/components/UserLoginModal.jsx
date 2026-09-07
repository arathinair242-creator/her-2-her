import React, { useState } from 'react';
import { Mail, Lock, X, Eye, EyeOff } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { authApi } from '../api/apiClient';
import './Pages.css';

// Google Client ID - Replace with your actual Google Client ID
const GOOGLE_CLIENT_ID = '1008261506362-1ta526ufb172q963i83en9c9gecjdh6j.apps.googleusercontent.com';

// Function to decode JWT token manually
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

export default function UserLoginModal({ onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleGoogleSuccess = async (credentialResponse) => {
    setIsGoogleLoading(true);
    try {
      // Decode the JWT token from Google
      const decoded = decodeJwt(credentialResponse.credential);

      if (!decoded) {
        throw new Error('Failed to decode Google token');
      }

      console.log('Google Auth decoded:', decoded);

      // Send to backend for authentication
      const data = await authApi.googleLogin({
        email: decoded.email,
        name: decoded.name,
        googleId: decoded.sub,
        profilePicture: decoded.picture
      });

      if (data && data.token) {
        localStorage.setItem('her2her_token', data.token);
        localStorage.setItem('her2her_user_email', data.user.email);
        localStorage.setItem('her2her_user_name', data.user.name);
        localStorage.setItem('her2her_is_logged_in', 'true');
        localStorage.setItem('her2her_role', data.user.role || 'user');
        if (onLoginSuccess) {
          onLoginSuccess(data.user.email);
        }
        onClose();
      }
    } catch (err) {
      console.error('Google Auth error:', err);
      alert('Google Auth failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    alert('Google login failed. Please try again.');
    setIsGoogleLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let data;
      if (isRegister) {
        data = await authApi.registerUser({ email, password, name: fullName || email.split('@')[0] });
      } else {
        data = await authApi.loginUser({ email, password });
      }

      if (data && data.token) {
        // FIX: Clear any stale expert/partner session before setting user session
        localStorage.removeItem('her2her_token');
        localStorage.removeItem('her2her_role');
        localStorage.removeItem('her2her_is_logged_in');
        localStorage.setItem('her2her_token', data.token);
        localStorage.setItem('her2her_user_email', data.user?.email || email);
        localStorage.setItem('her2her_user_name', data.user?.name || email.split('@')[0]);
        localStorage.setItem('her2her_is_logged_in', 'true');
        localStorage.setItem('her2her_role', 'user');
        if (onLoginSuccess) {
          onLoginSuccess(data.user?.email || email);
        }
        onClose();
      }
    } catch (err) {
      alert('Authentication failed: ' + err.message);
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="modal-overlay">
        <div className="modal-card glass-card" style={{ maxWidth: '400px', padding: '30px' }}>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>

          <h3 className="modal-title" style={{ textAlign: 'center', marginBottom: '8px' }}>
            {isRegister ? 'Create User Account' : 'Welcome to Her-2-Her'}
          </h3>
          <p style={{ textAlign: 'center', color: 'var(--text-gray)', fontSize: '0.85rem', marginBottom: '24px' }}>
            {isRegister ? 'Sign up to start your personalized wellness plan.' : 'Login to access your personalized wellness tracker.'}
          </p>

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div className="modal-form-group" style={{ marginBottom: '16px' }}>
                <label>Full Name</label>
                <input
                  type="text"
                  className="modal-form-input"
                  placeholder="Enter your full name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}

            <div className="modal-form-group" style={{ marginBottom: '16px' }}>
              <label>Email Address</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-light)' }} />
                <input
                  type="email"
                  className="modal-form-input"
                  placeholder="Enter your email"
                  required
                  style={{ paddingLeft: '40px', width: '100%' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-form-group" style={{ marginBottom: '20px' }}>
              <label>Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-light)' }} />
                <input
                  type={showPassword ? "text" : "password"}
                  className="modal-form-input"
                  placeholder="Enter password"
                  required
                  style={{ paddingLeft: '40px', paddingRight: '40px', width: '100%' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" style={{ padding: '12px', borderRadius: '99px', fontWeight: 700 }}>
              {isRegister ? 'Sign Up' : 'Log In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-gray)' }}>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <span
              onClick={() => { setIsRegister(!isRegister); setFullName(''); }}
              style={{ color: 'var(--primary-pink)', fontWeight: 600, cursor: 'pointer' }}
            >
              {isRegister ? 'Log in now' : 'Sign up now'}
            </span>
          </div>

          <div style={{ textAlign: 'center', margin: '20px 0', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: 'var(--border-color)', zIndex: 1 }} />
            <span style={{ background: 'var(--card-bg)', padding: '0 10px', fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 700, position: 'relative', zIndex: 2 }}>OR</span>
          </div>

          {/* Google OAuth Integration */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              locale="en"
            />
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '16px' }}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
