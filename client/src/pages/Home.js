import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import Icon from '../components/Icon';
import HeroArt from '../components/HeroArt';
import NetworkMap from '../components/NetworkMap';
import { useFetch, StatusTimeline } from '../components/ui';
import { HOUSE_TYPES } from '../utils/pricing';
import { inr } from '../utils/format';

const MOVE_TYPES = [
  { icon: 'home', label: 'Apartments & Villas' },
  { icon: 'office', label: 'Offices & Co-working' },
  { icon: 'car', label: 'Cars' },
  { icon: 'bike', label: 'Bikes & Scooters' },
  { icon: 'sofa', label: 'Furniture Only' },
  { icon: 'piano', label: 'Pianos & Fragile' },
  { icon: 'plant', label: 'Plants & Décor' },
  { icon: 'warehouse', label: 'Storage Pickups' },
  { icon: 'layers', label: 'Student Moves' },
  { icon: 'globe', label: 'Intercity Moves' },
];

const TESTIMONIALS = [
  { name: 'Ananya R.', role: '2 BHK · Koramangala → Whitefield', text: 'The quote on the website was exactly what I paid. The team packed our kitchen in under two hours and nothing broke.' },
  { name: 'Vikram S.', role: 'Office · 40 desks · Andheri', text: 'Booked a Container on Thursday night, moved over the weekend, team was working on Monday. Live tracking kept my boss calm.' },
  { name: 'Meera & Arjun', role: '3 BHK · Pune → Hyderabad', text: 'Loved seeing each step of the move on the tracker. Premium packing was worth it for our glass dining table.' },
];

const FAQS = [
  { q: 'How is my moving quote calculated?', a: 'We combine a vehicle base fare, distance between your pickup and drop areas, labour & packing for your home size, stair charges if there is no lift, and optional premium packing or insurance. GST (18%) is shown separately — no hidden costs.' },
  { q: 'Can I book a moving cab for today?', a: 'Yes. If cabs are available in your pickup area you can book instantly for today or any future date and get a booking ID immediately.' },
  { q: 'Which areas do you serve?', a: 'See the Service Areas page for the live list. Our operations team adds new areas regularly, and you can check any pincode instantly.' },
  { q: 'How do I track my move?', a: 'Enter your booking ID on the Track page, or open My Moves after logging in. Every status update from our team shows up with a timestamp.' },
  { q: 'Can I cancel a booking?', a: 'You can cancel free of charge from My Moves until a vehicle has picked up your goods.' },
];

