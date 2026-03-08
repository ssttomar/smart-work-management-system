import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ParticleBackground from './ParticleBackground';
import SpiralAnimation from './SpiralAnimation';

/* ── Glassmorphism preview card ─────────────────────────────────── */
function GlassCard({ title, dotColor, children, style, floatClass }) {
  return (
    <div
      className={floatClass}
      style={{
        background: 'rgba(255,255,255,0.055)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 16,
        padding: '18px 20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        ...style,
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)'; e.currentTarget.style.transform = (style.transform || '') + ' translateY(-4px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)'; e.currentTarget.style.transform = style.transform || ''; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: dotColor, boxShadow: `0 0 8px ${dotColor}` }} />
        <span style={{ color: 'rgba(255,255,255,0.88)', fontWeight: 600, fontSize: 13, fontFamily: 'Inter, sans-serif' }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

/* ── Gradient CTA button ─────────────────────────────────────────── */
function GradBtn({ children, onClick, variant = 'primary' }) {
  const isPrimary = variant === 'primary';
  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        padding: '15px 36px', borderRadius: 10, cursor: 'pointer',
        fontWeight: 700, fontSize: 16, fontFamily: 'Inter, sans-serif',
        border: isPrimary ? 'none' : '1.5px solid rgba(255,255,255,0.25)',
        background: isPrimary
          ? 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)'
          : 'rgba(255,255,255,0.06)',
        color: 'white',
        boxShadow: isPrimary ? '0 0 28px rgba(99,102,241,0.45), 0 8px 24px rgba(0,0,0,0.3)' : 'none',
        backgroundSize: '200% 200%',
        transition: 'box-shadow 0.3s',
      }}
    >
      {children}
    </motion.button>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
export default function HeroSection({ heroVisible }) {
  const navigate = useNavigate();
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const fadeUp = {
    hidden: { opacity: 0, y: 32 },
    show:   { opacity: 1, y: 0 },
  };

  /* mock data ─────────────────────────────────────────────────── */
  const bars  = [
    { l: 'Mon', p: 88, c: '#4ade80' }, { l: 'Tue', p: 95, c: '#4ade80' },
    { l: 'Wed', p: 71, c: '#facc15' }, { l: 'Thu', p: 100, c: '#4ade80' },
    { l: 'Fri', p: 83, c: '#4ade80' },
  ];
  const tasks = [
    { name: 'Sprint planning', done: true },
    { name: 'UI review', done: false },
    { name: 'Deploy v2.1', done: false },
    { name: 'Team briefing', done: true },
  ];
  const members = [
    { name: 'Alex Kim', role: 'Admin', color: '#818cf8' },
    { name: 'Maria G.', role: 'Manager', color: '#34d399' },
    { name: 'James T.', role: 'Employee', color: '#fb923c' },
  ];

  return (
    <section
      id="hero"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center',
        padding: '100px 5% 60px',
      }}
    >
      {/* Particle background (z=0) */}
      <ParticleBackground />

      {/* Ambient blobs */}
      <div style={{ position: 'absolute', top: '8%', right: '5%', width: 520, height: 520, borderRadius: '50%', background: 'rgba(99,102,241,0.12)', filter: 'blur(90px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '5%', left: '15%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(168,85,247,0.14)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '40%', left: '-5%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(236,72,153,0.08)', filter: 'blur(70px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Main content grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 60,
        maxWidth: 1200, margin: '0 auto', width: '100%',
        alignItems: 'center', zIndex: 2, position: 'relative',
      }}>

        {/* ── LEFT: Headline ───────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          animate={heroVisible ? 'show' : 'hidden'}
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
        >
          {/* Badge */}
          <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
            <span style={{
              display: 'inline-block',
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.35)',
              borderRadius: 20, padding: '6px 16px', marginBottom: 24,
              color: '#a5b4fc', fontWeight: 600, fontSize: 13,
              fontFamily: 'Inter, sans-serif', letterSpacing: '0.3px',
            }}>
              ✦ Smart Workforce Management
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.7 }}
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 'clamp(38px, 4.8vw, 68px)',
              fontWeight: 800, color: 'white', lineHeight: 1.08,
              marginBottom: 24, letterSpacing: '-2px',
            }}
          >
            Manage your team<br />
            <span style={{
              background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>smarter,</span> not harder.
          </motion.h1>

          {/* Sub */}
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            style={{
              color: 'rgba(255,255,255,0.62)', fontSize: 18, lineHeight: 1.8,
              maxWidth: 490, marginBottom: 40,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            SWMS brings attendance tracking, task management, and role-based workforce control into one seamless enterprise platform.
          </motion.p>

          {/* Buttons */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}
          >
            <GradBtn onClick={() => navigate('/register')} variant="primary">
              Get Started Free →
            </GradBtn>
            <GradBtn onClick={() => scrollTo('features')} variant="ghost">
              Explore Features
            </GradBtn>
          </motion.div>

          {/* Trust row */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            style={{ display: 'flex', gap: 28, marginTop: 44, flexWrap: 'wrap' }}
          >
            {[['🛡️', 'Role-Based Access'], ['📊', 'Real-Time Reports'], ['🔒', 'JWT Secured']].map(([icon, text]) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>{text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── RIGHT: Spiral + Floating cards ───────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={heroVisible ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'relative', height: 520, minHeight: 400 }}
        >
          {/* Three.js spiral fills the container */}
          <SpiralAnimation />

          {/* Attendance card */}
          <GlassCard
            title="Attendance Overview" dotColor="#4ade80"
            floatClass=""
            style={{ position: 'absolute', top: 0, left: 0, right: '8%', zIndex: 3, animation: 'float1 4s ease-in-out infinite' }}
          >
            <div style={{ display: 'flex', gap: 7, alignItems: 'flex-end', height: 72 }}>
              {bars.map(b => (
                <div key={b.l} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: '100%', height: `${b.p * 0.65}px`, background: b.c, borderRadius: 3, opacity: 0.9 }} />
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, fontFamily: 'Inter, sans-serif' }}>{b.l}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, color: '#4ade80', fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>↑ 94% avg. attendance this week</div>
          </GlassCard>

          {/* Tasks card */}
          <GlassCard
            title="Active Tasks" dotColor="#818cf8"
            floatClass=""
            style={{ position: 'absolute', bottom: 30, right: 0, left: '10%', zIndex: 3, animation: 'float2 4.5s ease-in-out infinite' }}
          >
            {tasks.map(t => (
              <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <span style={{ fontSize: 12 }}>{t.done ? '✅' : '🔄'}</span>
                <span style={{
                  color: t.done ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.85)',
                  textDecoration: t.done ? 'line-through' : 'none',
                  fontSize: 13, flex: 1, fontFamily: 'Inter, sans-serif',
                }}>{t.name}</span>
              </div>
            ))}
          </GlassCard>

          {/* Members card */}
          <GlassCard
            title="Team Members" dotColor="#fb923c"
            floatClass=""
            style={{ position: 'absolute', top: '32%', right: '-4%', width: '54%', zIndex: 4, animation: 'float3 5s ease-in-out infinite' }}
          >
            {members.map(m => (
              <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', fontFamily: 'Inter, sans-serif' }}>
                  {m.name[0]}
                </div>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>{m.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: 11, fontFamily: 'Inter, sans-serif' }}>{m.role}</div>
                </div>
                <div style={{ marginLeft: 'auto', background: 'rgba(74,222,128,0.15)', color: '#4ade80', borderRadius: 20, padding: '2px 9px', fontSize: 10, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>Active</div>
              </div>
            ))}
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
