import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'sonner';
import SplashScreen from './components/SplashScreen';
import AppShell from './components/AppShell';
import OnboardingModal from './components/OnboardingModal';
import { useUserPreferences } from './hooks/useUserPreferences';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const { prefs, updatePrefs } = useUserPreferences();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleOnboarding = (name: string) => {
    updatePrefs({ name, onboarded: true });
  };

  return (
    <div className="min-h-screen bg-muted flex justify-center">
      <div className="w-full max-w-[420px] min-h-screen bg-background shadow-2xl overflow-hidden border border-border">
        <Toaster position="top-center" richColors />
        <AnimatePresence mode="wait">
          {showSplash ? (
            <SplashScreen key="splash" />
          ) : !prefs.onboarded ? (
            <OnboardingModal key="onboarding" onComplete={handleOnboarding} />
          ) : (
            <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="h-screen">
              <AppShell />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
