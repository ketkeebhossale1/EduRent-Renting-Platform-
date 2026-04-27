const API = '/api';

// ─── PASSWORD RULES ───────────────────────────────────────
const PWD_RULES = {
  len:     { re: /.{8,}/,                           id: 'req-len',     label: 'At least 8 characters' },
  upper:   { re: /[A-Z]/,                            id: 'req-upper',   label: 'Uppercase letter' },
  lower:   { re: /[a-z]/,                            id: 'req-lower',   label: 'Lowercase letter' },
  digit:   { re: /[0-9]/,                            id: 'req-digit',   label: 'Number' },
  special: { re: /[@$!%*?&^#()\-_=+[\]{};:'",.<>/\\|`~]/, id: 'req-special', label: 'Special character' },
};

function checkPasswordStrength(value) {
  let allPass = true;
  for (const key of Object.keys(PWD_RULES)) {
    const rule = PWD_RULES[key];
    const passes = rule.re.test(value);
    const el = document.getElementById(rule.id);
    if (!el) continue;
    if (passes) {
      el.textContent = `✓ ${rule.label}`;
      el.classList.add('pass');
      el.classList.remove('fail');
    } else {
      el.textContent = `✗ ${rule.label}`;
      el.classList.remove('pass');
      el.classList.add('fail');
      allPass = false;
    }
  }
  return allPass && value.length > 0;
}

function validatePassword(password) {
  return Object.values(PWD_RULES).every(r => r.re.test(password));
}

// ─── STATE ───────────────────────────────────────────────
let token = localStorage.getItem('bm_token') || null;
let currentUser = JSON.parse(localStorage.getItem('bm_user') || 'null');

// ─── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (token && currentUser) {
    enterDashboard();
  } else {
    showView('login');
  }
});

// ─── VIEW ROUTER ─────────────────────────────────────────
function showView(name) {
  document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'));
  const el = document.getElementById(`view-${name}`);
  if (el) el.classList.remove('hidden');
  clearAlert();
  clearAllFieldErrors();
}

function enterDashboard() {
  document.getElementById('nav-auth').classList.add('hidden');
  document.getElementById('nav-user').classList.remove('hidden');
  document.getElementById('nav-email').textContent = currentUser.email;
  showView('books');
  loadBooks();
}

function logout() {
  token = null;
  currentUser = null;
  localStorage.removeItem('bm_token');
  localStorage.removeItem('bm_user');
  document.getElementById('nav-auth').classList.remove('hidden');
  document.getElementById('nav-user').classList.add('hidden');
  showView('login');
  showAlert('You have been logged out.', 'success');
}

// ─── ALERT ───────────────────────────────────────────────
function showAlert(message, type = 'error') {
  const el = document.getElementById('alert');
  el.textContent = message;
  el.className = type;
  el.classList.remove('hidden');
  clearTimeout(window._alertTimer);
  window._alertTimer = setTimeout(clearAlert, 6000);
}

function clearAlert() {
  const el = document.getElementById('alert');
  el.className = 'hidden';
  el.textContent = '';
}

// ─── FIELD ERRORS ────────────────────────────────────────
function showFieldError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
}

function clearFieldError(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = '';
  el.classList.add('hidden');
}

function clearAllFieldErrors() {
  document.querySelectorAll('.field-error').forEach(el => {
    el.textContent = '';
    el.classList.add('hidden');
  });
}

// ─── AUTH ─────────────────────────────────────────────────
async function handleSignup(e) {
  e.preventDefault();
  clearAllFieldErrors();
  clearAlert();

  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;

  let valid = true;

  // Email validation
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    showFieldError('email-error', 'Email is required.');
    valid = false;
  } else if (!emailRe.test(email)) {
    showFieldError('email-error', 'Enter a valid email address (e.g. you@example.com).');
    valid = false;
  }

  // Password validation
  if (!password) {
    showAlert('Password is required.');
    valid = false;
  } else if (!validatePassword(password)) {
    showAlert('Password does not meet all requirements. Check the checklist below the password field.');
    checkPasswordStrength(password); // highlight failing items
    valid = false;
  }

  // Confirm password
  if (!confirm) {
    showFieldError('confirm-error', 'Please confirm your password.');
    valid = false;
  } else if (password && confirm !== password) {
    showFieldError('confirm-error', 'Passwords do not match.');
    valid = false;
  }

  if (!valid) return;

  try {
    const res = await apiFetch('/signup', 'POST', { email, password });
    const data = await res.json();

    if (!res.ok) {
      if (res.status === 409) {
        showFieldError('email-error', 'This email is already registered. Try logging in instead.');
      } else {
        showAlert(data.error || 'Signup failed. Please try again.');
      }
      return;
    }

    persistAuth(data.token, data.user);
    showAlert('Account created! Welcome.', 'success');
    enterDashboard();
    document.getElementById('form-signup').reset();
    // Reset strength indicators
    Object.values(PWD_RULES).forEach(r => {
      const el = document.getElementById(r.id);
      if (el) { el.textContent = `○ ${r.label}`; el.className = 'req-item'; }
    });
  } catch {
    showAlert('Network error. Is the server running?');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  clearAllFieldErrors();
  clearAlert();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    showAlert('Email and password are required.');
    return;
  }

  try {
    const res = await apiFetch('/login', 'POST', { email, password });
    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401) {
        showAlert('Incorrect email or password. Please try again.');
      } else {
        showAlert(data.error || 'Login failed.');
      }
      return;
    }

    persistAuth(data.token, data.user);
    showAlert('Login successful!', 'success');
    enterDashboard();
    document.getElementById('form-login').reset();
  } catch {
    showAlert('Network error. Is the server running?');
  }
}