function QuickBar({ areas }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('quote');
  const [form, setForm] = useState({ from: '', to: '', house: '2 BHK' });
  const [trackId, setTrackId] = useState('');
  const active = (areas || []).filter((a) => a.isActive);

  const go = (e) => {
    e.preventDefault();
    const q = new URLSearchParams({ from: form.from, to: form.to, house: form.house });
    navigate(`/quote?${q.toString()}`);
  };

  return (
    <div className="container quick-bar">
      <div className="quick-card">
        <div className="quick-tabs">
          <button className={`quick-tab ${tab === 'quote' ? 'active' : ''}`} onClick={() => setTab('quote')}>
            <Icon name="bolt" size={15} /> Instant Quote
          </button>
          <button className={`quick-tab ${tab === 'track' ? 'active' : ''}`} onClick={() => setTab('track')}>
            <Icon name="pin" size={15} /> Track Move
          </button>
        </div>
        {tab === 'quote' ? (
          <form className="quick-row" onSubmit={go}>
            <div className="field">
              <label htmlFor="qb-from">Moving from</label>
              <select id="qb-from" className="select" required value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })}>
                <option value="">Select pickup area</option>
                {active.map((a) => (
                  <option key={a._id} value={a._id}>{a.name}, {a.city}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="qb-to">Moving to</label>
              <select id="qb-to" className="select" required value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })}>
                <option value="">Select drop area</option>
                {active.map((a) => (
                  <option key={a._id} value={a._id}>{a.name}, {a.city}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="qb-house">Home size</label>
              <select id="qb-house" className="select" value={form.house} onChange={(e) => setForm({ ...form, house: e.target.value })}>
                {Object.keys(HOUSE_TYPES).map((h) => <option key={h}>{h}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" type="submit">
              Get Price <Icon name="arrow" size={17} />
            </button>
          </form>
        ) : (
          <form className="quick-row track" onSubmit={(e) => { e.preventDefault(); if (trackId.trim()) navigate(`/track/${trackId.trim()}`); }}>
            <div className="field">
              <label htmlFor="qb-track">Booking ID</label>
              <input id="qb-track" className="input" placeholder="e.g. SE12345ABCDE" value={trackId} onChange={(e) => setTrackId(e.target.value)} />
            </div>
            <button className="btn btn-primary" type="submit">
              Track <Icon name="arrow" size={17} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const { data: areas } = useFetch(() => api.areas(), []);
  const { data: services } = useFetch(() => api.services(), []);
  const [openFaq, setOpenFaq] = useState(0);

  const activeAreas = (areas || []).filter((a) => a.isActive);
  const cityCount = new Set(activeAreas.map((a) => a.city)).size;
  const cabCount = activeAreas.reduce((s, a) => s + (a.availableCabs || 0), 0);

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="eyebrow">Trusted packers &amp; movers · Since 2011</div>
            <h1>
              Move Smarter.
              <span className="line2">Settle Faster.</span>
            </h1>
            <p className="lead">
              Get an instant, transparent quote and book a verified moving cab in under two minutes. Trained packers,
              GPS-tracked trucks and zero hidden charges — from a 1 RK to a full office.
            </p>
            <div className="hero-ctas">
              <Link to="/book" className="btn btn-primary">
                Book a Cab Now <Icon name="arrow" size={17} />
              </Link>
              <Link to="/quote" className="btn btn-outline">
                Get a Free Quote
              </Link>
            </div>
            <div className="hero-badges">
              <span><Icon name="shield" size={17} /> Transit insurance</span>
              <span><Icon name="clock" size={17} /> On-time guarantee</span>
              <span><Icon name="rupee" size={17} /> Fixed price</span>
            </div>
          </div>
          <HeroArt />
        </div>
      </section>

      <QuickBar areas={areas} />

      {/* NETWORK */}
      <section className="section">
        <div className="container network">
          <div>
            <div className="eyebrow">Service network</div>
            <h2 className="section-title">Connecting homes across India</h2>
            <p className="section-sub">
              Our admin team defines exactly where cabs can be booked, so you only see areas where a truck and crew are
              genuinely available. New neighbourhoods are added every month.
            </p>
            <div className="stat-row">
              <div className="stat-box"><b>{cityCount || '—'}</b><span>Cities live</span></div>
              <div className="stat-box"><b>{activeAreas.length || '—'}</b><span>Service areas</span></div>
              <div className="stat-box"><b>{cabCount || '—'}</b><span>Cabs on duty</span></div>
            </div>
            <Link to="/areas" className="btn btn-outline" style={{ marginTop: 28 }}>
              Explore service areas <Icon name="arrow" size={17} />
            </Link>
          </div>
          <div className="map-wrap">
            <NetworkMap areas={areas || []} height={440} />
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section bg-soft">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Our solutions</div>
              <h2 className="section-title">Flexible moving for every need</h2>
            </div>
            <Link to="/services" className="link-arrow">View all services <Icon name="arrow" size={16} /></Link>
          </div>
          <div className="grid-3">
            {(services || []).slice(0, 3).map((s, i) => (
              <article key={s._id} className="card service-card">
                <div className={`service-visual v${i % 3}`}>
                  <Icon name={s.icon} size={76} stroke={1.4} className="big" />
                </div>
                <div className="service-body">
                  <div className="service-icon"><Icon name={s.icon} size={20} /></div>
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="price-from">from <b>{inr(s.startingPrice)}</b></span>
                    <Link to="/quote" className="link-arrow">Get quote <Icon name="arrow" size={16} /></Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PRIORITY BAND */}
      <section className="band section">
        <div className="container band-grid">
          <div>
            <div className="eyebrow">Live tracking</div>
            <h2 className="section-title">Your move. Our priority.</h2>
            <p style={{ marginTop: 14 }}>
              Every booking gets an ID the second you confirm. Follow each step — vehicle assigned, picked up, in transit,
              delivered — from any device.
            </p>
            <Link to="/track" className="btn btn-green" style={{ marginTop: 28 }}>
              Track your move <Icon name="arrow" size={17} />
            </Link>
          </div>
          <div className="track-card">
            <div className="track-card-head">
              <div>
                <div className="small muted">Booking</div>
                <b style={{ color: 'var(--navy-800)', fontSize: 17 }}>#SE48213KXQ7P</b>
              </div>
              <span className="tag warn">Picked Up</span>
            </div>
            <StatusTimeline
              status="Picked Up"
              history={[
                { status: 'Confirmed', at: '2026-09-18T08:05:00' },
                { status: 'Vehicle Assigned', at: '2026-09-19T18:30:00' },
                { status: 'Picked Up', at: '2026-09-20T09:40:00' },
              ]}
            />
          </div>
        </div>
      </section>

      {/* KPI STRIP */}
      <section className="section-sm">
        <div className="container kpis">
          <div className="kpi"><span className="kpi-icon green"><Icon name="box" /></span><div><b>48,000+</b><span>Moves completed</span></div></div>
          <div className="kpi"><span className="kpi-icon"><Icon name="clock" /></span><div><b>98.7%</b><span>On-time arrivals</span></div></div>
          <div className="kpi"><span className="kpi-icon"><Icon name="headset" /></span><div><b>24/7</b><span>Customer support</span></div></div>
          <div className="kpi"><span className="kpi-icon green"><Icon name="shield" /></span><div><b>15+</b><span>Years of experience</span></div></div>
        </div>
      </section>

      {/* MOVE TYPES */}
      <section className="section" style={{ paddingTop: 24 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Built for every move</div>
              <h2 className="section-title">What we move</h2>
              <p className="section-sub">From a single sofa to an entire office floor, we have the right crew and vehicle.</p>
            </div>
            <Link to="/services" className="link-arrow">All services <Icon name="arrow" size={16} /></Link>
          </div>
          <div className="grid-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {MOVE_TYPES.map((m) => (
              <Link key={m.label} to="/quote" className="tile">
                <Icon name={m.icon} size={22} /> {m.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section bg-soft">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Real moves, real results</div>
              <h2 className="section-title">Trusted by thousands of families</h2>
            </div>
          </div>
          <div className="grid-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="card quote-card" style={{ margin: 0 }}>
                <div className="stars">{[1, 2, 3, 4, 5].map((i) => <Icon key={i} name="star" size={16} />)}</div>
                <p>“{t.text}”</p>
                <figcaption className="person">
                  <span className="avatar">{t.name[0]}</span>
                  <div>
                    <b style={{ color: 'var(--navy-800)', fontSize: 14 }}>{t.name}</b>
                    <div className="small muted">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Common questions</div>
              <h2 className="section-title">Frequently asked questions</h2>
            </div>
          </div>
          <div className="faq-grid">
            <div>
              {FAQS.map((f, i) => (
                <div key={f.q} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                  <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)} aria-expanded={openFaq === i}>
                    {f.q} <Icon name="plus" size={18} />
                  </button>
                  {openFaq === i && <div className="faq-a">{f.a}</div>}
                </div>
              ))}
            </div>
            <div className="card help-card">
              <span className="kpi-icon" style={{ background: '#fff' }}><Icon name="headset" /></span>
              <h3 style={{ color: 'var(--navy-800)', margin: '16px 0 8px' }}>Need help?</h3>
              <p className="muted">Our moving advisors are available 24/7 to plan your move and answer questions.</p>
              <Link to="/contact" className="btn btn-primary" style={{ marginTop: 20 }}>
                Contact support <Icon name="arrow" size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta">
            <div>
              <div className="eyebrow" style={{ color: 'var(--green-400)' }}>Ready to move?</div>
              <h2>Let's move you forward.</h2>
              <p>Get a free quote today and lock in your moving date in minutes.</p>
              <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
                <Link to="/quote" className="btn btn-green">Get a Quote <Icon name="arrow" size={17} /></Link>
                <Link to="/book" className="btn btn-light">Book a Cab</Link>
              </div>
            </div>
            <div className="cta-contacts">
              <div><Icon name="phone" /> 1800 123 4567</div>
              <div><Icon name="mail" /> hello@shiftease.in</div>
              <div><Icon name="pin" /> Koramangala, Bengaluru 560034</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
