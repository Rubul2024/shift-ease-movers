/**
 * Transactional email (booking confirmations, status updates, inquiry alerts, password resets).
 * Configure SMTP_* in .env to send real mail. Without SMTP, messages are logged in development
 * and skipped in production. Sending never blocks or fails the API request that triggered it.
 */
const nodemailer = require('nodemailer');
const { escapeHtml } = require('./validate');

const isProd = process.env.NODE_ENV === 'production';
const COMPANY = process.env.COMPANY_NAME || 'ShiftEase Movers';
const FROM = process.env.MAIL_FROM || `${COMPANY} <no-reply@shiftease.in>`;

let transporter = null;
if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
}

const isConfigured = () => !!transporter;

/** Public site URL for links in emails. APP_URL wins; otherwise the caller's Origin header. */
function siteUrl(req) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  const origin = req && req.get('origin');
  if (origin) return origin;
  return req ? `${req.protocol}://${req.get('host')}` : '';
}

function layout(title, bodyHtml) {
  return `<!doctype html><html><body style="margin:0;background:#f6f8fc;font-family:Segoe UI,Roboto,Arial,sans-serif;color:#0f172a">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:14px;border:1px solid #e5eaf2">
      <tr><td style="background:#0b2a5b;color:#fff;padding:18px 24px;border-radius:14px 14px 0 0;font-weight:800;font-size:20px">
        Shift<span style="color:#7ed957">Ease</span> <span style="font-size:11px;letter-spacing:2px;color:#9cc0ff">PACKERS &amp; MOVERS</span>
      </td></tr>
      <tr><td style="padding:24px">
        <h2 style="margin:0 0 14px;color:#0b2a5b;font-size:20px">${escapeHtml(title)}</h2>
        ${bodyHtml}
      </td></tr>
      <tr><td style="padding:16px 24px;border-top:1px solid #e5eaf2;font-size:12px;color:#64748b">
        ${escapeHtml(COMPANY)} &middot; This is an automated message.
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

/** rows: [[label, value], ...] rendered as a two-column table (values are escaped). */
function detailsTable(rows) {
  return `<table cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;margin:12px 0">${rows
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 0;color:#64748b;width:40%">${escapeHtml(k)}</td><td style="padding:6px 0;font-weight:600">${escapeHtml(v)}</td></tr>`
    )
    .join('')}</table>`;
}

function button(href, label) {
  return `<p style="margin:20px 0"><a href="${escapeHtml(href)}" style="background:#1f5bd8;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:700;display:inline-block">${escapeHtml(label)}</a></p>`;
}

/** Fire-and-forget send. Resolves to true when the message was handed to SMTP. */
async function sendMail({ to, subject, html, text, replyTo }) {
  if (!to) return false;
  if (!transporter) {
    if (!isProd) console.log(`[mail:dev] To: ${to} | ${subject}${text ? `\n${text}` : ''}`);
    return false;
  }
  try {
    await transporter.sendMail({ from: FROM, to, subject, html, text, replyTo });
    return true;
  } catch (err) {
    console.error(`Email to ${to} failed:`, err.message);
    return false;
  }
}

const inr = (n) => `Rs. ${Number(n || 0).toLocaleString('en-IN')}`;
const day = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const areaName = (a) => (a && a.name ? `${a.name}, ${a.city}` : '');

const templates = {
  bookingConfirmed(booking, user, url) {
    const trackUrl = `${url}/track/${booking.bookingId}`;
    return {
      subject: `Booking confirmed: ${booking.bookingId}`,
      html: layout(
        'Your moving cab is booked',
        `<p>Hi ${escapeHtml(booking.contactName)}, thank you for choosing ${escapeHtml(COMPANY)}. Our crew will call you the evening before your move to confirm the arrival window.</p>
        ${detailsTable([
          ['Booking ID', booking.bookingId],
          ['Moving date', `${day(booking.movingDate)}, ${booking.timeSlot}`],
          ['From', `${areaName(booking.pickupArea)} - ${booking.pickupAddress}`],
          ['To', `${areaName(booking.dropArea)} - ${booking.dropAddress}`],
          ['Home / vehicle', `${booking.houseType} / ${booking.vehicleType}`],
          ['Amount (incl. GST)', inr(booking.amount)],
        ])}
        ${button(trackUrl, 'Track your move')}
        <p style="font-size:13px;color:#64748b">Free cancellation until pickup from My Moves. Payment is collected after delivery.</p>`
      ),
      text: `Booking ${booking.bookingId} confirmed for ${day(booking.movingDate)} ${booking.timeSlot}. Amount ${inr(booking.amount)}. Track: ${trackUrl}`,
    };
  },

  bookingStatus(booking, url) {
    const trackUrl = `${url}/track/${booking.bookingId}`;
    return {
      subject: `Update on booking ${booking.bookingId}: ${booking.status}`,
      html: layout(
        `Your move is now: ${booking.status}`,
        `<p>Hi ${escapeHtml(booking.contactName)}, here is the latest on your booking <b>${escapeHtml(booking.bookingId)}</b>.</p>
        ${detailsTable([
          ['Status', booking.status],
          ['Moving date', `${day(booking.movingDate)}, ${booking.timeSlot}`],
          ['Route', `${areaName(booking.pickupArea)} to ${areaName(booking.dropArea)}`],
        ])}
        ${button(trackUrl, 'View live status')}`
      ),
      text: `Booking ${booking.bookingId} is now ${booking.status}. Track: ${trackUrl}`,
    };
  },

  newInquiry(contact, url) {
    return {
      subject: `New inquiry: ${contact.subject} - ${contact.name}`,
      html: layout(
        'New website inquiry',
        `${detailsTable([
          ['Name', contact.name],
          ['Phone', contact.phone],
          ['Email', contact.email],
          ['City', contact.city],
          ['Subject', contact.subject],
        ])}
        <p style="white-space:pre-wrap;background:#f6f8fc;padding:12px;border-radius:10px">${escapeHtml(contact.message)}</p>
        ${button(`${url}/admin/contacts`, 'Open in admin panel')}`
      ),
      text: `${contact.name} (${contact.phone}, ${contact.email}): ${contact.message}`,
    };
  },

  inquiryReceived(contact) {
    return {
      subject: `We received your inquiry - ${COMPANY}`,
      html: layout(
        'Thanks for reaching out',
        `<p>Hi ${escapeHtml(contact.name)}, we've received your message about <b>${escapeHtml(contact.subject)}</b>. A moving advisor will call you on ${escapeHtml(contact.phone)} shortly (within 30 minutes during working hours).</p>`
      ),
      text: `Hi ${contact.name}, we've received your inquiry and will call you on ${contact.phone} shortly.`,
    };
  },

  quoteReady(quote, url) {
    const b = quote.breakdown || {};
    return {
      subject: `Your moving quotation - ${inr(b.total)}`,
      html: layout(
        'Your moving quotation',
        `<p>Hi ${escapeHtml(quote.name)}, here is your instant quotation. A moving advisor will call you to walk you through it.</p>
        ${detailsTable([
          ['Route', `${areaName(quote.fromArea)} to ${areaName(quote.toArea)} (${quote.distanceKm} km)`],
          ['Moving date', day(quote.movingDate)],
          ['Home / vehicle', `${quote.houseType} / ${quote.vehicleType}`],
          ['Subtotal', inr(b.subtotal)],
          ['GST (18%)', inr(b.gst)],
          ['Total', inr(b.total)],
        ])}
        ${button(`${url}/book?${new URLSearchParams({ from: String(quote.fromArea?._id || ''), to: String(quote.toArea?._id || ''), house: quote.houseType })}`, 'Book this move')}`
      ),
      text: `Your quote: ${inr(b.total)} for ${quote.houseType} on ${day(quote.movingDate)}.`,
    };
  },

  passwordReset(user, link) {
    return {
      subject: `Reset your ${COMPANY} password`,
      html: layout(
        'Reset your password',
        `<p>Hi ${escapeHtml(user.name)}, we received a request to reset your password. This link is valid for 1 hour.</p>
        ${button(link, 'Choose a new password')}
        <p style="font-size:13px;color:#64748b">If you didn't ask for this, you can ignore this email. Your password won't change.</p>`
      ),
      text: `Reset your password (valid for 1 hour): ${link}`,
    };
  },
};

module.exports = { sendMail, templates, siteUrl, isConfigured };
