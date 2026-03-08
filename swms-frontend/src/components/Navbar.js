import { useAuth } from '../context/AuthContext';

const ROLE_COLORS = {
  ADMIN: '#ec4899',
  MANAGER: '#22d3ee',
  EMPLOYEE: '#34d399',
};

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    height: 64,
    background: 'rgba(15,23,42,0.92)',
    color: '#fff',
    borderBottom: '1px solid rgba(148,163,184,0.12)',
    backdropFilter: 'blur(16px)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  brand: { fontSize: 20, fontWeight: 700, letterSpacing: 0.6 },
  right: { display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' },
  badge: (role) => ({
    background: `${ROLE_COLORS[role] || '#64748b'}22`,
    color: ROLE_COLORS[role] || '#cbd5e1',
    border: `1px solid ${ROLE_COLORS[role] || '#64748b'}44`,
    borderRadius: 999,
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.6,
  }),
  btn: {
    background: 'linear-gradient(135deg,#6366f1,#ec4899)',
    border: 'none',
    color: '#fff',
    borderRadius: 999,
    padding: '8px 14px',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 700,
  },
  welcome: { color: '#cbd5e1', fontSize: 14 },
};

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav style={styles.nav}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
          <defs>
            <linearGradient id="appNavLg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          <rect width="36" height="36" rx="12" fill="url(#appNavLg)" />
          <path d="M23.5 12C23.5 12 13.5 12 13.5 17C13.5 22 23.5 20 23.5 25C23.5 30 13.5 30 13.5 30" stroke="white" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        </svg>
        <span style={styles.brand}>SWMS</span>
      </div>
      {user && (
        <div style={styles.right}>
          <span style={styles.welcome}>Welcome, <strong style={{ color: '#fff' }}>{user.name}</strong></span>
          <span style={styles.badge(user.role)}>{user.role}</span>
          <button style={styles.btn} onClick={logout}>Logout</button>
        </div>
      )}
    </nav>
  );
}
