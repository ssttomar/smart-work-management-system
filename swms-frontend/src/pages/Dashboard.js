/**
 * Dashboard.js — role-aware summary dashboard.
 *
 * Displayed at /admin/dashboard, /manager/dashboard, /employee/dashboard.
 * The same component renders differently based on the user's role from context.
 *
 * Shows stat cards and quick links relevant to the user's role.
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';

const s = {
  layout:  { display: 'flex' },
  main:    { flex: 1, padding: 32 },
  heading: { fontSize: 26, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 },
  sub:     { color: '#777', marginBottom: 32 },
  grid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20, marginBottom: 40 },
  card:    (color) => ({ background: color, borderRadius: 12, padding: '24px 28px', color: '#fff' }),
  num:     { fontSize: 40, fontWeight: 800 },
  label:   { fontSize: 14, opacity: 0.85, marginTop: 4 },
  section: { fontSize: 18, fontWeight: 600, color: '#1a1a2e', marginBottom: 16 },
  qlink:   { display: 'inline-block', padding: '10px 20px', background: '#0f3460', color: '#fff', borderRadius: 6, textDecoration: 'none', marginRight: 12, fontSize: 14 },
};

export default function Dashboard() {
  const { user, isAdmin, isManager } = useAuth();
  const [stats, setStats] = useState({ users: 0, tasks: 0, attendance: 0 });

  useEffect(() => {
    // Load stats in parallel based on role
    const loadStats = async () => {
      try {
        const promises = [api.get('/api/tasks'), api.get('/api/attendance')];
        if (isAdmin()) promises.push(api.get('/api/users'));

        const results = await Promise.allSettled(promises);
        setStats({
          tasks:      results[0].status === 'fulfilled' ? results[0].value.data.length : 0,
          attendance: results[1].status === 'fulfilled' ? results[1].value.data.length : 0,
          users:      (isAdmin() && results[2]?.status === 'fulfilled') ? results[2].value.data.length : 0,
        });
      } catch (_) { /* stats are non-critical */ }
    };
    loadStats();
  }, [isAdmin]);

  const rolePrefix = user?.role === 'ADMIN'
    ? '/admin'
    : user?.role === 'MANAGER'
    ? '/manager'
    : '/employee';

  return (
    <>
      <Navbar />
      <div style={s.layout}>
        <Sidebar />
        <main style={s.main}>
          <h1 style={s.heading}>Welcome back, {user?.name}!</h1>
          <p style={s.sub}>Here is your {user?.role?.toLowerCase()} overview for today.</p>

          <div style={s.grid}>
            {isAdmin() && (
              <div style={s.card('#e74c3c')}>
                <div style={s.num}>{stats.users}</div>
                <div style={s.label}>Total Users</div>
              </div>
            )}
            <div style={s.card('#0f3460')}>
              <div style={s.num}>{stats.tasks}</div>
              <div style={s.label}>{isAdmin() || isManager() ? 'All Tasks' : 'My Tasks'}</div>
            </div>
            <div style={s.card('#27ae60')}>
              <div style={s.num}>{stats.attendance}</div>
              <div style={s.label}>Attendance Records</div>
            </div>
          </div>

          <p style={s.section}>Quick Actions</p>
          <div>
            {isAdmin() && (
              <Link to="/admin/users" style={s.qlink}>Manage Users</Link>
            )}
            {(isAdmin() || isManager()) && (
              <Link to={`${rolePrefix}/tasks`} style={s.qlink}>Manage Tasks</Link>
            )}
            <Link to={`${rolePrefix}/attendance`} style={s.qlink}>
              {isAdmin() || isManager() ? 'View Attendance' : 'My Attendance'}
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
