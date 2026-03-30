import { differenceInDays, parseISO } from 'date-fns';
import type { SymptomEntry, MoodEntry, CycleEntry, PatternInsight, CyclePhase } from '@/types';

export function detectPatterns(symptoms: SymptomEntry[], moods: MoodEntry[], cycles: CycleEntry[]): PatternInsight[] {
  if (cycles.length < 2 || symptoms.length < 5) return [];
  const insights: PatternInsight[] = [];
  const phaseSymptoms: Record<CyclePhase, Record<string, number>> = {
    menstrual: {}, follicular: {}, ovulation: {}, luteal: {},
  };

  for (const s of symptoms) {
    const sDate = parseISO(s.date);
    let phase: CyclePhase = 'follicular';
    for (let i = 0; i < cycles.length; i++) {
      const cycleStart = parseISO(cycles[i].startDate);
      const dayDiff = differenceInDays(sDate, cycleStart);
      if (dayDiff >= 0 && dayDiff < 45) {
        if (dayDiff < 5) phase = 'menstrual';
        else if (dayDiff < 13) phase = 'follicular';
        else if (dayDiff < 17) phase = 'ovulation';
        else phase = 'luteal';
        break;
      }
    }
    phaseSymptoms[phase][s.symptom] = (phaseSymptoms[phase][s.symptom] || 0) + 1;
  }

  const totalCycles = Math.max(cycles.length - 1, 1);
  for (const [phase, symptomMap] of Object.entries(phaseSymptoms) as [CyclePhase, Record<string, number>][]) {
    for (const [symptom, count] of Object.entries(symptomMap)) {
      const freq = Math.round((count / totalCycles) * 100);
      if (freq >= 50 && count >= 2) {
        insights.push({
          symptom, phase, frequency: freq,
          insight: `${symptom} occurs in ~${freq}% of your ${phase} phases`,
          recommendation: getRecommendation(symptom),
        });
      }
    }
  }

  const phaseMoods: Record<CyclePhase, number[]> = { menstrual: [], follicular: [], ovulation: [], luteal: [] };
  for (const m of moods) {
    const mDate = parseISO(m.date);
    for (let i = 0; i < cycles.length; i++) {
      const cycleStart = parseISO(cycles[i].startDate);
      const dayDiff = differenceInDays(mDate, cycleStart);
      if (dayDiff >= 0 && dayDiff < 45) {
        let phase: CyclePhase = 'follicular';
        if (dayDiff < 5) phase = 'menstrual';
        else if (dayDiff < 13) phase = 'follicular';
        else if (dayDiff < 17) phase = 'ovulation';
        else phase = 'luteal';
        phaseMoods[phase].push(m.valence);
        break;
      }
    }
  }

  for (const [phase, valences] of Object.entries(phaseMoods) as [CyclePhase, number[]][]) {
    if (valences.length >= 3) {
      const avg = valences.reduce((a, b) => a + b, 0) / valences.length;
      if (avg <= -2) {
        insights.push({
          symptom: 'Low Mood', phase, frequency: 100,
          insight: `Your mood tends to dip during the ${phase} phase`,
          recommendation: 'Consider extra self-care activities and mood-boosting strategies during this phase.',
        });
      }
    }
  }

  return insights.sort((a, b) => b.frequency - a.frequency);
}

function getRecommendation(symptom: string): string {
  const recs: Record<string, string> = {
    'Cramps': 'Heat therapy, gentle stretching, and anti-inflammatory foods can help.',
    'Headache': 'Stay hydrated, manage stress, and consider tracking food triggers.',
    'Fatigue': 'Prioritize sleep, eat iron-rich foods, and take short rest breaks.',
    'Bloating': 'Reduce sodium intake, drink more water, and try gentle movement.',
    'Anxiety': 'Practice breathing exercises, limit caffeine, and try journaling.',
    'Sadness': 'Connect with loved ones, practice self-compassion, and try creative outlets.',
    'Insomnia': 'Maintain sleep hygiene, avoid screens before bed, try magnesium.',
    'Breast Tenderness': 'Wear supportive bras, reduce caffeine, try evening primrose oil.',
    'Acne': 'Keep skincare gentle, stay hydrated, reduce dairy and sugar.',
    'Irritability': 'Practice grounding exercises, take breaks, communicate your needs.',
  };
  return recs[symptom] || 'Track triggers and patterns to find what works best for you.';
}

export function generateHeatmapData(symptoms: SymptomEntry[], cycles: CycleEntry[]): Record<string, number[]> {
  const heatmap: Record<string, number[]> = {};
  const uniqueSymptoms = [...new Set(symptoms.map(s => s.symptom))];
  for (const symptomName of uniqueSymptoms.slice(0, 6)) {
    heatmap[symptomName] = new Array(28).fill(0);
    for (const s of symptoms.filter(x => x.symptom === symptomName)) {
      const sDate = parseISO(s.date);
      for (const cycle of cycles) {
        const cycleStart = parseISO(cycle.startDate);
        const day = differenceInDays(sDate, cycleStart);
        if (day >= 0 && day < 28) {
          heatmap[symptomName][day] = Math.max(heatmap[symptomName][day], s.severity);
        }
      }
    }
  }
  return heatmap;
}

// Behavioral insight generation
export function generateBehavioralInsights(symptoms: SymptomEntry[], moods: MoodEntry[], cycles: CycleEntry[]): string[] {
  const insights: string[] = [];
  
  // Check pre-period low moods
  const lowMoodBeforePeriod = moods.filter(m => {
    const mDate = parseISO(m.date);
    for (const cycle of cycles) {
      const cycleStart = parseISO(cycle.startDate);
      const dayDiff = differenceInDays(cycleStart, mDate);
      if (dayDiff >= 1 && dayDiff <= 5 && m.valence <= -2) return true;
    }
    return false;
  });
  
  if (lowMoodBeforePeriod.length >= 2) {
    insights.push('You often feel low 3-5 days before your period. This is common and related to hormonal shifts.');
  }

  // Check fatigue patterns
  const fatigueEntries = symptoms.filter(s => s.symptom === 'Fatigue' || s.symptom === 'Low Energy');
  if (fatigueEntries.length >= 3) {
    insights.push('Fatigue is one of your most frequent symptoms. Try iron-rich foods and prioritize rest.');
  }

  // Check headache + menstrual correlation
  const menstrualHeadaches = symptoms.filter(s => {
    if (s.symptom !== 'Headache' && s.symptom !== 'Migraine') return false;
    const sDate = parseISO(s.date);
    for (const cycle of cycles) {
      const cycleStart = parseISO(cycle.startDate);
      const dayDiff = differenceInDays(sDate, cycleStart);
      if (dayDiff >= 0 && dayDiff < 5) return true;
    }
    return false;
  });

  if (menstrualHeadaches.length >= 2) {
    insights.push('You tend to get headaches during menstruation. Hydration and magnesium may help.');
  }

  if (insights.length === 0 && symptoms.length > 0) {
    insights.push('Keep logging to unlock more personalized insights about your patterns 💜');
  }

  return insights;
}
