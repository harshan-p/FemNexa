import { motion } from 'framer-motion';

export default function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1a0520, #0d1b2a, #1b2838, #0a192f)' }}
    >
      {/* Aurora waves */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div className="absolute w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, #FF69B450, #E88B9A30, transparent)', top: '-20%', right: '-15%' }}
          animate={{ scale: [1, 1.4, 1], x: [0, -50, 0], y: [0, 30, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div className="absolute w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, #B8A9D950, #9D8BC530, transparent)', bottom: '-10%', left: '-15%' }}
          animate={{ scale: [1, 1.3, 1], x: [0, 40, 0], y: [0, -40, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div className="absolute w-[350px] h-[350px] rounded-full"
          style={{ background: 'radial-gradient(circle, #FFD70040, #F4C19F30, transparent)', top: '30%', left: '40%' }}
          animate={{ scale: [1, 1.5, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div className="absolute w-[300px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(circle, #9BC9A840, #7FB88E25, transparent)', top: '60%', right: '20%' }}
          animate={{ scale: [1, 1.2, 1], y: [0, -60, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div key={i} className="absolute rounded-full"
            style={{
              width: 2 + Math.random() * 4, height: 2 + Math.random() * 4,
              left: `${10 + Math.random() * 80}%`, top: `${10 + Math.random() * 80}%`,
              background: ['#FFD700', '#FF69B4', '#9BC9A8', '#B8A9D9', '#E88B9A'][i % 5],
              boxShadow: `0 0 8px ${['#FFD70060', '#FF69B460', '#9BC9A860', '#B8A9D960', '#E88B9A60'][i % 5]}`,
            }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0], y: [0, -(20 + Math.random() * 40), 0] }}
            transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 4 }}
          />
        ))}
      </div>

      {/* Logo */}
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 15, delay: 0.3 }}
        className="relative z-10 mb-8"
      >
        <motion.div
          className="w-28 h-28 rounded-[2rem] flex items-center justify-center shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #E88B9A, #B8A9D9, #9BC9A8)', boxShadow: '0 0 60px #E88B9A40, 0 0 120px #B8A9D920' }}
          animate={{ boxShadow: ['0 0 60px #E88B9A40, 0 0 120px #B8A9D920', '0 0 80px #B8A9D940, 0 0 150px #E88B9A20', '0 0 60px #E88B9A40, 0 0 120px #B8A9D920'] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <span className="text-6xl">✿</span>
        </motion.div>
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }}
        className="text-4xl font-display font-bold relative z-10" style={{ color: '#fff', textShadow: '0 0 40px #E88B9A40' }}>
        FemNexa
      </motion.h1>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
        className="text-sm relative z-10 mt-3 tracking-widest uppercase" style={{ color: '#B8A9D9' }}>
        Your Caring Companion
      </motion.p>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
        className="text-xs relative z-10 mt-2 italic" style={{ color: '#9BC9A860' }}>
        "I see you. I hear you. I'm here."
      </motion.p>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="mt-10 relative z-10">
        <motion.div className="w-3 h-3 rounded-full"
          style={{ background: 'linear-gradient(135deg, #E88B9A, #B8A9D9)', boxShadow: '0 0 20px #E88B9A40' }}
          animate={{ scale: [1, 1.8, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </motion.div>
  );
}
