import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import Icon from './Icon';
import { useAuth } from '../context/AuthContext';
import { SITE } from '../config';
import { initials } from '../utils/format';

function UserMenu({ items }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (e.type === 'keydown' ? e.key === 'Escape' : !ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  return (
    <div className="user-menu" ref={ref}>
      <button className="user-chip" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>
        <span className="avatar">{initials(user.name)}</span>
        <span className="hide-xs">{user.name.split(' ')[0]}</span>
        <Icon name="chevron" size={16} />
      </button>
      {open && (
        <div className="menu" role="menu">
          <div className="menu-head">
            <b>{user.name}</b>
            <span className="small muted">{user.email}</span>
          </div>
          {items.map((i) => (
            <Link key={i.to} to={i.to} role="menuitem" onClick={() => setOpen(false)}>
              <Icon name={i.icon} size={17} /> {i.label}
            </Link>
          ))}
          <button
            role="menuitem"
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            <Icon name="logout" size={17} /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * App layout for signed-in areas (customer dashboard, admin panel): no public header/footer.
 * links: [{ to, label, icon, end?, badge? }], titles: { [path]: title } for the top bar.
 */
export default function DashShell({ label, links, menuItems, action, titleFor, context }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    setDrawer(false);
  }, [pathname]);

  return (
    <div className={`shell ${drawer ? 'drawer-open' : ''}`}>
      <aside className="shell-side">
        <div className="shell-brand">
          <Logo to="/" />
          <button className="icon-btn shell-close" onClick={() => setDrawer(false)} aria-label="Close menu"><Icon name="x" /></button>
        </div>
        <div className="side-label">{label}</div>
        <nav className="shell-nav">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              <Icon name={l.icon} size={18} /> {l.label}
              {l.badge > 0 && <span className="badge">{l.badge}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="shell-side-foot">
          <div className="side-help">
            <Icon name="headset" size={18} />
            <div>
              <b>Need help?</b>
              <a href={SITE.phoneHref}>{SITE.phone}</a>
            </div>
          </div>
          <Link to="/" className="side-foot-link"><Icon name="globe" size={17} /> Back to website</Link>
          <button
            className="side-foot-link"
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            <Icon name="logout" size={17} /> Log out
          </button>
        </div>
      </aside>
      <div className="shell-backdrop" onClick={() => setDrawer(false)} />

      <div className="shell-main">
        <header className="shell-top">
          <button className="icon-btn shell-burger" onClick={() => setDrawer(true)} aria-label="Open menu"><Icon name="menu" size={24} /></button>
          <h2 className="shell-title">{titleFor(pathname)}</h2>
          <div className="shell-actions">
            {action && (
              <Link to={action.to} className="btn btn-primary btn-sm">
                <Icon name={action.icon} size={16} /> <span className="hide-xs">{action.label}</span>
              </Link>
            )}
            <UserMenu items={menuItems} />
          </div>
        </header>
        <div className="shell-content">
          <Outlet context={context} />
        </div>
      </div>
    </div>
  );
}
