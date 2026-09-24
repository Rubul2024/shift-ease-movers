export const inr = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

export const date = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

export const dateTime = (d) =>
  d
    ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '-';

export const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

export const areaLabel = (a) => (a ? `${a.name}, ${a.city}` : '-');

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

export const STATUS_TONE = {
  Confirmed: 'blue',
  'Vehicle Assigned': 'blue',
  'Picked Up': 'warn',
  'In Transit': 'warn',
  Delivered: 'green',
  Cancelled: 'red',
  New: 'navy',
  Contacted: 'blue',
  Converted: 'green',
  Closed: 'gray',
  Sent: 'blue',
  Accepted: 'green',
  Rejected: 'red',
};
