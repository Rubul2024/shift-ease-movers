import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon';
import { useAuth } from '../../context/AuthContext';

const LINKS = [
  { to: '/admin', label: 'Overview', icon: 'grid', end: true },
  { to: '/admin/areas', label: 'Service Areas', icon: 'pin' },
  { to: '/admin/contacts', label: 'Contacts', icon: 'inbox' },
  { to: '/admin/bookings', label: 'Bookings', icon: 'truck' },
  { to: '/admin/quotes', label: 'Quotes', icon: 'file' },
  { to: '/admin/services', label: 'Services', icon: 'box' },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="dash">
      <aside className="side">
        <div className="side-label">Admin panel</div>
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end}>
            <Icon name={l.icon} size={18} /> {l.label}
          </NavLink>
        ))}
        <div className="side-label">Account</div>
        <NavLink to="/" end><Icon name="globe" size={18} /> View website</NavLink>
        <button className="side-link" onClick={() => { logout(); navigate('/'); }}>
          <Icon name="logout" size={18} /> Log out
        </button>
      </aside>
      <div className="dash-main">
        <Outlet />
      </div>
    </div>
  );
}
