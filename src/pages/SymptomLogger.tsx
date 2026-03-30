import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ChevronDown, Check, Plus } from 'lucide-react';
import { storage } from '@/services/storage';
import type { SymptomEntry, MoodEntry } from '@/types';
import { SYMPTOM_CATEGORIES, MOODS } from '@/types';
import { generateId } from '@/lib/utils';
import { getComfortMessage } from '@/components/EmotionalSplash';
import { getRandomAffirmation } from '@/components/MicroAffirmation';

interface SymptomLoggerProps {
  userName?: string;
  onEmotionalSplash?: (message: string, symptomKey?: string) => void;
  onAffirmation?: (message: string) => void;
}

const EMOTIONAL_SYMPTOMS = ['Cramps', 'Fatigue', 'Sadness', 'Anxiety', 'Irritability', 'Headache', 'Migraine', 'Stress', 'Nausea', 'Bloating', 'Insomnia', 'Mood Swings', 'Emotional Sensitivity'];

export default function SymptomLogger({ userName = '', onEmotionalSplash, onAffirmation }: SymptomLoggerProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState('');
  const [customSymptom, setCustomSymptom] = useState('');
  const [showMoods, setShowMoods] = useState(false);
  const [logged, setLogged] = useState<string[]>([]);

  const logSymptom = (name: string, emoji: string, sev: number = severity) => {
    const symptoms = storage.get<SymptomEntry[]>('symptoms', []);
    symptoms.unshift({ id: generateId(), date: format(new Date(), 'yyyy-MM-dd'), timestamp: new Date().toISOString(), category: activeCategory || 'Quick Log', symptom: name, severity: sev, notes: notes || undefined });
    storage.set('symptoms', symptoms);
    setLogged(prev => [...prev, name]);
    toast.success(`${emoji} ${name} logged`);
    setNotes(''); setSelectedSymptom(null); setSeverity(5);

    if (EMOTIONAL_SYMPTOMS.includes(name) && sev >= 4) {
      const comfort = getComfortMessage(name);
      onEmotionalSplash?.(comfort.message, name);
    } else {
      onAffirmation?.(getRandomAffirmation());
    }
  };

  const logMood = (name: string, valence: number) => {
    const moods = storage.get<MoodEntry[]>('moods', []);
    moods.unshift({ id: generateId(), date: format(new Date(), 'yyyy-MM-dd'), timestamp: new Date().toISOString(), mood: name, valence, energy: 5, anxiety: 0 });
    storage.set('moods', moods);
    setLogged(prev => [...prev, name]);
    toast.success(`Mood: ${name} logged 💕`);

    if (valence <= -2) {
      const comfort = getComfortMessage(name);
      onEmotionalSplash?.(comfort.message, name);
    } else {
      onAffirmation?.(getRandomAffirmation());
    }
  };

  const logCustom = () => {
    if (!customSymptom.trim()) return;
    logSymptom(customSymptom.trim(), '📝', severity);
    setCustomSymptom('');
  };

  return (
    <div className="px-5 pt-6 pb-8">
      <h1 className="text-2xl font-display font-bold mb-1 text-foreground">
        {userName ? `${userName}'s Log` : 'Symptom & Mood Logger'}
      </h1>
      <p className="text-sm text-muted-foreground mb-6">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>

      {/* Mood Section */}
      <section className="mb-6">
        <button onClick={() => setShowMoods(!showMoods)} className="flex items-center justify-between w-full glass-strong rounded-2xl p-4 mb-3">
          <span className="font-semibold text-foreground">How are you feeling{userName ? `, ${userName}` : ''}?</span>
          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showMoods ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {showMoods && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="grid grid-cols-5 gap-2 mb-4">
                {MOODS.map(m => (
                  <motion.button key={m.name} whileTap={{ scale: 0.9 }} onClick={() => logMood(m.name, m.valence)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${logged.includes(m.name) ? 'bg-primary/20 ring-2 ring-primary' : 'glass hover:bg-muted'}`}
                  >
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="text-[10px] font-medium text-muted-foreground">{m.name}</span>
                    {logged.includes(m.name) && <Check className="w-3 h-3 text-primary" />}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Symptom Categories */}
      <section>
        <h2 className="font-display font-semibold mb-3 text-foreground">Log Symptoms</h2>
        <div className="space-y-2">
          {Object.entries(SYMPTOM_CATEGORIES).map(([category, symptoms]) => (
            <div key={category}>
              <button onClick={() => setActiveCategory(activeCategory === category ? null : category)}
                className="flex items-center justify-between w-full glass-strong rounded-2xl p-3.5 hover:shadow-md transition-shadow"
              >
                <span className="font-medium text-sm text-foreground">{category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{symptoms.length}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${activeCategory === category ? 'rotate-180' : ''}`} />
                </div>
              </button>
              <AnimatePresence>
                {activeCategory === category && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="grid grid-cols-2 gap-2 p-2">
                      {symptoms.map(s => (
                        <motion.button key={s.name} whileTap={{ scale: 0.95 }}
                          onClick={() => s.hasScale ? setSelectedSymptom(selectedSymptom === s.name ? null : s.name) : logSymptom(s.name, s.emoji, 5)}
                          className={`flex items-center gap-2 p-3 rounded-xl text-left transition-colors ${
                            logged.includes(s.name) ? 'bg-primary/15 ring-1 ring-primary/30' :
                            selectedSymptom === s.name ? 'bg-accent/10 ring-1 ring-accent/30' : 'bg-card hover:bg-muted'
                          }`}
                        >
                          <span className="text-xl">{s.emoji}</span>
                          <span className="text-sm font-medium flex-1 text-foreground">{s.name}</span>
                          {logged.includes(s.name) && <Check className="w-4 h-4 text-primary" />}
                        </motion.button>
                      ))}
                    </div>
                    <AnimatePresence>
                      {selectedSymptom && symptoms.some(s => s.name === selectedSymptom) && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-3 pb-3 space-y-3">
                          <div className="glass-strong rounded-2xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-foreground">{selectedSymptom} Severity</span>
                              <span className="text-lg font-bold text-primary">{severity}/10</span>
                            </div>
                            <input type="range" min={1} max={10} value={severity} onChange={e => setSeverity(Number(e.target.value))} className="w-full accent-primary" />
                            <div className="flex justify-between text-xs text-muted-foreground"><span>Mild</span><span>Moderate</span><span>Severe</span></div>
                            <textarea placeholder="Add notes (optional)..." value={notes} onChange={e => setNotes(e.target.value)}
                              className="w-full p-2 text-sm rounded-xl bg-background border border-border resize-none h-16 text-foreground placeholder:text-muted-foreground" />
                            <motion.button whileTap={{ scale: 0.97 }}
                              onClick={() => { const sym = symptoms.find(s => s.name === selectedSymptom); if (sym) logSymptom(sym.name, sym.emoji, severity); }}
                              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow-md"
                            >Log {selectedSymptom}</motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Custom Symptom */}
      <section className="mt-6">
        <h2 className="font-display font-semibold mb-3 flex items-center gap-2 text-foreground"><Plus className="w-4 h-4" /> Custom Symptom</h2>
        <div className="flex gap-2">
          <input type="text" value={customSymptom} onChange={e => setCustomSymptom(e.target.value)}
            placeholder="Describe your symptom..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground"
            onKeyDown={e => e.key === 'Enter' && logCustom()} />
          <motion.button whileTap={{ scale: 0.95 }} onClick={logCustom}
            className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-md">Log</motion.button>
        </div>
      </section>
    </div>
  );
}
