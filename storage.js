const STORAGE_KEY = "weightTrackerData";

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { workouts: [], routines: [] };
  return JSON.parse(raw);
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
