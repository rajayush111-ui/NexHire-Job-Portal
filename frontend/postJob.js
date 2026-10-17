/* ══════════════════════════════════════════════
     POST JOB SCRIPT
  ══════════════════════════════════════════════ */
  'use strict';

  const $ = id => document.getElementById(id);

  /* ────────────────────────────────────────────
     STATE
  ──────────────────────────────────────────── */
  let currentStep = 1;
  const TOTAL_STEPS = 3;
  let tags = [];

  /* ────────────────────────────────────────────
     TOAST
  ──────────────────────────────────────────── */
  function showToast(type, title, msg) {
    const icons = { success:'✅', error:'❌', info:'ℹ️' };
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<div class="toast-icon">${icons[type]||'ℹ️'}</div>
      <div class="toast-body"><strong>${title}</strong><span>${msg}</span></div>
      <button class="toast-close">✕</button>`;
    $('toastContainer').appendChild(t);
    t.querySelector('.toast-close').addEventListener('click', () => removeToast(t));
    setTimeout(() => removeToast(t), 4000);
  }
  function removeToast(t) {
    if (t.classList.contains('removing')) return;
    t.classList.add('removing');
    t.addEventListener('animationend', () => t.remove(), { once: true });
  }

  /* ────────────────────────────────────────────
     STEP RENDERING
  ──────────────────────────────────────────── */
  function renderStep(step) {
    for (let i = 1; i <= TOTAL_STEPS; i++) {
      $(`step${i}`).classList.toggle('active', i === step);
    }

    // Circles
    for (let i = 1; i <= TOTAL_STEPS; i++) {
      const c = $(`sc${i}`);
      c.classList.remove('active', 'done');
      if (i < step)  { c.classList.add('done');   c.innerHTML = '<i class="fa-solid fa-check" style="font-size:.6rem"></i>'; }
      if (i === step){ c.classList.add('active');  c.textContent = i; }
      if (i > step)  { c.textContent = i; }
    }

    // Lines
    for (let i = 1; i < TOTAL_STEPS; i++) {
      $(`sl${i}`).classList.toggle('done', i < step);
    }

    // Step labels active
    document.querySelectorAll('.pj-step').forEach((el, idx) => {
      el.classList.toggle('active', idx + 1 === step);
    });

    // Buttons
    $('btnBack').style.visibility = step === 1 ? 'hidden' : 'visible';
    const isLast = step === TOTAL_STEPS;
    $('btnNext').style.display   = isLast ? 'none'  : 'inline-flex';
    $('btnSubmit').style.display = isLast ? 'inline-flex' : 'none';
    $('stepCounter').textContent = `Step ${step} of ${TOTAL_STEPS}`;
  }

  /* ────────────────────────────────────────────
     FIELD HELPERS
  ──────────────────────────────────────────── */
  function setErr(msgId, inputId, msg) {
    const el = $(msgId);
    el.textContent = msg;
    el.className   = 'field-msg ' + (msg ? 'err' : '');
    if (inputId) {
      $(inputId).classList.toggle('error',   !!msg);
      $(inputId).classList.toggle('success', !msg && $(inputId).value.trim() !== '');
    }
  }
  function clearMsgs(...ids) { ids.forEach(id => { $(id) && ($(id).className = 'field-msg'); $(id) && ($(id).textContent = ''); }); }

  /* ────────────────────────────────────────────
     VALIDATION PER STEP
  ──────────────────────────────────────────── */
  function validateStep(step) {
    let ok = true;

    if (step === 1) {
      clearMsgs('jobTitleErr','companyNameErr','jobLocationErr','jobTypeErr','jobSalaryErr');

      const title = $('jobTitle').value.trim();
      if (!title)          { setErr('jobTitleErr','jobTitle','Job title is required.'); ok=false; }
      else if (title.length < 3) { setErr('jobTitleErr','jobTitle','Title must be at least 3 characters.'); ok=false; }
      else                 { setErr('jobTitleErr','jobTitle',''); }

      const company = $('companyName').value.trim();
      if (!company)        { setErr('companyNameErr','companyName','Company name is required.'); ok=false; }
      else                 { setErr('companyNameErr','companyName',''); }

      const location = $('jobLocation').value.trim();
      if (!location)       { setErr('jobLocationErr','jobLocation','Location is required.'); ok=false; }
      else                 { setErr('jobLocationErr','jobLocation',''); }

      const type = $('jobType').value;
      if (!type)           { setErr('jobTypeErr','jobType','Please select a job type.'); ok=false; }
      else                 { setErr('jobTypeErr','jobType',''); }

      const salary = $('jobSalary').value.trim();
      if (!salary)         { setErr('jobSalaryErr','jobSalary','Salary/compensation is required.'); ok=false; }
      else                 { setErr('jobSalaryErr','jobSalary',''); }
    }

    if (step === 2) {
      clearMsgs('jobSkillsErr','contactEmailErr');

      if (tags.length === 0) {
        $('jobSkillsErr').textContent = 'Add at least one skill tag.';
        $('jobSkillsErr').className = 'field-msg err';
        ok = false;
      } else {
        $('jobSkillsErr').className = 'field-msg';
      }

      const email = $('contactEmail').value.trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setErr('contactEmailErr','contactEmail','Enter a valid email address.'); ok=false;
      } else {
        setErr('contactEmailErr', email ? 'contactEmail' : null, '');
      }
    }

    if (step === 3) {
      clearMsgs('jobDescErr');
      const desc = $('jobDesc').value.trim();
      if (!desc)           { setErr('jobDescErr','jobDesc','Job description is required.'); ok=false; }
      else if (desc.length < 50) { setErr('jobDescErr','jobDesc','Description must be at least 50 characters.'); ok=false; }
      else                 { setErr('jobDescErr','jobDesc',''); }
    }

    return ok;
  }

  /* ────────────────────────────────────────────
     NAVIGATION
  ──────────────────────────────────────────── */
  $('btnNext').addEventListener('click', () => {
    if (!validateStep(currentStep)) return;
    currentStep++;
    renderStep(currentStep);
  });

  $('btnBack').addEventListener('click', () => {
    currentStep--;
    renderStep(currentStep);
  });

  /* ────────────────────────────────────────────
     TAGS INPUT
  ──────────────────────────────────────────── */
  function renderTags() {
    $('tagsDisplay').innerHTML = tags.map((t, i) => `
      <span class="tag-chip">
        ${escHtml(t)}
        <button type="button" class="tag-remove" data-i="${i}" aria-label="Remove ${t}">✕</button>
      </span>`).join('');

    $('tagsDisplay').querySelectorAll('.tag-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        tags.splice(+btn.dataset.i, 1);
        renderTags();
        updatePreview();
      });
    });
    updatePreview();
  }

  function addTag(raw) {
    const val = raw.trim().replace(/,+$/, '').trim();
    if (!val) return;
    const parts = val.split(',').map(s => s.trim()).filter(Boolean);
    parts.forEach(p => {
      if (p && !tags.includes(p) && tags.length < 12) tags.push(p);
    });
    $('jobSkills').value = '';
    renderTags();
  }

  $('jobSkills').addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag($('jobSkills').value);
    }
  });
  $('jobSkills').addEventListener('blur', () => {
    if ($('jobSkills').value.trim()) addTag($('jobSkills').value);
  });

  /* ────────────────────────────────────────────
     DESCRIPTION COUNTER
  ──────────────────────────────────────────── */
  $('jobDesc').addEventListener('input', function() {
    const len = this.value.length;
    const counter = $('descCounter');
    counter.textContent = `${len} / 2000`;
    counter.className = 'field-counter' + (len > 1800 ? ' warn' : '');
    if (len > 2000) this.value = this.value.slice(0, 2000);
  });

  /* ────────────────────────────────────────────
     LIVE PREVIEW
  ──────────────────────────────────────────── */
  const PREVIEW_IDS = ['jobTitle','companyName','jobLocation','jobType','jobSalary'];
  PREVIEW_IDS.forEach(id => {
    $(id).addEventListener('input', updatePreview);
    $(id).addEventListener('change', updatePreview);
  });
  $('salaryPeriod').addEventListener('change', updatePreview);

  const ACCENT_POOL = ['#6366f1','#f43f5e','#0ea5e9','#10b981','#a855f7','#f97316','#ec4899'];
  function accentFor(str) {
    let h = 0;
    for (let c of str) h = c.charCodeAt(0) + ((h << 5) - h);
    return ACCENT_POOL[Math.abs(h) % ACCENT_POOL.length];
  }
  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function updatePreview() {
    const title   = $('jobTitle').value.trim()   || 'Job Title';
    const company = $('companyName').value.trim() || 'Company Name';
    const loc     = $('jobLocation').value.trim() || 'Location';
    const type    = $('jobType').value            || 'Type';
    const salary  = $('jobSalary').value.trim();
    const period  = $('salaryPeriod').value;
    const accent  = accentFor(company);

    $('prevTitle').textContent   = escHtml(title);
    $('prevCompany').textContent = escHtml(company);
    $('prevLocation').innerHTML  = `<i class="fa-solid fa-location-dot"></i> ${escHtml(loc)}`;
    $('prevType').innerHTML      = `<i class="fa-solid fa-clock"></i> ${escHtml(type)}`;
    $('prevLogo').textContent    = company[0].toUpperCase();
    $('prevLogo').style.background = `linear-gradient(135deg, ${accent}, #a855f7)`;
    $('previewBar').style.background = accent;

    $('prevSalary').innerHTML = salary
      ? `<strong style="color:var(--text)">${escHtml(salary)}</strong><span style="font-size:.72rem;color:var(--text-muted);margin-left:3px">${period}</span>`
      : `<span class="preview-placeholder">Salary not set</span>`;

    $('prevTags').innerHTML = tags.slice(0, 4)
      .map(t => `<span class="preview-tag">${escHtml(t)}</span>`).join('');
  }

  /* ────────────────────────────────────────────
     FORM SUBMIT
  ──────────────────────────────────────────── */
  $('postJobForm').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!validateStep(3)) return;

    const btn = $('btnSubmit');
    btn.classList.add('loading');

    setTimeout(() => {
      btn.classList.remove('loading');

      const period = $('salaryPeriod').value;
      const salary = $('jobSalary').value.trim()
        ? `$${$('jobSalary').value.trim()} ${period}`
        : '';

      const companyName = $('companyName').value.trim();
      const job = {
        id:          Date.now(),
        title:       $('jobTitle').value.trim(),
        company:     companyName,
        location:    $('jobLocation').value.trim(),
        type:        $('jobType').value,
        salary:      salary,
        tags:        [...tags],
        description: $('jobDesc').value.trim(),
        perks:       $('jobPerks').value.trim(),
        expLevel:    $('expLevel').value,
        category:    $('jobCategory').value,
        contactEmail:$('contactEmail').value.trim(),
        deadline:    $('jobDeadline').value,
        postedAt:    new Date().toISOString(),
        badge:       'new',
        daysAgo:     0,
        emoji:       companyName[0]?.toUpperCase() || 'J',
        accent:      accentFor(companyName),
        status:      'Active',
      };

      // Save to localStorage
      const existing = JSON.parse(localStorage.getItem('nx_jobs') || '[]');
      existing.unshift(job);
      localStorage.setItem('nx_jobs', JSON.stringify(existing));

      // Populate modal
      $('mjpTitle').textContent   = job.title;
      $('mjpCompany').textContent = job.company;
      $('mjpType').textContent    = job.type;
      $('mjpLoc').textContent     = job.location;

      // Open modal
      $('successModal').classList.add('open');

      showToast('success', 'Job posted successfully 🎉', `"${job.title}" is now live.`);
    }, 1200);
  });

  /* ────────────────────────────────────────────
     MODAL — POST ANOTHER
  ──────────────────────────────────────────── */
  $('postAnotherBtn').addEventListener('click', () => {
    $('successModal').classList.remove('open');
    $('postJobForm').reset();
    tags = [];
    renderTags();
    updatePreview();
    currentStep = 1;
    renderStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Close modal on overlay click
  $('successModal').addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('open');
  });

  /* ────────────────────────────────────────────
     INIT
  ──────────────────────────────────────────── */
  renderStep(1);
  updatePreview();

  // Set min date for deadline
  const today = new Date().toISOString().split('T')[0];
  $('jobDeadline').min = today;
  