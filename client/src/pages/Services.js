import React from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Icon from '../components/Icon';
import { useFetch, useTitle, PageHeader, Alert } from '../components/ui';
import { VEHICLES } from '../utils/pricing';
import { inr } from '../utils/format';

// Where each service's call-to-action goes: a pre-filled quote, or an inquiry for services priced case by case.
export function serviceCta(s) {
  if (s.icon === 'office') return { to: '/quote?house=Office', label: 'Get quote' };
  if (s.icon === 'car' || s.icon === 'bike') return { to: '/contact?subject=Vehicle+transport', label: 'Enquire' };
  if (s.icon === 'warehouse') return { to: '/contact?subject=Storage', label: 'Enquire' };
  return { to: '/quote', label: 'Get quote' };
}

export default function Services() {
  useTitle('Services', 'Home relocation, office shifting, vehicle transport, packing and storage. Transparent rates for every moving cab.');
  const { data: services, loading, error } = useFetch(() => api.services(), []);

  return (
    <>
      <PageHeader crumb="Home / Services" title="Moving services" subtitle="Everything you need to move home or office — packed, loaded, tracked and delivered by one accountable team." />

      <section className="section">
        <div className="container">
          <Alert>{error}</Alert>
          {loading && <div className="spinner" />}
          <div className="grid-3">
            {(services || []).map((s, i) => (
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
                    <Link to={serviceCta(s).to} className="link-arrow">{serviceCta(s).label} <Icon name="arrow" size={16} /></Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-soft">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Our fleet</div>
              <h2 className="section-title">Pick the right cab for your move</h2>
              <p className="section-sub">Transparent rates: a fixed base fare plus a per-kilometre charge. Labour and packing depend on your home size.</p>
            </div>
          </div>
          <div className="grid-4">
            {Object.entries(VEHICLES).map(([name, v]) => (
              <div key={name} className="card card-pad">
                <span className="kpi-icon"><Icon name="truck" /></span>
                <h3 style={{ fontSize: 18, color: 'var(--navy-800)', margin: '14px 0 4px' }}>{name}</h3>
                <p className="muted small">Best for {v.fits}</p>
                <div className="divider" style={{ margin: '16px 0' }} />
                <div className="small muted">Base fare</div>
                <b style={{ fontSize: 22, color: 'var(--navy-800)' }}>{inr(v.base)}</b>
                <div className="small muted" style={{ marginTop: 6 }}>+ {inr(v.perKm)} / km</div>
              </div>
            ))}
          </div>
          <div className="center" style={{ marginTop: 36 }}>
            <Link to="/book" className="btn btn-primary">Book a cab instantly <Icon name="arrow" size={17} /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
