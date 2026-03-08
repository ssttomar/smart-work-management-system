import { useCallback, useEffect, useState, useRef } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

let engineInitialized = false;
let enginePromise = null;

export default function ParticleBackground() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    if (engineInitialized) {
      setInit(true);
      return;
    }
    if (!enginePromise) {
      enginePromise = initParticlesEngine(async (engine) => {
        await loadSlim(engine);
      });
    }
    enginePromise.then(() => {
      engineInitialized = true;
      setInit(true);
    });
  }, []);

  const particleOptions = {
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: { enable: true, mode: 'grab' },
      },
      modes: {
        grab: { distance: 120, links: { opacity: 0.3 } },
      },
    },
    particles: {
      color: {
        value: ['#6366f1', '#a855f7', '#ec4899', '#22d3ee'],
      },
      links: {
        color: '#6366f1',
        distance: 140,
        enable: true,
        opacity: 0.12,
        width: 1,
      },
      move: {
        enable: true,
        speed: 0.5,
        direction: 'none',
        random: true,
        straight: false,
        outModes: { default: 'bounce' },
      },
      number: {
        value: 70,
        density: { enable: true, area: 900 },
      },
      opacity: {
        value: { min: 0.15, max: 0.35 },
        animation: { enable: true, speed: 0.8, sync: false },
      },
      shape: { type: 'circle' },
      size: { value: { min: 1, max: 2.5 } },
    },
    detectRetina: true,
    background: { color: 'transparent' },
  };

  if (!init) return null;

  return (
    <Particles
      id="swms-particles"
      options={particleOptions}
      style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
      }}
    />
  );
}
