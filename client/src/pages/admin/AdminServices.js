import React, { useState } from 'react';
import api from '../../api';
import Icon from '../../components/Icon';
import { useFetch, Alert, Modal, Empty } from '../../components/ui';
import { inr } from '../../utils/format';

const ICONS = ['home', 'office', 'car', 'box', 'warehouse', 'route', 'bike', 'sofa', 'piano', 'truck'];
const BLANK = { title: '', description: '', icon: 'box', startingPrice: 0 };

export default function AdminServices() {
  const { data, loading, error, setData } = useFetch(() => api.services(true), []);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');
  const services = data || [];
  const set = (k) => (e) => setEditing({ ...editing, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    const body = { title: editing.title, description: editing.description, icon: editing.icon, startingPrice: Number(editing.startingPrice) };
    try {
      if (editing._id) {
        const updated = await api.updateService(editing._id, body);
        setData(services.map((s) => (s._id === updated._id ? updated : s)));
      } else {
        setData([...services, await api.createService(body)]);
      }
      setEditing(null);
    } catch (err) {
      setMsg(err.message);
    }
  };

  const remove = async (s) => {
    if (!window.confirm(`Delete "${s.title}"?`)) return;
    try {
      await api.deleteService(s._id);
      setData(services.filter((x) => x._id !== s._id));
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <>
      <div className="dash-head">
        <div>
          <h1>Services</h1>
          <p className="muted">What customers see on the Services page.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setMsg(''); setEditing(BLANK); }}><Icon name="plus" size={17} /> Add service</button>
      </div>
      {!editing && <div style={{ marginBottom: 16 }}><Alert>{msg || error}</Alert></div>}
      {loading && <div className="spinner" />}
      {!loading && services.length === 0 && <div className="card"><Empty icon="box"><p>No services yet.</p></Empty></div>}
      <div className="grid-3">
        {services.map((s) => (
          <div key={s._id} className="card card-pad" style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="kpi-icon"><Icon name={s.icon} /></span>
              <div>
                <button className="icon-btn" onClick={() => { setMsg(''); setEditing({ ...s }); }} aria-label="Edit"><Icon name="edit" size={18} /></button>
                <button className="icon-btn" onClick={() => remove(s)} aria-label="Delete"><Icon name="trash" size={18} /></button>
              </div>
            </div>
            <h3 style={{ fontSize: 17, color: 'var(--navy-800)' }}>{s.title}</h3>
            <p className="small muted">{s.description}</p>
            <span className="price-from">from <b>{inr(s.startingPrice)}</b></span>
          </div>
        ))}
      </div>

      {editing && (
        <Modal
          title={editing._id ? 'Edit service' : 'Add service'}
          onClose={() => setEditing(null)}
          footer={<><button className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button><button className="btn btn-primary" form="svc-form">Save</button></>}
        >
          <form id="svc-form" className="form-grid" onSubmit={save}>
            <div className="field full"><label htmlFor="s-title">Title</label><input id="s-title" className="input" required value={editing.title} onChange={set('title')} /></div>
            <div className="field full"><label htmlFor="s-desc">Description</label><textarea id="s-desc" className="textarea" required value={editing.description} onChange={set('description')} /></div>
            <div className="field"><label htmlFor="s-price">Starting price (₹)</label><input id="s-price" type="number" min="0" className="input" value={editing.startingPrice} onChange={set('startingPrice')} /></div>
            <div className="field">
              <label>Icon</label>
              <div className="pill-group">
                {ICONS.map((i) => (
                  <button type="button" key={i} className={`pill ${editing.icon === i ? 'on' : ''}`} onClick={() => setEditing({ ...editing, icon: i })} aria-label={i} style={{ padding: 8 }}>
                    <Icon name={i} size={18} />
                  </button>
                ))}
              </div>
            </div>
            <div className="full"><Alert>{msg}</Alert></div>
          </form>
        </Modal>
      )}
    </>
  );
}
