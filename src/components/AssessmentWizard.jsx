import React, { useState } from 'react';
import { 
  Heart, ShieldCheck, Users, Sparkles, Smile, X, Calendar, 
  Dumbbell, Apple, Moon, Brain, ChevronRight, CheckCircle2,
  Check, ArrowRight, ShieldAlert, Droplet, Star, Scale, Activity
} from 'lucide-react';
import { generatePersonalizedPlans, planDb } from '../utils/planGenerator';
import { assessmentApi } from '../api/apiClient';

export default function AssessmentWizard({ onClose, onComplete }) {
  const [step, setStep] = useState(0); // 0 = Welcome, 1 to 11 = Steps, 12 = Completed

  // State answers
  const [dobDay, setDobDay] = useState('12');
  const [dobMonth, setDobMonth] = useState('07');
  const [dobYear, setDobYear] = useState('1998');

  const [goals, setGoals] = useState([]); // Array of selected goals
  const [activity, setActivity] = useState('Lightly Active');
  const [sleepQuality, setSleepQuality] = useState('Good');
  const [stressLevel, setStressLevel] = useState('Moderate'); // Very Low, Low, Moderate, High, Very High
  const [conditions, setConditions] = useState([]); // Array of health conditions
  const [eatingHabit, setEatingHabit] = useState('Healthy');
  
  // New Profile States
  const [gender, setGender] = useState('Female');
  const [weight, setWeight] = useState('60'); // kg
  const [height, setHeight] = useState('165'); // cm
  const [dietPreference, setDietPreference] = useState('Balanced');
  const [lifestyleHabits, setLifestyleHabits] = useState([]); // Coffee, Alcohol, Smoking
  const [waterIntake, setWaterIntake] = useState('8'); // target glasses
  const [bloodReport, setBloodReport] = useState(null);
  const [bloodReportName, setBloodReportName] = useState('');

  // Toggle goal selection
  const toggleGoal = (goal) => {
    if (goals.includes(goal)) {
      setGoals(goals.filter(g => g !== goal));
    } else {
      setGoals([...goals, goal]);
    }
  };

  // Toggle condition selection
  const toggleCondition = (cond) => {
    if (cond === 'None of the above') {
      setConditions(['None of the above']);
      return;
    }
    const filtered = conditions.filter(c => c !== 'None of the above');
    if (filtered.includes(cond)) {
      setConditions(filtered.filter(c => c !== cond));
    } else {
      setConditions([...filtered, cond]);
    }
  };

  // Toggle lifestyle habits
  const toggleLifestyle = (habit) => {
    if (lifestyleHabits.includes(habit)) {
      setLifestyleHabits(lifestyleHabits.filter(h => h !== habit));
    } else {
      setLifestyleHabits([...lifestyleHabits, habit]);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  // BMI calculation
  const weightNum = parseFloat(weight) || 0;
  const heightNum = parseFloat(height) || 1;
  const bmi = weightNum > 0 ? (weightNum / ((heightNum / 100) ** 2)).toFixed(1) : "0.0";
  const bmiFloat = parseFloat(bmi);

  let bmiClass = "Normal";
  let bmiColor = "#05CD99"; // Green
  if (bmiFloat < 18.5) {
    bmiClass = "Underweight";
    bmiColor = "#FFA620";
  } else if (bmiFloat >= 25 && bmiFloat < 30) {
    bmiClass = "Overweight";
    bmiColor = "#FFA620";
  } else if (bmiFloat >= 30) {
    bmiClass = "Obese";
    bmiColor = "#F43F5E";
  }

  const handleFinish = async () => {
    const answers = {
      dob: `${dobDay}/${dobMonth}/${dobYear}`,
      goals,
      activity,
      sleepQuality,
      stressLevel,
      conditions,
      eatingHabit,
      gender,
      weight,
      height,
      dietPreference,
      lifestyleHabits,
      waterIntake,
      bloodReportName
    };
    
    // Generate personalized AI plan
    const generatedPlan = generatePersonalizedPlans(answers);
    
    // Save to backend if logged in
    const isLoggedIn = localStorage.getItem('her2her_is_logged_in') === 'true';
    if (isLoggedIn) {
      try {
        await assessmentApi.saveAssessment({ answers, plan: generatedPlan });
      } catch (err) {
        console.error("Error saving assessment to backend:", err);
      }
    }

    // Save to localStorage database
    planDb.savePlan(generatedPlan);
    
    if (onComplete) {
      onComplete(generatedPlan);
    }
  };

  // Progress bar calculation (only for step 1 to 11)
  const progressPercent = step >= 1 && step <= 11 
    ? Math.round((step / 11) * 100)
    : 0;

  // Confetti particles generator
  const renderConfetti = () => {
    return Array.from({ length: 35 }).map((_, i) => {
      const left = Math.random() * 100;
      const delay = Math.random() * 2.5;
      const duration = 2.5 + Math.random() * 3;
      const size = 6 + Math.random() * 9;
      const colors = ['#FF4B8B', '#7C5CFF', '#05CD99', '#FFA620', '#CBBFFF'];
      const bg = colors[Math.floor(Math.random() * colors.length)];
      return (
        <div 
          key={i} 
          className="confetti-particle" 
          style={{
            left: `${left}%`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: bg,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px'
          }}
        />
      );
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card glass-card menstrual-wizard-card" style={{ maxWidth: '540px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        
        {/* Confetti particles overlay on success */}
        {step === 12 && renderConfetti()}

        {/* Header Close button */}
        {step !== 12 && (
          <button className="modal-close-btn" onClick={onClose} style={{ zIndex: 10 }}>
            <X size={20} />
          </button>
        )}

        {/* Top Progress bar (Step 1-11) */}
        {step >= 1 && step <= 11 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '6px', fontWeight: 600 }}>
              <span>Step {step} of 11</span>
              <span>{progressPercent}% Complete</span>
            </div>
            <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--secondary-violet) 0%, var(--primary-pink) 100%)', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        )}

        {/* BODY WORK */}
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 2 }}>
          
          {/* SLIDE 0: Welcome */}
          {step === 0 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--primary-pink-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-pink)' }}>
                  <Heart size={30} fill="currentColor" />
                </div>
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--text-dark)', marginBottom: '8px' }}>Let's Start Your <br /><span className="gradient-text">Wellness Journey</span></h2>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
                Answer a few questions to help our AI Health Coach create a completely personalized Nutrition, Fitness, and Wellness schedule just for you.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left', background: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ color: 'var(--primary-pink)' }}><Sparkles size={16} /></div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>AI-Customized Diet & Meal Macros</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ color: 'var(--secondary-violet)' }}><Users size={16} /></div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Goal-Specific Exercise & Calorie Budgets</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ color: 'var(--teal-accent)' }}><ShieldCheck size={16} /></div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Clinical Trackers (Diabetes, High BP, PCOS)</span>
                </div>
              </div>

              <button className="btn-primary w-full pulse-glow" onClick={nextStep} style={{ padding: '12px', borderRadius: '99px', fontWeight: 700 }}>Start Assessment</button>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>⏱️ Takes only 3 minutes</div>
            </div>
          )}

          {/* STEP 1: Date of Birth */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-dark)', marginBottom: '6px', fontWeight: 800 }}>What is your date of birth?</h2>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem', marginBottom: '24px' }}>This helps calculate your age for nutritional budgets.</p>

              <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                <Calendar size={64} style={{ color: 'var(--primary-pink)', opacity: 0.8 }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '16px', margin: '20px 0' }}>
                <div className="modal-form-group">
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase' }}>Day (DD)</label>
                  <input type="number" min="1" max="31" className="modal-form-input" value={dobDay} onChange={(e) => setDobDay(e.target.value)} placeholder="DD" style={{ textAlign: 'center' }} />
                </div>
                <div className="modal-form-group">
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase' }}>Month (MM)</label>
                  <input type="number" min="1" max="12" className="modal-form-input" value={dobMonth} onChange={(e) => setDobMonth(e.target.value)} placeholder="MM" style={{ textAlign: 'center' }} />
                </div>
                <div className="modal-form-group">
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase' }}>Year (YYYY)</label>
                  <input type="number" min="1950" max="2026" className="modal-form-input" value={dobYear} onChange={(e) => setDobYear(e.target.value)} placeholder="YYYY" style={{ textAlign: 'center' }} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Goal Selector */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-dark)', marginBottom: '6px', fontWeight: 800 }}>What is your current primary goal?</h2>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem', marginBottom: '16px' }}>Choose the goals you want to focus on.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '10px 0' }}>
                {[
                  { label: "Weight Loss", icon: <Scale size={18} /> },
                  { label: "Improve Fitness", icon: <Dumbbell size={18} /> },
                  { label: "Better Nutrition", icon: <Apple size={18} /> },
                  { label: "Hormonal Balance", icon: <Heart size={18} /> },
                  { label: "Stress Management", icon: <Brain size={18} /> },
                  { label: "Better Sleep", icon: <Moon size={18} /> }
                ].map((item, idx) => {
                  const isSel = goals.includes(item.label);
                  return (
                    <div 
                      key={idx} 
                      onClick={() => toggleGoal(item.label)}
                      className={`glass-card ${isSel ? 'pink-gradient-border' : ''}`}
                      style={{ 
                        padding: '14px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        cursor: 'pointer',
                        border: isSel ? '2px solid var(--primary-pink)' : '1px solid var(--border-color)',
                        background: isSel ? 'var(--primary-pink-light)' : 'var(--card-bg)',
                        borderRadius: '16px'
                      }}
                    >
                      <div style={{ color: isSel ? 'var(--primary-pink)' : 'var(--text-light)' }}>{item.icon}</div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Activity Level */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-dark)', marginBottom: '6px', fontWeight: 800 }}>How would you describe your activity level?</h2>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem', marginBottom: '16px' }}>Choose the option that best fits you.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { title: "Mostly Sedentary", desc: "Little or no exercise" },
                  { title: "Lightly Active", desc: "Light exercise 1-3 days/week" },
                  { title: "Moderately Active", desc: "Moderate exercise 3-5 days/week" },
                  { title: "Very Active", desc: "Hard exercise 6-7 days/week" },
                  { title: "Extremely Active", desc: "Very hard exercise & physical job" }
                ].map((item, idx) => {
                  const isSel = activity === item.title;
                  return (
                    <div 
                      key={idx} 
                      onClick={() => setActivity(item.title)}
                      style={{ 
                        padding: '12px 16px', 
                        borderRadius: '14px', 
                        border: isSel ? '2px solid var(--primary-pink)' : '1px solid var(--border-color)',
                        background: isSel ? 'var(--primary-pink-light)' : 'var(--card-bg)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-dark)' }}>{item.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginTop: '2px' }}>{item.desc}</div>
                      </div>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isSel && <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--primary-pink)' }} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Sleep Quality */}
          {step === 4 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-dark)', marginBottom: '6px', fontWeight: 800 }}>How is your sleep quality?</h2>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem', marginBottom: '16px' }}>Your sleep regulates stress hormones and calorie retention.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { title: "Excellent", desc: "I sleep well and wake up refreshed" },
                  { title: "Good", desc: "I sleep well most of the time" },
                  { title: "Average", desc: "I have trouble sleeping sometimes" },
                  { title: "Poor", desc: "I have difficulty sleeping often" }
                ].map((item, idx) => {
                  const isSel = sleepQuality === item.title;
                  return (
                    <div 
                      key={idx} 
                      onClick={() => setSleepQuality(item.title)}
                      style={{ 
                        padding: '12px 16px', 
                        borderRadius: '14px', 
                        border: isSel ? '2px solid var(--primary-pink)' : '1px solid var(--border-color)',
                        background: isSel ? 'var(--primary-pink-light)' : 'var(--card-bg)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-dark)' }}>{item.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginTop: '2px' }}>{item.desc}</div>
                      </div>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isSel && <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--primary-pink)' }} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Stress Level Scale */}
          {step === 5 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-dark)', marginBottom: '6px', fontWeight: 800 }}>How would you rate your stress level?</h2>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem', marginBottom: '20px' }}>Cortisol levels directly alter fat storage and thyroid health.</p>

              {/* Emoji Selector Row */}
              <div style={{ display: 'flex', justifyContent: 'space-around', margin: '20px 0' }}>
                {[
                  { label: "Very Low", emoji: "😊" },
                  { label: "Low", emoji: "🙂" },
                  { label: "Moderate", emoji: "😐" },
                  { label: "High", emoji: "😟" },
                  { label: "Very High", emoji: "😫" }
                ].map((item, idx) => {
                  const isSel = stressLevel === item.label;
                  return (
                    <div 
                      key={idx} 
                      onClick={() => setStressLevel(item.label)}
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        gap: '6px', 
                        cursor: 'pointer',
                        padding: '10px',
                        borderRadius: '12px',
                        background: isSel ? 'var(--primary-pink-light)' : 'transparent',
                        border: isSel ? '1px solid var(--primary-pink)' : '1px solid transparent'
                      }}
                    >
                      <span style={{ fontSize: '2rem' }}>{item.emoji}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dark)' }}>{item.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Common signs list */}
              <div style={{ background: 'var(--orange-light)', padding: '16px', borderRadius: '16px', border: '1.5px dashed var(--orange-accent)' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--orange-accent)', display: 'block', marginBottom: '8px' }}>Common Signs of High Stress</span>
                <ul style={{ fontSize: '0.8rem', color: 'var(--text-gray)', paddingLeft: '16px', lineHeight: 1.6, margin: 0 }}>
                  <li>Fatigue or brain fog</li>
                  <li>Cravings for sugary snacks</li>
                  <li>Irregular heartbeat or tension</li>
                </ul>
              </div>
            </div>
          )}

          {/* STEP 6: Health Conditions Checkboxes */}
          {step === 6 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-dark)', marginBottom: '6px', fontWeight: 800 }}>Do you have any of the following conditions?</h2>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem', marginBottom: '16px' }}>Select all that apply.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: "PCOS / PCOD", icon: <Heart size={16} /> },
                  { label: "Thyroid", icon: <Brain size={16} /> },
                  { label: "Diabetes", icon: <Droplet size={16} /> },
                  { label: "High Blood Pressure", icon: <ShieldAlert size={16} /> },
                  { label: "Anemia", icon: <Droplet size={16} /> },
                  { label: "None of the above", icon: <Check size={16} /> }
                ].map((item, idx) => {
                  const isSel = conditions.includes(item.label);
                  return (
                    <div 
                      key={idx} 
                      onClick={() => toggleCondition(item.label)}
                      style={{ 
                        padding: '12px 14px', 
                        borderRadius: '16px', 
                        border: isSel ? '2px solid var(--primary-pink)' : '1px solid var(--border-color)',
                        background: isSel ? 'var(--primary-pink-light)' : 'var(--card-bg)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: isSel ? 'var(--primary-pink)' : 'var(--text-light)' }}>{item.icon}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>{item.label}</span>
                      </div>
                      <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: '1.5px solid var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isSel && <Check size={12} style={{ color: 'var(--primary-pink)' }} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 7: Eating Habits */}
          {step === 7 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-dark)', marginBottom: '6px', fontWeight: 800 }}>How would you describe your eating habits?</h2>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem', marginBottom: '16px' }}>Choose the option that best matches you.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { title: "Very Healthy", desc: "I eat balanced & nutritious meals regularly" },
                  { title: "Healthy", desc: "I try to eat healthy most of the time" },
                  { title: "Average", desc: "My eating habits are okay" },
                  { title: "Unhealthy", desc: "I eat unhealthy food frequently" }
                ].map((item, idx) => {
                  const isSel = eatingHabit === item.title;
                  return (
                    <div 
                      key={idx} 
                      onClick={() => setEatingHabit(item.title)}
                      style={{ 
                        padding: '12px 16px', 
                        borderRadius: '14px', 
                        border: isSel ? '2px solid var(--primary-pink)' : '1px solid var(--border-color)',
                        background: isSel ? 'var(--primary-pink-light)' : 'var(--card-bg)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-dark)' }}>{item.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginTop: '2px' }}>{item.desc}</div>
                      </div>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isSel && <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--primary-pink)' }} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 8: Gender Selection */}
          {step === 8 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-dark)', marginBottom: '6px', fontWeight: 800 }}>What is your gender?</h2>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem', marginBottom: '20px' }}>This calibrates biological metabolic formulas (BMR).</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {['Female', 'Male', 'Non-binary', 'Prefer not to say'].map((item) => {
                  const isSel = gender === item;
                  return (
                    <div 
                      key={item} 
                      onClick={() => setGender(item)}
                      style={{ 
                        padding: '16px', 
                        borderRadius: '16px', 
                        border: isSel ? '2px solid var(--primary-pink)' : '1px solid var(--border-color)',
                        background: isSel ? 'var(--primary-pink-light)' : 'var(--card-bg)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        fontWeight: 600,
                        color: 'var(--text-dark)'
                      }}
                    >
                      {item}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 9: Height, Weight & BMI */}
          {step === 9 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-dark)', marginBottom: '6px', fontWeight: 800 }}>Enter your height & weight</h2>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem', marginBottom: '20px' }}>This calculates your BMI to personalize your metabolic roadmap.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div className="modal-form-group">
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase' }}>Height (cm)</label>
                  <input type="number" min="100" max="250" className="modal-form-input" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="cm" style={{ textAlign: 'center' }} />
                </div>
                <div className="modal-form-group">
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase' }}>Weight (kg)</label>
                  <input type="number" min="30" max="200" className="modal-form-input" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="kg" style={{ textAlign: 'center' }} />
                </div>
              </div>

              {/* BMI Indicator Widget */}
              {weightNum > 0 && heightNum > 0 && (
                <div style={{ background: 'var(--card-bg)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '4px' }}>Calculated BMI</span>
                  <h3 style={{ fontSize: '2rem', fontWeight: 800, color: bmiColor, margin: '4px 0' }}>{bmi}</h3>
                  <span style={{ padding: '4px 12px', borderRadius: '99px', backgroundColor: `${bmiColor}15`, color: bmiColor, fontSize: '0.8rem', fontWeight: 700 }}>
                    {bmiClass}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* STEP 10: Dietary Preferences & Water */}
          {step === 10 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-dark)', marginBottom: '6px', fontWeight: 800 }}>Dietary & Hydration targets</h2>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem', marginBottom: '16px' }}>Configure your AI Nutrition preferences.</p>
              
              <div className="modal-form-group" style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.8', color: 'var(--text-light)' }}>Diet Preference</label>
                <select className="modal-form-input" value={dietPreference} onChange={(e) => setDietPreference(e.target.value)} style={{ width: '100%' }}>
                  <option value="Balanced">Balanced Diet</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Keto">Ketogenic (Keto)</option>
                  <option value="Low Carb">Low Carbohydrates</option>
                  <option value="Gluten-Free">Gluten-Free</option>
                </select>
              </div>

              <div className="modal-form-group" style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Daily Hydration (Glasses of Water)</label>
                <input type="number" min="4" max="20" className="modal-form-input" value={waterIntake} onChange={(e) => setWaterIntake(e.target.value)} style={{ textAlign: 'center' }} />
              </div>

              <div className="modal-form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-light)', display: 'block', marginBottom: '6px' }}>Lifestyle Habits</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {['Coffee drinker', 'Alcohol social', 'Smoking'].map(habit => {
                    const isSel = lifestyleHabits.includes(habit);
                    return (
                      <button 
                        key={habit} 
                        type="button" 
                        onClick={() => toggleLifestyle(habit)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '10px',
                          border: isSel ? '2px solid var(--secondary-violet)' : '1px solid var(--border-color)',
                          background: isSel ? 'var(--primary-pink-light)' : 'transparent',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          color: 'var(--text-dark)'
                        }}
                      >
                        {habit}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 11: Blood Test Report Upload */}
          {step === 11 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-dark)', marginBottom: '6px', fontWeight: 800 }}>Upload Blood Test Report</h2>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem', marginBottom: '20px' }}>Adding your latest reports helps our AI provide more clinical accuracy.</p>
              
              <div style={{ 
                border: '2px dashed var(--border-color)', 
                borderRadius: '20px', 
                padding: '40px 20px', 
                textAlign: 'center',
                backgroundColor: 'rgba(0,0,0,0.01)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{ color: 'var(--secondary-violet)', opacity: 0.8 }}>
                  <Activity size={48} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--text-dark)', marginBottom: '4px' }}>
                    {bloodReportName ? bloodReportName : 'Choose PDF Report'}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Maximum file size: 5MB</p>
                </div>
                
                <input 
                  type="file" 
                  id="blood-report-upload" 
                  accept=".pdf" 
                  style={{ display: 'none' }} 
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setBloodReport(file);
                      setBloodReportName(file.name);
                    }
                  }}
                />
                <label 
                  htmlFor="blood-report-upload" 
                  className="btn-ghost" 
                  style={{ 
                    cursor: 'pointer', 
                    padding: '8px 20px', 
                    border: '1.5px solid var(--secondary-violet)',
                    color: 'var(--secondary-violet)',
                    borderRadius: '99px',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}
                >
                  {bloodReportName ? 'Change File' : 'Select PDF'}
                </label>
              </div>

              {bloodReportName && (
                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#05CD99', backgroundColor: 'rgba(5, 205, 153, 0.1)', padding: '10px 16px', borderRadius: '12px' }}>
                  <CheckCircle2 size={16} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>File uploaded successfully!</span>
                </div>
              )}
            </div>
          )}

          {/* SLIDE 12: Completed (confetti celebration) */}
          {step === 12 && (
            <div style={{ textAlign: 'center', zIndex: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(5, 205, 153, 0.1)', color: '#05CD99', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={44} fill="currentColor" color="white" />
                </div>
              </div>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--text-dark)', marginBottom: '8px', fontWeight: 800, lineHeight: 1.3 }}>
                🎉 Your Personalized Health <br /> Plans Have Been Created
              </h2>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem', marginBottom: '24px', lineHeight: 1.5 }}>
                Our AI Health Coach has generated your customized Nutrition Plan, Fitness Plan, Wellness Routine, and Health Tracker.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', background: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '16px', marginBottom: '24px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-dark)', fontWeight: 600 }}>
                  <span style={{ color: 'var(--teal-accent)' }}>✓</span> Nutrition Plan (Diet, Meal macros)
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-dark)', fontWeight: 600 }}>
                  <span style={{ color: 'var(--teal-accent)' }}>✓</span> Fitness Plan (Custom exercises, weekly schedule)
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-dark)', fontWeight: 600 }}>
                  <span style={{ color: 'var(--teal-accent)' }}>✓</span> Wellness Routine (Habits, breathing exercises)
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-dark)', fontWeight: 600 }}>
                  <span style={{ color: 'var(--teal-accent)' }}>✓</span> Health Tracker (Vitals logs, AI advice)
                </div>
              </div>

              <button className="btn-primary w-full pulse-glow" onClick={handleFinish} style={{ padding: '12px', borderRadius: '99px', fontWeight: 700 }}>View My Plans</button>
              <button className="btn-ghost" onClick={() => setStep(1)} style={{ display: 'block', width: '100%', marginTop: '12px', fontWeight: 600, color: 'var(--text-light)', fontSize: '0.85rem' }}>Update Assessment</button>
            </div>
          )}

        </div>

        {/* BOTTOM ACTIONS (Step 1-11) */}
        {step >= 1 && step <= 11 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '20px' }}>
            <button className="btn-secondary" onClick={prevStep} style={{ padding: '10px 24px', borderRadius: '99px', fontWeight: 600 }}>Back</button>
            <button className="btn-primary" onClick={step === 11 ? nextStep : nextStep} style={{ padding: '10px 28px', borderRadius: '99px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              {step === 11 ? 'Finish' : 'Next'} <ChevronRight size={14} />
            </button>
          </div>
        )}

      </div>

      {/* Confetti styles injector */}
      <style>{`
        .confetti-particle {
          position: absolute;
          top: -20px;
          z-index: 1;
          opacity: 0.8;
          animation: fall linear infinite;
        }
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(580px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
