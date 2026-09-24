import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import Icon from './Icon';

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Logo />
            <p className="small" style={{ marginTop: 14, maxWidth: 280 }}>
              Verified packers, GPS-tracked cabs and transparent pricing for home and office moves across India.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              {['facebook', 'instagram', 'linkedin'].map((s) => (
                <a key={s} href="#social" aria-label={s} className="icon-btn" style={{ color: '#fff', background: 'rgba(255,255,255,.08)' }}>
                  <Icon name={s} size={18} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h5>Quick Links</h5>
            <ul>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/areas">Service Areas</Link></li>
              <li><Link to="/quote">Get a Quote</Link></li>
              <li><Link to="/track">Track Booking</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h5>Our Services</h5>
            <ul>
              <li>Home Relocation</li>
              <li>Office Shifting</li>
              <li>Vehicle Transport</li>
              <li>Packing &amp; Unpacking</li>
              <li>Storage</li>
            </ul>
          </div>
          <div>
            <h5>Stay Connected</h5>
            <ul>
              <li style={{ display: 'flex', gap: 8 }}><Icon name="phone" size={17} /> 1800 123 4567 (toll free)</li>
              <li style={{ display: 'flex', gap: 8 }}><Icon name="mail" size={17} /> hello@shiftease.in</li>
            </ul>
            <p className="small" style={{ marginTop: 16 }}>Moving tips and offers, once a month.</p>
            {subscribed ? (
              <p className="small text-green" style={{ marginTop: 10 }}>You're subscribed. Thank you!</p>
            ) : (
              <form className="newsletter" onSubmit={(e) => { e.preventDefault(); setSubscribed(true); }}>
                <input type="email" required placeholder="Your email address" aria-label="Email" />
                <button type="submit" aria-label="Subscribe"><Icon name="send" size={16} /></button>
              </form>
            )}
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} ShiftEase Movers. All rights reserved.</span>
          <span>Privacy Policy · Terms of Service</span>
        </div>
      </div>
    </footer>
  );
}
