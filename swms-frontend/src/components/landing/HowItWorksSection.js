import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  { n: '01', icon: '📝', title: 'Create your account',           desc: 'Register with your work email. The first user auto-receives Admin privileges to bootstrap the system.' },
  { n: '02', icon: '🏢', title: 'Add your team',                desc: 'Admins invite Managers and Employees directly from the Users panel and assign appropriate roles.' },
  { n: '03', icon: '📋', title: 'Assign tasks & track attendance', desc: 'Create tasks, set deadlines, and let employees log their attendance from their personal dashboards.' },
  { n: '04', icon: '📈', title: 'Monitor and improve',           desc: 'Use the analytics dashboard to spot trends, resolve bottlenecks, and celebrate wins.' },
];

function StepRow({ n, icon, title, desc, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -28 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.12 }}
      style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 36 }}
    >
      <div style={{
        minWidth: 52, height: 52, borderRadius: 14,
        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, boxShadow: '0 0 20px rgba(99,102,241,0.4)',
        flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ color: '#6366f1', fontSize: 11, fontWeight: 800, letterSpacing: '2px', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>{n}</div>
        <h4 style={{ color: 'white', fontWeight: 700, fontSize: 17, marginBottom: 8, fontFamily: 'Space Grotesk, sans-serif' }}>{title}</h4>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14.5, lineHeight: 1.75, fontFamily: 'Inter, sans-serif' }}>{desc}</p>
      </div>
    </motion.div>
  );
}

export default function HowItWorksSection() {
  const navigate = useNavigate();
  const headRef = useRef(null);
  const headInView = useInView(headRef, { once: true, margin: '-80px' });
  const cardRef = useRef(null);
  const cardInView = useInView(cardRef, { once: true, margin: '-80px' });

  return (
    <section
      id="howitworks"
      style={{
        padding: '110px 5%',
        background: 'linear-gradient(180deg, #0d1526 0%, #0f172a 100%)',
        position: 'relative',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* header */}
        <motion.div
          ref={headRef}
          initial={{ opacity: 0, y: 24 }}
          animate={headInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 72 }}
        >
          <span style={{ color: '#a5b4fc', fontWeight: 700, fontSize: 12, letterSpacing: '2.5px', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>How it Works</span>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(28px, 3.5vw, 50px)', fontWeight: 800, color: 'white', marginTop: 12, letterSpacing: '-1.5px' }}>
            Up and running in minutes
          </h2>
        </motion.div>

        {/* two-column */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 60, alignItems: 'start',
        }}>
          {/* Steps */}
          <div>
            {STEPS.map((s, i) => <StepRow key={s.n} {...s} index={i} />)}
          </div>

          {/* Visual panel */}
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, x: 40 }}
            animate={cardInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.12) 100%)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 24, padding: 40,
              position: 'sticky', top: 90, overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', filter: 'blur(50px)', pointerEvents: 'none' }} />

            {STEPS.map((s, i) => (
              <div key={s.n} style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: i < 3 ? 28 : 0 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 13,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}>{s.icon}</div>
                <div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 15, fontFamily: 'Space Grotesk, sans-serif' }}>{s.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>Step {s.n}</div>
                </div>
                {i < 3 && (
                  <div style={{ position: 'absolute', left: 60, marginTop: 56, width: 2, height: 20, background: 'rgba(99,102,241,0.3)' }} />
                )}
              </div>
            ))}

            {/* CTA mini */}
            <div style={{ marginTop: 36, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                onClick={() => navigate('/register')}
                style={{
                  width: '100%', padding: '14px', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                  color: 'white', fontWeight: 700, fontSize: 15,
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  boxShadow: '0 0 28px rgba(99,102,241,0.4)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 40px rgba(99,102,241,0.6)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 28px rgba(99,102,241,0.4)'; e.currentTarget.style.transform = 'none'; }}
              >
                Start for Free →
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
