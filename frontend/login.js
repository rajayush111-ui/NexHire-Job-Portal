/* ── Helpers ── */
  const $  = id => document.getElementById(id);
  const re = { email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ };
  const API_BASE = 'http://localhost:8080';

  /* ── Demo credentials (fills form only; sign-in uses real API) ── */
  const DEMO_USER = { name: 'Alex Johnson', email: 'demo@nexhire.com', password: 'demo123' };

  /* ── Fill demo credentials into login form ── */
  window.fillDemo = function() {
    $('loginEmail').value = DEMO_USER.email;
    $('loginPw').value    = DEMO_USER.password;
    markInput('loginEmail', 'success');
    markInput('loginPw',    'success');
    showToast('info', 'Demo credentials loaded', 'Click Sign In to continue.');
  };

  function setErr(id, msg) {
    const el = $(id);
    el.textContent = msg;
    el.className = 'field-msg ' + (msg ? 'err' : '');
  }
  function setOk(id, msg) {
    const el = $(id);
    el.textContent = msg;
    el.className = 'field-msg ok';
  }
  function markInput(id, state) {
    const el = $(id);
    el.classList.remove('error', 'success');
    if (state === 'error')   el.classList.add('error');
    if (state === 'success') el.classList.add('success');
  }

  /* ── Tab switching ── */
  window.switchTab = function(tab) {
    const loginForm  = $('loginForm');
    const signupForm = $('signupForm');
    const tabLogin   = $('tabLogin');
    const tabSignup  = $('tabSignup');

    if (tab === 'login') {
      loginForm.classList.add('active');
      signupForm.classList.remove('active');
      tabLogin.classList.add('active');
      tabLogin.setAttribute('aria-selected', 'true');
      tabSignup.classList.remove('active');
      tabSignup.setAttribute('aria-selected', 'false');
    } else {
      signupForm.classList.add('active');
      loginForm.classList.remove('active');
      tabSignup.classList.add('active');
      tabSignup.setAttribute('aria-selected', 'true');
      tabLogin.classList.remove('active');
      tabLogin.setAttribute('aria-selected', 'false');
    }
  };

  /* ── Password visibility toggle ── */
  document.querySelectorAll('.pw-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input  = $(btn.dataset.target);
      const isText = input.type === 'text';
      input.type   = isText ? 'password' : 'text';
      btn.querySelector('.eye-open').style.display   = isText ? 'block' : 'none';
      btn.querySelector('.eye-closed').style.display = isText ? 'none'  : 'block';
    });
  });

  /* ── Password strength ── */
  $('signupPw').addEventListener('input', function() {
    const v = this.value;
    const fill = $('strengthFill');
    let score = 0;
    if (v.length >= 6)  score++;
    if (v.length >= 10) score++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
    if (/\d/.test(v))   score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;

    const levels = [
      { w: '0%',   bg: 'transparent' },
      { w: '25%',  bg: '#f43f5e' },
      { w: '50%',  bg: '#f97316' },
      { w: '75%',  bg: '#eab308' },
      { w: '90%',  bg: '#22c55e' },
      { w: '100%', bg: '#10b981' },
    ];
    const l = levels[score] || levels[0];
    fill.style.width = l.w;
    fill.style.background = l.bg;
  });

  /* ── Toast ── */
  function showToast(type, title, msg) {
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const container = $('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || 'ℹ️'}</div>
      <div class="toast-body"><strong>${title}</strong><span>${msg}</span></div>
      <button class="toast-close" aria-label="Close">✕</button>`;

    container.appendChild(toast);
    toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));

    setTimeout(() => removeToast(toast), 4000);
  }
  function removeToast(toast) {
    if (toast.classList.contains('removing')) return;
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }

 /* ── LOGIN FORM (simulated — no backend) ── */
$('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = $('loginEmail').value.trim();
  const pw    = $('loginPw').value;
  let valid   = true;

  // Reset
  ['loginEmail','loginPw'].forEach(id => markInput(id, ''));
  setErr('loginEmailErr', '');
  setErr('loginPwErr', '');

  if (!email) {
    setErr('loginEmailErr', 'Email is required.');
    markInput('loginEmail', 'error');
    valid = false;
  } else if (!re.email.test(email)) {
    setErr('loginEmailErr', 'Please enter a valid email address.');
    markInput('loginEmail', 'error');
    valid = false;
  }

  if (!pw) {
    setErr('loginPwErr', 'Password is required.');
    markInput('loginPw', 'error');
    valid = false;
  } else if (pw.length < 6) {
    setErr('loginPwErr', 'Password must be at least 6 characters.');
    markInput('loginPw', 'error');
    valid = false;
  }

  if (!valid) return;

  const btn = $('loginBtn');
  btn.textContent = 'Signing in…';
  btn.classList.add('loading');

  // ── Simulated login (no backend) ──
  setTimeout(() => {
    btn.textContent = 'Sign In';
    btn.classList.remove('loading');

    // Hardcoded demo user
    const demoUser = {
      name:     'Ayush Raj',
      username: 'ayush123',
      email:    'ayush@gmail.com',
    };

    // Store dummy session in localStorage
    localStorage.setItem('token', 'dummy');
    localStorage.setItem('nx_session', JSON.stringify({
      email: demoUser.email,
      name:  demoUser.name,
      token: 'dummy',
    }));
    localStorage.setItem('user', JSON.stringify(demoUser));

    markInput('loginEmail', 'success');
    markInput('loginPw',    'success');

    // Show popup alert then redirect
    alert('Login Successful ✅');
    window.location.href = 'dashboard.html';
  }, 800);
});
 /* ── SIGNUP FORM ── */
$('signupForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const name  = $('signupName').value.trim();
  const email = $('signupEmail').value.trim();
  const pw    = $('signupPw').value;
  const pwc   = $('signupPwC').value;
  let valid   = true;

  // Reset
  ['signupName','signupEmail','signupPw','signupPwC'].forEach(id => markInput(id, ''));
  ['signupNameErr','signupEmailErr','signupPwErr','signupPwCErr'].forEach(id => setErr(id, ''));

  // Name validation
  if (!name) {
    setErr('signupNameErr', 'Full name is required.');
    markInput('signupName', 'error');
    valid = false;
  } else if (name.length < 2) {
    setErr('signupNameErr', 'Name must be at least 2 characters.');
    markInput('signupName', 'error');
    valid = false;
  } else {
    markInput('signupName', 'success');
  }

  // Email validation
  if (!email) {
    setErr('signupEmailErr', 'Email is required.');
    markInput('signupEmail', 'error');
    valid = false;
  } else if (!re.email.test(email)) {
    setErr('signupEmailErr', 'Please enter a valid email address.');
    markInput('signupEmail', 'error');
    valid = false;
  } else {
    markInput('signupEmail', 'success');
  }

  // Password
  if (!pw) {
    setErr('signupPwErr', 'Password is required.');
    markInput('signupPw', 'error');
    valid = false;
  } else if (pw.length < 6) {
    setErr('signupPwErr', 'Password must be at least 6 characters.');
    markInput('signupPw', 'error');
    valid = false;
  } else {
    markInput('signupPw', 'success');
  }

  // Confirm
  if (!pwc) {
    setErr('signupPwCErr', 'Please confirm your password.');
    markInput('signupPwC', 'error');
    valid = false;
  } else if (pw !== pwc) {
    setErr('signupPwCErr', 'Passwords do not match.');
    markInput('signupPwC', 'error');
    valid = false;
  } else {
    markInput('signupPwC', 'success');
  }

  if (!valid) return;

  const btn = $('signupBtn');
  btn.textContent = 'Creating account…';
  btn.classList.add('loading');

  // ── Simulated signup (no backend) ──
  setTimeout(() => {
    btn.textContent = 'Create Account';
    btn.classList.remove('loading');

    showToast('success', 'Account created!', `Welcome ${name}! You can sign in now.`);
    setTimeout(() => {
      switchTab('login');
      $('loginEmail').value = email;
      $('loginPw').value = '';
      markInput('loginEmail', '');
      markInput('loginPw', '');
    }, 800);
  }, 800);
});