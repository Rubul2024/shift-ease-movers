import React from 'react';
import Icon from './Icon';

// Hand-drawn SVG hero illustration: loaded moving truck, stacked cartons and a city skyline.
export default function HeroArt() {
  return (
    <div className="hero-art" style={{ position: 'relative' }}>
      <svg viewBox="0 0 560 420" role="img" aria-label="ShiftEase moving truck loaded with cartons">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#dbe7ff" />
            <stop offset="1" stopColor="#f3f7ff" />
          </linearGradient>
          <linearGradient id="cab" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#123a78" />
            <stop offset="1" stopColor="#081f45" />
          </linearGradient>
          <linearGradient id="stripe" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#2f6bff" />
            <stop offset="1" stopColor="#5fbf3f" />
          </linearGradient>
        </defs>

        <circle cx="300" cy="200" r="190" fill="url(#sky)" />
        {/* skyline */}
        <g fill="#c9d9fb" opacity=".8">
          <rect x="140" y="110" width="40" height="200" rx="3" />
          <rect x="186" y="70" width="52" height="240" rx="3" />
          <rect x="244" y="130" width="36" height="180" rx="3" />
          <rect x="360" y="90" width="46" height="220" rx="3" />
          <rect x="412" y="140" width="38" height="170" rx="3" />
        </g>
        <g fill="#f3f7ff" opacity=".9">
          {[0, 1, 2, 3, 4, 5, 6].map((r) =>
            [0, 1].map((c) => <rect key={`${r}${c}`} x={196 + c * 18} y={84 + r * 26} width="10" height="12" rx="1.5" />)
          )}
          {[0, 1, 2, 3, 4, 5].map((r) =>
            [0, 1].map((c) => <rect key={`b${r}${c}`} x={370 + c * 16} y={104 + r * 28} width="9" height="12" rx="1.5" />)
          )}
        </g>
        {/* plane */}
        <g transform="translate(420 58) rotate(-12)" fill="#0b2a5b">
          <path d="M0 10 L60 6 L72 0 L76 4 L68 10 L76 16 L72 20 L60 14 L0 12 Z" />
          <path d="M30 8 L20 -8 L28 -8 L44 8 Z M30 12 L20 26 L28 26 L44 12 Z" fill="#2f6bff" />
        </g>
        <path d="M300 70 C 360 30, 420 40, 440 52" stroke="#2f6bff" strokeDasharray="4 6" strokeWidth="2" fill="none" opacity=".6" />

        {/* road */}
        <rect x="20" y="332" width="540" height="56" rx="28" fill="#e6eeff" />
        <path d="M60 360 H520" stroke="#fff" strokeWidth="4" strokeDasharray="22 16" strokeLinecap="round" />

        {/* cartons */}
        <g>
          <rect x="44" y="268" width="70" height="64" rx="4" fill="#d9a066" />
          <rect x="44" y="268" width="70" height="10" fill="#c48a50" />
          <rect x="74" y="268" width="10" height="64" fill="#efc48f" />
          <rect x="58" y="214" width="56" height="54" rx="4" fill="#e3ad73" />
          <rect x="81" y="214" width="9" height="54" fill="#f3cf9f" />
          <rect x="116" y="290" width="44" height="42" rx="4" fill="#cf9558" />
          <rect x="132" y="290" width="8" height="42" fill="#e9bb84" />
          <path d="M66 300 l6 -8 l6 8 M72 292 v14" stroke="#8a5a2b" strokeWidth="2" fill="none" />
        </g>

        {/* truck container */}
        <rect x="168" y="168" width="248" height="150" rx="12" fill="#ffffff" stroke="#d5e0f3" strokeWidth="2" />
        <rect x="168" y="276" width="248" height="14" fill="url(#stripe)" />
        <g transform="translate(192 196)">
          <path d="M0 40 L18 8 L26 22 L18 22 L12 40 Z" fill="#2f6bff" />
          <path d="M16 40 L28 18 L40 40 Z" fill="#5fbf3f" />
          <text x="50" y="30" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="800" fontSize="26" fill="#0b2a5b">
            Shift<tspan fill="#2f6bff">Ease</tspan>
          </text>
          <text x="51" y="48" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="700" fontSize="10" letterSpacing="3" fill="#5fbf3f">
            PACKERS &amp; MOVERS
          </text>
        </g>
        <text x="192" y="262" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="11" fill="#64748b">1800 123 4567 · shiftease.in</text>

        {/* cab */}
        <path d="M416 206 H468 Q480 206 486 216 L510 256 Q514 262 514 270 V318 H416 Z" fill="url(#cab)" />
        <path d="M430 218 H464 Q470 218 474 224 L492 254 H430 Z" fill="#9cc0ff" />
        <path d="M436 222 L452 222 L440 250 L434 250 Z" fill="#ffffff" opacity=".35" />
        <rect x="498" y="280" width="16" height="8" rx="2" fill="#ffd166" />
        <rect x="416" y="300" width="100" height="18" rx="4" fill="#081f45" />

        {/* wheels */}
        {[220, 312, 470].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="322" r="26" fill="#0f172a" />
            <circle cx={cx} cy="322" r="11" fill="#cbd5e1" />
            <circle cx={cx} cy="322" r="4" fill="#64748b" />
          </g>
        ))}
      </svg>

      {/* floating UI cards */}
      <div className="card floaty" style={{ position: 'absolute', top: '4%', left: '-2%', padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'center', boxShadow: 'var(--shadow)' }}>
        <span className="kpi-icon green" style={{ width: 36, height: 36 }}><Icon name="check" size={18} /></span>
        <div>
          <b style={{ fontSize: 13, color: 'var(--navy-800)', display: 'block' }}>Booking confirmed</b>
          <span className="small muted">2 BHK · Tempo · Sat 9 AM</span>
        </div>
      </div>
      <div className="card floaty" style={{ position: 'absolute', bottom: '14%', right: '-2%', padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'center', boxShadow: 'var(--shadow)', animationDelay: '1.5s' }}>
        <span className="kpi-icon" style={{ width: 36, height: 36 }}><Icon name="pin" size={18} /></span>
        <div>
          <b style={{ fontSize: 13, color: 'var(--navy-800)', display: 'block' }}>In transit</b>
          <span className="small muted">Arriving in 42 min</span>
        </div>
      </div>
    </div>
  );
}
