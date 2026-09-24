import React, { useState } from 'react';
import api from '../../api';
import { useFetch, Alert, Empty, StatusTag, TRACK_STEPS } from '../../components/ui';
import { inr, date, areaLabel } from '../../utils/format';

const ALL = [...TRACK_STEPS, 'Cancelled'];

export default function AdminBookings() {
  const [filter, setFilter] = useState('');
  const { data, loading, error, setData } = useFetch(() => api.bookings(filter), [filter]);
  const [msg, setMsg] = useState({ type: 'error', text: '' });
  const bookings = data || [];

  const update = async (b, status) => {
    try {
      const updated = await api.setBookingStatus(b._id, { status, note: `Updated by admin` });
      setData(bookings.map((x) => (x._id === b._id ? { ...updated, user: x.user } : x)));
      setMsg({ type: 'success', text: `${b.bookingId} → ${status}` });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <>
      <div className="dash-head">
        <div>
          <h1>Bookings</h1>
          <p className="muted">Update status as the move progresses — customers see every change on their tracker.</p>
        </div>
        <select className="select" style={{ width: 'auto' }} value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {ALL.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 16 }}><Alert type={msg.type}>{msg.text}</Alert></div>
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
                      <select className="select" value={b.status} onChange={(e) => update(b, e.target.value)} aria-label="Change status">
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
    </>
  );
}
