import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Icon from '../../components/Icon';
import { useTitle, Alert, Empty, StatusTag, StatusTimeline, LiveBadge } from '../../components/ui';
import { inr, date, areaLabel } from '../../utils/format';
import { ACTIVE, useDashboard } from './CustomerLayout';

const FILTERS = {
  all: { label: 'All', test: () => true },
  active: { label: 'Active', test: ACTIVE },
  delivered: { label: 'Completed', test: (b) => b.status === 'Delivered' },
  cancelled: { label: 'Cancelled', test: (b) => b.status === 'Cancelled' },
};

export default function Bookings() {
  useTitle('My bookings');
  const { bookings } = useDashboard();
  const [params, setParams] = useSearchParams();
  const filter = FILTERS[params.get('filter')] ? params.get('filter') : 'all';
  const [q, setQ] = useState('');
  const list = bookings.data || [];
  const needle = q.trim().toLowerCase();
  const shown = list.filter(
    (b) =>
      FILTERS[filter].test(b) &&
      (!needle || `${b.bookingId} ${areaLabel(b.pickupArea)} ${areaLabel(b.dropArea)} ${b.pickupAddress} ${b.dropAddress}`.toLowerCase().includes(needle))
  );

  return (
    <div className="dash-stack">
      <div className="toolbar" style={{ justifyContent: 'space-between' }}>
        <div className="seg" role="tablist" aria-label="Filter bookings">
          {Object.entries(FILTERS).map(([key, f]) => (
            <button key={key} role="tab" aria-selected={filter === key} className={filter === key ? 'on' : ''} onClick={() => setParams(key === 'all' ? {} : { filter: key }, { replace: true })}>
              {f.label} <span className="seg-count">{list.filter(f.test).length}</span>
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <LiveBadge updatedAt={bookings.updatedAt} />
          <div style={{ position: 'relative' }}>
            <Icon name="search" size={17} style={{ position: 'absolute', left: 11, top: 11, color: 'var(--ink-500)' }} />
            <input className="input" style={{ paddingLeft: 34 }} placeholder="Booking ID or area" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search bookings" />
          </div>
        </div>
      </div>

      <Alert>{bookings.error}</Alert>
      {bookings.loading && !bookings.data && <div className="spinner" />}
      {!bookings.loading && shown.length === 0 && (
        <div className="card">
          <Empty icon="truck">
            <p>{list.length ? 'No bookings match this filter.' : 'No bookings yet.'}</p>
            <Link to="/dashboard/book" className="btn btn-primary" style={{ marginTop: 14 }}>Book a move</Link>
          </Empty>
        </div>
      )}

      {shown.map((b) => (
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
            <div><span className="dot">From</span><b>{areaLabel(b.pickupArea)}</b><span className="small muted">{b.pickupAddress}</span></div>
            <Icon name="arrow" />
            <div><span className="dot">To</span><b>{areaLabel(b.dropArea)}</b><span className="small muted">{b.dropAddress}</span></div>
          </div>
          {b.status !== 'Cancelled' && <StatusTimeline status={b.status} history={b.history} />}
          <div className="actions-row">
            <Link to={`/dashboard/bookings/${b._id}`} className="btn btn-primary btn-sm">{ACTIVE(b) ? 'Track live' : 'View details'} <Icon name="arrow" size={15} /></Link>
            <Link to={`/receipt/${b._id}`} className="btn btn-outline btn-sm"><Icon name="printer" size={15} /> Receipt</Link>
            <Link
              to={`/dashboard/book?${new URLSearchParams({ from: b.pickupArea?._id || '', to: b.dropArea?._id || '', house: b.houseType, vehicle: b.vehicleType })}`}
              className="btn btn-ghost btn-sm"
            >
              Book again
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
