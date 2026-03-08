import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = {
  ADMIN: [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/tasks', label: 'Tasks' },
    { to: '/admin/attendance', label: 'Attendance' },
  ],
  MANAGER: [
    { to: '/manager/dashboard', label: 'Dashboard' },
    { to: '/manager/tasks', label: 'Tasks' },
    { to: '/manager/attendance', label: 'Attendance' },
  ],
  EMPLOYEE: [
    { to: '/employee/dashboard', label: 'Dashboard' },
    { to: '/employee/tasks', label: 'My Tasks' },
    { to: '/employee/attendance', label: 'My Attendance' },
  ],
};

const styles = {
  sidebar: {
    width: 240,
    minHeight: 'calc(100vh - 64px)',
    padding: '24px 18px',
    background: 'linear-gradient(180deg, rgba(15,23,42,0.96), rgba(17,24,39,0.96))',
    borderRight: '1px solid rgba(148,163,184,0.12)',
  },
  rail: {
    padding: 12,
    borderRadius: 22,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(148,163,184,0.12)',
  },
  section: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.2,
    color: '#64748b',
    padding: '6px 10px 12px',
    textTransform: 'uppercase',
  },
  link: (isActive) => ({
    display: 'block',
    marginBottom: 8,
    padding: '12px 14px',
    color: isActive ? '#fff' : '#94a3b8',
    background: isActive ? 'linear-gradient(135deg, rgba(99,102,241,0.22), rgba(236,72,153,0.18))' : 'transparent',
    border: `1px solid ${isActive ? 'rgba(129,140,248,0.28)' : 'transparent'}`,
    borderRadius: 16,
    textDecoration: 'none',
    fontWeight: isActive ? 700 : 500,
    transition: 'all 0.2s',
  }),
};

export default function Sidebar() {
  const { user } = useAuth();
  const links = NAV_LINKS[user?.role] ?? [];

  return (
    <aside style={styles.sidebar}>
      <div style={styles.rail}>
        <p style={styles.section}>Navigation</p>
        {links.map(({ to, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => styles.link(isActive)}>
            {label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
