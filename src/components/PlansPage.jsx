import React, { useState, useEffect } from 'react';
import { 
  Apple, Dumbbell, Moon, Activity, ChevronRight, 
  Plus, Minus, Check, MessageSquare, Info, X,
  Droplet, Footprints, Flower2, ShieldCheck, Salad, 
  ArrowLeft, Flame, Clock, Heart, Scale, Calendar, Brain,
  Award, Trophy, Bell, Sparkles, LogOut, ChevronLeft
} from 'lucide-react';
import { generatePersonalizedPlans, planDb } from '../utils/planGenerator';
import bannerImg from '../assets/wellness_plan_header.png';

// Sub-component: Circular Progress Indicator using SVGs
function CircularProgress({ percent, value, label, color, size = 80 }) {
  const radius = (size - 16) / 2;
  const strokeWidth = 6;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle 
            cx={center} 
            cy={center} 
            r={radius} 
            fill="transparent" 
            stroke="var(--border-color)" 
            strokeWidth={strokeWidth} 
          />
          <circle 
            cx={center} 
            cy={center} 
            r={radius} 
            fill="transparent" 
            stroke={color} 
            strokeWidth={strokeWidth} 
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
          />
        </svg>
        <div style={{ position: 'absolute', fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-dark)' }}>
          {value}
        </div>
      </div>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '8px', fontWeight: 600, textAlign: 'center' }}>{label}</span>
    </div>
  );
}

