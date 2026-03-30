import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Wind, BookHeart, Sun, Sparkles, Shield, ChevronRight, Play, Pause, RotateCcw, Headphones, Flower2, Coffee, Moon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { storage } from '@/services/storage';
import { getCycles, getCycleContext } from '@/services/cycleEngine';
import { PHASE_CONFIG, type JournalEntry, type BreathingExercise } from '@/types';
import { generateId } from '@/lib/utils';

const BREATHING_EXERCISES: BreathingExercise[] = [
  { id: '1', name: '4-7-8 Calm', description: 'Deep relaxation breathing', inhale: 4, hold: 7, exhale: 8, rounds: 4, benefit: 'Reduces anxiety and helps sleep' },
  { id: '2', name: 'Box Breathing', description: 'Balanced calming breath', inhale: 4, hold: 4, exhale: 4, rounds: 6, benefit: 'Reduces stress and improves focus' },
  { id: '3', name: 'Gentle Wave', description: 'Soft, soothing breathing', inhale: 3, hold: 2, exhale: 5, rounds: 5, benefit: 'Gentle relaxation for cramps' },
  { id: '4', name: 'Energizing Breath', description: 'Quick energy boost', inhale: 2, hold: 1, exhale: 2, rounds: 8, benefit: 'Increases alertness and energy' },
];

const JOURNAL_PROMPTS: Record<string, string[]> = {
  menstrual: ['What does rest look like for me today?', 'I give myself permission to...', 'Three things I appreciate about my body right now:', 'How can I be gentle with myself today?'],
  follicular: ['What new goal excites me right now?', 'I feel most creative when...', 'Something I want to start or try:', 'My energy feels best when...'],
  ovulation: ['What am I most proud of this cycle?', 'I feel most confident when...', 'A conversation I want to have:', 'How do I want to show up today?'],
  luteal: ['What boundaries do I need to set?', 'I am feeling _____ and that is okay because...', 'Something soothing I can do right now:', 'A comforting memory that brings me peace:'],
};

const GROUNDING_EXERCISES = [
  { name: '5-4-3-2-1 Grounding', icon: '🌿', description: 'Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste', duration: '3 min' },
  { name: 'Body Scan', icon: '🧘', description: 'Slowly notice sensations from your toes to the top of your head', duration: '5 min' },
  { name: 'Butterfly Hug', icon: '🦋', description: 'Cross arms over chest, alternate tapping shoulders gently', duration: '2 min' },
  { name: 'Safe Place', icon: '🏡', description: 'Close your eyes and imagine your most peaceful place in detail', duration: '3 min' },
];

const SELF_CARE_ACTIVITIES: Record<string, { title: string; items: { name: string; emoji: string; duration: string }[] }> = {
  menstrual: {
    title: 'Comfort & Rest',
    items: [
      { name: 'Warm bath with epsom salts', emoji: '🛁', duration: '20 min' },
      { name: 'Gentle yoga stretches', emoji: '🧘', duration: '10 min' },
      { name: 'Hot tea and cozy blanket', emoji: '☕', duration: '15 min' },
      { name: 'Listen to calming music', emoji: '🎵', duration: '20 min' },
    ],
  },
  follicular: {
    title: 'Energy & Creativity',
    items: [
      { name: 'Morning dance session', emoji: '💃', duration: '15 min' },
      { name: 'Creative journaling', emoji: '✏️', duration: '20 min' },
      { name: 'Nature walk', emoji: '🌳', duration: '30 min' },
      { name: 'Try a new recipe', emoji: '🥗', duration: '30 min' },
    ],
  },
  ovulation: {
    title: 'Connection & Confidence',
    items: [
      { name: 'Call a close friend', emoji: '📱', duration: '20 min' },
      { name: 'Power workout', emoji: '💪', duration: '30 min' },
      { name: 'Skincare ritual', emoji: '✨', duration: '15 min' },
      { name: 'Dress up for yourself', emoji: '👗', duration: '15 min' },
    ],
  },
  luteal: {
    title: 'Calm & Nourish',
    items: [
      { name: 'Meditation session', emoji: '🧘', duration: '15 min' },
      { name: 'Comfort food cooking', emoji: '🍲', duration: '30 min' },
      { name: 'Gentle stretching', emoji: '🌸', duration: '10 min' },
      { name: 'Early bedtime routine', emoji: '🌙', duration: '20 min' },
    ],
  },
};

