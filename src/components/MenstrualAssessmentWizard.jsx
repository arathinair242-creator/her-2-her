import React, { useState } from 'react';
import { 
  Heart, X, Calendar, Activity, Smile, ChevronRight, CheckCircle2,
  Droplet, Brain, Dumbbell, Star, AlertCircle, ArrowRight
} from 'lucide-react';
import { assessmentApi } from '../api/apiClient';

export default function MenstrualAssessmentWizard({ onClose, onComplete }) {
  const [step, setStep] = useState(0); 

  // Form State
  const [age, setAge] = useState('');
  const [cycleRegularity, setCycleRegularity] = useState('Regular');
  const [cycleLength, setCycleLength] = useState('28');
  const [flowDuration, setFlowDuration] = useState('5');
  const [symptoms, setSymptoms] = useState([]);
  const [mentalWellness, setMentalWellness] = useState('Good');
  const [conditions, setConditions] = useState([]);
  
  // Results State
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState('');
  const [statusColor, setStatusColor] = useState('');
  const [recommendedSpecialist, setRecommendedSpecialist] = useState('');
  const [recommendations, setRecommendations] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const toggleSymptom = (sym) => {
    if (sym === 'None') {
      setSymptoms(['None']);
      return;
    }
    const filtered = symptoms.filter(s => s !== 'None');
    if (filtered.includes(sym)) {
      setSymptoms(filtered.filter(s => s !== sym));
    } else {
      setSymptoms([...filtered, sym]);
    }
  };

  const toggleCondition = (cond) => {
    if (cond === 'None') {
      setConditions(['None']);
      return;
    }
    const filtered = conditions.filter(c => c !== 'None');
    if (filtered.includes(cond)) {
      setConditions(filtered.filter(c => c !== cond));
    } else {
      setConditions([...filtered, cond]);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const calculateResult = async () => {
    setIsLoading(true);
    
    // Simple mock calculation logic
    let tempScore = 100;
    
    if (cycleRegularity === 'Irregular') tempScore -= 15;
    if (cycleRegularity === 'Very Irregular') tempScore -= 25;
    
    const cycleNum = parseInt(cycleLength) || 28;
    if (cycleNum < 21 || cycleNum > 35) tempScore -= 10;
    
    tempScore -= symptoms.length * 5;
    if (mentalWellness === 'Poor' || mentalWellness === 'Stressed') tempScore -= 15;
    if (conditions.includes('PCOS / PCOD')) tempScore -= 20;
    if (conditions.includes('Thyroid')) tempScore -= 10;
    if (conditions.includes('Endometriosis')) tempScore -= 20;
    
    tempScore = Math.max(10, Math.min(100, tempScore));
    setScore(tempScore);
    
    let resStatus = '';
    let color = '';
    let specialist = '';
    let tips = {};

    if (tempScore >= 80) {
      resStatus = 'Healthy 🟢';
      color = '#05CD99';
      specialist = 'Nutritionist';
      tips = {
        diet: 'Maintain your current balanced diet. Incorporate more magnesium-rich foods to keep cycles smooth.',
        exercise: 'Continue regular exercises. Light cardio during your luteal phase is helpful.',
        insights: 'Your menstrual cycle seems highly regular and symptom-free. You are doing great!'
      };
    } else if (tempScore >= 60) {
      resStatus = 'Moderate 🟡';
      color = '#FFA620';
      specialist = 'General Physician';
      tips = {
        diet: 'Increase iron intake during your periods. Consider Omega-3 supplements to reduce mild symptoms.',
        exercise: 'Try Yoga and Pilates to improve blood flow and reduce stress.',
        insights: 'Your cycle has minor irregularities or symptoms. Minor lifestyle adjustments can bring significant improvements.'
      };
    } else {
      resStatus = 'Needs Attention 🔴';
      color = '#F43F5E';
      specialist = 'Gynecologist';
      tips = {
        diet: 'Reduce sugar and dairy intake if you have suspected PCOS. Focus on anti-inflammatory foods.',
        exercise: 'Avoid high-stress workouts. Focus on low-impact steady-state cardio (LISS) to balance hormones.',
        insights: 'Your responses indicate symptoms that require medical evaluation. Consulting a specialist is highly recommended.'
      };
    }

    if (mentalWellness === 'Poor' || mentalWellness === 'Stressed') {
        specialist = 'Therapist'; // override if mental wellness is the primary symptom
    }
    if (conditions.includes('PCOS / PCOD') || conditions.includes('Endometriosis')) {
        specialist = 'Gynecologist';
    }

    setStatus(resStatus);
    setStatusColor(color);
    setRecommendedSpecialist(specialist);
    setRecommendations(tips);

    const assessmentData = {
        age, cycleRegularity, cycleLength, flowDuration, symptoms,
        mentalWellness, conditions, score: tempScore, status: resStatus, tips
    };

    try {
        const isLoggedIn = localStorage.getItem('her2her_is_logged_in') === 'true';
        if (isLoggedIn) {
            await assessmentApi.saveAssessment({
                type: 'Menstrual',
                answers: assessmentData,
                plan: { score: tempScore, status: resStatus, recommendations: tips, suggestedExpert: specialist }
            });
        }
    } catch(e) {
        console.error("Failed to save menstural assessment", e);
    }
    
    setIsLoading(false);
    setStep(6); // Go to results
  };

  const handleFinish = () => {
    if (onComplete) {
      onComplete(recommendedSpecialist);
    }
  };

  const totalSteps = 5;
  const progressPercent = step >= 1 && step <= 5 ? Math.round((step / 5) * 100) : 0;

  return (
    <div className="modal-overlay">
      <div className="modal-card glass-card" style={{ maxWidth: '540px', padding: '30px', borderRadius: '28px', minHeight: '540px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        
        {step !== 6 && (
          <button className="modal-close-btn" onClick={onClose} style={{ zIndex: 10 }}>
            <X size={20} />
          </button>
        )}

        {step >= 1 && step <= 5 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '6px', fontWeight: 600 }}>
              <span>Step {step} of {totalSteps}</span>
              <span>{progressPercent}% Complete</span>
            </div>
            <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--secondary-violet) 0%, var(--primary-pink) 100%)', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        )}

        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          {/* SLIDE 0: Welcome */}
          {step === 0 && (
            <div style={{ textAlign: 'center' }}>
              <Heart size={48} color="var(--primary-pink)" style={{ margin: '0 auto 16px auto' }} />
              <h2 style={{ fontSize: '1.8rem', color: 'var(--text-dark)', marginBottom: '8px', fontWeight: 800 }}>
                Menstrual Wellness Check
              </h2>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
                Answer a few quick questions to receive a personalized wellness profile. This helps us understand your unique cycle and health needs.
              </p>
              
              <div style={{ padding: '16px', background: 'var(--primary-pink-light)', borderRadius: '16px', marginBottom: '24px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-dark)', border: '1px dashed var(--primary-pink)' }}>
                <AlertCircle size={16} color="var(--primary-pink)" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
                <strong>Disclaimer:</strong> This assessment provides wellness insights only and is <strong>not a medical diagnosis</strong>. Always consult a certified healthcare professional.
              </div>

              <button className="btn-primary w-full pulse-glow" onClick={nextStep} style={{ padding: '14px', borderRadius: '99px', fontWeight: 700 }}>
                Start Assessment
              </button>
            </div>
          )}

          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-dark)', marginBottom: '16px', fontWeight: 800 }}>Basic Information</h2>
              <div className="modal-form-group" style={{ marginBottom: '20px' }}>
                <label>How old are you?</label>
                <input type="number" min="12" max="75" className="modal-form-input" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 26" />
              </div>
              <div className="modal-form-group">
                <label>How regular is your cycle?</label>
                <select className="modal-form-input" value={cycleRegularity} onChange={(e) => setCycleRegularity(e.target.value)}>
                  <option value="Regular">Regular (predictable within a few days)</option>
                  <option value="Irregular">Irregular (varies largely each month)</option>
                  <option value="Very Irregular">Very Irregular (missed periods frequently)</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: Cycle Details */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-dark)', marginBottom: '16px', fontWeight: 800 }}>Cycle Details</h2>
              <div className="modal-form-group" style={{ marginBottom: '20px' }}>
                <label>Average cycle length (days)</label>
                <input type="number" min="15" max="60" className="modal-form-input" value={cycleLength} onChange={(e) => setCycleLength(e.target.value)} placeholder="e.g. 28" />
              </div>
              <div className="modal-form-group">
                <label>Average flow duration (days)</label>
                <input type="number" min="1" max="15" className="modal-form-input" value={flowDuration} onChange={(e) => setFlowDuration(e.target.value)} placeholder="e.g. 5" />
              </div>
            </div>
          )}

          {/* STEP 3: Symptoms */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-dark)', marginBottom: '16px', fontWeight: 800 }}>Common PMS / Period Symptoms</h2>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem', marginBottom: '16px' }}>Select all that you frequently experience.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {['Severe Cramps', 'Heavy Bleeding', 'Bloating', 'Acne Breakouts', 'Mood Swings', 'Breast Tenderness', 'Fatigue', 'None'].map(sym => {
                  const isSel = symptoms.includes(sym);
                  return (
                    <div 
                      key={sym} 
                      onClick={() => toggleSymptom(sym)}
                      style={{
                        padding: '12px', border: isSel ? '2px solid var(--primary-pink)' : '1px solid var(--border-color)',
                        borderRadius: '12px', background: isSel ? 'var(--primary-pink-light)' : 'var(--card-bg)',
                        cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)'
                      }}
                    >
                      {sym}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Mental & Lifestyle */}
          {step === 4 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-dark)', marginBottom: '16px', fontWeight: 800 }}>Mental Wellness</h2>
              <div className="modal-form-group" style={{ marginBottom: '24px' }}>
                <label>How would you rate your typical stress and mental wellness?</label>
                <select className="modal-form-input" value={mentalWellness} onChange={(e) => setMentalWellness(e.target.value)}>
                  <option value="Excellent">Excellent - Very little stress</option>
                  <option value="Good">Good - Manageable stress</option>
                  <option value="Stressed">Stressed - High stress/Anxiety</option>
                  <option value="Poor">Poor - Struggling with mood/depression</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 5: Underlying Conditions */}
          {step === 5 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-dark)', marginBottom: '16px', fontWeight: 800 }}>Underlying Health Conditions</h2>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem', marginBottom: '16px' }}>Select any diagnosed conditions.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['PCOS / PCOD', 'Endometriosis', 'Thyroid (Hypo/Hyper)', 'Anemia', 'None'].map(cond => {
                  const isSel = conditions.includes(cond);
                  return (
                    <div 
                      key={cond} 
                      onClick={() => toggleCondition(cond)}
                      style={{
                        padding: '14px 16px', border: isSel ? '2px solid var(--primary-pink)' : '1px solid var(--border-color)',
                        borderRadius: '12px', background: isSel ? 'var(--primary-pink-light)' : 'var(--card-bg)',
                        cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)',
                        display: 'flex', justifyContent: 'space-between'
                      }}
                    >
                      {cond}
                      {isSel && <CheckCircle2 size={16} color="var(--primary-pink)" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SLIDE 6: Profile & Results */}
          {step === 6 && (
            <div style={{ textAlign: 'center', margin: '-10px 0' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '16px' }}>Your Wellness Profile</h2>
              
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: `linear-gradient(135deg, ${statusColor} 0%, rgba(255,133,161,0.5) 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=her2&backgroundColor=transparent" alt="Avatar" style={{ width: '60px', borderRadius: '50%' }} />
                </div>
              </div>

              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginBottom: '4px' }}>Wellness Score</p>
                  <h3 style={{ fontSize: '2rem', color: statusColor, fontWeight: 800, margin: 0 }}>{score}</h3>
                </div>
                <div style={{ height: '40px', width: '1px', background: 'var(--border-color)' }} />
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginBottom: '4px' }}>Status</p>
                  <div style={{ background: `${statusColor}22`, padding: '6px 12px', borderRadius: '12px', color: statusColor, fontWeight: 700, fontSize: '0.85rem' }}>
                    {status}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-dark)' }}>Personalized Tips</h4>
                <ul style={{ fontSize: '0.85rem', color: 'var(--text-gray)', paddingLeft: '20px', lineHeight: 1.6 }}>
                  <li><strong>Diet:</strong> {recommendations.diet}</li>
                  <li><strong>Exercise:</strong> {recommendations.exercise}</li>
                  <li><strong>Insights:</strong> {recommendations.insights}</li>
                </ul>
              </div>

              <div style={{ padding: '16px', background: 'var(--primary-pink-light)', borderRadius: '16px', marginBottom: '20px', textAlign: 'left', border: '1px solid var(--primary-pink)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-pink)', marginBottom: '4px' }}>Recommendation</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: 600 }}>We recommend consulting a {recommendedSpecialist} for further guidance.</div>
              </div>

              <button className="btn-primary w-full pulse-glow" onClick={handleFinish} style={{ padding: '14px', borderRadius: '99px', fontWeight: 700 }}>
                Consult {recommendedSpecialist}
              </button>
            </div>
          )}

        </div>

        {/* Action Bottom Bar */}
        {step >= 1 && step <= 5 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '20px' }}>
            <button className="btn-secondary" onClick={prevStep} style={{ padding: '10px 24px', borderRadius: '99px', fontWeight: 600 }}>Back</button>
            <button 
              className="btn-primary" 
              onClick={step === 5 ? calculateResult : nextStep} 
              disabled={isLoading}
              style={{ padding: '10px 28px', borderRadius: '99px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {isLoading ? 'Calculating...' : (step === 5 ? 'Get Results' : 'Next')} 
              {!isLoading && <ChevronRight size={14} />}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
