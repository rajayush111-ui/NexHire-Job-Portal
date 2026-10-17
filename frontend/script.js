/* ── NexHire — script.js ── */

// Navbar scroll shadow
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });
}

// Mobile hamburger toggle
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close mobile menu when a link is tapped
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

// Bookmark toggle — persists to nx_saved
document.querySelectorAll('.bookmark-btn').forEach(btn => {
  // Find job data from the card
  const card    = btn.closest('article');
  const title   = card?.querySelector('.job-title')?.textContent?.trim()   || '';
  const company = card?.querySelector('.company-name')?.textContent?.trim() || '';
  const location= card?.querySelector('.detail-chip')?.textContent?.trim()  || '';
  const jobId   = title + '_' + company; // synthetic id for index page cards

  // Restore saved state
  try {
    const saved = JSON.parse(localStorage.getItem('nx_saved') || '[]');
    if (saved.some(j => j.id === jobId)) {
      btn.setAttribute('data-saved', 'true');
      btn.style.color       = 'var(--accent)';
      btn.style.borderColor = 'var(--accent)';
      btn.style.background  = 'rgba(99,102,241,.1)';
    }
  } catch {}

  btn.addEventListener('click', () => {
    const isSaved = btn.getAttribute('data-saved') === 'true';
    btn.setAttribute('data-saved', String(!isSaved));
    btn.style.color       = isSaved ? '' : 'var(--accent)';
    btn.style.borderColor = isSaved ? '' : 'var(--accent)';
    btn.style.background  = isSaved ? '' : 'rgba(99,102,241,.1)';

    try {
      let saved = JSON.parse(localStorage.getItem('nx_saved') || '[]');
      if (!isSaved) {
        if (!saved.some(j => j.id === jobId)) {
          saved.push({ id: jobId, title, company, location, type: 'Full-time' });
        }
      } else {
        saved = saved.filter(j => j.id !== jobId);
      }
      localStorage.setItem('nx_saved', JSON.stringify(saved));
    } catch {}
  });
});

// Scroll-reveal for job cards (index.html only)
const jobCards = document.querySelectorAll('.job-card');
if (jobCards.length > 0) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  jobCards.forEach(card => {
    card.style.opacity    = '0';
    card.style.transform  = 'translateY(32px)';
    card.style.transition = 'opacity .6s ease, transform .6s ease, box-shadow .3s, border-color .3s';
    observer.observe(card);
  });
}

