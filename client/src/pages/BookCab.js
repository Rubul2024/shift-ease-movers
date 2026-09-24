import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api';
import Icon from '../components/Icon';
import { useFetch, PageHeader, Alert, StatusTimeline } from '../components/ui';
import { MoveFields, PriceSummary, initialMove, useMovePrice } from '../components/MoveForm';
import { useAuth } from '../context/AuthContext';
import { TIME_SLOTS } from '../utils/pricing';
import { inr, date } from '../utils/format';

// Customers book a moving cab instantly — confirmation and booking ID are returned immediately.
export default function BookCab() {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const { data: areas } = useFetch(() => api.areas(), []);
  const [move, setMove] = useState(() => initialMove({ ...Object.fromEntries(params), from: params.get('pickup') || params.get('from') || '' }));
  const [details, setDetails] = useState({
    pickupAddress: '',
    dropAddress: '',
    timeSlot: TIME_SLOTS[0],
    contactName: user?.name || '',
    contactPhone: user?.phone || '',
  });
  const [state, setState] = useState({ loading: false, error: '', booking: null });
  const price = useMovePrice(move, areas);
  const set = (k) => (e) => setDetails({ ...details, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setState({ loading: true, error: '', booking: null });
    try {
      const booking = await api.book({ ...move, ...details });
      setState({ loading: false, error: '', booking });
      window.scrollTo(0, 0);
    } catch (err) {
      setState({ loading: false, error: err.message, booking: null });
    }
  };

  if (state.booking) {
    const b = state.booking;
    return (
      <>
        <PageHeader crumb="Home / Book" title="Your cab is booked!" subtitle="Our crew will call you the evening before your move to confirm the arrival window." />
        <section className="section">
          <div className="container" style={{ maxWidth: 780 }}>
            <div className="card card-pad" style={{ display: 'grid', gap: 22 }}>
              <div className="booking-top">
                <div>
                  <div className="small muted">Booking ID</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--navy-800)', letterSpacing: '.02em' }}>{b.bookingId}</div>
                </div>
                <span className="tag green" style={{ fontSize: 13, padding: '6px 12px' }}><Icon name="check" size={14} /> Confirmed</span>
              </div>
              <StatusTimeline status={b.status} history={b.history} />
              <div className="route-line">
                <div><span className="dot">Pickup</span><b>{b.pickupArea?.name}, {b.pickupArea?.city}</b><span className="small muted">{b.pickupAddress}</span></div>
                <Icon name="arrow" />
                <div><span className="dot">Drop</span><b>{b.dropArea?.name}, {b.dropArea?.city}</b><span className="small muted">{b.dropAddress}</span></div>
              </div>
              <div className="grid-4" style={{ gap: 12 }}>
                <div className="stat-box"><span>Date</span><b style={{ fontSize: 16 }}>{date(b.movingDate)}</b></div>
                <div className="stat-box"><span>Slot</span><b style={{ fontSize: 16 }}>{b.timeSlot}</b></div>
                <div className="stat-box"><span>Vehicle</span><b style={{ fontSize: 16 }}>{b.vehicleType}</b></div>
                <div className="stat-box"><span>Amount</span><b style={{ fontSize: 16 }}>{inr(b.amount)}</b></div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link to={`/track/${b.bookingId}`} className="btn btn-primary">Track this move <Icon name="arrow" size={17} /></Link>
                <Link to="/dashboard" className="btn btn-outline">Go to My Moves</Link>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader crumb="Home / Book a Cab" title="Book a moving cab instantly" subtitle="Pick your areas, choose a vehicle and confirm. You'll get a booking ID right away — pay after delivery." />
      <section className="section">
        <form className="container split" onSubmit={submit}>
          <div className="card card-pad">
            <MoveFields move={move} setMove={setMove} areas={areas} />
            <div className="divider" />
            <div className="step-title"><span className="step-num">4</span> Addresses &amp; contact</div>
            <div className="form-grid">
              <div className="field full">
                <label htmlFor="b-pa">Pickup address</label>
                <input id="b-pa" className="input" required placeholder="Flat, building, street, landmark" value={details.pickupAddress} onChange={set('pickupAddress')} />
              </div>
              <div className="field full">
                <label htmlFor="b-da">Drop address</label>
                <input id="b-da" className="input" required placeholder="Flat, building, street, landmark" value={details.dropAddress} onChange={set('dropAddress')} />
              </div>
              <div className="field">
                <label htmlFor="b-slot">Arrival time slot</label>
                <select id="b-slot" className="select" value={details.timeSlot} onChange={set('timeSlot')}>
                  {TIME_SLOTS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="b-name">Contact person</label>
                <input id="b-name" className="input" required value={details.contactName} onChange={set('contactName')} />
              </div>
              <div className="field">
                <label htmlFor="b-phone">Contact mobile</label>
                <input id="b-phone" className="input" required pattern="[0-9]{10}" title="10-digit mobile number" value={details.contactPhone} onChange={set('contactPhone')} />
              </div>
            </div>
          </div>
          <div className="sticky">
            <PriceSummary {...price} move={move}>
              {price.from && (
                <div className="small" style={{ color: 'rgba(255,255,255,.75)', marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Icon name="truck" size={16} style={{ color: 'var(--green-400)' }} /> {price.from.availableCabs} cabs available in {price.from.name}
                </div>
              )}
              <Alert>{state.error}</Alert>
              <button className="btn btn-green btn-block" disabled={state.loading || !price.breakdown} style={{ marginTop: state.error ? 12 : 0 }}>
                {state.loading ? 'Booking…' : 'Confirm booking'} <Icon name="arrow" size={17} />
              </button>
              <p className="small center" style={{ color: 'rgba(255,255,255,.6)', marginTop: 10 }}>Free cancellation until pickup</p>
            </PriceSummary>
          </div>
        </form>
      </section>
    </>
  );
}
