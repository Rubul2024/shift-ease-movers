import React, { useState } from 'react';
import api from '../../api';
import Icon from '../../components/Icon';
import { useFetch, Alert, Modal, Empty } from '../../components/ui';
import { dateTime } from '../../utils/format';

const STATUSES = ['New', 'Contacted', 'Converted', 'Closed'];

function toCSV(rows) {
  const cols = ['name', 'email', 'phone', 'city', 'subject', 'message', 'status', 'adminNotes', 'createdAt'];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
}

// Admin can view and maintain every contact / inquiry submitted from the website.
export default function AdminContacts() {
  const { data, loading, error, setData } = useFetch(() => api.contacts(), []);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState({ type: 'error', text: '' });
  const contacts = data || [];

  const filtered = contacts.filter((c) => {
    const text = `${c.name} ${c.email} ${c.phone} ${c.city || ''} ${c.message}`.toLowerCase();
    return (!status || c.status === status) && text.includes(q.toLowerCase());
  });

  const patch = async (id, body) => {
    try {
      const updated = await api.updateContact(id, body);
      setData(contacts.map((c) => (c._id === id ? updated : c)));
      return updated;
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
      return null;
    }
  };

  const save = async (e) => {
    e.preventDefault();
    const { _id, createdAt, updatedAt, __v, ...body } = editing;
    if (await patch(_id, body)) {
      setEditing(null);
      setMsg({ type: 'success', text: 'Contact updated.' });
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete contact from ${c.name}?`)) return;
    try {
      await api.deleteContact(c._id);
      setData(contacts.filter((x) => x._id !== c._id));
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const exportCSV = () => {
    const blob = new Blob([toCSV(filtered)], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `shiftease-contacts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const set = (k) => (e) => setEditing({ ...editing, [k]: e.target.value });

  return (
    <>
      <div className="dash-head">
        <div>
          <h1>Contacts &amp; inquiries</h1>
          <p className="muted">{contacts.filter((c) => c.status === 'New').length} new · {contacts.length} total</p>
        </div>
        <div className="toolbar">
          <div style={{ position: 'relative' }}>
            <Icon name="search" size={17} style={{ position: 'absolute', left: 11, top: 11, color: 'var(--ink-500)' }} />
            <input className="input" style={{ paddingLeft: 34 }} placeholder="Search contacts" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button className="btn btn-outline btn-sm" onClick={exportCSV} disabled={!filtered.length}>Export CSV</button>
        </div>
      </div>
      {!editing && <div style={{ marginBottom: 16 }}><Alert type={msg.type}>{msg.text}</Alert></div>}
      <Alert>{error}</Alert>

      <div className="card">
        {loading ? <div className="spinner" /> : filtered.length === 0 ? (
          <Empty icon="inbox"><p>No contacts found.</p></Empty>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Received</th><th>Contact</th><th>Inquiry</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c._id}>
                    <td className="small" style={{ whiteSpace: 'nowrap' }}>{dateTime(c.createdAt)}</td>
                    <td>
                      <div className="cell-strong">{c.name}</div>
                      <div className="small"><a href={`tel:${c.phone}`} className="text-blue">{c.phone}</a></div>
                      <div className="small muted">{c.email}{c.city ? ` · ${c.city}` : ''}</div>
                    </td>
                    <td style={{ maxWidth: 360 }}>
                      <span className="tag gray">{c.subject}</span>
                      <div className="small" style={{ marginTop: 6 }}>{c.message}</div>
                      {c.adminNotes && <div className="small text-green" style={{ marginTop: 4 }}>Note: {c.adminNotes}</div>}
                    </td>
                    <td>
                      <select className="select" value={c.status} onChange={(e) => patch(c._id, { status: e.target.value })} aria-label="Status">
                        {STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button className="icon-btn" onClick={() => { setMsg({ type: 'error', text: '' }); setEditing({ ...c }); }} aria-label="Edit"><Icon name="edit" size={18} /></button>
                      <button className="icon-btn" onClick={() => remove(c)} aria-label="Delete"><Icon name="trash" size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <Modal
          title="Edit contact"
          onClose={() => setEditing(null)}
          footer={<><button className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button><button className="btn btn-primary" form="contact-form">Save changes</button></>}
        >
          <form id="contact-form" className="form-grid" onSubmit={save}>
            <div className="field"><label htmlFor="ce-name">Name</label><input id="ce-name" className="input" required value={editing.name} onChange={set('name')} /></div>
            <div className="field"><label htmlFor="ce-phone">Phone</label><input id="ce-phone" className="input" required value={editing.phone} onChange={set('phone')} /></div>
            <div className="field"><label htmlFor="ce-email">Email</label><input id="ce-email" type="email" className="input" required value={editing.email} onChange={set('email')} /></div>
            <div className="field"><label htmlFor="ce-city">City</label><input id="ce-city" className="input" value={editing.city || ''} onChange={set('city')} /></div>
            <div className="field"><label htmlFor="ce-subject">Subject</label><input id="ce-subject" className="input" value={editing.subject} onChange={set('subject')} /></div>
            <div className="field"><label htmlFor="ce-status">Status</label><select id="ce-status" className="select" value={editing.status} onChange={set('status')}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
            <div className="field full"><label htmlFor="ce-msg">Message</label><textarea id="ce-msg" className="textarea" required value={editing.message} onChange={set('message')} /></div>
            <div className="field full"><label htmlFor="ce-notes">Admin notes</label><textarea id="ce-notes" className="textarea" style={{ minHeight: 70 }} value={editing.adminNotes || ''} onChange={set('adminNotes')} placeholder="Called on Monday, wants a Saturday slot…" /></div>
            <div className="full"><Alert type={msg.type}>{msg.text}</Alert></div>
          </form>
        </Modal>
      )}
    </>
  );
}
