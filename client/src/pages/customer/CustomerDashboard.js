import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import Icon from '../../components/Icon';
import { useFetch, Alert, Empty, StatusTag, StatusTimeline } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { inr, date } from '../../utils/format';

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('bookings');
  const bookings = useFetch(() => api.myBookings(), []);
  const quotes = useFetch(() => api.myQuotes(), []);
  const [msg, setMsg] = useState({ type: 'error', text: '' });

  const list = bookings.data || [];
  const active = list.filter((b) => !['Delivered', 'Cancelled'].includes(b.status));

  const cancel = async (b) => {
    if (!window.confirm(`Cancel booking ${b.bookingId}?`)) return;
    try {
      const updated = await api.cancelBooking(b._id);
      bookings.setData(list.map((x) => (x._id === b._id ? updated : x)));
      setMsg({ type: 'success', text: `Booking ${b.bookingId} cancelled.` });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="dash">
      <aside className="side">
        <div className="side-label">My account</div>
        <button className={`side-link ${tab === 'bookings' ? 'active' : ''}`} style={tab === 'bookings' ? { background: 'var(--blue-600)', color: '#fff' } : undefined} onClick={() => setTab('bookings')}>
          <Icon name="truck" size={18} /> My Bookings {active.length > 0 && <span className="badge">{active.length}</span>}
        </button>
        <button className="side-link" style={tab === 'quotes' ? { background: 'var(--blue-600)', color: '#fff' } : undefined} onClick={() => setTab('quotes')}>
          <Icon name="file" size={18} /> My Quotes
        </button>
        <Link to="/book"><Icon name="plus" size={18} /> Book a Cab</Link>
        <Link to="/areas"><Icon name="pin" size={18} /> Service Areas</Link>
        <Link to="/contact"><Icon name="headset" size={18} /> Support</Link>
        <button className="side-link" onClick={() => { logout(); navigate('/'); }}>
          <Icon name="logout" size={18} /> Log out
        </button>
      </aside>

      <div className="dash-main">
        <div className="dash-head">
          <div>
            <div className="small muted">Welcome back,</div>
            <h1>{user.name}</h1>
          </div>
          <Link to="/book" className="btn btn-primary"><Icon name="truck" size={17} /> Book a new move</Link>
        </div>

        <div className="kpis" style={{ marginBottom: 24 }}>
          <div className="kpi"><span className="kpi-icon"><Icon name="truck" /></span><div><b>{list.length}</b><span>Total bookings</span></div></div>
          <div className="kpi"><span className="kpi-icon green"><Icon name="route" /></span><div><b>{active.length}</b><span>Active moves</span></div></div>
          <div className="kpi"><span className="kpi-icon"><Icon name="file" /></span><div><b>{(quotes.data || []).length}</b><span>Quotes</span></div></div>
          <div className="kpi"><span className="kpi-icon green"><Icon name="rupee" /></span><div><b>{inr(list.filter((b) => b.status !== 'Cancelled').reduce((s, b) => s + b.amount, 0))}</b><span>Total value</span></div></div>
        </div>

        <div style={{ marginBottom: 16 }}><Alert type={msg.type}>{msg.text}</Alert></div>

        {tab === 'bookings' && (
          <div style={{ display: 'grid', gap: 16 }}>
            <Alert>{bookings.error}</Alert>
            {bookings.loading && <div className="spinner" />}
            {!bookings.loading && list.length === 0 && (
              <div className="card"><Empty icon="truck"><p>No bookings yet.</p><Link to="/book" className="btn btn-primary" style={{ marginTop: 14 }}>Book your first move</Link></Empty></div>
            )}
            {list.map((b) => (
              <div key={b._id} className="card booking-card">
                <div className="booking-top">
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span className="kpi-icon"><Icon name="truck" /></span>
                    <div>
                      <b style={{ color: 'var(--navy-800)', fontSize: 16 }}>{b.bookingId}</b>
                      <div className="small muted">{b.houseType} · {b.vehicleType} · {date(b.movingDate)}, {b.timeSlot}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <b style={{ color: 'var(--navy-800)' }}>{inr(b.amount)}</b>
                    <StatusTag status={b.status} />
                  </div>
                </div>
                <div className="route-line">
                  <div><span className="dot">From</span><b>{b.pickupArea?.name}, {b.pickupArea?.city}</b><span className="small muted">{b.pickupAddress}</span></div>
                  <Icon name="arrow" />
                  <div><span className="dot">To</span><b>{b.dropArea?.name}, {b.dropArea?.city}</b><span className="small muted">{b.dropAddress}</span></div>
                </div>
                {b.status !== 'Cancelled' && <StatusTimeline status={b.status} history={b.history} />}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Link to={`/track/${b.bookingId}`} className="btn btn-outline btn-sm">Track</Link>
                  {['Confirmed', 'Vehicle Assigned'].includes(b.status) && (
                    <button className="btn btn-danger btn-sm" onClick={() => cancel(b)}>Cancel booking</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'quotes' && (
          <div className="card">
            <Alert>{quotes.error}</Alert>
            {quotes.loading && <div className="spinner" />}
            {!quotes.loading && (quotes.data || []).length === 0 ? (
              <Empty icon="file"><p>No quotes yet.</p><Link to="/quote" className="btn btn-primary" style={{ marginTop: 14 }}>Get a quote</Link></Empty>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Date</th><th>Route</th><th>Home</th><th>Vehicle</th><th>Total</th><th>Status</th><th /></tr></thead>
                  <tbody>
                    {(quotes.data || []).map((q) => (
                      <tr key={q._id}>
                        <td>{date(q.createdAt)}</td>
                        <td className="cell-strong">{q.fromArea?.name} → {q.toArea?.name}</td>
                        <td>{q.houseType}</td>
                        <td>{q.vehicleType}</td>
                        <td className="cell-strong">{inr(q.breakdown?.total)}</td>
                        <td><StatusTag status={q.status} /></td>
                        <td>
                          <Link className="link-arrow" to={`/book?${new URLSearchParams({ from: q.fromArea?._id || '', to: q.toArea?._id || '', house: q.houseType })}`}>
                            Book <Icon name="arrow" size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
