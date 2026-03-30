import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmotionalSplashProps {
  show: boolean;
  message: string;
  userName: string;
  onDismiss: () => void;
  symptomKey?: string;
}

const COMFORT_SPLASHES: Record<string, {
  message: string;
  emoji: string;
  bg: string;
  accent: string;
  animation: 'pulse' | 'float' | 'breathe' | 'glow' | 'wave' | 'heartbeat' | 'rain';
  title: string;
  particles?: { color: string; count: number };
  quote: string;
}> = {
  Cramps: {
    title: 'Warmth & Care',
    message: "Imagine a warm golden light wrapping around you right now. Your body is doing incredible work, and every wave of discomfort is proof of your strength. You are so much stronger than you know. 💗",
    emoji: '🫂',
    bg: 'linear-gradient(135deg, #1a0510, #2a0a1a, #1a0510)',
    accent: '#E88B9A',
    animation: 'heartbeat',
    particles: { color: '#E88B9A', count: 15 },
    quote: '"Pain is temporary, but the warrior in you is forever."',
  },
  Fatigue: {
    title: 'Rest & Restore',
    message: "Your body is whispering for rest, and that whisper deserves to be honored. The universe dims its lights just for you tonight. Close your eyes — strength grows in stillness. 🌙",
    emoji: '🌙',
    bg: 'linear-gradient(135deg, #0d0520, #0a0a2a, #0d0520)',
    accent: '#B8A9D9',
    animation: 'breathe',
    particles: { color: '#B8A9D9', count: 10 },
    quote: '"Rest is not giving up. It is choosing to rise again tomorrow."',
  },
  Sadness: {
    title: 'You Are Held',
    message: "Your tears are not weakness — they water the garden of your growth. Every drop carries something heavy that needed to be released. I'm sitting right here with you, in the quiet. 💜",
    emoji: '🌧️',
    bg: 'linear-gradient(135deg, #0a1520, #051525, #0a1520)',
    accent: '#7B9ED0',
    animation: 'rain',
    particles: { color: '#7B9ED0', count: 25 },
    quote: '"Even the sky cries sometimes, and it is still beautiful."',
  },
  Sad: {
    title: 'Gentle Embrace',
    message: "You don't have to be strong right now. You don't have to smile. Just breathe. Just exist. That is more than enough. I see your heart, and it is beautiful even in pain. 🤗",
    emoji: '💕',
    bg: 'linear-gradient(135deg, #150a15, #1a0a20, #150a15)',
    accent: '#E88B9A',
    animation: 'float',
    particles: { color: '#E88B9A', count: 12 },
    quote: '"You are allowed to be both a masterpiece and a work in progress."',
  },
  Headache: {
    title: 'Ease & Calm',
    message: "Imagine cool moonlight washing gently over your temples, each ray dissolving the tension. The pressure will lift like morning fog. You deserve to feel light again. 🌊",
    emoji: '🌊',
    bg: 'linear-gradient(135deg, #0a1520, #081a25, #0a1520)',
    accent: '#9BC9A8',
    animation: 'wave',
    particles: { color: '#9BC9A8', count: 12 },
    quote: '"This too shall pass, like clouds before the sun."',
  },
  Migraine: {
    title: 'Darkness & Peace',
    message: "The world goes quiet for you now. Find your dark, safe cocoon where nothing demands anything of you. I'll guard the silence while you heal. You are not alone in this. ✨",
    emoji: '🕊️',
    bg: 'linear-gradient(135deg, #050510, #080818, #050510)',
    accent: '#9D8BC5',
    animation: 'breathe',
    particles: { color: '#9D8BC5', count: 6 },
    quote: '"In the deepest darkness, you find the brightest peace."',
  },
  Anxiety: {
    title: 'Grounded & Safe',
    message: "Breathe in for 4... hold for 4... exhale for 4. Feel the earth solid beneath you. Your anxious mind is trying to protect you — thank it, then let it rest. You are safe. You are here. Right now. 🧘",
    emoji: '🍃',
    bg: 'linear-gradient(135deg, #0a1510, #081a12, #0a1510)',
    accent: '#9BC9A8',
    animation: 'breathe',
    particles: { color: '#9BC9A8', count: 18 },
    quote: '"You have survived every single anxious moment so far. You will survive this one too."',
  },
  Irritability: {
    title: 'Release & Accept',
    message: "Your fire is valid. Your frustration has a voice that deserves to be heard. Let it transform — not destroy. You are not your worst moment. Channel this energy into something that sets you free. 🔥",
    emoji: '🌋',
    bg: 'linear-gradient(135deg, #1a0a05, #251008, #1a0a05)',
    accent: '#F4C19F',
    animation: 'glow',
    particles: { color: '#F4C19F', count: 14 },
    quote: '"Your anger is a compass pointing to what matters most."',
  },
  Bloating: {
    title: 'Comfort & Flow',
    message: "Your body is doing its beautiful, intricate work. Every cell is dancing to keep you alive and whole. Sip warm water, move gently, and honor this magnificent process. 🫖",
    emoji: '🫖',
    bg: 'linear-gradient(135deg, #15100a, #1a1208, #15100a)',
    accent: '#E8D5B8',
    animation: 'float',
    particles: { color: '#E8D5B8', count: 10 },
    quote: '"Your body is your oldest home. Treat it with tenderness."',
  },
  Insomnia: {
    title: 'Starlight Rest',
    message: "The stars are keeping watch tonight so you don't have to. Let your racing mind drift into their gentle, ancient glow. Sleep will find you when you stop chasing it. Just be still. 🌌",
    emoji: '🌌',
    bg: 'linear-gradient(135deg, #050515, #0a0a25, #050515)',
    accent: '#B8A9D9',
    animation: 'glow',
    particles: { color: '#B8A9D9', count: 20 },
    quote: '"The night is long, but dawn always comes."',
  },
  Stress: {
    title: 'Let Go',
    message: "Drop your shoulders. Unclench your jaw. Release your hands. You're carrying mountains that were never yours to hold. Set them down, one by one. You've already done enough today. 🪷",
    emoji: '🪷',
    bg: 'linear-gradient(135deg, #0a150f, #081a12, #0a150f)',
    accent: '#9BC9A8',
    animation: 'breathe',
    particles: { color: '#9BC9A8', count: 12 },
    quote: '"You don\'t have to carry the weight of the world. Just carry yourself home."',
  },
  Nausea: {
    title: 'Steady & Still',
    message: "Slow, shallow breaths. Focus on one single point of stillness. This wave will pass gently, like all waves do. Your body knows how to find its balance again. Trust it. 🍵",
    emoji: '🍵',
    bg: 'linear-gradient(135deg, #0a1510, #081a12, #0a1510)',
    accent: '#9BC9A8',
    animation: 'wave',
    particles: { color: '#9BC9A8', count: 8 },
    quote: '"Even stormy seas grow calm. So will this."',
  },
  'Mood Swings': {
    title: 'All Colors Welcome',
    message: "You are a kaleidoscope — every color beautiful, every shade a part of who you are. You don't need to be one thing. Embrace the whole spectrum of your magnificent, messy, human heart. 🎨",
    emoji: '🎨',
    bg: 'linear-gradient(135deg, #100a15, #150a1a, #100a15)',
    accent: '#B8A9D9',
    animation: 'pulse',
    particles: { color: '#E88B9A', count: 16 },
    quote: '"You are not broken. You are becoming."',
  },
  'Emotional Sensitivity': {
    title: 'Deeply Feeling',
    message: "Your sensitivity is not a flaw — it is a superpower. You feel the world's beauty and pain that others rush past without noticing. That depth is rare and precious. Protect it. 🦋",
    emoji: '🦋',
    bg: 'linear-gradient(135deg, #100a18, #0d0820, #100a18)',
    accent: '#B8A9D9',
    animation: 'float',
    particles: { color: '#B8A9D9', count: 14 },
    quote: '"To feel deeply is to live fully."',
  },
  default: {
    title: 'You Matter',
    message: "Thank you for checking in with yourself. That takes real courage and self-awareness. In a world that's always rushing, you chose to pause and listen to your own heart. That's powerful. 💜",
    emoji: '✨',
    bg: 'linear-gradient(135deg, #0d0a15, #120a1a, #0d0a15)',
    accent: '#E88B9A',
    animation: 'pulse',
    particles: { color: '#E88B9A', count: 12 },
    quote: '"You are worthy of your own attention."',
  },
};

