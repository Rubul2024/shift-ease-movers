// Thin fetch wrapper around the Express API.
// In development CRA proxies /api to http://localhost:5000 (see "proxy" in package.json).
const BASE = process.env.REACT_APP_API_URL || '/api';
const TOKEN_KEY = 'se_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error('Cannot reach the server. Is the API running on port 5000?');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

const api = {
  // auth
  login: (body) => request('/auth/login', { method: 'POST', body }),
  register: (body) => request('/auth/register', { method: 'POST', body }),
  me: () => request('/auth/me'),
  // areas
  areas: (all = false) => request(`/areas${all ? '?all=true' : ''}`),
  checkPincode: (pincode) => request(`/areas/check?pincode=${encodeURIComponent(pincode)}`),
  createArea: (body) => request('/areas', { method: 'POST', body }),
  updateArea: (id, body) => request(`/areas/${id}`, { method: 'PUT', body }),
  deleteArea: (id) => request(`/areas/${id}`, { method: 'DELETE' }),
  // contacts / inquiries
  sendContact: (body) => request('/contacts', { method: 'POST', body }),
  contacts: (params = '') => request(`/contacts${params}`),
  updateContact: (id, body) => request(`/contacts/${id}`, { method: 'PUT', body }),
  deleteContact: (id) => request(`/contacts/${id}`, { method: 'DELETE' }),
  // quotes
  estimate: (body) => request('/quotes/estimate', { method: 'POST', body }),
  createQuote: (body) => request('/quotes', { method: 'POST', body }),
  myQuotes: () => request('/quotes/mine'),
  quotes: () => request('/quotes'),
  updateQuote: (id, body) => request(`/quotes/${id}`, { method: 'PUT', body }),
  deleteQuote: (id) => request(`/quotes/${id}`, { method: 'DELETE' }),
  // bookings
  book: (body) => request('/bookings', { method: 'POST', body }),
  myBookings: () => request('/bookings/mine'),
  track: (id) => request(`/bookings/track/${encodeURIComponent(id)}`),
  cancelBooking: (id) => request(`/bookings/${id}/cancel`, { method: 'PUT' }),
  bookings: (status = '') => request(`/bookings${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  setBookingStatus: (id, body) => request(`/bookings/${id}/status`, { method: 'PUT', body }),
  // services
  services: () => request('/services'),
  createService: (body) => request('/services', { method: 'POST', body }),
  updateService: (id, body) => request(`/services/${id}`, { method: 'PUT', body }),
  deleteService: (id) => request(`/services/${id}`, { method: 'DELETE' }),
  // admin stats
  stats: () => request('/stats'),
};

export default api;
