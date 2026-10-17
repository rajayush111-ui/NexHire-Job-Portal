/* ════════════════════════════════════════════════
     RECRUITER DASHBOARD SCRIPT
  ════════════════════════════════════════════════ */
  'use strict';

  /* ── helpers ── */
  const $ = id => document.getElementById(id);
  const stor = (k, fb = []) => { try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch { return fb; } };
  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  /* ── escape html ── */
  const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  /* ────────────────────────────────────────────
     TOAST
  ──────────────────────────────────────────── */
  function toast(type, title, msg) {
    const icons = { success:'✅', error:'❌', info:'ℹ️', warning:'⚠️' };
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<div class="toast-icon">${icons[type]||'ℹ️'}</div>
      <div class="toast-body"><strong>${esc(title)}</strong><span>${esc(msg)}</span></div>
      <button class="toast-close" aria-label="Close">✕</button>`;
    $('toastContainer').appendChild(t);
    t.querySelector('.toast-close').addEventListener('click', () => removeToast(t));
    setTimeout(() => removeToast(t), 4200);
  }
  function removeToast(t) {
    if (t.classList.contains('removing')) return;
    t.classList.add('removing');
    t.addEventListener('animationend', () => t.remove(), { once: true });
  }

  /* ────────────────────────────────────────────
     ACCENT POOL
  ──────────────────────────────────────────── */
  const ACCENTS = ['#6366f1','#f43f5e','#0ea5e9','#10b981','#a855f7','#f97316','#ec4899','#eab308','#06b6d4'];
  const accentFor = str => { let h=0; for (const c of String(str)) h=c.charCodeAt(0)+((h<<5)-h); return ACCENTS[Math.abs(h)%ACCENTS.length]; };

  /* ────────────────────────────────────────────
     TYPE BADGE CLASS
  ──────────────────────────────────────────── */
  function typeCls(t) {
    return ({ 'Full-time':'tc-full','Part-time':'tc-part','Remote':'tc-remote','Hybrid':'tc-hybrid','Contract':'tc-contract','Internship':'tc-intern' })[t] || 'tc-full';
  }

  /* ────────────────────────────────────────────
     DATE LABEL
  ──────────────────────────────────────────── */
  function dateLabel(iso) {
    if (!iso) return 'Just now';
    const diff = Math.floor((Date.now() - new Date(iso)) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 30)  return `${diff}d ago`;
    return new Date(iso).toLocaleDateString('en-US', { month:'short', day:'numeric' });
  }

  /* ────────────────────────────────────────────
     DUMMY METRICS
  ──────────────────────────────────────────── */
  function metricFor(id, key) {
    // stable fake numbers seeded from id
    const seed = (id % 997) + 1;
    const vals = { apps: 3 + (seed % 48), views: 40 + (seed % 430) };
    return vals[key];
  }

  /* ────────────────────────────────────────────
     SEED DEMO JOBS (first visit)
  ──────────────────────────────────────────── */
  function seedDemo() {
    if (localStorage.getItem('nx_jobs')) return;
    const demo = [
      { id:1001, title:'Senior Frontend Engineer',   company:'Vercel',       location:'Remote',            type:'Remote',    salary:'$130k–$170k /yr', tags:['React','TypeScript','Next.js'],      description:'Build the future of the web.',    postedAt: new Date(Date.now()-2*86400000).toISOString(), badge:'new',      emoji:'V', accent:'#6366f1', status:'Active' },
      { id:1002, title:'Product Designer',            company:'Figma',        location:'San Francisco, CA', type:'Hybrid',    salary:'$115k–$150k /yr', tags:['Figma','UX','Prototyping'],          description:'Design beautiful products at scale.', postedAt: new Date(Date.now()-5*86400000).toISOString(), badge:'featured', emoji:'F', accent:'#f43f5e', status:'Active' },
      { id:1003, title:'Backend Engineer — Go',       company:'PlanetScale',  location:'Remote',            type:'Remote',    salary:'$140k–$185k /yr', tags:['Go','MySQL','gRPC'],                 description:'Work on planet-scale databases.',  postedAt: new Date(Date.now()-1*86400000).toISOString(), badge:'new',      emoji:'P', accent:'#ec4899', status:'Active' },
      { id:1004, title:'DevOps Engineer',             company:'Cloudflare',   location:'Austin, TX',        type:'Full-time', salary:'$125k–$165k /yr', tags:['Kubernetes','Terraform','CI/CD'],    description:'Keep the internet running.',       postedAt: new Date(Date.now()-9*86400000).toISOString(), badge:'',         emoji:'C', accent:'#f97316', status:'Paused' },
      { id:1005, title:'Marketing Manager',           company:'HubSpot',      location:'Boston, MA',        type:'Hybrid',    salary:'$90k–$120k /yr',  tags:['SEO','Content','Analytics'],         description:'Grow the HubSpot brand.',          postedAt: new Date(Date.now()-14*86400000).toISOString(),badge:'',         emoji:'H', accent:'#0ea5e9', status:'Active' },
      { id:1006, title:'Data Scientist',              company:'Stripe',       location:'New York, NY',      type:'Full-time', salary:'$150k–$200k /yr', tags:['Python','ML','SQL'],                 description:'Turn data into insight.',           postedAt: new Date(Date.now()-3*86400000).toISOString(), badge:'new',      emoji:'S', accent:'#a855f7', status:'Active' },
    ];
    save('nx_jobs', demo);
  }

  /* ────────────────────────────────────────────
     STATE
  ──────────────────────────────────────────── */
  let allJobs    = [];
  let filtered   = [];
  let viewMode   = 'grid';    // 'grid' | 'list'
  let pendingDeleteId = null;

  /* ────────────────────────────────────────────
     LOAD & FILTER
  ──────────────────────────────────────────── */
  function loadJobs() {
    allJobs = stor('nx_jobs', []).map(j => ({
      status: 'Active',
      ...j,
      emoji:  j.emoji  || (j.company || 'J')[0].toUpperCase(),
      accent: j.accent || accentFor(j.company || ''),
    }));
  }

  function applyFilters() {
    const q    = $('rcSearch').value.trim().toLowerCase();
    const type = $('rcTypeFilter').value;
    const stat = $('rcStatusFilter').value;
    const sort = $('rcSort').value;

    filtered = allJobs.filter(j => {
      if (q    && !j.title.toLowerCase().includes(q) && !j.company.toLowerCase().includes(q)) return false;
      if (type && j.type !== type)   return false;
      if (stat && j.status !== stat) return false;
      return true;
    });

    switch (sort) {
      case 'newest': filtered.sort((a,b) => new Date(b.postedAt||0) - new Date(a.postedAt||0)); break;
      case 'oldest': filtered.sort((a,b) => new Date(a.postedAt||0) - new Date(b.postedAt||0)); break;
      case 'az':     filtered.sort((a,b) => a.title.localeCompare(b.title)); break;
      case 'apps':   filtered.sort((a,b) => metricFor(b.id,'apps') - metricFor(a.id,'apps')); break;
    }
  }

  /* ────────────────────────────────────────────
     RENDER STATS
  ──────────────────────────────────────────── */
  function renderStats() {
    const total  = allJobs.length;
    const active = allJobs.filter(j => j.status === 'Active').length;
    const apps   = allJobs.reduce((s, j) => s + metricFor(j.id, 'apps'),  0);
    const views  = allJobs.reduce((s, j) => s + metricFor(j.id, 'views'), 0);
    $('statTotal').textContent  = total;
    $('statActive').textContent = active;
    $('statApps').textContent   = apps;
    $('statViews').textContent  = views.toLocaleString();
    $('trendTotal').textContent = `${total} total`;
    $('trendActive').textContent= `${active} live`;
  }

  /* ────────────────────────────────────────────
     BUILD CARD HTML
  ──────────────────────────────────────────── */
  function buildCard(job, idx) {
    const accent  = job.accent || accentFor(job.company || '');
    const logo    = esc(job.emoji || (job.company || 'J')[0].toUpperCase());
    const tags    = Array.isArray(job.tags) ? job.tags : [];
    const apps    = metricFor(job.id, 'apps');
    const views   = metricFor(job.id, 'views');
    const statusCls = ({ Active:'s-active', Paused:'s-paused', Closed:'s-closed' })[job.status] || 's-active';

    const tagChips = tags.slice(0, 4).map(t =>
      `<span class="rc-chip">${esc(t)}</span>`).join('');

    return `
    <div class="rc-job-card" data-id="${job.id}" style="animation-delay:${idx*0.04}s">
      <div class="rc-card-stripe" style="background:${accent}"></div>
      <div class="rc-card-head">
        <div class="rc-card-logo" style="background:${accent}">${logo}</div>
        <div class="rc-card-meta">
          <div class="rc-card-company">${esc(job.company)}</div>
          <div class="rc-card-title">${esc(job.title)}</div>
        </div>
        <span class="rc-card-status ${statusCls}">${esc(job.status || 'Active')}</span>
      </div>

      <div class="rc-card-chips">
        <span class="rc-chip"><i class="fa-solid fa-location-dot"></i>${esc(job.location)}</span>
        <span class="type-chip ${typeCls(job.type)}">${esc(job.type)}</span>
        ${tagChips}
        ${job.salary ? `<span class="rc-chip"><i class="fa-solid fa-dollar-sign"></i>${esc(job.salary)}</span>` : ''}
      </div>

      <div class="rc-card-mini-stats">
        <div class="mini-stat"><strong>${apps}</strong><span>Applications</span></div>
        <div class="mini-stat"><strong>${views}</strong><span>Views</span></div>
        <div class="mini-stat"><strong>${esc(dateLabel(job.postedAt))}</strong><span>Posted</span></div>
      </div>

      <div class="rc-card-footer">
        <span class="rc-card-date"><i class="fa-regular fa-clock"></i>${esc(dateLabel(job.postedAt))}</span>
        <button class="rc-card-btn btn-view" data-id="${job.id}" data-action="view">
          <i class="fa-solid fa-eye"></i> View
        </button>
        <button class="rc-card-btn btn-edit" data-id="${job.id}" data-action="edit">
          <i class="fa-solid fa-pen"></i> Edit
        </button>
        <button class="rc-card-btn btn-delete" data-id="${job.id}" data-action="delete">
          <i class="fa-solid fa-trash"></i> Delete
        </button>
      </div>
    </div>`;
  }

  /* ────────────────────────────────────────────
     RENDER GRID
  ──────────────────────────────────────────── */
  function renderGrid() {
    const grid = $('rcJobsGrid');
    $('rcResultCount').innerHTML = `<strong>${filtered.length}</strong> job${filtered.length !== 1 ? 's' : ''}`;

    if (filtered.length === 0) {
      const hasAny = allJobs.length > 0;
      grid.innerHTML = `
        <div class="rc-empty" style="grid-column:1/-1">
          <div class="rc-empty-icon">${hasAny ? '🔍' : '📋'}</div>
          <h3>${hasAny ? 'No matches found' : 'No jobs posted yet'}</h3>
          <p>${hasAny ? 'Try adjusting your search or filters.' : 'Start posting jobs to attract top talent.'}</p>
          ${hasAny
            ? `<button class="rc-btn ghost" onclick="resetFilters()" style="margin-top:0"><i class="fa-solid fa-rotate-right"></i> Reset Filters</button>`
            : `<a href="post-job.html" class="rc-btn primary"><i class="fa-solid fa-plus"></i> Post a Job</a>`}
        </div>`;
      return;
    }

    grid.innerHTML = filtered.map((j, i) => buildCard(j, i)).join('');

    // Attach action listeners
    grid.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id     = +btn.dataset.id;
        const action = btn.dataset.action;
        if (action === 'edit')   openEditModal(id);
        if (action === 'delete') openConfirmModal(id);
        if (action === 'view')   handleView(id);
      });
    });
  }

  /* ────────────────────────────────────────────
     FULL RENDER CYCLE
  ──────────────────────────────────────────── */
  function render() {
    loadJobs();
    applyFilters();
    renderStats();
    renderGrid();
  }

  /* ────────────────────────────────────────────
     VIEW (open in new tab as JSON preview)
  ──────────────────────────────────────────── */
  function handleView(id) {
    const job = allJobs.find(j => j.id === id);
    if (!job) return;
    toast('info', 'Viewing listing', `"${job.title}" details loaded.`);
  }

  /* ────────────────────────────────────────────
     EDIT MODAL
  ──────────────────────────────────────────── */
  function openEditModal(id) {
    const job = allJobs.find(j => j.id === id);
    if (!job) return;
    $('editId').value       = job.id;
    $('editTitle').value    = job.title    || '';
    $('editCompany').value  = job.company  || '';
    $('editLocation').value = job.location || '';
    $('editType').value     = job.type     || 'Full-time';
    $('editSalary').value   = job.salary   || '';
    $('editStatus').value   = job.status   || 'Active';
    $('editTags').value     = Array.isArray(job.tags) ? job.tags.join(', ') : '';
    $('editDesc').value     = job.description || '';
    $('editModal').classList.add('open');
  }
  function closeEditModal() { $('editModal').classList.remove('open'); }

  $('editClose').addEventListener('click', closeEditModal);
  $('editCancelBtn').addEventListener('click', closeEditModal);
  $('editModal').addEventListener('click', e => { if (e.target === $('editModal')) closeEditModal(); });

  $('editSaveBtn').addEventListener('click', () => {
    const id   = +$('editId').value;
    const jobs = stor('nx_jobs', []);
    const idx  = jobs.findIndex(j => j.id === id);
    if (idx === -1) return;

    const title = $('editTitle').value.trim();
    if (!title) { toast('error','Validation','Job title is required.'); return; }

    jobs[idx] = {
      ...jobs[idx],
      title,
      company:     $('editCompany').value.trim(),
      location:    $('editLocation').value.trim(),
      type:        $('editType').value,
      salary:      $('editSalary').value.trim(),
      status:      $('editStatus').value,
      tags:        $('editTags').value.split(',').map(s => s.trim()).filter(Boolean),
      description: $('editDesc').value.trim(),
      updatedAt:   new Date().toISOString(),
    };
    save('nx_jobs', jobs);
    closeEditModal();
    render();
    toast('success', 'Saved!', `"${title}" has been updated.`);
  });

  /* ────────────────────────────────────────────
     DELETE — CONFIRM MODAL
  ──────────────────────────────────────────── */
  function openConfirmModal(id) {
    const job = allJobs.find(j => j.id === id);
    if (!job) return;
    pendingDeleteId = id;
    $('confirmText').textContent = `"${job.title}" at ${job.company} will be permanently removed.`;
    $('confirmModal').classList.add('open');
  }
  function closeConfirmModal() {
    $('confirmModal').classList.remove('open');
    pendingDeleteId = null;
  }

  $('confirmCancelBtn').addEventListener('click', closeConfirmModal);
  $('confirmModal').addEventListener('click', e => { if (e.target === $('confirmModal')) closeConfirmModal(); });

  $('confirmDeleteBtn').addEventListener('click', () => {
    if (pendingDeleteId === null) return;
    const id = pendingDeleteId;

    // Animate card out first
    const card = document.querySelector(`[data-id="${id}"]`);
    if (card) {
      card.classList.add('deleting');
      card.addEventListener('animationend', () => {
        deleteJob(id);
        closeConfirmModal();
      }, { once: true });
    } else {
      deleteJob(id);
      closeConfirmModal();
    }
  });

  function deleteJob(id) {
    const jobs = stor('nx_jobs', []).filter(j => j.id !== id);
    save('nx_jobs', jobs);
    render();
    toast('success', 'Job deleted', 'The listing has been removed successfully.');
  }

  /* ────────────────────────────────────────────
     SEARCH & FILTER EVENTS
  ──────────────────────────────────────────── */
  let searchTimer;
  $('rcSearch').addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(render, 180);
  });
  $('rcTypeFilter').addEventListener('change',   render);
  $('rcStatusFilter').addEventListener('change', render);
  $('rcSort').addEventListener('change',         render);

  window.resetFilters = function() {
    $('rcSearch').value       = '';
    $('rcTypeFilter').value   = '';
    $('rcStatusFilter').value = '';
    $('rcSort').value         = 'newest';
    render();
  };

  /* ────────────────────────────────────────────
     VIEW TOGGLE
  ──────────────────────────────────────────── */
  $('gridViewBtn').addEventListener('click', () => {
    viewMode = 'grid';
    $('rcJobsGrid').classList.remove('list-view');
    $('gridViewBtn').classList.add('active');
    $('listViewBtn').classList.remove('active');
  });
  $('listViewBtn').addEventListener('click', () => {
    viewMode = 'list';
    $('rcJobsGrid').classList.add('list-view');
    $('listViewBtn').classList.add('active');
    $('gridViewBtn').classList.remove('active');
  });

  /* ────────────────────────────────────────────
     REFRESH BUTTON
  ──────────────────────────────────────────── */
  $('refreshBtn').addEventListener('click', () => {
    const icon = $('refreshBtn').querySelector('i');
    icon.style.transition = 'transform .8s';
    icon.style.transform  = 'rotate(360deg)';
    setTimeout(() => { icon.style.transition = ''; icon.style.transform = ''; }, 800);
    render();
    toast('info', 'Refreshed', 'Dashboard data is up to date.');
  });

  /* ────────────────────────────────────────────
     INIT
  ──────────────────────────────────────────── */
  seedDemo();
  render();
  