const taskList = document.getElementById("taskList");
const taskInput = document.getElementById("taskInput");

// Handle Enter key for adding tasks
taskInput.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    addTask();
  }
});

// Load Tasks
async function loadTasks() {
  const res = await fetch("/tasks");
  const tasks = await res.json();

  taskList.innerHTML = "";

  tasks.forEach(task => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div class="task-content" onclick="toggleTask(${task.id}, '${task.title.replace(/'/g, "\\'")}', ${task.completed})">
        <div class="checkbox-container ${task.completed ? "checked" : ""}">
          <i class="fas fa-check"></i>
        </div>
        <span class="task-text ${task.completed ? "completed" : ""}">
          ${escapeHTML(task.title)}
        </span>
      </div>

      <div class="buttons">
        <button 
          class="icon-btn edit-btn"
          title="Edit Task"
          onclick="editTask(event, ${task.id}, '${task.title.replace(/'/g, "\\'")}', ${task.completed})">
          <i class="fas fa-pen"></i>
        </button>

        <button 
          class="icon-btn delete-btn"
          title="Delete Task"
          onclick="deleteTask(event, ${task.id})">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;

    taskList.appendChild(li);
  });
}

// Utility to prevent XSS
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Add Task
async function addTask() {
  const input = document.getElementById("taskInput");

  if (input.value.trim() === "") {
    return; // Silently return or we could add a shake animation
  }

  await fetch("/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: input.value,
    }),
  });

  input.value = "";
  loadTasks();
}

// Toggle Task Status
async function toggleTask(id, title, completed) {
  await fetch(`/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      completed: completed ? 0 : 1,
    }),
  });

  loadTasks();
}

// Edit Task
async function editTask(event, id, oldTitle, completed) {
  event.stopPropagation(); // Prevent triggering the toggleTask
  const newTitle = prompt("Edit Task", oldTitle);

  if (!newTitle || newTitle.trim() === "") return;

  await fetch(`/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: newTitle.trim(),
      completed,
    }),
  });

  loadTasks();
}

// Delete Task
async function deleteTask(event, id) {
  event.stopPropagation(); // Prevent triggering the toggleTask

  const confirmDelete = confirm("Delete this task?");
  if (!confirmDelete) return;

  await fetch(`/tasks/${id}`, {
    method: "DELETE",
  });

  loadTasks();
}

// Initial Load
loadTasks();