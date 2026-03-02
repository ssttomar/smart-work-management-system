/**
 * Home.js — Public interactive landing page for SWMS.
 *
 * Inspired by modern SaaS landing pages:
 *   - Sticky navbar with smooth scroll links + auth CTAs
 *   - Animated hero section (headline + feature preview cards)
 *   - Features grid with icon cards
 *   - Animated stats counter section
 *   - How-it-works timeline
 *   - Footer
 */
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/* ─── colour palette ──────────────────────────────────────────────── */
const C = {
  navy:   '#0f3460',
  deep:   '#0a1f44',
  accent: '#e94560',
  purple: '#533483',
  light:  '#f8f9ff',
  muted:  '#6b7280',
  white:  '#ffffff',
  card1:  '#1e3a5f',
  card2:  '#16213e',
};

/* ─── tiny hook: count up when element enters viewport ───────────── */
function useCountUp(target, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const steps = 60;
          const inc = target / steps;
          let cur = 0;
          const id = setInterval(() => {
            cur += inc;
            if (cur >= target) { setCount(target); clearInterval(id); }
            else setCount(Math.floor(cur));
          }, duration / steps);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return [count, ref];
}

/* ─── stat card ──────────────────────────────────────────────────── */
function StatCard({ value, suffix = '', label, color }) {
  const [count, ref] = useCountUp(value);
  return (
    <div ref={ref} style={{
      background: color,
      borderRadius: 16,
      padding: '36px 32px',
      textAlign: 'center',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      transition: 'transform 0.3s',
    }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ fontSize: 52, fontWeight: 900, color: C.white, lineHeight: 1 }}>
        {count}{suffix}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.75)', marginTop: 10, fontSize: 15, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

