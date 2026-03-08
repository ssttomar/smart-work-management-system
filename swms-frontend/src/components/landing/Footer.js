import { useNavigate } from 'react-router-dom';

const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <svg width="30" height="30" viewBox="0 0 36 36" fill="none">
      <defs>
        <linearGradient id="ftLg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <rect width="36" height="36" rx="10" fill="url(#ftLg)" />
      <path d="M23.5 12C23.5 12 13.5 12 13.5 17C13.5 22 23.5 20 23.5 25C23.5 30 13.5 30 13.5 30" stroke="white" strokeWidth="2.8" strokeLinecap="round" fill="none" />
    </svg>
    <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 18, color: 'white', letterSpacing: '-0.5px' }}>SWMS</span>
  </div>
);

export default function Footer() {
  const navigate = useNavigate();
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const links = [
    { label: 'Features', action: () => scrollTo('features') },
    { label: 'How it Works', action: () => scrollTo('howitworks') },
    { label: 'Stats', action: () => scrollTo('stats') },
    { label: 'Login', action: () => navigate('/login') },
    { label: 'Register', action: () => navigate('/register') },
  ];

  return (
    <footer style={{
      background: '#060b18',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '52px 5% 36px',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Top row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', flexWrap: 'wrap', gap: 32,
          marginBottom: 40,
        }}>
          <div>
            <Logo />
            <p style={{
              color: 'rgba(255,255,255,0.32)', fontSize: 14, marginTop: 12,
              maxWidth: 260, lineHeight: 1.7, fontFamily: 'Inter, sans-serif',
            }}>
              Smart Workforce Management System. Built for modern enterprises.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: 13, marginBottom: 16, fontFamily: 'Inter, sans-serif', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Navigation</div>
              {links.slice(0, 3).map(({ label, action }) => (
                <button key={label} onClick={action} style={{
                  display: 'block', background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.38)', fontSize: 14, fontWeight: 500,
                  fontFamily: 'Inter, sans-serif', marginBottom: 10, padding: 0,
                  transition: 'color 0.2s', textAlign: 'left',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.38)'}
                >{label}</button>
              ))}
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: 13, marginBottom: 16, fontFamily: 'Inter, sans-serif', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Account</div>
              {links.slice(3).map(({ label, action }) => (
                <button key={label} onClick={action} style={{
                  display: 'block', background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.38)', fontSize: 14, fontWeight: 500,
                  fontFamily: 'Inter, sans-serif', marginBottom: 10, padding: 0,
                  transition: 'color 0.2s', textAlign: 'left',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.38)'}
                >{label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 28 }} />

        {/* Bottom row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 12,
        }}>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
            © 2026 SWMS. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>Powered by</span>
            <span style={{
              background: 'linear-gradient(90deg, #6366f1, #ec4899)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', fontSize: 12, fontWeight: 700,
              fontFamily: 'Space Grotesk, sans-serif',
            }}>React + Spring Boot</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
