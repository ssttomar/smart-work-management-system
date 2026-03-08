/**
 * AdminLogin.js - private admin-only login page at /admin.
 *
 * Only accessible at /admin. Uses /auth/admin-login which the backend
 * will reject if the credentials don't belong to an ADMIN account.
 * Regular managers and employees cannot use this page.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

const C = {
  accent: '#dc2626',
  white:  '#ffffff',
};

export default function AdminLogin() {
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
      const { data } = await api.post('/auth/admin-login', form);
      login(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Access denied. Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #12121f 60%, #1a0a0a 100%)',
      position: 'relative', overflow: 'hidden',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <div style={{ position: 'absolute', top: '10%', right: '8%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(220,38,38,0.12)', filter: 'blur(100px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '8%', left: '12%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(245,158,11,0.08)', filter: 'blur(90px)', pointerEvents: 'none' }} />

      <div style={{
        position: 'relative', zIndex: 1,
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(220,38,38,0.30)',
        borderRadius: 20,
        padding: '44px 48px',
        width: 420,
        boxShadow: '0 8px 48px rgba(0,0,0,0.60), 0 0 0 1px rgba(220,38,38,0.10)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #dc2626, #7f1d1d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(220,38,38,0.40)',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: C.white, letterSpacing: '-0.3px' }}>Admin Portal</div>
            <div style={{ fontSize: 11, color: 'rgba(220,38,38,0.80)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>SWMS · Restricted Access</div>
          </div>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.40)', marginBottom: 28, fontSize: 13, marginTop: 12 }}>
          This page is for system administrators only.
        </p>

        {error && (
          <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.40)', color: '#fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 18, fontSize: 14 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>Admin Email</label>
          <input
            style={{ width: '100%', padding: '11px 14px', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 8, fontSize: 15, marginBottom: 18, outline: 'none', background: 'rgba(255,255,255,0.06)', color: C.white, boxSizing: 'border-box' }}
            type="email" name="email"
            value={form.email} onChange={handleChange}
            placeholder="admin@company.com" required
            autoComplete="off"
          />

          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>Password</label>
          <input
            style={{ width: '100%', padding: '11px 14px', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 8, fontSize: 15, marginBottom: 28, outline: 'none', background: 'rgba(255,255,255,0.06)', color: C.white, boxSizing: 'border-box' }}
            type="password" name="password"
            value={form.password} onChange={handleChange}
            placeholder="········" required
            autoComplete="current-password"
          />

          <button
            style={{ width: '100%', padding: '13px', background: C.accent, color: C.white, border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s', letterSpacing: '0.3px', opacity: loading ? 0.7 : 1 }}
            type="submit" disabled={loading}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#b91c1c'; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.accent; }}
          >
            {loading ? 'Verifying…' : 'Sign In as Admin'}
          </button>
        </form>

        <Link to="/" style={{
          display: 'block', width: '100%', padding: '11px', marginTop: 14,
          background: 'transparent', color: 'rgba(255,255,255,0.55)',
          border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 8,
          fontSize: 15, fontWeight: 600, cursor: 'pointer',
          textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box',
          transition: 'border-color 0.2s, color 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.40)'; e.currentTarget.style.color = C.white; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
        >← Home</Link>
      </div>
    </div>
  );
}
