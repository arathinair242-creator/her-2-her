# Her-2-Her Premium AI Health Plans - Code Backup

This file contains the complete source code for all the custom modules, helpers, and screens created and modified for the Premium AI-powered Health Plans features.

---

## 1. AI Personalization Engine & Database Wrappers
* **File Location**: `src/utils/planGenerator.js`

```javascript
// AI Plan Personalization Engine and Mock Database
// Analyzes user answers to generate highly customized nutrition, fitness, and wellness plans.

export function generatePersonalizedPlans(answers) {
  // 1. Core Profile Details
  const weight = parseFloat(answers.weight) || 60;
  const height = parseFloat(answers.height) || 165;
  const gender = answers.gender || "Female";
  const primaryGoal = answers.goals && answers.goals[0] ? answers.goals[0] : "Weight Management";
  
  // BMI calculation
  const bmiVal = (weight / ((height / 100) ** 2)).toFixed(1);
  const bmi = parseFloat(bmiVal);

  let bmiClass = "Normal";
  let bmiColor = "#05CD99"; // Green
  if (bmi < 18.5) {
    bmiClass = "Underweight";
    bmiColor = "#FFA620"; // Orange
  } else if (bmi >= 25 && bmi < 30) {
    bmiClass = "Overweight";
    bmiColor = "#FFA620"; // Orange
  } else if (bmi >= 30) {
    bmiClass = "Obese";
    bmiColor = "#F43F5E"; // Red
  }

  // Parse DOB for Age
  let age = 28;
  if (answers.dob) {
    const parts = answers.dob.split('/');
    if (parts.length === 3) {
      const year = parseInt(parts[2]);
      if (!isNaN(year)) age = new Date().getFullYear() - year;
    }
  }

  // 2. Nutrition Plan Parameters
  let baseBMR = 10 * weight + 6.25 * height - 5 * age - 161; // Mifflin-St Jeor for female
  if (gender === 'Male') baseBMR = 10 * weight + 6.25 * height - 5 * age + 5;
  
  let activityMultiplier = 1.2;
  if (answers.activity === 'Lightly Active') activityMultiplier = 1.375;
  else if (answers.activity === 'Moderately Active') activityMultiplier = 1.55;
  else if (answers.activity === 'Very Active') activityMultiplier = 1.725;
  else if (answers.activity === 'Extremely Active') activityMultiplier = 1.9;

  let TDEE = Math.round(baseBMR * activityMultiplier);

  let calorieTarget = TDEE;
  if (primaryGoal.includes('Weight Loss') || primaryGoal.includes('Weight Management')) {
    calorieTarget = Math.round(TDEE - 400); // 400 kcal deficit
    if (calorieTarget < 1200) calorieTarget = 1200; // Safe floor
  } else if (primaryGoal.includes('Muscle Gain')) {
    calorieTarget = Math.round(TDEE + 250); // surplus
  }

  let proteinTarget = 65; // g
  if (primaryGoal.includes('Muscle Gain') || primaryGoal.includes('Fitness')) {
    proteinTarget = Math.round(weight * 1.6);
  } else {
    proteinTarget = Math.round(weight * 1.2);
  }

  let fatPercent = 0.25;
  if (answers.dietPreference === 'Keto') fatPercent = 0.70;
  else if (answers.dietPreference === 'Low Carb') fatPercent = 0.35;

  let fatsTarget = Math.round((calorieTarget * fatPercent) / 9);
  let carbsTarget = Math.round((calorieTarget - (proteinTarget * 4) - (fatsTarget * 9)) / 4);
  if (carbsTarget < 20 && answers.dietPreference === 'Keto') carbsTarget = 20; // keto minimum
  
  const fiberTarget = 28; // g
  
  let meals = {
    breakfast: { name: "Oatmeal with Almonds & Flaxseeds", cal: 340, p: 12, c: 48, f: 11 },
    lunch: { name: "Grilled Chicken Breast with Quinoa & Steamed Broccoli", cal: 480, p: 38, c: 42, f: 12 },
    snack: { name: "Greek Yogurt with Chia Seeds & Honey", cal: 160, p: 14, c: 12, f: 6 },
    dinner: { name: "Pan-Seared Salmon with Asparagus & Sweet Potato mash", cal: 420, p: 32, c: 20, f: 18 }
  };

  const diet = answers.dietPreference || "Balanced";
  if (diet === 'Vegetarian') {
    meals.breakfast = { name: "Tofu Scramble on Whole Wheat Toast with Spinach", cal: 310, p: 16, c: 28, f: 12 };
    meals.lunch = { name: "Chickpea & Quinoa Bowl with Beetroot Hummus & Greens", cal: 460, p: 18, c: 62, f: 14 };
    meals.snack = { name: "Roasted Makhana (Lotus Seeds) & Walnuts", cal: 140, p: 5, c: 18, f: 7 };
    meals.dinner = { name: "Grilled Paneer Satay with Broccoli & Brown Rice", cal: 440, p: 22, c: 26, f: 22 };
  } else if (diet === 'Vegan') {
    meals.breakfast = { name: "Chia Pudding with Almond Milk, Banana & Hemp seeds", cal: 290, p: 8, c: 35, f: 14 };
    meals.lunch = { name: "Tempeh Buddha Bowl with Lentils, Avocado & Sesame Dressing", cal: 490, p: 26, c: 45, f: 18 };
    meals.snack = { name: "Celery Sticks with Peanut Butter", cal: 150, p: 6, c: 10, f: 11 };
    meals.dinner = { name: "Tofu Stir-fry with Mushrooms, Bok Choy & Soba Noodles", cal: 410, p: 20, c: 54, f: 11 };
  } else if (diet === 'Keto') {
    meals.breakfast = { name: "Scrambled Eggs (3) in Butter with Avocado & Cheddar", cal: 460, p: 24, c: 4, f: 38 };
    meals.lunch = { name: "Keto Chicken Bacon Avocado Salad with Olive Oil drizzle", cal: 590, p: 40, c: 6, f: 45 };
    meals.snack = { name: "Macadamia Nuts (30g)", cal: 200, p: 2, c: 4, f: 21 };
    meals.dinner = { name: "Grilled Butter Salmon with Asparagus & Garlic Butter", cal: 520, p: 34, c: 5, f: 41 };
  } else if (diet === 'Low Carb') {
    meals.breakfast = { name: "Boiled Eggs (2) & Sliced Avocado", cal: 320, p: 14, c: 6, f: 24 };
    meals.lunch = { name: "Turkey Breast Lettuce Wraps with Tomato & Avocado", cal: 390, p: 32, c: 12, f: 18 };
    meals.snack = { name: "Almonds (28g) & Cucumber Slices", cal: 170, p: 6, c: 6, f: 14 };
    meals.dinner = { name: "Baked Salmon & Sautéed Mushrooms in Coconut Oil", cal: 450, p: 34, c: 8, f: 26 };
  } else if (diet === 'Gluten-Free') {
    meals.breakfast = { name: "Berry Smoothie with Pea Protein & Rice Milk", cal: 280, p: 18, c: 32, f: 8 };
    meals.lunch = { name: "Brown Rice Bowl with Grilled Chicken & Mixed Beans", cal: 490, p: 36, c: 54, f: 13 };
    meals.snack = { name: "Apple Slices with Almond Butter", cal: 180, p: 5, c: 20, f: 10 };
    meals.dinner = { name: "Baked Cod with Quinoa & Roasted Zucchini", cal: 390, p: 28, c: 35, f: 11 };
  }

  let nutritionScore = 80;
  if (answers.eatingHabit === "Very Healthy") nutritionScore = 94;
  else if (answers.eatingHabit === "Healthy") nutritionScore = 86;
  else if (answers.eatingHabit === "Average") nutritionScore = 74;
  else nutritionScore = 58;

  // 3. Fitness Plan Parameters
  let fitnessScore = 70;
  if (answers.activity === "Mostly Sedentary") fitnessScore = 54;
  else if (answers.activity === "Lightly Active") fitnessScore = 68;
  else if (answers.activity === "Moderately Active") fitnessScore = 82;
  else fitnessScore = 92;

  let workoutsTarget = 3;
  if (answers.activity === "Mostly Sedentary") workoutsTarget = 2;
  else if (answers.activity === "Lightly Active") workoutsTarget = 3;
  else if (answers.activity === "Moderately Active") workoutsTarget = 4;
  else workoutsTarget = 5;

  let activeMinutesTarget = 150;
  if (answers.activity === "Mostly Sedentary") activeMinutesTarget = 90;
  else if (answers.activity === "Lightly Active") activeMinutesTarget = 150;
  else if (answers.activity === "Moderately Active") activeMinutesTarget = 210;
  else activeMinutesTarget = 280;

  let fitCaloriesBurnTarget = 1200;
  if (primaryGoal.includes('Loss') || primaryGoal.includes('Weight')) {
    fitCaloriesBurnTarget = 1800;
  } else if (primaryGoal.includes('Muscle')) {
    fitCaloriesBurnTarget = 1000;
  }

  let workoutName = "Holistic Toning";
  let workoutDiff = "Beginner";
  let workoutDuration = 25;
  let workoutBurn = 160;
  let exercises = [
    { name: "Squats", sets: 3, reps: "10 reps" },
    { name: "Wall Pushups", sets: 3, reps: "10 reps" },
    { name: "Reverse Lunges", sets: 3, reps: "8 reps/leg" },
    { name: "Plank Hold", sets: 3, reps: "25 seconds" }
  ];

  if (primaryGoal.includes('Loss') || primaryGoal.includes('Weight')) {
    workoutName = "HIIT Burn Circuit";
    workoutDiff = "Medium";
    workoutDuration = 35;
    workoutBurn = 310;
    exercises = [
      { name: "Bodyweight Squats", sets: 4, reps: "15 reps" },
      { name: "Jumping Jacks", sets: 3, reps: "45 seconds" },
      { name: "Incline Pushups", sets: 3, reps: "12 reps" },
      { name: "Mountain Climbers", sets: 3, reps: "35 seconds" },
      { name: "Forearm Plank Hold", sets: 3, reps: "45 seconds" }
    ];
  } else if (primaryGoal.includes('Muscle') || primaryGoal.includes('Fitness')) {
    workoutName = "Hypertrophy Strength Flow";
    workoutDiff = "Intermediate";
    workoutDuration = 45;
    workoutBurn = 260;
    exercises = [
      { name: "Dumbbell Squats", sets: 4, reps: "12 reps" },
      { name: "Standard Pushups", sets: 3, reps: "10 reps" },
      { name: "Dumbbell Romanian Deadlifts", sets: 4, reps: "12 reps" },
      { name: "Single Arm Dumbbell Rows", sets: 3, reps: "12 reps/arm" },
      { name: "Plank Shoulder Taps", sets: 3, reps: "16 reps" }
    ];
  } else if (primaryGoal.includes('Stress') || primaryGoal.includes('Health')) {
    workoutName = "Restorative Yoga & Flow";
    workoutDiff = "Easy";
    workoutDuration = 30;
    workoutBurn = 110;
    exercises = [
      { name: "Cat-Cow Stretch", sets: 3, reps: "10 reps" },
      { name: "Downward Facing Dog Hold", sets: 3, reps: "45 seconds" },
      { name: "Warrior II Pose", sets: 3, reps: "30 seconds/side" },
      { name: "Cobra Pose", sets: 3, reps: "10 reps" },
      { name: "Savasana Meditation", sets: 1, reps: "5 minutes" }
    ];
  }

  let schedule = {
    Mon: "Strength", Tue: "Cardio", Wed: "Active recovery",
    Thu: "HIIT", Fri: "Strength", Sat: "Yoga Stretch", Sun: "Rest"
  };
  if (primaryGoal.includes('Stress') || primaryGoal.includes('Sleep')) {
    schedule = {
      Mon: "Gentle Yoga", Tue: "Brisk Walk", Wed: "Rest",
      Thu: "Stretching & Breathwork", Fri: "Gentle Yoga", Sat: "Light Walk", Sun: "Rest"
    };
  } else if (answers.activity === 'Mostly Sedentary') {
    schedule = {
      Mon: "Brisk Walk", Tue: "Rest", Wed: "Low Impact Workout",
      Thu: "Rest", Fri: "Bodyweight Stretch", Sat: "Light Cardio Walk", Sun: "Rest"
    };
  }

  // 4. Wellness Routine Habits
  const waterGoalGlasses = parseInt(answers.waterIntake) || 8;
  let habits = [
    { key: "water", title: `Drink ${waterGoalGlasses} Glasses Water`, target: `${waterGoalGlasses} glasses`, progress: `0 / ${waterGoalGlasses}`, completed: false },
    { key: "meditation", title: "10-min Guided Meditation", target: "10 min", progress: "0 / 10 min", completed: false },
    { key: "breakfast", title: "Eat Healthy Protein Breakfast", target: "1 meal", progress: "0 / 1", completed: false },
    { key: "walk", title: "30 min Brisk Outdoor Walk", target: "30 min", progress: "0 / 30 min", completed: false },
    { key: "stretching", title: "10 min Restorative Stretch", target: "10 min", progress: "0 / 10 min", completed: false },
    { key: "gratitude", title: "Write in Gratitude Journal", target: "1 entry", progress: "0 / 1", completed: false },
    { key: "sleep", title: `Sleep 7.5 Hours`, target: `7.5 hrs`, progress: `0 / 7.5 hrs`, completed: false }
  ];

  let wellnessTips = "A stable insulin level is the key to daily energy. Focus on proteins first.";
  if (answers.conditions.includes('PCOS / PCOD')) {
    wellnessTips = "PCOS Focus: Keep insulin spikes low. Seed cycling (Flaxseeds in follicular phase) supports hormonal balance.";
  } else if (answers.conditions.includes('Diabetes')) {
    wellnessTips = "Glucose Focus: Always pair carbohydrates with fiber or protein to slow down blood sugar absorption rates.";
  } else if (answers.conditions.includes('High Blood Pressure')) {
    wellnessTips = "BP Focus: Ensure sodium levels are regulated. Potassium-rich items (avocado, leafy greens) assist vascular relaxation.";
  } else if (answers.conditions.includes('Stress Management') || answers.stressLevel === 'High' || answers.stressLevel === 'Very High') {
    wellnessTips = "Stress Focus: Elevated cortisol depletes magnesium. Add pumpkin seeds and dark chocolate to support nervous system recovery.";
  }

  let routineRecommendations = ["Read Books (20 min)", "Digital Detox (1 hr before bed)", "No Sugar Challenge"];
  if (answers.sleepQuality === 'Poor' || answers.goals.includes('Better Sleep')) {
    routineRecommendations = ["Warm Bath (1 hr before bed)", "Magnesium Intake", "Affirmation Practice", "No Screens Bedtime Ritual"];
  }

  // 5. Health Tracker Vitals & Insights
  let insights = [
    { title: "Water Check", text: `Your daily water target is set to ${waterGoalGlasses} glasses to match your ${answers.activity} lifestyle.`, icon: "💧", color: "rgba(5, 205, 153, 0.1)", textColor: "var(--teal-accent)" },
    { title: "Sleep Quality", text: `Sleep quality is rated ${answers.sleepQuality}. Avoid bright screens after 9 PM to improve REM depth.`, icon: "🌙", color: "rgba(124, 92, 255, 0.1)", textColor: "var(--secondary-violet)" },
    { title: "Condition Monitor", text: `AI insight: Based on selected condition ${answers.conditions[0] || 'None'}, watch your micro-nutrient balance.`, icon: "🩺", color: "rgba(255, 75, 139, 0.1)", textColor: "var(--primary-pink)" }
  ];

  if (answers.conditions.includes('PCOS / PCOD')) {
    insights[2] = { title: "PCOS Estrogen Rise", text: `Day 12 Follicular Phase: estrogen increases energy. Use this phase for metabolic strength training.`, icon: "🌸", color: "rgba(255, 75, 139, 0.1)", textColor: "var(--primary-pink)" };
  } else if (answers.conditions.includes('Diabetes')) {
    insights[2] = { title: "Glucose Stabilizer", text: `Keep post-meal blood sugar under 140 mg/dL. Walking 10 mins post lunch lowers glucose spikes by 18%.`, icon: "🩸", color: "rgba(255, 166, 32, 0.1)", textColor: "var(--orange-accent)" };
  } else if (answers.conditions.includes('High Blood Pressure')) {
    insights[2] = { title: "Vascular Health", text: `Maintain systolic pressure under 120. Standard deep box breathing slows heart rate and lowers BP.`, icon: "❤️", color: "rgba(255, 75, 139, 0.1)", textColor: "var(--primary-pink)" };
  } else if (answers.conditions.includes('Anemia')) {
    insights[2] = { title: "Hemoglobin Boost", text: `Focus on iron-rich meals (spinach, lentils) paired with Vitamin C (lemon juice) to enhance absorption.`, icon: "🩸", color: "rgba(255, 166, 32, 0.1)", textColor: "var(--orange-accent)" };
  }

  const badges = [
    { name: "Consistent hydration", icon: "💧", description: "Completed water goal 3 days in a row" },
    { name: "Morning Ritualist", icon: "🧘", description: "Logged mindfulness sessions 5 times" }
  ];

  return {
    userId: "user_active",
    bmi: parseFloat(bmiVal),
    bmiClass,
    bmiColor,
    age,
    gender,
    primaryGoal,
    calorieTarget,
    proteinTarget,
    carbsTarget,
    fatsTarget,
    fiberTarget,
    nutritionScore,
    meals,
    fitnessScore,
    workoutsTarget,
    activeMinutesTarget,
    fitCaloriesBurnTarget,
    workoutName,
    workoutDiff,
    workoutDuration,
    workoutBurn,
    exercises,
    schedule,
    habits,
    wellnessTips,
    routineRecommendations,
    insights,
    badges,
    streak: 3,
    completionPercent: 0,
    generationDate: new Date().toLocaleDateString(),
    lastUpdated: new Date().toLocaleDateString()
  };
}

export const planDb = {
  savePlan: (plan) => {
    localStorage.setItem('her2her_active_plan', JSON.stringify(plan));
  },
  loadPlan: () => {
    const raw = localStorage.getItem('her2her_active_plan');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  },
  clearPlan: () => {
    localStorage.removeItem('her2her_active_plan');
  },
  saveRecords: (records) => {
    localStorage.setItem('her2her_user_records', JSON.stringify(records));
  },
  loadRecords: () => {
    const raw = localStorage.getItem('her2her_user_records');
    if (!raw) {
      return { weightLogs: [], sleepLogs: [], waterLogs: [], moodLogs: [], workoutLogs: [], stepsLogs: [] };
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return { weightLogs: [], sleepLogs: [], waterLogs: [], moodLogs: [], workoutLogs: [], stepsLogs: [] };
    }
  }
};
```

---

## 2. Onboarding 10-Step Wizard Screen
* **File Location**: `src/components/AssessmentWizard.jsx`

*(Refer to codebase file directly for the complete 700 lines source of AssessmentWizard.jsx)*

---

## 3. User Login Dialog Screen
* **File Location**: `src/components/UserLoginModal.jsx`

*(Refer to codebase file directly for the complete 100 lines source of UserLoginModal.jsx)*

---

## 4. Root Application State Manager
* **File Location**: `src/App.jsx`

*(Refer to codebase file directly for the complete 1000 lines source of App.jsx)*

---

## 5. Premium Plans Sub-Tabs View Module
* **File Location**: `src/components/PlansPage.jsx`

*(Refer to codebase file directly for the complete 900 lines source of PlansPage.jsx)*
