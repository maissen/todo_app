// Todo App - Main Application Logic

class TodoApp {
    constructor() {
        this.token = localStorage.getItem('token');
        this.username = localStorage.getItem('username');
        this.currentTodoId = null;
        this.isEditMode = false;
        this.todos = [];
        
        this.init();
    }

    init() {
        // Ensure DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        // Display server number
        const serverNumberElement = document.getElementById('serverNumber');
        if (serverNumberElement) {
            serverNumberElement.textContent = ENV.SERVER_NUMBER;
        }

        // Check authentication
        if (this.token) {
            this.showApp();
            this.loadTodos();
        } else {
            this.showAuth();
        }

        this.attachEventListeners();
    }

    attachEventListeners() {
        // Auth tabs
        document.getElementById('loginTab').addEventListener('click', () => this.switchTab('login'));
        document.getElementById('registerTab').addEventListener('click', () => this.switchTab('register'));

        // Auth forms
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());

        // Todo controls
        document.getElementById('addTodoBtn').addEventListener('click', () => this.openTodoModal());
        document.getElementById('statusFilter').addEventListener('change', () => this.loadTodos());
        document.getElementById('sortOrder').addEventListener('change', () => this.loadTodos());

        // Todo modal
        document.getElementById('closeModal').addEventListener('click', () => this.closeTodoModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeTodoModal());
        document.getElementById('todoForm').addEventListener('submit', (e) => this.handleTodoSubmit(e));

