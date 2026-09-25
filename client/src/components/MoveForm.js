import React, { useEffect } from 'react';
import Icon from './Icon';
import { VEHICLES, HOUSE_TYPES, SUGGESTED_VEHICLE, calculateQuote, distanceBetween, hasOwn } from '../utils/pricing';
import { inr, todayISO, maxMoveDateISO } from '../utils/format';

export const initialMove = (params = {}) => ({
  fromArea: params.from || '',
  toArea: params.to || '',
  houseType: hasOwn(HOUSE_TYPES, params.house) ? params.house : '2 BHK',
  vehicleType: hasOwn(SUGGESTED_VEHICLE, params.house) ? SUGGESTED_VEHICLE[params.house] : 'Tempo',
  movingDate: todayISO(),
  pickupFloor: 0,
  dropFloor: 0,
  liftAvailable: true,
  premiumPacking: false,
  insurance: true,
});

/** Derives distance + live price breakdown from the move form and area list. */
export function useMovePrice(move, areas) {
  const from = (areas || []).find((a) => a._id === move.fromArea);
  const to = (areas || []).find((a) => a._id === move.toArea);
  const distanceKm = from && to ? distanceBetween(from, to) : null;
  const breakdown = distanceKm ? calculateQuote({ ...move, distanceKm }) : null;
  return { from, to, distanceKm, breakdown };
}

/** Shared move-detail fields for the Quote and Book pages. */
export function MoveFields({ move, setMove, areas, startStep = 1 }) {
  const active = (areas || []).filter((a) => a.isActive);
  const pickup = active.find((a) => a._id === move.fromArea);
  const allowed = pickup ? pickup.vehicleTypes : Object.keys(VEHICLES);
  const set = (k) => (e) => setMove({ ...move, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  // If the chosen vehicle isn't offered in the pickup area, switch to the first one that is.
  useEffect(() => {
    if (pickup && !pickup.vehicleTypes.includes(move.vehicleType)) {
      setMove((m) => ({ ...m, vehicleType: pickup.vehicleTypes[0] }));
    }
  }, [pickup, move.vehicleType, setMove]);

  return (
    <>
      <div className="step-title"><span className="step-num">{startStep}</span> Route &amp; date</div>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="mf-from">Pickup area</label>
          <select id="mf-from" className="select" required value={move.fromArea} onChange={set('fromArea')}>
            <option value="">Select pickup area</option>
            {active.map((a) => <option key={a._id} value={a._id}>{a.name}, {a.city}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="mf-to">Drop area</label>
          <select id="mf-to" className="select" required value={move.toArea} onChange={set('toArea')}>
            <option value="">Select drop area</option>
            {active.map((a) => <option key={a._id} value={a._id}>{a.name}, {a.city}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="mf-date">Moving date</label>
          <input id="mf-date" type="date" className="input" required min={todayISO()} max={maxMoveDateISO()} value={move.movingDate} onChange={set('movingDate')} />
        </div>
      </div>

      <div className="divider" />
      <div className="step-title"><span className="step-num">{startStep + 1}</span> What are you moving?</div>
      <div className="pill-group" role="radiogroup" aria-label="Home size">
        {Object.keys(HOUSE_TYPES).map((h) => (
          <button
            type="button"
            key={h}
            className={`pill ${move.houseType === h ? 'on' : ''}`}
            onClick={() => {
              const suggested = SUGGESTED_VEHICLE[h];
              setMove({ ...move, houseType: h, vehicleType: allowed.includes(suggested) ? suggested : move.vehicleType });
            }}
          >
            {h}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 18 }} className="field">
        <label>Vehicle {pickup && <span className="muted">(available in {pickup.name})</span>}</label>
        <div className="pill-group">
          {Object.entries(VEHICLES).map(([name, v]) => (
            <button type="button" key={name} disabled={!allowed.includes(name)} className={`pill ${move.vehicleType === name ? 'on' : ''}`} onClick={() => setMove({ ...move, vehicleType: name })}>
              <Icon name="truck" size={15} style={{ display: 'inline', verticalAlign: '-3px', marginRight: 6 }} />
              {name}
              <small>{v.fits}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="divider" />
      <div className="step-title"><span className="step-num">{startStep + 2}</span> Access &amp; extras</div>
      <div className="form-grid">
        <label className={`check ${move.liftAvailable ? 'on' : ''}`}>
          <input type="checkbox" checked={move.liftAvailable} onChange={set('liftAvailable')} />
          <span>Lift available at both ends<small>Otherwise ₹350 per floor applies</small></span>
        </label>
        {!move.liftAvailable ? (
          <div className="form-grid" style={{ gap: 10 }}>
            <div className="field">
              <label htmlFor="mf-pf">Pickup floor</label>
              <input id="mf-pf" type="number" min="0" max="40" className="input" value={move.pickupFloor} onChange={set('pickupFloor')} />
            </div>
            <div className="field">
              <label htmlFor="mf-df">Drop floor</label>
              <input id="mf-df" type="number" min="0" max="40" className="input" value={move.dropFloor} onChange={set('dropFloor')} />
            </div>
          </div>
        ) : <div />}
        <label className={`check ${move.premiumPacking ? 'on' : ''}`}>
          <input type="checkbox" checked={move.premiumPacking} onChange={set('premiumPacking')} />
          <span>Premium 5-layer packing<small>Bubble wrap, corrugated sheets &amp; wooden crates for fragile items</small></span>
        </label>
        <label className={`check ${move.insurance ? 'on' : ''}`}>
          <input type="checkbox" checked={move.insurance} onChange={set('insurance')} />
          <span>Transit insurance (3%)<small>Covers damage or loss during the move</small></span>
        </label>
      </div>
    </>
  );
}

export function PriceSummary({ from, to, distanceKm, breakdown, move, children }) {
  const rows = breakdown
    ? [
        [`${move.vehicleType} base fare`, breakdown.vehicleBase],
        [`Distance (${distanceKm} km)`, breakdown.distanceCharge],
        [`Labour & packing (${move.houseType})`, breakdown.labourPacking],
        ['Stair charges', breakdown.floorCharge],
        ['Premium packing', breakdown.premiumPacking],
        ['Transit insurance', breakdown.insurance],
        ['GST (18%)', breakdown.gst],
      ].filter(([, v]) => v > 0)
    : [];

  return (
    <aside className="summary">
      <h3>Estimated total</h3>
      <div className="total">{breakdown ? inr(breakdown.total) : '₹ —'}</div>
      <div className="small" style={{ color: 'rgba(255,255,255,.65)' }}>
        {breakdown ? 'All-inclusive price, confirmed on booking' : 'Choose pickup & drop areas to see your price'}
      </div>
      <div className="route">
        <Icon name="pin" size={18} style={{ color: 'var(--green-400)' }} />
        <span style={{ flex: 1 }}>{from ? from.name : 'Pickup'}</span>
        <Icon name="arrow" size={16} />
        <span style={{ flex: 1, textAlign: 'right' }}>{to ? to.name : 'Drop'}</span>
      </div>
      {rows.map(([label, v]) => (
        <div className="row" key={label}>
          <span>{label}</span>
          <b>{inr(v)}</b>
        </div>
      ))}
      {children && <div style={{ marginTop: 20 }}>{children}</div>}
    </aside>
  );
}
