import React, { useState } from 'react';
import api from '../../api';
import Icon from '../../components/Icon';
import { useFetch, Alert, Empty } from '../../components/ui';
import { inr, date, dateTime } from '../../utils/format';

const STATUSES = ['New', 'Sent', 'Accepted', 'Rejected'];

export default function AdminQuotes() {
  const { data, loading, error, setData } = useFetch(() => api.quotes(), []);
  const [msg, setMsg] = useState('');
  const quotes = data || [];

  const update = async (q, status) => {
    try {
      const updated = await api.updateQuote(q._id, { status });
      setData(quotes.map((x) => (x._id === q._id ? updated : x)));
    } catch (err) {
      setMsg(err.message);
    }
  };
  const remove = async (q) => {
    if (!window.confirm('Delete this quote?')) return;
    try {
      await api.deleteQuote(q._id);
      setData(quotes.filter((x) => x._id !== q._id));
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <>
      <div className="dash-head">
        <div>
          <h1>Quotation requests</h1>
          <p className="muted">Leads from the website quote calculator. Call them back and mark the outcome.</p>
        </div>
      </div>
      <div style={{ marginBottom: 16 }}><Alert>{msg || error}</Alert></div>
      <div className="card">
        {loading ? <div className="spinner" /> : quotes.length === 0 ? (
          <Empty icon="file"><p>No quote requests yet.</p></Empty>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Received</th><th>Lead</th><th>Route</th><th>Move details</th><th>Quoted</th><th>Status</th><th /></tr></thead>
              <tbody>
                {quotes.map((q) => (
                  <tr key={q._id}>
                    <td className="small" style={{ whiteSpace: 'nowrap' }}>{dateTime(q.createdAt)}</td>
                    <td>
                      <div className="cell-strong">{q.name}</div>
                      <div className="small"><a className="text-blue" href={`tel:${q.phone}`}>{q.phone}</a></div>
                      <div className="small muted">{q.email}</div>
                    </td>
                    <td className="small"><b>{q.fromArea?.name}</b>, {q.fromArea?.city}<br />→ <b>{q.toArea?.name}</b>, {q.toArea?.city}</td>
                    <td className="small">
                      {date(q.movingDate)} · {q.distanceKm} km<br />{q.houseType} · {q.vehicleType}
                      <br />
                      <span className="muted">
                        {[!q.liftAvailable && 'No lift', q.premiumPacking && 'Premium packing', q.insurance && 'Insured'].filter(Boolean).join(' · ') || 'Standard'}
                      </span>
                    </td>
                    <td className="cell-strong">{inr(q.breakdown?.total)}</td>
                    <td>
                      <select className="select" value={q.status} onChange={(e) => update(q, e.target.value)} aria-label="Status">
                        {STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td><button className="icon-btn" onClick={() => remove(q)} aria-label="Delete"><Icon name="trash" size={18} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