// Sub-component: Box Breathing Mindfulness Widget
function BoxBreathing() {
  const [phase, setPhase] = useState('Inhale'); // Inhale, Hold, Exhale, Hold
  const [seconds, setSeconds] = useState(4);
  const [active, setActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (active) {
      interval = setInterval(() => {
        setSeconds(prev => {
          if (prev === 1) {
            setPhase(p => {
              if (p === 'Inhale') return 'Hold (Full)';
              if (p === 'Hold (Full)') return 'Exhale';
              if (p === 'Exhale') return 'Hold (Empty)';
              return 'Inhale';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setSeconds(4);
      setPhase('Inhale');
    }
    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className="glass-card" style={{ padding: '24px', textAlign: 'center', marginTop: '20px', borderRadius: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
        <Brain size={18} style={{ color: 'var(--primary-pink)' }} />
        <h4 style={{ fontWeight: 800, color: 'var(--text-dark)', fontSize: '1rem', margin: 0 }}>Mindfulness: Box Breathing</h4>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginBottom: '16px' }}>Regulate cortisol levels and reduce anxiety with standard box breathing.</p>
      
      {active ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0' }}>
          <div className="breathing-circle-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Pulsing ring */}
            <div style={{
              position: 'absolute',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: '2px solid var(--primary-pink)',
              opacity: 0.3,
              transform: phase === 'Inhale' || phase === 'Hold (Full)' ? 'scale(1.3)' : 'scale(0.9)',
              transition: 'transform 4s linear'
            }} />
            
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-pink-light)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-pink)',
              fontWeight: 800,
              zIndex: 2,
              transform: phase === 'Inhale' || phase === 'Hold (Full)' ? 'scale(1.25)' : 'scale(1.0)',
              transition: 'transform 4s linear'
            }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', trackingLetter: '1px' }}>{phase}</span>
              <span style={{ fontSize: '1.4rem' }}>{seconds}s</span>
            </div>
          </div>
          <button className="btn-secondary" onClick={() => setActive(false)} style={{ marginTop: '24px', padding: '8px 20px', borderRadius: '99px', fontSize: '0.85rem' }}>Stop Session</button>
        </div>
      ) : (
        <button className="btn-primary pulse-glow w-full" onClick={() => setActive(true)} style={{ padding: '10px 0', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700 }}>Start Breathing Exercise</button>
      )}
    </div>
  );
}

export default function PlansPage({ setChatOpen, userProfile, onStartAssessment, isLoggedIn, setIsLoggedIn, onOpenLogin }) {
  // Navigation active tab sub-view
  const [activePlanView, setActivePlanView] = useState(null); // null, 'Nutrition', 'Fitness', 'Routine', 'Tracker'

  // Dynamic Plans State
  const [activePlan, setActivePlan] = useState(null);

  // Health Records Database State
  const [records, setRecords] = useState({
    weightLogs: [],
    sleepLogs: [],
    waterLogs: [],
    moodLogs: [],
    workoutLogs: [],
    stepsLogs: []
  });

  // Track state increments for today
  const [loggedCalories, setLoggedCalories] = useState(0);
  const [loggedProtein, setLoggedProtein] = useState(0);

  // Completed items trackers
  const [completedMeals, setCompletedMeals] = useState({});
  const [completedExercises, setCompletedExercises] = useState({});
  const [completedHabits, setCompletedHabits] = useState({});

  // Log Form Modals
  const [showLogModal, setShowLogModal] = useState(null); // null, 'weight', 'sleep', 'water', 'mood', 'workout', 'steps'
  const [logValue, setLogValue] = useState('');
  const [logOptionValue, setLogOptionValue] = useState('');
  const [logDurationValue, setLogDurationValue] = useState('');

  // Notifications alerts mock
  const [showNotification, setShowNotification] = useState(true);

  // Initialize and Sync Plan & Records
  useEffect(() => {
    const loadedPlan = planDb.loadPlan();
    if (loadedPlan) {
      setActivePlan(loadedPlan);
      // Initialize completed habits from plan
      const hMap = {};
      loadedPlan.habits?.forEach(h => {
        hMap[h.key] = h.completed;
      });
      setCompletedHabits(hMap);
    } else if (userProfile) {
      setActivePlan(userProfile);
    } else {
      // Set default plan
      const defaultAnswers = {
        dob: "12/07/1998",
        goals: ["Weight Management"],
        activity: "Lightly Active",
        sleepQuality: "Good",
        stressLevel: "Moderate",
        conditions: ["None of the above"],
        eatingHabit: "Healthy",
        gender: "Female",
        weight: "60",
        height: "165",
        dietPreference: "Balanced",
        lifestyleHabits: [],
        waterIntake: "8"
      };
      setActivePlan(generatePersonalizedPlans(defaultAnswers));
    }

    // Load records
    const loadedRecords = planDb.loadRecords();
    setRecords(loadedRecords);
  }, [userProfile]);

  // Derived Values from Records for Today
  const todayStr = new Date().toLocaleDateString();

  const loggedWater = records.waterLogs
    ? records.waterLogs.filter(log => log.date === todayStr).reduce((sum, log) => sum + (parseFloat(log.value) || 0), 0)
    : 0;

  const loggedSteps = records.stepsLogs
    ? records.stepsLogs.filter(log => log.date === todayStr).reduce((sum, log) => sum + (parseInt(log.value) || 0), 0)
    : 0;

  const currentWeight = records.weightLogs && records.weightLogs.length > 0
    ? parseFloat(records.weightLogs[records.weightLogs.length - 1].value)
    : parseFloat(activePlan?.weight || 60);

  const currentSleep = records.sleepLogs && records.sleepLogs.length > 0
    ? parseFloat(records.sleepLogs[records.sleepLogs.length - 1].value)
    : 7.5;

  const currentMood = records.moodLogs && records.moodLogs.length > 0
    ? records.moodLogs[records.moodLogs.length - 1].value
    : 'Happy';

  const workoutsCompletedCount = records.workoutLogs
    ? records.workoutLogs.filter(log => log.date === todayStr).length
    : 0;

  const workoutCaloriesBurned = records.workoutLogs
    ? records.workoutLogs.filter(log => log.date === todayStr).reduce((sum, log) => sum + (parseInt(log.calories) || 0), 0)
    : 0;

  const activeMinutesLogged = records.workoutLogs
    ? records.workoutLogs.filter(log => log.date === todayStr).reduce((sum, log) => sum + (parseInt(log.duration) || 0), 0)
    : 0;

  // Meal state handlers
  const toggleMealComplete = (mealKey, meal) => {
    const isEaten = !completedMeals[mealKey];
    setCompletedMeals(prev => ({ ...prev, [mealKey]: isEaten }));
    if (isEaten) {
      setLoggedCalories(prev => prev + meal.cal);
      setLoggedProtein(prev => prev + meal.p);
    } else {
      setLoggedCalories(prev => Math.max(0, prev - meal.cal));
      setLoggedProtein(prev => Math.max(0, prev - meal.p));
    }
  };

  // Workout Exercise complete handlers
  const toggleExerciseComplete = (exIdx) => {
    setCompletedExercises(prev => ({ ...prev, [exIdx]: !prev[exIdx] }));
  };

  // Complete Workout helper
  const completeWorkoutRoutine = () => {
    if (workoutsCompletedCount > 0) {
      alert("Workout already logged for today! Keep up the rest.");
      return;
    }
    const duration = activePlan?.workoutDuration || 30;
    const calories = activePlan?.workoutBurn || 250;
    
    // Add workout log
    const updatedWorkoutLogs = [...(records.workoutLogs || [])];
    updatedWorkoutLogs.push({
      date: todayStr,
      name: activePlan?.workoutName || "Holistic Workout",
      duration,
      calories
    });

    const updated = { ...records, workoutLogs: updatedWorkoutLogs };
    planDb.saveRecords(updated);
    setRecords(updated);
    
    // Check all exercises
    const eMap = {};
    activePlan?.exercises?.forEach((_, i) => {
      eMap[i] = true;
    });
    setCompletedExercises(eMap);
    alert(`🎉 Workout completed! Logged ${duration} mins active and ${calories} kcal burned.`);
  };

  // Toggle habit tracker checklist items
  const toggleHabitState = (key) => {
    const nextVal = !completedHabits[key];
    setCompletedHabits(prev => ({ ...prev, [key]: nextVal }));

    // If it's a numeric logged item, log it too!
    if (key === 'water' && nextVal) {
      addRecordLogDirect('water', 8 - loggedWater);
    } else if (key === 'sleep' && nextVal) {
      addRecordLogDirect('sleep', 8);
    }
  };

  // Calculate Goal Completion Percentage dynamically based on active indicators:
  // (Completed Habits + Eaten Meals + Logged Water percent + Logged Steps percent) / Total metrics
  const totalHabits = activePlan?.habits?.length || 7;
  const completedHabitsCount = Object.values(completedHabits).filter(Boolean).length;
  
  const waterPercent = Math.min((loggedWater / (parseInt(activePlan?.waterIntake) || 8)) * 100, 100);
  const stepsPercent = Math.min((loggedSteps / 10000) * 100, 100);
  const mealPercent = (Object.values(completedMeals).filter(Boolean).length / 4) * 100;
  
  const goalCompletionPercentage = Math.round(
    (completedHabitsCount / totalHabits) * 40 +
    (waterPercent) * 0.2 +
    (stepsPercent) * 0.2 +
    (mealPercent) * 0.2
  );

  // Logging record prompt handlers
  const handleLogSubmit = (e) => {
    e.preventDefault();
    if (!logValue) return;

    const key = showLogModal;
    const value = logValue;
    const date = todayStr;

    const newRecords = { ...records };

    if (key === 'weight') {
      if (!newRecords.weightLogs) newRecords.weightLogs = [];
      newRecords.weightLogs.push({ date, value: parseFloat(value) });
    } else if (key === 'sleep') {
      if (!newRecords.sleepLogs) newRecords.sleepLogs = [];
      newRecords.sleepLogs.push({ date, value: parseFloat(value) });
    } else if (key === 'water') {
      if (!newRecords.waterLogs) newRecords.waterLogs = [];
      newRecords.waterLogs.push({ date, value: parseFloat(value) });
    } else if (key === 'mood') {
      if (!newRecords.moodLogs) newRecords.moodLogs = [];
      newRecords.moodLogs.push({ date, value: logOptionValue || value });
    } else if (key === 'steps') {
      if (!newRecords.stepsLogs) newRecords.stepsLogs = [];
      newRecords.stepsLogs.push({ date, value: parseInt(value) });
    } else if (key === 'workout') {
      if (!newRecords.workoutLogs) newRecords.workoutLogs = [];
      newRecords.workoutLogs.push({
        date,
        name: value,
        duration: parseInt(logDurationValue) || 30,
        calories: parseInt(logOptionValue) || 150
      });
    }

    planDb.saveRecords(newRecords);
    setRecords(newRecords);
    setShowLogModal(null);
    setLogValue('');
    setLogOptionValue('');
    setLogDurationValue('');
    alert('Record logged successfully! 📊');
  };

  // direct logging for incrementors
  const addRecordLogDirect = (key, value) => {
    const newRecords = { ...records };
    const date = todayStr;

    if (key === 'water') {
      if (!newRecords.waterLogs) newRecords.waterLogs = [];
      newRecords.waterLogs.push({ date, value: parseFloat(value) });
    } else if (key === 'steps') {
      if (!newRecords.stepsLogs) newRecords.stepsLogs = [];
      newRecords.stepsLogs.push({ date, value: parseInt(value) });
    } else if (key === 'sleep') {
      if (!newRecords.sleepLogs) newRecords.sleepLogs = [];
      newRecords.sleepLogs.push({ date, value: parseFloat(value) });
    }

    planDb.saveRecords(newRecords);
    setRecords(newRecords);
  };

  // Helper back button
  const goBack = () => setActivePlanView(null);

  // Circular Dials and layout variables
  const calorieLimit = activePlan?.calorieTarget || 1800;
  const proteinLimit = activePlan?.proteinTarget || 75;
  const waterLimit = parseInt(activePlan?.waterIntake) || 8;
  const stepsLimit = 10000;

  return (
    <div style={{ position: 'relative', minHeight: '80vh' }}>
      
      {/* 1. PREMIUM LOCK SCREEN OVERLAY IF NOT LOGGED IN */}
      {!isLoggedIn && (
        <div className="premium-lock-overlay" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.45)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          borderRadius: '24px',
          padding: '20px'
        }}>
          <div className="glass-card lock-screen-modal" style={{
            maxWidth: '440px',
            width: '100%',
            padding: '40px 30px',
            textAlign: 'center',
            borderRadius: '24px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid rgba(255, 255, 255, 0.7)',
            background: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: 'pulse-soft 4s infinite'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-pink-light)',
              color: 'var(--primary-pink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              fontSize: '1.8rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              🔒
            </div>
            
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--text-dark)', marginBottom: '8px' }}>
              Login Required
            </h2>
            <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.4 }}>
              Your AI-generated plans are ready.<br />Login to unlock your wellness companion:
            </p>

            <div style={{
              alignSelf: 'stretch',
              textAlign: 'left',
              background: 'rgba(0,0,0,0.02)',
              padding: '16px 20px',
              borderRadius: '16px',
              marginBottom: '24px',
              fontSize: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-dark)', fontWeight: 600 }}>
                <span style={{ color: 'var(--primary-pink)', fontSize: '1.1rem' }}>✓</span> Nutrition Plan
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-dark)', fontWeight: 600 }}>
                <span style={{ color: 'var(--primary-pink)', fontSize: '1.1rem' }}>✓</span> Fitness Plan
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-dark)', fontWeight: 600 }}>
                <span style={{ color: 'var(--primary-pink)', fontSize: '1.1rem' }}>✓</span> Wellness Routine
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-dark)', fontWeight: 600 }}>
                <span style={{ color: 'var(--primary-pink)', fontSize: '1.1rem' }}>✓</span> Health Tracker
              </div>
            </div>

            <button className="btn-primary w-full pulse-glow" onClick={onOpenLogin} style={{ padding: '12px', borderRadius: '99px', fontWeight: 700, fontSize: '0.95rem', marginBottom: '12px' }}>
              Login
            </button>
            
            <button className="btn-ghost" onClick={onOpenLogin} style={{ fontWeight: 600, color: 'var(--primary-pink)', fontSize: '0.85rem' }}>
              Create Account
            </button>
          </div>
        </div>
      )}

      {/* 2. CORE CONTAINER - BLURRED IF NOT LOGGED IN */}
      <div style={{ filter: isLoggedIn ? 'none' : 'blur(8px)', pointerEvents: isLoggedIn ? 'auto' : 'none', userSelect: isLoggedIn ? 'auto' : 'none' }}>
        
        {/* NUTRITION PLAN SCREEN VIEW */}
        {activePlanView === 'Nutrition' && (
          <div className="page-container" style={{ maxWidth: '800px' }}>
            <button className="btn-ghost" onClick={goBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontWeight: 600 }}>
              <ArrowLeft size={16} /> Back to Dashboard
            </button>

            {/* Hero Section */}
            <div className="page-banner-card" style={{ background: 'linear-gradient(135deg, rgba(5, 205, 153, 0.1) 0%, rgba(124, 92, 255, 0.1) 100%)', borderRadius: '24px', overflow: 'hidden' }}>
              <div className="page-banner-content">
                <h1 className="page-banner-title" style={{ fontSize: '2rem' }}>Your Nutrition Plan</h1>
                <p className="page-banner-desc" style={{ fontWeight: 600, color: 'var(--teal-accent)' }}>Eat Right, Feel Amazing 💖</p>
                <p className="page-banner-desc" style={{ fontSize: '0.85rem', marginTop: '6px' }}>AI-customized dietary recommendations, micro-macros budgets, and curated meals.</p>
              </div>
              <div className="page-banner-visual">
                <svg className="wellness-illustration-svg" viewBox="0 0 200 200" fill="none" width="100" height="100">
                  <circle cx="100" cy="100" r="70" fill="var(--teal-light)" />
                  <path d="M70 110a30 30 0 0060 0v-20H70v20z" fill="var(--teal-accent)" />
                  <circle cx="90" cy="80" r="8" fill="#FF4B8B" />
                  <path d="M110 70l-5 15h10l-5-15z" fill="#FFA620" />
                </svg>
              </div>
            </div>

            {/* Today's Progress Rings */}
            <h3 className="page-section-title" style={{ marginBottom: '16px' }}>Today's Progress</h3>
            <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', padding: '24px', marginBottom: '30px', borderRadius: '24px', textAlign: 'center' }}>
              <CircularProgress 
                percent={(loggedCalories / calorieLimit) * 100} 
                value={loggedCalories} 
                label={`Calories (kcal)`} 
                color="var(--primary-pink)" 
              />
              <CircularProgress 
                percent={(loggedProtein / proteinLimit) * 100} 
                value={`${loggedProtein}g`} 
                label={`Protein`} 
                color="var(--secondary-violet)" 
              />
              <CircularProgress 
                percent={(loggedWater / waterLimit) * 100} 
                value={loggedWater} 
                label={`Water (gls)`} 
                color="var(--blue-accent)" 
              />
              <CircularProgress 
                percent={activePlan?.nutritionScore || 85} 
                value={activePlan?.nutritionScore || 85} 
                label={`Nutrition Score`} 
                color="var(--teal-accent)" 
              />
            </div>

            {/* Meal Plan & Daily Goals side-by-side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '30px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 className="page-section-title" style={{ margin: 0 }}>Today's Meal Plan</h3>
                  <button className="btn-ghost" onClick={() => { setLoggedCalories(0); setLoggedProtein(0); setCompletedMeals({}); }} style={{ fontSize: '0.8rem', color: 'var(--primary-pink)', fontWeight: 600 }}>Reset Meals</button>
                </div>
                
                <div className="glass-card" style={{ padding: '16px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {activePlan?.meals && Object.entries(activePlan.meals).map(([mealKey, meal]) => {
                    const isCompleted = completedMeals[mealKey];
                    return (
                      <div key={mealKey} className="checklist-item" style={{ padding: '12px', borderRadius: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-light)' }}>{mealKey}</span>
                            {isCompleted && <span style={{ fontSize: '0.75rem', color: 'var(--teal-accent)', fontWeight: 700 }}>✓ Logged</span>}
                          </div>
                          <div style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.95rem', marginTop: '2px' }}>{meal.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginTop: '4px' }}>
                            🔥 {meal.cal} kcal • 🥩 {meal.p}g P • 🍞 {meal.c}g C • 🥑 {meal.f}g F
                          </div>
                        </div>
                        <button 
                          onClick={() => toggleMealComplete(mealKey, meal)} 
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: isCompleted ? 'var(--teal-accent)' : 'var(--primary-pink-light)',
                            color: isCompleted ? 'white' : 'var(--primary-pink)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {isCompleted ? <Check size={16} /> : <Plus size={16} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="page-section-title" style={{ marginBottom: '16px' }}>Daily Nutrition Goals</h3>
                <div className="glass-card" style={{ padding: '24px', borderRadius: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                        <span>Calories</span>
                        <span>{loggedCalories} / {calorieLimit} kcal</span>
                      </div>
                      <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min((loggedCalories / calorieLimit) * 100, 100)}%`, height: '100%', background: 'var(--primary-pink)', borderRadius: '3px' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                        <span>Protein</span>
                        <span>{loggedProtein} / {proteinLimit}g</span>
                      </div>
                      <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min((loggedProtein / proteinLimit) * 100, 100)}%`, height: '100%', background: 'var(--secondary-violet)', borderRadius: '3px' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                        <span>Carbs Target</span>
                        <span>{activePlan?.carbsTarget || 150}g</span>
                      </div>
                      <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: '60%', height: '100%', background: 'var(--teal-accent)', borderRadius: '3px' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                        <span>Fats Target</span>
                        <span>{activePlan?.fatsTarget || 50}g</span>
                      </div>
                      <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: '45%', height: '100%', background: 'var(--orange-accent)', borderRadius: '3px' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                        <span>Fiber</span>
                        <span>{activePlan?.fiberTarget || 28}g</span>
                      </div>
                      <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: '70%', height: '100%', background: 'var(--blue-accent)', borderRadius: '3px' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Chips: What's Included */}
            <h3 className="page-section-title" style={{ marginBottom: '16px' }}>What's Included</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '30px' }}>
              {['High Protein Meals', 'Balanced Nutrition', 'Calorie Control', 'Healthy Recipes', 'Expert Guidance'].map(chip => (
                <span key={chip} style={{ padding: '8px 16px', borderRadius: '99px', background: 'var(--teal-light)', color: 'var(--teal-accent)', fontWeight: 600, fontSize: '0.8rem' }}>{chip}</span>
              ))}
            </div>
          </div>
        )}

        {/* FITNESS PLAN SCREEN VIEW */}
        {activePlanView === 'Fitness' && (
          <div className="page-container" style={{ maxWidth: '800px' }}>
            <button className="btn-ghost" onClick={goBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontWeight: 600 }}>
              <ArrowLeft size={16} /> Back to Dashboard
            </button>

            {/* Hero Section */}
            <div className="page-banner-card" style={{ background: 'linear-gradient(135deg, rgba(124, 92, 255, 0.1) 0%, rgba(255, 75, 139, 0.1) 100%)', borderRadius: '24px' }}>
              <div className="page-banner-content">
                <h1 className="page-banner-title" style={{ fontSize: '2rem' }}>Your Fitness Plan</h1>
                <p className="page-banner-desc" style={{ fontWeight: 600, color: 'var(--secondary-violet)' }}>Stronger Every Day 💪</p>
                <p className="page-banner-desc" style={{ fontSize: '0.85rem', marginTop: '6px' }}>Cycle-aligned exercises, dynamic workouts intensity adjustments, and training programs.</p>
              </div>
              <div className="page-banner-visual">
                <svg className="wellness-illustration-svg" viewBox="0 0 200 200" fill="none" width="100" height="100">
                  <circle cx="100" cy="100" r="70" fill="var(--secondary-violet-light)" />
                  <rect x="75" y="90" width="50" height="20" rx="4" fill="var(--secondary-violet)" />
                  <rect x="65" y="85" width="10" height="30" rx="2" fill="var(--text-dark)" />
                  <rect x="125" y="85" width="10" height="30" rx="2" fill="var(--text-dark)" />
                </svg>
              </div>
            </div>

            {/* Weekly Progress */}
            <h3 className="page-section-title" style={{ marginBottom: '16px' }}>Weekly Progress</h3>
            <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', padding: '20px', marginBottom: '30px', borderRadius: '24px', textAlign: 'center' }}>
              <div>
                <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <Dumbbell size={16} style={{ color: 'var(--secondary-violet)' }} /> 
                  {workoutsCompletedCount} <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>/ {activePlan?.workoutsTarget || 4}</span>
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>Workouts Done</span>
              </div>
              
              <div>
                <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <Flame size={16} style={{ color: 'var(--primary-pink)' }} /> 
                  {workoutCaloriesBurned}
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>Calories Burned</span>
              </div>

              <div>
                <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <Clock size={16} style={{ color: 'var(--blue-accent)' }} /> 
                  {activeMinutesLogged} <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>m</span>
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>Active Minutes</span>
              </div>

              <div>
                <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <Sparkles size={16} style={{ color: 'var(--teal-accent)' }} /> 
                  {activePlan?.fitnessScore || 78}
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>Fitness Score</span>
              </div>
            </div>

            {/* Today's Workout Exercises & Schedule */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '30px' }}>
              <div>
                <h3 className="page-section-title" style={{ marginBottom: '16px' }}>Today's Workout</h3>
                <div className="glass-card" style={{ padding: '24px', borderRadius: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h4 style={{ fontWeight: 800, color: 'var(--text-dark)', fontSize: '1.1rem' }}>{activePlan?.workoutName || "Holistic Workout"}</h4>
                      <span className="risk-badge low" style={{ background: 'var(--secondary-violet-light)', color: 'var(--secondary-violet)', padding: '2px 8px', fontSize: '0.75rem', marginTop: '4px', display: 'inline-block', borderRadius: '4px', fontWeight: 700 }}>
                        {activePlan?.workoutDiff || "Beginner"}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)', fontWeight: 600 }}>
                      ⏱️ {activePlan?.workoutDuration || 30} min • 🔥 {activePlan?.workoutBurn || 250} kcal
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                    {activePlan?.exercises?.map((ex, idx) => {
                      const isDone = completedExercises[idx];
                      return (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button 
                              onClick={() => toggleExerciseComplete(idx)}
                              style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '4px',
                                border: '2px solid var(--secondary-violet)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: isDone ? 'var(--secondary-violet)' : 'transparent',
                                color: 'white'
                              }}
                            >
                              {isDone && <Check size={12} />}
                            </button>
                            <span style={{ fontWeight: 600, color: 'var(--text-dark)', textDecoration: isDone ? 'line-through' : 'none', opacity: isDone ? 0.6 : 1 }}>{ex.name}</span>
                          </div>
                          <span style={{ color: 'var(--text-light)', fontWeight: 600 }}>{ex.sets} sets x {ex.reps}</span>
                        </div>
                      );
                    })}
                  </div>

                  <button className="btn-primary w-full" onClick={completeWorkoutRoutine} style={{ padding: '12px', borderRadius: '12px', fontWeight: 700 }}>
                    {workoutsCompletedCount > 0 ? "Workout Logged ✓" : "Complete Workout"}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="page-section-title" style={{ marginBottom: '16px' }}>Workout Plan Schedule</h3>
                <div className="glass-card" style={{ padding: '16px', borderRadius: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {activePlan?.schedule && Object.entries(activePlan.schedule).map(([day, type]) => {
                      const isToday = day === new Date().toLocaleDateString('en-US', { weekday: 'short' });
                      return (
                        <div key={day} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '12px', background: isToday ? 'var(--secondary-violet-light)' : 'transparent' }}>
                          <span style={{ fontWeight: 800, color: isToday ? 'var(--secondary-violet)' : 'var(--text-dark)' }}>{day}</span>
                          <span style={{ fontSize: '0.85rem', color: isToday ? 'var(--secondary-violet)' : 'var(--text-gray)', fontWeight: 600 }}>{type}</span>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: isToday ? 'var(--secondary-violet)' : 'var(--border-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                            {isToday ? '★' : '✓'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Chips */}
            <h3 className="page-section-title" style={{ marginBottom: '16px' }}>What's Included</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '30px' }}>
              {['Personalized Workouts', 'Video Guidance', 'Progress Tracking', 'Expert Support', 'Flexible Schedule'].map(chip => (
                <span key={chip} style={{ padding: '8px 16px', borderRadius: '99px', background: 'var(--secondary-violet-light)', color: 'var(--secondary-violet)', fontWeight: 600, fontSize: '0.8rem' }}>{chip}</span>
              ))}
            </div>
          </div>
        )}

        {/* WELLNESS ROUTINE SCREEN VIEW */}
        {activePlanView === 'Routine' && (
          <div className="page-container" style={{ maxWidth: '800px' }}>
            <button className="btn-ghost" onClick={goBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontWeight: 600 }}>
              <ArrowLeft size={16} /> Back to Dashboard
            </button>

            {/* Hero Section */}
            <div className="page-banner-card" style={{ background: 'linear-gradient(135deg, rgba(255, 75, 139, 0.1) 0%, rgba(124, 92, 255, 0.1) 100%)', borderRadius: '24px' }}>
              <div className="page-banner-content">
                <h1 className="page-banner-title" style={{ fontSize: '2rem' }}>Wellness Routine</h1>
                <p className="page-banner-desc" style={{ fontWeight: 600, color: 'var(--primary-pink)' }}>Your Daily Wellness Routine 🌸</p>
                <p className="page-banner-desc" style={{ fontSize: '0.85rem', marginTop: '6px' }}>Establish key atomic habits. Check items off dynamically to update score.</p>
              </div>
              <div className="page-banner-visual">
                <svg className="wellness-illustration-svg" viewBox="0 0 200 200" fill="none" width="100" height="100">
                  <circle cx="100" cy="100" r="70" fill="var(--primary-pink-light)" />
                  <path d="M100 65c5 0 9-4 9-9s-4-9-9-9-9 4-9 9 4 9 9 9zm25 45c0-12-10-22-22-22H97c-12 0-22 10-22 22v15h8v-12h6v30h10v-20h2v20h10v-30h6v12h8v-15z" fill="var(--primary-pink)" />
                </svg>
              </div>
            </div>

            {/* Interactive Checklist & Tips Side-by-Side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '30px' }}>
              <div>
                <h3 className="page-section-title" style={{ marginBottom: '16px' }}>Daily Habits Checklist</h3>
                <div className="glass-card" style={{ padding: '12px', borderRadius: '24px' }}>
                  {activePlan?.habits?.map((habit, idx) => {
                    const isChecked = completedHabits[habit.key];
                    return (
                      <div key={idx} className="checklist-item" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyAlignment: 'space-between', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <button 
                            className={`checklist-circle-check ${isChecked ? 'checked' : ''}`}
                            onClick={() => toggleHabitState(habit.key)}
                            style={{ 
                              width: '24px', 
                              height: '24px', 
                              borderRadius: '50%',
                              border: '2px solid var(--primary-pink)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: isChecked ? 'var(--primary-pink)' : 'transparent',
                              color: 'white'
                            }}
                          >
                            {isChecked && <Check size={14} />}
                          </button>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem', textDecoration: isChecked ? 'line-through' : 'none', color: isChecked ? 'var(--text-light)' : 'var(--text-dark)' }}>{habit.title}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>Target: {habit.target}</span>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {habit.key === 'water' && <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--blue-accent)' }}>{loggedWater} logged</span>}
                          {habit.key === 'sleep' && <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--secondary-violet)' }}>{currentSleep} hrs</span>}
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isChecked ? 'var(--teal-accent)' : 'var(--text-light)' }}>
                            {isChecked ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="page-section-title" style={{ marginBottom: '16px' }}>AI Wellness Coach Tips</h3>
                <div className="glass-card" style={{ padding: '24px', background: 'var(--primary-pink-light)', border: 'none', borderRadius: '24px', textAlign: 'center' }}>
                  <span style={{ color: 'var(--primary-pink)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Personal Advice</span>
                  <p style={{ fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--text-dark)', lineHeight: 1.5, margin: '12px 0', fontWeight: 600 }}>
                    "{activePlan?.wellnessTips || 'Ensure standard hydration to recover insulin balance and support cycles.'}"
                  </p>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '1.2rem', boxShadow: 'var(--shadow-sm)' }}>
                    🌸
                  </div>
                </div>

                {/* Mindfulness Breathing exercise */}
                <BoxBreathing />
              </div>
            </div>

            {/* Bottom Chips: Build Your Routine */}
            <h3 className="page-section-title" style={{ marginBottom: '16px' }}>Build Your Routine Challenges</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '30px' }}>
              {activePlan?.routineRecommendations?.map((chip, idx) => (
                <span key={idx} style={{ padding: '8px 16px', borderRadius: '99px', background: 'var(--primary-pink-light)', color: 'var(--primary-pink)', fontWeight: 600, fontSize: '0.8rem' }}>{chip}</span>
              )) || ['Read Books', 'Digital Detox', 'No Sugar Challenge', 'Skin Care Routine', 'Affirmations'].map(chip => (
                <span key={chip} style={{ padding: '8px 16px', borderRadius: '99px', background: 'var(--primary-pink-light)', color: 'var(--primary-pink)', fontWeight: 600, fontSize: '0.8rem' }}>{chip}</span>
              ))}
            </div>
          </div>
        )}

        {/* HEALTH TRACKER SCREEN VIEW */}
        {activePlanView === 'Tracker' && (
          <div className="page-container" style={{ maxWidth: '800px' }}>
            <button className="btn-ghost" onClick={goBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontWeight: 600 }}>
              <ArrowLeft size={16} /> Back to Dashboard
            </button>

            {/* Hero Section */}
            <div className="page-banner-card" style={{ background: 'linear-gradient(135deg, rgba(67, 133, 244, 0.1) 0%, rgba(124, 92, 255, 0.1) 100%)', borderRadius: '24px' }}>
              <div className="page-banner-content">
                <h1 className="page-banner-title" style={{ fontSize: '2rem' }}>Health Tracker</h1>
                <p className="page-banner-desc" style={{ fontWeight: 600, color: 'var(--blue-accent)' }}>Track Today, Transform Tomorrow 📊</p>
                <p className="page-banner-desc" style={{ fontSize: '0.85rem', marginTop: '6px' }}>Log physiological indicators, update weights histories, and review clinical vitals details.</p>
              </div>
              <div className="page-banner-visual">
                <svg className="wellness-illustration-svg" viewBox="0 0 200 200" fill="none" width="100" height="100">
                  <circle cx="100" cy="100" r="70" fill="var(--blue-light)" />
                  <rect x="70" y="60" width="60" height="80" rx="8" fill="var(--blue-accent)" />
                  <rect x="80" y="70" width="40" height="10" rx="2" fill="white" />
                  <rect x="80" y="90" width="40" height="4" fill="white" opacity="0.6" />
                  <rect x="80" y="100" width="30" height="4" fill="white" opacity="0.6" />
                </svg>
              </div>
            </div>

            {/* Health Overview grid */}
            <h3 className="page-section-title" style={{ marginBottom: '16px' }}>Health Overview</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '30px' }}>
              <div className="glass-card" style={{ padding: '16px', textAlign: 'center', borderRadius: '20px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>Weight</span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)', margin: '4px 0' }}>{currentWeight} <span style={{ fontSize: '0.85rem' }}>kg</span></h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--teal-accent)', fontWeight: 700 }}>Active Log</span>
              </div>
              <div className="glass-card" style={{ padding: '16px', textAlign: 'center', borderRadius: '20px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>Sleep</span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)', margin: '4px 0' }}>{currentSleep} <span style={{ fontSize: '0.85rem' }}>hrs</span></h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--secondary-violet)', fontWeight: 700 }}>Last night</span>
              </div>
              <div className="glass-card" style={{ padding: '16px', textAlign: 'center', borderRadius: '20px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>Steps</span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)', margin: '4px 0' }}>{loggedSteps}</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--blue-accent)', fontWeight: 700 }}>of 10k target</span>
              </div>
              <div className="glass-card" style={{ padding: '16px', textAlign: 'center', borderRadius: '20px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>Mood Status</span>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-pink)', margin: '4px 0' }}>{currentMood}</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>Today</span>
              </div>
            </div>

            {/* Track Your Health & Logging Actions Side-by-Side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '30px' }}>
              <div>
                <h3 className="page-section-title" style={{ marginBottom: '16px' }}>Track Your Health Goals</h3>
                <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                      <span>Water Intake</span>
                      <span>{loggedWater} / {waterLimit} Glasses</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min((loggedWater / waterLimit) * 100, 100)}%`, height: '100%', background: 'var(--blue-accent)' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                      <span>Steps walked</span>
                      <span>{loggedSteps} / {stepsLimit} steps</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min((loggedSteps / stepsLimit) * 100, 100)}%`, height: '100%', background: 'var(--teal-accent)' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                      <span>Calories balance</span>
                      <span>{loggedCalories} / {calorieLimit} kcal</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min((loggedCalories / calorieLimit) * 100, 100)}%`, height: '100%', background: 'var(--primary-pink)' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                      <span>Sleep logged</span>
                      <span>{currentSleep} / 8 hours</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min((currentSleep / 8) * 100, 100)}%`, height: '100%', background: 'var(--secondary-violet)' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="page-section-title" style={{ marginBottom: '16px' }}>Log New Health Records</h3>
                <div className="glass-card" style={{ padding: '20px', borderRadius: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button className="glass-card" onClick={() => setShowLogModal('weight')} style={{ padding: '16px 8px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Scale size={20} style={{ color: 'var(--teal-accent)' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dark)' }}>Log Weight</span>
                  </button>
                  <button className="glass-card" onClick={() => { addRecordLogDirect('water', 1); alert('Added 1 glass of water! 💧'); }} style={{ padding: '16px 8px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Droplet size={20} style={{ color: 'var(--blue-accent)' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dark)' }}>Log Water</span>
                  </button>
                  <button className="glass-card" onClick={() => setShowLogModal('sleep')} style={{ padding: '16px 8px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Moon size={20} style={{ color: 'var(--secondary-violet)' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dark)' }}>Log Sleep</span>
                  </button>
                  <button className="glass-card" onClick={() => setShowLogModal('mood')} style={{ padding: '16px 8px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Brain size={20} style={{ color: 'var(--primary-pink)' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dark)' }}>Log Mood</span>
                  </button>
                  <button className="glass-card" onClick={() => setShowLogModal('steps')} style={{ padding: '16px 8px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Footprints size={20} style={{ color: 'var(--teal-accent)' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dark)' }}>Log Steps</span>
                  </button>
                  <button className="glass-card" onClick={() => setShowLogModal('workout')} style={{ padding: '16px 8px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Dumbbell size={20} style={{ color: 'var(--secondary-violet)' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dark)' }}>Log Workout</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Insights For You */}
            <h3 className="page-section-title" style={{ marginBottom: '16px' }}>AI Insights For You</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '30px' }}>
              {activePlan?.insights?.map((ins, idx) => (
                <div key={idx} className="glass-card" style={{ padding: '16px', background: ins.color || 'var(--primary-pink-light)', border: 'none', borderRadius: '20px', minHeight: '120px' }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>{ins.icon}</div>
                  <h5 style={{ fontWeight: 800, fontSize: '0.85rem', color: ins.textColor || 'var(--primary-pink)', margin: '0 0 4px 0' }}>{ins.title}</h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dark)', lineHeight: 1.4, margin: 0 }}>{ins.text}</p>
                </div>
              )) || (
                <>
                  <div className="glass-card" style={{ padding: '16px', background: 'var(--blue-light)', border: 'none', borderRadius: '20px', minHeight: '120px' }}>
                    <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>💧</div>
                    <h5 style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--blue-accent)', margin: '0 0 4px 0' }}>Hydration Status</h5>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dark)', lineHeight: 1.4, margin: 0 }}>Log water intake. Excellent hydration keeps muscle groups recovery speeds stable.</p>
                  </div>
                  <div className="glass-card" style={{ padding: '16px', background: 'var(--primary-pink-light)', border: 'none', borderRadius: '20px', minHeight: '120px' }}>
                    <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>🌙</div>
                    <h5 style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--primary-pink)', margin: '0 0 4px 0' }}>Sleep Quality</h5>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dark)', lineHeight: 1.4, margin: 0 }}>Avoid blue light screens prior to rest to elevate your deep REM cycle sleep quality.</p>
                  </div>
                  <div className="glass-card" style={{ padding: '16px', background: 'var(--teal-light)', border: 'none', borderRadius: '20px', minHeight: '120px' }}>
                    <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>🥩</div>
                    <h5 style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--teal-accent)', margin: '0 0 4px 0' }}>Nutrients</h5>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dark)', lineHeight: 1.4, margin: 0 }}>Ensure you hit your protein goals to preserve your BMR target levels.</p>
                  </div>
                </>
              )}
            </div>

            {/* Health logs history */}
            <h3 className="page-section-title" style={{ marginBottom: '16px' }}>Log History</h3>
            <div className="glass-card" style={{ padding: '20px', borderRadius: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {records.weightLogs?.length === 0 && records.waterLogs?.length === 0 && records.sleepLogs?.length === 0 && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', textAlign: 'center', padding: '10px' }}>No records logged yet. Add some logs above!</p>
                )}
                {records.weightLogs?.slice(-3).map((w, i) => (
                  <div key={`w-${i}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingBottom: '6px', borderBottom: '1px solid var(--border-color)' }}>
                    <span>⚖️ Weight Logged</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{w.value} kg</span>
                    <span style={{ color: 'var(--text-light)' }}>{w.date}</span>
                  </div>
                ))}
                {records.sleepLogs?.slice(-3).map((s, i) => (
                  <div key={`s-${i}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingBottom: '6px', borderBottom: '1px solid var(--border-color)' }}>
                    <span>🌙 Sleep Duration</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{s.value} hours</span>
                    <span style={{ color: 'var(--text-light)' }}>{s.date}</span>
                  </div>
                ))}
                {records.waterLogs?.slice(-3).map((w, i) => (
                  <div key={`wa-${i}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingBottom: '6px', borderBottom: '1px solid var(--border-color)' }}>
                    <span>💧 Water Logged</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{w.value} Glasses</span>
                    <span style={{ color: 'var(--text-light)' }}>{w.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DEFAULT VIEW DASHBOARD */}
        {activePlanView === null && (
          <div className="page-container">
            {/* Header Notifications Alert banner */}
            {showNotification && (
              <div className="glass-card" style={{ background: 'var(--secondary-violet-light)', border: 'none', padding: '12px 20px', borderRadius: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Bell size={18} style={{ color: 'var(--secondary-violet)', animation: 'float 4s infinite' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                    💡 Smart Coach: Try logging your morning weight and drink 1 glass of water to activate metabolism!
                  </span>
                </div>
                <button onClick={() => setShowNotification(false)} style={{ color: 'var(--text-light)', border: 'none', background: 'none' }}><X size={16} /></button>
              </div>
            )}

            {/* Banner */}
            <div className="page-banner-card" style={{ borderRadius: '24px', overflow: 'hidden' }}>
              <div className="page-banner-content">
                <h1 className="page-banner-title">Your Personal Wellness Plan</h1>
                <p className="page-banner-desc">
                  Curated specifically for you based on biometric indicators, daily goals, and wellness habits.
                </p>
              </div>
              <div className="page-banner-visual" style={{ width: '130px', height: '130px', borderRadius: '50%', overflow: 'hidden', border: '3px solid rgba(255, 255, 255, 0.8)', boxShadow: 'var(--shadow-md)' }}>
                <img src={bannerImg} alt="Personal Wellness Plan" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>

            {/* Premium Header Strip: Streak, Completion, Badges */}
            <div className="page-grid-2-1" style={{ marginBottom: '30px' }}>
              {/* Daily Goals Completion Score */}
              <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Daily Goal Completion</span>
                    <h2 style={{ fontSize: '1.6rem', color: 'var(--text-dark)', margin: 0 }}>{goalCompletionPercentage}% Complete</h2>
                  </div>
                  <div style={{
                    padding: '8px 16px',
                    borderRadius: '99px',
                    background: 'var(--primary-pink-light)',
                    color: 'var(--primary-pink)',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    🔥 {activePlan?.streak || 3} Day Streak
                  </div>
                </div>

                <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden', marginBottom: '14px' }}>
                  <div style={{ width: `${goalCompletionPercentage}%`, height: '100%', background: 'linear-gradient(90deg, var(--secondary-violet) 0%, var(--primary-pink) 100%)', borderRadius: '4px', transition: 'width 0.4s ease' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-gray)', fontWeight: 600 }}>
                  <span>Habits: {completedHabitsCount} / {totalHabits} done</span>
                  <span>Water: {loggedWater} / {waterLimit} glasses</span>
                  <span>Steps: {loggedSteps} / 10k</span>
                </div>
              </div>

              {/* Achievements Badges */}
              <div className="glass-card" style={{ padding: '20px 24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '12px', textTransform: 'uppercase', tracking: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Trophy size={16} style={{ color: 'var(--orange-accent)' }} /> Badges & Achievements
                </h4>
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {activePlan?.badges?.map((badge, idx) => (
                    <div key={idx} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      background: 'rgba(255,166,32,0.06)', 
                      padding: '6px 12px', 
                      borderRadius: '12px', 
                      border: '1px solid rgba(255,166,32,0.15)',
                      flexShrink: 0
                    }}>
                      <span style={{ fontSize: '1.2rem' }}>{badge.icon}</span>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dark)' }}>{badge.name}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-gray)' }}>{badge.description}</span>
                      </div>
                    </div>
                  )) || (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Complete daily tasks to unlock badges!</p>
                  )}
                </div>
              </div>
            </div>

            {/* Dashboard Grid */}
            <div className="page-grid-2-1">
              <div>
                {/* Weekly Compliance Progress Chart */}
                <h3 className="page-section-title" style={{ marginBottom: '16px' }}>Weekly Performance Report</h3>
                <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', marginBottom: '30px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-dark)' }}>Weekly Compliance</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', margin: 0 }}>Completion rates over the past 7 days.</p>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--secondary-violet)', background: 'var(--secondary-violet-light)', padding: '4px 12px', borderRadius: '99px' }}>Average: 82%</span>
                  </div>
                  
                  {/* SVG Bar Chart representing progress */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '120px', padding: '0 10px' }}>
                    {[
                      { day: 'Mon', pct: 90, active: false },
                      { day: 'Tue', pct: 85, active: false },
                      { day: 'Wed', pct: 95, active: false },
                      { day: 'Thu', pct: goalCompletionPercentage, active: true },
                      { day: 'Fri', pct: 0, active: false },
                      { day: 'Sat', pct: 0, active: false },
                      { day: 'Sun', pct: 0, active: false }
                    ].map((bar, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: bar.active ? 'var(--primary-pink)' : 'var(--text-light)', marginBottom: '4px' }}>{bar.pct}%</div>
                        <div style={{ 
                          width: '18px', 
                          height: '80px', 
                          background: 'var(--border-color)', 
                          borderRadius: '9px',
                          display: 'flex',
                          alignItems: 'flex-end',
                          overflow: 'hidden'
                        }}>
                          <div style={{ 
                            width: '100%', 
                            height: `${bar.pct}%`, 
                            background: bar.active 
                              ? 'linear-gradient(180deg, var(--primary-pink) 0%, var(--primary-pink-hover) 100%)' 
                              : 'linear-gradient(180deg, var(--secondary-violet) 0%, var(--secondary-violet-hover) 100%)',
                            borderRadius: '9px',
                            transition: 'height 0.5s ease-in-out'
                          }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, marginTop: '8px', color: bar.active ? 'var(--primary-pink)' : 'var(--text-light)' }}>{bar.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Today's Checklist Tracker */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 className="page-section-title" style={{ margin: 0 }}>Today's Tasks Tracker</h3>
                  <button className="btn-ghost" onClick={() => setActivePlanView('Routine')} style={{ fontSize: '0.8rem', color: 'var(--primary-pink)', fontWeight: 600 }}>Manage Checklist</button>
                </div>

                <div className="glass-card" style={{ padding: '8px', borderRadius: '24px' }}>
                  {/* Water Quick count */}
                  <div className="checklist-item" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ color: 'var(--blue-accent)', background: 'var(--blue-light)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Droplet size={18} fill="currentColor" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.9rem' }}>Drink {waterLimit} Glasses Water</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>Supports metabolism and clears skin toxins</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button className="counter-btn" onClick={() => addRecordLogDirect('water', -1)} style={{ width: '24px', height: '24px', background: 'var(--border-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', minWidth: '70px', textAlign: 'center' }}>{loggedWater} / {waterLimit} gls</span>
                      <button className="counter-btn" onClick={() => addRecordLogDirect('water', 1)} style={{ width: '24px', height: '24px', background: 'var(--border-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                  </div>

                  {/* Steps Quick count */}
                  <div className="checklist-item" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ color: 'var(--teal-accent)', background: 'var(--teal-light)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Footprints size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.9rem' }}>Walk Goal (10,000 steps)</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>Improves aerobic capacity and cardiovascular flow</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button className="counter-btn" onClick={() => addRecordLogDirect('steps', -1000)} style={{ width: '24px', height: '24px', background: 'var(--border-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', minWidth: '70px', textAlign: 'center' }}>{loggedSteps.toLocaleString()} steps</span>
                      <button className="counter-btn" onClick={() => addRecordLogDirect('steps', 1000)} style={{ width: '24px', height: '24px', background: 'var(--border-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                  </div>

                  {/* Healthy Habits Quick checked list */}
                  {activePlan?.habits?.slice(1, 4).map((h, i) => {
                    const isCompleted = completedHabits[h.key];
                    return (
                      <div key={h.key} className="checklist-item" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: i === 2 ? 'none' : '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <div style={{ color: 'var(--primary-pink)', background: 'var(--primary-pink-light)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Check size={18} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.9rem', textDecoration: isCompleted ? 'line-through' : 'none' }}>{h.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>Goal: {h.target}</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => toggleHabitState(h.key)}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: isCompleted ? 'var(--teal-accent)' : 'var(--border-color)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {isCompleted && <Check size={12} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                {/* 4 Plans Navigation Shortcuts */}
                <h3 className="page-section-title" style={{ margin: '0 0 16px 0' }}>Your Specialized AI Modules</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  {/* Nutrition tab link */}
                  <div className="glass-card plan-category-card" style={{ padding: '16px 20px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '16px', background: 'var(--teal-light)', color: 'var(--teal-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Salad size={22} />
                      </div>
                      <div>
                        <h4 style={{ fontWeight: 800, color: 'var(--text-dark)', fontSize: '0.95rem', margin: 0 }}>Nutrition Plan</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', margin: '2px 0 0 0' }}>{calorieLimit} kcal • High Protein • {activePlan?.gender || 'Balanced'}</p>
                      </div>
                    </div>
                    <button className="btn-primary" onClick={() => setActivePlanView('Nutrition')} style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>Open</button>
                  </div>

                  {/* Fitness tab link */}
                  <div className="glass-card plan-category-card" style={{ padding: '16px 20px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '16px', background: 'var(--secondary-violet-light)', color: 'var(--secondary-violet)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Dumbbell size={22} />
                      </div>
                      <div>
                        <h4 style={{ fontWeight: 800, color: 'var(--text-dark)', fontSize: '0.95rem', margin: 0 }}>Fitness Plan</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', margin: '2px 0 0 0' }}>{activePlan?.workoutName || 'Hypertrophy Strength'}</p>
                      </div>
                    </div>
                    <button className="btn-primary" onClick={() => setActivePlanView('Fitness')} style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>Open</button>
                  </div>

                  {/* Wellness tab link */}
                  <div className="glass-card plan-category-card" style={{ padding: '16px 20px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '16px', background: 'var(--primary-pink-light)', color: 'var(--primary-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Flower2 size={22} />
                      </div>
                      <div>
                        <h4 style={{ fontWeight: 800, color: 'var(--text-dark)', fontSize: '0.95rem', margin: 0 }}>Wellness Routine</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', margin: '2px 0 0 0' }}>Meditation • Box Breathing • Sleep</p>
                      </div>
                    </div>
                    <button className="btn-primary" onClick={() => setActivePlanView('Routine')} style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>Open</button>
                  </div>

                  {/* Tracker tab link */}
                  <div className="glass-card plan-category-card" style={{ padding: '16px 20px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '16px', background: 'var(--blue-light)', color: 'var(--blue-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Activity size={22} />
                      </div>
                      <div>
                        <h4 style={{ fontWeight: 800, color: 'var(--text-dark)', fontSize: '0.95rem', margin: 0 }}>Health Tracker</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', margin: '2px 0 0 0' }}>Weight: {currentWeight} kg • Steps • Logs</p>
                      </div>
                    </div>
                    <button className="btn-primary" onClick={() => setActivePlanView('Tracker')} style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>Open</button>
                  </div>

                </div>

                {/* Retake assessment call to action */}
                <div className="glass-card" style={{ padding: '24px', marginTop: '24px', textAlign: 'center', borderRadius: '24px' }}>
                  <h4 style={{ color: 'var(--primary-pink)', marginBottom: '8px', fontSize: '1rem', fontWeight: 800 }}>Need to Update Profile?</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginBottom: '16px', lineHeight: 1.4 }}>
                    Your goals or biometrics changed? Retake the assessment to regenerate all AI plans dynamically.
                  </p>
                  <button className="btn-primary pulse-glow w-full" onClick={onStartAssessment} style={{ padding: '10px 0', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700 }}>Retake Health Assessment</button>
                </div>

                {/* Need help Banner */}
                <div className="inline-promo-banner" style={{ marginTop: '24px', padding: '24px', borderRadius: '24px', flexDirection: 'column', textAlign: 'center' }}>
                  <div className="inline-promo-avatar dr-neha" style={{
                    backgroundImage: 'linear-gradient(135deg, var(--secondary-violet) 0%, var(--primary-pink) 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold'
                  }}>
                    HC
                  </div>
                  <div className="inline-promo-text">
                    <h4 className="inline-promo-title">Need help with your plan?</h4>
                    <p className="inline-promo-desc" style={{ marginBottom: '12px' }}>
                      Connect with our dedicated expert health coaches for live chats.
                    </p>
                  </div>
                  <button className="btn-inline-promo-action" onClick={() => setChatOpen(true)}>Chat Now</button>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>

      {/* 3. LOGGING MODAL FORM POPUPS */}
      {showLogModal && (
        <div className="modal-overlay" style={{ zIndex: 200 }}>
          <div className="modal-card glass-card" style={{ maxWidth: '400px', padding: '30px', borderRadius: '24px' }}>
            <button className="modal-close-btn" onClick={() => setShowLogModal(null)}>
              <X size={20} />
            </button>
            <h3 className="modal-title" style={{ textTransform: 'capitalize', fontSize: '1.25rem', fontWeight: 800 }}>Log {showLogModal}</h3>
            
            <form onSubmit={handleLogSubmit} style={{ marginTop: '20px' }}>
              
              {showLogModal === 'weight' && (
                <div className="modal-form-group">
                  <label>Current Weight (kg)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="modal-form-input" 
                    placeholder="e.g. 62.5" 
                    value={logValue} 
                    onChange={(e) => setLogValue(e.target.value)} 
                    required 
                  />
                </div>
              )}

              {showLogModal === 'sleep' && (
                <div className="modal-form-group">
                  <label>Sleep Duration (hours)</label>
                  <input 
                    type="number" 
                    step="0.5" 
                    className="modal-form-input" 
                    placeholder="e.g. 7.5" 
                    value={logValue} 
                    onChange={(e) => setLogValue(e.target.value)} 
                    required 
                  />
                </div>
              )}

              {showLogModal === 'steps' && (
                <div className="modal-form-group">
                  <label>Steps Count</label>
                  <input 
                    type="number" 
                    className="modal-form-input" 
                    placeholder="e.g. 8420" 
                    value={logValue} 
                    onChange={(e) => setLogValue(e.target.value)} 
                    required 
                  />
                </div>
              )}

              {showLogModal === 'mood' && (
                <div className="modal-form-group">
                  <label>Select Mood Status</label>
                  <select 
                    className="modal-form-input" 
                    value={logOptionValue} 
                    onChange={(e) => setLogOptionValue(e.target.value)} 
                    required
                  >
                    <option value="">-- Choose Mood --</option>
                    <option value="Happy">Happy 🌸</option>
                    <option value="Energetic">Energetic 💪</option>
                    <option value="Focused">Focused 🎯</option>
                    <option value="Tired">Tired 😴</option>
                    <option value="Stressed">Stressed 🧠</option>
                  </select>
                </div>
              )}

              {showLogModal === 'workout' && (
                <>
                  <div className="modal-form-group" style={{ marginBottom: '14px' }}>
                    <label>Workout Routine Name</label>
                    <input 
                      type="text" 
                      className="modal-form-input" 
                      placeholder="e.g. Cardio Walk" 
                      value={logValue} 
                      onChange={(e) => setLogValue(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="modal-form-group" style={{ marginBottom: '14px' }}>
                    <label>Duration (minutes)</label>
                    <input 
                      type="number" 
                      className="modal-form-input" 
                      placeholder="e.g. 30" 
                      value={logDurationValue} 
                      onChange={(e) => setLogDurationValue(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="modal-form-group">
                    <label>Calories Burned (kcal)</label>
                    <input 
                      type="number" 
                      className="modal-form-input" 
                      placeholder="e.g. 150" 
                      value={logOptionValue} 
                      onChange={(e) => setLogOptionValue(e.target.value)} 
                      required 
                    />
                  </div>
                </>
              )}

              <div className="modal-actions" style={{ marginTop: '24px' }}>
                <button type="button" className="btn-modal-cancel" onClick={() => setShowLogModal(null)}>Cancel</button>
                <button type="submit" className="btn-modal-submit">Save Log</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
