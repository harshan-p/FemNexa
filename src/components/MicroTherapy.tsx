import { motion } from 'framer-motion';

interface MicroTherapyProps {
  show: boolean;
  onDismiss: () => void;
}

const MICRO_THERAPY = [
  { text: 'Take a deep breath 💜', subtext: 'Inhale for 4... hold for 4... exhale for 4...', emoji: '🌬️' },
  { text: 'Relax your shoulders', subtext: 'You might be carrying tension without knowing it', emoji: '🧘' },
  { text: 'Unclench your jaw', subtext: 'Let the tension melt away gently', emoji: '✨' },
  { text: 'Feel your feet on the ground', subtext: 'You are here. You are safe. You are present.', emoji: '🌍' },
  { text: 'Place a hand on your heart', subtext: 'Feel the steady rhythm that keeps you going', emoji: '💗' },
  { text: 'Close your eyes for 10 seconds', subtext: 'Give your mind a tiny moment of darkness', emoji: '🌙' },
];

export function getRandomTherapy() {
  return MICRO_THERAPY[Math.floor(Math.random() * MICRO_THERAPY.length)];
}

export default function MicroTherapy({ show, onDismiss }: MicroTherapyProps) {
  const therapy = getRandomTherapy();

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="glass-strong rounded-2xl p-4 flex items-center gap-3 cursor-pointer"
      onClick={onDismiss}
    >
      <motion.span
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-2xl"
      >
        {therapy.emoji}
      </motion.span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{therapy.text}</p>
        <p className="text-xs text-muted-foreground">{therapy.subtext}</p>
      </div>
    </motion.div>
  );
}
