// Configuration
const API_BASE_URL = (window.ENV?.API_URL)
const SERVER_NUMBER = window.ENV?.SERVER_NUMBER || 'N/A';

// State
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
let todos = [];
let currentFilter = 'all';
let currentSort = 'desc';
let editingTodoId = null;

// DOM Elements
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const addTodoForm = document.getElementById('add-todo-form');
const editTodoForm = document.getElementById('edit-todo-form');
const todoList = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const editModal = document.getElementById('edit-modal');
const usernameDisplay = document.getElementById('username-display');
const logoutBtn = document.getElementById('logout-btn');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('SERVER_NUMBER:', SERVER_NUMBER);
    
    // Display server number in header
    displayServerNumber();
    
    if (authToken && currentUser) {
        showApp();
        loadTodos();
    } else {
        showAuth();
    }

    setupEventListeners();
});

// Display server number in the header
function displayServerNumber() {
    const serverBadgeAuth = document.getElementById('server-badge-auth');
    const serverBadgeApp = document.getElementById('server-badge-app');
    
    if (SERVER_NUMBER && SERVER_NUMBER !== 'N/A') {
        const badgeText = `[Server ${SERVER_NUMBER}]`;
        if (serverBadgeAuth) serverBadgeAuth.textContent = badgeText;
        if (serverBadgeApp) serverBadgeApp.textContent = badgeText;
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Auth tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            switchAuthTab(tab);
        });
    });

    // Auth forms
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);

    // Todo forms
    addTodoForm.addEventListener('submit', handleAddTodo);
    editTodoForm.addEventListener('submit', handleEditTodo);

    // Logout
    logoutBtn.addEventListener('click', handleLogout);

    // Filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filter = e.target.dataset.filter;
            setFilter(filter);
        });
    });

    // Sort
    document.getElementById('sort-select').addEventListener('change', (e) => {
        currentSort = e.target.value;
        loadTodos();
    });

    // Modal
    editModal.querySelector('.close-btn').addEventListener('click', closeEditModal);
    editModal.querySelector('.cancel-btn').addEventListener('click', closeEditModal);
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) closeEditModal();
    });
}

// Auth Functions
function switchAuthTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.toggle('active', form.id === `${tab}-form`);
    });
    clearErrors();
}

async function handleLogin(e) {
    e.preventDefault();
    clearErrors();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const loginUrl = `${API_BASE_URL}/auth/login`;
    console.log('Login URL:', loginUrl);

    try {
        const response = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showError('login-error', data.error?.message || 'Login failed');
            return;
        }

        authToken = data.token;
        currentUser = { id: data.id, username: data.username };
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        showApp();
        loadTodos();
        loginForm.reset();
    } catch (error) {
        console.error('Login error:', error);
        showError('login-error', 'Network error. Please try again.');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    clearErrors();

    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    if (password.length < 6) {
        showError('register-error', 'Password must be at least 6 characters');
        return;
    }

    const registerUrl = `${API_BASE_URL}/auth/register`;
    console.log('Register URL:', registerUrl);

    try {
        const response = await fetch(registerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showError('register-error', data.error?.message || 'Registration failed');
            return;
        }

        authToken = data.token;
        currentUser = { id: data.id, username: data.username };
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        showApp();
        loadTodos();
        registerForm.reset();
    } catch (error) {
        console.error('Register error:', error);
        showError('register-error', 'Network error. Please try again.');
    }
}

function handleLogout() {
    authToken = null;
    currentUser = null;
    todos = [];
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    showAuth();
}

// UI Functions
function showAuth() {
    authContainer.classList.remove('hidden');
    appContainer.classList.add('hidden');
}

function showApp() {
    authContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');
    usernameDisplay.textContent = currentUser.username;
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
        el.classList.remove('show');
    });
}

function setFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    renderTodos();
}

// Todo API Functions
async function loadTodos() {
    try {
        todoList.innerHTML = '<div class="loading">Loading todos...</div>';
        emptyState.classList.add('hidden');

        const todosUrl = `${API_BASE_URL}/todos?sort=createdAt&order=${currentSort}`;
        console.log('Load todos URL:', todosUrl);

        const response = await fetch(todosUrl, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) {
            if (response.status === 401) {
                handleLogout();
                return;
            }
            throw new Error('Failed to load todos');
        }

        const data = await response.json();
        todos = data.todos;
        renderTodos();
    } catch (error) {
        console.error('Error loading todos:', error);
        todoList.innerHTML = '<div class="loading">Error loading todos</div>';
    }
}

