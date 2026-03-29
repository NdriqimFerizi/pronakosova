/**
 * listings.js
 * Responsible for:
 *   - Fetching listings from the API
 *   - Rendering listing cards
 *   - Skeleton loaders
 *   - Pagination
 *   - Save / unsave (heart toggle)
 *   - City stat counts
 */

const Listings = {

  // ── Load listings from API ──────────────────────────────────────────────────
  async load(page = 1) {
    State.currentPage = page;

    // Show skeletons while fetching
    document.getElementById('listingsGrid').innerHTML = Skeleton.listingCards(6);

    try {
      const params = {
        page,
        limit: CONFIG.LISTINGS_PER_PAGE,
        ...State.filters,
      };

      // Remove empty filters so the URL stays clean
      Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });

      const data = await ListingsAPI.getAll(params);

      State.currentPage    = data.currentPage;
      State.totalPages     = data.totalPages;
      State.totalListings  = data.total;

      // Update stat counter
      const statEl = document.getElementById('stat-total');
      if (statEl) statEl.textContent = data.total.toLocaleString('sq-AL') + '+';

      this._renderGrid(data.listings);
      Pagination.render('pagination', State.currentPage, State.totalPages, p => this.load(p));

    } catch (e) {
      document.getElementById('listingsGrid').innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:48px 0;color:var(--ink3)">
          <div style="font-size:3rem;margin-bottom:12px">⚠️</div>
          <p style="font-size:.95rem">Nuk mund të ngarkohen prona.</p>
          <p style="font-size:.78rem;margin-top:6px;color:#bbb">${e.message}</p>
          <p style="font-size:.78rem;margin-top:4px;color:#bbb">Sigurohuni që backend-i është duke punuar në <code>${CONFIG.API_BASE}</code></p>
        </div>`;
    }
  },

  // ── Render the grid ─────────────────────────────────────────────────────────
  _renderGrid(listings) {
    const grid = document.getElementById('listingsGrid');

    if (!listings || listings.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:48px 0;color:var(--ink3)">
          <div style="font-size:3rem;margin-bottom:12px">🔍</div>
          <p style="font-size:.95rem">Nuk u gjetën prona me këto filtra.</p>
          <a href="#" onclick="Listings.clearFilters()" style="color:var(--accent);font-weight:600;font-size:.88rem">Fshi filtrat →</a>
        </div>`;
      return;
    }

    grid.innerHTML = listings.map((l, i) => this._cardHtml(l, i)).join('');
  },

  // ── Single card HTML ────────────────────────────────────────────────────────
  _cardHtml(l, i) {
    const badgeClass = CONFIG.BADGE_CLASS[l.listingType]  || 'b-sell';
    const badgeLabel = CONFIG.BADGE_LABEL[l.listingType]  || l.listingType;
    const emoji      = CONFIG.PROPERTY_EMOJI[l.propertyType] || '🏠';
    const color      = CONFIG.THUMB_COLORS[i % CONFIG.THUMB_COLORS.length];
    const imgUrl     = l.coverImage || l.images?.[0]?.url;
    const isSaved    = State.user?.savedListings?.includes(l._id);

    const thumbInner = imgUrl
      ? `<img src="${imgUrl}" alt="${this._esc(l.title)}" loading="lazy">`
      : `<div class="l-thumb-emoji">${emoji}</div>`;

    const price = l.priceFormatted ||
      ('€' + Number(l.price).toLocaleString('sq-AL') +
       (l.priceType === 'per-muaj' ? ' <small>/ muaj</small>' : ''));

    return `
      <div class="listing-card" data-id="${l._id}" onclick="Detail.open('${l._id}')">
        <div class="l-thumb" style="background:${color}">
          ${thumbInner}
          <div class="badge ${badgeClass}">${badgeLabel}</div>
          <button
            class="l-save-btn"
            title="${isSaved ? 'Hiq nga të ruajtura' : 'Ruaj pronën'}"
            onclick="event.stopPropagation(); Listings.toggleSave('${l._id}', this)">
            ${isSaved ? '❤️' : '🤍'}
          </button>
        </div>
        <div class="l-body">
          <div class="l-type">${l.propertyType || ''}${l.rooms ? ' · ' + l.rooms + '+1' : ''}</div>
          <div class="l-title">${this._esc(l.title)}</div>
          <div class="l-loc">📍 ${l.city}${l.neighborhood ? ', ' + l.neighborhood : ''}</div>
          <div class="l-price">${price}</div>
          <div class="l-meta">
            ${l.rooms      ? `<span>🛏 ${l.rooms} dhoma</span>`  : ''}
            ${l.bathrooms  ? `<span>🚿 ${l.bathrooms} banja</span>` : ''}
            ${l.area       ? `<span>📐 ${l.area} m²</span>`      : ''}
          </div>
        </div>
      </div>`;
  },

  // ── Toggle save/unsave ──────────────────────────────────────────────────────
  async toggleSave(id, btn) {
    if (!State.user) {
      Auth.openLoginModal();
      return;
    }
    try {
      const data = await ListingsAPI.toggleSave(id);
      btn.textContent = data.saved ? '❤️' : '🤍';
      btn.title = data.saved ? 'Hiq nga të ruajtura' : 'Ruaj pronën';
      Toast.success(data.message);
      // Update local state so re-render reflects it
      if (!State.user.savedListings) State.user.savedListings = [];
      if (data.saved) {
        State.user.savedListings.push(id);
      } else {
        State.user.savedListings = State.user.savedListings.filter(x => x !== id);
      }
    } catch (e) {
      Toast.error(e.message);
    }
  },

  // ── City stats ──────────────────────────────────────────────────────────────
  async loadCityStats() {
    try {
      const data = await ListingsAPI.getCityStats();
      data.stats.forEach(s => {
        const el = document.getElementById('city-count-' + s._id);
        if (el) el.textContent = s.count.toLocaleString('sq-AL') + ' prona';
      });
    } catch (_) {
      // Non-critical — fail silently
    }
  },

  // ── Filter helpers ──────────────────────────────────────────────────────────
  applyFilters(overrides = {}) {
    Object.assign(State.filters, overrides);
    this.load(1);
  },

  clearFilters() {
    State.resetFilters();
    // Reset search bar UI
    const city  = document.getElementById('srch-city');
    const type  = document.getElementById('srch-type');
    const text  = document.getElementById('srch-text');
    if (city)  city.value  = '';
    if (type)  type.value  = '';
    if (text)  text.value  = '';
    // Reset tab UI
    document.querySelectorAll('.s-tab').forEach(t =>
      t.classList.toggle('active', (t.dataset.type || '') === '')
    );
    this.load(1);
  },

  // ── Escape HTML ─────────────────────────────────────────────────────────────
  _esc(str) {
    return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  },
};
