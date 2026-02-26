/**
 * Users.js — User management page (ADMIN only).
 *
 * Features:
 *   • List all users in a table
 *   • Delete a user (with confirmation)
 *   • Role badge colour-coded
 */
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../api/axiosConfig';

const ROLE_COLOR = { ADMIN: '#e74c3c', MANAGER: '#f39c12', EMPLOYEE: '#27ae60' };

const s = {
  layout:  { display: 'flex' },
  main:    { flex: 1, padding: 32 },
  heading: { fontSize: 24, fontWeight: 700, color: '#1a1a2e', marginBottom: 24 },
  table:   { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  th:      { background: '#0f3460', color: '#fff', padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13 },
  td:      { padding: '12px 16px', borderBottom: '1px solid #f0f0f0', fontSize: 14, color: '#333' },
  badge:   (role) => ({ background: ROLE_COLOR[role] || '#888', color: '#fff', padding: '2px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600 }),
  delBtn:  { background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 12px', cursor: 'pointer', fontSize: 13 },
  err:     { background: '#ffeaea', color: '#c0392b', padding: '10px 14px', borderRadius: 6, marginBottom: 16 },
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get('/api/users');
      setUsers(data);
    } catch (e) {
      setError('Failed to load users.');
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This will also delete their tasks and attendance.`)) return;
    try {
      await api.delete(`/api/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
    } catch (e) {
      setError('Failed to delete user.');
    }
  };

  return (
    <>
      <Navbar />
      <div style={s.layout}>
        <Sidebar />
        <main style={s.main}>
          <h1 style={s.heading}>User Management</h1>
          {error && <div style={s.err}>{error}</div>}
          <table style={s.table}>
            <thead>
              <tr>
                {['ID','Name','Email','Department','Role','Actions'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={6} style={{ ...s.td, textAlign: 'center', color: '#aaa' }}>No users found.</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id}>
                    <td style={s.td}>{u.id}</td>
                    <td style={s.td}><strong>{u.name}</strong></td>
                    <td style={s.td}>{u.email}</td>
                    <td style={s.td}>{u.department || '—'}</td>
                    <td style={s.td}><span style={s.badge(u.role)}>{u.role}</span></td>
                    <td style={s.td}>
                      <button style={s.delBtn} onClick={() => handleDelete(u.id, u.name)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </main>
      </div>
    </>
  );
}
