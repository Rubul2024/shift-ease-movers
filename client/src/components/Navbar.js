import React, { useEffect, useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import Icon from './Icon';
import { useAuth } from '../context/AuthContext';
import { initials } from '../utils/format';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/services', label: 'Services' },
  { to: '/areas', label: 'Service Areas' },
  { to: '/quote', label: 'Get a Quote' },
  { to: '/track', label: 'Track' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header className={`nav ${open ? 'open' : ''}`}>
      <div className="container nav-inner">
        <Logo />
        <nav className="nav-links">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              {l.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <NavLink to={isAdmin ? '/admin' : '/dashboard'} className="mobile-only">{isAdmin ? 'Admin Panel' : 'My Moves'}</NavLink>
              <a href="/" className="mobile-only" onClick={(e) => { e.preventDefault(); logout(); navigate('/'); }}>Log out</a>
            </>
          ) : (
            <NavLink to="/login" className="mobile-only">Log in</NavLink>
          )}
        </nav>
        <div className="nav-actions">
          {user ? (
            <>
              <Link to={isAdmin ? '/admin' : '/dashboard'} className="user-chip hide-sm">
                <span className="avatar">{initials(user.name)}</span>
                {isAdmin ? 'Admin' : user.name.split(' ')[0]}
              </Link>
              <button
                className="btn btn-ghost btn-sm hide-sm"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                title="Log out"
              >
                <Icon name="logout" size={18} />
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-ghost hide-sm">
              Log in
            </Link>
          )}
          {!isAdmin && (
            <Link to="/book" className="btn btn-primary btn-sm">
              <Icon name="truck" size={17} /> Book a Cab
            </Link>
          )}
          <button className="nav-toggle" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
            <Icon name={open ? 'x' : 'menu'} size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}
