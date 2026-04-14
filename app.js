'use strict';

//localStorage

const Storage = {
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key) {
    localStorage.removeItem(key);
  },
};

const KEYS = {
  USERS: 'doit_users',
  CURRENT_USER: 'doit_current_user',
  tasks: (email) => `doit_tasks_${email}`,
};


//Autenticação

const Auth = {
  getUsers() {
    return Storage.get(KEYS.USERS) || [];
  },

  getCurrentUser() {
    return Storage.get(KEYS.CURRENT_USER) || null;
  },

  register(email, password) {
    const users = this.getUsers();
    if (users.find((u) => u.email === email)) {
      return { ok: false, error: 'Este e-mail já está cadastrado.' };
    }
    users.push({ email, password });
    Storage.set(KEYS.USERS, users);
    return { ok: true };
  },

  login(email, password) {
    const users = this.getUsers();
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) {
      return { ok: false, error: 'E-mail ou senha incorretos.' };
    }
    Storage.set(KEYS.CURRENT_USER, email);
    return { ok: true };
  },

  logout() {
    Storage.remove(KEYS.CURRENT_USER);
  },
};

//CRUD de Tarefas

const Tasks = {
  _key() {
    return KEYS.tasks(Auth.getCurrentUser());
  },

  getAll() {
    return Storage.get(this._key()) || [];
  },

  _save(tasks) {
    Storage.set(this._key(), tasks);
  },

  add(text) {
    const tasks = this.getAll();
    tasks.unshift({
      id: String(Date.now()),
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    });
    this._save(tasks);
  },

  toggle(id) {
    const tasks = this.getAll().map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    this._save(tasks);
  },

  remove(id) {
    const tasks = this.getAll().filter((t) => t.id !== id);
    this._save(tasks);
  },

  filter(status) {
    const all = this.getAll();
    if (status === 'pending') return all.filter((t) => !t.completed);
    if (status === 'completed') return all.filter((t) => t.completed);
    return all;
  },
};

// UI

