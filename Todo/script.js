const input = document.getElementById("task-input");
const addBtn = document.getElementById("add-task-btn");
const taskList = document.getElementById("task-list");
const popup = document.getElementById("popup");

window.addEventListener("DOMContentLoaded", loadTasks);

addBtn.addEventListener("click", addTask);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

function showPopup(message) {
  popup.textContent = message;
  popup.classList.add("show");
  setTimeout(() => popup.classList.remove("show"), 2500);
}

function saveTasks() {
  const tasks = [];
  document.querySelectorAll(".task-item").forEach((li) => {
    tasks.push({
      text: li.querySelector(".task-text").textContent,
      completed: li.classList.contains("completed"),
    });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  taskList.innerHTML = "";
  tasks.forEach((task) => {
    createTaskElement(task.text, task.completed);
  });
}

const cooldowns = {
  add: 0,
  delete: 0,
  mark: 0
};
const COOLDOWN_MS = 20000; 

function isCooldown(type) {
  const now = Date.now();
  if (now < cooldowns[type]) {
    const secondsLeft = Math.ceil((cooldowns[type] - now) / 1000);
    showPopup(`Oops! Please wait ${secondsLeft}s before you can ${type} again ⏳`);
    return true;
  }
  return false;
}

function setCooldown(type) {
  cooldowns[type] = Date.now() + COOLDOWN_MS;
}

function createTaskElement(taskText, completed = false) {
  const li = document.createElement("li");
  li.className = "task-item";
  if (completed) li.classList.add("completed");

  li.innerHTML = `
    <div class="task-left">
      <div class="checkbox">
        <svg class="tick-svg" width="18" height="18" viewBox="0 0 18 18">
          <polyline points="4,10 8,14 14,6" stroke="#1bc47d" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <span class="task-text">${taskText}</span>
    </div>
    <div class="actions">
      <svg class="trash-svg" width="18" height="18" viewBox="0 0 24 24">
        <rect x="5" y="7" width="14" height="12" rx="2" fill="#fff" stroke="#ff4d4f" stroke-width="2"/>
        <line x1="10" y1="11" x2="10" y2="17" stroke="#ff4d4f" stroke-width="2"/>
        <line x1="14" y1="11" x2="14" y2="17" stroke="#ff4d4f" stroke-width="2"/>
        <rect x="9" y="4" width="6" height="3" rx="1.5" fill="#ff4d4f"/>
      </svg>
    </div>
  `;

  taskList.appendChild(li);

  const checkbox = li.querySelector(".checkbox");
  const trash = li.querySelector(".trash-svg");

  checkbox.addEventListener("click", () => {
    if (isCooldown("mark")) return;
    li.classList.toggle("completed");
    saveTasks();
    setCooldown("mark");
    const msg = li.classList.contains("completed")
      ? "Done and dusted! Nice work 🎯"
      : "Task is back in the game! Let's keep going 💪";
    showPopup(msg);
  });

  trash.addEventListener("click", () => {
    if (isCooldown("delete")) return;
    li.remove();
    saveTasks();
    setCooldown("delete");
    showPopup("Poof! Task removed from the list 💨");
  });
}

function addTask() {
  if (isCooldown("add")) return;
  const taskText = input.value.trim();
  if (!taskText) return;
  createTaskElement(taskText, false);
  input.value = "";
  saveTasks();
  setCooldown("add");
  showPopup("Sweet! A new task has joined the list 🎉");
}

