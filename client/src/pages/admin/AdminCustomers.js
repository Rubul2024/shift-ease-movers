import React, { useState } from 'react';
import api from '../../api';
import Icon from '../../components/Icon';
import { useFetch, useTitle, useDebounced, Alert, Empty } from '../../components/ui';
import { inr, date } from '../../utils/format';
import { downloadCSV, toQuery } from '../../utils/csv';

export default function AdminCustomers() {
  useTitle('Customers · Admin');
  const [q, setQ] = useState('');
  const query = useDebounced(q.trim());
  const { data, loading, error } = useFetch(() => api.customers(toQuery({ q: query })), [query]);
  const customers = data || [];

  const exportCSV = () =>
    downloadCSV('shiftease-customers', customers, [
      ['Name', (c) => c.name],
      ['Email', (c) => c.email],
      ['Phone', (c) => c.phone],
      ['Joined', (c) => date(c.createdAt)],
      ['Bookings', (c) => c.bookings],
      ['Spend (INR)', (c) => c.spend],
      ['Last booking', (c) => (c.lastBooking ? date(c.lastBooking) : '')],
    ]);

  return (
    <>
      <div className="dash-head">
        <div>
          <h1>Customers</h1>
          <p className="muted">Registered customer accounts with their bookings and total spend (excluding cancellations).</p>
        </div>
        <div className="toolbar">
          <div style={{ position: 'relative' }}>
            <Icon name="search" size={17} style={{ position: 'absolute', left: 11, top: 11, color: 'var(--ink-500)' }} />
            <input className="input" style={{ paddingLeft: 34 }} placeholder="Name, email or phone" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search customers" />
          </div>
          <button className="btn btn-outline btn-sm" onClick={exportCSV} disabled={!customers.length}><Icon name="download" size={15} /> Export CSV</button>
        </div>
      </div>
      <Alert>{error}</Alert>
      <div className="card">
        {loading ? <div className="spinner" /> : customers.length === 0 ? (
          <Empty icon="users"><p>No customers found.</p></Empty>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Customer</th><th>Phone</th><th>Joined</th><th>Bookings</th><th>Spend</th><th>Last booking</th></tr></thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div className="cell-strong">{c.name}</div>
                      <div className="small"><a className="text-blue" href={`mailto:${c.email}`}>{c.email}</a></div>
                    </td>
                    <td className="small">{c.phone ? <a className="text-blue" href={`tel:${c.phone}`}>{c.phone}</a> : '—'}</td>
                    <td className="small">{date(c.createdAt)}</td>
                    <td className="cell-strong">{c.bookings}</td>
                    <td className="cell-strong">{inr(c.spend)}</td>
                    <td className="small">{c.lastBooking ? date(c.lastBooking) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
