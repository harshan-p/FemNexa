import { differenceInDays, addDays, parseISO, format, isValid } from 'date-fns';
import type { CycleEntry, CyclePhase, CycleContext, SymptomEntry, MoodEntry } from '@/types';
import { storage } from './storage';

function safeParse(dateStr: string): Date | null {
  try {
    const d = parseISO(dateStr);
    return isValid(d) ? d : null;
  } catch { return null; }
}

export function getCycles(): CycleEntry[] {
  const cycles = storage.get<CycleEntry[]>('cycles', []);
  return cycles.filter(c => safeParse(c.startDate) !== null);
}

export function saveCycle(cycle: CycleEntry): void {
  const d = safeParse(cycle.startDate);
  if (!d) return;
  const cycles = getCycles();
  const existing = cycles.findIndex(c => c.id === cycle.id);
  if (existing >= 0) cycles[existing] = cycle;
  else cycles.unshift(cycle);
  cycles.sort((a, b) => {
    const da = safeParse(a.startDate);
    const db = safeParse(b.startDate);
    if (!da || !db) return 0;
    return db.getTime() - da.getTime();
  });
  storage.set('cycles', cycles);
}

export function getCycleLengths(cycles: CycleEntry[]): number[] {
  const lengths: number[] = [];
  for (let i = 0; i < cycles.length - 1; i++) {
    const d1 = safeParse(cycles[i].startDate);
    const d2 = safeParse(cycles[i + 1].startDate);
    if (!d1 || !d2) continue;
    const diff = differenceInDays(d1, d2);
    if (diff > 15 && diff < 60) lengths.push(diff);
  }
  return lengths;
}

export function predictNextPeriod(cycles: CycleEntry[]): { date: Date; confidence: number; daysUntil: number } {
  if (!cycles.length) {
    return { date: addDays(new Date(), 14), confidence: 0, daysUntil: 14 };
  }
  const lengths = getCycleLengths(cycles);
  const avgLength = lengths.length > 0 ? Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length) : 28;
  const lastStart = safeParse(cycles[0].startDate) ?? new Date();
  const nextDate = addDays(lastStart, avgLength);
  const daysUntil = Math.max(0, differenceInDays(nextDate, new Date()));
  const confidence = Math.min(95, Math.max(30, 50 + lengths.length * 10 - (lengths.length > 1 ? standardDeviation(lengths) * 5 : 15)));
  return { date: nextDate, confidence: Math.round(confidence), daysUntil };
}

function standardDeviation(arr: number[]): number {
  if (arr.length < 2) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return Math.sqrt(arr.reduce((sum, v) => sum + (v - mean) ** 2, 0) / arr.length);
}

export function stabilityScore(cycles: CycleEntry[]): number {
  const lengths = getCycleLengths(cycles);
  if (lengths.length < 2) return 50;
  const sd = standardDeviation(lengths);
  return Math.round(Math.max(0, Math.min(100, 100 - sd * 10)));
}

export function getCurrentPhase(dayInCycle: number): CyclePhase {
  if (dayInCycle <= 5) return 'menstrual';
  if (dayInCycle <= 13) return 'follicular';
  if (dayInCycle <= 16) return 'ovulation';
  return 'luteal';
}

export function getCycleContext(cycles: CycleEntry[]): CycleContext {
  const today = new Date();
  const lengths = getCycleLengths(cycles);
  const avgLength = lengths.length > 0 ? Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length) : 28;

  if (!cycles.length) {
    return {
      currentPhase: 'follicular', dayInCycle: 8, cycleLength: 28, daysUntilPeriod: 20,
      stabilityScore: 50, recentSymptoms: [], recentMoods: [],
      predictedNextPeriod: format(addDays(today, 20), 'yyyy-MM-dd'), confidence: 0,
    };
  }

  const lastStart = safeParse(cycles[0].startDate) ?? today;
  const dayInCycle = Math.max(1, differenceInDays(today, lastStart) + 1);
  const currentPhase = getCurrentPhase(dayInCycle > avgLength ? ((dayInCycle - 1) % avgLength) + 1 : dayInCycle);
  const prediction = predictNextPeriod(cycles);

  const recentSymptoms = storage.get<SymptomEntry[]>('symptoms', []).slice(0, 10).map(s => s.symptom);
  const recentMoods = storage.get<MoodEntry[]>('moods', []).slice(0, 10).map(m => m.mood);

  return {
    currentPhase, dayInCycle, cycleLength: avgLength,
    daysUntilPeriod: prediction.daysUntil,
    stabilityScore: stabilityScore(cycles),
    recentSymptoms, recentMoods,
    predictedNextPeriod: format(prediction.date, 'yyyy-MM-dd'),
    confidence: prediction.confidence,
  };
}

