/**
 * api.js
 * Centralised fetch wrapper + every endpoint call.
 * All functions return parsed JSON or throw an Error with the server message.
 */

// ── Core fetch wrapper ────────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };

  // Attach JWT if we have one
  if (State.token) {
    headers['Authorization'] = `Bearer ${State.token}`;
  }

  const response = await fetch(CONFIG.API_BASE + path, {
    ...options,
    headers,
    credentials: 'include', // send cookies cross-origin
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Gabim ${response.status}`);
  }

  return data;
}

// ── AUTH ──────────────────────────────────────────────────────────────────────

const AuthAPI = {
  register(payload) {
    return apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  login(email, password) {
    return apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  logout() {
    return apiFetch('/auth/logout', { method: 'POST' });
  },

  getMe() {
    return apiFetch('/auth/me');
  },

  updateProfile(payload) {
    return apiFetch('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  changePassword(currentPassword, newPassword) {
    return apiFetch('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // Redirects browser to Google OAuth — no fetch needed
  googleRedirect() {
    window.location.href = CONFIG.API_BASE + '/auth/google';
  },
};

// ── LISTINGS ─────────────────────────────────────────────────────────────────

const ListingsAPI = {
  getAll(params = {}) {
    const qs = new URLSearchParams();
    const defaults = { page: 1, limit: CONFIG.LISTINGS_PER_PAGE };
    const merged = { ...defaults, ...params };

    Object.entries(merged).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) qs.set(k, v);
    });

    return apiFetch('/listings?' + qs.toString());
  },

  getOne(idOrSlug) {
    return apiFetch('/listings/' + idOrSlug);
  },

  create(formData) {
    // FormData for multipart (images) — no Content-Type header (browser sets boundary)
    const headers = {};
    if (State.token) headers['Authorization'] = `Bearer ${State.token}`;
    return fetch(CONFIG.API_BASE + '/listings', {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    }).then(r => r.json()).then(d => { if (!d.success) throw new Error(d.message); return d; });
  },

  update(id, formData) {
    const headers = {};
    if (State.token) headers['Authorization'] = `Bearer ${State.token}`;
    return fetch(CONFIG.API_BASE + '/listings/' + id, {
      method: 'PUT',
      headers,
      body: formData,
      credentials: 'include',
    }).then(r => r.json()).then(d => { if (!d.success) throw new Error(d.message); return d; });
  },

  delete(id) {
    return apiFetch('/listings/' + id, { method: 'DELETE' });
  },

  toggleSave(id) {
    return apiFetch('/listings/' + id + '/save', { method: 'POST' });
  },

  getCityStats() {
    return apiFetch('/listings/stats/cities');
  },
};

// ── BUILDERS ─────────────────────────────────────────────────────────────────

const BuildersAPI = {
  getAll(params = {}) {
    const qs = new URLSearchParams(params);
    return apiFetch('/builders?' + qs.toString());
  },

  getOne(idOrSlug) {
    return apiFetch('/builders/' + idOrSlug);
  },

  create(formData) {
    const headers = {};
    if (State.token) headers['Authorization'] = `Bearer ${State.token}`;
    return fetch(CONFIG.API_BASE + '/builders', {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    }).then(r => r.json()).then(d => { if (!d.success) throw new Error(d.message); return d; });
  },
};

// ── INQUIRIES ─────────────────────────────────────────────────────────────────

const InquiriesAPI = {
  send(payload) {
    return apiFetch('/inquiries', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getMy() {
    return apiFetch('/inquiries/my');
  },

  markRead(id) {
    return apiFetch('/inquiries/' + id + '/read', { method: 'PUT' });
  },
};

// ── ADS ───────────────────────────────────────────────────────────────────────

const AdsAPI = {
  getActive(slot) {
    const qs = slot ? '?slot=' + slot : '';
    return apiFetch('/ads' + qs);
  },

  trackClick(id) {
    return apiFetch('/ads/' + id + '/click', { method: 'POST' });
  },
};
