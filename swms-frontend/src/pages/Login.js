/**
 * Login.js — public login page for MANAGER and EMPLOYEE only.
 * Admin users must use /admin instead.
 * The backend rejects ADMIN credentials at /auth/login.
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

/* ── same palette as Home.js ─────────────────────────────────────── */
const C = {
  navy:   '#0f3460',
  deep:   '#0a1f44',
  accent: '#e94560',
  purple: '#533483',
  white:  '#ffffff',
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
      login(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
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
    }}>
      {/* background blobs — same as Home hero */}
      <div style={{ position: 'absolute', top: '10%', right: '8%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(233,69,96,0.14)', filter: 'blur(90px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '5%', left: '15%', width: 380, height: 380, borderRadius: '50%', background: 'rgba(83,52,131,0.28)', filter: 'blur(90px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '50%', left: '5%', width: 260, height: 260, borderRadius: '50%', background: 'rgba(15,52,96,0.35)', filter: 'blur(70px)', pointerEvents: 'none' }} />

      {/* glass card */}
      <div style={{
        position: 'relative', zIndex: 1,
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.18)',
        borderRadius: 20,
        padding: '44px 48px',
        width: 420,
        boxShadow: '0 8px 48px rgba(0,0,0,0.35)',
      }}>
        {/* logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <defs>
              <linearGradient id="loginLg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <rect width="36" height="36" rx="10" fill="url(#loginLg)" />
            <path d="M23.5 12C23.5 12 13.5 12 13.5 17C13.5 22 23.5 20 23.5 25C23.5 30 13.5 30 13.5 30" stroke="white" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          </svg>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 22, color: C.white, letterSpacing: '-0.5px' }}>SWMS</span>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.60)', marginBottom: 28, fontSize: 14 }}>Smart Workforce Management System</p>

        {error && (
          <div style={{ background: 'rgba(233,69,96,0.18)', border: '1px solid rgba(233,69,96,0.45)', color: '#ff8096', borderRadius: 8, padding: '10px 14px', marginBottom: 18, fontSize: 14 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>Email</label>
          <input
            style={{ width: '100%', padding: '11px 14px', border: '1px solid rgba(255,255,255,0.22)', borderRadius: 8, fontSize: 15, marginBottom: 18, outline: 'none', background: 'rgba(255,255,255,0.10)', color: C.white, boxSizing: 'border-box' }}
            type="email" name="email"
            value={form.email} onChange={handleChange}
            placeholder="you@example.com" required
          />

          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>Password</label>
          <input
            style={{ width: '100%', padding: '11px 14px', border: '1px solid rgba(255,255,255,0.22)', borderRadius: 8, fontSize: 15, marginBottom: 24, outline: 'none', background: 'rgba(255,255,255,0.10)', color: C.white, boxSizing: 'border-box' }}
            type="password" name="password"
            value={form.password} onChange={handleChange}
            placeholder="••••••••" required
          />

          <button
            style={{ width: '100%', padding: '13px', background: C.accent, color: C.white, border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s', letterSpacing: '0.3px' }}
            type="submit" disabled={loading}
            onMouseEnter={e => e.currentTarget.style.background = '#c9374e'}
            onMouseLeave={e => e.currentTarget.style.background = C.accent}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>
          No account?{' '}
          <Link to="/register" style={{ color: '#ff8096', fontWeight: 600, textDecoration: 'none' }}>Register here</Link>
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
