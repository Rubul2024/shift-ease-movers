import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';

export default function NotFound() {
  return (
    <section className="section center">
      <div className="container" style={{ maxWidth: 520 }}>
        <Icon name="box" size={64} stroke={1.4} style={{ margin: '0 auto', color: 'var(--blue-500)' }} />
        <h1 style={{ fontSize: 40, color: 'var(--navy-800)', margin: '18px 0 10px' }}>Lost in transit</h1>
        <p className="muted">The page you're looking for has moved — or never existed.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 24 }}>Back to home</Link>
      </div>
    </section>
  );
}
