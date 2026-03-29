/**
 * inquiry.js
 * Handles the inquiry / contact form:
 *   - Opens a modal with a message textarea
 *   - Supports both logged-in users and guests
 *   - Submits to POST /api/inquiries
 */

const Inquiry = {

  open(listingId, sellerName) {
    State.activeInquiryListingId = listingId;

    // Remove any existing inquiry modal
    document.getElementById('inquiryModal')?.remove();

    const isGuest = !State.user;
    const modal   = document.createElement('div');
    modal.id        = 'inquiryModal';
    modal.className = 'inquiry-modal-overlay open';

    modal.innerHTML = `
      <div class="inquiry-modal">
        <button class="modal-x" onclick="Inquiry.close()" style="position:absolute;top:14px;right:14px">✕</button>

        <h2 style="font-family:'Instrument Serif',serif;font-size:1.4rem;margin-bottom:4px">
          Dërgo Mesazh
        </h2>
        <p style="font-size:.82rem;color:var(--ink3);margin-bottom:18px">
          Tek: <strong>${sellerName}</strong>
        </p>

        ${isGuest ? `
          <div class="fg">
            <label>Emri Juaj</label>
            <input id="inq-name" type="text" placeholder="Emri dhe mbiemri">
          </div>
          <div class="fg">
            <label>Email</label>
            <input id="inq-email" type="email" placeholder="email@email.com">
          </div>
          <div class="fg">
            <label>Numri i Telefonit</label>
            <input id="inq-phone" type="tel" placeholder="+383 44 123 456">
          </div>
        ` : `
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;padding:10px;background:var(--bg);border-radius:8px">
            ${State.user.avatar
              ? `<img src="${State.user.avatar}" style="width:32px;height:32px;border-radius:50%;object-fit:cover">`
              : `<div style="width:32px;height:32px;border-radius:50%;background:var(--accent2);display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--accent)">${(State.user.name||'?')[0].toUpperCase()}</div>`
            }
            <div>
              <div style="font-size:.85rem;font-weight:600;color:var(--ink)">${State.user.name}</div>
              <div style="font-size:.73rem;color:var(--ink3)">${State.user.email}</div>
            </div>
          </div>
        `}

        <div class="fg">
          <label>Mesazhi</label>
          <textarea
            id="inq-msg"
            rows="4"
            style="width:100%;border:1.5px solid var(--border);border-radius:8px;padding:10px 12px;font-family:'Sora',sans-serif;font-size:.87rem;resize:vertical;outline:none;transition:border-color .18s"
            placeholder="Jam i interesuar për këtë pronë. A është ende e disponueshme?"
            onfocus="this.style.borderColor='var(--accent)'"
            onblur="this.style.borderColor='var(--border)'"></textarea>
        </div>

        <div class="form-error" id="inq-error"></div>

        <button class="btn-full" id="inq-btn" onclick="Inquiry.submit()">
          Dërgo Mesazhin →
        </button>
      </div>`;

    modal.addEventListener('click', e => { if (e.target === modal) this.close(); });
    document.body.appendChild(modal);

    // Focus the textarea
    setTimeout(() => document.getElementById('inq-msg')?.focus(), 100);
  },

  close() {
    document.getElementById('inquiryModal')?.remove();
  },

  async submit() {
    Form.clearError('inq-error');
    Form.setLoading('inq-btn', true);

    const message = document.getElementById('inq-msg')?.value?.trim();
    if (!message) {
      Form.showError('inq-error', 'Shkruani një mesazh.');
      Form.setLoading('inq-btn', false);
      return;
    }

    const payload = {
      listingId: State.activeInquiryListingId,
      message,
    };

    if (!State.user) {
      payload.guestName  = document.getElementById('inq-name')?.value?.trim() || '';
      payload.guestEmail = document.getElementById('inq-email')?.value?.trim() || '';
      payload.guestPhone = document.getElementById('inq-phone')?.value?.trim() || '';

      if (!payload.guestName || !payload.guestEmail) {
        Form.showError('inq-error', 'Emri dhe email-i janë të detyrueshëm.');
        Form.setLoading('inq-btn', false);
        return;
      }
    }

    try {
      await InquiriesAPI.send(payload);
      this.close();
      Toast.success('✅ Mesazhi u dërgua me sukses!');
    } catch (e) {
      Form.showError('inq-error', e.message);
      Form.setLoading('inq-btn', false);
    }
  },
};
