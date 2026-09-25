import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Icon from './Icon';
import { useFetch, useDebounced, Alert, Empty, LiveBadge } from './ui';
import { MoveFields, PriceSummary, initialMove, useMovePrice } from './MoveForm';
import { useAuth } from '../context/AuthContext';
import { SITE } from '../config';
import { inr, date } from '../utils/format';

const AREAS_REFRESH_MS = 60000;
const SLOTS_REFRESH_MS = 20000;
const PHONE_OK = /^[0-9]{10}$/;

/** Live cabs-left-per-slot picker for the chosen pickup area and date. */
function SlotPicker({ slots, value, onChange, loading }) {
  if (!slots) {
    return <p className="small muted">{loading ? 'Checking live availability…' : 'Choose a pickup area and date to see available slots.'}</p>;
  }
  return (
    <div className="slot-grid" role="radiogroup" aria-label="Arrival time slot">
      {slots.map((s) => (
        <button
          type="button"
          key={s.slot}
          role="radio"
          aria-checked={value === s.slot}
          disabled={!s.available}
          className={`slot ${value === s.slot ? 'on' : ''}`}
          onClick={() => onChange(s.slot)}
        >
          <b>{s.slot}</b>
          <span className={s.available ? (s.remaining <= 2 ? 'text-warn' : 'text-green') : 'muted'}>
            {s.available ? `${s.remaining} cab${s.remaining === 1 ? '' : 's'} left` : s.reason}
          </span>
        </button>
      ))}
    </div>
  );
}

/**
 * The complete booking flow (route, move details, live slot availability, addresses, live price).
 * Calls onBooked(booking) after the server confirms.
 */
