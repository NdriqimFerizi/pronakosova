/**
 * app.js
 * Main entry point — initialises all modules in the correct order.
 *
 * Load order in index.html must be:
 *   1. config.js
 *   2. state.js
 *   3. api.js
 *   4. ui.js
 *   5. auth.js
 *   6. listings.js
 *   7. detail.js
 *   8. inquiry.js
 *   9. builders.js
 *  10. search.js
 *  11. app.js      ← this file (last)
 */

// ── Bootstrap ─────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {

  // 1. Scroll reveal animations
  ScrollReveal.init();

  // 2. Restore user session + update nav
  await Auth.init();

  // 3. Wire up search bar
  Search.init();

  // 4. Load initial data in parallel
  await Promise.all([
    Listings.load(1),
    Listings.loadCityStats(),
    Builders.load(),
  ]);

  // 5. Bind modal backdrops
  Modal.bindBackdrop('modal');

  // 6. Bind detail overlay close on backdrop
  document.getElementById('detailOverlay')
    ?.addEventListener('click', e => Detail.close(e));

  // 7. Bind user dropdown outside-click close
  Dropdown.bindOutsideClick('userDropdown', '.user-avatar-btn');

  // 8. Mobile menu outside-click close
  document.addEventListener('click', e => {
    const menu = document.getElementById('mobileMenu');
    if (!menu) return;
    if (menu.classList.contains('open') &&
        !menu.contains(e.target) &&
        !e.target.closest('.nav-hamburger')) {
      menu.classList.remove('open');
    }
  });
});

// ── Global helpers (called from inline HTML onclick attributes) ───────────────
// These are needed because HTML onclick="" only has access to globals.

function toggleMenu() {
  document.getElementById('mobileMenu')?.classList.toggle('open');
}

// Auth
function openModal(type) {
  if      (type === 'login')    Auth.openLoginModal();
  else if (type === 'company')  Auth.openCompanyModal();
  else                          Auth.openRegisterModal();
}
function closeModal()           { Modal.close('modal'); }
function submitAuth()           { Auth.submit(); }
function handleGoogle()         { Auth.googleSignIn(); }
function logout()               { Auth.logout(); }
function pickType(el)           { Auth.pickAccountType(el); }

// Search
function setTab(el)             { Search.setTab(el); }
function doSearch()             { Search.execute(); }
function filterByType(type)     { Search.filterByType(type); }
function scrollToBuilders()     { Search.scrollToBuilders(); }

// Detail
function closeDetailPanel()     { Detail.closePanel(); }

// Listings
function clearFilters()         { Listings.clearFilters(); }

// Admin
function openAdmin(tab)         { Admin.open(tab); }
