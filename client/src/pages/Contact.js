import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import Icon from '../components/Icon';
import { PageHeader, Alert, useTitle } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { SITE, whatsappHref } from '../config';

const SUBJECTS = ['Home relocation', 'Office shifting', 'Vehicle transport', 'Storage', 'Existing booking', 'Other'];

// Inquiry form — every submission is stored in MongoDB and appears in the admin "Contacts" screen.
export default function Contact() {
  useTitle('Contact us', `Talk to a ShiftEase moving advisor. Call ${SITE.phone}, email ${SITE.email} or send an inquiry.`);
  const [params] = useSearchParams();
  const { user } = useAuth();
  const booking = params.get('booking');
  const blank = () => ({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: '',
    subject: SUBJECTS.includes(params.get('subject')) ? params.get('subject') : SUBJECTS[0],
    message: booking ? `Regarding booking ${booking}: ` : '',
  });
  const [form, setForm] = useState(blank);
  const [state, setState] = useState({ loading: false, error: '', ok: '' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setState({ loading: true, error: '', ok: '' });
    try {
      const res = await api.sendContact(form);
      setState({ loading: false, error: '', ok: res.message });
      setForm({ ...blank(), message: '' });
    } catch (err) {
      setState({ loading: false, error: err.message, ok: '' });
    }
  };

  const wa = whatsappHref();
  const cards = [
    { icon: 'phone', title: 'Call us', line1: `${SITE.phone} (toll free)`, line2: SITE.hours, href: SITE.phoneHref },
    { icon: 'mail', title: 'Email', line1: SITE.email, line2: 'We reply within 2 hours', href: `mailto:${SITE.email}` },
    wa && { icon: 'whatsapp', title: 'WhatsApp', line1: 'Chat with an advisor', line2: 'Share photos of what you are moving', href: wa, external: true },
    { icon: 'pin', title: 'Head office', line1: SITE.address.line1, line2: SITE.address.line2, href: SITE.address.mapUrl, external: true },
    { icon: 'clock', title: 'Emergency moves', line1: 'Same-day cabs', line2: 'Subject to availability in your area' },
  ].filter(Boolean);

  return (
    <>
      <PageHeader crumb="Home / Contact" title="Talk to a moving advisor" subtitle="Send us your inquiry and we'll call you back within 30 minutes during working hours." />
      <section className="section">
        <div className="container split">
          <form className="card card-pad" onSubmit={submit}>
            <div className="step-title">Send an inquiry</div>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="c-name">Full name</label>
                <input id="c-name" className="input" required maxLength={100} autoComplete="name" value={form.name} onChange={set('name')} />
              </div>
              <div className="field">
                <label htmlFor="c-phone">Mobile number</label>
                <input id="c-phone" className="input" required inputMode="numeric" pattern="[0-9]{10}" title="10-digit mobile number" autoComplete="tel" value={form.phone} onChange={set('phone')} />
              </div>
              <div className="field">
                <label htmlFor="c-email">Email</label>
                <input id="c-email" type="email" className="input" required autoComplete="email" value={form.email} onChange={set('email')} />
              </div>
              <div className="field">
                <label htmlFor="c-city">City</label>
                <input id="c-city" className="input" maxLength={100} value={form.city} onChange={set('city')} />
              </div>
              <div className="field full">
                <label htmlFor="c-subject">I need help with</label>
                <select id="c-subject" className="select" value={form.subject} onChange={set('subject')}>
                  {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="field full">
                <label htmlFor="c-msg">Message</label>
                <textarea id="c-msg" className="textarea" required maxLength={2000} placeholder="Tell us about your move: dates, items, special requirements…" value={form.message} onChange={set('message')} />
              </div>
            </div>
            <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>
              <Alert>{state.error}</Alert>
              <Alert type="success">{state.ok}</Alert>
              <button className="btn btn-primary" disabled={state.loading} style={{ justifySelf: 'start' }}>
                {state.loading ? 'Sending…' : 'Send inquiry'} <Icon name="send" size={16} />
              </button>
            </div>
          </form>
          <div style={{ display: 'grid', gap: 16 }}>
            {cards.map((c) => {
              const body = (
                <>
                  <span className="kpi-icon"><Icon name={c.icon} /></span>
                  <div>
                    <b style={{ color: 'var(--navy-800)' }}>{c.title}</b>
                    <div>{c.line1}</div>
                    <div className="small muted">{c.line2}</div>
                  </div>
                </>
              );
              return c.href ? (
                <a key={c.title} href={c.href} className="card card-pad contact-card" {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                  {body}
                </a>
              ) : (
                <div key={c.title} className="card card-pad contact-card">{body}</div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
