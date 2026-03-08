/**
 * Home.js — Premium SaaS Landing Page for SWMS
 *
 * Stack: React + Framer Motion + Three.js + tsParticles
 * Design: Linear / Vercel / Notion inspired dark SaaS aesthetic
 *
 * Components:
 *  LoadingScreen    – Fade-in/out splash screen with pulsing logo
 *  Navbar           – Glass blur on scroll, hamburger mobile menu
 *  HeroSection      – Particles (tsParticles) + Spiral (Three.js) + floating cards
 *  FeatureSection   – Scroll-triggered stagger cards
 *  StatsSection     – Count-up stats with gradient accents
 *  HowItWorksSection– Step timeline
 *  CTABanner        – Gradient call-to-action
 *  Footer           – Dark minimal footer
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import LoadingScreen      from '../components/landing/LoadingScreen';
import Navbar             from '../components/landing/Navbar';
import HeroSection        from '../components/landing/HeroSection';
import FeatureSection     from '../components/landing/FeatureSection';
import StatsSection       from '../components/landing/StatsSection';
import HowItWorksSection  from '../components/landing/HowItWorksSection';
import Footer             from '../components/landing/Footer';

/* ── CTA Banner ─────────────────────────────────────────────────── */
function CTABanner() {
  const navigate = useNavigate();
  return (
    <section style={{
      padding: '90px 5%',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 8s ease infinite',
      textAlign: 'center', position: 'relative', overflow: 'hidden',
    }}>
      {/* Glows */}
      <div style={{ position: 'absolute', top: '20%', left: '30%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '25%', width: 250, height: 250, borderRadius: '50%', background: 'rgba(236,72,153,0.15)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto' }}>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(28px, 4vw, 52px)',
            fontWeight: 800, color: 'white',
            letterSpacing: '-1.5px', lineHeight: 1.15, marginBottom: 18,
          }}
        >
          Ready to transform how your team works?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ color: 'rgba(255,255,255,0.6)', fontSize: 17, marginBottom: 42, fontFamily: 'Inter, sans-serif' }}
        >
          Join SWMS today — no credit card required.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '16px 44px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
              color: 'white', fontWeight: 700, fontSize: 16,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              boxShadow: '0 0 32px rgba(99,102,241,0.5), 0 8px 24px rgba(0,0,0,0.3)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 0 48px rgba(99,102,241,0.65), 0 12px 36px rgba(0,0,0,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 0 32px rgba(99,102,241,0.5), 0 8px 24px rgba(0,0,0,0.3)'; }}
          >
            Start for Free →
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '16px 44px', borderRadius: 10,
              border: '1.5px solid rgba(255,255,255,0.22)',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: 16,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; }}
          >
            I already have an account
          </button>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
export default function Home() {
  const [loading, setLoading]       = useState(true);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    /* Show loading for 1.5 s, then fade out and reveal hero */
    const t1 = setTimeout(() => setLoading(false), 1500);
    const t2 = setTimeout(() => setHeroVisible(true), 2000); // after fade out
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#0f172a', overflowX: 'hidden' }}>

      {/* ── Loading screen ────────────────────────────────────────── */}
      <LoadingScreen isLoading={loading} />

      {/* ── Page content (fades in after loading) ─────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        <Navbar />
        <HeroSection heroVisible={heroVisible} />
        <FeatureSection />
        <StatsSection />
        <HowItWorksSection />
        <CTABanner />
        <Footer />
      </motion.div>
    </div>
  );
}
