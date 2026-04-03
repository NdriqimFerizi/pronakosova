const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

// Notify seller when they receive a new inquiry
async function notifyNewInquiry({ listing, sellerEmail, inquiry, senderName, senderEmail, senderPhone }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;
  try {
    await transporter.sendMail({
      from: `"PronaKosova" <${process.env.SMTP_USER}>`,
      to: sellerEmail,
      subject: `📬 Mesazh i ri për pronën: ${listing.title}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:8px">
          <h2 style="color:#1a1a1a;margin-bottom:4px">Mesazh i ri nga PronaKosova</h2>
          <p style="color:#666;margin-top:0">Keni marrë një mesazh të ri për pronën tuaj.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:16px 0">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:6px 0;color:#888;width:120px">Prona:</td><td style="padding:6px 0;font-weight:600;color:#1a1a1a">${listing.title}</td></tr>
            <tr><td style="padding:6px 0;color:#888">Qyteti:</td><td style="padding:6px 0;color:#1a1a1a">${listing.city}</td></tr>
            <tr><td style="padding:6px 0;color:#888">Dërguesi:</td><td style="padding:6px 0;color:#1a1a1a">${senderName || 'I panjohur'}</td></tr>
            ${senderEmail ? `<tr><td style="padding:6px 0;color:#888">Email:</td><td style="padding:6px 0;color:#1a1a1a">${senderEmail}</td></tr>` : ''}
            ${senderPhone ? `<tr><td style="padding:6px 0;color:#888">Telefon:</td><td style="padding:6px 0;color:#1a1a1a">${senderPhone}</td></tr>` : ''}
          </table>
          <hr style="border:none;border-top:1px solid #eee;margin:16px 0">
          <p style="color:#888;font-size:13px;margin-bottom:4px">Mesazhi:</p>
          <p style="background:#fff;padding:12px 16px;border-left:3px solid #2c4a84;border-radius:4px;color:#1a1a1a;margin:0">${inquiry.message}</p>
          <div style="margin-top:24px;text-align:center">
            <a href="${process.env.CLIENT_URL}" style="display:inline-block;background:#2c4a84;color:#fff;text-decoration:none;padding:10px 24px;border-radius:6px;font-size:14px">Shko te PronaKosova →</a>
          </div>
          <p style="color:#bbb;font-size:11px;text-align:center;margin-top:24px">© PronaKosova · Kosovo Real Estate</p>
        </div>
      `,
    });
  } catch (e) {
    console.error('Email error:', e.message);
  }
}

module.exports = { notifyNewInquiry };
