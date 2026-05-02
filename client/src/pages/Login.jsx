import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Page.css';

export function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from?.pathname || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(email, password);
      nav(from, { replace: true });
    } catch (ex) {
      setErr(ex?.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-pad auth">
      <div className="auth__card">
        <h1>Welcome back</h1>
        <p className="page-lead">Sign in to access your cart and order history.</p>
        {err && <p className="form-error">{err}</p>}
        <form onSubmit={submit} className="form-stack">
          <label className="field">
            <span className="field__label">Email</span>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoComplete="email" />
          </label>
          <label className="field">
            <span className="field__label">Password</span>
            <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required autoComplete="current-password" />
          </label>
          <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
            {loading ? '…' : 'Log in'}
          </button>
        </form>
        <p className="auth__foot">
          New here? <Link to="/register">Create an account</Link>
        </p>
        <p className="form-hint">Demo admin: admin@shop.com / Admin123!</p>
      </div>
    </div>
  );
}
