import React, { useState } from 'react';
import { X, Building2, User, Mail, Lock, Phone, Globe, MapPin, Briefcase, FileText, Loader2, LogIn, UserPlus, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../api/apiClient';

export default function PartnerLoginModal({ onClose, onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    organizationName: '',
    organizationType: 'NGO',
    registrationNumber: '',
    contactPerson: '',
    email: '',
    password: '',
    mobileNumber: '',
    address: '',
    website: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isRegistering) {
        const response = await authApi.registerPartner(formData);
        onLoginSuccess(response.token, response.partner);
      } else {
        const response = await authApi.loginPartner({ email: formData.email, password: formData.password });
        onLoginSuccess(response.token, response.partner);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 2000 }}>
      <div className="modal-container glass-card" style={{ 
        maxWidth: isRegistering ? '850px' : '480px', 
        width: '95%', 
        animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        border: '1px solid rgba(255,255,255,0.4)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: '24px'
      }}>
        <div className="modal-header" style={{ padding: '24px 30px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ backgroundColor: 'var(--primary-pink-light)', padding: '10px', borderRadius: '12px' }}>
              <Building2 className="text-pink" size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>Partner Portal</h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-gray)' }}>
                {isRegistering ? 'Register your organization with HER2HER' : 'Sign in to your specialized dashboard'}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} style={{ background: 'rgba(0,0,0,0.05)', borderRadius: '50%', padding: '8px' }}><X size={20} /></button>
        </div>

        <div className="modal-body" style={{ padding: '30px' }}>
          <div className="auth-toggle-buttons" style={{ 
            display: 'flex', 
            gap: '8px', 
            marginBottom: '35px', 
            background: 'rgba(0,0,0,0.03)', 
            padding: '6px', 
            borderRadius: '16px' 
          }}>
            <button 
              className={`tab-btn ${!isRegistering ? 'active' : ''}`} 
              onClick={() => setIsRegistering(false)} 
              style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', transition: 'all 0.3s', fontWeight: 700 }}
            >
              <LogIn size={18} style={{ marginRight: '8px' }} /> Sign In
            </button>
            <button 
              className={`tab-btn ${isRegistering ? 'active' : ''}`} 
              onClick={() => setIsRegistering(true)} 
              style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', transition: 'all 0.3s', fontWeight: 700 }}
            >
              <UserPlus size={18} style={{ marginRight: '8px' }} /> Join Network
            </button>
          </div>

          {error && (
            <div style={{ 
              marginBottom: '25px', 
              padding: '14px 20px', 
              borderRadius: '14px', 
              backgroundColor: '#fee2e2', 
              color: '#b91c1c', 
              fontSize: '0.9rem', 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isRegistering ? '1fr 1fr' : '1fr', 
              gap: '24px' 
            }}>
              {isRegistering && (
                <>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-dark)' }}>Organization Name</label>
                    <div style={{ position: 'relative' }}>
                      <Building2 size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-gray)' }} />
                      <input type="text" required value={formData.organizationName} onChange={(e) => setFormData({...formData, organizationName: e.target.value})} className="modal-form-input" style={{ paddingLeft: '42px', borderRadius: '12px' }} placeholder="Healthy NGO Ltd." />
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-dark)' }}>Organization Type</label>
                    <div style={{ position: 'relative' }}>
                      <Briefcase size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-gray)' }} />
                      <select required value={formData.organizationType} onChange={(e) => setFormData({...formData, organizationType: e.target.value})} className="modal-form-input" style={{ paddingLeft: '42px', borderRadius: '12px' }}>
                        <option value="NGO">Non-Profit (NGO)</option>
                        <option value="Hospital">Hospital / Medical Center</option>
                        <option value="Clinic">Specialized Clinic</option>
                        <option value="Wellness Center">Wellness & Yoga Center</option>
                        <option value="Corporate">Corporate / HR Dept</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-dark)' }}>Registration Number</label>
                    <div style={{ position: 'relative' }}>
                      <FileText size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-gray)' }} />
                      <input type="text" required value={formData.registrationNumber} onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})} className="modal-form-input" style={{ paddingLeft: '42px', borderRadius: '12px' }} placeholder="Reg. #12345" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-dark)' }}>Contact Person</label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-gray)' }} />
                      <input type="text" required value={formData.contactPerson} onChange={(e) => setFormData({...formData, contactPerson: e.target.value})} className="modal-form-input" style={{ paddingLeft: '42px', borderRadius: '12px' }} placeholder="John Doe" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-dark)' }}>Mobile Number</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-gray)' }} />
                      <input type="tel" required value={formData.mobileNumber} onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})} className="modal-form-input" style={{ paddingLeft: '42px', borderRadius: '12px' }} placeholder="+91 99999 00000" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-dark)' }}>Official Website</label>
                    <div style={{ position: 'relative' }}>
                      <Globe size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-gray)' }} />
                      <input type="url" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} className="modal-form-input" style={{ paddingLeft: '42px', borderRadius: '12px' }} placeholder="https://organization.com" />
                    </div>
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-dark)' }}>Office Address</label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-gray)' }} />
                      <input type="text" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="modal-form-input" style={{ paddingLeft: '42px', borderRadius: '12px' }} placeholder="Full physical address" />
                    </div>
                  </div>
                </>
              )}

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-dark)' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-gray)' }} />
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="modal-form-input" style={{ paddingLeft: '42px', borderRadius: '12px' }} placeholder="office@partner.com" />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-dark)' }}>Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-gray)' }} />
                  <input type={showPassword ? "text" : "password"} required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="modal-form-input" style={{ paddingLeft: '42px', paddingRight: '40px', borderRadius: '12px', width: '100%' }} placeholder="Secure password" />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '10px' }}>
              <button 
                type="submit" 
                disabled={loading} 
                className="btn-primary" 
                style={{ 
                  width: '100%', 
                  padding: '18px', 
                  borderRadius: '16px', 
                  fontWeight: 900, 
                  fontSize: '1rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '12px',
                  boxShadow: '0 15px 30px -10px var(--primary-pink-shadow)'
                }}
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    {isRegistering ? <ShieldCheck size={20} /> : <LogIn size={20} />}
                    {isRegistering ? 'Submit Verification Application' : 'Access Partner Dashboard'}
                  </>
                )}
              </button>
            </div>
            
            {isRegistering && (
              <p style={{ margin: 0, textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-gray)', lineHeight: 1.5 }}>
                By submitting, you agree to HER2HER's Partner Terms of Service and data privacy guidelines. Our medical board will review your credentials within 48 hours.
              </p>
            )}
          </form>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .modal-form-input {
          width: 100%;
          border: 2px solid rgba(0,0,0,0.06) !important;
          background: rgba(255,255,255,0.6) !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          font-size: 0.9rem !important;
          height: 48px !important;
        }
        .modal-form-input:focus {
          border-color: var(--primary-pink) !important;
          background: #fff !important;
          box-shadow: 0 0 0 4px var(--primary-pink-light) !important;
          outline: none;
        }
        .tab-btn {
          color: var(--text-gray);
          font-size: 0.9rem;
        }
        .tab-btn.active {
          background: #fff;
          color: var(--primary-pink);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
      `}} />
    </div>
  );
}

// Add missing icon import
const AlertCircle = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
