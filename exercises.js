function collectExerciseEntries() {
  const entries = {};
  loadData().workouts.forEach((workout) => {
    workout.exercises.forEach((ex) => {
      const key = ex.name.trim().toLowerCase();
      if (!key) return;
      if (!entries[key]) entries[key] = { displayName: ex.name.trim(), sets: [] };
      entries[key].displayName = ex.name.trim();
      ex.sets.forEach((s) => {
        if (s.weight === null && s.reps === null) return;
        entries[key].sets.push({ weight: s.weight, reps: s.reps, rpe: s.rpe, date: workout.date, startedAt: workout.startedAt });
      });
    });
  });
  return entries;
}

function getExerciseSummaries() {
  const entries = collectExerciseEntries();
  return Object.values(entries)
    .map((entry) => ({
      name: entry.displayName,
      prs: computePRs(entry.sets),
      lastPerformed: entry.sets.reduce((latest, s) => (s.startedAt > latest ? s.startedAt : latest), ""),
    }))
    .sort((a, b) => b.lastPerformed.localeCompare(a.lastPerformed));
}

function computePRs(sets) {
  let maxWeight = null;
  let maxReps = null;

  sets.forEach((s) => {
    if (s.weight !== null && (maxWeight === null || s.weight > maxWeight.weight)) {
      maxWeight = s;
    }
    if (s.reps !== null && (maxReps === null || s.reps > maxReps.reps)) {
      maxReps = s;
    }
  });

  return { maxWeight, maxReps };
}

function openExercisesList() {
  renderExercisesList();
  showScreen("screen-exercises");
}

function renderExercisesList() {
  const listEl = document.getElementById("exercises-list");
  listEl.innerHTML = "";

  const summaries = getExerciseSummaries();

  if (summaries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "history-empty";
    empty.textContent = "No exercises logged yet. Log a workout first.";
    listEl.appendChild(empty);
    return;
  }

  summaries.forEach((summary) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "history-item";
    const weightLine = summary.prs.maxWeight
      ? `Max weight: ${summary.prs.maxWeight.weight} × ${summary.prs.maxWeight.reps ?? "?"}`
      : "No weight logged";
    const repsLine = summary.prs.maxReps ? `Max reps: ${summary.prs.maxReps.reps}` : "No reps logged";
    item.innerHTML = `
      <span class="history-item-date">${escapeHtml(summary.name)}</span>
      <span class="history-item-summary">${weightLine}</span>
      <span class="history-item-meta">${repsLine}</span>
    `;
    item.addEventListener("click", () => openExerciseDetail(summary.name));
    listEl.appendChild(item);
  });
}

function openExerciseDetail(name) {
  renderExerciseDetail(name);
  showScreen("screen-exercise-detail");
}

function renderExerciseDetail(name) {
  const container = document.getElementById("exercise-detail-content");
  container.innerHTML = "";

  const entries = collectExerciseEntries();
  const key = name.trim().toLowerCase();
  const entry = entries[key];

  const heading = document.createElement("h2");
  heading.className = "detail-date";
  heading.textContent = name;
  container.appendChild(heading);

  if (!entry || entry.sets.length === 0) {
    const empty = document.createElement("p");
    empty.className = "history-empty";
    empty.textContent = "No sets logged for this exercise yet.";
    container.appendChild(empty);
    return;
  }

  const prs = computePRs(entry.sets);
  const prSection = document.createElement("div");
  prSection.className = "pr-stats";

  prSection.innerHTML = `
    <div class="pr-card">
      <span class="pr-label">Max Weight</span>
      <span class="pr-value">${prs.maxWeight ? prs.maxWeight.weight : "—"}</span>
      <span class="pr-sub">${prs.maxWeight ? `${prs.maxWeight.reps ?? "?"} reps · ${formatDateForDisplay(prs.maxWeight.date)}` : "No weight logged"}</span>
    </div>
    <div class="pr-card">
      <span class="pr-label">Max Reps</span>
      <span class="pr-value">${prs.maxReps ? prs.maxReps.reps : "—"}</span>
      <span class="pr-sub">${prs.maxReps ? `at ${prs.maxReps.weight ?? "?"} · ${formatDateForDisplay(prs.maxReps.date)}` : "No reps logged"}</span>
    </div>
  `;
  container.appendChild(prSection);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn-view-records").addEventListener("click", openExercisesList);
  document.getElementById("btn-exercises-back").addEventListener("click", () => showScreen("screen-home"));
  document.getElementById("btn-exercise-detail-back").addEventListener("click", () => showScreen("screen-exercises"));
});
