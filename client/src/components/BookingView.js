import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Icon from './Icon';
import { useFetch, Alert, StatusTag, StatusTimeline, LiveBadge } from './ui';
import { SITE } from '../config';
import { inr, date, dateTime, areaLabel } from '../utils/format';

export const LIVE_REFRESH_MS = 15000;
export const CANCELLABLE = ['Confirmed', 'Vehicle Assigned'];

/** Plain-language "what happens next" for each status. */
const NEXT_STEP = {
  Confirmed: "We're assigning a vehicle and crew. You'll see their details here as soon as they're allocated.",
  'Vehicle Assigned': 'Your vehicle and crew are allocated. The crew lead will call you the evening before the move.',
  'Picked Up': 'Your goods are packed and loaded. The truck is getting ready to leave.',
  'In Transit': 'Your goods are on the way to the drop address.',
  Delivered: 'Move completed. Payment is collected after delivery. Thank you for moving with us!',
  Cancelled: 'This booking was cancelled. No payment is due.',
};

export function Activity({ history = [] }) {
  return (
    <div className="activity">
      {[...history].reverse().map((h, i) => (
        <div key={`${h.status}-${h.at}-${i}`} className={`activity-row ${i === 0 ? 'latest' : ''}`}>
          <span className="activity-dot"><Icon name={h.status === 'Cancelled' ? 'x' : 'check'} size={14} stroke={3} /></span>
          <div style={{ flex: 1 }}>
            <b>{h.status}</b>
            {h.note && <div className="small muted">{h.note}</div>}
          </div>
          <span className="small muted" style={{ whiteSpace: 'nowrap' }}>{dateTime(h.at)}</span>
        </div>
      ))}
    </div>
  );
}

export function PriceBreakdown({ booking: b }) {
  const bd = b.breakdown || {};
  const rows = [
    [`${b.vehicleType} base fare`, bd.vehicleBase],
    [`Distance (${b.distanceKm} km)`, bd.distanceCharge],
    [`Labour & packing (${b.houseType})`, bd.labourPacking],
    ['Stair charges', bd.floorCharge],
    ['Premium packing', bd.premiumPacking],
    ['Transit insurance', bd.insurance],
    ['GST (18%)', bd.gst],
  ].filter(([, v]) => v > 0);
  return (
    <div className="breakdown">
      {rows.map(([label, v]) => (
        <div key={label} className="breakdown-row"><span>{label}</span><b>{inr(v)}</b></div>
      ))}
      <div className="breakdown-row total"><span>Total payable after delivery</span><b>{inr(b.amount)}</b></div>
    </div>
  );
}

/**
 * Full, live-updating view of one booking (owner or admin).
 * Used for the booking confirmation and the dashboard booking detail.
 */
export default function BookingView({ id, justBooked = false, backTo }) {
  const { data: b, loading, error, setData, updatedAt } = useFetch(() => api.booking(id), [id], { interval: LIVE_REFRESH_MS });
  const [msg, setMsg] = useState({ type: 'error', text: '' });
  const [copied, setCopied] = useState(false);

  if (loading && !b) return <div className="spinner" />;
  if (error && !b) return <Alert>{error}</Alert>;
  if (!b) return null;

  const cancel = async () => {
    if (!window.confirm(`Cancel booking ${b.bookingId}? This can't be undone.`)) return;
    try {
      setData(await api.cancelBooking(b._id));
      setMsg({ type: 'success', text: 'Booking cancelled. No charges apply.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const trackUrl = `${window.location.origin}/track/${b.bookingId}`;
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(trackUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this tracking link:', trackUrl);
    }
  };

  return (
    <div className="booking-view">
      {justBooked && (
        <div className="success-banner">
          <span className="kpi-icon green"><Icon name="check" size={22} stroke={3} /></span>
          <div>
            <b>Your cab is booked!</b>
            <div className="small">Booking ID <b>{b.bookingId}</b>. Keep it handy. This page updates live as our team moves your booking forward.</div>
          </div>
        </div>
      )}

      <div className="card card-pad" style={{ display: 'grid', gap: 22 }}>
        <div className="booking-top">
          <div>
            <div className="small muted">Booking ID</div>
            <div className="booking-id">{b.bookingId}</div>
            <div className="small muted">Booked {dateTime(b.createdAt)}</div>
          </div>
          <div style={{ display: 'grid', justifyItems: 'end', gap: 6 }}>
            <StatusTag status={b.status} />
            {!['Delivered', 'Cancelled'].includes(b.status) && <LiveBadge updatedAt={updatedAt} />}
          </div>
        </div>

        {b.status !== 'Cancelled' && <StatusTimeline status={b.status} history={b.history} />}
        <div className="next-step"><Icon name="info" size={18} /> {NEXT_STEP[b.status]}</div>

        <div className="route-line">
          <div><span className="dot">Pickup</span><b>{areaLabel(b.pickupArea)}</b><span className="small muted">{b.pickupAddress}</span></div>
          <Icon name="arrow" />
          <div><span className="dot">Drop</span><b>{areaLabel(b.dropArea)}</b><span className="small muted">{b.dropAddress}</span></div>
        </div>

        <div className="grid-4" style={{ gap: 12 }}>
          <div className="stat-box"><span>Moving date</span><b style={{ fontSize: 16 }}>{date(b.movingDate)}</b></div>
          <div className="stat-box"><span>Arrival slot</span><b style={{ fontSize: 16 }}>{b.timeSlot}</b></div>
          <div className="stat-box"><span>Vehicle</span><b style={{ fontSize: 16 }}>{b.vehicleType}</b></div>
          <div className="stat-box"><span>Home</span><b style={{ fontSize: 16 }}>{b.houseType}</b></div>
        </div>

        <Alert type={msg.type}>{msg.text}</Alert>

        <div className="actions-row">
          <Link to={`/receipt/${b._id}`} className="btn btn-outline btn-sm"><Icon name="printer" size={15} /> Receipt</Link>
          <button className="btn btn-outline btn-sm" onClick={copyLink}><Icon name="send" size={15} /> {copied ? 'Link copied!' : 'Share tracking link'}</button>
          <a href={SITE.phoneHref} className="btn btn-outline btn-sm"><Icon name="phone" size={15} /> Call support</a>
          {CANCELLABLE.includes(b.status) && (
            <button className="btn btn-danger btn-sm" onClick={cancel}>Cancel booking</button>
          )}
          {backTo && <Link to={backTo} className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>All bookings →</Link>}
        </div>
      </div>

      <div className="split" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card card-pad">
          <h3 className="card-title">Price details</h3>
          <PriceBreakdown booking={b} />
        </div>
        <div className="card card-pad">
          <h3 className="card-title">Activity</h3>
          <Activity history={b.history} />
        </div>
      </div>
    </div>
  );
}