        // Delete modal
        document.getElementById('closeDeleteModal').addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('cancelDeleteBtn').addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => this.confirmDelete());

        // Close modals on background click
        document.getElementById('todoModal').addEventListener('click', (e) => {
            if (e.target.id === 'todoModal') this.closeTodoModal();
        });
        document.getElementById('deleteModal').addEventListener('click', (e) => {
            if (e.target.id === 'deleteModal') this.closeDeleteModal();
        });
    }

    // Authentication Methods
    switchTab(tab) {
        const loginTab = document.getElementById('loginTab');
        const registerTab = document.getElementById('registerTab');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (tab === 'login') {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            this.hideError('registerError');
        } else {
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            registerForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
            this.hideError('loginError');
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        this.hideError('loginError');

        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!username || !password) {
            this.showError('loginError', 'Please fill in all fields');
            return;
        }

        try {
            const response = await this.makeRequest('/auth/login', 'POST', {
                username,
                password
            }, false);

            this.token = response.token;
            this.username = response.username;
            localStorage.setItem('token', this.token);
            localStorage.setItem('username', this.username);

            this.showApp();
            this.loadTodos();
        } catch (error) {
            this.showError('loginError', error.message || 'Login failed');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        this.hideError('registerError');

        const username = document.getElementById('registerUsername').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!username || !password || !confirmPassword) {
            this.showError('registerError', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('registerError', 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            this.showError('registerError', 'Password must be at least 6 characters');
            return;
        }

        try {
            const response = await this.makeRequest('/auth/register', 'POST', {
                username,
                password
            }, false);

            this.token = response.token;
            this.username = response.username;
            localStorage.setItem('token', this.token);
            localStorage.setItem('username', this.username);

            this.showApp();
            this.loadTodos();
        } catch (error) {
            this.showError('registerError', error.message || 'Registration failed');
        }
    }

    handleLogout() {
        this.token = null;
        this.username = null;
        this.todos = [];
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        
        this.showAuth();
        
        // Reset forms
        document.getElementById('loginForm').reset();
        document.getElementById('registerForm').reset();
        this.switchTab('login');
    }

    // Todo CRUD Methods
    async loadTodos() {
        const loading = document.getElementById('loading');
        const emptyState = document.getElementById('emptyState');
        const todoList = document.getElementById('todoList');

        loading.classList.remove('hidden');
        emptyState.classList.add('hidden');

        // Remove existing todo items
        const existingTodos = todoList.querySelectorAll('.todo-item');
        existingTodos.forEach(todo => todo.remove());

        const statusFilter = document.getElementById('statusFilter').value;
        const sortOrder = document.getElementById('sortOrder').value;

        let url = '/todos?sort=createdAt&order=' + sortOrder;
        if (statusFilter) {
            url += '&status=' + statusFilter;
        }

        try {
            const response = await this.makeRequest(url, 'GET');
            this.todos = response.todos || [];

            loading.classList.add('hidden');

            if (this.todos.length === 0) {
                emptyState.classList.remove('hidden');
            } else {
                this.renderTodos();
            }
        } catch (error) {
            loading.classList.add('hidden');
            this.showNotification('Failed to load todos: ' + error.message, 'error');
        }
    }

    renderTodos() {
        const todoList = document.getElementById('todoList');
        const loading = document.getElementById('loading');
        const emptyState = document.getElementById('emptyState');

        // Remove existing todo items but keep loading and empty state
        const existingTodos = todoList.querySelectorAll('.todo-item');
        existingTodos.forEach(todo => todo.remove());

        this.todos.forEach(todo => {
            const todoElement = this.createTodoElement(todo);
            todoList.appendChild(todoElement);
        });
    }

    createTodoElement(todo) {
        const div = document.createElement('div');
        div.className = 'todo-item' + (todo.completed ? ' completed' : '');
        div.dataset.id = todo.id;

        const date = new Date(todo.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        div.innerHTML = `
            <div class="todo-header">
                <div class="todo-title-section">
                    <div class="todo-title">${this.escapeHtml(todo.title)}</div>
                    <div class="todo-date">${date}</div>
                </div>
                <div class="todo-actions">
                    <button class="icon-btn complete-btn" onclick="app.toggleComplete('${todo.id}', ${!todo.completed})" title="${todo.completed ? 'Mark as pending' : 'Mark as completed'}">
                        ${todo.completed ? '↩️' : '✓'}
                    </button>
                    <button class="icon-btn edit-btn" onclick="app.editTodo('${todo.id}')" title="Edit">
                        ✏️
                    </button>
                    <button class="icon-btn delete-btn" onclick="app.deleteTodo('${todo.id}')" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
            ${todo.description ? `<div class="todo-description">${this.escapeHtml(todo.description)}</div>` : ''}
            <span class="todo-status status-${todo.completed ? 'completed' : 'pending'}">
                ${todo.completed ? 'Completed' : 'Pending'}
            </span>
        `;

        return div;
    }

    openTodoModal(todo = null) {
        const modal = document.getElementById('todoModal');
        const modalTitle = document.getElementById('modalTitle');
        const todoForm = document.getElementById('todoForm');
        const completedGroup = document.getElementById('completedGroup');

        todoForm.reset();
        this.hideError('todoError');

        if (todo) {
            this.isEditMode = true;
            this.currentTodoId = todo.id;
            modalTitle.textContent = 'Edit Todo';
            document.getElementById('todoTitle').value = todo.title;
            document.getElementById('todoDescription').value = todo.description || '';
            document.getElementById('todoCompleted').checked = todo.completed;
            completedGroup.style.display = 'block';
        } else {
            this.isEditMode = false;
            this.currentTodoId = null;
            modalTitle.textContent = 'Add Todo';
            completedGroup.style.display = 'none';
        }

        modal.classList.remove('hidden');
        document.getElementById('todoTitle').focus();
    }

    closeTodoModal() {
        document.getElementById('todoModal').classList.add('hidden');
        this.isEditMode = false;
        this.currentTodoId = null;
        this.hideError('todoError');
    }

    async handleTodoSubmit(e) {
        e.preventDefault();
        this.hideError('todoError');

        const title = document.getElementById('todoTitle').value.trim();
        const description = document.getElementById('todoDescription').value.trim();
        const completed = document.getElementById('todoCompleted').checked;

        if (!title) {
            this.showError('todoError', 'Title is required');
            return;
        }

        const todoData = { title };
        if (description) todoData.description = description;
        if (this.isEditMode) todoData.completed = completed;

        try {
            if (this.isEditMode) {
                await this.makeRequest(`/todos/${this.currentTodoId}`, 'PUT', todoData);
                this.showNotification('Todo updated successfully', 'success');
            } else {
                await this.makeRequest('/todos', 'POST', todoData);
                this.showNotification('Todo created successfully', 'success');
            }

            this.closeTodoModal();
            this.loadTodos();
        } catch (error) {
            this.showError('todoError', error.message || 'Failed to save todo');
        }
    }

    async editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            this.openTodoModal(todo);
        }
    }

    deleteTodo(id) {
        this.currentTodoId = id;
        document.getElementById('deleteModal').classList.remove('hidden');
    }

    closeDeleteModal() {
        document.getElementById('deleteModal').classList.add('hidden');
        this.currentTodoId = null;
    }

    async confirmDelete() {
        if (!this.currentTodoId) return;

        try {
            await this.makeRequest(`/todos/${this.currentTodoId}`, 'DELETE');
            this.showNotification('Todo deleted successfully', 'success');
            this.closeDeleteModal();
            this.loadTodos();
        } catch (error) {
            this.closeDeleteModal();
            this.showNotification('Failed to delete todo: ' + error.message, 'error');
        }
    }

    async toggleComplete(id, completed) {
        try {
            await this.makeRequest(`/todos/${id}`, 'PUT', { completed });
            this.showNotification(completed ? 'Todo marked as completed' : 'Todo marked as pending', 'success');
            this.loadTodos();
        } catch (error) {
            this.showNotification('Failed to update todo: ' + error.message, 'error');
        }
    }

    // Utility Methods
    async makeRequest(endpoint, method = 'GET', body = null, requiresAuth = true) {
        const url = ENV.API_BASE_URL + endpoint;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (requiresAuth && this.token) {
            options.headers['Authorization'] = `Bearer ${this.token}`;
        }

        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, options);
            const data = await response.json();

            if (!response.ok) {
                // Handle specific error responses
                if (response.status === 401) {
                    // Token expired or invalid
                    this.handleLogout();
                    throw new Error('Session expired. Please login again.');
                }
                
                const errorMessage = data.error?.message || data.message || 'Request failed';
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            if (error.message === 'Failed to fetch') {
                throw new Error('Cannot connect to server. Please check if the backend is running.');
            }
            throw error;
        }
    }

    showApp() {
        const authContainer = document.getElementById('authContainer');
        const appContainer = document.getElementById('appContainer');
        const currentUsername = document.getElementById('currentUsername');
        
        if (authContainer && appContainer && currentUsername) {
            authContainer.classList.add('hidden');
            appContainer.classList.remove('hidden');
            currentUsername.textContent = this.username;
        }
    }

    showAuth() {
        const authContainer = document.getElementById('authContainer');
        const appContainer = document.getElementById('appContainer');
        
        if (authContainer && appContainer) {
            appContainer.classList.add('hidden');
            authContainer.classList.remove('hidden');
        }
    }

    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    hideError(elementId) {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }

    showNotification(message, type = 'info') {
        // Simple notification - you could enhance this with a toast library
        alert(message);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TodoApp();
});