import { motion, AnimatePresence } from 'framer-motion';

const SWMSLogo = ({ size = 52 }) => (
  <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
    <defs>
      <linearGradient id="lgLoad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
    </defs>
    <rect width="52" height="52" rx="14" fill="url(#lgLoad)" />
    {/* Stylized S path */}
    <path
      d="M32 17 C32 17 20 17 20 22 C20 27 32 25 32 30 C32 35 20 35 20 35"
      stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"
    />
  </svg>
);

export default function LoadingScreen({ isLoading }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.7, ease: [0.43, 0.13, 0.23, 0.96] }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          {/* Pulse ring behind logo */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div
              animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
              style={{
                position: 'absolute', width: 90, height: 90, borderRadius: '50%',
                border: '2px solid rgba(99,102,241,0.5)',
              }}
            />
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ display: 'flex', alignItems: 'center', gap: 14 }}
            >
              <SWMSLogo size={52} />
              <span style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 34, fontWeight: 800, color: 'white', letterSpacing: '-1px',
              }}>SWMS</span>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.45, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            style={{
              fontFamily: 'Inter, sans-serif', fontSize: 14,
              color: 'rgba(255,255,255,0.45)', marginTop: 20, letterSpacing: '0.5px',
            }}
          >
            Smart Workforce Management System
          </motion.p>

          {/* Progress bar */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
            background: 'rgba(255,255,255,0.06)',
          }}>
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1] }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)',
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
