import React, { useState } from 'react';
import api from '../../api';
import Icon from '../../components/Icon';
import { useFetch, Alert, Modal, Empty } from '../../components/ui';
import { VEHICLES } from '../../utils/pricing';

const BLANK = { name: '', city: '', state: '', pincodes: '', lat: '', lng: '', vehicleTypes: ['Mini Truck', 'Tempo'], availableCabs: 5, isActive: true, notes: '' };

// Admin defines the areas where cabs can be booked.
export default function AdminAreas() {
  const { data, loading, error, setData } = useFetch(() => api.areas(true), []);
  const [editing, setEditing] = useState(null); // null | BLANK | area
  const [form, setForm] = useState(BLANK);
  const [msg, setMsg] = useState({ type: 'error', text: '' });
  const [saving, setSaving] = useState(false);
  const areas = data || [];

  const open = (area) => {
    setMsg({ type: 'error', text: '' });
    setEditing(area || BLANK);
    setForm(area ? { ...area, pincodes: (area.pincodes || []).join(', '), notes: area.notes || '', state: area.state || '' } : BLANK);
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const toggleVehicle = (v) =>
    setForm({ ...form, vehicleTypes: form.vehicleTypes.includes(v) ? form.vehicleTypes.filter((x) => x !== v) : [...form.vehicleTypes, v] });

  const save = async (e) => {
    e.preventDefault();
    if (form.vehicleTypes.length === 0) return setMsg({ type: 'error', text: 'Select at least one vehicle type' });
    setSaving(true);
    const body = {
      name: form.name,
      city: form.city,
      state: form.state,
      notes: form.notes,
      isActive: form.isActive,
      vehicleTypes: form.vehicleTypes,
      availableCabs: Number(form.availableCabs),
      lat: Number(form.lat),
      lng: Number(form.lng),
      pincodes: form.pincodes.split(',').map((p) => p.trim()).filter(Boolean),
    };
    try {
      if (editing._id) {
        const updated = await api.updateArea(editing._id, body);
        setData(areas.map((a) => (a._id === updated._id ? updated : a)));
      } else {
        const created = await api.createArea(body);
        setData([...areas, created]);
      }
      setEditing(null);
      setMsg({ type: 'success', text: `Area "${body.name}" saved.` });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (a) => {
    try {
      const updated = await api.updateArea(a._id, { isActive: !a.isActive });
      setData(areas.map((x) => (x._id === a._id ? updated : x)));
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const remove = async (a) => {
    if (!window.confirm(`Delete area "${a.name}, ${a.city}"?`)) return;
    try {
      await api.deleteArea(a._id);
      setData(areas.filter((x) => x._id !== a._id));
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <>
      <div className="dash-head">
        <div>
          <h1>Service areas</h1>
          <p className="muted">Define where customers can book cabs, which vehicles run there and how many are on duty.</p>
        </div>
        <button className="btn btn-primary" onClick={() => open(null)}><Icon name="plus" size={17} /> Add area</button>
      </div>
      {!editing && <div style={{ marginBottom: 16 }}><Alert type={msg.type}>{msg.text}</Alert></div>}
      <Alert>{error}</Alert>

      <div className="card">
        {loading ? <div className="spinner" /> : areas.length === 0 ? (
          <Empty icon="pin"><p>No areas yet. Add your first serviceable area.</p></Empty>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Area</th><th>Pincodes</th><th>Vehicles</th><th>Cabs</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
              <tbody>
                {areas.map((a) => (
                  <tr key={a._id}>
                    <td>
                      <div className="cell-strong">{a.name}</div>
                      <div className="small muted">{a.city}{a.state ? `, ${a.state}` : ''}</div>
                    </td>
                    <td className="small">{(a.pincodes || []).join(', ') || '—'}</td>
                    <td><div className="tags">{a.vehicleTypes.map((v) => <span key={v} className="tag">{v}</span>)}</div></td>
                    <td className="cell-strong">{a.availableCabs}</td>
                    <td>
                      <button className={`tag ${a.isActive ? 'green' : 'gray'}`} style={{ border: 0, cursor: 'pointer' }} onClick={() => toggleActive(a)} title="Click to toggle">
                        {a.isActive ? 'Live' : 'Paused'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button className="icon-btn" onClick={() => open(a)} aria-label={`Edit ${a.name}`}><Icon name="edit" size={18} /></button>
                      <button className="icon-btn" onClick={() => remove(a)} aria-label={`Delete ${a.name}`}><Icon name="trash" size={18} /></button>
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
          title={editing._id ? `Edit ${editing.name}` : 'Add service area'}
          onClose={() => setEditing(null)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary" form="area-form" disabled={saving}>{saving ? 'Saving…' : 'Save area'}</button>
            </>
          }
        >
          <form id="area-form" onSubmit={save} className="form-grid">
            <div className="field"><label htmlFor="a-name">Area name</label><input id="a-name" className="input" required value={form.name} onChange={set('name')} placeholder="Koramangala" /></div>
            <div className="field"><label htmlFor="a-city">City</label><input id="a-city" className="input" required value={form.city} onChange={set('city')} placeholder="Bengaluru" /></div>
            <div className="field"><label htmlFor="a-state">State</label><input id="a-state" className="input" value={form.state} onChange={set('state')} /></div>
            <div className="field"><label htmlFor="a-pins">Pincodes (comma separated)</label><input id="a-pins" className="input" value={form.pincodes} onChange={set('pincodes')} placeholder="560034, 560095" /></div>
            <div className="field"><label htmlFor="a-lat">Latitude</label><input id="a-lat" type="number" step="any" min="-90" max="90" className="input" required value={form.lat} onChange={set('lat')} placeholder="12.9352" /></div>
            <div className="field"><label htmlFor="a-lng">Longitude</label><input id="a-lng" type="number" step="any" min="-180" max="180" className="input" required value={form.lng} onChange={set('lng')} placeholder="77.6245" /></div>
            <div className="field full">
              <label>Vehicle types available</label>
              <div className="pill-group">
                {Object.keys(VEHICLES).map((v) => (
                  <button type="button" key={v} className={`pill ${form.vehicleTypes.includes(v) ? 'on' : ''}`} onClick={() => toggleVehicle(v)}>{v}</button>
                ))}
              </div>
            </div>
            <div className="field"><label htmlFor="a-cabs">Cabs on duty</label><input id="a-cabs" type="number" min="0" className="input" required value={form.availableCabs} onChange={set('availableCabs')} /></div>
            <label className={`check ${form.isActive ? 'on' : ''}`} style={{ alignSelf: 'end' }}>
              <input type="checkbox" checked={form.isActive} onChange={set('isActive')} />
              <span>Accept bookings<small>Visible to customers when on</small></span>
            </label>
            <div className="field full"><label htmlFor="a-notes">Internal notes</label><input id="a-notes" className="input" value={form.notes} onChange={set('notes')} /></div>
            <div className="full"><Alert type={msg.type}>{msg.text}</Alert></div>
          </form>
        </Modal>
      )}
    </>
  );
}
