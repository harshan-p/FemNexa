import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { storage } from '@/services/storage';
import { generateId } from '@/lib/utils';
import type { MoodEntry } from '@/types';

const CHECK_IN_MOODS = [
  { emoji: '🤩', label: 'Amazing', valence: 5, response: "Your light is shining so bright right now ✨", color: '#FFD700' },
  { emoji: '😊', label: 'Happy', valence: 3, response: "That warmth you feel? You deserve every bit of it 💛", color: '#FF69B4' },
  { emoji: '😌', label: 'Calm', valence: 1, response: "What a beautiful place of peace you've found 🌿", color: '#9BC9A8' },
  { emoji: '😔', label: 'Low', valence: -2, response: "I see you. I'm here with you. This will pass like clouds after rain 💜", color: '#7B9ED0' },
  { emoji: '😢', label: 'Hurting', valence: -4, response: "Your pain is valid. Let me hold this space for you 🤗", color: '#B8A9D9' },
];

interface DailyCheckInProps {
  userName: string;
  onComplete: (valence: number, label: string) => void;
  onDismiss: () => void;
}

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

export default function DailyCheckIn({ userName, onComplete, onDismiss }: DailyCheckInProps) {
  const [selectedMood, setSelectedMood] = useState<typeof CHECK_IN_MOODS[number] | null>(null);
  const [showResponse, setShowResponse] = useState(false);

  const handleSelect = (mood: typeof CHECK_IN_MOODS[number]) => {
    setSelectedMood(mood);
    setShowResponse(true);
    const moods = storage.get<MoodEntry[]>('moods', []);
    moods.unshift({
      id: generateId(), date: format(new Date(), 'yyyy-MM-dd'),
      timestamp: new Date().toISOString(), mood: mood.label,
      valence: mood.valence, energy: 5, anxiety: 0,
    });
    storage.set('moods', moods);
    setTimeout(() => onComplete(mood.valence, mood.label), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0d0515ee, #1a0a2eee)', backdropFilter: 'blur(30px)' }}
    >
      {/* Mood-reactive background orb */}
      {selectedMood && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 3, opacity: 0.2 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute w-[300px] h-[300px] rounded-full"
          style={{ background: `radial-gradient(circle, ${selectedMood.color}50, transparent)` }}
        />
      )}

      <motion.div
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 18 }}
        className="w-full max-w-sm rounded-[2rem] p-8 text-center relative z-10"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}
      >
        <AnimatePresence mode="wait">
          {!showResponse ? (
            <motion.div key="question" exit={{ opacity: 0, y: -20 }}>
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-5xl mb-6">🪞</motion.div>
              <h2 className="text-xl font-display font-bold mb-2" style={{ color: '#fff' }}>
                Good {getTimeGreeting()}, {userName || 'friend'}
              </h2>
              <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
                How does your soul feel right now?
              </p>
              <div className="flex justify-center gap-2">
                {CHECK_IN_MOODS.map((mood, i) => (
                  <motion.button
                    key={mood.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSelect(mood)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-colors"
                    style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <span className="text-3xl">{mood.emoji}</span>
                    <span className="text-[10px] font-medium" style={{ color: mood.color }}>{mood.label}</span>
                  </motion.button>
                ))}
              </div>
              <button onClick={onDismiss} className="mt-6 text-xs transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Skip for now
              </button>
            </motion.div>
          ) : (
            <motion.div key="response" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <motion.span
                className="text-6xl block mb-6"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {selectedMood?.emoji}
              </motion.span>
              <p className="text-base leading-relaxed font-medium" style={{ color: selectedMood?.color }}>
                {selectedMood?.response}
              </p>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 2, delay: 0.3 }}
                className="mt-6 h-0.5 rounded-full origin-left"
                style={{ background: `linear-gradient(to right, ${selectedMood?.color}60, transparent)` }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