/* ─── feature card ───────────────────────────────────────────────── */
function FeatureCard({ icon, title, desc, delay }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      background: C.white,
      borderRadius: 16,
      padding: '32px 28px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
      border: '1px solid #e8ecf4',
      transition: `opacity 0.6s ${delay}ms, transform 0.6s ${delay}ms, box-shadow 0.3s`,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(40px)',
      cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(15,52,96,0.15)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: `linear-gradient(135deg, ${C.navy}, ${C.purple})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 26, marginBottom: 20,
      }}>{icon}</div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: C.deep, marginBottom: 10 }}>{title}</h3>
      <p style={{ color: C.muted, lineHeight: 1.7, fontSize: 15 }}>{desc}</p>
    </div>
  );
}

/* ─── mock dashboard preview card ───────────────────────────────── */
function PreviewCard({ title, children, accentColor, style }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.08)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: 16,
      padding: '20px 22px',
      ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: accentColor }} />
        <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: 13 }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

/* ─── step card for "How it works" ──────────────────────────────── */
function StepCard({ number, title, desc }) {
  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      <div style={{
        minWidth: 48, height: 48, borderRadius: '50%',
        background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: C.white, fontWeight: 800, fontSize: 18,
      }}>{number}</div>
      <div>
        <h4 style={{ fontWeight: 700, color: C.deep, fontSize: 17, marginBottom: 6 }}>{title}</h4>
        <p style={{ color: C.muted, lineHeight: 1.7, fontSize: 14 }}>{desc}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
export default function Home() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    // trigger hero animation
    const t = setTimeout(() => setHeroVisible(true), 100);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => { clearTimeout(t); window.removeEventListener('scroll', onScroll); };
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  /* ── mock bar data for preview card ───────────────────────────── */
  const bars = [
    { label: 'Mon', pct: 88, color: '#4ade80' },
    { label: 'Tue', pct: 95, color: '#4ade80' },
    { label: 'Wed', pct: 70, color: '#facc15' },
    { label: 'Thu', pct: 100, color: '#4ade80' },
    { label: 'Fri', pct: 82, color: '#4ade80' },
  ];

  const tasks = [
    { name: 'Sprint planning', status: '✅', done: true },
    { name: 'UI review', status: '🔄', done: false },
    { name: 'Deploy v2.1', status: '⏳', done: false },
    { name: 'Team briefing', status: '✅', done: true },
  ];

  const users = [
    { name: 'Alex Kim', role: 'Admin', avatar: '👤', color: '#818cf8' },
    { name: 'Maria G.', role: 'Manager', avatar: '👤', color: '#34d399' },
    { name: 'James T.', role: 'Employee', avatar: '👤', color: '#fb923c' },
  ];

  /* ──────────────────────────────────────────────────────────────── */
  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", overflowX: 'hidden' }}>

      {/* ── NAVBAR ─────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? 'rgba(255,255,255,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.08)' : 'none',
        transition: 'all 0.3s',
        padding: '0 5%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 68,
      }}>
        {/* logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg, ${C.navy}, ${C.accent})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: C.white, fontWeight: 900, fontSize: 16,
          }}>S</div>
          <span style={{ fontWeight: 800, fontSize: 20, color: scrolled ? C.deep : C.white, letterSpacing: '-0.5px' }}>SWMS</span>
        </div>

        {/* nav links */}
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {[['Features', 'features'], ['How It Works', 'howitworks'], ['Stats', 'stats']].map(([label, id]) => (
            <button key={id} onClick={() => scrollTo(id)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 15,
              color: scrolled ? C.muted : 'rgba(255,255,255,0.85)',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = scrolled ? C.navy : C.white}
              onMouseLeave={e => e.currentTarget.style.color = scrolled ? C.muted : 'rgba(255,255,255,0.85)'}
            >{label}</button>
          ))}
        </div>

        {/* auth buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/login')} style={{
            padding: '9px 22px', borderRadius: 8, border: `2px solid ${scrolled ? C.navy : 'rgba(255,255,255,0.6)'}`,
            background: 'transparent', color: scrolled ? C.navy : C.white,
            fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = C.navy; e.currentTarget.style.color = C.white; e.currentTarget.style.borderColor = C.navy; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = scrolled ? C.navy : C.white; e.currentTarget.style.borderColor = scrolled ? C.navy : 'rgba(255,255,255,0.6)'; }}
          >Log In</button>
          <button onClick={() => navigate('/register')} style={{
            padding: '9px 22px', borderRadius: 8, border: 'none',
            background: C.accent, color: C.white,
            fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#c9374e'}
            onMouseLeave={e => e.currentTarget.style.background = C.accent}
          >Get Started</button>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${C.deep} 0%, ${C.navy} 50%, ${C.purple} 100%)`,
        display: 'flex', alignItems: 'center',
        padding: '100px 5% 60px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* background blobs */}
        <div style={{ position: 'absolute', top: '10%', right: '8%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(233,69,96,0.12)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '5%', left: '20%', width: 350, height: 350, borderRadius: '50%', background: 'rgba(83,52,131,0.25)', filter: 'blur(80px)', pointerEvents: 'none' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, maxWidth: 1200, margin: '0 auto', width: '100%', alignItems: 'center' }}>

          {/* LEFT — headline */}
          <div style={{
            transition: 'opacity 0.8s, transform 0.8s',
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateX(0)' : 'translateX(-40px)',
          }}>
            <div style={{
              display: 'inline-block', background: 'rgba(233,69,96,0.2)', border: '1px solid rgba(233,69,96,0.4)',
              borderRadius: 20, padding: '6px 16px', marginBottom: 24,
              color: '#ff8096', fontWeight: 600, fontSize: 13, letterSpacing: '0.5px',
            }}>✦ Smart Workforce Management</div>

            <h1 style={{
              fontSize: 'clamp(36px, 4.5vw, 64px)',
              fontWeight: 900, color: C.white, lineHeight: 1.1,
              marginBottom: 24, letterSpacing: '-1.5px',
            }}>
              Manage your team<br />
              <span style={{ color: C.accent }}>smarter,</span> not harder.
            </h1>

            <p style={{
              color: 'rgba(255,255,255,0.70)', fontSize: 18, lineHeight: 1.8,
              maxWidth: 480, marginBottom: 40,
            }}>
              SWMS brings attendance tracking, task management, and role-based team control into one seamless platform — built for modern workplaces.
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/register')} style={{
                padding: '16px 36px', borderRadius: 10, border: 'none',
                background: C.accent, color: C.white, fontWeight: 700, fontSize: 16,
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: '0 8px 30px rgba(233,69,96,0.4)',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(233,69,96,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(233,69,96,0.4)'; }}
              >Get Started Free →</button>

              <button onClick={() => scrollTo('features')} style={{
                padding: '16px 36px', borderRadius: 10,
                border: '2px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.08)', color: C.white,
                fontWeight: 600, fontSize: 16, cursor: 'pointer', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.16)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
              >Explore Features</button>
            </div>

            {/* trust row */}
            <div style={{ display: 'flex', gap: 28, marginTop: 48, alignItems: 'center' }}>
              {[['👥', 'Role-Based Access'], ['📊', 'Real-Time Reports'], ['🔒', 'Secure JWT Auth']].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 500 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — floating preview cards */}
          <div style={{
            position: 'relative', height: 480,
            transition: 'opacity 0.8s 0.25s, transform 0.8s 0.25s',
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateX(0)' : 'translateX(40px)',
          }}>
            {/* Attendance card */}
            <PreviewCard title="Attendance Overview" accentColor="#4ade80" style={{
              position: 'absolute', top: 0, left: 0, right: '10%',
              animation: 'float1 4s ease-in-out infinite',
            }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 80 }}>
                {bars.map(b => (
                  <div key={b.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: '100%', height: `${b.pct * 0.7}px`,
                      background: b.color, borderRadius: 4, opacity: 0.85,
                    }} />
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10 }}>{b.label}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, color: '#4ade80', fontSize: 12, fontWeight: 600 }}>↑ 94% avg. attendance this week</div>
            </PreviewCard>

            {/* Tasks card */}
            <PreviewCard title="Active Tasks" accentColor="#818cf8" style={{
              position: 'absolute', bottom: 40, right: 0, left: '12%',
              animation: 'float2 4.5s ease-in-out infinite',
            }}>
              {tasks.map(t => (
                <div key={t.name} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <span style={{ fontSize: 14 }}>{t.status}</span>
                  <span style={{
                    color: t.done ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.85)',
                    textDecoration: t.done ? 'line-through' : 'none',
                    fontSize: 13, flex: 1,
                  }}>{t.name}</span>
                </div>
              ))}
            </PreviewCard>

            {/* Users card */}
            <PreviewCard title="Team Members" accentColor="#fb923c" style={{
              position: 'absolute', top: '35%', right: '-2%', width: '55%',
              animation: 'float3 5s ease-in-out infinite',
            }}>
              {users.map(u => (
                <div key={u.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: u.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{u.avatar}</div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 600 }}>{u.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>{u.role}</div>
                  </div>
                  <div style={{
                    marginLeft: 'auto', background: 'rgba(74,222,128,0.2)',
                    color: '#4ade80', borderRadius: 20, padding: '2px 10px', fontSize: 10, fontWeight: 600,
                  }}>Active</div>
                </div>
              ))}
            </PreviewCard>
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '100px 5%', background: C.light }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{ color: C.accent, fontWeight: 700, fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase' }}>Features</span>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 900, color: C.deep, marginTop: 12, letterSpacing: '-1px' }}>
              Everything your team needs
            </h2>
            <p style={{ color: C.muted, fontSize: 17, maxWidth: 520, margin: '16px auto 0', lineHeight: 1.8 }}>
              From clock-in to completion, SWMS handles the operational layer so your team stays focused on what matters.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 28 }}>
            <FeatureCard delay={0}   icon="👥" title="Role-Based Access Control" desc="Admin, Manager, and Employee roles each get tailored dashboards and permissions — no accidental privilege escalation." />
            <FeatureCard delay={100} icon="🕐" title="Attendance Tracking" desc="Log and review daily attendance records in real time. Managers can instantly spot patterns and take action." />
            <FeatureCard delay={200} icon="✅" title="Task Management" desc="Create, assign, and track tasks with live status updates. Keep every project milestone visible across the whole team." />
            <FeatureCard delay={300} icon="📊" title="Live Dashboard Analytics" desc="At-a-glance KPIs for attendance rates, task completion, and team headcount — updated without page refreshes." />
            <FeatureCard delay={400} icon="🔒" title="Secure JWT Authentication" desc="Every API call is signed with a JSON Web Token. Sessions are stateless, short-lived, and role-scoped." />
            <FeatureCard delay={500} icon="⚡" title="Blazing-Fast Spring Boot API" desc="The backend runs on Spring Boot 3 with a JPA-backed database, delivering low-latency responses for any team size." />
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────────────── */}
      <section id="stats" style={{
        padding: '100px 5%',
        background: `linear-gradient(135deg, ${C.deep}, ${C.navy})`,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{ color: C.accent, fontWeight: 700, fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase' }}>By the Numbers</span>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 900, color: C.white, marginTop: 12, letterSpacing: '-1px' }}>
              Built for scale
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
            <StatCard value={500}  suffix="+"  label="Teams onboarded"      color="rgba(255,255,255,0.08)" />
            <StatCard value={98}   suffix="%"  label="Uptime guarantee"     color="rgba(233,69,96,0.25)"  />
            <StatCard value={10}   suffix="k+" label="Tasks tracked daily"  color="rgba(255,255,255,0.08)" />
            <StatCard value={3}    suffix=" roles" label="Distinct access levels" color="rgba(83,52,131,0.45)"  />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────── */}
      <section id="howitworks" style={{ padding: '100px 5%', background: C.white }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          {/* left column */}
          <div>
            <span style={{ color: C.accent, fontWeight: 700, fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase' }}>How It Works</span>
            <h2 style={{ fontSize: 'clamp(26px, 3vw, 42px)', fontWeight: 900, color: C.deep, marginTop: 12, marginBottom: 40, letterSpacing: '-1px' }}>
              Up and running in minutes
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <StepCard number={1} title="Create your account" desc="Register with your work email. The first user auto-receives Admin privileges to bootstrap the system." />
              <StepCard number={2} title="Add your team" desc="Admins invite Managers and Employees directly from the Users panel and assign appropriate roles." />
              <StepCard number={3} title="Assign tasks & track attendance" desc="Create tasks, set deadlines, and let employees log their attendance — all from their personal dashboards." />
              <StepCard number={4} title="Monitor and improve" desc="Use the analytics dashboard to spot trends, resolve bottlenecks, and celebrate wins." />
            </div>
          </div>

          {/* right column — visual timeline */}
          <div style={{
            background: `linear-gradient(135deg, ${C.deep}, ${C.purple})`,
            borderRadius: 24, padding: 40, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(233,69,96,0.15)', filter: 'blur(40px)' }} />
            {[
              { icon: '📝', step: 'Register', sub: 'Create your free account' },
              { icon: '🏢', step: 'Setup Team', sub: 'Add roles & members' },
              { icon: '📋', step: 'Assign Work', sub: 'Tasks & attendance go live' },
              { icon: '📈', step: 'Grow', sub: 'Data-driven insights' },
            ].map((item, i) => (
              <div key={item.step} style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: i < 3 ? 28 : 0 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: 'rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  flexShrink: 0,
                }}>{item.icon}</div>
                <div>
                  <div style={{ color: C.white, fontWeight: 700, fontSize: 15 }}>{item.step}</div>
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>{item.sub}</div>
                </div>
                {i < 3 && (
                  <div style={{ position: 'absolute', left: 64, marginTop: 56, width: 2, height: 24, background: 'rgba(255,255,255,0.15)' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION BANNER ──────────────────────────────────── */}
      <section style={{
        padding: '80px 5%',
        background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 50px)', fontWeight: 900, color: C.white, letterSpacing: '-1px', marginBottom: 16 }}>
          Ready to transform how your team works?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 17, marginBottom: 40 }}>
          Join SWMS today — no credit card required.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/register')} style={{
            padding: '16px 40px', borderRadius: 10, border: 'none',
            background: C.white, color: C.accent, fontWeight: 800, fontSize: 16,
            cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >Start for Free →</button>
          <button onClick={() => navigate('/login')} style={{
            padding: '16px 40px', borderRadius: 10,
            border: '2px solid rgba(255,255,255,0.5)',
            background: 'transparent', color: C.white, fontWeight: 700, fontSize: 16,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.white}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'}
          >I already have an account</button>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer style={{ background: C.deep, padding: '48px 5%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `linear-gradient(135deg, ${C.navy}, ${C.accent})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.white, fontWeight: 900, fontSize: 14,
            }}>S</div>
            <span style={{ fontWeight: 800, color: C.white, fontSize: 18 }}>SWMS</span>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginLeft: 4 }}>Smart Workforce Management System</span>
          </div>

          <div style={{ display: 'flex', gap: 28 }}>
            {['Features', 'How It Works', 'Login', 'Register'].map(item => (
              <button key={item} onClick={() => {
                if (item === 'Login') navigate('/login');
                else if (item === 'Register') navigate('/register');
                else scrollTo(item.toLowerCase().replace(' ', ''));
              }} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.45)', fontSize: 14, fontWeight: 500,
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = C.white}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
              >{item}</button>
            ))}
          </div>

          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>© 2026 SWMS. All rights reserved.</span>
        </div>
      </footer>

      {/* ── floating card animations ────────────────────────────────── */}
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50%       { transform: translateY(-14px) rotate(0deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(1deg); }
          50%       { transform: translateY(-10px) rotate(0deg); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-18px); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
