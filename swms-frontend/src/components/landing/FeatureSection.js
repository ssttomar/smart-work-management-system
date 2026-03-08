import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const FEATURES = [
  { icon: '🛡️', title: 'Role-Based Access Control', desc: 'Admin, Manager, and Employee roles each get tailored dashboards and permissions — no accidental privilege escalation.' },
  { icon: '🕐', title: 'Attendance Tracking',       desc: 'Log and review daily attendance records in real time. Managers instantly spot patterns and take action.' },
  { icon: '✅', title: 'Task Management',            desc: 'Create, assign, and track tasks with live status updates. Keep every project milestone visible across the team.' },
  { icon: '📊', title: 'Live Dashboard Analytics',  desc: 'At-a-glance KPIs for attendance rates, task completion, and headcount — updated without page refreshes.' },
  { icon: '🔒', title: 'Secure JWT Authentication', desc: 'Every API call is signed with a JSON Web Token. Sessions are stateless, short-lived, and role-scoped.' },
  { icon: '⚡', title: 'Spring Boot API',            desc: 'The backend runs on Spring Boot 3 with JPA, delivering low-latency responses for any team size.' },
];

function FeatureCard({ icon, title, desc, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, boxShadow: '0 20px 56px rgba(99,102,241,0.18)' }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 18, padding: '32px 28px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
        transition: 'box-shadow 0.3s',
        cursor: 'default',
      }}
    >
      <div style={{
        width: 54, height: 54, borderRadius: 14,
        background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(168,85,247,0.25))',
        border: '1px solid rgba(99,102,241,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, marginBottom: 20,
      }}>{icon}</div>
      <h3 style={{
        fontSize: 17, fontWeight: 700,
        color: 'white', marginBottom: 10,
        fontFamily: 'Space Grotesk, sans-serif',
      }}>{title}</h3>
      <p style={{ color: 'rgba(255,255,255,0.52)', lineHeight: 1.75, fontSize: 14.5, fontFamily: 'Inter, sans-serif' }}>{desc}</p>
    </motion.div>
  );
}

export default function FeatureSection() {
  const headRef = useRef(null);
  const headInView = useInView(headRef, { once: true, margin: '-80px' });

  return (
    <section
      id="features"
      style={{
        padding: '110px 5%',
        background: 'linear-gradient(180deg, #0f172a 0%, #0d1526 100%)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* subtle grid pattern */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, opacity: 0.04,
        backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      <div style={{ maxWidth: 1160, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Section header */}
        <motion.div
          ref={headRef}
          initial={{ opacity: 0, y: 28 }}
          animate={headInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 72 }}
        >
          <span style={{
            color: '#818cf8', fontWeight: 700, fontSize: 12,
            letterSpacing: '2.5px', textTransform: 'uppercase',
            fontFamily: 'Inter, sans-serif',
          }}>Features</span>
          <h2 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(28px, 3.5vw, 50px)',
            fontWeight: 800, color: 'white',
            marginTop: 12, letterSpacing: '-1.5px', lineHeight: 1.15,
          }}>
            Everything your team needs
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.5)', fontSize: 17, maxWidth: 520,
            margin: '18px auto 0', lineHeight: 1.8,
            fontFamily: 'Inter, sans-serif',
          }}>
            From clock-in to completion, SWMS handles the operational layer so your team stays focused on what matters.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 24,
        }}>
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} {...f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
