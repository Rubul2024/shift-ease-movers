import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Icon from '../components/Icon';
import NetworkMap from '../components/NetworkMap';
import { useFetch, PageHeader, Alert, Empty } from '../components/ui';

// Customers see every area where cabs are available (and which vehicles each area offers).
export default function Areas() {
  const { data: areas, loading, error } = useFetch(() => api.areas(), []);
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [pin, setPin] = useState('');
  const [pinResult, setPinResult] = useState(null);

  const cities = useMemo(() => [...new Set((areas || []).map((a) => a.city))].sort(), [areas]);
  const filtered = (areas || []).filter((a) => {
    const text = `${a.name} ${a.city} ${a.state || ''} ${(a.pincodes || []).join(' ')}`.toLowerCase();
    return (!city || a.city === city) && text.includes(q.toLowerCase());
  });

  const checkPin = async (e) => {
    e.preventDefault();
    try {
      setPinResult(await api.checkPincode(pin.trim()));
    } catch (err) {
      setPinResult({ error: err.message });
    }
  };

  return (
    <>
      <PageHeader crumb="Home / Service Areas" title="Where our cabs are available" subtitle="Live list of serviceable areas maintained by our operations team. Check your pincode or browse by city." />

      <section className="section">
        <div className="container network" style={{ alignItems: 'start' }}>
          <div>
            <div className="card card-pad">
              <h3 style={{ color: 'var(--navy-800)', fontSize: 18 }}>Check your pincode</h3>
              <p className="muted small" style={{ margin: '6px 0 14px' }}>Find out instantly if we pick up from your address.</p>
              <form onSubmit={checkPin} style={{ display: 'flex', gap: 10 }}>
                <input className="input" inputMode="numeric" maxLength={6} placeholder="e.g. 560034" value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setPinResult(null); }} aria-label="Pincode" />
                <button className="btn btn-primary" disabled={pin.length !== 6}>Check</button>
              </form>
              <div style={{ marginTop: 12 }}>
                {pinResult?.error && <Alert>{pinResult.error}</Alert>}
                {pinResult && !pinResult.error && (pinResult.serviceable ? (
                  <Alert type="success">
                    Great news! We serve <b>{pinResult.area.name}, {pinResult.area.city}</b>. <Link to="/book" style={{ textDecoration: 'underline' }}>Book a cab</Link>
                  </Alert>
                ) : (
                  <Alert type="info">We don't serve this pincode yet. <Link to="/contact" style={{ textDecoration: 'underline' }}>Leave an inquiry</Link> and we'll call you.</Alert>
                ))}
              </div>
            </div>
            <div className="map-wrap" style={{ marginTop: 20 }}>
              <NetworkMap areas={areas || []} height={420} highlight={city} />
            </div>
          </div>

          <div>
            <div className="toolbar" style={{ marginBottom: 18 }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                <Icon name="search" size={18} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--ink-500)' }} />
                <input className="input" style={{ paddingLeft: 38, width: '100%' }} placeholder="Search area, city or pincode" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <select className="select" value={city} onChange={(e) => setCity(e.target.value)} aria-label="Filter by city">
                <option value="">All cities</option>
                {cities.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <Alert>{error}</Alert>
            {loading && <div className="spinner" />}
            {!loading && filtered.length === 0 && <Empty icon="pin">No areas match your search.</Empty>}
            <div className="grid-2" style={{ gap: 14 }}>
              {filtered.map((a) => (
                <div key={a._id} className="card area-card">
                  <div className="area-top">
                    <div>
                      <h4>{a.name}</h4>
                      <div className="small muted">{a.city}{a.state ? `, ${a.state}` : ''}</div>
                    </div>
                    <span className="tag green"><Icon name="truck" size={12} /> {a.availableCabs} cabs</span>
                  </div>
                  <div className="tags">{a.vehicleTypes.map((v) => <span key={v} className="tag">{v}</span>)}</div>
                  {a.pincodes?.length > 0 && <div className="small muted">PIN: {a.pincodes.join(', ')}</div>}
                  <Link to={`/book?pickup=${a._id}`} className="link-arrow">Book from here <Icon name="arrow" size={15} /></Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
