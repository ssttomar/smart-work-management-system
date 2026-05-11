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

const pad2 = (value) => String(value).padStart(2, '0');

const getLocalDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
};

const getLocalTime = () => {
  const now = new Date();
  return `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
};

const toDisplayTime12 = (value) => {
  if (!value) return '';
  const [hourText, minuteText] = value.split(':');
  const hour24 = Number(hourText || 0);
  const minute = Number(minuteText || 0);
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${pad2(hour12)}:${pad2(minute)} ${period}`;
};

const toClockState = (value) => {
  if (!value) {
    return { hour: 9, minute: 0, period: 'AM' };
  }
  const [hourText, minuteText] = value.split(':');
  const hour24 = Number(hourText || 0);
  const minute = Number(minuteText || 0);
  return {
    hour: hour24 % 12 === 0 ? 12 : hour24 % 12,
    minute,
    period: hour24 >= 12 ? 'PM' : 'AM',
  };
};

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
  label:   { display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#1a1a2e' },
  input:   { width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 6, marginBottom: 16, fontSize: 14 },
  row:     { display: 'flex', gap: 12 },
  cancel:  { flex: 1, padding: 10, border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', background: '#fff' },
  save:    { flex: 1, padding: 10, background: '#0f3460', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
  err:     { background: '#ffeaea', color: '#c0392b', padding: '10px', borderRadius: 6, marginBottom: 14 },
  clockWrap: { marginBottom: 16, padding: 12, border: '1px solid #e5e7eb', borderRadius: 10, background: '#f9fafb' },
  clockTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  clockLabel: { fontWeight: 600, fontSize: 13, color: '#1a1a2e' },
  clockValue: { fontWeight: 700, fontSize: 14, color: '#0f3460' },
  dial: { position: 'relative', width: 220, height: 220, margin: '0 auto 12px', borderRadius: '50%', background: '#fff', border: '1px solid #e5e7eb' },
  dialBtn: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: '50%',
    border: '1px solid #d1d5db',
    background: '#fff',
    color: '#111827',
    fontSize: 12,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialBtnActive: { background: '#0f3460', color: '#fff', borderColor: '#0f3460' },
  clockActions: { display: 'flex', gap: 10 },
  clockStep: { padding: '6px 10px', borderRadius: 999, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: 12 },
  clockStepActive: { background: '#0f3460', color: '#fff', borderColor: '#0f3460' },
};

function CheckInModal({ onClose, onCreated, defaultUserId }) {
  const today = getLocalDate();
  const nowTime = getLocalTime();
  const [form, setForm] = useState({
    userId: defaultUserId || '', date: today,
    checkIn: nowTime, checkOut: '', notes: '',
  });
  const [err, setErr] = useState('');
  const isUserLocked = Boolean(defaultUserId);
  const [showClock, setShowClock] = useState(false);
  const [clockStep, setClockStep] = useState('hour');
  const [tempHour, setTempHour] = useState(9);
  const [tempMinute, setTempMinute] = useState(0);
  const [tempPeriod, setTempPeriod] = useState('AM');
  const [activeField, setActiveField] = useState('checkOut');

  useEffect(() => {
    const nowTimeValue = getLocalTime();
    const clockState = toClockState(nowTimeValue);
    setTempHour(clockState.hour);
    setTempMinute(clockState.minute);
    setTempPeriod(clockState.period);
    setForm((prev) => ({ ...prev, date: getLocalDate(), checkIn: nowTimeValue }));
  }, []);

  const hours = Array.from({ length: 12 }, (_, index) => index + 1);
  const minutes = Array.from({ length: 12 }, (_, index) => index * 5);

  const positionForIndex = (index, total, radius) => {
    const angle = (index / total) * (Math.PI * 2) - Math.PI / 2;
    const center = 110;
    return {
      left: center + radius * Math.cos(angle) - 17,
      top: center + radius * Math.sin(angle) - 17,
    };
  };

  const applyClockTime = () => {
    const normalizedHour = tempHour % 12;
    const hour24 = tempPeriod === 'PM' ? normalizedHour + 12 : normalizedHour;
    const value = `${pad2(hour24)}:${pad2(tempMinute)}:00`;
    setForm((prev) => ({ ...prev, [activeField]: value }));
    setShowClock(false);
  };

  const openClockFor = (field) => {
    const clockState = toClockState(form[field]);
    setTempHour(clockState.hour);
    setTempMinute(clockState.minute);
    setTempPeriod(clockState.period);
    setClockStep('hour');
    setActiveField(field);
    setShowClock(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const normalizeTime = (value) => (value && value.length > 0 ? value : null);
      const payload = {
        ...form,
        userId: Number(form.userId),
        checkIn: normalizeTime(form.checkIn) || getLocalTime(),
        checkOut: normalizeTime(form.checkOut),
      };
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
          <input
            style={s.input}
            type="number"
            value={form.userId}
            onChange={e => setForm({...form, userId: e.target.value})}
            readOnly={isUserLocked}
            required
          />

          <label style={s.label}>Date *</label>
          <input style={s.input} type="date" value={form.date}
            onChange={e => setForm({...form, date: e.target.value})} required />

          <label style={s.label}>Check-In Time (auto)</label>
          <input
            style={s.input}
            type="text"
            value={toDisplayTime12(form.checkIn)}
            readOnly
            onClick={() => openClockFor('checkIn')}
          />

          <label style={s.label}>Check-Out Time</label>
          <input
            style={s.input}
            type="text"
            value={toDisplayTime12(form.checkOut)}
            placeholder="Select from clock"
            readOnly
            onClick={() => openClockFor('checkOut')}
          />

          {showClock && (
            <div style={s.clockWrap}>
              <div style={s.clockTop}>
                <div style={s.clockLabel}>Select check-out time</div>
                <div style={s.clockValue}>{pad2(tempHour)}:{pad2(tempMinute)} {tempPeriod}</div>
              </div>
              <div style={s.clockActions}>
                <button
                  type="button"
                  style={{ ...s.clockStep, ...(clockStep === 'hour' ? s.clockStepActive : {}) }}
                  onClick={() => setClockStep('hour')}
                >
                  Hour
                </button>
                <button
                  type="button"
                  style={{ ...s.clockStep, ...(clockStep === 'minute' ? s.clockStepActive : {}) }}
                  onClick={() => setClockStep('minute')}
                >
                  Minute
                </button>
                <button
                  type="button"
                  style={{ ...s.clockStep, ...(tempPeriod === 'AM' ? s.clockStepActive : {}) }}
                  onClick={() => setTempPeriod('AM')}
                >
                  AM
                </button>
                <button
                  type="button"
                  style={{ ...s.clockStep, ...(tempPeriod === 'PM' ? s.clockStepActive : {}) }}
                  onClick={() => setTempPeriod('PM')}
                >
                  PM
                </button>
              </div>
              <div style={s.dial}>
                {(clockStep === 'hour' ? hours : minutes).map((value, index, arr) => {
                  const total = arr.length;
                  const radius = clockStep === 'hour' ? 86 : 74;
                  const { left, top } = positionForIndex(index, total, radius);
                  const isActive = clockStep === 'hour'
                    ? value === tempHour
                    : value === tempMinute;
                  return (
                    <button
                      key={`${clockStep}-${value}`}
                      type="button"
                      style={{
                        ...s.dialBtn,
                        ...(isActive ? s.dialBtnActive : {}),
                        left,
                        top,
                      }}
                      onClick={() => {
                        if (clockStep === 'hour') {
                          setTempHour(value);
                          setClockStep('minute');
                        } else {
                          setTempMinute(value);
                        }
                      }}
                    >
                      {pad2(value)}
                    </button>
                  );
                })}
              </div>
              <div style={s.row}>
                <button type="button" style={s.cancel} onClick={() => setShowClock(false)}>Cancel</button>
                <button type="button" style={s.save} onClick={applyClockTime}>Save Time</button>
              </div>
            </div>
          )}

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
