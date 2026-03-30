import { motion, AnimatePresence } from 'framer-motion';
import { Moon } from 'lucide-react';

interface EndOfDayCardProps {
  show: boolean;
  userName: string;
  onDismiss: () => void;
}

const NIGHT_MESSAGES = [
  "You did your best today, and that's always enough.",
  "Rest well tonight. Tomorrow is a fresh start.",
  "Your body worked hard for you today. Give it the rest it deserves.",
  "Let go of today's worries. You're safe and cared for.",
  "Sleep is your body's way of healing. Embrace it.",
];

export default function EndOfDayCard({ show, userName, onDismiss }: EndOfDayCardProps) {
  const message = NIGHT_MESSAGES[Math.floor(Math.random() * NIGHT_MESSAGES.length)];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
          className="fixed inset-0 z-50 flex items-center justify-center p-8"
          style={{ background: 'hsl(260 30% 10% / 0.85)', backdropFilter: 'blur(16px)' }}
        >
          <motion.div
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -20 }}
            className="text-center max-w-xs"
          >
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Moon className="w-12 h-12 mx-auto mb-6" style={{ color: '#B8A9D9' }} />
            </motion.div>
            <h2 className="text-xl font-display font-bold mb-3" style={{ color: '#f0edf5' }}>
              Goodnight, {userName || 'friend'} 🌙
            </h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: '#b8b0c5' }}>{message}</p>
            <button
              onClick={onDismiss}
              className="px-6 py-2.5 rounded-2xl text-sm font-medium"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              Sweet dreams 🌙
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
