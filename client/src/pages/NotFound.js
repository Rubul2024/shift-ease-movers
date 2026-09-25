import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import { useTitle } from '../components/ui';

export default function NotFound() {
  useTitle('Page not found');
  return (
    <section className="section center">
      <div className="container" style={{ maxWidth: 520 }}>
        <Icon name="box" size={64} stroke={1.4} style={{ margin: '0 auto', color: 'var(--blue-500)' }} />
        <h1 style={{ fontSize: 40, color: 'var(--navy-800)', margin: '18px 0 10px' }}>Lost in transit</h1>
        <p className="muted">The page you're looking for has moved — or never existed.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">Back to home</Link>
          <Link to="/quote" className="btn btn-outline">Get a quote</Link>
          <Link to="/contact" className="btn btn-outline">Contact us</Link>
        </div>
      </div>
    </section>
  );
}
