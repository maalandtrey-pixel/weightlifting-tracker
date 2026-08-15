let editingRoutineId = null;
let routineSelectedExercises = new Set();

function getExerciseLibrary() {
  return loadData().exerciseLibrary;
}

function addExerciseToLibrary(category, name) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const data = loadData();
  const group = data.exerciseLibrary.find((c) => c.category === category);
  if (!group) return;
  const exists = group.exercises.some((e) => e.toLowerCase() === trimmed.toLowerCase());
  if (!exists) group.exercises.push(trimmed);
  saveData(data);
}

function openRoutinesList() {
  renderRoutinesList();
  showScreen("screen-routines");
}

function renderRoutinesList() {
  const listEl = document.getElementById("routines-list");
  listEl.innerHTML = "";
  const routines = loadData().routines;

  if (routines.length === 0) {
    const empty = document.createElement("p");
    empty.className = "history-empty";
    empty.textContent = "No routines yet. Create one to get started.";
    listEl.appendChild(empty);
    return;
  }

  routines.forEach((r) => {
    const card = document.createElement("div");
    card.className = "routine-card";
    card.innerHTML = `
      <div class="routine-card-header">
        <span class="routine-card-name">${escapeHtml(r.name)}</span>
        <button type="button" class="btn-icon btn-edit-routine">Edit</button>
      </div>
      <p class="routine-card-exercises">${escapeHtml(r.exerciseNames.join(", "))}</p>
      <button type="button" class="btn btn-primary btn-block btn-start-routine">Start Workout</button>
    `;
    card.querySelector(".btn-edit-routine").addEventListener("click", () => openRoutineEditor(r.id));
    card.querySelector(".btn-start-routine").addEventListener("click", () => startWorkoutFromRoutine(r.id));
    listEl.appendChild(card);
  });
}

function openRoutineEditor(routineId) {
  editingRoutineId = routineId || null;
  const routine = routineId ? loadData().routines.find((r) => r.id === routineId) : null;
  routineSelectedExercises = new Set(routine ? routine.exerciseNames : []);
  document.getElementById("routine-name-input").value = routine ? routine.name : "";
  document.querySelector(".btn-delete-routine").style.display = routine ? "block" : "none";
  renderRoutineExerciseGroups();
  showScreen("screen-routine-editor");
}

function renderRoutineExerciseGroups() {
  const container = document.getElementById("routine-exercise-groups");
  container.innerHTML = "";
  const library = getExerciseLibrary();

  library.forEach((group) => {
    const section = document.createElement("div");
    section.className = "routine-category";

    const heading = document.createElement("h3");
    heading.className = "routine-category-title";
    heading.textContent = group.category;
    section.appendChild(heading);

    group.exercises.forEach((name) => {
      const label = document.createElement("label");
      label.className = "routine-checkbox-row";
      const isChecked = routineSelectedExercises.has(name);
      label.innerHTML = `<input type="checkbox" ${isChecked ? "checked" : ""} /> <span>${escapeHtml(name)}</span>`;
      const checkbox = label.querySelector("input");
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) routineSelectedExercises.add(name);
        else routineSelectedExercises.delete(name);
      });
      section.appendChild(label);
    });

    const addToggleBtn = document.createElement("button");
    addToggleBtn.type = "button";
    addToggleBtn.className = "btn btn-ghost btn-block btn-toggle-add-exercise";
    addToggleBtn.textContent = "+ Add Exercise";

    const addRow = document.createElement("div");
    addRow.className = "routine-add-exercise-row hidden";
    addRow.innerHTML = `
      <input type="text" class="routine-add-exercise-input" placeholder="New exercise name" />
      <button type="button" class="btn btn-primary btn-confirm-add-exercise">Add</button>
    `;
    const addInput = addRow.querySelector(".routine-add-exercise-input");

    addToggleBtn.addEventListener("click", () => {
      addRow.classList.toggle("hidden");
      if (!addRow.classList.contains("hidden")) addInput.focus();
    });

    function confirmAdd() {
      const name = addInput.value.trim();
      if (!name) return;
      addExerciseToLibrary(group.category, name);
      renderRoutineExerciseGroups();
    }

    addRow.querySelector(".btn-confirm-add-exercise").addEventListener("click", confirmAdd);
    addInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        confirmAdd();
      }
    });

    section.appendChild(addToggleBtn);
    section.appendChild(addRow);

    container.appendChild(section);
  });
}

function saveRoutineFromForm() {
  const name = document.getElementById("routine-name-input").value.trim();
  if (!name) {
    alert("Give your routine a name.");
    return;
  }
  if (routineSelectedExercises.size === 0) {
    alert("Select at least one exercise.");
    return;
  }

  const data = loadData();
  const exerciseNames = [...routineSelectedExercises];

  if (editingRoutineId) {
    const routine = data.routines.find((r) => r.id === editingRoutineId);
    routine.name = name;
    routine.exerciseNames = exerciseNames;
  } else {
    data.routines.push({ id: generateId(), name, exerciseNames });
  }
  saveData(data);
  openRoutinesList();
}

function deleteRoutine() {
  if (!editingRoutineId) return;
  if (!confirm("Delete this routine?")) return;
  const data = loadData();
  data.routines = data.routines.filter((r) => r.id !== editingRoutineId);
  saveData(data);
  openRoutinesList();
}

function startWorkoutFromRoutine(routineId) {
  const routine = loadData().routines.find((r) => r.id === routineId);
  if (!routine) return;
  startNewWorkout();
  routine.exerciseNames.forEach((name) => {
    const card = addExerciseCard();
    card.querySelector(".exercise-name-input").value = name;
    card.querySelector(".exercise-name-input").blur();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn-view-routines").addEventListener("click", openRoutinesList);
  document.getElementById("btn-routines-back").addEventListener("click", () => showScreen("screen-home"));
  document.getElementById("btn-new-routine").addEventListener("click", () => openRoutineEditor(null));
  document.getElementById("btn-routine-editor-back").addEventListener("click", () => showScreen("screen-routines"));
  document.getElementById("btn-save-routine").addEventListener("click", saveRoutineFromForm);
  document.getElementById("btn-delete-routine").addEventListener("click", deleteRoutine);
});
