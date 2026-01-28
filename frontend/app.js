// Simple state management
let token = localStorage.getItem('token');
let user = JSON.parse(localStorage.getItem('user') || 'null');
let todos = [];
let currentFilter = 'all';
let editingTodoId = null;

// API helpers
function apiCall(endpoint, options = {}) {
  const url = `${window.ENV.API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetch(url, {
    ...options,
    headers
  }).then(res => {
    if (!res.ok) {
      return res.json().then(err => {
        throw new Error(err.error?.message || 'Request failed');
      });
    }
    if (res.status === 204) return null;
    return res.json();
  });
}

// Auth functions
function login(username, password) {
  return apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  }).then(data => {
    token = data.token;
    user = { id: data.id, username: data.username };
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    showApp();
    loadTodos();
  });
}

function register(username, password) {
  return apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  }).then(data => {
    token = data.token;
    user = { id: data.id, username: data.username };
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    showApp();
    loadTodos();
  });
}

function logout() {
  token = null;
  user = null;
  todos = [];
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  showLogin();
}

// Todo functions
function loadTodos() {
  showLoading();
  const params = new URLSearchParams();
  if (currentFilter === 'completed') params.append('status', 'completed');
  if (currentFilter === 'pending') params.append('status', 'pending');
  
  const query = params.toString() ? `?${params.toString()}` : '';
  
  apiCall(`/todos${query}`)
    .then(data => {
      todos = data.todos || [];
      renderTodos();
      hideLoading();
    })
    .catch(err => {
      hideLoading();
      showError('Failed to load todos: ' + err.message);
    });
}

function createTodo(title, description) {
  return apiCall('/todos', {
    method: 'POST',
    body: JSON.stringify({ title, description })
  }).then(() => {
    loadTodos();
  });
}

function updateTodo(id, updates) {
  return apiCall(`/todos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }).then(() => {
    loadTodos();
  });
}

function deleteTodo(id) {
  if (!confirm('Delete this task?')) return Promise.resolve();
  
  return apiCall(`/todos/${id}`, {
    method: 'DELETE'
  }).then(() => {
    loadTodos();
  });
}

function toggleTodo(id, completed) {
  return updateTodo(id, { completed: !completed });
}

// UI functions
function showLogin() {
  document.getElementById('loginScreen').classList.add('active');
  document.getElementById('appScreen').classList.remove('active');
}

function showApp() {
  document.getElementById('loginScreen').classList.remove('active');
  document.getElementById('appScreen').classList.add('active');
  document.getElementById('userInfo').textContent = user.username;
}

function showLoading() {
  document.getElementById('loadingState').classList.add('show');
  document.getElementById('todoList').style.display = 'none';
  document.getElementById('emptyState').classList.remove('show');
}

function hideLoading() {
  document.getElementById('loadingState').classList.remove('show');
  document.getElementById('todoList').style.display = 'flex';
}

function showError(message) {
  alert(message);
}

function renderTodos() {
  const list = document.getElementById('todoList');
  const empty = document.getElementById('emptyState');
  const stats = document.getElementById('todoStats');
  
  if (todos.length === 0) {
    list.style.display = 'none';
    empty.classList.add('show');
    stats.textContent = '';
    return;
  }
  
  empty.classList.remove('show');
  list.style.display = 'flex';
  
  const completed = todos.filter(t => t.completed).length;
  const pending = todos.length - completed;
  stats.textContent = `${todos.length} total • ${pending} pending • ${completed} completed`;
  
  list.innerHTML = todos.map(todo => `
    <div class="todo-item ${todo.completed ? 'completed' : ''}">
      <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" 
           onclick="toggleTodo('${todo.id}', ${todo.completed})">
      </div>
      <div class="todo-content">
        <div class="todo-title">${escapeHtml(todo.title)}</div>
        ${todo.description ? `<div class="todo-description">${escapeHtml(todo.description)}</div>` : ''}
        <div class="todo-meta">${formatDate(todo.createdAt)}</div>
      </div>
      <div class="todo-actions">
        <button onclick="editTodo('${todo.id}')">Edit</button>
        <button class="delete-btn" onclick="deleteTodo('${todo.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function openModal(title = 'New Task') {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('todoModal').classList.add('show');
  document.getElementById('todoTitle').value = '';
  document.getElementById('todoDescription').value = '';
  editingTodoId = null;
}

function closeModal() {
  document.getElementById('todoModal').classList.remove('show');
  editingTodoId = null;
}

function editTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  
  editingTodoId = id;
  document.getElementById('modalTitle').textContent = 'Edit Task';
  document.getElementById('todoTitle').value = todo.title;
  document.getElementById('todoDescription').value = todo.description || '';
  document.getElementById('todoModal').classList.add('show');
}

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  loadTodos();
}

function showServerBadge() {
  const badges = document.querySelectorAll('.server-badge');
  badges.forEach(badge => {
    badge.textContent = window.ENV.SERVER_NUMBER;
  });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  showServerBadge();
  
  // Check if already logged in
  if (token && user) {
    showApp();
    loadTodos();
  } else {
    showLogin();
  }
  
  // Tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`${tabName}Form`).classList.add('active');
    });
  });
  
  // Login form
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    
    errorEl.classList.remove('show');
    login(username, password).catch(err => {
      errorEl.textContent = err.message;
      errorEl.classList.add('show');
    });
  });
  
  // Register form
  document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const errorEl = document.getElementById('registerError');
    
    errorEl.classList.remove('show');
    register(username, password).catch(err => {
      errorEl.textContent = err.message;
      errorEl.classList.add('show');
    });
  });
  
  // Logout
  document.getElementById('logoutBtn').addEventListener('click', logout);
  
  // New todo button
  document.getElementById('newTodoBtn').addEventListener('click', () => {
    openModal('New Task');
  });
  
  // Todo form
  document.getElementById('todoForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('todoTitle').value;
    const description = document.getElementById('todoDescription').value;
    
    if (editingTodoId) {
      updateTodo(editingTodoId, { title, description })
        .then(() => closeModal())
        .catch(err => showError('Failed to update: ' + err.message));
    } else {
      createTodo(title, description)
        .then(() => closeModal())
        .catch(err => showError('Failed to create: ' + err.message));
    }
  });
  
  // Modal close
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  
  // Close modal on outside click
  document.getElementById('todoModal').addEventListener('click', (e) => {
    if (e.target.id === 'todoModal') {
      closeModal();
    }
  });
  
  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadTodos();
    });
  });
});
