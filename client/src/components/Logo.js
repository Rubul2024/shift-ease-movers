import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ to = '/' }) {
  return (
    <Link to={to} className="brand" aria-label="ShiftEase Movers home">
      <svg width="38" height="38" viewBox="0 0 64 64" aria-hidden="true">
        <path d="M6 48 L28 10 L38 28 L28 28 L20 48 Z" fill="#2f6bff" />
        <path d="M26 48 L42 20 L58 48 Z" fill="#5fbf3f" />
        <path d="M20 48 L28 34 L34 48 Z" fill="#0b2a5b" />
      </svg>
      <div>
        <div className="brand-name">
          Shift<span>Ease</span>
        </div>
        <span className="brand-tag">PACKERS &amp; MOVERS</span>
      </div>
    </Link>
  );
}
