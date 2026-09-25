import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon';
import { useTitle, Alert, Empty, StatusTag } from '../../components/ui';
import { inr, date } from '../../utils/format';
import { useDashboard } from './CustomerLayout';

export default function Quotes() {
  useTitle('My quotes');
  const { quotes } = useDashboard();
  const list = quotes.data || [];

  return (
    <div className="dash-stack">
      <p className="muted">Quotes you requested with this account's email. Prices are recalculated live when you book.</p>
      <div className="card">
        <Alert>{quotes.error}</Alert>
        {quotes.loading && <div className="spinner" />}
        {!quotes.loading && list.length === 0 ? (
          <Empty icon="file">
            <p>No quotes yet.</p>
            <Link to="/quote" className="btn btn-primary" style={{ marginTop: 14 }}>Get a quote</Link>
          </Empty>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Requested</th><th>Route</th><th>Move date</th><th>Home / vehicle</th><th>Quoted</th><th>Status</th><th /></tr></thead>
              <tbody>
                {list.map((q) => (
                  <tr key={q._id}>
                    <td className="small">{date(q.createdAt)}</td>
                    <td className="cell-strong">{q.fromArea?.name || '—'} → {q.toArea?.name || '—'}</td>
                    <td className="small">{date(q.movingDate)}</td>
                    <td className="small">{q.houseType} · {q.vehicleType}</td>
                    <td className="cell-strong">{inr(q.breakdown?.total)}</td>
                    <td><StatusTag status={q.status} /></td>
                    <td>
                      {q.fromArea && q.toArea && (
                        <Link className="btn btn-primary btn-sm" to={`/dashboard/book?${new URLSearchParams({ from: q.fromArea._id, to: q.toArea._id, house: q.houseType, vehicle: q.vehicleType })}`}>
                          Book <Icon name="arrow" size={14} />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