const SOUND_SCAPES = [
  { name: 'Rain Sounds', emoji: '🌧️', description: 'Soft rain for relaxation' },
  { name: 'Ocean Waves', emoji: '🌊', description: 'Calming ocean sounds' },
  { name: 'Forest Ambience', emoji: '🌲', description: 'Birds and gentle breeze' },
  { name: 'Night Sounds', emoji: '🌙', description: 'Crickets and calm night' },
];

function BreathingTimer({ exercise, onComplete }: { exercise: BreathingExercise; onComplete: () => void }) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [count, setCount] = useState(exercise.inhale);
  const [round, setRound] = useState(1);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    if (count <= 0) {
      if (phase === 'inhale') {
        if (exercise.hold > 0) { setPhase('hold'); setCount(exercise.hold); }
        else { setPhase('exhale'); setCount(exercise.exhale); }
      } else if (phase === 'hold') {
        setPhase('exhale'); setCount(exercise.exhale);
      } else {
        if (round >= exercise.rounds) { setIsActive(false); onComplete(); return; }
        setRound(r => r + 1); setPhase('inhale'); setCount(exercise.inhale);
      }
      return;
    }
    const timer = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, phase, round, isActive, exercise, onComplete]);

  const reset = () => { setIsActive(false); setPhase('inhale'); setCount(exercise.inhale); setRound(1); };

  const scale = phase === 'inhale' ? 1.3 : phase === 'hold' ? 1.3 : 1;
  const color = phase === 'inhale' ? '#9BC9A8' : phase === 'hold' ? '#F4C19F' : '#B8A9D9';

  return (
    <div className="flex flex-col items-center py-6">
      <motion.div animate={{ scale }} transition={{ duration: count > 0 ? count : 1, ease: 'easeInOut' }}
        className="w-40 h-40 rounded-full flex items-center justify-center mb-6 relative"
        style={{ backgroundColor: color + '30', border: `3px solid ${color}` }}
      >
        <motion.div className="absolute inset-2 rounded-full" style={{ backgroundColor: color + '15' }}
          animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
        />
        <div className="text-center z-10">
          <p className="text-3xl font-bold text-foreground">{count}</p>
          <p className="text-sm font-medium capitalize" style={{ color }}>{phase}</p>
        </div>
      </motion.div>
      <p className="text-sm text-muted-foreground mb-4">Round {round} of {exercise.rounds}</p>
      <div className="flex gap-3">
        <button onClick={() => setIsActive(!isActive)} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm flex items-center gap-2 shadow-md">
          {isActive ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> {round === 1 && count === exercise.inhale ? 'Start' : 'Resume'}</>}
        </button>
        <button onClick={reset} className="px-4 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm flex items-center gap-2">
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
      </div>
    </div>
  );
}

interface WellnessProps {
  userName?: string;
  comfortMode?: boolean;
  isNegativeMood?: boolean;
}

