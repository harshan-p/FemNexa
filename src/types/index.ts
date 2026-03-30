export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export interface CycleEntry {
  id: string;
  startDate: string;
  endDate?: string;
  flowIntensity?: 'spotting' | 'light' | 'moderate' | 'heavy' | 'very_heavy';
  notes?: string;
}

export interface SymptomEntry {
  id: string;
  date: string;
  timestamp: string;
  category: string;
  symptom: string;
  severity: number;
  notes?: string;
  triggers?: string[];
  relief?: string[];
}

export interface MoodEntry {
  id: string;
  date: string;
  timestamp: string;
  mood: string;
  valence: number;
  energy: number;
  anxiety: number;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  bookmarked?: boolean;
}

export interface CycleContext {
  currentPhase: CyclePhase;
  dayInCycle: number;
  cycleLength: number;
  daysUntilPeriod: number;
  stabilityScore: number;
  recentSymptoms: string[];
  recentMoods: string[];
  predictedNextPeriod: string;
  confidence: number;
}

export interface PatternInsight {
  symptom: string;
  phase: CyclePhase;
  frequency: number;
  insight: string;
  recommendation: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  prompt: string;
  content: string;
  mood?: string;
}

export interface BreathingExercise {
  id: string;
  name: string;
  description: string;
  inhale: number;
  hold: number;
  exhale: number;
  rounds: number;
  benefit: string;
}

export interface Affirmation {
  text: string;
  phase: CyclePhase;
  category: string;
}

export const PHASE_CONFIG = {
  menstrual: {
    name: 'Menstrual',
    emoji: '🌙',
    color: 'menstrual',
    hex: '#E88B9A',
    gradient: 'from-[#E88B9A] to-[#D4707F]',
    bg: 'bg-menstrual/10',
    days: '1-5',
    description: 'Rest & renewal phase',
    personality: 'The Inner Sage 🌙',
    tips: [
      'Rest and gentle self-care today 💕',
      'Iron-rich foods: spinach, lentils, red meat',
      'Warm compresses for cramps',
      'Gentle walks or yoga stretches',
      'Extra sleep is beneficial now',
    ],
    affirmations: [
      'My body is wise and I trust its rhythms.',
      'Rest is productive. I honor my need for stillness.',
      'I release what no longer serves me.',
    ],
  },
  follicular: {
    name: 'Follicular',
    emoji: '🌱',
    color: 'follicular',
    hex: '#9BC9A8',
    gradient: 'from-[#9BC9A8] to-[#7FB88E]',
    bg: 'bg-follicular/10',
    days: '6-13',
    description: 'Rising energy & creativity',
    personality: 'The Spark ✨',
    tips: [
      'Energy is rising! Great time for new projects 🌟',
      'High-intensity workouts feel easier now',
      'Social events and networking thrive',
      'Brain power peaks - tackle complex tasks',
      'Try new recipes and experiment with food',
    ],
    affirmations: [
      'I am full of creative energy and possibility.',
      'New beginnings excite me.',
      'I step into my power with confidence.',
    ],
  },
  ovulation: {
    name: 'Ovulation',
    emoji: '☀️',
    color: 'ovulation',
    hex: '#F4C19F',
    gradient: 'from-[#F4C19F] to-[#E5A97D]',
    bg: 'bg-ovulation/10',
    days: '14-16',
    description: 'Peak energy & confidence',
    personality: 'The Radiant Leader ☀️',
    tips: [
      'Peak energy and confidence! Shine bright ✨',
      'Communication skills are at their best',
      'Skin may glow - natural radiance peaks',
      'Great time for important conversations',
      'Libido may naturally increase',
    ],
    affirmations: [
      'I radiate confidence and warmth.',
      'My voice matters and deserves to be heard.',
      'I celebrate my body in all its power.',
    ],
  },
  luteal: {
    name: 'Luteal',
    emoji: '🌸',
    color: 'luteal',
    hex: '#B8A9D9',
    gradient: 'from-[#B8A9D9] to-[#9D8BC5]',
    bg: 'bg-luteal/10',
    days: '17-28',
    description: 'Winding down & reflection',
    personality: 'The Gentle Dreamer 🌸',
    tips: [
      'Practice self-compassion 💜',
      'Magnesium-rich foods: nuts, dark chocolate, avocado',
      'Gentle exercises: yoga, swimming, walking',
      'Journaling can help process emotions',
      'Prioritize sleep and relaxation',
    ],
    affirmations: [
      'I am gentle with myself during transitions.',
      'My emotions are valid and I honor them.',
      'Slowing down is an act of self-love.',
    ],
  },
} as const;

