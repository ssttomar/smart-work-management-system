/**
 * Navbar.js — top navigation bar shown on all authenticated pages.
 *
 * Displays:
 *   • App name / logo
 *   • Logged-in user's name and role badge
 *   • Logout button
 */
import React from 'react';
import { useAuth } from '../context/AuthContext';

const ROLE_COLORS = {
  ADMIN:    '#e74c3c',
  MANAGER:  '#f39c12',
  EMPLOYEE: '#27ae60',
};

const styles = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 24px', height: 60,
    background: '#1a1a2e', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    position: 'sticky', top: 0, zIndex: 100,
  },
  brand: { fontSize: 20, fontWeight: 700, letterSpacing: 1 },
  right:  { display: 'flex', alignItems: 'center', gap: 16 },
  badge:  (role) => ({
    background: ROLE_COLORS[role] || '#555',
    color: '#fff', borderRadius: 4,
    padding: '2px 10px', fontSize: 12, fontWeight: 600,
  }),
  btn: {
    background: 'transparent', border: '1px solid #fff',
    color: '#fff', borderRadius: 4, padding: '6px 14px',
    cursor: 'pointer', fontSize: 14,
  },
};

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav style={styles.nav}>
      <span style={styles.brand}>SWMS</span>
      {user && (
        <div style={styles.right}>
          <span>Welcome, <strong>{user.name}</strong></span>
          <span style={styles.badge(user.role)}>{user.role}</span>
          <button style={styles.btn} onClick={logout}>Logout</button>
        </div>
      )}
    </nav>
  );
}
