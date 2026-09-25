import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Logo from './Logo';
import Icon from './Icon';
import { SITE } from '../config';

function Newsletter() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState({ loading: false, error: '', ok: '' });

  const submit = async (e) => {
    e.preventDefault();
    setState({ loading: true, error: '', ok: '' });
    try {
      const res = await api.subscribe(email);
      setState({ loading: false, error: '', ok: res.message });
      setEmail('');
    } catch (err) {
      setState({ loading: false, error: err.message, ok: '' });
    }
  };

  if (state.ok) return <p className="small text-green" style={{ marginTop: 10 }}>{state.ok}</p>;
  return (
    <>
      <form className="newsletter" onSubmit={submit}>
        <input type="email" required placeholder="Your email address" aria-label="Email for newsletter" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button type="submit" aria-label="Subscribe" disabled={state.loading}><Icon name="send" size={16} /></button>
      </form>
      {state.error && <p className="small" style={{ color: '#fca5a5', marginTop: 8 }}>{state.error}</p>}
    </>
  );
}

export default function Footer() {
  const socials = Object.entries(SITE.social).filter(([, url]) => url);
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Logo />
            <p className="small" style={{ marginTop: 14, maxWidth: 280 }}>
              Verified packers, GPS-tracked cabs and transparent pricing for home and office moves across India.
            </p>
            {socials.length > 0 && (
              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                {socials.map(([name, url]) => (
                  <a key={name} href={url} target="_blank" rel="noopener noreferrer" aria-label={`ShiftEase on ${name}`} className="icon-btn" style={{ color: '#fff', background: 'rgba(255,255,255,.08)' }}>
                    <Icon name={name} size={18} />
                  </a>
                ))}
              </div>
            )}
          </div>
          <div>
            <h5>Company</h5>
            <ul>
              <li><Link to="/about">About us</Link></li>
              <li><Link to="/areas">Service areas</Link></li>
              <li><Link to="/track">Track booking</Link></li>
              <li><Link to="/faq">FAQs</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h5>Our Services</h5>
            <ul>
              <li><Link to="/quote?house=2+BHK">Home relocation</Link></li>
              <li><Link to="/quote?house=Office">Office shifting</Link></li>
              <li><Link to="/contact?subject=Vehicle+transport">Vehicle transport</Link></li>
              <li><Link to="/services">Packing &amp; unpacking</Link></li>
              <li><Link to="/contact?subject=Storage">Storage</Link></li>
            </ul>
          </div>
          <div>
            <h5>Stay Connected</h5>
            <ul>
              <li><a href={SITE.phoneHref} style={{ display: 'flex', gap: 8 }}><Icon name="phone" size={17} /> {SITE.phone} (toll free)</a></li>
              <li><a href={`mailto:${SITE.email}`} style={{ display: 'flex', gap: 8 }}><Icon name="mail" size={17} /> {SITE.email}</a></li>
              <li><a href={SITE.address.mapUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', gap: 8 }}><Icon name="pin" size={17} /> {SITE.address.line2}</a></li>
            </ul>
            <p className="small" style={{ marginTop: 16 }}>Moving tips and offers, once a month.</p>
            <Newsletter />
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</span>
          <span style={{ display: 'flex', gap: 16 }}>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
