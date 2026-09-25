import React, { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api';
import Icon from '../../components/Icon';
import { useFetch, useTitle, Alert, Empty, StatusTag, StatusTimeline, LiveBadge } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { HOUSE_TYPES } from '../../utils/pricing';
import { inr, date, todayISO, maxMoveDateISO, areaLabel } from '../../utils/format';
import { ACTIVE, useDashboard } from './CustomerLayout';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

/** Start a booking in two clicks: route, home size and date, then the full form is pre-filled. */
function QuickBook() {
  const navigate = useNavigate();
  const { data: areas } = useFetch(() => api.areas(), []);
  const [form, setForm] = useState({ from: '', to: '', house: '2 BHK', date: todayISO() });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <form
      className="card card-pad quick-book"
      onSubmit={(e) => {
        e.preventDefault();
        navigate(`/dashboard/book?${new URLSearchParams(form)}`);
      }}
    >
      <div className="quick-book-head">
        <div>
          <h3 className="card-title" style={{ margin: 0 }}>Book a cab or truck</h3>
          <p className="small muted">Pick your route. You'll see live slots and the exact price on the next step.</p>
        </div>
        <span className="kpi-icon"><Icon name="truck" /></span>
      </div>
      <div className="quick-book-row">
        <div className="field">
          <label htmlFor="qk-from">Pickup area</label>
          <select id="qk-from" className="select" required value={form.from} onChange={set('from')}>
            <option value="">Select pickup</option>
            {(areas || []).map((a) => <option key={a._id} value={a._id}>{a.name}, {a.city}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="qk-to">Drop area</label>
          <select id="qk-to" className="select" required value={form.to} onChange={set('to')}>
            <option value="">Select drop</option>
            {(areas || []).map((a) => <option key={a._id} value={a._id}>{a.name}, {a.city}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="qk-house">Home size</label>
          <select id="qk-house" className="select" value={form.house} onChange={set('house')}>
            {Object.keys(HOUSE_TYPES).map((h) => <option key={h}>{h}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="qk-date">Moving date</label>
          <input id="qk-date" type="date" className="input" required min={todayISO()} max={maxMoveDateISO()} value={form.date} onChange={set('date')} />
        </div>
        <button className="btn btn-primary">Continue <Icon name="arrow" size={16} /></button>
      </div>
    </form>
  );
}

export default function Overview() {
  useTitle('My dashboard');
  const { user } = useAuth();
  const [params] = useSearchParams();
  const { bookings, quotes } = useDashboard();
  const list = bookings.data || [];

  // Old links used /dashboard?tab=profile|quotes.
  const tab = params.get('tab');
  if (tab === 'profile' || tab === 'quotes') return <Navigate to={`/dashboard/${tab}`} replace />;

  const active = list.filter(ACTIVE);
  const next = [...active].sort((a, b) => new Date(a.movingDate) - new Date(b.movingDate))[0];
  const spent = list.filter((b) => b.status !== 'Cancelled').reduce((s, b) => s + b.amount, 0);

  return (
    <div className="dash-stack">
      <div className="dash-hello">
        <div>
          <div className="small muted">{greeting()},</div>
          <h1>{user.name}</h1>
        </div>
        <LiveBadge updatedAt={bookings.updatedAt} />
      </div>

      <QuickBook />

      <div className="kpis">
        <Link to="/dashboard/bookings" className="kpi kpi-link"><span className="kpi-icon"><Icon name="truck" /></span><div><b>{list.length}</b><span>Total bookings</span></div></Link>
        <Link to="/dashboard/bookings?filter=active" className="kpi kpi-link"><span className="kpi-icon green"><Icon name="route" /></span><div><b>{active.length}</b><span>Active moves</span></div></Link>
        <Link to="/dashboard/quotes" className="kpi kpi-link"><span className="kpi-icon"><Icon name="file" /></span><div><b>{(quotes.data || []).length}</b><span>Saved quotes</span></div></Link>
        <div className="kpi"><span className="kpi-icon green"><Icon name="rupee" /></span><div><b>{inr(spent)}</b><span>Total booked</span></div></div>
      </div>

      <Alert>{bookings.error}</Alert>
      {bookings.loading && !bookings.data && <div className="spinner" />}

      {next && (
        <div className="card card-pad next-move">
          <div className="booking-top">
            <div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>Your next move</div>
              <h3 className="card-title" style={{ margin: 0 }}>
                {date(next.movingDate)} · {next.timeSlot}
              </h3>
              <div className="small muted">{areaLabel(next.pickupArea)} → {areaLabel(next.dropArea)} · {next.houseType} · {next.vehicleType}</div>
            </div>
            <StatusTag status={next.status} />
          </div>
          <StatusTimeline status={next.status} history={next.history} />
          <div className="actions-row">
            <Link to={`/dashboard/bookings/${next._id}`} className="btn btn-primary btn-sm">Track live <Icon name="arrow" size={15} /></Link>
            <Link to={`/receipt/${next._id}`} className="btn btn-outline btn-sm"><Icon name="printer" size={15} /> Receipt</Link>
            <span className="small muted" style={{ marginLeft: 'auto' }}>Booking {next.bookingId} · {inr(next.amount)}</span>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-head">
          <h3 className="card-title" style={{ margin: 0 }}>Recent bookings</h3>
          {list.length > 0 && <Link to="/dashboard/bookings" className="link-arrow">View all <Icon name="arrow" size={15} /></Link>}
        </div>
        {!bookings.loading && list.length === 0 ? (
          <Empty icon="truck">
            <p>No bookings yet. Your moves will show up here with live status.</p>
            <Link to="/dashboard/book" className="btn btn-primary" style={{ marginTop: 14 }}>Book your first move</Link>
          </Empty>
        ) : (
          <div className="list">
            {list.slice(0, 4).map((b) => (
              <Link key={b._id} to={`/dashboard/bookings/${b._id}`} className="list-row">
                <span className="kpi-icon"><Icon name="truck" /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b>{areaLabel(b.pickupArea)} → {areaLabel(b.dropArea)}</b>
                  <div className="small muted">{b.bookingId} · {date(b.movingDate)}, {b.timeSlot}</div>
                </div>
                <b className="hide-xs">{inr(b.amount)}</b>
                <StatusTag status={b.status} />
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid-3">
        <Link to="/quote" className="card card-pad shortcut"><Icon name="file" /> <div><b>Get a quote</b><span className="small muted">Compare prices before booking</span></div></Link>
        <Link to="/areas" className="card card-pad shortcut"><Icon name="pin" /> <div><b>Service areas</b><span className="small muted">Check where cabs are available</span></div></Link>
        <Link to="/dashboard/support" className="card card-pad shortcut"><Icon name="headset" /> <div><b>Help &amp; support</b><span className="small muted">Talk to a moving advisor</span></div></Link>
      </div>
    </div>
  );
}