export function getComfortMessage(symptom: string): { message: string; emoji: string; gradient: string } {
  const splash = COMFORT_SPLASHES[symptom] || COMFORT_SPLASHES.default;
  return { message: splash.message, emoji: splash.emoji, gradient: splash.bg };
}

const animationVariants = {
  pulse: { scale: [1, 1.3, 1], transition: { duration: 1.5, repeat: Infinity } },
  float: { y: [0, -15, 0], rotate: [0, 8, -8, 0], transition: { duration: 3, repeat: Infinity } },
  breathe: { scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7], transition: { duration: 4, repeat: Infinity } },
  glow: { scale: [1, 1.15, 1], filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'], transition: { duration: 2.5, repeat: Infinity } },
  wave: { x: [0, 10, -10, 0], y: [0, -6, 6, 0], transition: { duration: 3, repeat: Infinity } },
  heartbeat: { scale: [1, 1.2, 1, 1.15, 1], transition: { duration: 1.2, repeat: Infinity } },
  rain: { y: [0, -8, 0], opacity: [0.6, 1, 0.6], transition: { duration: 2.5, repeat: Infinity } },
};

export default function EmotionalSplash({ show, message, userName, onDismiss, symptomKey }: EmotionalSplashProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onDismiss, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  const splash = COMFORT_SPLASHES[symptomKey || ''] || COMFORT_SPLASHES.default;
  const displayMessage = message || splash.message;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          onClick={onDismiss}
          className="fixed inset-0 z-[60] flex items-center justify-center p-6 overflow-hidden"
          style={{ background: splash.bg, backdropFilter: 'blur(30px)' }}
        >
          {/* Floating particles */}
          {splash.particles && Array.from({ length: splash.particles.count }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 2 + Math.random() * 6,
                height: 2 + Math.random() * 6,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: splash.particles!.color,
                boxShadow: `0 0 ${10 + Math.random() * 25}px ${splash.particles!.color}60`,
              }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0, 1.5, 0],
                y: [0, -(30 + Math.random() * 60), 0],
              }}
              transition={{
                duration: 2.5 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}

          {/* Central glow rings */}
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full"
            style={{ background: `radial-gradient(circle, ${splash.accent}10, transparent)` }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <motion.div
            className="absolute w-[300px] h-[300px] rounded-full"
            style={{ background: `radial-gradient(circle, ${splash.accent}15, transparent)` }}
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          />

          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: -40 }}
            transition={{ type: 'spring', stiffness: 130, damping: 16 }}
            className="text-center max-w-[320px] relative z-10"
          >
            {/* Animated emoji */}
            <motion.div
              animate={animationVariants[splash.animation]}
              className="text-7xl mb-6 inline-block"
              style={{ filter: `drop-shadow(0 0 40px ${splash.accent}50)` }}
            >
              {splash.emoji}
            </motion.div>

            {/* Title */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-[10px] font-medium uppercase tracking-[0.3em] mb-3"
              style={{ color: splash.accent }}
            >
              {splash.title}
            </motion.p>

            {/* Personalized greeting */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xl font-display font-bold mb-4"
              style={{ color: '#fff', textShadow: `0 0 40px ${splash.accent}30` }}
            >
              Hey {userName || 'there'} 💜
            </motion.p>

            {/* Emotional message */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-sm leading-relaxed mb-5"
              style={{ color: `${splash.accent}cc` }}
            >
              {displayMessage}
            </motion.p>

            {/* Inspirational quote */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1.2 }}
              className="text-[11px] italic leading-relaxed"
              style={{ color: `${splash.accent}80` }}
            >
              {splash.quote}
            </motion.p>

            {/* Progress bar */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4, duration: 4.2 }}
              className="mt-8 h-px rounded-full origin-left"
              style={{ background: `linear-gradient(to right, ${splash.accent}60, ${splash.accent}10)` }}
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: 1.5 }}
              className="text-[9px] mt-3"
              style={{ color: splash.accent }}
            >
              tap anywhere to continue
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
