/**
 * detail.js
 * Handles the slide-in detail panel for a single listing.
 * Opens when user clicks a listing card.
 */

const Detail = {

  async open(id) {
    const overlay = document.getElementById('detailOverlay');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Reset content while loading
    document.getElementById('detail-title').textContent     = 'Duke ngarkuar...';
    document.getElementById('detail-price').innerHTML       = '';
    document.getElementById('detail-loc').textContent       = '';
    document.getElementById('detail-badges').innerHTML      = '';
    document.getElementById('detail-specs').innerHTML       = '';
    document.getElementById('detail-desc').textContent      = '';
    document.getElementById('detail-contact').innerHTML     = '';
    document.getElementById('detail-imgs').innerHTML        = `<div class="detail-imgs-placeholder">⏳</div>`;

    try {
      const { listing: l } = await ListingsAPI.getOne(id);
      this._render(l);
    } catch (e) {
      document.getElementById('detail-title').textContent = 'Gabim: ' + e.message;
    }
  },

  _render(l) {
    const badgeClass = CONFIG.BADGE_CLASS[l.listingType]     || 'b-sell';
    const badgeLabel = CONFIG.BADGE_LABEL[l.listingType]     || l.listingType;
    const emoji      = CONFIG.PROPERTY_EMOJI[l.propertyType] || '🏠';
    const img        = l.coverImage || l.images?.[0]?.url;

    // ── Images ──────────────────────────────────────────────────
    document.getElementById('detail-imgs').innerHTML = img
      ? `<img src="${img}" alt="${l.title}">`
      : `<div class="detail-imgs-placeholder">${emoji}</div>`;

    // ── Badges ──────────────────────────────────────────────────
    document.getElementById('detail-badges').innerHTML =
      `<span class="badge ${badgeClass}" style="position:static">${badgeLabel}</span>` +
      (l.featured ? `<span class="badge b-new" style="position:static">⭐ E shquarë</span>` : '');

    // ── Title / location ────────────────────────────────────────
    document.getElementById('detail-title').textContent = l.title;
    document.getElementById('detail-loc').textContent =
      `📍 ${l.city}${l.neighborhood ? ', ' + l.neighborhood : ''}${l.address ? ' — ' + l.address : ''}`;

    // ── Price ────────────────────────────────────────────────────
    const price = l.priceFormatted ||
      ('€' + Number(l.price).toLocaleString('sq-AL') +
       (l.priceType === 'per-muaj' ? ' / muaj' : ''));
    document.getElementById('detail-price').innerHTML =
      price + (l.negotiable
        ? ' <small style="font-size:.75rem;color:var(--green)">(i negociueshëm)</small>'
        : '');

    // ── Specs ────────────────────────────────────────────────────
    const specs = [];
    if (l.rooms     != null) specs.push(this._spec(l.rooms + '+1', 'Dhoma'));
    if (l.bathrooms != null) specs.push(this._spec(l.bathrooms,    'Banja'));
    if (l.area      != null) specs.push(this._spec(l.area + ' m²', 'Sipërfaqja'));
    if (l.floor     != null) specs.push(this._spec('Kati ' + l.floor, 'Kati'));
    if (l.yearBuilt != null) specs.push(this._spec(l.yearBuilt,    'Ndërtuar'));
    if (l.parking)            specs.push(this._spec('✓',           'Parking'));
    document.getElementById('detail-specs').innerHTML = specs.join('');

    // ── Description ─────────────────────────────────────────────
    document.getElementById('detail-desc').textContent = l.description || '';

    // ── Amenities ────────────────────────────────────────────────
    const amenityLabels = {
      elevator:         '🛗 Lift',
      balcony:          '🌿 Ballkon',
      garden:           '🌳 Kopsht',
      pool:             '🏊 Pishinë',
      security:         '🔒 Siguri',
      centralHeating:   '🔥 Ngrohje qendrore',
      airConditioning:  '❄️ Klimë',
      internetIncluded: '📶 Internet',
    };
    const activeAmenities = l.amenities
      ? Object.entries(l.amenities).filter(([, v]) => v).map(([k]) => amenityLabels[k] || k)
      : [];

    if (activeAmenities.length) {
      const amenEl = document.getElementById('detail-desc');
      amenEl.innerHTML += `
        <div style="margin-top:16px;display:flex;flex-wrap:wrap;gap:8px">
          ${activeAmenities.map(a => `<span style="background:var(--bg);border:1px solid var(--border);padding:4px 10px;border-radius:100px;font-size:.74rem;color:var(--ink2)">${a}</span>`).join('')}
        </div>`;
    }

    // ── Contact ──────────────────────────────────────────────────
    const contact = l.postedBy || {};
    const initial = (contact.name || '?')[0].toUpperCase();
    const avatarHtml = contact.avatar
      ? `<img src="${contact.avatar}" alt="${contact.name}">`
      : `<span>${initial}</span>`;
    const phone = l.contactPhone || contact.phone || '';
    const sellerName = (contact.name || '').replace(/'/g, "\\'");

    document.getElementById('detail-contact').innerHTML = `
      <h4>Kontakto Shitësin</h4>
      <div class="detail-contact-info">
        <div class="detail-contact-avatar">${avatarHtml}</div>
        <div>
          <div class="detail-contact-name">${contact.name || '–'}</div>
          <div class="detail-contact-type">${contact.companyName || (contact.accountType === 'company' ? 'Kompani' : 'Individ')}</div>
        </div>
      </div>
      <button class="btn-primary" style="width:100%;padding:11px;font-size:.88rem"
        onclick="Inquiry.open('${l._id}', '${sellerName}')">
        ✉️ Dërgo Mesazh
      </button>
      ${phone ? `<a href="tel:${phone}" style="display:block;text-align:center;margin-top:10px;font-size:.83rem;color:var(--accent);text-decoration:none;font-weight:600">📞 ${phone}</a>` : ''}
    `;
  },

  _spec(value, label) {
    return `<div class="detail-spec"><strong>${value}</strong><span>${label}</span></div>`;
  },

  close(e) {
    // Called from backdrop click
    if (e && e.target !== document.getElementById('detailOverlay')) return;
    this._dismiss();
  },

  closePanel() {
    this._dismiss();
  },

  _dismiss() {
    document.getElementById('detailOverlay').classList.remove('open');
    document.body.style.overflow = '';
  },
};
