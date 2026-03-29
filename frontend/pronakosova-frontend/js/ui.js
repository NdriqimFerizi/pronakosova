/**
 * ui.js
 * Generic, reusable UI helpers.
 * No business logic — only DOM manipulation utilities.
 */

// ── TOAST ─────────────────────────────────────────────────────────────────────

const Toast = {
  show(message, type = 'default', duration = 3800) {
    const wrap = document.getElementById('toastWrap');
    if (!wrap) return;

    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span>${message}</span>`;
    wrap.appendChild(el);

    setTimeout(() => {
      el.style.animation = 'none';
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
      el.style.transition = 'opacity .25s, transform .25s';
      setTimeout(() => el.remove(), 280);
    }, duration);
  },

  success(msg) { this.show(msg, 'success'); },
  error(msg)   { this.show(msg, 'error'); },
  info(msg)    { this.show(msg, 'default'); },
};

// ── SKELETON LOADERS ──────────────────────────────────────────────────────────

const Skeleton = {
  listingCards(count = 6) {
    return Array(count).fill(0).map(() => `
      <div class="skel-card">
        <div class="skel-img skeleton"></div>
        <div class="skel-body">
          <div class="skel-line skeleton w40"></div>
          <div class="skel-line skeleton w80"></div>
          <div class="skel-line skeleton w60"></div>
          <div class="skel-line skeleton w40"></div>
        </div>
      </div>`).join('');
  },

  builderCards(count = 4) {
    return Array(count).fill(0).map(() => `
      <div class="skel-card" style="height:130px">
        <div class="skeleton" style="width:100%;height:100%;border-radius:14px"></div>
      </div>`).join('');
  },
};

// ── MODAL ─────────────────────────────────────────────────────────────────────

const Modal = {
  open(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  },
  close(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('open');
      document.body.style.overflow = '';
    }
  },
  // Close modal when clicking the backdrop
  bindBackdrop(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', e => {
      if (e.target === el) Modal.close(id);
    });
  },
};

// ── FORM HELPERS ──────────────────────────────────────────────────────────────

const Form = {
  showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
  },
  clearError(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = '';
    el.classList.remove('show');
  },
  setLoading(buttonId, loading, originalText = null) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    btn.disabled = loading;
    if (loading) {
      btn.dataset.originalText = btn.textContent;
      btn.textContent = 'Duke u procesuar...';
    } else {
      btn.textContent = originalText || btn.dataset.originalText || btn.textContent;
    }
  },
};

// ── PAGINATION ────────────────────────────────────────────────────────────────

const Pagination = {
  render(containerId, currentPage, totalPages, onPageClick) {
    const wrap = document.getElementById(containerId);
    if (!wrap) return;

    if (totalPages <= 1) { wrap.innerHTML = ''; return; }

    let html = `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">←</button>`;

    for (let i = 1; i <= totalPages; i++) {
      const showDots = totalPages > 7 && i > 2 && i < totalPages - 1 && Math.abs(i - currentPage) > 1;
      if (showDots) {
        if (i === 3 || i === totalPages - 2) html += `<span style="padding:0 4px;color:var(--ink3)">…</span>`;
        continue;
      }
      html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }

    html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">→</button>`;

    wrap.innerHTML = html;

    // Bind clicks
    wrap.querySelectorAll('.page-btn:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => onPageClick(parseInt(btn.dataset.page)));
    });
  },
};

// ── SCROLL REVEAL ─────────────────────────────────────────────────────────────

const ScrollReveal = {
  init() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
    }, { threshold: 0.08 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  },
};

// ── DROPDOWN ─────────────────────────────────────────────────────────────────

const Dropdown = {
  toggle(id) {
    document.getElementById(id)?.classList.toggle('open');
  },
  close(id) {
    document.getElementById(id)?.classList.remove('open');
  },
  bindOutsideClick(dropdownId, triggerSelector) {
    document.addEventListener('click', e => {
      const dd = document.getElementById(dropdownId);
      if (!dd) return;
      if (dd.classList.contains('open') &&
          !e.target.closest(triggerSelector) &&
          !e.target.closest('#' + dropdownId)) {
        dd.classList.remove('open');
      }
    });
  },
};
