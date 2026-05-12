// ===== State =====
let tasks = loadTasks();
let currentFilter = 'all';

// ===== Persistence =====
function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem('todo-tasks')) || [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem('todo-tasks', JSON.stringify(tasks));
}

// ===== Helpers =====
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ===== Filtered Tasks =====
function getFilteredTasks() {
  switch (currentFilter) {
    case 'active':    return tasks.filter(t => !t.completed);
    case 'completed': return tasks.filter(t => t.completed);
    default:          return tasks;
  }
}

// ===== Render =====
function render() {
  const list = document.getElementById('task-list');
  const emptyState = document.getElementById('empty-state');
  const filtered = getFilteredTasks();

  // Update counts
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const active = total - completed;

  document.getElementById('total-count').textContent = total;
  document.getElementById('completed-count').textContent = completed;
  document.getElementById('count-all').textContent = total;
  document.getElementById('count-active').textContent = active;
  document.getElementById('count-completed').textContent = completed;

  // Progress bar
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  const fill = document.getElementById('progress-fill');
  fill.style.width = `${pct}%`;
  fill.closest('[role="progressbar"]').setAttribute('aria-valuenow', pct);

  // Empty state
  if (filtered.length === 0) {
    list.innerHTML = '';
    emptyState.hidden = false;

    if (currentFilter === 'completed') {
      document.querySelector('.empty-icon').textContent = '○';
      document.querySelector('.empty-title').textContent = 'No completed tasks yet.';
      document.querySelector('.empty-sub').textContent = 'Complete a task to see it here.';
    } else if (currentFilter === 'active') {
      document.querySelector('.empty-icon').textContent = '✓';
      document.querySelector('.empty-title').textContent = 'All tasks done!';
      document.querySelector('.empty-sub').textContent = 'Great job — nothing left to do.';
    } else {
      document.querySelector('.empty-icon').textContent = '✓';
      document.querySelector('.empty-title').textContent = 'All clear!';
      document.querySelector('.empty-sub').textContent = 'Add a task above to get started.';
    }
    return;
  }

  emptyState.hidden = true;

  list.innerHTML = filtered.map(task => `
    <li
      class="task-item${task.completed ? ' completed' : ''}"
      data-id="${task.id}"
      data-priority="${task.priority}"
    >
      <input
        type="checkbox"
        class="task-checkbox"
        ${task.completed ? 'checked' : ''}
        aria-label="Mark '${escapeHtml(task.text)}' as ${task.completed ? 'incomplete' : 'complete'}"
      />
      <div class="task-body">
        <span class="task-text">${escapeHtml(task.text)}</span>
        <div class="task-meta">
          <span class="task-time">${formatTime(task.createdAt)}</span>
          <span class="priority-badge priority-${task.priority}">${task.priority}</span>
        </div>
      </div>
      <div class="task-actions">
        <button class="btn-action btn-edit" aria-label="Edit task" title="Edit">✏️</button>
        <button class="btn-action btn-delete" aria-label="Delete task" title="Delete">🗑️</button>
      </div>
    </li>
  `).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ===== Add Task =====
function addTask(text, priority) {
  const trimmed = text.trim();
  if (!trimmed) return false;

  tasks.unshift({
    id: generateId(),
    text: trimmed,
    priority,
    completed: false,
    createdAt: Date.now()
  });

  saveTasks();
  render();
  return true;
}

// ===== Toggle Complete =====
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    render();
  }
}

// ===== Delete Task =====
function deleteTask(id) {
  const item = document.querySelector(`.task-item[data-id="${id}"]`);
  if (item) {
    item.classList.add('removing');
    item.addEventListener('animationend', () => {
      tasks = tasks.filter(t => t.id !== id);
      saveTasks();
      render();
    }, { once: true });
  }
}

// ===== Edit Task =====
function editTask(id, li) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const textEl = li.querySelector('.task-text');
  const actionsEl = li.querySelector('.task-actions');
  const currentText = task.text;

  // Replace text span with input
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'task-edit-input';
  input.value = currentText;
  input.maxLength = 120;
  input.setAttribute('aria-label', 'Edit task text');

  textEl.replaceWith(input);
  input.focus();
  input.select();

  // Hide action buttons during edit
  actionsEl.style.opacity = '0';
  actionsEl.style.pointerEvents = 'none';

  function saveEdit() {
    const newText = input.value.trim();
    if (newText && newText !== currentText) {
      task.text = newText;
      saveTasks();
    }
    render();
  }

  function cancelEdit() {
    render();
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') cancelEdit();
  });

  input.addEventListener('blur', saveEdit);
}

// ===== Clear Completed =====
function clearCompleted() {
  const count = tasks.filter(t => t.completed).length;
  if (count === 0) return;

  if (confirm(`Remove ${count} completed task${count > 1 ? 's' : ''}?`)) {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    render();
  }
}

// ===== Event Delegation for Task List =====
function initTaskList() {
  const list = document.getElementById('task-list');

  list.addEventListener('change', (e) => {
    if (e.target.classList.contains('task-checkbox')) {
      const id = e.target.closest('.task-item').dataset.id;
      toggleTask(id);
    }
  });

  list.addEventListener('click', (e) => {
    const item = e.target.closest('.task-item');
    if (!item) return;
    const id = item.dataset.id;

    if (e.target.closest('.btn-delete')) {
      deleteTask(id);
    } else if (e.target.closest('.btn-edit')) {
      editTask(id, item);
    }
  });
}

// ===== Add Form =====
function initAddForm() {
  const form = document.getElementById('add-form');
  const input = document.getElementById('task-input');
  const charCount = document.getElementById('char-count');
  const maxLen = 120;

  input.addEventListener('input', () => {
    const remaining = maxLen - input.value.length;
    charCount.textContent = remaining;
    charCount.className = 'char-count';
    if (remaining <= 20) charCount.classList.add('warning');
    if (remaining <= 10) charCount.classList.add('danger');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value;
    const priority = document.getElementById('priority-select').value;

    if (addTask(text, priority)) {
      input.value = '';
      charCount.textContent = maxLen;
      charCount.className = 'char-count';
      input.focus();
    } else {
      input.classList.add('shake');
      input.addEventListener('animationend', () => input.classList.remove('shake'), { once: true });
    }
  });
}

// ===== Filter Buttons =====
function initFilters() {
  const buttons = document.querySelectorAll('.filter-btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  document.getElementById('clear-done').addEventListener('click', clearCompleted);
}

// ===== Date Display =====
function setDate() {
  const el = document.getElementById('app-date');
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  setDate();
  initAddForm();
  initFilters();
  initTaskList();
  render();
});
