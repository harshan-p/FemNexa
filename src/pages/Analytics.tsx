import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Activity, Brain, Lightbulb } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { format, parseISO } from 'date-fns';
import { getCycles, getCycleLengths, stabilityScore, getCycleContext, predictNextPeriod } from '@/services/cycleEngine';
import { detectPatterns, generateHeatmapData } from '@/services/patternEngine';
import { storage } from '@/services/storage';
import type { SymptomEntry, MoodEntry } from '@/types';
import { PHASE_CONFIG } from '@/types';

export default function Analytics() {
  const cycles = getCycles();
  const symptoms = storage.get<SymptomEntry[]>('symptoms', []);
  const moods = storage.get<MoodEntry[]>('moods', []);
  const ctx = getCycleContext(cycles);
  const prediction = predictNextPeriod(cycles);
  const patterns = detectPatterns(symptoms, moods, cycles);
  const lengths = getCycleLengths(cycles);
  const heatmapData = generateHeatmapData(symptoms, cycles);

  const cycleLengthData = lengths.map((len, i) => ({ cycle: `C${lengths.length - i}`, length: len })).reverse();
  const moodData = moods.slice(0, 30).reverse().map(m => ({ date: format(parseISO(m.date), 'MMM d'), mood: m.valence, energy: m.energy }));

  const phaseDist = [
    { name: 'Menstrual', value: 5, color: PHASE_CONFIG.menstrual.hex },
    { name: 'Follicular', value: 8, color: PHASE_CONFIG.follicular.hex },
    { name: 'Ovulation', value: 3, color: PHASE_CONFIG.ovulation.hex },
    { name: 'Luteal', value: 12, color: PHASE_CONFIG.luteal.hex },
  ];

  const symptomFreq: Record<string, number> = {};
  symptoms.forEach(s => { symptomFreq[s.symptom] = (symptomFreq[s.symptom] || 0) + 1; });
  const topSymptoms = Object.entries(symptomFreq).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const hasData = cycles.length > 0 || symptoms.length > 0 || moods.length > 0;

  return (
    <div className="px-5 pt-6 pb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shadow-sm">
          <BarChart3 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold">Insights & Analytics</h1>
          <p className="text-sm text-muted-foreground">Your cycle intelligence dashboard</p>
        </div>
      </div>

      {!hasData ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-4">
            <Activity className="w-10 h-10 text-muted-foreground/40" />
          </div>
          <h2 className="text-lg font-display font-bold mb-2">Start Tracking</h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Log your period, symptoms, and mood to unlock personalized insights and pattern detection.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-5">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Avg Cycle', value: lengths.length > 0 ? `${Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length)}d` : '—', icon: '📊' },
              { label: 'Stability', value: `${Number.isFinite(stabilityScore(cycles)) ? stabilityScore(cycles) : '--'}/100`, icon: '✓' },
              { label: 'Tracked', value: `${cycles.length} cycles`, icon: '📅' },
              { label: 'Confidence', value: `${prediction?.confidence ?? '--'}%`, icon: '🎯' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-strong rounded-2xl p-4"
              >
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold mt-1 text-foreground">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Cycle Length Chart */}
          {cycleLengthData.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-strong rounded-3xl p-5"
            >
              <h3 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Cycle Length History
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={cycleLengthData}>
                  <XAxis dataKey="cycle" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[20, 40]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                  <Line type="monotone" dataKey="length" stroke="#E88B9A" strokeWidth={2.5} dot={{ fill: '#E88B9A', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.section>
          )}

          {/* Mood Graph */}
          {moodData.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-strong rounded-3xl p-5"
            >
              <h3 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
                <Brain className="w-4 h-4 text-secondary" /> Mood & Energy Trends
              </h3>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={moodData}>
                  <defs>
                    <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B8A9D9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#B8A9D9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[-5, 5]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                  <Area type="monotone" dataKey="mood" stroke="#B8A9D9" fill="url(#moodGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.section>
          )}

          {/* Phase Distribution */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-strong rounded-3xl p-5"
          >
            <h3 className="font-display font-semibold text-sm mb-3">Phase Distribution</h3>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={phaseDist} dataKey="value" innerRadius={30} outerRadius={55} paddingAngle={3}>
                    {phaseDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {phaseDist.map(p => (
                  <div key={p.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-xs text-foreground">{p.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{Math.round(p.value / 28 * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Symptom Heatmap */}
          {Object.keys(heatmapData).length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-strong rounded-3xl p-5"
            >
              <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-ovulation" /> Symptom Heatmap
              </h3>
              <div className="space-y-2 overflow-x-auto scrollbar-none">
                {Object.entries(heatmapData).slice(0, 5).map(([name, days]) => (
                  <div key={name} className="flex items-center gap-2">
                    <span className="text-xs w-20 truncate text-muted-foreground">{name}</span>
                    <div className="flex gap-px flex-1">
                      {days.map((v, i) => (
                        <div
                          key={i}
                          className="w-2 h-4 rounded-sm"
                          style={{
                            backgroundColor: v === 0 ? 'hsl(var(--muted))' :
                              v <= 3 ? '#E88B9A40' : v <= 6 ? '#E88B9A80' : '#E88B9A',
                          }}
                          title={`Day ${i + 1}: ${v}/10`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Top Symptoms */}
          {topSymptoms.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-strong rounded-3xl p-5"
            >
              <h3 className="font-display font-semibold text-sm mb-3">Most Common Symptoms</h3>
              <div className="space-y-3">
                {topSymptoms.map(([name, count]) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className="text-sm flex-1 text-foreground">{name}</span>
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / topSymptoms[0][1]) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* AI Pattern Insights */}
          {patterns.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-3"
            >
              <h3 className="font-display font-semibold text-sm flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-ovulation" /> AI Pattern Detection
              </h3>
              {patterns.slice(0, 4).map((p, i) => (
                <div
                  key={i}
                  className="glass-strong rounded-2xl p-4"
                  style={{ borderLeft: `3px solid ${PHASE_CONFIG[p.phase].hex}` }}
                >
                  <p className="text-sm font-medium text-foreground">{p.insight}</p>
                  <p className="text-xs text-muted-foreground mt-1">{p.recommendation}</p>
                </div>
              ))}
            </motion.section>
          )}
        </div>
      )}
    </div>
  );
}
