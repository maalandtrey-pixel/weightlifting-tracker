const STORAGE_KEY = "weightTrackerData";

const DEFAULT_EXERCISE_LIBRARY = [
  { category: "Chest", exercises: ["Bench Press (Barbell)", "Incline Bench Press (Dumbbell)", "Pec Deck", "Chest Fly (Cable)"] },
  { category: "Back", exercises: ["Pull-ups", "Row (Barbell)", "Row (Cable)", "Row (T-Bar)", "Lat Pulldown"] },
  { category: "Shoulders", exercises: ["Lateral Raise (Cable)", "Lateral Raise (Dumbbell)", "Shoulder Press"] },
  { category: "Biceps", exercises: ["Incline Curl (Dumbbell)", "Preacher Curl", "Hammer Curl (Dumbbell)", "Barbell Curl"] },
  { category: "Triceps", exercises: ["Tricep Extension (Cable)", "Tricep Pulldown (Cable)", "Tricep Pulldown (Single Arm)"] },
  { category: "Legs", exercises: ["Bulgarian Split Squat", "Leg Press", "Hamstring Curl", "Leg Extension"] },
];

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const data = raw ? JSON.parse(raw) : {};
  if (!data.workouts) data.workouts = [];
  if (!data.routines) data.routines = [];
  if (!data.exerciseLibrary) data.exerciseLibrary = DEFAULT_EXERCISE_LIBRARY;
  return data;
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function addWorkout(workout) {
  const data = loadData();
  data.workouts.push(workout);
  saveData(data);
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