const UI = {
  currentFilter: 'all',

  //Referências aos elementos
  screens: {
    login: document.getElementById('screen-login'),
    register: document.getElementById('screen-register'),
    app: document.getElementById('screen-app'),
  },

  showScreen(name) {
    Object.values(this.screens).forEach((s) => s.classList.add('hidden'));
    this.screens[name].classList.remove('hidden');
  },

  //Mensagens de erro/sucesso
  setError(elementId, msg) {
    document.getElementById(elementId).textContent = msg;
  },

  clearMessages(...ids) {
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    });
  },

  //Renderização da lista de tarefas
  renderTasks() {
    const list = document.getElementById('task-list');
    const emptyState = document.getElementById('empty-state');
    const tasks = Tasks.filter(this.currentFilter);

    list.innerHTML = '';

    if (tasks.length === 0) {
      emptyState.classList.remove('hidden');
    } else {
      emptyState.classList.add('hidden');
      tasks.forEach((task) => {
        const li = document.createElement('li');
        li.className = `task-item${task.completed ? ' completed' : ''}`;
        li.dataset.id = task.id;

        li.innerHTML = `
          <input
            type="checkbox"
            class="task-checkbox"
            aria-label="Marcar tarefa como concluída"
            ${task.completed ? 'checked' : ''}
          />
          <span class="task-text">${this._escapeHtml(task.text)}</span>
          <button class="btn btn-icon btn-delete" aria-label="Excluir tarefa">&#10005;</button>
        `;

        list.appendChild(li);
      });
    }

    this.updateCounters();
  },

  updateCounters() {
    const all = Tasks.getAll();
    const pending = all.filter((t) => !t.completed).length;
    const completed = all.filter((t) => t.completed).length;
    document.getElementById('counter-pending').textContent =
      `${pending} ${pending === 1 ? 'pendente' : 'pendentes'}`;
    document.getElementById('counter-completed').textContent =
      `${completed} ${completed === 1 ? 'concluída' : 'concluídas'}`;
  },

  _escapeHtml(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  },

  //Inicialização do app depois do login
  initApp() {
    const email = Auth.getCurrentUser();
    document.getElementById('user-email-display').textContent = email;
    this.currentFilter = 'all';
    document.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.filter === 'all');
    });
    this.renderTasks();
    this.showScreen('app');
  },

  //Registro de eventos
  bindEvents() {
    // Login
    document.getElementById('form-login').addEventListener('submit', (e) => {
      e.preventDefault();
      this.clearMessages('login-error');
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      if (!email || !password) {
        this.setError('login-error', 'Preencha todos os campos.');
        return;
      }

      const result = Auth.login(email, password);
      if (!result.ok) {
        this.setError('login-error', result.error);
        return;
      }

      document.getElementById('form-login').reset();
      this.initApp();
    });

    // Ir para cadastro
    document.getElementById('go-register').addEventListener('click', (e) => {
      e.preventDefault();
      this.clearMessages('login-error');
      document.getElementById('form-login').reset();
      this.showScreen('register');
    });

    // Cadastro
    document.getElementById('form-register').addEventListener('submit', (e) => {
      e.preventDefault();
      this.clearMessages('register-error', 'register-success');

      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;
      const confirm = document.getElementById('reg-confirm').value;

      if (!email || !password || !confirm) {
        this.setError('register-error', 'Preencha todos os campos.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        this.setError('register-error', 'Informe um e-mail válido.');
        return;
      }
      if (password.length < 6) {
        this.setError('register-error', 'A senha deve ter no mínimo 6 caracteres.');
        return;
      }
      if (password !== confirm) {
        this.setError('register-error', 'As senhas não coincidem.');
        return;
      }

      const result = Auth.register(email, password);
      if (!result.ok) {
        this.setError('register-error', result.error);
        return;
      }

      document.getElementById('form-register').reset();
      document.getElementById('register-success').textContent =
        'Conta criada com sucesso! Faça login.';
      setTimeout(() => {
        this.clearMessages('register-success');
        this.showScreen('login');
      }, 1800);
    });

    // Ir para login (a partir do cadastro)
    document.getElementById('go-login').addEventListener('click', (e) => {
      e.preventDefault();
      this.clearMessages('register-error', 'register-success');
      document.getElementById('form-register').reset();
      this.showScreen('login');
    });

    // Logout
    document.getElementById('btn-logout').addEventListener('click', () => {
      Auth.logout();
      document.getElementById('form-login').reset();
      this.clearMessages('login-error');
      this.showScreen('login');
    });

    // Adicionar tarefa
    document.getElementById('form-add-task').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('task-input');
      const text = input.value.trim();
      if (!text) return;
      Tasks.add(text);
      input.value = '';
      this.renderTasks();
    });

    // Cliques na lista (delegação de eventos)
    document.getElementById('task-list').addEventListener('click', (e) => {
      const item = e.target.closest('.task-item');
      if (!item) return;
      const id = item.dataset.id;

      // Marcar/desmarcar
      if (e.target.classList.contains('task-checkbox')) {
        Tasks.toggle(id);
        this.renderTasks();
        return;
      }

      // Excluir
      if (e.target.classList.contains('btn-delete') || e.target.closest('.btn-delete')) {
        Tasks.remove(id);
        this.renderTasks();
      }
    });

    // Filtros
    document.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.currentFilter = btn.dataset.filter;
        document.querySelectorAll('.filter-btn').forEach((b) =>
          b.classList.remove('active')
        );
        btn.classList.add('active');
        this.renderTasks();
      });
    });
  },
};

// =============================================
// Inicialização
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  UI.bindEvents();

  if (Auth.getCurrentUser()) {
    UI.initApp();
  } else {
    UI.showScreen('login');
  }
});
