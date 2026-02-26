/**
 * Login.js — public login page.
 *
 * Flow:
 *   1. User submits email + password
 *   2. POST /auth/login via Axios
 *   3. On success: AuthContext.login() stores token + user, redirects to dashboard
 *   4. On failure: displays the error message from the API
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

const s = {
  page:   { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f6fa' },
  card:   { background: '#fff', borderRadius: 12, padding: '40px 48px', width: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' },
  title:  { fontSize: 28, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 },
  sub:    { color: '#888', marginBottom: 28, fontSize: 14 },
  label:  { display: 'block', marginBottom: 6, fontWeight: 600, color: '#333', fontSize: 14 },
  input:  { width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 6, fontSize: 15, marginBottom: 18, outline: 'none' },
  btn:    { width: '100%', padding: '12px', background: '#0f3460', color: '#fff', border: 'none', borderRadius: 6, fontSize: 16, fontWeight: 600, cursor: 'pointer' },
  err:    { background: '#ffeaea', color: '#c0392b', borderRadius: 6, padding: '10px 14px', marginBottom: 16, fontSize: 14 },
  link:   { textAlign: 'center', marginTop: 18, fontSize: 14, color: '#888' },
};

export default function Login() {
  const { login } = useAuth();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data);   // stores in context + localStorage, redirects
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.title}>SWMS</h1>
        <p style={s.sub}>Smart Workforce Management System</p>

        {error && <div style={s.err}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={s.label}>Email</label>
          <input
            style={s.input} type="email" name="email"
            value={form.email} onChange={handleChange}
            placeholder="you@example.com" required
          />

          <label style={s.label}>Password</label>
          <input
            style={s.input} type="password" name="password"
            value={form.password} onChange={handleChange}
            placeholder="••••••••" required
          />

          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={s.link}>
          No account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}
