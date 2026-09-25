import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Alert, useTitle } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { AuthSide } from './Login';

export default function Register() {
  useTitle('Create account');
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', confirm: '' });
  const [state, setState] = useState({ loading: false, error: '' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setState({ loading: false, error: 'Passwords do not match' });
    setState({ loading: true, error: '' });
    try {
      const { confirm, ...data } = form;
      await register(data);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setState({ loading: false, error: err.message });
    }
  };

  return (
    <div className="auth-wrap">
      <AuthSide />
      <div className="auth-form">
        <form className="card auth-card" onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
          <div>
            <h1>Create your account</h1>
            <p className="muted">It takes less than a minute.</p>
          </div>
          <div className="field">
            <label htmlFor="r-name">Full name</label>
            <input id="r-name" className="input" required value={form.name} onChange={set('name')} />
          </div>
          <div className="field">
            <label htmlFor="r-phone">Mobile number</label>
            <input id="r-phone" className="input" required pattern="[0-9]{10}" title="10-digit mobile number" value={form.phone} onChange={set('phone')} />
          </div>
          <div className="field">
            <label htmlFor="r-email">Email</label>
            <input id="r-email" type="email" className="input" required autoComplete="email" value={form.email} onChange={set('email')} />
          </div>
          <div className="form-grid" style={{ gap: 12 }}>
            <div className="field">
              <label htmlFor="r-pass">Password</label>
              <input id="r-pass" type="password" className="input" required minLength={6} autoComplete="new-password" value={form.password} onChange={set('password')} />
            </div>
            <div className="field">
              <label htmlFor="r-confirm">Confirm</label>
              <input id="r-confirm" type="password" className="input" required minLength={6} autoComplete="new-password" value={form.confirm} onChange={set('confirm')} />
            </div>
          </div>
          <p className="small muted">
            By signing up you agree to our <Link to="/terms" className="text-blue">Terms of Service</Link> and{' '}
            <Link to="/privacy" className="text-blue">Privacy Policy</Link>.
          </p>
          <Alert>{state.error}</Alert>
          <button className="btn btn-primary btn-block" disabled={state.loading}>
            {state.loading ? 'Creating account…' : 'Sign up'}
          </button>
          <p className="center small muted">
            Already have an account? <Link to="/login" state={location.state} className="text-blue" style={{ fontWeight: 700 }}>Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
