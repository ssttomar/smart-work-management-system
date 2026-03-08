import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

function useCountUp(target, duration = 1800, active) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!active || started.current) return;
    started.current = true;
    const steps = 60;
    const inc = target / steps;
    let cur = 0;
    const id = setInterval(() => {
      cur += inc;
      if (cur >= target) { setCount(target); clearInterval(id); }
      else setCount(Math.floor(cur));
    }, duration / steps);
    return () => clearInterval(id);
  }, [active, target, duration]);

  return count;
}

function StatCard({ value, suffix, label, accent, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const count = useCountUp(value, 1600, inView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.1 }}
      whileHover={{ y: -6, scale: 1.02 }}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${accent}33`,
        borderRadius: 18, padding: '40px 32px',
        textAlign: 'center',
        boxShadow: `0 0 40px ${accent}14, 0 8px 32px rgba(0,0,0,0.3)`,
        position: 'relative', overflow: 'hidden',
        transition: 'box-shadow 0.3s',
      }}
    >
      {/* Glow blob */}
      <div style={{
        position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)',
        width: 120, height: 120, borderRadius: '50%',
        background: accent, filter: 'blur(50px)', opacity: 0.15, pointerEvents: 'none',
      }} />
      <div style={{
        fontSize: 54, fontWeight: 900, color: 'white', lineHeight: 1,
        fontFamily: 'Space Grotesk, sans-serif',
        background: `linear-gradient(135deg, white, ${accent})`,
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        {count}{suffix}
      </div>
      <div style={{
        color: 'rgba(255,255,255,0.5)', marginTop: 12, fontSize: 15, fontWeight: 500,
        fontFamily: 'Inter, sans-serif',
      }}>{label}</div>
    </motion.div>
  );
}

const STATS = [
  { value: 500,  suffix: '+',     label: 'Teams onboarded',       accent: '#6366f1' },
  { value: 98,   suffix: '%',     label: 'Uptime guarantee',      accent: '#22d3ee' },
  { value: 10,   suffix: 'k+',   label: 'Tasks tracked daily',   accent: '#a855f7' },
  { value: 3,    suffix: ' roles', label: 'Distinct access levels', accent: '#ec4899' },
];

export default function StatsSection() {
  const headRef = useRef(null);
  const headInView = useInView(headRef, { once: true, margin: '-80px' });

  return (
    <section
      id="stats"
      style={{
        padding: '110px 5%',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Decorative orbs */}
      <div style={{ position: 'absolute', top: '20%', left: '-8%', width: 360, height: 360, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '-5%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(236,72,153,0.1)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div
          ref={headRef}
          initial={{ opacity: 0, y: 28 }}
          animate={headInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 72 }}
        >
          <span style={{
            color: '#a5b4fc', fontWeight: 700, fontSize: 12,
            letterSpacing: '2.5px', textTransform: 'uppercase',
            fontFamily: 'Inter, sans-serif',
          }}>By the Numbers</span>
          <h2 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(28px, 3.5vw, 50px)',
            fontWeight: 800, color: 'white',
            marginTop: 12, letterSpacing: '-1.5px',
          }}>Built for scale</h2>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 24,
        }}>
          {STATS.map((s, i) => (
            <StatCard key={s.label} {...s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
