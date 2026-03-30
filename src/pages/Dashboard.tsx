import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, addMonths, subMonths, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Droplets, Sparkles, Lightbulb, AlertTriangle, Moon, Flower2, Sun, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { getCycles, saveCycle, getCycleContext, predictNextPeriod, getFuturePrediction, detectIrregularities } from '@/services/cycleEngine';
import { generateBehavioralInsights } from '@/services/patternEngine';
import { storage } from '@/services/storage';
import type { CycleEntry, SymptomEntry, MoodEntry, CyclePhase } from '@/types';
import { PHASE_CONFIG } from '@/types';
import { cn, generateId } from '@/lib/utils';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  userName?: string;
  comfortMode?: boolean;
  isNegativeMood?: boolean;
  privacyMode?: boolean;
}

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// Circular Progress Ring
function CircularProgress({ value, size = 180, strokeWidth = 12, color, children }: {
  value: number; size?: number; strokeWidth?: number; color: string; children?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="ringStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="url(#ringGrad)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="url(#ringStroke)" strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
          filter={`drop-shadow(0 0 8px ${color}40)`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

// Phase Timeline
function PhaseTimeline({ currentPhase }: { currentPhase: CyclePhase }) {
  const phases: { phase: CyclePhase; icon: React.ReactNode }[] = [
    { phase: 'menstrual', icon: <Moon className="w-3.5 h-3.5" /> },
    { phase: 'follicular', icon: <Flower2 className="w-3.5 h-3.5" /> },
    { phase: 'ovulation', icon: <Sun className="w-3.5 h-3.5" /> },
    { phase: 'luteal', icon: <Zap className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex items-center justify-between gap-1">
      {phases.map(({ phase, icon }, i) => {
        const config = PHASE_CONFIG[phase];
        const isActive = phase === currentPhase;
        return (
          <div key={phase} className="flex items-center flex-1">
            <motion.div
              animate={isActive ? { scale: [1, 1.08, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-[10px] font-medium transition-all w-full justify-center',
                isActive ? 'shadow-sm' : 'opacity-40'
              )}
              style={isActive ? {
                backgroundColor: config.hex + '25',
                color: config.hex,
                border: `1px solid ${config.hex}40`,
              } : { color: config.hex }}
            >
              {icon}
              <span className="hidden min-[340px]:inline">{config.name}</span>
            </motion.div>
            {i < phases.length - 1 && (
              <div className="w-2 h-px mx-0.5 flex-shrink-0" style={{ backgroundColor: config.hex + '30' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Phase Calendar
function PhaseCalendar({ cycles }: { cycles: CycleEntry[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start, end });
  const startDay = getDay(start);
  const ctx = getCycleContext(cycles);
  const prediction = predictNextPeriod(cycles);

  const getDayInfo = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const isCycleStart = cycles.some(c => c.startDate === dateStr);
    const isPredicted = prediction && format(prediction.date, 'yyyy-MM-dd') === dateStr;
    const today = new Date();
    if (isSameDay(date, today)) return { isToday: true, isCycleStart, isPredicted };
    return { isToday: false, isCycleStart, isPredicted };
  };

  return (
    <div className="glass-strong rounded-3xl p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <h3 className="text-sm font-display font-bold text-foreground">{format(currentMonth, 'MMMM yyyy')}</h3>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startDay }).map((_, i) => <div key={`e-${i}`} />)}
        {days.map(day => {
          const info = getDayInfo(day);
          return (
            <motion.div
              key={day.toISOString()}
              whileTap={{ scale: 0.9 }}
              className={cn(
                'aspect-square flex items-center justify-center rounded-xl text-xs font-medium relative cursor-pointer transition-all',
                info.isToday && 'ring-2 ring-primary ring-offset-1 ring-offset-background',
                info.isCycleStart && 'bg-primary text-primary-foreground shadow-sm',
                info.isPredicted && !info.isCycleStart && 'bg-primary/15 text-primary border border-dashed border-primary/30',
                !info.isCycleStart && !info.isPredicted && 'text-foreground hover:bg-muted',
              )}
            >
              {format(day, 'd')}
            </motion.div>
          );
        })}
      </div>
      <div className="flex justify-center gap-3 mt-4 flex-wrap">
        {Object.entries(PHASE_CONFIG).map(([key, config]) => (
          <div key={key} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.hex }} />
            <span className="text-[9px] text-muted-foreground">{config.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard({ onNavigate, userName = '', comfortMode = false, isNegativeMood = false, privacyMode = false }: DashboardProps) {
  const [cycles, setCycles] = useState<CycleEntry[]>(() => { try { return getCycles(); } catch { return []; } });

  const loadData = useCallback(() => { try { setCycles(getCycles()); } catch { setCycles([]); } }, []);

  const ctx = getCycleContext(cycles);
  const phaseConfig = PHASE_CONFIG[ctx.currentPhase] ?? PHASE_CONFIG.menstrual;
  const prediction = predictNextPeriod(cycles);
  const futurePred = getFuturePrediction(cycles);
  const irregularities = detectIrregularities(cycles);
  const symptoms = storage.get<SymptomEntry[]>('symptoms', []);
  const moods = storage.get<MoodEntry[]>('moods', []);
  const behavioralInsights = generateBehavioralInsights(symptoms, moods, cycles);

  const progressPercent = cycles.length > 0 && ctx.cycleLength > 0
    ? Math.min(100, (ctx.dayInCycle / ctx.cycleLength) * 100)
    : 0;

  const logPeriod = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    if (cycles.find(c => c.startDate === today)) { toast.info('Period already logged for today'); return; }
    saveCycle({ id: generateId(), startDate: today });
    loadData();
    toast.success('Period logged! Take care of yourself 💗');
    confetti({ particleCount: 60, spread: 70, colors: ['#E88B9A', '#B8A9D9', '#F4C19F'], origin: { y: 0.6 } });
  };

  const quickMoodLog = (name: string, valence: number) => {
    const ms = storage.get<MoodEntry[]>('moods', []);
    ms.unshift({ id: generateId(), date: format(new Date(), 'yyyy-MM-dd'), timestamp: new Date().toISOString(), mood: name, valence, energy: 5, anxiety: 0 });
    storage.set('moods', ms);
    toast.success(`Feeling ${name.toLowerCase()} — heard 💜`);
  };

  const quickEmotions = [
    { emoji: '😊', name: 'Happy', valence: 4 },
    { emoji: '😌', name: 'Calm', valence: 2 },
    { emoji: '😴', name: 'Tired', valence: -1 },
    { emoji: '😰', name: 'Anxious', valence: -2 },
    { emoji: '😢', name: 'Sad', valence: -3 },
    { emoji: '🤩', name: 'Amazing', valence: 5 },
  ];

  const todayTip = phaseConfig.tips[Math.floor(Math.random() * phaseConfig.tips.length)];

  return (
    <div className="pb-24 relative">
      {/* Hero with Circular Ring */}
      <div className="px-5 pt-4 pb-6">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <h1 className="text-2xl font-display font-bold text-foreground mb-1">
            {getTimeGreeting()}{userName ? `, ${userName}` : ''} 💜
          </h1>
          <p className="text-xs text-muted-foreground/60">{format(new Date(), 'EEEE, MMMM d')}</p>
        </motion.div>

        {/* Circular Progress Hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="flex flex-col items-center mb-5"
        >
          <CircularProgress value={progressPercent} color={phaseConfig.hex} size={200} strokeWidth={14}>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="text-4xl mb-1"
            >
              {phaseConfig.emoji}
            </motion.span>
            <span className="text-2xl font-bold text-foreground">
              Day {privacyMode ? '••' : ctx.dayInCycle}
            </span>
            <span className="text-xs text-muted-foreground">{phaseConfig.name} Phase</span>
          </CircularProgress>
        </motion.div>

        {/* Phase Timeline */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <PhaseTimeline currentPhase={ctx.currentPhase} />
        </motion.div>

        {/* Log Period CTA */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          whileTap={{ scale: 0.97 }}
          onClick={logPeriod}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-sm shadow-lg text-primary-foreground mt-5"
          style={{ background: `linear-gradient(135deg, ${phaseConfig.hex}, ${PHASE_CONFIG.luteal.hex})`, boxShadow: `0 8px 24px ${phaseConfig.hex}30` }}
        >
          <Droplets className="w-5 h-5" />
          Log Period
        </motion.button>
      </div>

      <div className="px-5 space-y-4">
        {/* AI Insight Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-strong rounded-3xl p-5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10" style={{ backgroundColor: phaseConfig.hex, filter: 'blur(20px)' }} />
          <div className="flex items-start gap-3 relative z-10">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm" style={{ backgroundColor: phaseConfig.hex + '20' }}>
              <Sparkles className="w-5 h-5" style={{ color: phaseConfig.hex }} />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-sm mb-1 text-foreground">
                {isNegativeMood ? '💜 I\'m Here For You' : 'Your Body Today'}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isNegativeMood
                  ? `${userName ? userName + ', t' : 'T'}ake it easy today. Your feelings are valid and this will pass. 💜`
                  : todayTip}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Mood */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-strong rounded-2xl p-4"
        >
          <p className="text-sm font-display font-semibold text-foreground mb-3">How are you feeling?</p>
          <div className="flex justify-between">
            {quickEmotions.map((e, i) => (
              <motion.button
                key={e.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.04 }}
                whileHover={{ scale: 1.12, y: -2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => quickMoodLog(e.name, e.valence)}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <span className="text-xl">{e.emoji}</span>
                <span className="text-[10px] text-muted-foreground font-medium">{e.name}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Horizontal Stats */}
        <div className="flex gap-3 overflow-x-auto scrollbar-none -mx-5 px-5">
          {[
            { label: 'Next Period', value: `${prediction?.daysUntil ?? '--'}d`, sub: prediction ? format(prediction.date, 'MMM d') : '—' },
            { label: 'Confidence', value: `${prediction?.confidence ?? '--'}%`, sub: 'Prediction' },
            { label: 'Stability', value: `${ctx.stabilityScore}`, sub: 'Score /100' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + i * 0.08 }}
              className="glass-strong rounded-2xl p-4 min-w-[110px] flex-shrink-0"
            >
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Irregularity Alerts */}
        {irregularities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl p-4 space-y-2"
            style={{ background: `linear-gradient(135deg, ${PHASE_CONFIG.menstrual.hex}12, ${PHASE_CONFIG.luteal.hex}12)`, border: `1px solid ${PHASE_CONFIG.menstrual.hex}25` }}
          >
            {irregularities.map((alert, i) => (
              <div key={i} className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: PHASE_CONFIG.menstrual.hex }} />
                <p className="text-xs text-muted-foreground">{alert}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Behavioral Insights */}
        {behavioralInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="space-y-2"
          >
            <h3 className="text-sm font-display font-semibold flex items-center gap-2 text-foreground">
              <Lightbulb className="w-4 h-4" style={{ color: PHASE_CONFIG.ovulation.hex }} /> Smart Insights
            </h3>
            {behavioralInsights.slice(0, 3).map((insight, i) => (
              <div key={i} className="glass rounded-2xl p-3.5">
                <p className="text-xs text-muted-foreground leading-relaxed">{insight}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Phase Forecast */}
        {futurePred && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-strong rounded-3xl p-4"
          >
            <h3 className="text-sm font-display font-semibold mb-3 text-foreground">🔮 Phase Forecast</h3>
            <div className="space-y-2">
              {[
                { label: '⚡ Energy', value: futurePred.energy },
                { label: '💭 Mood', value: futurePred.mood },
                { label: '📈 Productivity', value: futurePred.productivity },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-xs text-muted-foreground w-24 flex-shrink-0">{item.label}</span>
                  <span className="text-xs text-foreground">{item.value}</span>
                </div>
              ))}
              <div className="mt-2 pt-2 border-t border-border/30">
                <p className="text-xs text-muted-foreground italic">💡 {futurePred.tip}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Comfort Mode Banner */}
        {comfortMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-4 text-center"
            style={{ background: `linear-gradient(135deg, ${phaseConfig.hex}12, ${PHASE_CONFIG.luteal.hex}12)`, border: `1px solid ${phaseConfig.hex}20` }}
          >
            <p className="text-xs text-muted-foreground">🧘 Comfort Mode is on • Breathe and be gentle</p>
          </motion.div>
        )}

        {/* Calendar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
          <PhaseCalendar cycles={cycles} />
        </motion.div>

        {/* Daily Affirmation */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-3xl p-5 text-center"
          style={{
            background: `linear-gradient(135deg, ${phaseConfig.hex}18, ${phaseConfig.hex}08)`,
            border: `1px solid ${phaseConfig.hex}25`,
          }}
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Daily Affirmation</p>
          <p className="text-sm font-medium italic text-foreground/80 leading-relaxed">
            "{phaseConfig.affirmations[Math.floor(Math.random() * phaseConfig.affirmations.length)]}"
          </p>
        </motion.section>
      </div>
    </div>
  );
}
