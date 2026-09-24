import React, { useMemo } from 'react';

// Stylised India outline (lng, lat) — intentionally simplified, for decoration only.
const OUTLINE = [
  [68.4, 23.6], [69.8, 24.2], [71.0, 24.4], [70.4, 25.8], [70.7, 27.7], [72.0, 28.1], [73.4, 29.9], [74.5, 31.0],
  [75.3, 32.3], [74.0, 33.5], [74.5, 34.7], [76.8, 35.5], [78.0, 35.3], [79.4, 34.0], [78.8, 32.5], [79.9, 30.9],
  [81.1, 30.1], [82.0, 28.6], [84.0, 27.5], [86.0, 27.4], [88.1, 27.9], [88.8, 27.3], [89.8, 26.8], [92.0, 26.9],
  [93.8, 27.7], [95.4, 29.0], [96.9, 28.3], [97.3, 27.8], [96.0, 27.2], [95.2, 26.0], [94.6, 25.0], [94.1, 23.8],
  [93.2, 22.3], [92.3, 23.7], [91.8, 25.1], [90.0, 25.2], [89.0, 25.9], [88.4, 24.7], [88.9, 22.0], [87.0, 21.5],
  [86.9, 20.8], [85.1, 19.5], [84.1, 18.3], [82.3, 16.6], [81.2, 16.3], [80.2, 15.2], [80.3, 13.4], [79.9, 12.0],
  [79.8, 10.3], [78.9, 9.3], [78.1, 8.4], [77.5, 8.1], [76.6, 8.9], [76.2, 10.3], [75.4, 11.8], [74.8, 12.9],
  [74.1, 14.8], [73.4, 16.6], [72.8, 19.0], [72.8, 20.4], [72.6, 21.4], [72.0, 21.2], [70.8, 20.8], [69.0, 22.4],
  [70.2, 22.9],
];

const W = 400;
const H = 430;
const project = (lng, lat) => [((lng - 67) / (98 - 67)) * W, ((37 - lat) / (37 - 6)) * H];

/**
 * Plots serviceable areas (grouped by city) and draws delivery arcs from the busiest hub.
 * Inactive areas are shown in grey so customers see "coming soon" cities too.
 */
export default function NetworkMap({ areas = [], height = 430, highlight }) {
  const cities = useMemo(() => {
    const byCity = {};
    areas.forEach((a) => {
      const c = byCity[a.city] || { city: a.city, lat: 0, lng: 0, n: 0, active: false, cabs: 0 };
      c.lat += a.lat;
      c.lng += a.lng;
      c.n += 1;
      c.cabs += a.isActive ? a.availableCabs || 0 : 0;
      c.active = c.active || a.isActive;
      byCity[a.city] = c;
    });
    return Object.values(byCity).map((c) => {
      const [x, y] = project(c.lng / c.n, c.lat / c.n);
      return { ...c, x, y };
    });
  }, [areas]);

  const hub = cities.filter((c) => c.active).sort((a, b) => b.cabs - a.cabs)[0];
  const outline = OUTLINE.map(([lng, lat]) => project(lng, lat).map((v) => v.toFixed(1)).join(',')).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height, maxHeight: height }} role="img" aria-label="Map of serviceable cities">
      <defs>
        <pattern id="dots" width="9" height="9" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.6" fill="#b9cdf5" />
        </pattern>
        <clipPath id="india">
          <polygon points={outline} />
        </clipPath>
      </defs>
      <polygon points={outline} fill="#eef4ff" stroke="#c9d9fb" strokeWidth="1.5" strokeLinejoin="round" />
      <rect width={W} height={H} fill="url(#dots)" clipPath="url(#india)" />

      {hub &&
        cities
          .filter((c) => c.active && c !== hub)
          .map((c) => {
            const mx = (hub.x + c.x) / 2;
            const my = (hub.y + c.y) / 2 - Math.hypot(hub.x - c.x, hub.y - c.y) * 0.25;
            return (
              <path key={`arc-${c.city}`} d={`M${hub.x},${hub.y} Q${mx},${my} ${c.x},${c.y}`} fill="none" stroke="#2f6bff" strokeWidth="1.6" strokeDasharray="5 5" opacity=".75" />
            );
          })}

      {cities.map((c) => {
        const on = highlight === c.city;
        // Put the label on the left when another city sits just to the right, so labels never collide.
        const close = cities.find((o) => o !== c && Math.hypot(o.x - c.x, o.y - c.y) < 16);
        const crowded = cities.some((o) => o !== c && o.x >= c.x && o.x - c.x < 70 && Math.abs(o.y - c.y) < 18);
        return (
          <g key={c.city}>
            {c.active && <circle cx={c.x} cy={c.y} r={on ? 16 : 11} fill="#5fbf3f" opacity=".18" />}
            <circle cx={c.x} cy={c.y} r={on ? 7 : 5.5} fill={c.active ? '#5fbf3f' : '#94a3b8'} stroke="#fff" strokeWidth="2" />
            <text
              x={crowded ? c.x - 9 : c.x + 9}
              y={c.y + 4 + (close ? (close.y > c.y ? -5 : 6) : 0)}
              textAnchor={crowded ? 'end' : 'start'}
              fontSize="11.5"
              fontWeight="700"
              fontFamily="Plus Jakarta Sans, sans-serif"
              fill={c.active ? '#0b2a5b' : '#94a3b8'}
              paintOrder="stroke"
              stroke="#fff"
              strokeWidth="3"
            >
              {c.city}
              {!c.active ? ' (soon)' : ''}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
