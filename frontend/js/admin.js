/**
 * admin.js
 * Admin panel — stats, listings management, user management.
 * Only accessible to users with role === 'admin'.
 */

const Admin = {
  _tab: 'stats',
  _listingsPage: 1,
  _usersPage: 1,

  open(tab = 'stats') {
    if (!State.user || State.user.role !== 'admin') return;
    this._tab = tab;
    document.getElementById('adminOverlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
    this._renderShell();
    this._loadTab(tab);
  },

  close() {
    document.getElementById('adminOverlay')?.classList.remove('open');
    document.body.style.overflow = '';
  },

  _renderShell() {
    const panel = document.getElementById('adminPanel');
    if (!panel) return;
    panel.innerHTML = `
      <div class="db-header">
        <div class="db-user-info">
          <div class="db-avatar" style="background:#c0392b">A</div>
          <div>
            <div class="db-user-name">Panel Administrativ</div>
            <div class="db-user-type">PronaKosova Admin</div>
          </div>
        </div>
        <button class="db-close" onclick="Admin.close()">✕</button>
      </div>
      <div class="db-tabs">
        <button class="db-tab ${this._tab==='stats'?'active':''}" onclick="Admin._switchTab('stats')">📊 Statistika</button>
        <button class="db-tab ${this._tab==='listings'?'active':''}" onclick="Admin._switchTab('listings')">🏠 Pronat</button>
        <button class="db-tab ${this._tab==='users'?'active':''}" onclick="Admin._switchTab('users')">👥 Përdoruesit</button>
      </div>
      <div class="db-content" id="adminContent"><div class="db-loading">Duke ngarkuar...</div></div>
    `;
  },

  _switchTab(tab) {
    this._tab = tab;
    document.querySelectorAll('.db-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    this._loadTab(tab);
  },

  async _loadTab(tab) {
    const el = document.getElementById('adminContent');
    if (!el) return;
    el.innerHTML = '<div class="db-loading">Duke ngarkuar...</div>';
    if (tab === 'stats')    await this._renderStats(el);
    if (tab === 'listings') await this._renderListings(el, 1);
    if (tab === 'users')    await this._renderUsers(el, 1);
  },

  async _renderStats(el) {
    try {
      const d = await apiFetch('/admin/stats');
      el.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:24px">
          ${[
            ['👥', 'Përdorues', d.stats.users, '#2c4a84'],
            ['🏠', 'Prona Aktive', d.stats.listings, '#27ae60'],
            ['✉️', 'Mesazhe', d.stats.inquiries, '#e67e22'],
            ['🏗', 'Ndërtues', d.stats.builders, '#8e44ad'],
          ].map(([ic,lb,val,bg])=>`
            <div style="background:${bg}15;border:1px solid ${bg}30;border-radius:12px;padding:20px;text-align:center">
              <div style="font-size:2rem">${ic}</div>
              <div style="font-size:1.8rem;font-weight:700;color:${bg};margin:4px 0">${val}</div>
              <div style="font-size:.8rem;color:var(--ink3)">${lb}</div>
            </div>
          `).join('')}
        </div>
        <div style="padding:0 24px 24px">
          <p style="color:var(--ink3);font-size:.85rem;text-align:center">Të dhënat mund të jenë të cache-uara. Rifreskoni për vlera të sakta.</p>
        </div>
      `;
    } catch(e) { el.innerHTML = `<div class="db-empty">Gabim: ${e.message}</div>`; }
  },

  async _renderListings(el, page) {
    try {
      const d = await apiFetch(`/admin/listings?page=${page}&limit=15`);
      const rows = d.listings.map(l => `
        <tr>
          <td style="padding:10px 8px">
            <div style="font-weight:600;font-size:.85rem;color:var(--ink1);max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${l.title}</div>
            <div style="font-size:.75rem;color:var(--ink3)">${l.city} · ${l.listingType}</div>
          </td>
          <td style="padding:10px 8px;font-size:.8rem;color:var(--ink2)">${l.postedBy?.name||'–'}</td>
          <td style="padding:10px 8px">
            <span style="font-size:.75rem;padding:2px 8px;border-radius:20px;background:${l.status==='aktive'?'#27ae6020':'#e74c3c20'};color:${l.status==='aktive'?'#27ae60':'#e74c3c'}">${l.status}</span>
          </td>
          <td style="padding:10px 8px">
            <span style="font-size:.75rem;padding:2px 8px;border-radius:20px;background:${l.featured?'#f39c1220':'#eee'};color:${l.featured?'#e67e22':'#999'}">${l.featured?'⭐ Featured':'–'}</span>
          </td>
          <td style="padding:10px 8px;white-space:nowrap">
            <button onclick="Admin._toggleFeatured('${l._id}',${l.featured})" style="font-size:.75rem;padding:4px 10px;border:1px solid #ddd;border-radius:6px;background:#fff;cursor:pointer;margin-right:4px">${l.featured?'Hiq Featured':'⭐ Feature'}</button>
            <button onclick="Admin._deleteListing('${l._id}')" style="font-size:.75rem;padding:4px 10px;border:1px solid #ffcccc;border-radius:6px;background:#fff5f5;color:#e74c3c;cursor:pointer">Fshi</button>
          </td>
        </tr>
      `).join('');

      el.innerHTML = `
        <div style="padding:16px 24px 8px;display:flex;align-items:center;justify-content:space-between">
          <div style="font-size:.85rem;color:var(--ink3)">${d.total} prona gjithsej</div>
        </div>
        <div style="overflow-x:auto;padding:0 24px">
          <table style="width:100%;border-collapse:collapse">
            <thead><tr style="border-bottom:2px solid var(--border)">
              <th style="padding:8px;text-align:left;font-size:.78rem;color:var(--ink3);font-weight:600">PRONA</th>
              <th style="padding:8px;text-align:left;font-size:.78rem;color:var(--ink3);font-weight:600">POSTUAR NGA</th>
              <th style="padding:8px;text-align:left;font-size:.78rem;color:var(--ink3);font-weight:600">STATUSI</th>
              <th style="padding:8px;text-align:left;font-size:.78rem;color:var(--ink3);font-weight:600">FEATURED</th>
              <th style="padding:8px;text-align:left;font-size:.78rem;color:var(--ink3);font-weight:600">VEPRIME</th>
            </tr></thead>
            <tbody>${rows||'<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--ink3)">Nuk ka prona.</td></tr>'}</tbody>
          </table>
        </div>
        ${d.totalPages > 1 ? `
        <div style="display:flex;justify-content:center;gap:8px;padding:16px">
          ${Array.from({length:d.totalPages},(_,i)=>`
            <button onclick="Admin._renderListings(document.getElementById('adminContent'),${i+1})"
              style="padding:6px 12px;border-radius:6px;border:1px solid ${d.currentPage===i+1?'#2c4a84':'#ddd'};background:${d.currentPage===i+1?'#2c4a84':'#fff'};color:${d.currentPage===i+1?'#fff':'inherit'};cursor:pointer;font-size:.8rem">${i+1}</button>
          `).join('')}
        </div>` : ''}
      `;
    } catch(e) { el.innerHTML = `<div class="db-empty">Gabim: ${e.message}</div>`; }
  },

  async _renderUsers(el, page) {
    try {
      const d = await apiFetch(`/admin/users?page=${page}&limit=15`);
      const rows = d.users.map(u => `
        <tr>
          <td style="padding:10px 8px">
            <div style="font-weight:600;font-size:.85rem;color:var(--ink1)">${u.name}</div>
            <div style="font-size:.75rem;color:var(--ink3)">${u.email}</div>
          </td>
          <td style="padding:10px 8px">
            <select onchange="Admin._updateUser('${u._id}',{accountType:this.value})" style="font-size:.78rem;padding:4px 8px;border:1px solid #ddd;border-radius:6px;background:#fff">
              <option value="buyer" ${u.accountType==='buyer'?'selected':''}>Blerës</option>
              <option value="seller" ${u.accountType==='seller'?'selected':''}>Shitës</option>
              <option value="company" ${u.accountType==='company'?'selected':''}>Kompani</option>
            </select>
          </td>
          <td style="padding:10px 8px">
            <select onchange="Admin._updateUser('${u._id}',{role:this.value})" style="font-size:.78rem;padding:4px 8px;border:1px solid #ddd;border-radius:6px;background:#fff">
              <option value="user" ${u.role==='user'?'selected':''}>User</option>
              <option value="admin" ${u.role==='admin'?'selected':''}>Admin</option>
            </select>
          </td>
          <td style="padding:10px 8px">
            <span style="font-size:.75rem;padding:2px 8px;border-radius:20px;background:${u.isActive?'#27ae6020':'#e74c3c20'};color:${u.isActive?'#27ae60':'#e74c3c'}">${u.isActive?'Aktiv':'Bllokuar'}</span>
          </td>
          <td style="padding:10px 8px">
            <button onclick="Admin._updateUser('${u._id}',{isActive:${!u.isActive}})" style="font-size:.75rem;padding:4px 10px;border:1px solid #ddd;border-radius:6px;background:#fff;cursor:pointer">${u.isActive?'Blloko':'Aktivizo'}</button>
          </td>
        </tr>
      `).join('');

      el.innerHTML = `
        <div style="padding:16px 24px 8px">
          <div style="font-size:.85rem;color:var(--ink3)">${d.total} përdorues gjithsej</div>
        </div>
        <div style="overflow-x:auto;padding:0 24px">
          <table style="width:100%;border-collapse:collapse">
            <thead><tr style="border-bottom:2px solid var(--border)">
              <th style="padding:8px;text-align:left;font-size:.78rem;color:var(--ink3);font-weight:600">EMRI / EMAIL</th>
              <th style="padding:8px;text-align:left;font-size:.78rem;color:var(--ink3);font-weight:600">LLOJI</th>
              <th style="padding:8px;text-align:left;font-size:.78rem;color:var(--ink3);font-weight:600">ROLI</th>
              <th style="padding:8px;text-align:left;font-size:.78rem;color:var(--ink3);font-weight:600">STATUSI</th>
              <th style="padding:8px;text-align:left;font-size:.78rem;color:var(--ink3);font-weight:600">VEPRIME</th>
            </tr></thead>
            <tbody>${rows||'<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--ink3)">Nuk ka përdorues.</td></tr>'}</tbody>
          </table>
        </div>
        ${d.totalPages > 1 ? `
        <div style="display:flex;justify-content:center;gap:8px;padding:16px">
          ${Array.from({length:d.totalPages},(_,i)=>`
            <button onclick="Admin._renderUsers(document.getElementById('adminContent'),${i+1})"
              style="padding:6px 12px;border-radius:6px;border:1px solid ${d.currentPage===i+1?'#2c4a84':'#ddd'};background:${d.currentPage===i+1?'#2c4a84':'#fff'};color:${d.currentPage===i+1?'#fff':'inherit'};cursor:pointer;font-size:.8rem">${i+1}</button>
          `).join('')}
        </div>` : ''}
      `;
    } catch(e) { el.innerHTML = `<div class="db-empty">Gabim: ${e.message}</div>`; }
  },

  async _toggleFeatured(id, current) {
    try {
      await apiFetch(`/admin/listings/${id}`, { method:'PUT', body:JSON.stringify({featured:!current}) });
      Toast.success(current ? 'Featured u hoq.' : '⭐ Prona u bë featured!');
      this._renderListings(document.getElementById('adminContent'), 1);
    } catch(e) { Toast.error(e.message); }
  },

  async _deleteListing(id) {
    if (!confirm('Jeni të sigurt që doni të fshini këtë pronë?')) return;
    try {
      await apiFetch(`/admin/listings/${id}`, { method:'DELETE' });
      Toast.success('Prona u fshi.');
      this._renderListings(document.getElementById('adminContent'), 1);
    } catch(e) { Toast.error(e.message); }
  },

  async _updateUser(id, data) {
    try {
      await apiFetch(`/admin/users/${id}`, { method:'PUT', body:JSON.stringify(data) });
      Toast.success('Përdoruesi u përditësua.');
    } catch(e) { Toast.error(e.message); }
  },
};
