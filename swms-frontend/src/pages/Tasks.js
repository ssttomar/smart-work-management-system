/**
 * Tasks.js — Task management page.
 *
 * ADMIN/MANAGER see all tasks + can create / delete.
 * EMPLOYEE sees only their assigned tasks + can update status.
 */
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

const STATUS_COLOR = {
  TODO: '#95a5a6', IN_PROGRESS: '#3498db', COMPLETED: '#27ae60', CANCELLED: '#e74c3c',
};

const s = {
  layout:  { display: 'flex' },
  main:    { flex: 1, padding: 32 },
  heading: { fontSize: 24, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 },
  bar:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  addBtn:  { background: '#0f3460', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 20px', cursor: 'pointer', fontWeight: 600 },
  table:   { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  th:      { background: '#0f3460', color: '#fff', padding: '12px 16px', textAlign: 'left', fontSize: 13 },
  td:      { padding: '12px 16px', borderBottom: '1px solid #f0f0f0', fontSize: 14, color: '#333' },
  badge:   (s) => ({ background: STATUS_COLOR[s] || '#ccc', color: '#fff', padding: '2px 10px', borderRadius: 4, fontSize: 12 }),
  delBtn:  { background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 12px', cursor: 'pointer', fontSize: 13 },
  modal:   { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  mcard:   { background: '#fff', borderRadius: 12, padding: 32, width: 440 },
  label:   { display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 },
  input:   { width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 6, marginBottom: 16, fontSize: 14 },
  row:     { display: 'flex', gap: 12 },
  cancel:  { flex: 1, padding: 10, border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', background: '#fff' },
  save:    { flex: 1, padding: 10, background: '#0f3460', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
  err:     { background: '#ffeaea', color: '#c0392b', padding: '10px', borderRadius: 6, marginBottom: 14 },
};

function CreateTaskModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', assignedToId: '', deadline: '', status: 'TODO' });
  const [err, setErr]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const payload = { ...form, assignedToId: Number(form.assignedToId) };
      const { data } = await api.post('/api/tasks', payload);
      onCreated(data);
      onClose();
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed to create task.');
    }
  };

  return (
    <div style={s.modal}>
      <div style={s.mcard}>
        <h2 style={{ marginBottom: 20, color: '#1a1a2e' }}>Create Task</h2>
        {err && <div style={s.err}>{err}</div>}
        <form onSubmit={handleSubmit}>
          <label style={s.label}>Title *</label>
          <input style={s.input} value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />

          <label style={s.label}>Description</label>
          <input style={s.input} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />

          <label style={s.label}>Assigned To (User ID) *</label>
          <input style={s.input} type="number" value={form.assignedToId} onChange={e => setForm({...form, assignedToId: e.target.value})} required />

          <label style={s.label}>Deadline</label>
          <input style={s.input} type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} />

          <label style={s.label}>Status</label>
          <select style={s.input} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
            {['TODO','IN_PROGRESS','COMPLETED','CANCELLED'].map(st => <option key={st}>{st}</option>)}
          </select>

          <div style={s.row}>
            <button type="button" style={s.cancel} onClick={onClose}>Cancel</button>
            <button type="submit" style={s.save}>Create Task</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Tasks() {
  const { isAdmin, isManager } = useAuth();
  const canManage = isAdmin() || isManager();
  const [tasks,  setTasks]  = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError]   = useState('');

  const load = async () => {
    try {
      const { data } = await api.get('/api/tasks');
      setTasks(data);
    } catch (e) { setError('Failed to load tasks.'); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/api/tasks/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (e) { setError('Failed to delete task.'); }
  };

  return (
    <>
      <Navbar />
      {showModal && (
        <CreateTaskModal
          onClose={() => setShowModal(false)}
          onCreated={(t) => setTasks([t, ...tasks])}
        />
      )}
      <div style={s.layout}>
        <Sidebar />
        <main style={s.main}>
          <div style={s.bar}>
            <h1 style={s.heading}>Tasks</h1>
            {canManage && (
              <button style={s.addBtn} onClick={() => setShowModal(true)}>+ New Task</button>
            )}
          </div>
          {error && <div style={s.err}>{error}</div>}
          <table style={s.table}>
            <thead>
              <tr>
                {['#','Title','Assigned To','Created By','Status','Deadline', canManage ? 'Actions' : ''].filter(Boolean).map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr><td colSpan={7} style={{ ...s.td, textAlign: 'center', color: '#aaa' }}>No tasks found.</td></tr>
              ) : (
                tasks.map(t => (
                  <tr key={t.id}>
                    <td style={s.td}>{t.id}</td>
                    <td style={s.td}><strong>{t.title}</strong><br/><small style={{ color: '#999' }}>{t.description}</small></td>
                    <td style={s.td}>{t.assignedToName || t.assignedToId}</td>
                    <td style={s.td}>{t.createdByName  || t.createdById}</td>
                    <td style={s.td}><span style={s.badge(t.status)}>{t.status}</span></td>
                    <td style={s.td}>{t.deadline || '—'}</td>
                    {canManage && (
                      <td style={s.td}>
                        <button style={s.delBtn} onClick={() => handleDelete(t.id)}>Delete</button>
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
