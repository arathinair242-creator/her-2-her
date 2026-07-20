import React, { useState } from 'react';
import { Mail, Lock, ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { adminApi } from '../api/apiClient';
import '../components/Pages.css';
import logoImg from '../assets/logo.png';

export default function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.loginAdmin({ email, password });
      if (data && data.token) {
        localStorage.setItem('her2her_token', data.token);
        localStorage.setItem('her2her_role', 'admin');
        localStorage.setItem('her2her_is_logged_in', 'true');
        if (onLoginSuccess) {
          onLoginSuccess(data.token);
        }
      }
    } catch (err) {
      setError('Invalid admin credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #f9f9f9 0%, #fff0f7 100%)' }}>
      <div className="glass-card" style={{ maxWidth: '400px', width: '100%', padding: '40px', borderRadius: '24px', textAlign: 'center', position: 'relative', borderTop: '4px solid #7c3aed' }}>
        <img src={logoImg} alt="Her2Her Logo" style={{ height: '40px', objectFit: 'contain', marginBottom: '20px' }} />
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '8px' }}>
          Admin Secure Portal
        </h2>
        <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', marginBottom: '30px' }}>
          Authorized personnel only
        </p>

        {error && (
          <div style={{ background: 'var(--red-light)', color: 'var(--red-accent)', padding: '10px', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '20px', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="modal-form-group" style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Admin Email</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-light)' }} />
              <input
                type="email"
                className="modal-form-input"
                placeholder="administrator@her2her.com"
                required
                style={{ paddingLeft: '40px', width: '100%' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-form-group" style={{ marginBottom: '24px', textAlign: 'left' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Secure Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-light)' }} />
              <input
                type={showPassword ? "text" : "password"}
                className="modal-form-input"
                placeholder="••••••••"
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

          <button type="submit" disabled={loading} className="btn-primary w-full pulse-glow" style={{ padding: '14px', borderRadius: '99px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {loading ? 'Authenticating...' : 'Secure Login'} 
            {!loading && <ShieldCheck size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}
