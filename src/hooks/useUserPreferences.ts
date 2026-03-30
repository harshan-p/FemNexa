import { useState, useEffect, useCallback } from 'react';
import { storage } from '@/services/storage';

export interface UserPreferences {
  name: string;
  onboarded: boolean;
  darkMode: boolean;
  comfortMode: boolean;
  dailyCheckInDone: string;
  lastMoodValence: number | null;
  lastMoodLabel: string;
  remindersEnabled: boolean;
  privacyMode: boolean;
  nightCalmMode: boolean;
}

const DEFAULT_PREFS: UserPreferences = {
  name: '',
  onboarded: false,
  darkMode: false,
  comfortMode: false,
  dailyCheckInDone: '',
  lastMoodValence: null,
  lastMoodLabel: '',
  remindersEnabled: true,
  privacyMode: false,
  nightCalmMode: false,
};

export function useUserPreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>(() =>
    storage.get<UserPreferences>('user_prefs', DEFAULT_PREFS)
  );

  useEffect(() => {
    storage.set('user_prefs', prefs);
    if (prefs.darkMode || prefs.nightCalmMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [prefs]);

  // Auto night calm mode
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 6) {
      if (!prefs.nightCalmMode) {
        setPrefs(prev => ({ ...prev, nightCalmMode: true }));
      }
    }
  }, []);

  const updatePrefs = useCallback((partial: Partial<UserPreferences>) => {
    setPrefs(prev => ({ ...prev, ...partial }));
  }, []);

  const isNegativeMood = prefs.lastMoodValence !== null && prefs.lastMoodValence < 0;

  return { prefs, updatePrefs, isNegativeMood };
}