export default function BookingForm({ initial = {}, onBooked }) {
  const { user } = useAuth();
  const areasQ = useFetch(() => api.areas(), [], { interval: AREAS_REFRESH_MS });
  const areas = areasQ.data;
  const [move, setMove] = useState(() => initialMove(initial));
  const [details, setDetails] = useState({
    pickupAddress: '',
    dropAddress: '',
    timeSlot: '',
    contactName: user?.name || '',
    contactPhone: user?.phone || '',
  });
  const [state, setState] = useState({ loading: false, error: '' });
  const price = useMovePrice(move, areas);
  const set = (k) => (e) => setDetails((d) => ({ ...d, [k]: e.target.value }));

  // ---- Live slot availability for pickup area + date ----
  const canCheckSlots = !!(move.fromArea && move.movingDate);
  const slotsQ = useFetch(
    () => (canCheckSlots ? api.availability(move.fromArea, move.movingDate) : Promise.resolve(null)),
    [move.fromArea, move.movingDate],
    { interval: canCheckSlots ? SLOTS_REFRESH_MS : 0 }
  );
  const slots = slotsQ.data?.slots;
  const chosenSlot = slots?.find((s) => s.slot === details.timeSlot);

  // Keep a valid slot selected: pick the first open one, or clear it when it fills up.
  useEffect(() => {
    if (!slots) return;
    if (!chosenSlot || !chosenSlot.available) {
      const first = slots.find((s) => s.available);
      setDetails((d) => ({ ...d, timeSlot: first ? first.slot : '' }));
    }
  }, [slots, chosenSlot]);

  // ---- Server-confirmed price (the client estimate shows instantly; the server has the final say) ----
  const estimateBody = useMemo(
    () =>
      move.fromArea && move.toArea
        ? {
            fromArea: move.fromArea,
            toArea: move.toArea,
            houseType: move.houseType,
            vehicleType: move.vehicleType,
            pickupFloor: move.pickupFloor,
            dropFloor: move.dropFloor,
            liftAvailable: move.liftAvailable,
            premiumPacking: move.premiumPacking,
            insurance: move.insurance,
          }
        : null,
    [move]
  );
  const estimateKey = useDebounced(estimateBody ? JSON.stringify(estimateBody) : '', 400);
  const [serverPrice, setServerPrice] = useState({ key: '', data: null, error: '' });
  useEffect(() => {
    if (!estimateKey) return undefined;
    let cancelled = false;
    api
      .estimate(JSON.parse(estimateKey))
      .then((data) => !cancelled && setServerPrice({ key: estimateKey, data, error: '' }))
      .catch((err) => !cancelled && setServerPrice({ key: estimateKey, data: null, error: err.message }));
    return () => {
      cancelled = true;
    };
  }, [estimateKey]);
  const currentKey = estimateBody ? JSON.stringify(estimateBody) : '';
  const verified = serverPrice.key === currentKey && serverPrice.data;
  const shown = verified ? { ...price, distanceKm: serverPrice.data.distanceKm, breakdown: serverPrice.data.breakdown } : price;

  // ---- What's still needed before the booking can be confirmed ----
  const missing = [
    !move.fromArea && 'pickup area',
    !move.toArea && 'drop area',
    !move.movingDate && 'moving date',
    canCheckSlots && slots && !details.timeSlot && 'an available time slot',
    !details.pickupAddress.trim() && 'pickup address',
    !details.dropAddress.trim() && 'drop address',
    !details.contactName.trim() && 'contact name',
    !PHONE_OK.test(details.contactPhone) && '10-digit contact mobile',
  ].filter(Boolean);
  const noSlotsLeft = slots && !slots.some((s) => s.available);

  const submit = async (e) => {
    e.preventDefault();
    if (missing.length) return setState({ loading: false, error: `Please add: ${missing.join(', ')}.` });
    if (move.fromArea === move.toArea && !window.confirm('Pickup and drop are in the same area. Continue?')) return;
    setState({ loading: true, error: '' });
    try {
      const { fromArea, toArea, ...rest } = move;
      // The bookings API names the areas pickupArea / dropArea.
      const booking = await api.book({ ...rest, ...details, pickupArea: fromArea, dropArea: toArea });
      setState({ loading: false, error: '' });
      onBooked(booking);
    } catch (err) {
      setState({ loading: false, error: err.message });
      slotsQ.reload(); // a slot may have just filled up
    }
  };

  if (areasQ.loading && !areas) return <div className="spinner" />;
  if (areasQ.error && !areas) return <Alert>{areasQ.error}</Alert>;
  if (areas && areas.length === 0) {
    return (
      <div className="card">
        <Empty icon="pin">
          <p style={{ fontWeight: 700, color: 'var(--navy-800)' }}>Online booking is temporarily unavailable</p>
          <p className="small">No service areas are open for booking right now. Call us and we'll book your move by phone.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
            <a href={SITE.phoneHref} className="btn btn-primary"><Icon name="phone" size={16} /> {SITE.phone}</a>
            <Link to="/contact" className="btn btn-outline">Send an inquiry</Link>
          </div>
        </Empty>
      </div>
    );
  }

  return (
    <form className="split" onSubmit={submit} noValidate>
      <div className="card card-pad">
        <MoveFields move={move} setMove={setMove} areas={areas} />

        <div className="divider" />
        <div className="step-title" style={{ justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span className="step-num">4</span> Arrival time slot</span>
          {slots && <LiveBadge updatedAt={slotsQ.updatedAt} />}
        </div>
        <SlotPicker slots={slots} value={details.timeSlot} onChange={(slot) => setDetails((d) => ({ ...d, timeSlot: slot }))} loading={slotsQ.loading} />
        {noSlotsLeft && (
          <Alert type="info">No slots left in {price.from?.name} on {date(move.movingDate)}. Try the next day or call {SITE.phone}.</Alert>
        )}

        <div className="divider" />
        <div className="step-title"><span className="step-num">5</span> Addresses &amp; contact</div>
        <div className="form-grid">
          <div className="field full">
            <label htmlFor="b-pa">Pickup address</label>
            <input id="b-pa" className="input" required maxLength={300} autoComplete="street-address" placeholder="Flat, building, street, landmark" value={details.pickupAddress} onChange={set('pickupAddress')} />
          </div>
          <div className="field full">
            <label htmlFor="b-da">Drop address</label>
            <input id="b-da" className="input" required maxLength={300} placeholder="Flat, building, street, landmark" value={details.dropAddress} onChange={set('dropAddress')} />
          </div>
          <div className="field">
            <label htmlFor="b-name">Contact person</label>
            <input id="b-name" className="input" required maxLength={100} autoComplete="name" value={details.contactName} onChange={set('contactName')} />
          </div>
          <div className="field">
            <label htmlFor="b-phone">Contact mobile</label>
            <input id="b-phone" className="input" required inputMode="numeric" maxLength={10} autoComplete="tel-national" placeholder="10-digit mobile" value={details.contactPhone} onChange={(e) => setDetails((d) => ({ ...d, contactPhone: e.target.value.replace(/\D/g, '') }))} />
          </div>
        </div>
      </div>

      <div className="sticky">
        <PriceSummary {...shown} move={move}>
          {shown.breakdown && (
            <div className="summary-meta">
              <span>
                <Icon name={verified ? 'shield' : 'clock'} size={15} />{' '}
                {verified ? 'Price confirmed live by our pricing engine' : serverPrice.error || 'Confirming live price…'}
              </span>
              {move.movingDate && <span><Icon name="calendar" size={15} /> {date(move.movingDate)}{details.timeSlot ? `, ${details.timeSlot}` : ''}</span>}
              {chosenSlot && <span><Icon name="truck" size={15} /> {chosenSlot.remaining} of {slotsQ.data.cabsPerSlot} cabs free in this slot</span>}
            </div>
          )}
          <Alert>{state.error}</Alert>
          <button className="btn btn-green btn-block" disabled={state.loading || !shown.breakdown} style={{ marginTop: state.error ? 12 : 0 }}>
            {state.loading ? 'Booking…' : shown.breakdown ? `Confirm booking · ${inr(shown.breakdown.total)}` : 'Confirm booking'} <Icon name="arrow" size={17} />
          </button>
          {missing.length > 0 ? (
            <p className="small summary-hint">Still needed: {missing.join(', ')}</p>
          ) : (
            <p className="small summary-hint">No advance payment · Free cancellation until pickup</p>
          )}
        </PriceSummary>
      </div>
    </form>
  );
}
