/**
 * Sidebar.js — role-aware navigation sidebar.
 *
 * ADMIN    → Users, Tasks, Attendance
 * MANAGER  → Tasks, Attendance
 * EMPLOYEE → My Tasks, My Attendance
 */
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const styles = {
  sidebar: {
    width: 220, minHeight: 'calc(100vh - 60px)',
    background: '#16213e', color: '#aaa',
    padding: '24px 0',
  },
  link: (isActive) => ({
    display: 'block', padding: '12px 24px',
    color: isActive ? '#fff' : '#aaa',
    background: isActive ? '#0f3460' : 'transparent',
    textDecoration: 'none', fontWeight: isActive ? 600 : 400,
    borderLeft: isActive ? '3px solid #e94560' : '3px solid transparent',
    transition: 'all 0.2s',
  }),
  section: {
    fontSize: 11, fontWeight: 700, letterSpacing: 1,
    color: '#555', padding: '12px 24px 4px',
    textTransform: 'uppercase',
  },
};

const NAV_LINKS = {
  ADMIN: [
    { to: '/admin/dashboard',   label: 'Dashboard'  },
    { to: '/admin/users',       label: 'Users'       },
    { to: '/admin/tasks',       label: 'Tasks'       },
    { to: '/admin/attendance',  label: 'Attendance'  },
  ],
  MANAGER: [
    { to: '/manager/dashboard',  label: 'Dashboard' },
    { to: '/manager/tasks',      label: 'Tasks'     },
    { to: '/manager/attendance', label: 'Attendance'},
  ],
  EMPLOYEE: [
    { to: '/employee/dashboard',  label: 'Dashboard'     },
    { to: '/employee/tasks',      label: 'My Tasks'      },
    { to: '/employee/attendance', label: 'My Attendance' },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  const links = NAV_LINKS[user?.role] ?? [];

  return (
    <aside style={styles.sidebar}>
      <p style={styles.section}>Navigation</p>
      {links.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          style={({ isActive }) => styles.link(isActive)}
        >
          {label}
        </NavLink>
      ))}
    </aside>
  );
}
