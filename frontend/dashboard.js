/* ── Helpers ── */
  const $    = id => document.getElementById(id);
  const stor = key => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };

  /* ── Toast ── */
  function showToast(type, title, msg) {
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `
      <div class="toast-icon">${icons[type]||'ℹ️'}</div>
      <div class="toast-body"><strong>${title}</strong><span>${msg}</span></div>
      <button class="toast-close" aria-label="Close">✕</button>`;
    $('toastContainer').appendChild(t);
    t.querySelector('.toast-close').addEventListener('click', () => removeToast(t));
    setTimeout(() => removeToast(t), 4000);
  }
  function removeToast(t) {
    if (t.classList.contains('removing')) return;
    t.classList.add('removing');
    t.addEventListener('animationend', () => t.remove(), { once: true });
  }

  /* ── Logout ── */
  function logout() {
    localStorage.removeItem('nx_session');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showToast('info', 'Logged out', 'See you next time!');
    setTimeout(() => { window.location.href = 'login.html'; }, 1200);
  }
  $('logoutBtnTop').addEventListener('click', logout);
  $('logoutBtnSide').addEventListener('click', logout);

  /* ── Scroll to section ── */
  window.scrollTo = function(id) {
    const el = $(id);
    if (!el) return;
    const offset = 90;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });

    // Update sidenav active
    document.querySelectorAll('.sidenav-item').forEach(b => b.classList.remove('active'));
    event.currentTarget.classList.add('active');
  };

  /* ── Avatar initials ── */
  function initials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }

  /* ── Accent color pool ── */
  const ACCENTS = [
    '#6366f1','#f43f5e','#0ea5e9','#10b981','#a855f7',
    '#f97316','#ec4899','#eab308','#64748b','#06b6d4',
  ];
  function accentFor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return ACCENTS[Math.abs(hash) % ACCENTS.length];
  }

  /* ── Build job list item ── */
  function buildJobItem(job, statusClass, statusLabel, removable, storageKey) {
    const accent = accentFor(job.company || job.title || 'J');
    const initial = (job.company || job.title || 'J')[0].toUpperCase();
    const location = job.location ? `<span class="jli-location"><i class="fa-solid fa-location-dot" style="font-size:.6rem"></i> ${job.location}</span>` : '';
    const removeBtn = removable
      ? `<button class="jli-remove-btn" title="Remove" data-key="${storageKey}" data-id="${job.id}"><i class="fa-solid fa-xmark"></i></button>`
      : '';
    return `
      <div class="job-list-item" id="jli-${storageKey}-${job.id}">
        <div class="jli-logo" style="background:${accent}">${initial}</div>
        <div class="jli-info">
          <div class="jli-title">${job.title}</div>
          <div class="jli-company">${job.company}</div>
        </div>
        <div class="jli-meta">
          ${location}
          <span class="status-badge ${statusClass}">${statusLabel}</span>
          ${removeBtn}
        </div>
      </div>`;
  }

  /* ── Render applied jobs ── */
  function renderApplied() {
    const applied = stor('nx_applied') || [];
    $('appliedCount').textContent = applied.length;
    $('statApplied').textContent  = applied.length;
    $('metaApplied').textContent  = applied.length;

    if (applied.length === 0) {
      $('appliedList').innerHTML = `
        <div class="db-empty">
          <div class="db-empty-icon">📋</div>
          <h4>No applications yet</h4>
          <p>Start applying to jobs and they'll appear here.</p>
          <a href="jobs.html" class="cta-primary">Browse Jobs</a>
        </div>`;
    } else {
      $('appliedList').innerHTML = `<div class="job-list">${
        applied.map(j => buildJobItem(j, 'status-applied', 'Applied', true, 'nx_applied')).join('')
      }</div>`;
    }

    // Remove buttons
    $('appliedList').querySelectorAll('.jli-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => removeItem('nx_applied', btn.dataset.id, renderApplied));
    });

    updateCompletion();
  }

  /* ── Render saved jobs ── */
  function renderSaved() {
    const saved = stor('nx_saved') || [];
    $('savedCount').textContent = saved.length;
    $('statSaved').textContent  = saved.length;
    $('metaSaved').textContent  = saved.length;

    if (saved.length === 0) {
      $('savedList').innerHTML = `
        <div class="db-empty">
          <div class="db-empty-icon">🔖</div>
          <h4>No saved jobs</h4>
          <p>Bookmark jobs on the Jobs page to see them here.</p>
          <a href="jobs.html" class="cta-primary">Find Jobs</a>
        </div>`;
    } else {
      $('savedList').innerHTML = `<div class="job-list">${
        saved.map(j => buildJobItem(j, 'status-saved', 'Saved', true, 'nx_saved')).join('')
      }</div>`;
    }

    $('savedList').querySelectorAll('.jli-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => removeItem('nx_saved', btn.dataset.id, renderSaved));
    });

    updateCompletion();
  }

  /* ── Remove item from a localStorage list ── */
  function removeItem(key, id, cb) {
    let list = stor(key) || [];
    list = list.filter(j => String(j.id) !== String(id));
    localStorage.setItem(key, JSON.stringify(list));
    showToast('info', 'Removed', 'Item removed from your list.');
    cb();
    renderActivity();
  }

  /* ── Viewed count (persisted) ── */
  function bumpViewed() {
    let v = parseInt(localStorage.getItem('nx_viewed') || '0', 10);
    // Simulate growing number based on session age
    v = v || Math.floor(Math.random() * 20) + 5;
    localStorage.setItem('nx_viewed', v);
    return v;
  }

  /* ── Activity feed ── */
  function renderActivity() {
    const applied = stor('nx_applied') || [];
    const saved   = stor('nx_saved')   || [];
    const events  = [];

    applied.slice(-3).reverse().forEach(j => {
      events.push({ icon: 'fa-paper-plane', cls: 'act-purple', text: `Applied to <strong>${j.title}</strong> at ${j.company}`, time: 'Recently' });
    });
    saved.slice(-2).reverse().forEach(j => {
      events.push({ icon: 'fa-bookmark', cls: 'act-sky', text: `Saved <strong>${j.title}</strong> at ${j.company}`, time: 'Recently' });
    });

    // Always pad with some static activity
    events.push({ icon: 'fa-right-to-bracket', cls: 'act-green', text: 'Logged into NexHire', time: 'Just now' });
    events.push({ icon: 'fa-magnifying-glass', cls: 'act-rose',  text: 'Browsed the Jobs page', time: 'Earlier today' });

    $('activityList').innerHTML = events.slice(0, 6).map(e => `
      <div class="activity-item">
        <div class="activity-dot ${e.cls}"><i class="fa-solid ${e.icon}"></i></div>
        <div class="activity-body">
          <p>${e.text}</p>
          <span><i class="fa-regular fa-clock" style="font-size:.6rem"></i> ${e.time}</span>
        </div>
      </div>`).join('');
  }

  /* ── Profile completion ── */
  function updateCompletion() {
    const applied = (stor('nx_applied') || []).length;
    const saved   = (stor('nx_saved')   || []).length;
    let pct = 40; // account + email
    if (applied > 0) { pct += 20; $('pcApplied').classList.add('done'); $('pcApplied').querySelector('i').className = 'fa-solid fa-check'; }
    if (saved   > 0) { pct += 20; $('pcSaved').classList.add('done');   $('pcSaved').querySelector('i').className   = 'fa-solid fa-check'; }
    // profile info step always pending (no profile edit page yet)
    $('pcPercent').textContent = pct + '%';
    $('pcFill').style.width    = pct + '%';
  }

  /* ── Date greeting ── */
  function setGreetDate() {
    const now = new Date();
    const opts = { weekday:'long', month:'long', day:'numeric', year:'numeric' };
    $('greetDate').textContent = now.toLocaleDateString('en-US', opts);
  }

  /* ── Refresh button ── */
  $('refreshBtn').addEventListener('click', () => {
    $('refreshBtn').querySelector('i').style.animation = 'spin 1s linear';
    renderApplied();
    renderSaved();
    renderActivity();
    showToast('success', 'Refreshed', 'Dashboard data is up to date.');
    setTimeout(() => { $('refreshBtn').querySelector('i').style.animation = ''; }, 1000);
  });

  /* ── Seed demo data (only if localStorage is empty) ── */
  function seedDemoData() {
    if (!localStorage.getItem('nx_applied')) {
      const demo = [
        { id: 101, title: 'Senior Product Designer',     company: 'Airbnb',      location: 'San Francisco, CA', type: 'Remote' },
        { id: 102, title: 'Software Engineer II',         company: 'Netflix',     location: 'Los Gatos, CA',     type: 'Hybrid' },
        { id: 103, title: 'Machine Learning Engineer',    company: 'OpenAI',      location: 'San Francisco, CA', type: 'Full-time' },
      ];
      localStorage.setItem('nx_applied', JSON.stringify(demo));
    }
    if (!localStorage.getItem('nx_saved')) {
      const demo = [
        { id: 201, title: 'Frontend Developer',          company: 'Vercel',      location: 'Remote',            type: 'Remote' },
        { id: 202, title: 'Growth Marketing Manager',    company: 'Shopify',     location: 'Ottawa, Canada',    type: 'Remote' },
      ];
      localStorage.setItem('nx_saved', JSON.stringify(demo));
    }
  }

  function showGuest() {
    document.getElementById('guestWall').hidden = false;
    document.getElementById('dbPage').hidden = true;
  }

  function showDashboard(session) {
    document.getElementById('dbPage').hidden = false;

    // Always use hardcoded demo user data for display
    const name  = 'Ayush Raj';
    const email = 'ayush@gmail.com';
    const first = 'Ayush';

    $('greetName').textContent  = first;
    $('profileName').textContent  = name;
    $('profileEmail').textContent = email;
    $('profileAvatar').textContent = initials(name);

    setGreetDate();

    const viewed = bumpViewed();
    $('statViewed').textContent = viewed;
    $('metaViewed').textContent = viewed;

    seedDemoData();
    renderApplied();
    renderSaved();
    renderActivity();
    updateCompletion();
  }

  /* ══ INIT (no auth check — always show dashboard with hardcoded user) ══ */
  (function init() {
    const DEMO_USER = {
      name:  'Ayush Raj',
      username: 'ayush123',
      email: 'ayush@gmail.com',
      token: 'dummy',
    };

    // Ensure localStorage always has a valid session so other features work
    if (!localStorage.getItem('nx_session')) {
      localStorage.setItem('nx_session', JSON.stringify({
        email: DEMO_USER.email,
        name:  DEMO_USER.name,
        token: DEMO_USER.token,
      }));
    }
    if (!localStorage.getItem('token')) {
      localStorage.setItem('token', 'dummy');
    }

    showDashboard(DEMO_USER);
  })();