export default function Wellness({ userName = '', comfortMode = false, isNegativeMood = false }: WellnessProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [selectedBreathing, setSelectedBreathing] = useState<BreathingExercise | null>(null);
  const [journalContent, setJournalContent] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState('');

  const ctx = getCycleContext(getCycles());
  const phaseConfig = PHASE_CONFIG[ctx.currentPhase];
  const prompts = JOURNAL_PROMPTS[ctx.currentPhase];
  const selfCare = SELF_CARE_ACTIVITIES[ctx.currentPhase];

  const saveJournal = () => {
    if (!journalContent.trim()) return;
    const journals = storage.get<JournalEntry[]>('journals', []);
    journals.unshift({ id: generateId(), date: format(new Date(), 'yyyy-MM-dd'), prompt: selectedPrompt, content: journalContent.trim() });
    storage.set('journals', journals);
    toast.success('Journal entry saved 📝');
    setJournalContent(''); setSelectedPrompt('');
  };

  const sections = [
    { id: 'selfcare', icon: Coffee, label: `${selfCare.title}`, description: 'Phase-specific self-care activities', color: phaseConfig.hex },
    { id: 'breathing', icon: Wind, label: 'Breathing Exercises', description: 'Guided breathing for calm & focus', color: '#9BC9A8' },
    { id: 'journal', icon: BookHeart, label: 'Mood Journal', description: 'Phase-aware guided journaling', color: '#B8A9D9' },
    { id: 'grounding', icon: Shield, label: 'Grounding Exercises', description: 'Techniques for anxiety & stress', color: '#F4C19F' },
    { id: 'soundscapes', icon: Headphones, label: 'Soundscapes', description: 'Calming ambient sounds', color: '#9BC9A8' },
    { id: 'affirmations', icon: Sun, label: 'Affirmations', description: 'Positive words for your phase', color: '#E88B9A' },
  ];

  return (
    <div className="px-5 pt-6 pb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shadow-sm">
          <Heart className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {userName ? `${userName}'s Wellness` : 'Wellness Hub'}
          </h1>
          <p className="text-sm text-muted-foreground">{phaseConfig.emoji} Tailored for your {phaseConfig.name} phase</p>
        </div>
      </div>

      {/* Emotional Support Banner for negative mood */}
      {isNegativeMood && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-4 mb-4 text-center"
          style={{ background: `linear-gradient(135deg, ${PHASE_CONFIG.luteal.hex}15, ${PHASE_CONFIG.menstrual.hex}15)`, border: `1px solid ${PHASE_CONFIG.luteal.hex}25` }}
        >
          <p className="text-sm text-foreground/80">
            💜 {userName ? `${userName}, we` : 'We'} noticed you're feeling low. These activities are chosen to help you feel better.
          </p>
        </motion.div>
      )}

      {/* Phase Wellness Tip */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-4 mb-6 glass-strong"
        style={{ borderLeft: `3px solid ${phaseConfig.hex}` }}
      >
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 mt-0.5" style={{ color: phaseConfig.hex }} />
          <div>
            <p className="text-sm font-semibold mb-1 text-foreground">Wellness Tip</p>
            <p className="text-sm text-muted-foreground">{phaseConfig.tips[Math.floor(Math.random() * phaseConfig.tips.length)]}</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Mood Boosters */}
      <div className="mb-6">
        <h2 className="font-display font-semibold text-sm mb-3 text-foreground flex items-center gap-2">
          <Flower2 className="w-4 h-4 text-primary" /> Quick Mood Boosters
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {[
            { emoji: '🫁', label: 'Deep Breath', action: () => { setActiveSection('breathing'); setSelectedBreathing(BREATHING_EXERCISES[0]); } },
            { emoji: '💕', label: 'Affirmation', action: () => setActiveSection('affirmations') },
            { emoji: '📝', label: 'Journal', action: () => setActiveSection('journal') },
            { emoji: '🌿', label: 'Ground Me', action: () => setActiveSection('grounding') },
          ].map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileTap={{ scale: 0.95 }}
              onClick={item.action}
              className="glass rounded-2xl p-3 flex items-center gap-3 hover:shadow-md transition-shadow"
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-sm font-medium text-foreground">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Section Cards */}
      <div className="space-y-3">
        {sections.map((section, i) => (
          <motion.div key={section.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <motion.button whileTap={{ scale: 0.98 }}
              onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
              className="w-full glass-strong rounded-2xl p-4 flex items-center gap-4 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: section.color + '20' }}>
                <section.icon className="w-6 h-6" style={{ color: section.color }} />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-sm text-foreground">{section.label}</h3>
                <p className="text-xs text-muted-foreground">{section.description}</p>
              </div>
              <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${activeSection === section.id ? 'rotate-90' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {activeSection === section.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="pt-3 pb-1 px-1">
                    {section.id === 'selfcare' && (
                      <div className="space-y-2">
                        {selfCare.items.map((item, j) => (
                          <motion.div key={item.name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: j * 0.08 }}
                            className="glass rounded-2xl p-4 flex items-center gap-3"
                          >
                            <span className="text-2xl">{item.emoji}</span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.duration}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {section.id === 'breathing' && (
                      <div className="space-y-2">
                        {selectedBreathing ? (
                          <div>
                            <button onClick={() => setSelectedBreathing(null)} className="text-xs text-primary mb-2">← Back</button>
                            <BreathingTimer exercise={selectedBreathing} onComplete={() => toast.success('Great breathing session! 🧘')} />
                          </div>
                        ) : (
                          BREATHING_EXERCISES.map(ex => (
                            <button key={ex.id} onClick={() => setSelectedBreathing(ex)}
                              className="w-full glass rounded-2xl p-3 flex items-center gap-3 text-left hover:shadow-md transition-shadow"
                            >
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#9BC9A820' }}>
                                <Wind className="w-5 h-5" style={{ color: '#9BC9A8' }} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">{ex.name}</p>
                                <p className="text-xs text-muted-foreground">{ex.benefit}</p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}

                    {section.id === 'journal' && (
                      <div className="space-y-3">
                        <p className="text-xs text-muted-foreground">Choose a prompt for your {phaseConfig.name} phase:</p>
                        {prompts.map(prompt => (
                          <button key={prompt} onClick={() => setSelectedPrompt(prompt)}
                            className={`w-full text-left p-3 rounded-xl text-sm transition-colors ${selectedPrompt === prompt ? 'bg-primary/10 ring-1 ring-primary/30' : 'glass hover:bg-muted'}`}
                          >
                            {prompt}
                          </button>
                        ))}
                        {selectedPrompt && (
                          <div className="space-y-2">
                            <textarea value={journalContent} onChange={e => setJournalContent(e.target.value)}
                              placeholder={`Write your thoughts${userName ? `, ${userName}` : ''}...`} rows={4}
                              className="w-full p-3 text-sm rounded-xl bg-background border border-border resize-none text-foreground placeholder:text-muted-foreground"
                            />
                            <motion.button whileTap={{ scale: 0.97 }} onClick={saveJournal}
                              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow-md"
                            >
                              Save Entry
                            </motion.button>
                          </div>
                        )}
                      </div>
                    )}

                    {section.id === 'grounding' && (
                      <div className="space-y-2">
                        {GROUNDING_EXERCISES.map(ex => (
                          <div key={ex.name} className="glass rounded-2xl p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl">{ex.icon}</span>
                              <div>
                                <p className="text-sm font-medium text-foreground">{ex.name}</p>
                                <p className="text-xs text-muted-foreground">{ex.duration}</p>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">{ex.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.id === 'soundscapes' && (
                      <div className="space-y-2">
                        {SOUND_SCAPES.map((sound, j) => (
                          <motion.div key={sound.name}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: j * 0.08 }}
                            className="glass rounded-2xl p-4 flex items-center gap-3"
                          >
                            <span className="text-2xl">{sound.emoji}</span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{sound.name}</p>
                              <p className="text-xs text-muted-foreground">{sound.description}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Play className="w-3.5 h-3.5 text-primary" />
                            </div>
                          </motion.div>
                        ))}
                        <p className="text-[10px] text-center text-muted-foreground mt-2 italic">
                          🔊 Sound playback coming soon
                        </p>
                      </div>
                    )}

                    {section.id === 'affirmations' && (
                      <div className="space-y-2">
                        {phaseConfig.affirmations.map((aff, i) => (
                          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                            className="rounded-2xl p-4 text-center"
                            style={{ background: `linear-gradient(135deg, ${phaseConfig.hex}15, ${phaseConfig.hex}08)`, border: `1px solid ${phaseConfig.hex}25` }}
                          >
                            <p className="text-sm italic text-foreground/80">"{aff}"</p>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
