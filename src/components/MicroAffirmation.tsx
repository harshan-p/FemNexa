import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MicroAffirmationProps {
  show: boolean;
  message: string;
}

const AFFIRMATIONS = [
  'Logged ✓ — take care 💜',
  'You showed up for yourself today ✨',
  'Small steps matter 🌸',
  'Your body thanks you 💕',
  'Self-awareness is self-love 🌿',
  'Every log is an act of care 💗',
  "You're doing amazing 🌟",
  'Tracking = empowerment ✓',
];

export function getRandomAffirmation(): string {
  return AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];
}

export default function MicroAffirmation({ show, message }: MicroAffirmationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [show, message]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl glass-strong shadow-xl max-w-xs text-center"
        >
          <p className="text-sm font-medium text-foreground">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
