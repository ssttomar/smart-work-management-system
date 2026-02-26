/**
 * Register.js — public registration page.
 * On success the backend returns a JWT, so the user is immediately logged in.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

const s = {
  page:  { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f6fa' },
  card:  { background: '#fff', borderRadius: 12, padding: '40px 48px', width: 440, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' },
  title: { fontSize: 24, fontWeight: 700, color: '#1a1a2e', marginBottom: 24 },
  label: { display: 'block', marginBottom: 6, fontWeight: 600, color: '#333', fontSize: 14 },
  input: { width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 6, fontSize: 15, marginBottom: 18, outline: 'none' },
  select:{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 6, fontSize: 15, marginBottom: 18, background: '#fff' },
  btn:   { width: '100%', padding: '12px', background: '#0f3460', color: '#fff', border: 'none', borderRadius: 6, fontSize: 16, fontWeight: 600, cursor: 'pointer' },
  err:   { background: '#ffeaea', color: '#c0392b', borderRadius: 6, padding: '10px 14px', marginBottom: 16, fontSize: 14 },
  link:  { textAlign: 'center', marginTop: 18, fontSize: 14, color: '#888' },
};

export default function Register() {
  const { login } = useAuth();
  const [form, setForm]   = useState({ name: '', email: '', password: '', department: '', role: 'EMPLOYEE' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data);
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === 'object'
        ? Object.values(msg).join(' | ')
        : msg?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h2 style={s.title}>Create your SWMS account</h2>

        {error && <div style={s.err}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={s.label}>Full Name</label>
          <input style={s.input} name="name"       value={form.name}       onChange={handleChange} placeholder="Alice Smith"        required />

          <label style={s.label}>Email</label>
          <input style={s.input} name="email" type="email" value={form.email} onChange={handleChange} placeholder="alice@company.com" required />

          <label style={s.label}>Password</label>
          <input style={s.input} name="password" type="password" value={form.password} onChange={handleChange} placeholder="min 6 characters" required />

          <label style={s.label}>Department</label>
          <input style={s.input} name="department" value={form.department} onChange={handleChange} placeholder="Engineering (optional)" />

          <label style={s.label}>Role</label>
          <select style={s.select} name="role" value={form.role} onChange={handleChange}>
            <option value="EMPLOYEE">Employee</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
          </select>

          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>

        <p style={s.link}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
