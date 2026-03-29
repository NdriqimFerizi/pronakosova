# PronaKosova

Kosovo real estate marketplace. Albanian-language platform for buying, selling, and renting properties.

## Stack

- **Frontend**: Vanilla HTML/CSS/JS (no framework), single `index.html`
- **Backend**: Node.js + Express + MongoDB (Mongoose)
- **Auth**: JWT + Google OAuth (Passport.js)
- **Images**: Cloudinary via multer-storage-cloudinary
- **Deployment**: Vercel (monorepo — frontend static + backend serverless)

## Structure

```
pronakosova/
├── backend/
│   ├── config/         # db.js, passport.js, cloudinary.js
│   ├── controllers/    # authController, listingController, builderController, inquiryController
│   ├── middleware/     # auth.js (protect, authorize, optionalAuth), errorHandler.js
│   ├── models/         # User, Listing, Builder, Inquiry, Ad
│   ├── routes/         # auth, listings, builders, inquiries, ads
│   ├── utils/          # sendToken.js, seed.js
│   └── server.js
└── frontend/
    ├── css/styles.css
    ├── js/
    │   ├── config.js        # CONFIG object (API_BASE, CITIES, etc.)
    │   ├── state.js         # State singleton (user, token, filters)
    │   ├── api.js           # apiFetch wrapper + API namespaces (AuthAPI, ListingsAPI, …)
    │   ├── ui.js            # Toast, Modal, Form, Pagination, Skeleton, Dropdown helpers
    │   ├── auth.js          # Auth object (login/register/Google OAuth/nav update)
    │   ├── listings.js      # Listings object (load, render cards, toggleSave)
    │   ├── detail.js        # Detail slide-in panel
    │   ├── inquiry.js       # Inquiry contact modal
    │   ├── builders.js      # Builders grid
    │   ├── search.js        # Search bar + tab filters
    │   ├── post-listing.js  # PostListing create/edit modal (sellers/companies)
    │   ├── dashboard.js     # Dashboard panel (profile, my listings, saved, messages)
    │   └── app.js           # Bootstrap — DOMContentLoaded init
    └── index.html           # Single page (also contains a legacy inline script)
```

## Key notes

- **Dual script system**: `index.html` contains a large legacy inline `<script>` that runs first on page load (uses lowercase `state`, `api()` helper). The modular JS files are loaded immediately after and use `State`/`Auth`/`Listings` etc. Both coexist — the modular system runs last and "wins" nav updates.
- **Language**: All UI text is in Albanian (sq). Keep it that way.
- **Auth flow**: JWT stored in `localStorage` as `pk_token`. Google OAuth redirects back with `?token=xxx`.
- **Listing types**: `shitet` (for sale) | `me-qira` (for rent) | `i-ri` (new development)
- **Property types**: `apartament` | `shtepi` | `vila` | `zyre` | `dyqan` | `garazh` | `toke` | `tjeter`
- **Account types**: `buyer` | `seller` | `company` — only seller/company/admin can post listings

## Running locally

```bash
# Backend
cd backend && cp ../.env.example .env  # fill in your values
npm install
npm run dev   # nodemon on :5000

# Seed database (optional)
npm run seed

# Frontend
# Just open frontend/index.html — CONFIG.API_BASE defaults to '/api' (Vercel proxy)
# For local dev, change CONFIG.API_BASE to 'http://localhost:5000/api' in config.js
```

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | — | Register |
| POST | /api/auth/login | — | Login |
| GET | /api/auth/google | — | Google OAuth redirect |
| GET | /api/auth/me | JWT | Get current user (populated savedListings) |
| PUT | /api/auth/me | JWT | Update profile |
| PUT | /api/auth/change-password | JWT | Change password |
| GET | /api/listings | — | List listings (filterable) |
| POST | /api/listings | seller/company | Create listing (multipart) |
| GET | /api/listings/:id | — | Get single listing |
| PUT | /api/listings/:id | owner/admin | Update listing (multipart) |
| DELETE | /api/listings/:id | owner/admin | Soft-delete listing |
| POST | /api/listings/:id/save | JWT | Toggle save/unsave |
| GET | /api/listings/stats/cities | — | City listing counts |
| GET | /api/inquiries/my | JWT | Get my received inquiries |
| POST | /api/inquiries | optional | Send inquiry |
| PUT | /api/inquiries/:id/read | JWT | Mark inquiry as read |
| GET | /api/builders | — | List builders |
| GET | /api/ads | — | Get active ads |
