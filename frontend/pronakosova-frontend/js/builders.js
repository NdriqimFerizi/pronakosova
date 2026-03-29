/**
 * builders.js
 * Loads builder / company profiles from the API
 * and renders the builders grid section.
 */

const Builders = {

  async load() {
    const grid = document.getElementById('buildersGrid');
    if (!grid) return;

    grid.innerHTML = Skeleton.builderCards(4);

    try {
      const data = await BuildersAPI.getAll({ limit: 4 });

      // Update stat counter
      const statEl = document.getElementById('stat-builders');
      if (statEl) statEl.textContent = (data.total || data.builders.length) + '+';

      if (!data.builders || data.builders.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1;color:var(--ink3);font-size:.85rem;padding:16px">Nuk ka ndërtues të regjistruar ende.</div>`;
        return;
      }

      grid.innerHTML = data.builders.map(b => this._cardHtml(b)).join('');

    } catch (_) {
      grid.innerHTML = `<div style="grid-column:1/-1;color:var(--ink3);font-size:.85rem;padding:16px">Ndërtuesit nuk mund të ngarkohen.</div>`;
    }
  },

  _cardHtml(b) {
    const cities   = (b.cities || []).join(' · ') || '–';
    const logoHtml = b.logo?.url
      ? `<img class="b-logo" src="${b.logo.url}" alt="${b.name}">`
      : `<div class="b-icon">🏗</div>`;
    const count = b.listingsCount != null ? b.listingsCount : '–';

    return `
      <div class="builder-card" onclick="Builders.filterByBuilder('${b._id}', '${b.name.replace(/'/g,"\\'")}')">
        ${logoHtml}
        <div class="b-name">${b.name}</div>
        <div class="b-city">📍 ${cities}</div>
        <div class="b-count">${count} prona aktive →</div>
      </div>`;
  },

  filterByBuilder(id, name) {
    // Set search text to the builder name and reload listings
    const srchText = document.getElementById('srch-text');
    if (srchText) srchText.value = name;
    Listings.applyFilters({ search: name });
    document.querySelector('.listings-wrap')?.scrollIntoView({ behavior: 'smooth' });
  },
};
