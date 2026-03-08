import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/* ── Logo SVG ────────────────────────────────────────────────────── */
const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <defs>
        <linearGradient id="navLg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <rect width="36" height="36" rx="10" fill="url(#navLg)" />
      <path
        d="M23.5 12C23.5 12 13.5 12 13.5 17C13.5 22 23.5 20 23.5 25C23.5 30 13.5 30 13.5 30"
        stroke="white" strokeWidth="2.8" strokeLinecap="round" fill="none"
      />
    </svg>
    <span style={{
      fontFamily: 'Space Grotesk, sans-serif',
      fontWeight: 800, fontSize: 20, color: 'white', letterSpacing: '-0.5px',
    }}>SWMS</span>
  </div>
);

/* ── Animated nav link with underline ───────────────────────────── */
function NavLink({ label, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: hov ? 'white' : 'rgba(255,255,255,0.65)',
        fontWeight: 600, fontSize: 15,
        fontFamily: 'Inter, sans-serif',
        transition: 'color 0.2s', position: 'relative', padding: '4px 2px',
      }}
    >
      {label}
      <motion.span
        animate={{ scaleX: hov ? 1 : 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{
          position: 'absolute', bottom: -2, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, #6366f1, #ec4899)',
          borderRadius: 2, transformOrigin: 'left',
          display: 'block',
        }}
      />
    </button>
  );
}

/* ── Hamburger icon ─────────────────────────────────────────────── */
function Hamburger({ open, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Toggle menu"
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        padding: 8, display: 'flex', flexDirection: 'column', gap: 5, zIndex: 1100,
      }}
    >
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          animate={
            open
              ? i === 0 ? { rotate: 45, y: 9 }
              : i === 1 ? { opacity: 0 }
              : { rotate: -45, y: -9 }
              : { rotate: 0, y: 0, opacity: 1 }
          }
          transition={{ duration: 0.25 }}
          style={{
            display: 'block', width: 24, height: 2,
            background: 'white', borderRadius: 2,
          }}
        />
      ))}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile]   = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  const navLinks = [
    { label: 'Home',         action: () => { window.scrollTo({ top: 0, behavior: 'smooth' }); setMobileOpen(false); } },
    { label: 'Features',     action: () => scrollTo('features') },
    { label: 'How it Works', action: () => scrollTo('howitworks') },
    { label: 'Stats',        action: () => scrollTo('stats') },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          height: 68,
          background: scrolled ? 'rgba(10,12,28,0.82)' : 'transparent',
          backdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(99,102,241,0.18)' : 'none',
          transition: 'background 0.35s ease, backdrop-filter 0.35s ease, border 0.35s ease',
          padding: '0 5%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <div onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <Logo />
        </div>

        {/* Desktop links */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            {navLinks.map(({ label, action }) => (
              <NavLink key={label} label={label} onClick={action} />
            ))}
          </div>
        )}

        {/* Desktop auth buttons */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '9px 22px', borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.18)',
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.85)',
                fontWeight: 600, fontSize: 14, cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
            >Login</button>

            <button
              onClick={() => navigate('/register')}
              style={{
                padding: '9px 22px', borderRadius: 8, border: 'none',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
                color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
                boxShadow: '0 0 20px rgba(99,102,241,0.35)',
                backgroundSize: '200% 200%',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 32px rgba(99,102,241,0.6)'; e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(99,102,241,0.35)'; e.currentTarget.style.transform = 'none'; }}
            >Get Started</button>
          </div>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <Hamburger open={mobileOpen} onClick={() => setMobileOpen(o => !o)} />
        )}
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed', top: 68, left: 0, right: 0, zIndex: 999,
              background: 'rgba(10,12,28,0.97)', backdropFilter: 'blur(24px)',
              borderBottom: '1px solid rgba(99,102,241,0.2)',
              padding: '20px 5% 28px',
            }}
          >
            {navLinks.map(({ label, action }, i) => (
              <motion.button
                key={label}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={action}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.8)', fontSize: 17, fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.07)',
                }}
              >{label}</motion.button>
            ))}
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button
                onClick={() => { navigate('/login'); setMobileOpen(false); }}
                style={{
                  flex: 1, padding: '13px', borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'transparent', color: 'white',
                  fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                }}
              >Login</button>
              <button
                onClick={() => { navigate('/register'); setMobileOpen(false); }}
                style={{
                  flex: 1, padding: '13px', borderRadius: 8, border: 'none',
                  background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                  color: 'white', fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
              >Get Started</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
