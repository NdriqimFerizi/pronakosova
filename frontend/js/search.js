/**
 * search.js
 * Handles:
 *   - Search bar inputs (city, type, free text)
 *   - Tab switching (Të gjitha / Bli / Qiraja / I Ri)
 *   - City card click-to-filter
 *   - Enter key support
 */

const Search = {

  init() {
    // Enter key in search text field triggers search
    document.getElementById('srch-text')
      ?.addEventListener('keydown', e => { if (e.key === 'Enter') this.execute(); });

    // City card clicks
    document.querySelectorAll('.city-card').forEach(card => {
      card.addEventListener('click', () => {
        const city = card.querySelector('h3')?.textContent;
        if (!city) return;
        const citySelect = document.getElementById('srch-city');
        if (citySelect) citySelect.value = city;
        Listings.applyFilters({ city });
        document.querySelector('.listings-wrap')?.scrollIntoView({ behavior: 'smooth' });
      });
    });
  },

  // ── Execute a search from the bar inputs ────────────────────────────────────
  execute() {
    const city         = document.getElementById('srch-city')?.value  || '';
    const propertyType = document.getElementById('srch-type')?.value  || '';
    const search       = document.getElementById('srch-text')?.value?.trim() || '';

    Listings.applyFilters({ city, propertyType, search });
    document.querySelector('.listings-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  // ── Tab switch ──────────────────────────────────────────────────────────────
  setTab(el) {
    document.querySelectorAll('.s-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    const listingType = el.dataset.type || '';
    Listings.applyFilters({ listingType });
  },

  // ── Quick filter from nav links ─────────────────────────────────────────────
  filterByType(type) {
    // Sync the tab UI
    document.querySelectorAll('.s-tab').forEach(t => {
      t.classList.toggle('active', (t.dataset.type || '') === type);
    });
    Listings.applyFilters({ listingType: type });
    document.querySelector('.listings-wrap')?.scrollIntoView({ behavior: 'smooth' });
  },

  scrollToBuilders() {
    document.getElementById('buildersSection')?.scrollIntoView({ behavior: 'smooth' });
  },
};
