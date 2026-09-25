import React from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Icon from '../components/Icon';
import { useFetch, useTitle, PageHeader } from '../components/ui';
import { SITE } from '../config';

const VALUES = [
  { icon: 'rupee', title: 'Honest, upfront pricing', text: 'Every quote is itemised: vehicle, distance, labour, stairs, packing and GST. What you see online is what you pay for the move you booked.' },
  { icon: 'shield', title: 'Care for every carton', text: 'Trained, background-verified crews, five-layer packing for fragile items and optional transit insurance on every move.' },
  { icon: 'clock', title: 'On time, every time', text: 'Arrival windows you choose, live status updates at every step and a crew lead who calls you the evening before.' },
  { icon: 'headset', title: 'People who pick up', text: 'Real moving advisors on the phone and on email, from your first quote until the last box is unpacked.' },
];

const STEPS = [
  { title: 'Get an instant quote', text: 'Pick your areas, home size and extras. Your price updates as you go.' },
  { title: 'Book a cab', text: 'Choose a date and arrival slot and get a booking ID immediately. No advance payment.' },
  { title: 'We pack & load', text: 'Our crew packs, dismantles furniture and loads the vehicle on the day.' },
  { title: 'Track & settle in', text: 'Follow every step live. We unload, re-assemble and you pay after delivery.' },
];

export default function About() {
  useTitle('About us', 'ShiftEase Movers: verified packers, GPS-tracked moving cabs and transparent pricing for home and office moves across India.');
  const { data: areas } = useFetch(() => api.areas(), []);
  const cities = new Set((areas || []).map((a) => a.city)).size;
  const years = new Date().getFullYear() - SITE.founded;

  return (
    <>
      <PageHeader crumb="Home / About" title="Moving homes and offices since 2011" subtitle="ShiftEase started with one truck and a promise: a move should be predictable, fairly priced and handled with care. That promise still runs every booking." />

      <section className="section">
        <div className="container split" style={{ alignItems: 'center' }}>
          <div>
            <div className="eyebrow">Our story</div>
            <h2 className="section-title">Built by people who hated moving day</h2>
            <p className="muted" style={{ marginTop: 14 }}>
              Our founders moved cities five times in eight years and every move had the same problems: vague quotes over the
              phone, surprise charges on the day and no idea where the truck was. ShiftEase was built to fix exactly that.
            </p>
            <p className="muted" style={{ marginTop: 12 }}>
              Today our crews move 1 RK flats, family homes and full office floors. Every price comes from the same published
              formula, every booking gets an ID you can track, and our operations team only opens an area for booking once a
              truck and a trained crew are really available there.
            </p>
            <div className="stat-row">
              <div className="stat-box"><b>{years}+</b><span>Years moving</span></div>
              <div className="stat-box"><b>{cities || '—'}</b><span>Cities live</span></div>
              <div className="stat-box"><b>24/7</b><span>Support</span></div>
            </div>
          </div>
          <div className="card card-pad" style={{ background: 'var(--blue-50)', border: 0 }}>
            <h3 style={{ color: 'var(--navy-800)', marginBottom: 16 }}>How a ShiftEase move works</h3>
            <ol className="steps-list">
              {STEPS.map((s, i) => (
                <li key={s.title}>
                  <span className="step-num">{i + 1}</span>
                  <div><b>{s.title}</b><p className="small muted">{s.text}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="section bg-soft">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">What we stand for</div>
              <h2 className="section-title">Our promise on every move</h2>
            </div>
          </div>
          <div className="grid-4">
            {VALUES.map((v) => (
              <div key={v.title} className="card card-pad">
                <span className="kpi-icon"><Icon name={v.icon} /></span>
                <h3 style={{ fontSize: 17, color: 'var(--navy-800)', margin: '14px 0 6px' }}>{v.title}</h3>
                <p className="small muted">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta">
            <div>
              <div className="eyebrow" style={{ color: 'var(--green-400)' }}>Planning a move?</div>
              <h2>Talk to a moving advisor today.</h2>
              <p>Get a free quote in two minutes or call us and we'll plan it with you.</p>
              <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
                <Link to="/quote" className="btn btn-green">Get a Quote <Icon name="arrow" size={17} /></Link>
                <Link to="/contact" className="btn btn-light">Contact us</Link>
              </div>
            </div>
            <div className="cta-contacts">
              <a href={SITE.phoneHref}><Icon name="phone" /> {SITE.phone}</a>
              <a href={`mailto:${SITE.email}`}><Icon name="mail" /> {SITE.email}</a>
              <a href={SITE.address.mapUrl} target="_blank" rel="noopener noreferrer"><Icon name="pin" /> {SITE.address.line2}</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
