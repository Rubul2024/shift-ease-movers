import React from 'react';
import api from '../../api';
import DashShell from '../../components/DashShell';
import { useFetch } from '../../components/ui';

const BADGES_REFRESH_MS = 60000;

export default function AdminLayout() {
  // Live counts for the sidebar badges (new inquiries / new quote leads).
  const { data: s } = useFetch(() => api.stats(), [], { interval: BADGES_REFRESH_MS });

  const links = [
    { to: '/admin', label: 'Overview', icon: 'grid', end: true },
    { to: '/admin/bookings', label: 'Bookings', icon: 'truck', badge: s?.activeBookings },
    { to: '/admin/contacts', label: 'Contacts', icon: 'inbox', badge: s?.newContacts },
    { to: '/admin/quotes', label: 'Quotes', icon: 'file', badge: s?.newQuotes },
    { to: '/admin/areas', label: 'Service Areas', icon: 'pin' },
    { to: '/admin/services', label: 'Services', icon: 'box' },
    { to: '/admin/customers', label: 'Customers', icon: 'users' },
    { to: '/admin/subscribers', label: 'Newsletter', icon: 'mail' },
  ];

  return (
    <DashShell
      label="Admin panel"
      links={links}
      menuItems={[{ to: '/', label: 'View website', icon: 'globe' }]}
      titleFor={() => 'Admin panel'}
    />
  );
}
