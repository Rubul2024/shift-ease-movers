import React, { useState } from 'react';
import api from '../../api';
import { Alert } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';

function ProfileForm() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '' });
  const [state, setState] = useState({ loading: false, error: '', ok: '' });

  const submit = async (e) => {
    e.preventDefault();
    setState({ loading: true, error: '', ok: '' });
    try {
      const { user: u } = await api.updateProfile(form);
      updateUser(u);
      setState({ loading: false, error: '', ok: 'Profile updated.' });
    } catch (err) {
      setState({ loading: false, error: err.message, ok: '' });
    }
  };

  return (
    <form className="card card-pad" onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
      <h3 style={{ color: 'var(--navy-800)' }}>Personal details</h3>
      <div className="field">
        <label htmlFor="p-name">Full name</label>
        <input id="p-name" className="input" required maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="p-phone">Mobile number</label>
        <input id="p-phone" className="input" required inputMode="numeric" pattern="[0-9]{10}" title="10-digit mobile number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="p-email">Email</label>
        <input id="p-email" className="input" value={user.email} disabled />
        <span className="small muted">To change your email, contact support.</span>
      </div>
      <Alert>{state.error}</Alert>
      <Alert type="success">{state.ok}</Alert>
      <button className="btn btn-primary" disabled={state.loading} style={{ justifySelf: 'start' }}>
        {state.loading ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}

function PasswordForm() {
  const { setSession } = useAuth();
  const empty = { currentPassword: '', newPassword: '', confirm: '' };
  const [form, setForm] = useState(empty);
  const [state, setState] = useState({ loading: false, error: '', ok: '' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return setState({ loading: false, error: 'New passwords do not match', ok: '' });
    setState({ loading: true, error: '', ok: '' });
    try {
      // The server signs out other sessions and returns a fresh token for this one.
      setSession(await api.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword }));
      setForm(empty);
      setState({ loading: false, error: '', ok: 'Password changed. Other devices have been signed out.' });
    } catch (err) {
      setState({ loading: false, error: err.message, ok: '' });
    }
  };

  return (
    <form className="card card-pad" onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
      <h3 style={{ color: 'var(--navy-800)' }}>Change password</h3>
      <div className="field">
        <label htmlFor="pw-current">Current password</label>
        <input id="pw-current" type="password" className="input" required autoComplete="current-password" value={form.currentPassword} onChange={set('currentPassword')} />
      </div>
      <div className="field">
        <label htmlFor="pw-new">New password</label>
        <input id="pw-new" type="password" className="input" required minLength={6} maxLength={128} autoComplete="new-password" value={form.newPassword} onChange={set('newPassword')} />
      </div>
      <div className="field">
        <label htmlFor="pw-confirm">Confirm new password</label>
        <input id="pw-confirm" type="password" className="input" required minLength={6} maxLength={128} autoComplete="new-password" value={form.confirm} onChange={set('confirm')} />
      </div>
      <Alert>{state.error}</Alert>
      <Alert type="success">{state.ok}</Alert>
      <button className="btn btn-primary" disabled={state.loading} style={{ justifySelf: 'start' }}>
        {state.loading ? 'Updating…' : 'Update password'}
      </button>
    </form>
  );
}

export default function Profile() {
  return (
    <div className="grid-2" style={{ alignItems: 'start' }}>
      <ProfileForm />
      <PasswordForm />
    </div>
  );
}
