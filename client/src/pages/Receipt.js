import React from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import Icon from '../components/Icon';
import Logo from '../components/Logo';
import { useFetch, useTitle, Alert, StatusTag } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { SITE } from '../config';
import { inr, date, dateTime, areaLabel } from '../utils/format';

// Printable booking receipt. "Print / Save as PDF" uses the browser's print dialog.
export default function Receipt() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const { data: b, loading, error } = useFetch(() => api.booking(id), [id]);
  useTitle(b ? `Receipt ${b.bookingId}` : 'Receipt');

  if (loading) return <div className="spinner" />;
  if (error || !b) {
    return (
      <section className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <Alert>{error || 'Booking not found'}</Alert>
        </div>
      </section>
    );
  }

  const bd = b.breakdown || {};
  const rows = [
    [`${b.vehicleType} base fare`, bd.vehicleBase],
    [`Distance charge (${b.distanceKm} km)`, bd.distanceCharge],
    [`Labour & packing (${b.houseType})`, bd.labourPacking],
    [`Stair charges (floors ${b.pickupFloor || 0} + ${b.dropFloor || 0}, no lift)`, bd.floorCharge],
    ['Premium 5-layer packing', bd.premiumPacking],
    ['Transit insurance (3%)', bd.insurance],
  ].filter(([, v]) => v > 0);

  return (
    <section className="section receipt-page">
      <div className="container" style={{ maxWidth: 820 }}>
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
          <Link to={isAdmin ? '/admin/bookings' : `/dashboard/bookings/${b._id}`} className="btn btn-ghost">← Back</Link>
          <button className="btn btn-primary" onClick={() => window.print()}><Icon name="printer" size={17} /> Print / Save as PDF</button>
        </div>

        <article className="card receipt">
          <header className="receipt-head">
            <div>
              <Logo />
              <div className="small muted" style={{ marginTop: 10 }}>
                {SITE.address.line1}, {SITE.address.line2}<br />
                {SITE.phone} · {SITE.email}
                {SITE.gstin && <><br />GSTIN: {SITE.gstin}</>}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="receipt-title">Booking Receipt</div>
              <div className="small muted">Booking ID</div>
              <b style={{ fontSize: 18, color: 'var(--navy-800)' }}>{b.bookingId}</b>
              <div className="small muted" style={{ marginTop: 4 }}>Booked {dateTime(b.createdAt)}</div>
              <div style={{ marginTop: 6 }}><StatusTag status={b.status} /></div>
            </div>
          </header>

          <div className="receipt-grid">
            <div>
              <div className="receipt-label">Customer</div>
              <b>{b.contactName}</b>
              <div className="small">{b.contactPhone}</div>
              {b.user?.email && <div className="small">{b.user.email}</div>}
            </div>
            <div>
              <div className="receipt-label">Moving date</div>
              <b>{date(b.movingDate)}</b>
              <div className="small">Arrival slot {b.timeSlot}</div>
            </div>
            <div>
              <div className="receipt-label">Pickup</div>
              <b>{areaLabel(b.pickupArea)}</b>
              <div className="small">{b.pickupAddress}</div>
            </div>
            <div>
              <div className="receipt-label">Drop</div>
              <b>{areaLabel(b.dropArea)}</b>
              <div className="small">{b.dropAddress}</div>
            </div>
          </div>

          <table className="table receipt-table">
            <thead><tr><th>Description</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
            <tbody>
              {rows.map(([label, v]) => (
                <tr key={label}><td>{label}</td><td style={{ textAlign: 'right' }}>{inr(v)}</td></tr>
              ))}
              <tr><td className="cell-strong">Subtotal</td><td className="cell-strong" style={{ textAlign: 'right' }}>{inr(bd.subtotal)}</td></tr>
              <tr><td>GST (18%)</td><td style={{ textAlign: 'right' }}>{inr(bd.gst)}</td></tr>
              <tr className="receipt-total"><td>Total payable</td><td style={{ textAlign: 'right' }}>{inr(b.amount)}</td></tr>
            </tbody>
          </table>

          <footer className="small muted receipt-foot">
            {b.status === 'Cancelled'
              ? 'This booking was cancelled. No payment is due.'
              : b.status === 'Delivered'
                ? 'Move completed. Thank you for choosing ShiftEase Movers.'
                : 'Payment is collected after delivery by UPI, card, net-banking or cash. Free cancellation until pickup.'}
            <br />
            Track this move any time at {window.location.origin}/track/{b.bookingId}
          </footer>
        </article>
      </div>
    </section>
  );
}
