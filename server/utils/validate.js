/** Small request helpers shared by the routes. */

/** Error that the central handler turns into a JSON response with the given status. */
function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/** Copies only the listed keys from a request body (prevents mass assignment). */
const pick = (obj = {}, keys) =>
  Object.fromEntries(keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 10-digit mobile, optionally with +91 / spaces / dashes.
const PHONE_RE = /^\+?[0-9][0-9\s-]{8,15}$/;

/** Parses a YYYY-MM-DD moving date; throws 400 if it's invalid, in the past, or over a year out. */
function parseMoveDate(value) {
  const date = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const limit = new Date(today);
  limit.setFullYear(limit.getFullYear() + 1);
  if (!value || Number.isNaN(date.getTime()) || date < today) throw httpError(400, 'Please choose today or a future date');
  if (date > limit) throw httpError(400, 'Moves can be booked up to one year in advance');
  return date;
}

/** Escapes text for safe interpolation into HTML emails. */
const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

module.exports = { httpError, pick, escapeRegex, isNonEmptyString, escapeHtml, parseMoveDate, EMAIL_RE, PHONE_RE };
