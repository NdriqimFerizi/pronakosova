/**
 * config.js
 * Central configuration — change API_BASE to your backend URL
 */

const CONFIG = {
  // ── Backend URL ──────────────────────────────────────────────
  // Development:
  API_BASE: 'http://localhost:5000/api',
  // Production (uncomment and change):
  // API_BASE: 'https://api.pronakosova.com/api',

  // ── Pagination ───────────────────────────────────────────────
  LISTINGS_PER_PAGE: 6,

  // ── Cities ───────────────────────────────────────────────────
  CITIES: [
    'Prishtinë', 'Prizren', 'Pejë', 'Ferizaj',
    'Gjakovë', 'Mitrovicë', 'Gjilan', 'Vushtrri',
    'Podujevë', 'Lipjan', 'Drenas', 'Klinë',
  ],

  // ── Listing type maps ─────────────────────────────────────────
  BADGE_CLASS: {
    'shitet':   'b-sell',
    'me-qira':  'b-rent',
    'i-ri':     'b-new',
  },
  BADGE_LABEL: {
    'shitet':   'Shitet',
    'me-qira':  'Me Qira',
    'i-ri':     'I Ri',
  },
  PROPERTY_EMOJI: {
    'apartament': '🏢',
    'shtepi':     '🏠',
    'vila':       '🏘',
    'zyre':       '🏢',
    'toke':       '🌳',
    'dyqan':      '🏪',
    'garazh':     '🚗',
    'tjeter':     '🏗',
  },
  THUMB_COLORS: [
    '#dce9ff','#d5f0e5','#fdebd0','#ede8f5',
    '#d6eaf8','#e0f5ec','#fdf3d0','#f0e8f5',
  ],
};

// Freeze so nothing accidentally mutates config
Object.freeze(CONFIG);