function persistAuth(t, user) {
  token = t;
  currentUser = user;
  localStorage.setItem('bm_token', t);
  localStorage.setItem('bm_user', JSON.stringify(user));
}

// ─── BOOKS ────────────────────────────────────────────────
async function handleAddBook(e) {
  e.preventDefault();
  clearAllFieldErrors();
  clearAlert();

  const title = document.getElementById('book-title').value.trim();
  const author = document.getElementById('book-author').value.trim();
  const genre = document.getElementById('book-genre').value.trim();
  const description = document.getElementById('book-description').value.trim();

  let valid = true;

  if (!title) {
    showFieldError('title-error', 'Book title is required.');
    valid = false;
  }

  if (!author) {
    showFieldError('author-error', 'Author name is required.');
    valid = false;
  }

  if (!genre) {
    showFieldError('genre-error', 'Please select a genre.');
    valid = false;
  }

  if (!description) {
    showFieldError('desc-error', 'Description is required.');
    valid = false;
  } else if (description.length < 20) {
    showFieldError('desc-error', 'Description must be at least 20 characters.');
    valid = false;
  }

  if (!valid) return;

  try {
    const res = await apiFetch('/books', 'POST', { title, author, genre, description }, true);
    const data = await res.json();

    if (!res.ok) {
      showAlert(data.error || 'Failed to add book.');
      return;
    }

    showAlert('Book added successfully!', 'success');
    document.getElementById('form-book').reset();
    loadBooks();
  } catch {
    showAlert('Network error. Is the server running?');
  }
}

async function loadBooks() {
  const author = document.getElementById('filter-author')?.value.trim() || '';
  const genre = document.getElementById('filter-genre')?.value.trim() || '';

  const params = new URLSearchParams();
  if (author) params.set('author', author);
  if (genre) params.set('genre', genre);

  const query = params.toString() ? `?${params}` : '';

  try {
    const res = await fetch(`${API}/books${query}`);
    const data = await res.json();

    if (!res.ok) return showAlert(data.error || 'Failed to load books.');

    renderBooks(data.books, data.count);
  } catch {
    showAlert('Network error. Is the server running?');
  }
}

function clearFilters() {
  document.getElementById('filter-author').value = '';
  document.getElementById('filter-genre').value = '';
  loadBooks();
}

// ─── RENDER: grouped by author ────────────────────────────
function renderBooks(books, count) {
  const countEl = document.getElementById('books-count');
  const listEl = document.getElementById('books-list');

  countEl.textContent = `${count} book${count !== 1 ? 's' : ''} found`;

  if (!books.length) {
    listEl.innerHTML = '<div class="empty-state">No books found. Add one above or clear the filters.</div>';
    return;
  }

  // Group books by author (preserve insertion order, sorted alphabetically)
  const byAuthor = {};
  for (const book of books) {
    const key = book.author;
    if (!byAuthor[key]) byAuthor[key] = [];
    byAuthor[key].push(book);
  }

  const sortedAuthors = Object.keys(byAuthor).sort((a, b) => a.localeCompare(b));

  const sections = sortedAuthors.map(author => {
    const authorBooks = byAuthor[author];
    const cards = authorBooks.map(bookCard).join('');
    return `
      <div class="author-section">
        <div class="author-header">
          <span class="author-icon">&#128218;</span>
          <h3>${escHtml(author)}</h3>
          <span class="author-count">${authorBooks.length} book${authorBooks.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="book-grid">${cards}</div>
      </div>`;
  }).join('');

  listEl.innerHTML = sections;
}

function bookCard(b) {
  const date = new Date(b.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const desc = b.description.length > 140 ? b.description.slice(0, 137) + '…' : b.description;
  return `
    <div class="book-card">
      <div class="book-genre-tag">${escHtml(b.genre)}</div>
      <h3>${escHtml(b.title)}</h3>
      <p class="book-desc">${escHtml(desc)}</p>
      <p class="book-footer">Added ${date} by ${escHtml(b.added_by)}</p>
    </div>`;
}

// ─── HELPERS ─────────────────────────────────────────────
function apiFetch(path, method, body, auth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(`${API}${path}`, { method, headers, body: JSON.stringify(body) });
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
