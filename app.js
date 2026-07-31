let currentWorkout = null;

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((el) => el.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function todayISO() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function formatDateForDisplay(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

function renderHomeSummary() {
  const data = loadData();
  const count = data.workouts.length;
  const summary = document.getElementById("home-summary");
  if (count === 0) {
    summary.textContent = "No workouts logged yet.";
  } else {
    const last = data.workouts[data.workouts.length - 1];
    summary.textContent = `${count} workout${count === 1 ? "" : "s"} logged. Last: ${formatDateForDisplay(last.date)}.`;
  }
}

function startNewWorkout() {
  currentWorkout = {
    id: generateId(),
    date: todayISO(),
    startedAt: new Date().toISOString(),
    exercises: [],
  };
  document.getElementById("exercise-list").innerHTML = "";
  document.getElementById("workout-date").textContent = formatDateForDisplay(currentWorkout.date);
  showScreen("screen-workout");
}

function addExerciseCard() {
  const template = document.getElementById("template-exercise-card");
  const card = template.content.firstElementChild.cloneNode(true);
  const exerciseId = generateId();
  card.dataset.exerciseId = exerciseId;

  card.querySelector(".btn-remove-exercise").addEventListener("click", () => {
    card.remove();
  });

  card.querySelector(".btn-add-set").addEventListener("click", () => {
    addSetRow(card.querySelector(".sets-list"));
  });

  document.getElementById("exercise-list").appendChild(card);
  addSetRow(card.querySelector(".sets-list"));
  card.querySelector(".exercise-name-input").focus();
  return card;
}

function addSetRow(setsListEl) {
  const template = document.getElementById("template-set-row");
  const row = template.content.firstElementChild.cloneNode(true);
  row.querySelector(".set-number").textContent = setsListEl.children.length + 1;

  row.querySelector(".btn-remove-set").addEventListener("click", () => {
    row.remove();
    renumberSets(setsListEl);
  });

  setsListEl.appendChild(row);
}

function renumberSets(setsListEl) {
  [...setsListEl.children].forEach((row, i) => {
    row.querySelector(".set-number").textContent = i + 1;
  });
}

function collectWorkoutFromForm() {
  const exercises = [];
  document.querySelectorAll("#exercise-list .exercise-card").forEach((card) => {
    const name = card.querySelector(".exercise-name-input").value.trim();
    const notes = card.querySelector(".exercise-notes-input").value.trim();
    const restRaw = card.querySelector(".exercise-rest-input").value;
    const restSeconds = restRaw === "" ? null : Number(restRaw);

    const sets = [];
    card.querySelectorAll(".set-row").forEach((row) => {
      const weightRaw = row.querySelector(".set-weight").value;
      const repsRaw = row.querySelector(".set-reps").value;
      const rpeRaw = row.querySelector(".set-rpe").value;
      if (weightRaw === "" && repsRaw === "") return;
      sets.push({
        weight: weightRaw === "" ? null : Number(weightRaw),
        reps: repsRaw === "" ? null : Number(repsRaw),
        rpe: rpeRaw === "" ? null : Number(rpeRaw),
      });
    });

    if (name === "" && sets.length === 0) return;

    exercises.push({
      id: card.dataset.exerciseId,
      name: name === "" ? "Unnamed exercise" : name,
      notes,
      restSeconds,
      sets,
    });
  });
  return exercises;
}

function finishWorkout() {
  const exercises = collectWorkoutFromForm();
  if (exercises.length === 0) {
    alert("Add at least one exercise with a set before finishing.");
    return;
  }
  currentWorkout.exercises = exercises;
  addWorkout(currentWorkout);
  currentWorkout = null;
  renderHomeSummary();
  showScreen("screen-home");
}

function cancelWorkout() {
  if (!confirm("Discard this workout? Nothing will be saved.")) return;
  currentWorkout = null;
  showScreen("screen-home");
}

document.addEventListener("DOMContentLoaded", () => {
  renderHomeSummary();

  document.getElementById("btn-start-workout").addEventListener("click", startNewWorkout);
  document.getElementById("btn-add-exercise").addEventListener("click", addExerciseCard);
  document.getElementById("btn-finish-workout").addEventListener("click", finishWorkout);
  document.getElementById("btn-cancel-workout").addEventListener("click", cancelWorkout);
});
