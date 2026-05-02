import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Page.css';

export function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await register(email, fullName, password);
      nav('/', { replace: true });
    } catch (ex) {
      setErr(ex?.response?.data?.error || 'Could not register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-pad auth">
      <div className="auth__card">
        <h1>Create your account</h1>
        <p className="page-lead">Get a persistent cart, fast checkout, and order history.</p>
        {err && <p className="form-error">{err}</p>}
        <form onSubmit={submit} className="form-stack">
          <label className="field">
            <span className="field__label">Full name</span>
            <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required maxLength={120} />
          </label>
          <label className="field">
            <span className="field__label">Email</span>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </label>
          <label className="field">
            <span className="field__label">Password</span>
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              minLength={6}
            />
          </label>
          <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
            {loading ? '…' : 'Sign up'}
          </button>
        </form>
        <p className="auth__foot">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
