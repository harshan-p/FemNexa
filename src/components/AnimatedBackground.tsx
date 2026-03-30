import { motion } from 'framer-motion';

// Simplified — no emotion mirror, just ambient colorful background
export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Warm ambient orbs */}
      <motion.div
        className="absolute rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(350 55% 72% / 0.12), transparent)',
          width: 280, height: 280, top: '-8%', right: '-10%',
        }}
        animate={{ x: [0, 20, 0], y: [0, -15, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(260 30% 75% / 0.1), transparent)',
          width: 220, height: 220, bottom: '10%', left: '-8%',
        }}
        animate={{ x: [0, -15, 0], y: [0, 20, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(150 30% 68% / 0.08), transparent)',
          width: 180, height: 180, top: '40%', right: '20%',
        }}
        animate={{ x: [0, 10, 0], y: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />
    </div>
  );
}
