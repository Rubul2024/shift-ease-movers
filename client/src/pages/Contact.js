import React, { useState } from 'react';
import api from '../api';
import Icon from '../components/Icon';
import { PageHeader, Alert } from '../components/ui';

const EMPTY = { name: '', email: '', phone: '', city: '', subject: 'Home relocation', message: '' };

// Inquiry form — every submission is stored in MongoDB and appears in the admin "Contacts" screen.
export default function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [state, setState] = useState({ loading: false, error: '', ok: '' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setState({ loading: true, error: '', ok: '' });
    try {
      const res = await api.sendContact(form);
      setState({ loading: false, error: '', ok: res.message });
      setForm(EMPTY);
    } catch (err) {
      setState({ loading: false, error: err.message, ok: '' });
    }
  };

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
                <input id="c-name" className="input" required value={form.name} onChange={set('name')} />
              </div>
              <div className="field">
                <label htmlFor="c-phone">Mobile number</label>
                <input id="c-phone" className="input" required pattern="[0-9]{10}" title="10-digit mobile number" value={form.phone} onChange={set('phone')} />
              </div>
              <div className="field">
                <label htmlFor="c-email">Email</label>
                <input id="c-email" type="email" className="input" required value={form.email} onChange={set('email')} />
              </div>
              <div className="field">
                <label htmlFor="c-city">City</label>
                <input id="c-city" className="input" value={form.city} onChange={set('city')} />
              </div>
              <div className="field full">
                <label htmlFor="c-subject">I need help with</label>
                <select id="c-subject" className="select" value={form.subject} onChange={set('subject')}>
                  {['Home relocation', 'Office shifting', 'Vehicle transport', 'Storage', 'Existing booking', 'Other'].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="field full">
                <label htmlFor="c-msg">Message</label>
                <textarea id="c-msg" className="textarea" required placeholder="Tell us about your move — dates, items, special requirements…" value={form.message} onChange={set('message')} />
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
            {[
              ['phone', 'Call us', '1800 123 4567 (toll free)', '7 AM – 10 PM, all days'],
              ['mail', 'Email', 'hello@shiftease.in', 'We reply within 2 hours'],
              ['pin', 'Head office', '4th Floor, 80 Feet Road', 'Koramangala, Bengaluru 560034'],
              ['clock', 'Emergency moves', 'Same-day cabs', 'Subject to availability in your area'],
            ].map(([icon, title, line1, line2]) => (
              <div key={title} className="card card-pad" style={{ display: 'flex', gap: 16 }}>
                <span className="kpi-icon"><Icon name={icon} /></span>
                <div>
                  <b style={{ color: 'var(--navy-800)' }}>{title}</b>
                  <div>{line1}</div>
                  <div className="small muted">{line2}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
