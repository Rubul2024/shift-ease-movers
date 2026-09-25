import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import { useTitle, PageHeader } from '../components/ui';
import { FAQ_GROUPS } from '../data/faqs';
import { SITE } from '../config';

export function FaqList({ items }) {
  const [open, setOpen] = useState(0);
  return items.map((f, i) => (
    <div key={f.q} className={`faq-item ${open === i ? 'open' : ''}`}>
      <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
        {f.q} <Icon name="plus" size={18} />
      </button>
      {open === i && <div className="faq-a">{f.a}</div>}
    </div>
  ));
}

export default function Faq() {
  useTitle('FAQs', 'Answers about ShiftEase moving quotes, booking, cancellation, packing, insurance and tracking.');
  return (
    <>
      <PageHeader crumb="Home / FAQs" title="Frequently asked questions" subtitle="Everything about pricing, booking, packing and moving day. Can't find your answer? We're a call away." />
      <section className="section">
        <div className="container faq-grid">
          <div style={{ display: 'grid', gap: 32 }}>
            {FAQ_GROUPS.map((g) => (
              <div key={g.title}>
                <h2 style={{ fontSize: 20, color: 'var(--navy-800)', marginBottom: 14 }}>{g.title}</h2>
                <FaqList items={g.items} />
              </div>
            ))}
          </div>
          <div className="card help-card sticky">
            <span className="kpi-icon" style={{ background: '#fff' }}><Icon name="headset" /></span>
            <h3 style={{ color: 'var(--navy-800)', margin: '16px 0 8px' }}>Still have questions?</h3>
            <p className="muted">Our moving advisors are available {SITE.hours}.</p>
            <div style={{ display: 'grid', gap: 10, marginTop: 20 }}>
              <a href={SITE.phoneHref} className="btn btn-primary"><Icon name="phone" size={17} /> Call {SITE.phone}</a>
              <Link to="/contact" className="btn btn-outline">Send an inquiry</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
