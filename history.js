let calViewYear = null;
let calViewMonth = null;
let calSelectedDate = null;

function pad2(n) {
  return String(n).padStart(2, "0");
}

function isoForDay(year, month, day) {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

function workoutsOnDate(iso) {
  return loadData().workouts.filter((w) => w.date === iso);
}

function workoutsInMonth(year, month) {
  const prefix = `${year}-${pad2(month + 1)}`;
  return loadData().workouts.filter((w) => w.date.startsWith(prefix));
}

function openHistory() {
  const today = new Date();
  calViewYear = today.getFullYear();
  calViewMonth = today.getMonth();
  calSelectedDate = null;
  renderCalendar();
  renderHistoryList();
  showScreen("screen-history");
}

function renderCalendar() {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  document.getElementById("calendar-month-label").textContent = `${monthNames[calViewMonth]} ${calViewYear}`;

  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";

  const firstWeekday = new Date(calViewYear, calViewMonth, 1).getDay();
  const daysInMonth = new Date(calViewYear, calViewMonth + 1, 0).getDate();
  const today = todayISO();

  for (let i = 0; i < firstWeekday; i++) {
    const empty = document.createElement("div");
    empty.className = "cal-day empty";
    grid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const iso = isoForDay(calViewYear, calViewMonth, day);
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "cal-day";
    cell.textContent = day;
    if (workoutsOnDate(iso).length > 0) cell.classList.add("has-workout");
    if (iso === today) cell.classList.add("today");
    if (iso === calSelectedDate) cell.classList.add("selected");
    cell.addEventListener("click", () => {
      calSelectedDate = calSelectedDate === iso ? null : iso;
      renderCalendar();
      renderHistoryList();
    });
    grid.appendChild(cell);
  }
}

function changeMonth(delta) {
  calViewMonth += delta;
  if (calViewMonth < 0) {
    calViewMonth = 11;
    calViewYear -= 1;
  } else if (calViewMonth > 11) {
    calViewMonth = 0;
    calViewYear += 1;
  }
  calSelectedDate = null;
  renderCalendar();
  renderHistoryList();
}

function summarizeExercises(workout) {
  const names = workout.exercises.map((e) => e.name);
  if (names.length <= 2) return names.join(", ");
  return `${names.slice(0, 2).join(", ")} +${names.length - 2} more`;
}

function renderHistoryList() {
  const titleEl = document.getElementById("history-list-title");
  const listEl = document.getElementById("history-list");
  listEl.innerHTML = "";

  let workouts;
  if (calSelectedDate) {
    titleEl.textContent = formatDateForDisplay(calSelectedDate);
    workouts = workoutsOnDate(calSelectedDate);
  } else {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    titleEl.textContent = `All workouts in ${monthNames[calViewMonth]}`;
    workouts = workoutsInMonth(calViewYear, calViewMonth);
  }

  workouts = [...workouts].sort((a, b) => b.startedAt.localeCompare(a.startedAt));

  if (workouts.length === 0) {
    const empty = document.createElement("p");
    empty.className = "history-empty";
    empty.textContent = calSelectedDate ? "No workout logged this day." : "No workouts logged this month.";
    listEl.appendChild(empty);
    return;
  }

  workouts.forEach((w) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "history-item";
    const setCount = w.exercises.reduce((sum, e) => sum + e.sets.length, 0);
    item.innerHTML = `
      <span class="history-item-date">${formatDateForDisplay(w.date)}</span>
      <span class="history-item-summary">${summarizeExercises(w)}</span>
      <span class="history-item-meta">${w.exercises.length} exercise${w.exercises.length === 1 ? "" : "s"} · ${setCount} set${setCount === 1 ? "" : "s"}</span>
    `;
    item.addEventListener("click", () => openWorkoutDetail(w.id));
    listEl.appendChild(item);
  });
}

function openWorkoutDetail(workoutId) {
  const workout = loadData().workouts.find((w) => w.id === workoutId);
  if (!workout) return;
  renderWorkoutDetail(workout);
  showScreen("screen-workout-detail");
}

function renderWorkoutDetail(workout) {
  const container = document.getElementById("workout-detail-content");
  container.innerHTML = "";

  const heading = document.createElement("h2");
  heading.className = "detail-date";
  heading.textContent = formatDateForDisplay(workout.date);
  container.appendChild(heading);

  workout.exercises.forEach((ex) => {
    const card = document.createElement("div");
    card.className = "detail-exercise-card";

    let metaHtml = "";
    if (ex.notes) metaHtml += `<p class="detail-notes">${escapeHtml(ex.notes)}</p>`;
    if (ex.restSeconds !== null && ex.restSeconds !== undefined) {
      metaHtml += `<p class="detail-rest">Rest: ${ex.restSeconds}s</p>`;
    }

    const rows = ex.sets
      .map(
        (s, i) => `
        <div class="set-row detail-set-row">
          <span class="set-number">${i + 1}</span>
          <span>${s.weight ?? "—"}</span>
          <span>${s.reps ?? "—"}</span>
          <span>${s.rpe ?? "—"}</span>
        </div>`
      )
      .join("");

    card.innerHTML = `
      <h3 class="detail-exercise-name">${escapeHtml(ex.name)}</h3>
      ${metaHtml}
      <div class="sets-header detail-sets-header">
        <span>Set</span><span>Weight</span><span>Reps</span><span>RPE</span>
      </div>
      ${rows}
    `;
    container.appendChild(card);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn-view-history").addEventListener("click", openHistory);
  document.getElementById("btn-history-back").addEventListener("click", () => showScreen("screen-home"));
  document.getElementById("btn-detail-back").addEventListener("click", () => showScreen("screen-history"));
  document.getElementById("btn-cal-prev").addEventListener("click", () => changeMonth(-1));
  document.getElementById("btn-cal-next").addEventListener("click", () => changeMonth(1));
});
