import React, { useState } from 'react';
import api from '../../api';
import Icon from '../../components/Icon';
import { useFetch, useTitle, Alert, Empty } from '../../components/ui';
import { dateTime } from '../../utils/format';
import { downloadCSV } from '../../utils/csv';

export default function AdminSubscribers() {
  useTitle('Newsletter · Admin');
  const { data, loading, error, setData } = useFetch(() => api.subscribers(), []);
  const [msg, setMsg] = useState('');
  const subs = data || [];

  const remove = async (s) => {
    if (!window.confirm(`Unsubscribe ${s.email}?`)) return;
    try {
      await api.deleteSubscriber(s._id);
      setData(subs.filter((x) => x._id !== s._id));
    } catch (err) {
      setMsg(err.message);
    }
  };

  const exportCSV = () =>
    downloadCSV('shiftease-subscribers', subs, [
      ['Email', (s) => s.email],
      ['Source', (s) => s.source],
      ['Subscribed', (s) => new Date(s.createdAt).toISOString()],
    ]);

  return (
    <>
      <div className="dash-head">
        <div>
          <h1>Newsletter subscribers</h1>
          <p className="muted">{subs.length} people signed up from the website footer. Export them to your email tool.</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={exportCSV} disabled={!subs.length}><Icon name="download" size={15} /> Export CSV</button>
      </div>
      <div style={{ marginBottom: 16 }}><Alert>{msg || error}</Alert></div>
      <div className="card">
        {loading ? <div className="spinner" /> : subs.length === 0 ? (
          <Empty icon="mail"><p>No subscribers yet.</p></Empty>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Email</th><th>Source</th><th>Subscribed</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
              <tbody>
                {subs.map((s) => (
                  <tr key={s._id}>
                    <td className="cell-strong">{s.email}</td>
                    <td className="small">{s.source}</td>
                    <td className="small">{dateTime(s.createdAt)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="icon-btn" onClick={() => remove(s)} aria-label={`Remove ${s.email}`}><Icon name="trash" size={18} /></button>
                    </td>
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