// AI Cycle Health Score
export function calculateHealthScore(cycles: CycleEntry[]): { score: number; label: string; breakdown: { regularity: number; tracking: number; stability: number } } {
  const lengths = getCycleLengths(cycles);
  const stability = stabilityScore(cycles);
  const regularity = lengths.length >= 3 ? Math.min(100, 60 + lengths.length * 5) : lengths.length * 25;
  const tracking = Math.min(100, cycles.length * 15);
  const symptoms = storage.get<SymptomEntry[]>('symptoms', []);
  const moods = storage.get<MoodEntry[]>('moods', []);
  const dataRichness = Math.min(100, (symptoms.length + moods.length) * 3);

  const score = Math.round((regularity * 0.3 + stability * 0.3 + tracking * 0.2 + dataRichness * 0.2));
  const clamped = Math.max(0, Math.min(100, score));

  let label = 'Getting Started';
  if (clamped >= 80) label = 'Excellent Flow ✨';
  else if (clamped >= 60) label = 'Balanced Harmony 🌿';
  else if (clamped >= 40) label = 'Building Awareness 🌱';

  return { score: clamped, label, breakdown: { regularity, tracking, stability } };
}

// Future prediction
export function getFuturePrediction(cycles: CycleEntry[]): { energy: string; mood: string; productivity: string; tip: string } {
  const ctx = getCycleContext(cycles);
  const futureDay = ctx.dayInCycle + 3;
  const futurePhase = getCurrentPhase(futureDay > ctx.cycleLength ? ((futureDay - 1) % ctx.cycleLength) + 1 : futureDay);

  const predictions: Record<CyclePhase, { energy: string; mood: string; productivity: string; tip: string }> = {
    menstrual: { energy: '↓ Lower energy expected', mood: 'Introspective & calm', productivity: 'Focus on gentle tasks', tip: 'Plan lighter workload and rest' },
    follicular: { energy: '↑ Energy rising!', mood: 'Optimistic & creative', productivity: 'Great productivity window', tip: 'Start new projects now' },
    ovulation: { energy: '⚡ Peak energy!', mood: 'Confident & social', productivity: 'Maximum productivity', tip: 'Schedule important meetings' },
    luteal: { energy: '→ Steady energy', mood: 'Reflective & sensitive', productivity: 'Good for routine work', tip: 'Prioritize self-care routines' },
  };

  return predictions[futurePhase];
}

// Detect irregular patterns
export function detectIrregularities(cycles: CycleEntry[]): string[] {
  const alerts: string[] = [];
  const lengths = getCycleLengths(cycles);

  if (lengths.length >= 3) {
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const sd = standardDeviation(lengths);
    if (sd > 7) alerts.push('Your cycle length varies significantly. Consider tracking more details or consulting a healthcare provider.');
    if (avg < 21) alerts.push('Your cycles appear shorter than average. This might be worth discussing with your doctor.');
    if (avg > 38) alerts.push('Your cycles appear longer than average. A check-up might provide helpful insights.');
    if (lengths.length >= 2 && Math.abs(lengths[0] - lengths[1]) > 10) {
      alerts.push('Your last two cycles had a notable difference in length. Keep tracking for clearer patterns.');
    }
  }

  return alerts;
}
