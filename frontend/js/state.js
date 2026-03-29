/**
 * state.js
 * Single source of truth for all app state.
 * All modules read/write through this object.
 */

const State = {
  // ── Auth ─────────────────────────────────────────────────────
  user:  null,
  token: localStorage.getItem('pk_token') || null,

  // ── Listings ─────────────────────────────────────────────────
  currentPage:  1,
  totalPages:   1,
  totalListings: 0,

  // ── Active filters ────────────────────────────────────────────
  filters: {
    listingType:  '',   // 'shitet' | 'me-qira' | 'i-ri' | ''
    propertyType: '',   // 'apartament' | 'shtepi' | ... | ''
    city:         '',
    search:       '',
  },

  // ── Modal ─────────────────────────────────────────────────────
  modalMode:           'register', // 'login' | 'register' | 'company'
  selectedAccountType: 'buyer',    // 'buyer' | 'seller' | 'company'

  // ── Inquiry ───────────────────────────────────────────────────
  activeInquiryListingId: null,

  // ── Helpers ──────────────────────────────────────────────────
  setUser(user) {
    this.user  = user;
  },
  setToken(token) {
    this.token = token;
    if (token) localStorage.setItem('pk_token', token);
    else        localStorage.removeItem('pk_token');
  },
  clearAuth() {
    this.user  = null;
    this.token = null;
    localStorage.removeItem('pk_token');
  },
  resetFilters() {
    this.filters = { listingType:'', propertyType:'', city:'', search:'' };
  },
};
