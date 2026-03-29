/**
 * auth.js
 * Handles all authentication logic:
 *   - Email/password login & register
 *   - Google OAuth redirect & token pickup
 *   - Session restore on page load
 *   - Logout
 *   - Nav state update (show avatar vs login buttons)
 */

const Auth = {

  // ── Init: called on page load ───────────────────────────────────────────────
  async init() {
    // 1. Pick up token from Google OAuth redirect (?token=xxx)
    this._handleOAuthReturn();

    // 2. If we have a token, fetch the current user
    if (State.token) {
      try {
        const data = await AuthAPI.getMe();
        State.setUser(data.user);
        this.updateNav(data.user);
      } catch (_) {
        // Token invalid/expired — clear it
        State.clearAuth();
      }
    }
  },

  // ── Google OAuth return ────────────────────────────────────────────────────
  _handleOAuthReturn() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (error) {
      Toast.error('Hyrja me Google dështoi. Provoni përsëri.');
      history.replaceState({}, '', window.location.pathname);
      return;
    }
    if (token) {
      State.setToken(token);
      history.replaceState({}, '', window.location.pathname);
      Toast.success('✅ U kyçët me Google me sukses!');
    }
  },

  // ── Update nav bar based on auth state ─────────────────────────────────────
  updateNav(user) {
    const actions  = document.getElementById('navActions');
    const mobBtns  = document.getElementById('mobBtns');
    if (!actions) return;

    if (!user) {
      actions.innerHTML = `
        <button class="btn-ghost" onclick="Auth.openLoginModal()">Hyrje</button>
        <button class="btn-primary" onclick="Auth.openRegisterModal()">Regjistrohu</button>`;
      if (mobBtns) mobBtns.innerHTML = `
        <button class="btn-ghost" onclick="toggleMenu();Auth.openLoginModal()">Hyrje</button>
        <button class="btn-primary" onclick="toggleMenu();Auth.openRegisterModal()">Regjistrohu</button>`;
      return;
    }

    // Logged in — show "Post" button for sellers/companies, then avatar
    const initial = (user.name || user.email || '?')[0].toUpperCase();
    const canPost = ['seller', 'company'].includes(user.accountType) || user.role === 'admin';
    actions.innerHTML = `
      ${canPost ? `<button class="btn-post" onclick="PostListing.open()">+ Posto Pronën</button>` : ''}
      <div class="user-avatar-btn" onclick="Dropdown.toggle('userDropdown')" title="${user.name}">
        ${user.avatar ? `<img src="${user.avatar}" alt="${user.name}">` : initial}
      </div>`;

    // Populate dropdown
    const ddName = document.getElementById('dd-name');
    const ddType = document.getElementById('dd-type');
    if (ddName) ddName.textContent = user.name || user.email;
    if (ddType) ddType.textContent =
      user.accountType === 'company' ? (user.companyName || 'Kompani') :
      user.accountType === 'seller'  ? 'Shitës' : 'Blerës / Qiramarrës';

    if (mobBtns) mobBtns.innerHTML = `<button class="btn-ghost" style="flex:1" onclick="Auth.logout()">🚪 Çkyçu</button>`;
  },

  // ── Open login modal ────────────────────────────────────────────────────────
  openLoginModal() {
    State.modalMode = 'login';
    this._configureModal();
    Modal.open('modal');
  },

  // ── Open register modal ─────────────────────────────────────────────────────
  openRegisterModal() {
    State.modalMode = 'register';
    this._configureModal();
    Modal.open('modal');
  },

  // ── Open company register modal ─────────────────────────────────────────────
  openCompanyModal() {
    State.modalMode = 'company';
    State.selectedAccountType = 'company';
    this._configureModal();
    Modal.open('modal');
  },

  // ── Configure modal fields based on mode ────────────────────────────────────
  _configureModal() {
    Form.clearError('m-error');

    const el = id => document.getElementById(id);
    const show = (id, vis) => { const e = el(id); if (e) e.style.display = vis ? 'block' : 'none'; };

    const mode = State.modalMode;

    if (mode === 'login') {
      el('m-title').textContent = 'Hyni në Llogari';
      el('m-sub').textContent   = 'Mirë se u kthyet në PronaKosova';
      show('m-types', false); show('m-name', false);
      show('m-city', false);  show('m-company', false);
      el('m-btn').textContent   = 'Hyni →';
      el('g-txt').textContent   = 'Hyni me Google';
      el('m-foot').innerHTML    = 'Nuk keni llogari? <a href="#" onclick="Auth.openRegisterModal()">Regjistrohu</a>';

    } else if (mode === 'company') {
      el('m-title').textContent = 'Regjistro Kompaninë';
      el('m-sub').textContent   = 'Profil kompanie me prona të pakufizuara';
      show('m-types', false);   show('m-company', true);
      show('m-name', true);     show('m-city', true);
      el('m-btn').textContent   = 'Regjistro Kompaninë →';
      el('g-txt').textContent   = 'Regjistrohu me Google';
      el('m-foot').innerHTML    = 'Keni llogari? <a href="#" onclick="Auth.openLoginModal()">Hyni këtu</a>';

    } else {
      el('m-title').textContent = 'Regjistrohu';
      el('m-sub').textContent   = 'Zgjidh llojin e llogarisë tënde';
      show('m-types', true);    show('m-name', true);
      show('m-city', true);     show('m-company', false);
      el('m-btn').textContent   = 'Krijo Llogari →';
      el('g-txt').textContent   = 'Regjistrohu me Google';
      el('m-foot').innerHTML    = 'Keni llogari? <a href="#" onclick="Auth.openLoginModal()">Hyni këtu</a>';
    }
  },

  // ── Account type selector (register form) ───────────────────────────────────
  pickAccountType(el) {
    document.querySelectorAll('.acct').forEach(a => a.classList.remove('active'));
    el.classList.add('active');
    const lbl = el.querySelector('.lb').textContent;
    State.selectedAccountType =
      lbl === 'Kompani' ? 'company' :
      lbl === 'Shitës'  ? 'seller'  : 'buyer';
    const compF = document.getElementById('m-company');
    if (compF) compF.style.display = State.selectedAccountType === 'company' ? 'block' : 'none';
  },

  // ── Submit login or register ─────────────────────────────────────────────────
  async submit() {
    Form.clearError('m-error');
    Form.setLoading('m-btn', true);

    const val = id => document.getElementById(id)?.value?.trim() || '';

    try {
      let data;

      if (State.modalMode === 'login') {
        const email    = val('inp-email');
        const password = document.getElementById('inp-pass')?.value || '';
        if (!email || !password) throw new Error('Plotësoni të gjitha fushat.');
        data = await AuthAPI.login(email, password);

      } else {
        const name     = val('inp-name');
        const email    = val('inp-email');
        const password = document.getElementById('inp-pass')?.value || '';
        const city     = val('inp-city');
        const companyName = val('inp-company');

        if (!name)  throw new Error('Emri është i detyrueshëm.');
        if (!email) throw new Error('Email-i është i detyrueshëm.');
        if (password.length < 8) throw new Error('Fjalëkalimi duhet të ketë të paktën 8 karaktere.');

        const payload = {
          name, email, password, city,
          accountType: State.selectedAccountType,
        };
        if (companyName) payload.companyName = companyName;
        data = await AuthAPI.register(payload);
      }

      // Success
      State.setToken(data.token);
      State.setUser(data.user);
      this.updateNav(data.user);
      Modal.close('modal');
      const action = State.modalMode === 'login' ? 'u kthyet' : 'u regjistruat';
      Toast.success(`✅ Mirë se ${action}, ${data.user.name}!`);
      Listings.load(1); // Reload to reflect saved state

    } catch (e) {
      Form.showError('m-error', e.message);
    } finally {
      Form.setLoading('m-btn', false);
    }
  },

  // ── Google OAuth ─────────────────────────────────────────────────────────────
  googleSignIn() {
    AuthAPI.googleRedirect();
  },

  // ── Logout ────────────────────────────────────────────────────────────────────
  async logout() {
    try { await AuthAPI.logout(); } catch (_) {}
    State.clearAuth();
    Dropdown.close('userDropdown');
    this.updateNav(null);
    Toast.success('U çkyçët me sukses.');
    Listings.load(1);
  },
};
