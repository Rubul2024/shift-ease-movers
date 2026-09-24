import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { Alert } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export function AuthSide() {
  return (
    <div className="auth-side">
      <div className="eyebrow" style={{ color: 'var(--green-400)' }}>ShiftEase Movers</div>
      <h2>Moving made simple, from quote to key hand-over.</h2>
      <p>Book cabs instantly, track every step and manage all your moves in one place.</p>
      {['Instant, transparent pricing', 'Verified & trained crews', 'Live booking tracking'].map((t) => (
        <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'center', fontWeight: 600 }}>
          <span className="kpi-icon green" style={{ width: 32, height: 32 }}><Icon name="check" size={16} /></span> {t}
        </div>
      ))}
    </div>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState(location.state?.role || 'customer');
  const [form, setForm] = useState({ email: '', password: '' });
  const [state, setState] = useState({ loading: false, error: '' });

  const submit = async (e) => {
    e.preventDefault();
    setState({ loading: true, error: '' });
    try {
      const user = await login({ ...form, role });
      const fallback = user.role === 'admin' ? '/admin' : '/dashboard';
      navigate(location.state?.from || fallback, { replace: true });
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
            <h1>Welcome back</h1>
            <p className="muted">Log in to book and manage your moves.</p>
          </div>
          <div className="role-switch" role="tablist" aria-label="Account type">
            {['customer', 'admin'].map((r) => (
              <button type="button" key={r} className={role === r ? 'on' : ''} onClick={() => setRole(r)} role="tab" aria-selected={role === r}>
                {r === 'customer' ? 'Customer' : 'Admin'}
              </button>
            ))}
          </div>
          <div className="field">
            <label htmlFor="l-email">Email</label>
            <input id="l-email" type="email" className="input" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="l-pass">Password</label>
            <input id="l-pass" type="password" className="input" required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <Alert>{state.error}</Alert>
          <button className="btn btn-primary btn-block" disabled={state.loading}>
            {state.loading ? 'Signing in…' : 'Sign in'}
          </button>
          <div className="demo-creds">
            Demo {role}: <b>{role === 'admin' ? 'admin@shiftease.com / Admin@123' : 'customer@shiftease.com / Customer@123'}</b>
          </div>
          {role === 'customer' && (
            <p className="center small muted">
              New here? <Link to="/register" state={location.state} className="text-blue" style={{ fontWeight: 700 }}>Create an account</Link>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