export const SYMPTOM_CATEGORIES = {
  'Physical - Menstrual': [
    { name: 'Cramps', emoji: '😣', hasScale: true },
    { name: 'Heavy Flow', emoji: '💧', hasScale: false },
    { name: 'Light Flow', emoji: '💦', hasScale: false },
    { name: 'Spotting', emoji: '🩸', hasScale: false },
    { name: 'Clotting', emoji: '🔴', hasScale: false },
  ],
  'Physical - Body': [
    { name: 'Headache', emoji: '🤕', hasScale: true },
    { name: 'Migraine', emoji: '⚡', hasScale: true },
    { name: 'Breast Tenderness', emoji: '💔', hasScale: true },
    { name: 'Bloating', emoji: '🫧', hasScale: true },
    { name: 'Back Pain', emoji: '🔙', hasScale: true },
    { name: 'Joint Pain', emoji: '🦴', hasScale: true },
    { name: 'Fatigue', emoji: '😴', hasScale: true },
    { name: 'Insomnia', emoji: '🌙', hasScale: false },
    { name: 'Hot Flashes', emoji: '🔥', hasScale: false },
    { name: 'Nausea', emoji: '🤢', hasScale: true },
    { name: 'Acne', emoji: '🔵', hasScale: true },
  ],
  'Emotional': [
    { name: 'Anxiety', emoji: '😰', hasScale: true },
    { name: 'Sadness', emoji: '😢', hasScale: true },
    { name: 'Irritability', emoji: '😤', hasScale: true },
    { name: 'Mood Swings', emoji: '🎭', hasScale: false },
    { name: 'Brain Fog', emoji: '🌫️', hasScale: true },
    { name: 'Emotional Sensitivity', emoji: '🥺', hasScale: true },
    { name: 'Happiness', emoji: '😊', hasScale: true },
    { name: 'Calm', emoji: '🧘', hasScale: true },
  ],
  'Energy & Activity': [
    { name: 'Low Energy', emoji: '🔋', hasScale: true },
    { name: 'High Energy', emoji: '⚡', hasScale: true },
    { name: 'Exercise', emoji: '🏃', hasScale: false },
    { name: 'Poor Sleep', emoji: '😫', hasScale: true },
    { name: 'Stress', emoji: '😓', hasScale: true },
  ],
  'Digestive': [
    { name: 'Cravings', emoji: '🍫', hasScale: false },
    { name: 'Appetite Change', emoji: '🍽️', hasScale: false },
    { name: 'Diarrhea', emoji: '💨', hasScale: false },
    { name: 'Constipation', emoji: '🚫', hasScale: false },
  ],
} as const;

export const MOODS = [
  { name: 'Amazing', emoji: '🤩', valence: 5 },
  { name: 'Happy', emoji: '😊', valence: 4 },
  { name: 'Good', emoji: '🙂', valence: 3 },
  { name: 'Calm', emoji: '😌', valence: 2 },
  { name: 'Okay', emoji: '😐', valence: 0 },
  { name: 'Tired', emoji: '😴', valence: -1 },
  { name: 'Anxious', emoji: '😰', valence: -2 },
  { name: 'Sad', emoji: '😢', valence: -3 },
  { name: 'Irritable', emoji: '😤', valence: -4 },
  { name: 'Overwhelmed', emoji: '😫', valence: -5 },
];
