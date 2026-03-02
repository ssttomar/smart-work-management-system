/**
 * Register.js — public registration page.
 * On success the backend returns a JWT, so the user is immediately logged in.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

/* ── same palette as Home.js ─────────────────────────────────────── */
const C = {
  navy:   '#0f3460',
  deep:   '#0a1f44',
  accent: '#e94560',
  purple: '#533483',
  white:  '#ffffff',
};

const field = { width: '100%', padding: '11px 14px', border: '1px solid rgba(255,255,255,0.22)', borderRadius: 8, fontSize: 15, marginBottom: 16, outline: 'none', background: 'rgba(255,255,255,0.10)', color: C.white, boxSizing: 'border-box' };
const lbl   = { display: 'block', marginBottom: 6, fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontSize: 14 };

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
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `linear-gradient(135deg, ${C.deep} 0%, ${C.navy} 50%, ${C.purple} 100%)`,
      position: 'relative', overflow: 'hidden',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      padding: '40px 16px',
    }}>
      {/* background blobs — same as Home hero */}
      <div style={{ position: 'fixed', top: '8%', right: '6%', width: 520, height: 520, borderRadius: '50%', background: 'rgba(233,69,96,0.14)', filter: 'blur(90px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '4%', left: '12%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(83,52,131,0.28)', filter: 'blur(90px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', top: '45%', left: '3%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(15,52,96,0.35)', filter: 'blur(70px)', pointerEvents: 'none' }} />

      {/* glass card */}
      <div style={{
        position: 'relative', zIndex: 1,
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.18)',
        borderRadius: 20,
        padding: '44px 48px',
        width: 460,
        boxShadow: '0 8px 48px rgba(0,0,0,0.35)',
      }}>
        {/* logo badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: `linear-gradient(135deg, ${C.navy}, ${C.accent})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: C.white, fontWeight: 900, fontSize: 17,
          }}>S</div>
          <span style={{ fontWeight: 800, fontSize: 20, color: C.white, letterSpacing: '-0.5px' }}>Create your SWMS account</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: 26, fontSize: 13 }}>Join Smart Workforce Management System</p>

        {error && (
          <div style={{ background: 'rgba(233,69,96,0.18)', border: '1px solid rgba(233,69,96,0.45)', color: '#ff8096', borderRadius: 8, padding: '10px 14px', marginBottom: 18, fontSize: 14 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={lbl}>Full Name</label>
          <input style={field} name="name" value={form.name} onChange={handleChange} placeholder="Alice Smith" required />

          <label style={lbl}>Email</label>
          <input style={field} name="email" type="email" value={form.email} onChange={handleChange} placeholder="alice@company.com" required />

          <label style={lbl}>Password</label>
          <input style={field} name="password" type="password" value={form.password} onChange={handleChange} placeholder="min 6 characters" required />

          <label style={lbl}>Department</label>
          <input style={field} name="department" value={form.department} onChange={handleChange} placeholder="Engineering (optional)" />

          <label style={lbl}>Role</label>
          <select style={{ ...field, marginBottom: 24 }} name="role" value={form.role} onChange={handleChange}>
            <option value="EMPLOYEE">Employee</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
          </select>

          <button
            style={{ width: '100%', padding: '13px', background: C.accent, color: C.white, border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s', letterSpacing: '0.3px' }}
            type="submit" disabled={loading}
            onMouseEnter={e => e.currentTarget.style.background = '#c9374e'}
            onMouseLeave={e => e.currentTarget.style.background = C.accent}
          >
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#ff8096', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>

        <Link to="/" style={{
          display: 'block', width: '100%', padding: '11px', marginTop: 12,
          background: 'transparent', color: 'rgba(255,255,255,0.80)',
          border: '1.5px solid rgba(255,255,255,0.30)', borderRadius: 8,
          fontSize: 15, fontWeight: 600, cursor: 'pointer',
          textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box',
          transition: 'border-color 0.2s, color 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)'; e.currentTarget.style.color = C.white; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.30)'; e.currentTarget.style.color = 'rgba(255,255,255,0.80)'; }}
        >← Home</Link>
      </div>
    </div>
  );
}
