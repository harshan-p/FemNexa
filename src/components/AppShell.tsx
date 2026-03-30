import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, BarChart3, MessageCircle, Heart, Settings, BookOpen, Plus, X, Droplets, Smile } from 'lucide-react';
import Dashboard from '@/pages/Dashboard';
import Analytics from '@/pages/Analytics';
import Chatbot from '@/pages/Chatbot';
import Wellness from '@/pages/Wellness';
import SymptomLogger from '@/pages/SymptomLogger';
import SettingsPage from '@/pages/Settings';
import DailyCheckIn from '@/components/DailyCheckIn';
import EmotionalSplash from '@/components/EmotionalSplash';
import MicroAffirmation from '@/components/MicroAffirmation';
import ReminderNotification from '@/components/ReminderNotification';
import EndOfDayCard from '@/components/EndOfDayCard';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type PageId = 'home' | 'log' | 'chat' | 'wellness' | 'analytics' | 'settings';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <div className="p-6 text-center"><p className="text-destructive font-semibold">Something went wrong.</p></div>;
    return this.props.children;
  }
}

export default function AppShell() {
  const [active, setActive] = useState<PageId>('home');
  const [fabOpen, setFabOpen] = useState(false);
  const { prefs, updatePrefs, isNegativeMood } = useUserPreferences();
  const today = format(new Date(), 'yyyy-MM-dd');
  const [showCheckIn, setShowCheckIn] = useState(prefs.dailyCheckInDone !== today);
  const [emotionalSplash, setEmotionalSplash] = useState<{ show: boolean; message: string; symptomKey?: string }>({ show: false, message: '' });
  const [affirmation, setAffirmation] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [showEndOfDay, setShowEndOfDay] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 21 && prefs.dailyCheckInDone === today) {
      const dismissed = sessionStorage.getItem('eod_dismissed');
      if (!dismissed) { const timer = setTimeout(() => setShowEndOfDay(true), 10000); return () => clearTimeout(timer); }
    }
  }, [today, prefs.dailyCheckInDone]);

  const handleCheckInComplete = useCallback((valence: number, label: string) => {
    updatePrefs({ dailyCheckInDone: today, lastMoodValence: valence, lastMoodLabel: label });
    setShowCheckIn(false);
  }, [today, updatePrefs]);

  const triggerEmotionalSplash = useCallback((message: string, symptomKey?: string) => {
    setEmotionalSplash({ show: true, message, symptomKey });
  }, []);

  const triggerAffirmation = useCallback((message: string) => {
    setAffirmation({ show: false, message: '' });
    setTimeout(() => setAffirmation({ show: true, message }), 50);
  }, []);

  const navigateTo = (page: PageId) => {
    setActive(page);
    setFabOpen(false);
  };

  const page = {
    home: <Dashboard onNavigate={(tab: string) => setActive(tab as PageId)} userName={prefs.name} comfortMode={prefs.comfortMode} isNegativeMood={isNegativeMood} privacyMode={prefs.privacyMode} />,
    log: <SymptomLogger userName={prefs.name} onEmotionalSplash={triggerEmotionalSplash} onAffirmation={triggerAffirmation} />,
    chat: <Chatbot userName={prefs.name} comfortMode={prefs.comfortMode} />,
    wellness: <Wellness userName={prefs.name} comfortMode={prefs.comfortMode} isNegativeMood={isNegativeMood} />,
    analytics: <Analytics />,
    settings: <SettingsPage />,
  }[active];

  // Sidebar nav items (top section)
  const navItems: { id: PageId; icon: React.ElementType; label: string }[] = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'log', icon: BookOpen, label: 'Log' },
    { id: 'chat', icon: MessageCircle, label: 'Talk' },
    { id: 'wellness', icon: Heart, label: 'Heal' },
    { id: 'analytics', icon: BarChart3, label: 'Insights' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  // FAB quick actions
  const fabActions = [
    { icon: Droplets, label: 'Log Period', color: 'hsl(var(--primary))', action: () => navigateTo('home') },
    { icon: Smile, label: 'Log Mood', color: 'hsl(var(--secondary))', action: () => navigateTo('log') },
    { icon: MessageCircle, label: 'Talk to AI', color: 'hsl(var(--accent))', action: () => navigateTo('chat') },
    { icon: Heart, label: 'Wellness', color: 'hsl(var(--primary))', action: () => navigateTo('wellness') },
  ];

  return (
    <div className="flex flex-col h-[100dvh] bg-background relative overflow-hidden">
      {/* Ambient gradient background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full opacity-20 animate-float-gradient"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.3), transparent)' }} />
        <div className="absolute bottom-20 left-0 w-[250px] h-[250px] rounded-full opacity-15 animate-float-gradient"
          style={{ background: 'radial-gradient(circle, hsl(var(--secondary) / 0.3), transparent)', animationDelay: '3s' }} />
        <div className="absolute top-1/2 right-1/4 w-[200px] h-[200px] rounded-full opacity-10 animate-breathe"
          style={{ background: 'radial-gradient(circle, hsl(var(--accent) / 0.25), transparent)' }} />
      </div>

      {/* Header bar */}
      <div className="relative z-10 px-5 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
            <span className="text-lg">✿</span>
          </div>
          <div>
            <h1 className="text-sm font-display font-bold text-foreground leading-tight">FemNexa</h1>
            <p className="text-[10px] text-muted-foreground">Your caring companion</p>
          </div>
        </div>
        <button onClick={() => navigateTo('settings')} className="w-9 h-9 rounded-2xl glass flex items-center justify-center">
          <Settings className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Horizontal page nav — pill style */}
      <div className="relative z-10 px-4 py-2">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {navItems.filter(n => n.id !== 'settings').map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-medium whitespace-nowrap transition-all duration-300',
                active === id
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'glass text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="min-h-full"
          >
            <ErrorBoundary key={active}>{page}</ErrorBoundary>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-5 z-40" style={{ maxWidth: '420px' }}>
        <AnimatePresence>
          {fabOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/60 backdrop-blur-sm z-30"
                onClick={() => setFabOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                className="absolute bottom-16 right-0 z-40 space-y-2"
              >
                {fabActions.map((action, i) => (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={action.action}
                    className="flex items-center gap-3 ml-auto"
                  >
                    <span className="text-xs font-medium text-foreground bg-card px-3 py-1.5 rounded-xl shadow-lg border border-border/50">
                      {action.label}
                    </span>
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
                      style={{ background: action.color }}>
                      <action.icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setFabOpen(!fabOpen)}
          className={cn(
            'relative z-40 w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-colors duration-300',
            fabOpen ? 'bg-foreground' : 'bg-gradient-to-br from-primary to-secondary'
          )}
          style={{ boxShadow: fabOpen ? undefined : '0 8px 30px hsl(var(--primary) / 0.35)' }}
        >
          <motion.div animate={{ rotate: fabOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
            {fabOpen ? <X className="w-6 h-6 text-background" /> : <Plus className="w-6 h-6 text-primary-foreground" />}
          </motion.div>
        </motion.button>
      </div>

      {/* Overlays */}
      <AnimatePresence>{showCheckIn && <DailyCheckIn userName={prefs.name} onComplete={handleCheckInComplete} onDismiss={() => { setShowCheckIn(false); updatePrefs({ dailyCheckInDone: today }); }} />}</AnimatePresence>
      <EmotionalSplash show={emotionalSplash.show} message={emotionalSplash.message} userName={prefs.name} symptomKey={emotionalSplash.symptomKey} onDismiss={() => setEmotionalSplash({ show: false, message: '' })} />
      <MicroAffirmation show={affirmation.show} message={affirmation.message} />
      <ReminderNotification userName={prefs.name} enabled={prefs.remindersEnabled} />
      <EndOfDayCard show={showEndOfDay} userName={prefs.name} onDismiss={() => { setShowEndOfDay(false); sessionStorage.setItem('eod_dismissed', 'true'); }} />
    </div>
  );
}
