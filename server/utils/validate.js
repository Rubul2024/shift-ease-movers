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

module.exports = { httpError, pick, escapeRegex, isNonEmptyString };
