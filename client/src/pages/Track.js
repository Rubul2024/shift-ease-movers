import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import Icon from '../components/Icon';
import { PageHeader, Alert, StatusTimeline, StatusTag, LiveBadge, useFetch, useTitle } from '../components/ui';
import { Activity, LIVE_REFRESH_MS } from '../components/BookingView';
import { SITE } from '../config';
import { date } from '../utils/format';

export default function Track() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState(bookingId || '');
  // Refreshes every few seconds so status changes from our team appear without reloading.
  const { data: b, loading, error, updatedAt } = useFetch(
    () => (bookingId ? api.track(bookingId) : Promise.resolve(null)),
    [bookingId],
    { interval: bookingId ? LIVE_REFRESH_MS : 0 }
  );

  useEffect(() => {
    if (bookingId) setInput(bookingId);
  }, [bookingId]);

  useTitle(bookingId ? `Track ${bookingId.toUpperCase()}` : 'Track your move');
  const state = { loading: loading && !b, error: b ? '' : error };

  return (
    <>
      <PageHeader crumb="Home / Track" title="Track your move" subtitle="Enter the booking ID from your confirmation to see live status updates.">
        <form
          onSubmit={(e) => { e.preventDefault(); if (input.trim()) navigate(`/track/${input.trim().toUpperCase()}`); }}
          style={{ display: 'flex', gap: 10, marginTop: 24, maxWidth: 520 }}
        >
          <input className="input" placeholder="Booking ID, e.g. SE12345ABCDE" value={input} onChange={(e) => setInput(e.target.value)} aria-label="Booking ID" />
          <button className="btn btn-green">Track</button>
        </form>
      </PageHeader>
      <section className="section">
        <div className="container" style={{ maxWidth: 860 }}>
          {state.loading && <div className="spinner" />}
          <Alert>{state.error}</Alert>
          {!b && !state.loading && !state.error && (
            <div className="empty"><Icon name="route" size={44} /><p>Your booking status will appear here.</p></div>
          )}
          {b && (
            <div className="card card-pad" style={{ display: 'grid', gap: 24 }}>
              <div className="booking-top">
                <div>
                  <div className="small muted">Booking ID</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--navy-800)' }}>{b.bookingId}</div>
                </div>
                <div style={{ display: 'grid', justifyItems: 'end', gap: 6 }}>
                  <StatusTag status={b.status} />
                  {!['Delivered', 'Cancelled'].includes(b.status) && <LiveBadge updatedAt={updatedAt} />}
                </div>
              </div>
              {b.status === 'Cancelled' ? (
                <Alert>This booking was cancelled.</Alert>
              ) : (
                <StatusTimeline status={b.status} history={b.history} />
              )}
              <div className="route-line">
                <div><span className="dot">From</span><b>{b.pickupArea?.name}, {b.pickupArea?.city}</b></div>
                <Icon name="arrow" />
                <div><span className="dot">To</span><b>{b.dropArea?.name}, {b.dropArea?.city}</b></div>
              </div>
              <div className="grid-4" style={{ gap: 12 }}>
                <div className="stat-box"><span>Moving date</span><b style={{ fontSize: 16 }}>{date(b.movingDate)}</b></div>
                <div className="stat-box"><span>Slot</span><b style={{ fontSize: 16 }}>{b.timeSlot}</b></div>
                <div className="stat-box"><span>Vehicle</span><b style={{ fontSize: 16 }}>{b.vehicleType}</b></div>
                <div className="stat-box"><span>Home</span><b style={{ fontSize: 16 }}>{b.houseType}</b></div>
              </div>
              <div>
                <h4 style={{ color: 'var(--navy-800)', marginBottom: 10 }}>Activity</h4>
                <Activity history={b.history} />
              </div>
              <div className="help-strip">
                <Icon name="headset" size={20} />
                <span>Need to reschedule or have a question about this move?</span>
                <a href={SITE.phoneHref} className="btn btn-outline btn-sm">Call {SITE.phone}</a>
                <Link to={`/contact?subject=Existing+booking&booking=${b.bookingId}`} className="btn btn-primary btn-sm">Message us</Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
