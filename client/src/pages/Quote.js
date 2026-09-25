import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api';
import Icon from '../components/Icon';
import { useFetch, useTitle, PageHeader, Alert } from '../components/ui';
import { MoveFields, PriceSummary, initialMove, useMovePrice } from '../components/MoveForm';
import { useAuth } from '../context/AuthContext';
import { inr, date } from '../utils/format';

export default function Quote() {
  useTitle('Get a quote', 'Instant, itemised moving quote for your home or office. See your price update live, no sign-up needed.');
  const [params] = useSearchParams();
  const { user } = useAuth();
  const { data: areas } = useFetch(() => api.areas(), []);
  const [move, setMove] = useState(() => initialMove(Object.fromEntries(params)));
  const [contact, setContact] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
  // The session may finish loading after first render; fill in any blanks once it does.
  useEffect(() => {
    if (user) setContact((c) => ({ name: c.name || user.name, email: c.email || user.email, phone: c.phone || user.phone || '' }));
  }, [user]);
  const [status, setStatus] = useState({ loading: false, error: '', saved: null });
  const price = useMovePrice(move, areas);

  const submit = async (e) => {
    e.preventDefault();
    if (move.fromArea && move.fromArea === move.toArea && !window.confirm('Pickup and drop are in the same area. Continue?')) return;
    setStatus({ loading: true, error: '', saved: null });
    try {
      const saved = await api.createQuote({ ...move, ...contact });
      setStatus({ loading: false, error: '', saved });
      window.scrollTo(0, 0);
    } catch (err) {
      setStatus({ loading: false, error: err.message, saved: null });
    }
  };

  if (status.saved) {
    const q = status.saved;
    const bookQs = new URLSearchParams({ from: move.fromArea, to: move.toArea, house: move.houseType }).toString();
    return (
      <>
        <PageHeader crumb="Home / Quote" title="Your quotation is ready" subtitle={`A moving advisor will call you on ${q.phone} to walk you through it.`} />
        <section className="section">
          <div className="container" style={{ maxWidth: 720 }}>
            <div className="card card-pad">
              <Alert type="success">Quote saved. Reference: <b>{q._id.slice(-8).toUpperCase()}</b></Alert>
              <div className="route-line" style={{ margin: '22px 0' }}>
                <div><span className="dot">From</span><b>{q.fromArea?.name}, {q.fromArea?.city}</b></div>
                <Icon name="arrow" />
                <div><span className="dot">To</span><b>{q.toArea?.name}, {q.toArea?.city}</b></div>
              </div>
              <div className="grid-3" style={{ gap: 12 }}>
                <div className="stat-box"><span>Home</span><b style={{ fontSize: 18 }}>{q.houseType}</b></div>
                <div className="stat-box"><span>Vehicle</span><b style={{ fontSize: 18 }}>{q.vehicleType}</b></div>
                <div className="stat-box"><span>Date</span><b style={{ fontSize: 18 }}>{date(q.movingDate)}</b></div>
              </div>
              <div className="divider" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div className="muted small">Total incl. GST · {q.distanceKm} km</div>
                  <div style={{ fontSize: 34, fontWeight: 800, color: 'var(--navy-800)' }}>{inr(q.breakdown.total)}</div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="btn btn-outline" onClick={() => setStatus({ loading: false, error: '', saved: null })}>New quote</button>
                  <Link to={`/book?${bookQs}`} className="btn btn-primary">Book this move <Icon name="arrow" size={17} /></Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader crumb="Home / Get a Quote" title="Get an instant moving quote" subtitle="Tell us about your move — your price updates live as you go. No sign-up needed." />
      <section className="section">
        <form className="container split" onSubmit={submit}>
          <div className="card card-pad">
            <MoveFields move={move} setMove={setMove} areas={areas} />
            <div className="divider" />
            <div className="step-title"><span className="step-num">4</span> Where should we send your quote?</div>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="q-name">Full name</label>
                <input id="q-name" className="input" required value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="q-phone">Mobile number</label>
                <input id="q-phone" className="input" required pattern="[0-9]{10}" title="10-digit mobile number" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
              </div>
              <div className="field full">
                <label htmlFor="q-email">Email</label>
                <input id="q-email" type="email" className="input" required value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
              </div>
            </div>
          </div>
          <div className="sticky">
            <PriceSummary {...price} move={move}>
              <Alert>{status.error}</Alert>
              <button className="btn btn-green btn-block" disabled={status.loading || !price.breakdown} style={{ marginTop: status.error ? 12 : 0 }}>
                {status.loading ? 'Saving…' : 'Get my quotation'} <Icon name="arrow" size={17} />
              </button>
            </PriceSummary>
          </div>
        </form>
      </section>
    </>
  );
}
