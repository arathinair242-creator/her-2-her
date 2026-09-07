import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Heart, Brain, Apple, Dumbbell, Moon, Info, 
  ChevronDown, ChevronUp, ShieldCheck, Clipboard, X 
} from 'lucide-react';

export default function AnalysisPage({ userProfile }) {
  // Use userProfile values if available
  const initialNutrition = userProfile?.nutritionScore || 82;
  const initialFitness = userProfile?.fitnessScore || 76;
  const initialSleep = userProfile?.sleepQualityScore || 68;
  const initialStress = userProfile?.stressLevelScore || 71;

  // Slider states
  const [nutrition, setNutrition] = useState(initialNutrition);
  const [fitness, setFitness] = useState(initialFitness);
  const [sleep, setSleep] = useState(initialSleep);
  const [stress, setStress] = useState(initialStress);
  const [overallScore, setOverallScore] = useState(82);

  // Accordion state for Key Insights
  const [openInsight, setOpenInsight] = useState(null);

  // Report Modal state
  const [showReportModal, setShowReportModal] = useState(false);

  // Calculate overall score dynamically
  useEffect(() => {
    const calculated = Math.round(
      (nutrition * 0.35) + 
      (fitness * 0.25) + 
      (sleep * 0.20) + 
      ((100 - stress) * 0.20) // Less stress = higher score
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

  const scoreStatus = getScoreStatus(overallScore);

  // Key Insights data
  const insights = [
    {
      id: 1,
      title: "Your protein intake is good, keep it up!",
      icon: <Apple size={18} className="text-teal" />,
      detail: "Based on your logs, you are consistently hitting 75-80g of protein daily, which is essential for lean muscle maintenance and hormonal balance. Consider adding chia seeds or hemp seeds to boost fiber along with protein."
    },
    {
      id: 2,
      title: "Try improving your sleep duration.",
      icon: <Moon size={18} className="text-violet" />,
      detail: "Your average sleep duration is 6.2 hours. Aiming for 7-8 hours will help regulate ghrelin (hunger hormone) and cortisol levels, which helps reduce fatigue and controls cravings."
    },
    {
      id: 3,
      title: "Your stress levels are slightly high.",
      icon: <Brain size={18} className="text-pink" />,
      detail: "Stress registers at 71%. This triggers high cortisol, which can impact thyroid function and progesterone-to-estrogen balance. Practicing deep breathing for 5 minutes before bed can significantly help."
    },
    {
      id: 4,
      title: "Stay consistent with your workouts.",
      icon: <Dumbbell size={18} className="text-blue" />,
      detail: "You are averaging 3 sessions per week. Increasing this to 4 sessions, incorporating light strength training and restorative yoga, will help maintain menstrual cycle regularity."
    }
  ];

  const toggleInsight = (id) => {
    setOpenInsight(openInsight === id ? null : id);
  };

  return (
    <div className="page-container">
      {/* Banner */}
      <div className="page-banner-card" style={{ background: 'linear-gradient(135deg, rgba(124, 92, 255, 0.1) 0%, rgba(255, 75, 139, 0.1) 100%)' }}>
        <div className="page-banner-content">
          <h1 className="page-banner-title">AI-Powered Health Insights</h1>
          <p className="page-banner-desc">
            Smart insights driven by advanced analysis of your lifestyle entries to help you understand your body better.
          </p>
        </div>
        <div className="page-banner-visual">
          {/* Custom SVG Robot Companion illustration */}
          <svg className="robot-illustration-svg" viewBox="0 0 200 200" fill="none">
            <defs>
              <linearGradient id="robotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7C5CFF" />
                <stop offset="100%" stopColor="#CBBFFF" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="75" fill="url(#robotGrad)" opacity="0.1" />
            {/* Robot Head */}
            <rect x="65" y="70" width="70" height="50" rx="18" fill="url(#robotGrad)" />
            {/* Robot Ears */}
            <circle cx="60" cy="95" r="8" fill="#7C5CFF" />
            <circle cx="140" cy="95" r="8" fill="#7C5CFF" />
            {/* Robot Screen */}
            <rect x="73" y="78" width="54" height="34" rx="10" fill="#1E1F4B" />
            {/* Robot Eyes (Glow) */}
            <ellipse cx="88" cy="95" rx="6" ry="3" fill="#05CD99" />
            <ellipse cx="112" cy="95" rx="6" ry="3" fill="#05CD99" />
            {/* Antenna */}
            <line x1="100" y1="70" x2="100" y2="52" stroke="#7C5CFF" strokeWidth="4" />
            <circle cx="100" cy="48" r="6" fill="#FF4B8B" className="animate-pulse-soft" />
            {/* Body */}
            <path d="M75 120h50c10 0 15 8 15 15v10H60v-10c0-7 5-15 15-15z" fill="url(#robotGrad)" opacity="0.8" />
          </svg>
        </div>
      </div>

      <div className="page-grid-2">
        {/* Left Column: Health Score ring & Sliders */}
        <div className="glass-card" style={{ padding: '30px' }}>
          <h3 className="page-section-title" style={{ marginBottom: '24px' }}>Your Health Score</h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* Dial Gauge */}
            <div className="score-dial-container" style={{ width: '160px', height: '160px' }}>
              <svg className="score-dial-svg" viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                <circle cx="50" cy="50" r="42" className="dial-track" style={{ strokeWidth: 8 }} />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="42" 
                  className="dial-fill" 
                  style={{
                    strokeDasharray: '264',
                    strokeDashoffset: `${264 - (264 * overallScore) / 100}`,
                    stroke: scoreStatus.color,
                    strokeWidth: 8
                  }}
                />
              </svg>
              <div className="score-display">
                <span className="score-number" style={{ fontSize: '2.5rem' }}>{overallScore}</span>
                <span className="score-label" style={{ color: scoreStatus.color, fontSize: '0.95rem' }}>
                  {scoreStatus.text}
                </span>
              </div>
              <div className="score-heart-badge">
                <Heart size={14} fill="#FF4B8B" color="#FF4B8B" />
              </div>
            </div>

            {/* Sliders Side Controls */}
            <div className="score-sliders" style={{ flexGrow: 1, minWidth: '220px', width: '100%' }}>
              <div className="slider-item">
                <div className="slider-label">
                  <span className="slider-title-wrapper" style={{ color: 'var(--teal-accent)' }}>
                    <Apple size={16} /> Nutrition
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
                  <span className="slider-title-wrapper" style={{ color: 'var(--secondary-violet)' }}>
                    <Dumbbell size={16} /> Fitness
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
                  <span className="slider-title-wrapper" style={{ color: 'var(--primary-pink)' }}>
                    <Moon size={16} /> Sleep Quality
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
                  <span className="slider-title-wrapper" style={{ color: 'var(--red-accent)' }}>
                    <Brain size={16} /> Stress Level
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
        </div>

        {/* Right Column: Analysis Summary & Risk Assessment */}
        <div>
          {/* Analysis Summary */}
          <div className="glass-card analysis-summary-card">
            <h3 className="page-section-title" style={{ margin: '0 0 16px 0' }}>Analysis Summary</h3>
            <div className="summary-card-body">
              <div className="summary-text-box">
                Overall you are doing <strong>well</strong>! Focus on improving your <strong>sleep quality</strong> and reducing <strong>stress</strong> for better metabolic and hormonal results.
              </div>
              <div className="summary-heart-pulse">
                ❤️
              </div>
            </div>
          </div>

          {/* Health Risk Assessment */}
          <div className="glass-card" style={{ padding: '24px', marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 className="page-section-title" style={{ margin: 0 }}>Health Risk Assessment</h3>
              <span className="risk-badge low">Low Risk</span>
            </div>
            <p style={{ color: 'var(--text-gray)', fontSize: '0.95rem' }}>
              No significant health risks detected based on your entries. Keep maintaining your healthy lifestyle!
            </p>
          </div>
        </div>
      </div>

      {/* Key Insights Section */}
      <div className="page-section-header">
        <h3 className="page-section-title">Key Insights For You</h3>
      </div>

      <div className="page-grid-2">
        {/* Column 1 of insights */}
        <div className="glass-card insights-card" style={{ padding: '20px' }}>
          {insights.slice(0, 2).map((item) => {
            const isOpen = openInsight === item.id;
            return (
              <div key={item.id} style={{ marginBottom: '14px' }}>
                <div className="insight-item-header" onClick={() => toggleInsight(item.id)}>
                  <div className="insight-item-left">
                    <span className="insight-item-icon">{item.icon}</span>
                    <span>{item.title}</span>
                  </div>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
                {isOpen && (
                  <div className="insight-item-body">
                    {item.detail}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Column 2 of insights */}
        <div className="glass-card insights-card" style={{ padding: '20px' }}>
          {insights.slice(2, 4).map((item) => {
            const isOpen = openInsight === item.id;
            return (
              <div key={item.id} style={{ marginBottom: '14px' }}>
                <div className="insight-item-header" onClick={() => toggleInsight(item.id)}>
                  <div className="insight-item-left">
                    <span className="insight-item-icon">{item.icon}</span>
                    <span>{item.title}</span>
                  </div>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
                {isOpen && (
                  <div className="insight-item-body">
                    {item.detail}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Personalized Recommendations Section */}
      <div className="page-section-header">
        <h3 className="page-section-title">Personalized Recommendations</h3>
      </div>

      <div className="glass-card rec-card">
        <div className="rec-item">
          <div className="rec-icon-box" style={{ backgroundColor: 'var(--teal-light)', color: 'var(--teal-accent)' }}>
            <Apple size={18} />
          </div>
          <span className="rec-text">Add 20g more protein to your daily diet (e.g. Greek yogurt, paneer, or tofu)</span>
        </div>

        <div className="rec-item">
          <div className="rec-icon-box" style={{ backgroundColor: 'var(--secondary-violet-light)', color: 'var(--secondary-violet)' }}>
            <Moon size={18} />
          </div>
          <span className="rec-text">Try 15 min of meditation or box-breathing daily to relieve stress</span>
        </div>

        <div className="rec-item">
          <div className="rec-icon-box" style={{ backgroundColor: 'var(--primary-pink-light)', color: 'var(--primary-pink)' }}>
            <Heart size={18} />
          </div>
          <span className="rec-text">Sleep at least 7-8 hours daily to improve metabolism and mood regulation</span>
        </div>

        <div className="rec-item">
          <div className="rec-icon-box" style={{ backgroundColor: 'var(--blue-light)', color: 'var(--blue-accent)' }}>
            <Brain size={18} />
          </div>
          <span className="rec-text">Drink water consistently (aim for 2.5 - 3.0 Liters throughout the day)</span>
        </div>
      </div>

      {/* Detailed Insights Prompt */}
      <div className="report-promo-card">
        <div className="report-promo-left">
          <h3 className="page-section-title" style={{ margin: '0 0 8px 0', fontSize: '1.25rem' }}>Want More Detailed Insights?</h3>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.95rem', marginBottom: '16px' }}>
            Get a detailed AI report with personalized recommendations from our certified health and wellness experts.
          </p>
          <button className="btn-inline-promo-action" onClick={() => setShowReportModal(true)}>Get Full Report</button>
        </div>
        <div className="report-promo-icon-right">
          <Clipboard size={64} style={{ opacity: 0.8 }} />
        </div>
      </div>

      {/* Clinical Records Section (New) */}
      {userProfile?.bloodReportName && (
        <div style={{ marginTop: '24px' }}>
          <div className="page-section-header">
            <h3 className="page-section-title">Clinical Records</h3>
          </div>
          <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--red-light)', color: 'var(--red-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-dark)' }}>Latest Blood Test Report</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{userProfile.bloodReportName}</p>
              </div>
            </div>
            <button className="btn-ghost" style={{ fontSize: '0.8rem', color: 'var(--secondary-violet)', fontWeight: 600 }}>Download PDF</button>
          </div>
        </div>
      )}

      {/* Detailed Report Modal */}
      {showReportModal && (
        <div className="modal-overlay">
          <div className="modal-card glass-card" style={{ maxWidth: '600px' }}>
            <button className="modal-close-btn" onClick={() => setShowReportModal(false)}>
              <X size={20} />
            </button>
            <h3 className="modal-title">Detailed Health Report</h3>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--secondary-violet-light)', color: 'var(--secondary-violet)', marginBottom: '10px' }}>
                  <Sparkles size={28} />
                </div>
                <h4 style={{ color: 'var(--text-dark)' }}>AI Health Analysis Summary</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Calculated dynamically just now</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: scoreStatus.color }}>{overallScore}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>Wellness Score ({scoreStatus.text})</div>
                </div>
                <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--teal-accent)' }}>Low</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>Hormonal Risk</div>
                </div>
              </div>

              <h5 style={{ color: 'var(--text-dark)', marginBottom: '8px', fontWeight: '700' }}>Hormonal Balance & Stress</h5>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-gray)', lineHeight: 1.5, marginBottom: '16px' }}>
                Your stress levels represent a score of {stress}%. High stress is one of the most common causes of cycle irregularity and PCOS flare-ups because it increases insulin resistance. We highly recommend completing a daily 10-minute mindfulness breathing block to downregulate your nervous system.
              </p>

              <h5 style={{ color: 'var(--text-dark)', marginBottom: '8px', fontWeight: '700' }}>Nutrition & Metabolism</h5>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-gray)', lineHeight: 1.5, marginBottom: '16px' }}>
                Your nutrition rating is {nutrition}%. Your diet shows good structure, but your protein target can be increased to stabilize blood glucose levels. Incorporating high-fiber vegetables along with lean protein helps reduce blood sugar spikes which controls insulin and supports ovarian health.
              </p>

              <h5 style={{ color: 'var(--text-dark)', marginBottom: '8px', fontWeight: '700' }}>Action Items</h5>
              <ul style={{ fontSize: '0.9rem', color: 'var(--text-gray)', paddingLeft: '20px', lineHeight: 1.6 }}>
                <li>Do 15 mins of light cardio/walk in the morning sunlight.</li>
                <li>Add one source of protein to every major meal.</li>
                <li>Establish a digital curfew (screens off) 45 mins before bedtime.</li>
              </ul>
            </div>

            <div className="modal-actions">
              <button className="btn-modal-submit" onClick={() => setShowReportModal(false)}>Got it, thanks!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
