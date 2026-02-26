/**
 * Attendance.js — Attendance tracking page.
 *
 * ADMIN/MANAGER: see all records, can create on behalf of any user.
 * EMPLOYEE: sees only their own records, can check themselves in/out.
 */
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

const STATUS_COLOR = { PRESENT: '#27ae60', ABSENT: '#e74c3c', LATE: '#f39c12', HALF_DAY: '#8e44ad' };

const s = {
  layout:  { display: 'flex' },
  main:    { flex: 1, padding: 32 },
  bar:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  heading: { fontSize: 24, fontWeight: 700, color: '#1a1a2e' },
  addBtn:  { background: '#0f3460', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 20px', cursor: 'pointer', fontWeight: 600 },
  table:   { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  th:      { background: '#0f3460', color: '#fff', padding: '12px 16px', textAlign: 'left', fontSize: 13 },
  td:      { padding: '12px 16px', borderBottom: '1px solid #f0f0f0', fontSize: 14, color: '#333' },
  badge:   (st) => ({ background: STATUS_COLOR[st] || '#ccc', color: '#fff', padding: '2px 10px', borderRadius: 4, fontSize: 12 }),
  modal:   { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  mcard:   { background: '#fff', borderRadius: 12, padding: 32, width: 420 },
  label:   { display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 },
  input:   { width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 6, marginBottom: 16, fontSize: 14 },
  row:     { display: 'flex', gap: 12 },
  cancel:  { flex: 1, padding: 10, border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', background: '#fff' },
  save:    { flex: 1, padding: 10, background: '#0f3460', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
  err:     { background: '#ffeaea', color: '#c0392b', padding: '10px', borderRadius: 6, marginBottom: 14 },
};

function CheckInModal({ onClose, onCreated, defaultUserId }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    userId: defaultUserId || '', date: today,
    checkIn: '', checkOut: '', notes: '',
  });
  const [err, setErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const payload = { ...form, userId: Number(form.userId) };
      const { data } = await api.post('/api/attendance', payload);
      onCreated(data);
      onClose();
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed to record attendance.');
    }
  };

  return (
    <div style={s.modal}>
      <div style={s.mcard}>
        <h2 style={{ marginBottom: 20, color: '#1a1a2e' }}>Record Attendance</h2>
        {err && <div style={s.err}>{err}</div>}
        <form onSubmit={handleSubmit}>
          <label style={s.label}>User ID *</label>
          <input style={s.input} type="number" value={form.userId}
            onChange={e => setForm({...form, userId: e.target.value})} required />

          <label style={s.label}>Date *</label>
          <input style={s.input} type="date" value={form.date}
            onChange={e => setForm({...form, date: e.target.value})} required />

          <label style={s.label}>Check-In Time</label>
          <input style={s.input} type="time" step="1" value={form.checkIn}
            onChange={e => setForm({...form, checkIn: e.target.value + ':00'})} />

          <label style={s.label}>Check-Out Time</label>
          <input style={s.input} type="time" step="1" value={form.checkOut}
            onChange={e => setForm({...form, checkOut: e.target.value + ':00'})} />

          <label style={s.label}>Notes</label>
          <input style={s.input} value={form.notes}
            onChange={e => setForm({...form, notes: e.target.value})}
            placeholder="Optional note or reason" />

          <div style={s.row}>
            <button type="button" style={s.cancel} onClick={onClose}>Cancel</button>
            <button type="submit" style={s.save}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Attendance() {
  const { user, isAdmin, isManager } = useAuth();
  const canManage = isAdmin() || isManager();
  const [records, setRecords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get('/api/attendance');
      setRecords(data);
    } catch (e) { setError('Failed to load attendance records.'); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await api.delete(`/api/attendance/${id}`);
      setRecords(records.filter(r => r.id !== id));
    } catch (e) { setError('Failed to delete record.'); }
  };

  return (
    <>
      <Navbar />
      {showModal && (
        <CheckInModal
          onClose={() => setShowModal(false)}
          onCreated={(r) => setRecords([r, ...records])}
          defaultUserId={!canManage ? user?.userId : ''}
        />
      )}
      <div style={s.layout}>
        <Sidebar />
        <main style={s.main}>
          <div style={s.bar}>
            <h1 style={s.heading}>Attendance</h1>
            <button style={s.addBtn} onClick={() => setShowModal(true)}>+ Check In</button>
          </div>
          {error && <div style={s.err}>{error}</div>}
          <table style={s.table}>
            <thead>
              <tr>
                {['#','Employee','Date','Check-In','Check-Out','Status','Notes', canManage ? 'Actions' : ''].filter(Boolean).map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={8} style={{ ...s.td, textAlign: 'center', color: '#aaa' }}>No records found.</td></tr>
              ) : (
                records.map(r => (
                  <tr key={r.id}>
                    <td style={s.td}>{r.id}</td>
                    <td style={s.td}>{r.userName || r.userId}</td>
                    <td style={s.td}>{r.date}</td>
                    <td style={s.td}>{r.checkIn  || '—'}</td>
                    <td style={s.td}>{r.checkOut || '—'}</td>
                    <td style={s.td}><span style={s.badge(r.status)}>{r.status}</span></td>
                    <td style={s.td}>{r.notes || '—'}</td>
                    {canManage && (
                      <td style={s.td}>
                        <button
                          style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 12px', cursor: 'pointer', fontSize: 13 }}
                          onClick={() => handleDelete(r.id)}
                        >
                          Delete
                        </button>
                      </td>
                    )}
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
