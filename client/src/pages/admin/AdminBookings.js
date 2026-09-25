import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import Icon from '../../components/Icon';
import { useFetch, useTitle, useDebounced, Alert, Empty, Modal, StatusTag, TRACK_STEPS } from '../../components/ui';
import { inr, date, areaLabel } from '../../utils/format';
import { downloadCSV, toQuery } from '../../utils/csv';

const ALL = [...TRACK_STEPS, 'Cancelled'];

export default function AdminBookings() {
  useTitle('Bookings · Admin');
  const [filter, setFilter] = useState('');
  const [q, setQ] = useState('');
  const query = useDebounced(q.trim());
  const { data, loading, error, setData } = useFetch(() => api.bookings(toQuery({ status: filter, q: query })), [filter, query]);
  const [msg, setMsg] = useState({ type: 'error', text: '' });
  const [change, setChange] = useState(null); // { booking, status, note }
  const [saving, setSaving] = useState(false);
  const bookings = data || [];

  const save = async (e) => {
    e.preventDefault();
    const { booking: b, status, note } = change;
    setSaving(true);
    try {
      const updated = await api.setBookingStatus(b._id, { status, note });
      setData(bookings.map((x) => (x._id === b._id ? { ...updated, user: x.user } : x)));
      setMsg({ type: 'success', text: `${b.bookingId} → ${status}. The customer can see it on their tracker.` });
      setChange(null);
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const exportCSV = () =>
    downloadCSV('shiftease-bookings', bookings, [
      ['Booking ID', (b) => b.bookingId],
      ['Booked on', (b) => date(b.createdAt)],
      ['Customer', (b) => b.contactName],
      ['Phone', (b) => b.contactPhone],
      ['Email', (b) => b.user?.email],
      ['Pickup', (b) => `${areaLabel(b.pickupArea)} - ${b.pickupAddress}`],
      ['Drop', (b) => `${areaLabel(b.dropArea)} - ${b.dropAddress}`],
      ['Moving date', (b) => date(b.movingDate)],
      ['Slot', (b) => b.timeSlot],
      ['Home', (b) => b.houseType],
      ['Vehicle', (b) => b.vehicleType],
      ['Km', (b) => b.distanceKm],
      ['Amount (INR)', (b) => b.amount],
      ['Status', (b) => b.status],
    ]);

  return (
    <>
      <div className="dash-head">
        <div>
          <h1>Bookings</h1>
          <p className="muted">Update status as the move progresses. Customers see every change on their tracker and get an email.</p>
        </div>
        <div className="toolbar">
          <div style={{ position: 'relative' }}>
            <Icon name="search" size={17} style={{ position: 'absolute', left: 11, top: 11, color: 'var(--ink-500)' }} />
            <input className="input" style={{ paddingLeft: 34 }} placeholder="Booking ID, name or phone" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search bookings" />
          </div>
          <select className="select" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by status">
            <option value="">All statuses</option>
            {ALL.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button className="btn btn-outline btn-sm" onClick={exportCSV} disabled={!bookings.length}><Icon name="download" size={15} /> Export CSV</button>
        </div>
      </div>
      {!change && <div style={{ marginBottom: 16 }}><Alert type={msg.type}>{msg.text}</Alert></div>}
      <Alert>{error}</Alert>
      <div className="card">
        {loading ? <div className="spinner" /> : bookings.length === 0 ? (
          <Empty icon="truck"><p>No bookings found.</p></Empty>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Booking</th><th>Customer</th><th>Route</th><th>Move</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <div className="cell-strong">{b.bookingId}</div>
                      <div className="small muted">{date(b.createdAt)}</div>
                      <Link to={`/receipt/${b._id}`} className="small text-blue">Receipt</Link>
                    </td>
                    <td>
                      <div className="cell-strong">{b.contactName}</div>
                      <div className="small"><a className="text-blue" href={`tel:${b.contactPhone}`}>{b.contactPhone}</a></div>
                      <div className="small muted">{b.user?.email}</div>
                    </td>
                    <td style={{ maxWidth: 280 }}>
                      <div className="small"><b>{areaLabel(b.pickupArea)}</b> — {b.pickupAddress}</div>
                      <div className="small" style={{ marginTop: 4 }}><b>{areaLabel(b.dropArea)}</b> — {b.dropAddress}</div>
                    </td>
                    <td className="small">
                      {date(b.movingDate)}<br />{b.timeSlot}<br />{b.houseType} · {b.vehicleType} · {b.distanceKm} km
                    </td>
                    <td className="cell-strong">{inr(b.amount)}</td>
                    <td>
                      <div style={{ marginBottom: 6 }}><StatusTag status={b.status} /></div>
                      <select
                        className="select"
                        value={b.status}
                        onChange={(e) => { setMsg({ type: 'error', text: '' }); setChange({ booking: b, status: e.target.value, note: '' }); }}
                        aria-label={`Change status of ${b.bookingId}`}
                      >
                        {ALL.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {change && (
        <Modal
          title={`Update ${change.booking.bookingId}`}
          onClose={() => setChange(null)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setChange(null)}>Cancel</button>
              <button className="btn btn-primary" form="status-form" disabled={saving}>{saving ? 'Saving…' : `Mark as ${change.status}`}</button>
            </>
          }
        >
          <form id="status-form" onSubmit={save} style={{ display: 'grid', gap: 14 }}>
            <p>
              <StatusTag status={change.booking.status} /> → <StatusTag status={change.status} />
            </p>
            <div className="field">
              <label htmlFor="st-note">Note for the customer (optional, shown on the tracker)</label>
              <input
                id="st-note"
                className="input"
                maxLength={500}
                value={change.note}
                onChange={(e) => setChange({ ...change, note: e.target.value })}
                placeholder={change.status === 'Vehicle Assigned' ? 'e.g. Tempo KA-01-AB-1234, driver Ravi 98xxxxxx10' : 'e.g. Crew reached pickup at 9:10 AM'}
              />
            </div>
            <Alert type={msg.type}>{msg.text}</Alert>
          </form>
        </Modal>
      )}
    </>
  );
}