async function handleAddTodo(e) {
    e.preventDefault();

    const title = document.getElementById('todo-title').value;
    const description = document.getElementById('todo-description').value;

    try {
        const response = await fetch(`${API_BASE_URL}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ title, description })
        });

        if (!response.ok) {
            if (response.status === 401) {
                handleLogout();
                return;
            }
            throw new Error('Failed to create todo');
        }

        addTodoForm.reset();
        loadTodos();
    } catch (error) {
        console.error('Error creating todo:', error);
        alert('Failed to create todo');
    }
}

async function toggleTodoComplete(id, completed) {
    try {
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ completed: !completed })
        });

        if (!response.ok) {
            if (response.status === 401) {
                handleLogout();
                return;
            }
            throw new Error('Failed to update todo');
        }

        loadTodos();
    } catch (error) {
        console.error('Error updating todo:', error);
        alert('Failed to update todo');
    }
}

async function deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this todo?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) {
            if (response.status === 401) {
                handleLogout();
                return;
            }
            throw new Error('Failed to delete todo');
        }

        loadTodos();
    } catch (error) {
        console.error('Error deleting todo:', error);
        alert('Failed to delete todo');
    }
}

function openEditModal(todo) {
    editingTodoId = todo.id;
    document.getElementById('edit-todo-title').value = todo.title;
    document.getElementById('edit-todo-description').value = todo.description || '';
    document.getElementById('edit-todo-completed').checked = todo.completed;
    editModal.classList.remove('hidden');
}

function closeEditModal() {
    editingTodoId = null;
    editTodoForm.reset();
    editModal.classList.add('hidden');
}

async function handleEditTodo(e) {
    e.preventDefault();

    const title = document.getElementById('edit-todo-title').value;
    const description = document.getElementById('edit-todo-description').value;
    const completed = document.getElementById('edit-todo-completed').checked;

    try {
        const response = await fetch(`${API_BASE_URL}/todos/${editingTodoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ title, description, completed })
        });

        if (!response.ok) {
            if (response.status === 401) {
                handleLogout();
                return;
            }
            throw new Error('Failed to update todo');
        }

        closeEditModal();
        loadTodos();
    } catch (error) {
        console.error('Error updating todo:', error);
        alert('Failed to update todo');
    }
}

// Render Functions
function renderTodos() {
    let filteredTodos = todos;

    // Apply filter
    if (currentFilter === 'completed') {
        filteredTodos = todos.filter(todo => todo.completed);
    } else if (currentFilter === 'pending') {
        filteredTodos = todos.filter(todo => !todo.completed);
    }

    if (filteredTodos.length === 0) {
        todoList.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    todoList.innerHTML = filteredTodos.map(todo => createTodoElement(todo)).join('');

    // Attach event listeners
    filteredTodos.forEach(todo => {
        const todoElement = document.querySelector(`[data-todo-id="${todo.id}"]`);
        
        todoElement.querySelector('.todo-checkbox input').addEventListener('change', () => {
            toggleTodoComplete(todo.id, todo.completed);
        });

        todoElement.querySelector('.btn-edit').addEventListener('click', () => {
            openEditModal(todo);
        });

        todoElement.querySelector('.btn-danger').addEventListener('click', () => {
            deleteTodo(todo.id);
        });
    });
}

function createTodoElement(todo) {
    const date = new Date(todo.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return `
        <div class="todo-item ${todo.completed ? 'completed' : ''}" data-todo-id="${todo.id}">
            <div class="todo-header">
                <div class="todo-checkbox">
                    <input type="checkbox" ${todo.completed ? 'checked' : ''}>
                </div>
                <div class="todo-content">
                    <div class="todo-title">${escapeHtml(todo.title)}</div>
                    ${todo.description ? `<div class="todo-description">${escapeHtml(todo.description)}</div>` : ''}
                    <div class="todo-meta">
                        <div class="todo-date">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            <span>${date}</span>
                        </div>
                        <span class="todo-status ${todo.completed ? 'completed' : 'pending'}">
                            ${todo.completed ? 'Completed' : 'Pending'}
                        </span>
                    </div>
                </div>
            </div>
            <div class="todo-actions">
                <button class="btn btn-edit">Edit</button>
                <button class="btn btn-danger">Delete</button>
            </div>
        </div>
    `;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}