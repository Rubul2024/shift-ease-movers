import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { Alert, useTitle } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { AuthSide } from './Login';

export function ForgotPassword() {
  useTitle('Forgot password');
  const [email, setEmail] = useState('');
  const [state, setState] = useState({ loading: false, error: '', ok: '' });

  const submit = async (e) => {
    e.preventDefault();
    setState({ loading: true, error: '', ok: '' });
    try {
      const res = await api.forgotPassword(email);
      setState({ loading: false, error: '', ok: res.message });
    } catch (err) {
      setState({ loading: false, error: err.message, ok: '' });
    }
  };

  return (
    <div className="auth-wrap">
      <AuthSide />
      <div className="auth-form">
        <form className="card auth-card" onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
          <div>
            <h1>Forgot your password?</h1>
            <p className="muted">Enter your account email and we'll send you a link to choose a new one.</p>
          </div>
          <div className="field">
            <label htmlFor="fp-email">Email</label>
            <input id="fp-email" type="email" className="input" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Alert>{state.error}</Alert>
          <Alert type="success">{state.ok}</Alert>
          <button className="btn btn-primary btn-block" disabled={state.loading}>
            {state.loading ? 'Sending…' : 'Send reset link'}
          </button>
          <p className="center small muted">
            Remembered it? <Link to="/login" className="text-blue" style={{ fontWeight: 700 }}>Back to log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export function ResetPassword() {
  useTitle('Choose a new password');
  const { token } = useParams();
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [state, setState] = useState({ loading: false, error: '' });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setState({ loading: false, error: 'Passwords do not match' });
    setState({ loading: true, error: '' });
    try {
      const user = setSession(await api.resetPassword(token, form.password));
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setState({ loading: false, error: err.message });
    }
  };

  return (
    <div className="auth-wrap">
      <AuthSide />
      <div className="auth-form">
        <form className="card auth-card" onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
          <div>
            <h1>Choose a new password</h1>
            <p className="muted">Use at least 6 characters. You'll be signed in right after.</p>
          </div>
          <div className="field">
            <label htmlFor="rp-pass">New password</label>
            <input id="rp-pass" type="password" className="input" required minLength={6} maxLength={128} autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="rp-confirm">Confirm new password</label>
            <input id="rp-confirm" type="password" className="input" required minLength={6} maxLength={128} autoComplete="new-password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
          </div>
          {state.error && (
            <Alert>
              {state.error} <Link to="/forgot-password" style={{ textDecoration: 'underline' }}>Request a new link</Link>
            </Alert>
          )}
          <button className="btn btn-primary btn-block" disabled={state.loading}>
            {state.loading ? 'Saving…' : 'Save password & sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
