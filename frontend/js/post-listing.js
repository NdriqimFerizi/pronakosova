/**
 * post-listing.js
 * Create / edit a listing.
 * PostListing.open()       — open blank create form
 * PostListing.open(id)     — open pre-filled edit form
 */

const PostListing = {
  _editId: null,

  // ── Open modal ────────────────────────────────────────────────────────────────
  open(listingId = null) {
    if (!State.user) { Auth.openLoginModal(); return; }
    const allowed = ['seller', 'company', 'admin'];
    if (!allowed.includes(State.user.accountType) && State.user.role !== 'admin') {
      Toast.error('Vetëm shitësit dhe kompanitë mund të postojnë prona.');
      return;
    }
    this._editId = listingId || null;

    // Build empty form first, then populate if editing
    this._buildForm(null);
    Modal.open('postListingModal');
    document.getElementById('pl-modal-title').textContent =
      listingId ? 'Ndrysho Pronën' : 'Posto Pronën';

    if (listingId) {
      const formEl = document.getElementById('postListingForm');
      formEl.innerHTML = `<div style="padding:48px;text-align:center;color:var(--ink3)">Duke ngarkuar...</div>`;
      ListingsAPI.getOne(listingId)
        .then(d => this._buildForm(d.listing))
        .catch(e => Toast.error(e.message));
    }
  },

  close() {
    Modal.close('postListingModal');
    this._editId = null;
  },

  // ── Build the form HTML ───────────────────────────────────────────────────────
  _buildForm(listing) {
    const cities = CONFIG.CITIES
      .map(c => `<option value="${c}" ${listing?.city === c ? 'selected' : ''}>${c}</option>`)
      .join('');

    const propertyTypes = [
      ['apartament', 'Apartament'], ['shtepi', 'Shtëpi'], ['vila', 'Vila'],
      ['zyre', 'Zyrë'], ['dyqan', 'Dyqan'], ['garazh', 'Garazh'],
      ['toke', 'Tokë'], ['tjeter', 'Tjetër'],
    ].map(([v, l]) =>
      `<option value="${v}" ${listing?.propertyType === v ? 'selected' : ''}>${l}</option>`
    ).join('');

    const furnishedOpts = [
      ['pa-mobilim', 'Pa mobilim'], ['gjysme-mobiluar', 'Gjysmë i mobiluar'],
      ['plotesisht-mobiluar', 'Plotësisht i mobiluar'], ['nuk-aplikohet', 'Nuk aplikohet'],
    ].map(([v, l]) =>
      `<option value="${v}" ${listing?.furnished === v ? 'selected' : ''}>${l}</option>`
    ).join('');

    const priceTypeOpts = [
      ['total', 'Çmim total'], ['per-muaj', 'Në muaj'], ['per-m2', 'Për m²'],
    ].map(([v, l]) =>
      `<option value="${v}" ${listing?.priceType === v ? 'selected' : ''}>${l}</option>`
    ).join('');

    const am = listing?.amenities || {};
    const amenitiesList = [
      ['elevator', 'Lift'], ['balcony', 'Ballkon'], ['garden', 'Kopsht'],
      ['pool', 'Pishinë'], ['security', 'Siguri'], ['centralHeating', 'Ngrohje qendrore'],
      ['airConditioning', 'Klimë'], ['internetIncluded', 'Internet i përfshirë'],
    ].map(([k, l]) => `
      <label class="check-lbl">
        <input type="checkbox" name="am-${k}" ${am[k] ? 'checked' : ''}> ${l}
      </label>`).join('');

    const defaultType = listing?.listingType || 'shitet';
    const typeLabels = { 'shitet': 'Shitet', 'me-qira': 'Me Qira', 'i-ri': 'I Ri' };
    const typeButtons = Object.entries(typeLabels).map(([t, l]) => `
      <button type="button" class="ltype-btn ${defaultType === t ? 'active' : ''}"
        data-type="${t}" onclick="PostListing._pickType(this)">${l}</button>
    `).join('');

    const formEl = document.getElementById('postListingForm');
    if (!formEl) return;

    formEl.innerHTML = `
      <input type="hidden" id="pl-type" value="${defaultType}">

      <div class="pl-section">
        <div class="pl-sec-title">Lloji i Listimit</div>
        <div class="ltype-row">${typeButtons}</div>
      </div>

      <div class="pl-section">
        <div class="pl-sec-title">Informata Bazë</div>
        <div class="fg">
          <label>Titulli *</label>
          <input id="pl-title" type="text" placeholder="p.sh. Apartament 2+1 në qendër të Prishtinës"
            value="${this._esc(listing?.title || '')}">
        </div>
        <div class="fg">
          <label>Përshkrimi *</label>
          <textarea id="pl-desc" rows="4" class="pl-textarea"
            placeholder="Përshkruani pronën tuaj në detaje...">${this._esc(listing?.description || '')}</textarea>
        </div>
        <div class="fg-row">
          <div class="fg">
            <label>Lloji i Pronës *</label>
            <select id="pl-proptype">${propertyTypes}</select>
          </div>
          <div class="fg">
            <label>Mobilimi</label>
            <select id="pl-furnished">${furnishedOpts}</select>
          </div>
        </div>
      </div>

      <div class="pl-section">
        <div class="pl-sec-title">Çmimi</div>
        <div class="fg-row">
          <div class="fg">
            <label>Çmimi (€) *</label>
            <input id="pl-price" type="number" min="0" placeholder="95000"
              value="${listing?.price || ''}">
          </div>
          <div class="fg">
            <label>Lloji i Çmimit</label>
            <select id="pl-pricetype">${priceTypeOpts}</select>
          </div>
        </div>
        <label class="check-lbl mt-0">
          <input type="checkbox" id="pl-negotiable" ${listing?.negotiable ? 'checked' : ''}>
          Çmim i negociueshëm
        </label>
      </div>

      <div class="pl-section">
        <div class="pl-sec-title">Lokacioni</div>
        <div class="fg-row">
          <div class="fg">
            <label>Qyteti *</label>
            <select id="pl-city">
              <option value="">Zgjidhni qytetin</option>
              ${cities}
            </select>
          </div>
          <div class="fg">
            <label>Lagjja</label>
            <input id="pl-neighborhood" type="text" placeholder="p.sh. Dardania"
              value="${this._esc(listing?.neighborhood || '')}">
          </div>
        </div>
        <div class="fg">
          <label>Adresa</label>
          <input id="pl-address" type="text" placeholder="p.sh. Rr. Fehmi Agani nr. 12"
            value="${this._esc(listing?.address || '')}">
        </div>
      </div>

      <div class="pl-section">
        <div class="pl-sec-title">Detajet Teknike</div>
        <div class="fg-row fg-row-3">
          <div class="fg">
            <label>Dhoma</label>
            <input id="pl-rooms" type="number" min="0" placeholder="3"
              value="${listing?.rooms != null ? listing.rooms : ''}">
          </div>
          <div class="fg">
            <label>Banja</label>
            <input id="pl-bathrooms" type="number" min="0" placeholder="1"
              value="${listing?.bathrooms != null ? listing.bathrooms : ''}">
          </div>
          <div class="fg">
            <label>Sipërfaqja (m²)</label>
            <input id="pl-area" type="number" min="0" placeholder="80"
              value="${listing?.area != null ? listing.area : ''}">
          </div>
        </div>
        <div class="fg-row fg-row-3">
          <div class="fg">
            <label>Kati</label>
            <input id="pl-floor" type="number" min="0" placeholder="3"
              value="${listing?.floor != null ? listing.floor : ''}">
          </div>
          <div class="fg">
            <label>Katet Gjithsej</label>
            <input id="pl-totalfloors" type="number" min="0" placeholder="8"
              value="${listing?.totalFloors != null ? listing.totalFloors : ''}">
          </div>
          <div class="fg">
            <label>Viti i Ndërtimit</label>
            <input id="pl-yearbuilt" type="number" min="1900" max="2030" placeholder="2020"
              value="${listing?.yearBuilt != null ? listing.yearBuilt : ''}">
          </div>
        </div>
        <label class="check-lbl mt-0">
          <input type="checkbox" id="pl-parking" ${listing?.parking ? 'checked' : ''}> Ka parking
        </label>
      </div>

      <div class="pl-section">
        <div class="pl-sec-title">Karakteristikat</div>
        <div class="amenities-grid">${amenitiesList}</div>
      </div>

      <div class="pl-section">
        <div class="pl-sec-title">Kontakt</div>
        <div class="fg">
          <label>Telefon Kontakti</label>
          <input id="pl-phone" type="tel" placeholder="+383 44 123 456"
            value="${this._esc(listing?.contactPhone || State.user?.phone || '')}">
        </div>
      </div>

      <div class="pl-section">
        <div class="pl-sec-title">Fotot</div>
        <div class="pl-upload-area" onclick="document.getElementById('pl-images').click()" id="pl-drop-zone">
          <div class="pl-upload-icon">📷</div>
          <div class="pl-upload-text">Klikoni ose tërhiqni fotot këtu</div>
          <div class="pl-upload-sub">PNG, JPG deri në 10 MB secila</div>
          <input type="file" id="pl-images" multiple accept="image/*"
            style="display:none" onchange="PostListing._previewImages(this)">
        </div>
        <div id="pl-img-preview" class="pl-img-preview"></div>
        ${listing?.images?.length
          ? `<p style="font-size:.76rem;color:var(--ink3);margin-top:6px">📎 Tashmë ka ${listing.images.length} foto — fotot e reja shtohen mbi ato ekzistuese.</p>`
          : ''}
      </div>

      <div class="form-error" id="pl-error"></div>
    `;

    // Drag-and-drop support
    const zone = document.getElementById('pl-drop-zone');
    if (zone) {
      zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
      zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
      zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        const input = document.getElementById('pl-images');
        if (input) {
          // Assign dropped files to input (DataTransfer)
          const dt = new DataTransfer();
          Array.from(e.dataTransfer.files)
            .filter(f => f.type.startsWith('image/'))
            .forEach(f => dt.items.add(f));
          input.files = dt.files;
          PostListing._previewImages(input);
        }
      });
    }
  },

  // ── Toggle listing type buttons ───────────────────────────────────────────────
  _pickType(btn) {
    document.querySelectorAll('.ltype-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const el = document.getElementById('pl-type');
    if (el) el.value = btn.dataset.type;
  },

  // ── Image preview ─────────────────────────────────────────────────────────────
  _previewImages(input) {
    const preview = document.getElementById('pl-img-preview');
    if (!preview) return;
    preview.innerHTML = '';
    Array.from(input.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        const div = document.createElement('div');
        div.className = 'pl-img-thumb';
        div.innerHTML = `<img src="${e.target.result}" alt="preview">`;
        preview.appendChild(div);
      };
      reader.readAsDataURL(file);
    });
  },

  // ── Submit ────────────────────────────────────────────────────────────────────
  async submit() {
    Form.clearError('pl-error');
    Form.setLoading('pl-submit-btn', true);

    const val = id => document.getElementById(id)?.value?.trim() || '';
    const num = id => {
      const v = document.getElementById(id)?.value;
      return (v !== '' && v != null) ? Number(v) : undefined;
    };
    const chk = id => document.getElementById(id)?.checked || false;

    const title       = val('pl-title');
    const description = val('pl-desc');
    const price       = num('pl-price');
    const city        = val('pl-city');

    if (!title) {
      Form.showError('pl-error', 'Titulli është i detyrueshëm.');
      Form.setLoading('pl-submit-btn', false);
      return;
    }
    if (!description) {
      Form.showError('pl-error', 'Përshkrimi është i detyrueshëm.');
      Form.setLoading('pl-submit-btn', false);
      return;
    }
    if (!price || price <= 0) {
      Form.showError('pl-error', 'Çmimi duhet të jetë pozitiv.');
      Form.setLoading('pl-submit-btn', false);
      return;
    }
    if (!city) {
      Form.showError('pl-error', 'Qyteti është i detyrueshëm.');
      Form.setLoading('pl-submit-btn', false);
      return;
    }

    const fd = new FormData();
    fd.append('title',       title);
    fd.append('description', description);
    fd.append('listingType', document.getElementById('pl-type')?.value || 'shitet');
    fd.append('propertyType', val('pl-proptype') || 'apartament');
    fd.append('price',       price);
    fd.append('priceType',   val('pl-pricetype') || 'total');
    fd.append('negotiable',  chk('pl-negotiable'));
    fd.append('city',        city);
    fd.append('furnished',   val('pl-furnished') || 'nuk-aplikohet');
    fd.append('parking',     chk('pl-parking'));

    const neighborhood = val('pl-neighborhood');
    const address      = val('pl-address');
    const phone        = val('pl-phone');
    if (neighborhood) fd.append('neighborhood', neighborhood);
    if (address)      fd.append('address', address);
    if (phone)        fd.append('contactPhone', phone);

    const optNums = [
      ['rooms', 'pl-rooms'], ['bathrooms', 'pl-bathrooms'], ['area', 'pl-area'],
      ['floor', 'pl-floor'], ['totalFloors', 'pl-totalfloors'], ['yearBuilt', 'pl-yearbuilt'],
    ];
    optNums.forEach(([key, elId]) => {
      const v = num(elId);
      if (v !== undefined) fd.append(key, v);
    });

    // Amenities
    const amKeys = ['elevator','balcony','garden','pool','security','centralHeating','airConditioning','internetIncluded'];
    amKeys.forEach(k => {
      const el = document.querySelector(`input[name="am-${k}"]`);
      if (el) fd.append(`amenities[${k}]`, el.checked);
    });

    // Images
    const imgInput = document.getElementById('pl-images');
    if (imgInput?.files?.length) {
      Array.from(imgInput.files).forEach(f => fd.append('images', f));
    }

    try {
      if (this._editId) {
        await ListingsAPI.update(this._editId, fd);
        Toast.success('✅ Prona u përditësua me sukses!');
      } else {
        await ListingsAPI.create(fd);
        Toast.success('✅ Prona u postua me sukses!');
      }
      this.close();
      Listings.load(1);
    } catch (e) {
      Form.showError('pl-error', e.message);
    } finally {
      Form.setLoading('pl-submit-btn', false);
    }
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
function openPostListing(id)  { PostListing.open(id || null); }
function closePostListing()   { PostListing.close(); }
function submitPostListing()  { PostListing.submit(); }
