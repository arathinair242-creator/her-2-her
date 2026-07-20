import React, { useState, useEffect } from 'react';
import { Heart, X, ArrowRight, Sparkles } from 'lucide-react';
import '../components/Pages.css';

export default function MenstrualAssessmentPopup({ onTakeAssessment }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show popup immediately or after a slight delay
    const hasSeenPopup = sessionStorage.getItem('her2her_menstrual_popup_seen');
    if (!hasSeenPopup) {
      setTimeout(() => {
        setIsVisible(true);
      }, 3000);
    }
  }, []);

  const closePopup = () => {
    setIsVisible(false);
    sessionStorage.setItem('her2her_menstrual_popup_seen', 'true');
  };

  const handleTakeAssessment = () => {
    closePopup();
    if (onTakeAssessment) {
      onTakeAssessment();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div 
        className="modal-card glass-card" 
        style={{ 
          maxWidth: '400px', 
          padding: '30px', 
          borderRadius: '24px', 
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(145deg, rgba(255,255,255,1) 0%, rgba(255,236,243,1) 100%)',
          border: '2px solid rgba(255, 75, 139, 0.2)'
        }}
      >
        <button className="modal-close-btn" onClick={closePopup} style={{ zIndex: 10, top: '15px', right: '15px' }}>
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{ 
            width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--primary-pink-light)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-pink)',
            margin: '0 auto 16px auto'
          }}>
            <Heart size={32} fill="currentColor" />
          </div>

          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '8px' }}>
            🌸 Complete Your Menstrual Wellness Check
          </h3>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
            Discover personalized insights into your menstrual cycle, hormonal balance, and lifestyle. Takes just 3 minutes!
          </p>

          <button 
            className="btn-primary w-full pulse-glow" 
            onClick={handleTakeAssessment} 
            style={{ 
              padding: '14px', borderRadius: '99px', fontWeight: 700, display: 'flex', 
              alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '1rem' 
            }}
          >
            Take Assessment <ArrowRight size={18} />
          </button>
        </div>

        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: '-10px', left: '-10px', opacity: 0.5 }}>
          <Sparkles size={40} color="var(--primary-pink)" />
        </div>
      </div>
    </div>
  );
}
