import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import Icon from '../../components/Icon';
import { useTitle, Alert } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { SITE, whatsappHref } from '../../config';
import { FaqList } from '../Faq';
import { FAQS } from '../../data/faqs';
import { date } from '../../utils/format';
import { useDashboard } from './CustomerLayout';

const TOPICS = ['Existing booking', 'Home relocation', 'Office shifting', 'Vehicle transport', 'Storage', 'Other'];

export default function Support() {
  useTitle('Help & support');
  const { user } = useAuth();
  const { bookings } = useDashboard();
  const list = bookings.data || [];
  const [form, setForm] = useState({ subject: TOPICS[0], booking: '', message: '' });
  const [state, setState] = useState({ loading: false, error: '', ok: '' });
  const wa = whatsappHref();

  const submit = async (e) => {
    e.preventDefault();
    setState({ loading: true, error: '', ok: '' });
    try {
      const res = await api.sendContact({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        subject: form.subject,
        message: form.booking ? `Regarding booking ${form.booking}: ${form.message}` : form.message,
      });
      setState({ loading: false, error: '', ok: res.message });
      setForm({ ...form, message: '' });
    } catch (err) {
      setState({ loading: false, error: err.message, ok: '' });
    }
  };

  return (
    <div className="split">
      <div className="dash-stack">
        <form className="card card-pad" onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
          <h3 className="card-title" style={{ margin: 0 }}>Message our team</h3>
          <p className="small muted" style={{ marginTop: -8 }}>We reply within 30 minutes during working hours ({SITE.hours}).</p>
          {!user.phone && (
            <Alert type="info">
              Add your mobile number in <Link to="/dashboard/profile" style={{ textDecoration: 'underline' }}>Profile</Link> so we can call you back.
            </Alert>
          )}
          <div className="form-grid">
            <div className="field">
              <label htmlFor="sp-topic">Topic</label>
              <select id="sp-topic" className="select" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                {TOPICS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="sp-booking">Booking (optional)</label>
              <select id="sp-booking" className="select" value={form.booking} onChange={(e) => setForm({ ...form, booking: e.target.value })}>
                <option value="">Not about a booking</option>
                {list.map((b) => <option key={b._id} value={b.bookingId}>{b.bookingId} · {date(b.movingDate)}</option>)}
              </select>
            </div>
            <div className="field full">
              <label htmlFor="sp-msg">How can we help?</label>
              <textarea id="sp-msg" className="textarea" required maxLength={1900} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="e.g. I'd like to move my slot to the afternoon" />
            </div>
          </div>
          <Alert>{state.error}</Alert>
          <Alert type="success">{state.ok}</Alert>
          <button className="btn btn-primary" disabled={state.loading || !user.phone} style={{ justifySelf: 'start' }}>
            {state.loading ? 'Sending…' : 'Send message'} <Icon name="send" size={16} />
          </button>
        </form>

        <div className="card card-pad">
          <h3 className="card-title">Common questions</h3>
          <FaqList items={FAQS} />
          <Link to="/faq" className="link-arrow" style={{ marginTop: 8 }}>All FAQs <Icon name="arrow" size={15} /></Link>
        </div>
      </div>

      <div className="dash-stack">
        <a href={SITE.phoneHref} className="card card-pad contact-card">
          <span className="kpi-icon"><Icon name="phone" /></span>
          <div><b style={{ color: 'var(--navy-800)' }}>Call us</b><div>{SITE.phone}</div><div className="small muted">{SITE.hours}</div></div>
        </a>
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="card card-pad contact-card">
            <span className="kpi-icon green"><Icon name="whatsapp" /></span>
            <div><b style={{ color: 'var(--navy-800)' }}>WhatsApp</b><div>Chat with an advisor</div></div>
          </a>
        )}
        <a href={`mailto:${SITE.email}`} className="card card-pad contact-card">
          <span className="kpi-icon"><Icon name="mail" /></span>
          <div><b style={{ color: 'var(--navy-800)' }}>Email</b><div>{SITE.email}</div><div className="small muted">We reply within 2 hours</div></div>
        </a>
      </div>
    </div>
  );
}
