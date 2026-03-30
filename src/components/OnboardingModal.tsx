import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Heart } from 'lucide-react';

interface OnboardingModalProps {
  onComplete: (name: string) => void;
}

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [name, setName] = useState('');
  const [step, setStep] = useState(0);

  const handleSubmit = () => {
    if (name.trim()) onComplete(name.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0d0515, #1a0a2e, #0a192f)',
      }}
    >
      {/* Animated aurora background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, #E88B9A35, transparent)', top: '-15%', right: '-20%' }}
          animate={{ scale: [1, 1.3, 1], x: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute w-[350px] h-[350px] rounded-full"
          style={{ background: 'radial-gradient(circle, #B8A9D935, transparent)', bottom: '-10%', left: '-15%' }}
          animate={{ scale: [1, 1.2, 1], y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        />
        <motion.div
          className="absolute w-[250px] h-[250px] rounded-full"
          style={{ background: 'radial-gradient(circle, #FFD70025, transparent)', top: '40%', left: '50%' }}
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 6, repeat: Infinity, delay: 2 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="welcome"
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -30 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-full max-w-sm rounded-[2rem] p-8 text-center relative z-10"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="w-24 h-24 mx-auto rounded-[1.5rem] flex items-center justify-center mb-6"
              style={{
                background: 'linear-gradient(135deg, #E88B9A, #B8A9D9, #9BC9A8)',
                boxShadow: '0 0 40px #E88B9A40',
              }}
            >
              <span className="text-5xl">✿</span>
            </motion.div>

            <h2 className="text-3xl font-display font-bold mb-3" style={{ color: '#fff' }}>
              Welcome to FemNexa
            </h2>
            <p className="text-sm mb-2 leading-relaxed" style={{ color: '#B8A9D9' }}>
              Your AI emotional companion
            </p>
            <p className="text-xs mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
              I adapt to your emotions. I reflect what you feel.<br />
              I'm here to support you — always. 💜
            </p>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setStep(1)}
              className="w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 text-white"
              style={{
                background: 'linear-gradient(135deg, #E88B9A, #B8A9D9)',
                boxShadow: '0 8px 30px #E88B9A30',
              }}
            >
              Begin Your Journey <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="name"
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -30 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-full max-w-sm rounded-[2rem] p-8 text-center relative z-10"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Heart className="w-12 h-12 mx-auto mb-6" style={{ color: '#E88B9A', filter: 'drop-shadow(0 0 15px #E88B9A40)' }} />
            </motion.div>

            <h2 className="text-2xl font-display font-bold mb-2" style={{ color: '#fff' }}>
              What should I call you? 💜
            </h2>
            <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
              So I can truly be yours
            </p>

            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Your name..."
              className="w-full px-5 py-4 rounded-2xl text-center text-lg font-medium mb-5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
              }}
              autoFocus
            />

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={!name.trim()}
              className="w-full py-4 rounded-2xl font-semibold text-sm disabled:opacity-30 transition-opacity text-white"
              style={{
                background: 'linear-gradient(135deg, #E88B9A, #B8A9D9)',
                boxShadow: name.trim() ? '0 8px 30px #E88B9A30' : 'none',
              }}
            >
              I'm Ready ✨
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
