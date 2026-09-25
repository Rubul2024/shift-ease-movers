// Thin fetch wrapper around the Express API.
// In development CRA proxies /api to http://127.0.0.1:5000 (see src/setupProxy.js).
const BASE = process.env.REACT_APP_API_URL || '/api';
const TOKEN_KEY = 'se_token';

// localStorage can throw (private mode, blocked storage), so never let it crash the app.
export const tokenStore = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (t) => {
    try {
      localStorage.setItem(TOKEN_KEY, t);
    } catch {
      /* session will last until reload */
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* nothing stored */
    }
  },
};

// Fired when the server rejects our token so AuthContext can log the user out.
export const SESSION_EXPIRED_EVENT = 'se:session-expired';

export async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error('Cannot reach the server. Please check your connection and try again.');
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && token) {
    tokenStore.clear();
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

const api = {
  // auth
  login: (body) => request('/auth/login', { method: 'POST', body }),
  register: (body) => request('/auth/register', { method: 'POST', body }),
  me: () => request('/auth/me'),
  updateProfile: (body) => request('/auth/me', { method: 'PUT', body }),
  changePassword: (body) => request('/auth/password', { method: 'PUT', body }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: { email } }),
  resetPassword: (token, password) => request(`/auth/reset-password/${encodeURIComponent(token)}`, { method: 'POST', body: { password } }),
  // areas
  areas: (all = false) => request(`/areas${all ? '?all=true' : ''}`),
  availability: (areaId, date) => request(`/areas/${areaId}/availability?date=${encodeURIComponent(date)}`),
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
  quotes: (params = '') => request(`/quotes${params}`),
  updateQuote: (id, body) => request(`/quotes/${id}`, { method: 'PUT', body }),
  deleteQuote: (id) => request(`/quotes/${id}`, { method: 'DELETE' }),
  // bookings
  book: (body) => request('/bookings', { method: 'POST', body }),
  myBookings: () => request('/bookings/mine'),
  track: (id) => request(`/bookings/track/${encodeURIComponent(id)}`),
  cancelBooking: (id) => request(`/bookings/${id}/cancel`, { method: 'PUT' }),
  bookings: (params = '') => request(`/bookings${params}`),
  booking: (id) => request(`/bookings/${id}`),
  setBookingStatus: (id, body) => request(`/bookings/${id}/status`, { method: 'PUT', body }),
  // services
  services: (all = false) => request(`/services${all ? '?all=true' : ''}`),
  createService: (body) => request('/services', { method: 'POST', body }),
  updateService: (id, body) => request(`/services/${id}`, { method: 'PUT', body }),
  deleteService: (id) => request(`/services/${id}`, { method: 'DELETE' }),
  // newsletter
  subscribe: (email) => request('/newsletter', { method: 'POST', body: { email } }),
  subscribers: () => request('/newsletter'),
  deleteSubscriber: (id) => request(`/newsletter/${id}`, { method: 'DELETE' }),
  // customers (admin)
  customers: (params = '') => request(`/users${params}`),
  // admin stats
  stats: () => request('/stats'),
};

export default api;
