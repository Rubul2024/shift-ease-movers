import React from 'react';
import { matchPath, useOutletContext } from 'react-router-dom';
import api from '../../api';
import DashShell from '../../components/DashShell';
import { useFetch } from '../../components/ui';

export const ACTIVE = (b) => !['Delivered', 'Cancelled'].includes(b.status);
const BOOKINGS_REFRESH_MS = 30000;

const TITLES = [
  ['/dashboard/book', 'Book a move'],
  ['/dashboard/bookings/:id', 'Booking details'],
  ['/dashboard/bookings', 'My bookings'],
  ['/dashboard/quotes', 'My quotes'],
  ['/dashboard/profile', 'Profile & security'],
  ['/dashboard/support', 'Help & support'],
  ['/dashboard', 'Dashboard'],
];
const titleFor = (pathname) => {
  const hit = TITLES.find(([p]) => matchPath(p, pathname));
  return hit ? hit[1] : 'Dashboard';
};

/** Shared, live data for every dashboard page: const { bookings, quotes } = useDashboard() */
export const useDashboard = () => useOutletContext();

export default function CustomerLayout() {
  const bookings = useFetch(() => api.myBookings(), [], { interval: BOOKINGS_REFRESH_MS });
  const quotes = useFetch(() => api.myQuotes(), []);
  const active = (bookings.data || []).filter(ACTIVE).length;

  const links = [
    { to: '/dashboard', label: 'Overview', icon: 'grid', end: true },
    { to: '/dashboard/book', label: 'Book a move', icon: 'plus' },
    { to: '/dashboard/bookings', label: 'My bookings', icon: 'truck', badge: active },
    { to: '/dashboard/quotes', label: 'My quotes', icon: 'file' },
    { to: '/dashboard/profile', label: 'Profile & security', icon: 'user' },
    { to: '/dashboard/support', label: 'Help & support', icon: 'headset' },
  ];
  const menuItems = [
    { to: '/dashboard/profile', label: 'Profile & security', icon: 'user' },
    { to: '/dashboard/bookings', label: 'My bookings', icon: 'truck' },
    { to: '/', label: 'Back to website', icon: 'globe' },
  ];

  return (
    <DashShell
      label="My account"
      links={links}
      menuItems={menuItems}
      action={{ to: '/dashboard/book', label: 'Book a move', icon: 'truck' }}
      titleFor={titleFor}
      context={{ bookings, quotes }}
    />
  );
}
