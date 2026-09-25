import React from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import Icon from '../../components/Icon';
import NetworkMap from '../../components/NetworkMap';
import { useFetch, useTitle, Alert, StatusTag, Empty } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { inr, date, areaLabel } from '../../utils/format';

export default function AdminOverview() {
  useTitle('Admin dashboard');
  const { user } = useAuth();
  const { data: s, loading, error } = useFetch(() => api.stats(), []);
  const { data: areas } = useFetch(() => api.areas(true), []);

  const kpis = s
    ? [
        ['truck', 'Total bookings', s.bookings, '', '/admin/bookings'],
        ['route', 'Active moves', s.activeBookings, 'green', '/admin/bookings'],
        ['rupee', 'Booked revenue', inr(s.revenue), '', '/admin/bookings'],
        ['inbox', 'New inquiries', `${s.newContacts} / ${s.contacts}`, 'green', '/admin/contacts'],
        ['file', 'New quotes', `${s.newQuotes} / ${s.quotes}`, '', '/admin/quotes'],
        ['pin', 'Live areas', s.areas, 'green', '/admin/areas'],
        ['users', 'Customers', s.customers, '', '/admin/customers'],
        ['mail', 'Subscribers', s.subscribers, 'green', '/admin/subscribers'],
      ]
    : [];

  return (
    <>
      <div className="dash-head">
        <div>
          <div className="small muted">Admin dashboard</div>
          <h1>Good to see you, {user.name.split(' ')[0]}</h1>
        </div>
        <div className="toolbar">
          <Link to="/admin/areas?new=1" className="btn btn-outline btn-sm"><Icon name="plus" size={16} /> Add area</Link>
          <Link to="/admin/contacts" className="btn btn-primary btn-sm"><Icon name="inbox" size={16} /> View inquiries</Link>
        </div>
      </div>
      <Alert>{error}</Alert>
      {loading && <div className="spinner" />}
      <div className="kpis" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', marginBottom: 24 }}>
        {kpis.map(([icon, label, value, tone, to]) => (
          <Link key={label} to={to} className="kpi kpi-link">
            <span className={`kpi-icon ${tone}`}><Icon name={icon} /></span>
            <div><b>{value}</b><span>{label}</span></div>
          </Link>
        ))}
      </div>

      <div className="split" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
        <div className="card">
          <div className="dash-head" style={{ padding: '18px 20px 0', marginBottom: 10 }}>
            <h3 style={{ color: 'var(--navy-800)' }}>Recent bookings</h3>
            <Link to="/admin/bookings" className="link-arrow">All bookings <Icon name="arrow" size={15} /></Link>
          </div>
          {s && s.recent.length === 0 ? (
            <Empty icon="truck"><p>No bookings yet.</p></Empty>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Booking</th><th>Route</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  {(s?.recent || []).map((b) => (
                    <tr key={b._id}>
                      <td className="cell-strong">{b.bookingId}</td>
                      <td>{areaLabel(b.pickupArea)} → {areaLabel(b.dropArea)}</td>
                      <td>{date(b.movingDate)}</td>
                      <td>{inr(b.amount)}</td>
                      <td><StatusTag status={b.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="card card-pad">
          <div className="dash-head" style={{ marginBottom: 6 }}>
            <h3 style={{ color: 'var(--navy-800)' }}>Service network</h3>
            <Link to="/admin/areas" className="link-arrow">Manage <Icon name="arrow" size={15} /></Link>
          </div>
          <NetworkMap areas={areas || []} height={340} />
        </div>
      </div>
    </>
  );
}
