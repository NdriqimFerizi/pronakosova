/**
 * dashboard.js
 * User dashboard slide-in panel with four tabs:
 *   - profile   : Edit name/phone/city, change password
 *   - listings  : My posted listings (edit / delete)
 *   - saved     : Bookmarked listings
 *   - messages  : Incoming inquiries (for sellers/companies)
 */

const Dashboard = {
  _tab: 'profile',

  // ── Open ─────────────────────────────────────────────────────────────────────
  open(tab = 'profile') {
    if (!State.user) { Auth.openLoginModal(); return; }
    this._tab = tab;
    document.getElementById('dashboardOverlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
    this._renderShell();
    this._loadTab(tab);
  },

  close() {
    document.getElementById('dashboardOverlay')?.classList.remove('open');
    document.body.style.overflow = '';
  },

  // ── Render the static shell (tabs + container) ────────────────────────────────
  _renderShell() {
    const u    = State.user;
    const tabs = [
      { id: 'profile',  label: '👤 Profili',         always: true },
      { id: 'listings', label: '🏠 Prona e Mia',     always: true },
      { id: 'saved',    label: '❤️ Të Ruajtura',     always: true },
      { id: 'messages', label: '✉️ Mesazhet',        always: true },
    ];

    const panel = document.getElementById('dashboardPanel');
    if (!panel) return;

    panel.innerHTML = `
      <div class="db-header">
        <div class="db-user-info">
          <div class="db-avatar">
            ${u.avatar
              ? `<img src="${u.avatar}" alt="${u.name}">`
              : (u.name || '?')[0].toUpperCase()}
          </div>
          <div>
            <div class="db-user-name">${u.name || ''}</div>
            <div class="db-user-type">${
              u.accountType === 'company' ? (u.companyName || 'Kompani') :
              u.accountType === 'seller'  ? 'Shitës' : 'Blerës / Qiramarrës'
            }</div>
          </div>
        </div>
        <button class="detail-close" onclick="Dashboard.close()">✕</button>
      </div>

      <div class="db-tabs">
        ${tabs.map(t => `
          <button class="db-tab ${this._tab === t.id ? 'active' : ''}"
            onclick="Dashboard._loadTab('${t.id}')">${t.label}
          </button>`).join('')}
      </div>

      <div class="db-content" id="db-content">
        <div class="db-loading">Duke ngarkuar...</div>
      </div>
    `;
  },

  // ── Switch tab ────────────────────────────────────────────────────────────────
  _loadTab(tab) {
    this._tab = tab;
    document.querySelectorAll('.db-tab').forEach(b =>
      b.classList.toggle('active', b.textContent.trim().includes(
        tab === 'profile'  ? 'Profili'   :
        tab === 'listings' ? 'Prona'     :
        tab === 'saved'    ? 'Ruajtura'  : 'Mesazhet'
      ))
    );
    const content = document.getElementById('db-content');
    if (!content) return;
    content.innerHTML = `<div class="db-loading">Duke ngarkuar...</div>`;

    switch (tab) {
      case 'profile':  this._loadProfile(content);  break;
      case 'listings': this._loadListings(content); break;
      case 'saved':    this._loadSaved(content);    break;
      case 'messages': this._loadMessages(content); break;
    }
  },

  // ── PROFILE TAB ──────────────────────────────────────────────────────────────
  _loadProfile(content) {
    const u = State.user;
    const cities = CONFIG.CITIES
      .map(c => `<option value="${c}" ${u.city === c ? 'selected' : ''}>${c}</option>`)
      .join('');

    content.innerHTML = `
      <div class="db-section">
        <div class="db-sec-title">Të dhënat e llogarisë</div>

        <div class="fg">
          <label>Emri & Mbiemri</label>
          <input id="prof-name" type="text" value="${this._esc(u.name || '')}">
        </div>
        ${u.accountType === 'company' ? `
        <div class="fg">
          <label>Emri i Kompanisë</label>
          <input id="prof-company" type="text" value="${this._esc(u.companyName || '')}">
        </div>` : ''}
        <div class="fg">
          <label>Telefoni</label>
          <input id="prof-phone" type="tel" placeholder="+383 44 123 456"
            value="${this._esc(u.phone || '')}">
        </div>
        <div class="fg">
          <label>Qyteti</label>
          <select id="prof-city">
            <option value="">Zgjidhni qytetin</option>
            ${cities}
          </select>
        </div>
        <div class="form-error" id="prof-error"></div>
        <button class="btn-full" id="prof-save-btn" onclick="Dashboard._saveProfile()">
          Ruaj Ndryshimet →
        </button>
      </div>

      <div class="db-section">
        <div class="db-sec-title">Ndrysho Fjalëkalimin</div>
        <div class="fg">
          <label>Fjalëkalimi aktual</label>
          <input id="prof-pw-old" type="password" placeholder="Fjalëkalimi i vjetër">
        </div>
        <div class="fg">
          <label>Fjalëkalimi i ri</label>
          <input id="prof-pw-new" type="password" placeholder="Minimum 8 karaktere">
        </div>
        <div class="fg">
          <label>Konfirmo fjalëkalimin e ri</label>
          <input id="prof-pw-confirm" type="password" placeholder="Konfirmo fjalëkalimin">
        </div>
        <div class="form-error" id="prof-pw-error"></div>
        <button class="btn-full" id="prof-pw-btn" onclick="Dashboard._changePassword()">
          Ndrysho Fjalëkalimin →
        </button>
      </div>
    `;
  },

  async _saveProfile() {
    Form.clearError('prof-error');
    Form.setLoading('prof-save-btn', true);
    const payload = {
      name:  document.getElementById('prof-name')?.value?.trim() || '',
      phone: document.getElementById('prof-phone')?.value?.trim() || '',
      city:  document.getElementById('prof-city')?.value || '',
    };
    const company = document.getElementById('prof-company')?.value?.trim();
    if (company !== undefined) payload.companyName = company;

    if (!payload.name) {
      Form.showError('prof-error', 'Emri është i detyrueshëm.');
      Form.setLoading('prof-save-btn', false);
      return;
    }
    try {
      const data = await AuthAPI.updateProfile(payload);
      State.setUser(data.user);
      Auth.updateNav(data.user);
      this._renderShell();
      this._loadTab('profile');
      Toast.success('✅ Profili u përditësua!');
    } catch (e) {
      Form.showError('prof-error', e.message);
    } finally {
      Form.setLoading('prof-save-btn', false);
    }
  },

  async _changePassword() {
    Form.clearError('prof-pw-error');
    Form.setLoading('prof-pw-btn', true);

    const current = document.getElementById('prof-pw-old')?.value || '';
    const next    = document.getElementById('prof-pw-new')?.value || '';
    const confirm = document.getElementById('prof-pw-confirm')?.value || '';

    if (!current) {
      Form.showError('prof-pw-error', 'Shkruani fjalëkalimin aktual.');
      Form.setLoading('prof-pw-btn', false);
      return;
    }
    if (next.length < 8) {
      Form.showError('prof-pw-error', 'Fjalëkalimi i ri duhet të ketë të paktën 8 karaktere.');
      Form.setLoading('prof-pw-btn', false);
      return;
    }
    if (next !== confirm) {
      Form.showError('prof-pw-error', 'Fjalëkalimet nuk përputhen.');
      Form.setLoading('prof-pw-btn', false);
      return;
    }
    try {
      await AuthAPI.changePassword(current, next);
      document.getElementById('prof-pw-old').value    = '';
      document.getElementById('prof-pw-new').value    = '';
      document.getElementById('prof-pw-confirm').value = '';
      Toast.success('✅ Fjalëkalimi u ndryshua!');
    } catch (e) {
      Form.showError('prof-pw-error', e.message);
    } finally {
      Form.setLoading('prof-pw-btn', false);
    }
  },

  // ── MY LISTINGS TAB ───────────────────────────────────────────────────────────
  async _loadListings(content) {
    try {
      const data = await ListingsAPI.getAll({ postedBy: State.user._id, limit: 50 });
      const listings = data.listings || [];

      if (!listings.length) {
        content.innerHTML = this._empty(
          '🏠',
          'Nuk keni postuar asnjë pronë.',
          State.user.accountType !== 'buyer'
            ? `<button class="btn-primary" onclick="Dashboard.close();PostListing.open()" style="margin-top:16px">Posto Pronën Tënde →</button>`
            : ''
        );
        return;
      }

      const statusLabel = { aktive: 'Aktive', shitur: 'Shitur', 'ne-pritje': 'Në pritje', hequr: 'Hequr' };
      const statusColor = { aktive: 'var(--green)', shitur: 'var(--ink3)', 'ne-pritje': '#e67e22', hequr: '#c0392b' };

      content.innerHTML = `
        <div class="db-sec-top">
          <div class="db-sec-title" style="margin-bottom:0">${listings.length} prona</div>
          ${['seller','company','admin'].includes(State.user.accountType) || State.user.role === 'admin'
            ? `<button class="btn-primary" style="font-size:.78rem;padding:7px 14px"
                onclick="Dashboard.close();PostListing.open()">+ Posto Pronën</button>`
            : ''}
        </div>
        <div class="db-listings">
          ${listings.map(l => {
            const img = l.coverImage || l.images?.[0]?.url;
            const badgeClass = { 'shitet': 'b-sell', 'me-qira': 'b-rent', 'i-ri': 'b-new' }[l.listingType] || 'b-sell';
            const badgeLabel = { 'shitet': 'Shitet', 'me-qira': 'Me Qira', 'i-ri': 'I Ri' }[l.listingType] || '';
            const price = l.priceFormatted || '€' + Number(l.price).toLocaleString('de-DE');
            return `
              <div class="db-listing-row">
                <div class="db-listing-thumb" style="${img ? '' : 'background:var(--bg)'}">
                  ${img
                    ? `<img src="${img}" alt="${this._esc(l.title)}">`
                    : `<span style="font-size:1.6rem">${{ apartament:'🏢',shtepi:'🏠',toke:'🌳' }[l.propertyType] || '🏠'}</span>`}
                  <span class="badge ${badgeClass}" style="position:absolute;top:6px;left:6px;font-size:.6rem">${badgeLabel}</span>
                </div>
                <div class="db-listing-info">
                  <div class="db-listing-title">${this._esc(l.title)}</div>
                  <div class="db-listing-meta">📍 ${l.city}${l.neighborhood ? ', ' + l.neighborhood : ''}</div>
                  <div class="db-listing-price">${price}</div>
                  <div style="font-size:.7rem;font-weight:600;color:${statusColor[l.status] || 'var(--ink3)'}">
                    ● ${statusLabel[l.status] || l.status}
                  </div>
                </div>
                <div class="db-listing-actions">
                  <button class="db-act-btn" onclick="Dashboard.close();PostListing.open('${l._id}')"
                    title="Ndrysho">✏️</button>
                  <button class="db-act-btn danger" onclick="Dashboard._deleteListing('${l._id}', this)"
                    title="Fshi">🗑</button>
                </div>
              </div>`;
          }).join('')}
        </div>
      `;
    } catch (e) {
      content.innerHTML = this._error(e.message);
    }
  },

  async _deleteListing(id, btn) {
    if (!confirm('A jeni i sigurt që dëshironi të fshini këtë pronë?')) return;
    btn.disabled = true;
    try {
      await ListingsAPI.delete(id);
      Toast.success('Prona u fshi.');
      this._loadTab('listings');
      Listings.load(1);
    } catch (e) {
      Toast.error(e.message);
      btn.disabled = false;
    }
  },

  // ── SAVED LISTINGS TAB ───────────────────────────────────────────────────────
  async _loadSaved(content) {
    try {
      // Re-fetch user to get populated savedListings
      const data = await AuthAPI.getMe();
      State.setUser(data.user);
      const saved = data.user.savedListings || [];

      if (!saved.length) {
        content.innerHTML = this._empty('❤️', 'Nuk keni ruajtur asnjë pronë.',
          '<p style="font-size:.83rem;color:var(--ink3);margin-top:6px">Klikoni ❤️ mbi një pronë për ta ruajtur.</p>');
        return;
      }

      content.innerHTML = `
        <div class="db-sec-title">${saved.length} prona të ruajtura</div>
        <div class="db-listings">
          ${saved.map(l => {
            const img   = l.coverImage || l.images?.[0]?.url;
            const price = l.priceFormatted || '€' + Number(l.price).toLocaleString('de-DE');
            return `
              <div class="db-listing-row" style="cursor:pointer"
                onclick="Dashboard.close();Detail.open('${l._id}')">
                <div class="db-listing-thumb" style="${img ? '' : 'background:var(--bg)'}">
                  ${img ? `<img src="${img}" alt="${this._esc(l.title)}">` : '<span style="font-size:1.6rem">🏠</span>'}
                </div>
                <div class="db-listing-info">
                  <div class="db-listing-title">${this._esc(l.title || '')}</div>
                  <div class="db-listing-meta">📍 ${l.city || ''}</div>
                  <div class="db-listing-price">${price}</div>
                </div>
                <div class="db-listing-actions">
                  <button class="db-act-btn danger"
                    onclick="event.stopPropagation();Dashboard._unsave('${l._id}', this)"
                    title="Hiq nga të ruajtura">🤍</button>
                </div>
              </div>`;
          }).join('')}
        </div>
      `;
    } catch (e) {
      content.innerHTML = this._error(e.message);
    }
  },

  async _unsave(id, btn) {
    btn.disabled = true;
    try {
      await ListingsAPI.toggleSave(id);
      Toast.success('Prona u hoq nga të ruajtura.');
      this._loadTab('saved');
    } catch (e) {
      Toast.error(e.message);
      btn.disabled = false;
    }
  },

  // ── MESSAGES TAB ─────────────────────────────────────────────────────────────
  async _loadMessages(content) {
    try {
      const data     = await InquiriesAPI.getMy();
      const inquiries = data.inquiries || [];

      if (!inquiries.length) {
        content.innerHTML = this._empty('✉️', 'Nuk keni mesazhe.',
          '<p style="font-size:.83rem;color:var(--ink3);margin-top:6px">Mesazhet e blerësve do të shfaqen këtu.</p>');
        return;
      }

      const unread = inquiries.filter(i => !i.isRead).length;

      content.innerHTML = `
        <div class="db-sec-title">${inquiries.length} mesazhe${unread ? ` · <span style="color:var(--accent)">${unread} të palexuara</span>` : ''}</div>
        <div class="db-messages">
          ${inquiries.map(inq => {
            const sender = inq.fromUser || null;
            const name   = sender?.name || inq.guestName || 'Anonim';
            const email  = sender?.email || inq.guestEmail || '';
            const phone  = sender?.phone || inq.guestPhone || '';
            const date   = new Date(inq.createdAt).toLocaleDateString('sq-AL', {
              day: '2-digit', month: 'short', year: 'numeric',
            });
            return `
              <div class="db-msg-card ${inq.isRead ? '' : 'unread'}"
                onclick="Dashboard._markRead('${inq._id}', this)">
                <div class="db-msg-top">
                  <div class="db-msg-sender">
                    <div class="db-msg-avatar">
                      ${sender?.avatar
                        ? `<img src="${sender.avatar}" alt="${name}">`
                        : name[0].toUpperCase()}
                    </div>
                    <div>
                      <div class="db-msg-name">${this._esc(name)}${!inq.isRead ? ' <span class="unread-dot"></span>' : ''}</div>
                      <div class="db-msg-sub">${email}${phone ? ' · ' + phone : ''}</div>
                    </div>
                  </div>
                  <div class="db-msg-date">${date}</div>
                </div>
                ${inq.listing ? `
                  <div class="db-msg-listing">
                    🏠 ${this._esc(inq.listing.title || '')} — 📍 ${inq.listing.city || ''}
                  </div>` : ''}
                <div class="db-msg-body">${this._esc(inq.message)}</div>
                ${email ? `<a href="mailto:${email}" class="db-msg-reply" onclick="event.stopPropagation()">Përgjigju →</a>` : ''}
              </div>`;
          }).join('')}
        </div>
      `;
    } catch (e) {
      content.innerHTML = this._error(e.message);
    }
  },

  async _markRead(id, card) {
    if (!card.classList.contains('unread')) return;
    try {
      await InquiriesAPI.markRead(id);
      card.classList.remove('unread');
      // Update unread count in tab
      const countEl = document.querySelector('.db-sec-title');
      // Re-render to update unread count in header
    } catch (_) {}
  },

  // ── Helpers ───────────────────────────────────────────────────────────────────
  _empty(icon, msg, extra = '') {
    return `
      <div class="db-empty">
        <div class="db-empty-icon">${icon}</div>
        <div class="db-empty-msg">${msg}</div>
        ${extra}
      </div>`;
  },

  _error(msg) {
    return `<div class="db-empty"><div class="db-empty-icon">⚠️</div><div class="db-empty-msg">${msg}</div></div>`;
  },

  _esc(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },
};

// Global wrappers for HTML onclick attributes
function openDashboard(tab) { Dashboard.open(tab || 'profile'); }
function closeDashboard()   { Dashboard.close(); }
