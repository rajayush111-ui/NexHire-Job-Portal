/* ── jobs.js — NexHire Jobs Page ── */

/* ── localStorage helpers ── */
function getSaved()   { try { return JSON.parse(localStorage.getItem('nx_saved'))   || []; } catch { return []; } }
function getApplied() { try { return JSON.parse(localStorage.getItem('nx_applied')) || []; } catch { return []; } }

function saveJob(job) {
  const list = getSaved();
  if (!list.some(j => j.id === job.id)) {
    list.push({ id: job.id, title: job.title, company: job.company, location: job.location, type: job.type });
    localStorage.setItem('nx_saved', JSON.stringify(list));
  }
}
function removeSaved(id) {
  const list = getSaved().filter(j => j.id !== id);
  localStorage.setItem('nx_saved', JSON.stringify(list));
}
function applyJob(job) {
  const list = getApplied();
  if (!list.some(j => j.id === job.id)) {
    list.push({ id: job.id, title: job.title, company: job.company, location: job.location, type: job.type });
    localStorage.setItem('nx_applied', JSON.stringify(list));
  }
}

/* ── Inline toast for jobs page ── */
function showJobToast(type, title, msg) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  let container = document.getElementById('jobToastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'jobToastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<div class="toast-icon">${icons[type]||'ℹ️'}</div>
    <div class="toast-body"><strong>${title}</strong><span>${msg}</span></div>
    <button class="toast-close">✕</button>`;
  container.appendChild(t);
  t.querySelector('.toast-close').addEventListener('click', () => {
    t.classList.add('removing');
    t.addEventListener('animationend', () => t.remove(), { once: true });
  });
  setTimeout(() => {
    t.classList.add('removing');
    t.addEventListener('animationend', () => t.remove(), { once: true });
  }, 3500);
}





/* ═══════════════════════════════════════════════════
   1.  JOB DATA
   ═══════════════════════════════════════════════════ */
const JOBS = [
  {
    id: 1, title: 'Senior Product Designer',
    company: 'Airbnb', location: 'San Francisco, CA',
    type: 'Remote', salary: '$120k–$160k',
    tags: ['Figma', 'UX Research', 'Design Systems'],
    accent: '#6366f1', emoji: 'A', badge: 'new', daysAgo: 1,
  },
  {
    id: 2, title: 'Software Engineer II — Platform',
    company: 'Netflix', location: 'Los Gatos, CA',
    type: 'Hybrid', salary: '$180k–$240k',
    tags: ['Java', 'AWS', 'Distributed Systems'],
    accent: '#f43f5e', emoji: 'N', badge: 'featured', daysAgo: 2,
  },
  {
    id: 3, title: 'Growth Marketing Manager',
    company: 'Shopify', location: 'Ottawa, Canada',
    type: 'Remote', salary: '$95k–$130k',
    tags: ['SEO', 'Analytics', 'Paid Ads'],
    accent: '#0ea5e9', emoji: 'S', badge: '', daysAgo: 3,
  },
  {
    id: 4, title: 'Data Scientist',
    company: 'Stripe', location: 'New York, NY',
    type: 'Full-time', salary: '$140k–$190k',
    tags: ['Python', 'ML', 'SQL'],
    accent: '#a855f7', emoji: 'S', badge: 'new', daysAgo: 1,
  },
  {
    id: 5, title: 'iOS Engineer',
    company: 'Apple', location: 'Cupertino, CA',
    type: 'Full-time', salary: '$160k–$210k',
    tags: ['Swift', 'SwiftUI', 'Xcode'],
    accent: '#64748b', emoji: 'A', badge: '', daysAgo: 4,
  },
  {
    id: 6, title: 'DevOps Engineer',
    company: 'Cloudflare', location: 'Austin, TX',
    type: 'Remote', salary: '$130k–$175k',
    tags: ['Kubernetes', 'Terraform', 'CI/CD'],
    accent: '#f97316', emoji: 'C', badge: '', daysAgo: 5,
  },
  {
    id: 7, title: 'Frontend Developer',
    company: 'Vercel', location: 'Remote',
    type: 'Remote', salary: '$110k–$150k',
    tags: ['React', 'TypeScript', 'Next.js'],
    accent: '#e2e8f0', emoji: 'V', badge: 'new', daysAgo: 0,
  },
  {
    id: 8, title: 'Product Manager',
    company: 'Notion', location: 'San Francisco, CA',
    type: 'Hybrid', salary: '$135k–$180k',
    tags: ['Roadmapping', 'Agile', 'SQL'],
    accent: '#10b981', emoji: 'N', badge: '', daysAgo: 6,
  },
  {
    id: 9, title: 'Backend Engineer — Golang',
    company: 'PlanetScale', location: 'Remote',
    type: 'Remote', salary: '$145k–$185k',
    tags: ['Go', 'MySQL', 'gRPC'],
    accent: '#ec4899', emoji: 'P', badge: 'featured', daysAgo: 2,
  },
  {
    id: 10, title: 'UX Researcher',
    company: 'Figma', location: 'New York, NY',
    type: 'Full-time', salary: '$105k–$140k',
    tags: ['User Testing', 'Qualitative Research', 'Figma'],
    accent: '#f43f5e', emoji: 'F', badge: '', daysAgo: 7,
  },
  {
    id: 11, title: 'Machine Learning Engineer',
    company: 'OpenAI', location: 'San Francisco, CA',
    type: 'Full-time', salary: '$200k–$300k',
    tags: ['PyTorch', 'LLMs', 'Python'],
    accent: '#0ea5e9', emoji: 'O', badge: 'featured', daysAgo: 1,
  },
  {
    id: 12, title: 'Marketing Intern',
    company: 'HubSpot', location: 'Boston, MA',
    type: 'Internship', salary: '$22–$28/hr',
    tags: ['Content', 'Social Media', 'HubSpot CRM'],
    accent: '#f97316', emoji: 'H', badge: '', daysAgo: 3,
  },
  {
    id: 13, title: 'Site Reliability Engineer',
    company: 'Datadog', location: 'New York, NY',
    type: 'Hybrid', salary: '$155k–$200k',
    tags: ['Prometheus', 'Go', 'Linux'],
    accent: '#a855f7', emoji: 'D', badge: '', daysAgo: 5,
  },
  {
    id: 14, title: 'Technical Writer',
    company: 'HashiCorp', location: 'Remote',
    type: 'Contract', salary: '$70–$90/hr',
    tags: ['Markdown', 'API Docs', 'Git'],
    accent: '#6366f1', emoji: 'H', badge: '', daysAgo: 8,
  },
  {
    id: 15, title: 'Android Developer',
    company: 'Spotify', location: 'Stockholm, Sweden',
    type: 'Full-time', salary: '€80k–€110k',
    tags: ['Kotlin', 'Jetpack Compose', 'Coroutines'],
    accent: '#10b981', emoji: 'S', badge: 'new', daysAgo: 2,
  },
  {
    id: 16, title: 'Cloud Architect',
    company: 'Microsoft', location: 'Seattle, WA',
    type: 'Full-time', salary: '$175k–$230k',
    tags: ['Azure', 'Terraform', 'Microservices'],
    accent: '#0ea5e9', emoji: 'M', badge: '', daysAgo: 4,
  },
  {
    id: 17, title: 'Brand Designer',
    company: 'Linear', location: 'Remote',
    type: 'Part-time', salary: '$60–$80/hr',
    tags: ['Branding', 'Motion', 'Figma'],
    accent: '#ec4899', emoji: 'L', badge: 'new', daysAgo: 1,
  },
  {
    id: 18, title: 'Finance Analyst',
    company: 'Robinhood', location: 'Menlo Park, CA',
    type: 'Full-time', salary: '$90k–$120k',
    tags: ['Excel', 'Financial Modeling', 'SQL'],
    accent: '#10b981', emoji: 'R', badge: '', daysAgo: 9,
  },
];

/* ═══════════════════════════════════════════════════
   2.  STATE
   ═══════════════════════════════════════════════════ */
const state = {
  search:   '',
  location: '',
  type:     '',
  sort:     'newest',
  view:     'grid',   // 'grid' | 'list'
};

/* ═══════════════════════════════════════════════════
   3.  HELPERS
   ═══════════════════════════════════════════════════ */
function typeClass(type) {
  const map = {
    'Full-time': 'type-full',
    'Part-time':  'type-part',
    'Remote':     'type-remote',
    'Hybrid':     'type-hybrid',
    'Contract':   'type-contract',
    'Internship': 'type-intern',
  };
  return map[type] || 'type-full';
}

function daysLabel(n) {
  if (n === 0) return 'Today';
  if (n === 1) return 'Yesterday';
  return `${n}d ago`;
}

function logoStyle(accent) {
  return `background:${accent};`;
}

/* ═══════════════════════════════════════════════════
   4.  FILTER & SORT
   ═══════════════════════════════════════════════════ */
function applyFilters() {
  let list = [...JOBS];
  const q = state.search.trim().toLowerCase();

  if (q) {
    list = list.filter(j =>
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.tags.some(t => t.toLowerCase().includes(q))
    );
  }
  if (state.location) {
    list = list.filter(j => j.location === state.location);
  }
  if (state.type) {
    list = list.filter(j => j.type === state.type);
  }

  switch (state.sort) {
    case 'newest':    list.sort((a, b) => a.daysAgo - b.daysAgo);   break;
    case 'salary-hi': list.sort((a, b) => salaryNum(b) - salaryNum(a)); break;
    case 'salary-lo': list.sort((a, b) => salaryNum(a) - salaryNum(b)); break;
    case 'az':        list.sort((a, b) => a.title.localeCompare(b.title)); break;
  }
  return list;
}

function salaryNum(job) {
  // pull first number from salary string
  const m = job.salary.match(/[\d,]+/);
  return m ? parseInt(m[0].replace(',', ''), 10) : 0;
}

/* ═══════════════════════════════════════════════════
   5.  RENDER
   ═══════════════════════════════════════════════════ */
function buildCard(job, idx) {
  const badge = job.badge === 'new'
    ? `<span class="jl-badge-new">New</span>`
    : job.badge === 'featured'
    ? `<span class="jl-badge-feat">⭐ Featured</span>`
    : '';

  const tagsHtml = job.tags
    .map(t => `<span class="jl-chip">${t}</span>`)
    .join('');

  return `
  <article
    class="jl-card"
    style="--c-accent:${job.accent}; animation-delay:${idx * 0.05}s"
    data-id="${job.id}"
  >
    <div class="card-top-bar"></div>
    ${badge}
    <div class="jl-card-body">
      <div class="jl-header-row">
        <div class="jl-logo" style="${logoStyle(job.accent)}">${job.emoji}</div>
        <div class="jl-company-info">
          <span class="jl-company-name">${job.company}</span>
          <h3 class="jl-title">${job.title}</h3>
        </div>
        <button class="jl-bookmark" aria-label="Save job" data-saved="false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div>

      <div class="jl-details-row">
        <span class="jl-chip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          ${job.location}
        </span>
        <span class="jl-chip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          ${daysLabel(job.daysAgo)}
        </span>
        <span class="jl-type-badge ${typeClass(job.type)}">${job.type}</span>
        ${tagsHtml}
      </div>
    </div>

    <div class="jl-actions">
      <div class="jl-salary">
        ${job.salary} <span>/yr</span>
      </div>
      <button class="jl-apply" style="background:${job.accent}">Apply Now</button>
    </div>
  </article>`;
}

function render() {
  const grid  = document.getElementById('jobsGrid');
  const empty = document.getElementById('emptyState');
  const count = document.getElementById('resultsCount');
  const liveCount = document.getElementById('liveCount');

  const results = applyFilters();

  // Result count
  count.innerHTML = results.length === 0
    ? '0 jobs found'
    : `<strong>${results.length}</strong> job${results.length !== 1 ? 's' : ''} found`;

  liveCount.textContent = `${JOBS.length} opportunities live now`;

  if (results.length === 0) {
    grid.innerHTML = '';
    empty.hidden = false;
  } else {
    empty.hidden = true;
    grid.innerHTML = results.map((job, i) => buildCard(job, i)).join('');

    // Restore bookmark state from localStorage
    const savedJobs = getSaved();
    grid.querySelectorAll('.jl-bookmark').forEach(btn => {
      const card  = btn.closest('.jl-card');
      const jobId = card ? +card.dataset.id : null;
      if (jobId && savedJobs.some(j => j.id === jobId)) {
        btn.setAttribute('data-saved', 'true');
        btn.classList.add('saved');
      }
      btn.addEventListener('click', () => {
        const isSaved = btn.getAttribute('data-saved') === 'true';
        if (isSaved) {
          removeSaved(jobId);
          btn.setAttribute('data-saved', 'false');
          btn.classList.remove('saved');
          showJobToast('info', 'Removed', 'Job removed from saved list.');
        } else {
          const job = JOBS.find(j => j.id === jobId);
          if (job) saveJob(job);
          btn.setAttribute('data-saved', 'true');
          btn.classList.add('saved');
          showJobToast('success', 'Saved!', `"${JOBS.find(j=>j.id===jobId)?.title}" added to your saved jobs.`);
        }
      });
    });

    // Apply buttons → nx_applied
    grid.querySelectorAll('.jl-apply').forEach(btn => {
      const card  = btn.closest('.jl-card');
      const jobId = card ? +card.dataset.id : null;
      const appliedJobs = getApplied();
      if (jobId && appliedJobs.some(j => j.id === jobId)) {
        btn.textContent = '✓ Applied';
        btn.style.opacity = '0.6';
        btn.disabled = true;
      }
      btn.addEventListener('click', () => {
        const job = JOBS.find(j => j.id === jobId);
        if (!job || btn.disabled) return;
        applyJob(job);
        btn.textContent = '✓ Applied';
        btn.style.opacity = '0.6';
        btn.disabled = true;
        showJobToast('success', 'Applied!', `Application sent for "${job.title}".`);
      });
    });
  }

  renderChips();
}

/* ═══════════════════════════════════════════════════
   6.  FILTER CHIPS
   ═══════════════════════════════════════════════════ */
function renderChips() {
  const container = document.getElementById('activeChips');
  const chips = [];

  if (state.search)   chips.push({ key: 'search',   label: `"${state.search}"` });
  if (state.location) chips.push({ key: 'location',  label: state.location });
  if (state.type)     chips.push({ key: 'type',      label: state.type });

  container.innerHTML = chips.map(c => `
    <span class="filter-chip">
      ${c.label}
      <button class="chip-remove" data-key="${c.key}" aria-label="Remove filter">✕</button>
    </span>
  `).join('');

  container.querySelectorAll('.chip-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      state[key] = '';
      if (key === 'search') {
        document.getElementById('searchInput').value = '';
        updateClearBtn();
      }
      if (key === 'location') document.getElementById('locationFilter').value = '';
      if (key === 'type')     document.getElementById('typeFilter').value = '';
      render();
    });
  });
}

/* ═══════════════════════════════════════════════════
   7.  POPULATE LOCATION DROPDOWN
   ═══════════════════════════════════════════════════ */
function populateLocations() {
  const sel = document.getElementById('locationFilter');
  const locs = [...new Set(JOBS.map(j => j.location))].sort();
  locs.forEach(loc => {
    const opt = document.createElement('option');
    opt.value = loc;
    opt.textContent = loc;
    sel.appendChild(opt);
  });
}

/* ═══════════════════════════════════════════════════
   8.  CLEAR BUTTON VISIBILITY
   ═══════════════════════════════════════════════════ */
function updateClearBtn() {
  const btn = document.getElementById('clearSearch');
  const val = document.getElementById('searchInput').value;
  btn.classList.toggle('visible', val.length > 0);
}

/* ═══════════════════════════════════════════════════
   9.  RESET ALL
   ═══════════════════════════════════════════════════ */
function resetAll() {
  state.search = '';
  state.location = '';
  state.type = '';
  state.sort = 'newest';
  document.getElementById('searchInput').value    = '';
  document.getElementById('locationFilter').value = '';
  document.getElementById('typeFilter').value     = '';
  document.getElementById('sortFilter').value     = 'newest';
  updateClearBtn();
  render();
}

/* ═══════════════════════════════════════════════════
   10. EVENT LISTENERS
   ═══════════════════════════════════════════════════ */
function initEvents() {

  // Search — real-time with debounce
  let debounceTimer;
  document.getElementById('searchInput').addEventListener('input', e => {
    updateClearBtn();
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      state.search = e.target.value;
      render();
    }, 200);
  });

  // Clear search
  document.getElementById('clearSearch').addEventListener('click', () => {
    document.getElementById('searchInput').value = '';
    state.search = '';
    updateClearBtn();
    render();
  });

  // Location filter
  document.getElementById('locationFilter').addEventListener('change', e => {
    state.location = e.target.value;
    render();
  });

  // Type filter
  document.getElementById('typeFilter').addEventListener('change', e => {
    state.type = e.target.value;
    render();
  });

  // Sort
  document.getElementById('sortFilter').addEventListener('change', e => {
    state.sort = e.target.value;
    render();
  });

  // Reset buttons
  document.getElementById('resetFilters').addEventListener('click', resetAll);
  document.getElementById('emptyReset').addEventListener('click', resetAll);

  // Grid / List toggle
  document.getElementById('gridViewBtn').addEventListener('click', () => {
    state.view = 'grid';
    document.getElementById('jobsGrid').classList.remove('list-view');
    document.getElementById('gridViewBtn').classList.add('active');
    document.getElementById('listViewBtn').classList.remove('active');
  });

  document.getElementById('listViewBtn').addEventListener('click', () => {
    state.view = 'list';
    document.getElementById('jobsGrid').classList.add('list-view');
    document.getElementById('listViewBtn').classList.add('active');
    document.getElementById('gridViewBtn').classList.remove('active');
  });
}

/* ═══════════════════════════════════════════════════
   11. INIT
   ═══════════════════════════════════════════════════ */
(function init() {
  populateLocations();
  initEvents();
  render();
})();