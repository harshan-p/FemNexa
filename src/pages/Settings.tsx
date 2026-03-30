import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Download, Trash2, Eye, EyeOff, Lock, Database, Info, ChevronRight, Moon as MoonIcon, Sun, Heart, Bell, BellOff, User } from 'lucide-react';
import { toast } from 'sonner';
import { storage } from '@/services/storage';
import { useUserPreferences } from '@/hooks/useUserPreferences';

export default function SettingsPage() {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { prefs, updatePrefs } = useUserPreferences();

  const dataSize = (storage.getStorageSize() / 1024).toFixed(1);

  const exportData = () => {
    const data = storage.exportAll();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `femnexa_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully 📁');
  };

  const deleteAllData = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      toast.warning('Tap again to confirm permanent deletion');
      setTimeout(() => setConfirmDelete(false), 5000);
      return;
    }
    storage.clearAll();
    setConfirmDelete(false);
    toast.success('All data permanently deleted');
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="px-5 pt-6 pb-8">
      <h1 className="text-2xl font-display font-bold mb-6 text-foreground">Settings</h1>

      {/* Profile Section */}
      <section className="glass-strong rounded-3xl p-5 mb-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
            <User className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-display font-bold text-foreground text-lg">{prefs.name || 'Friend'}</p>
            <p className="text-xs text-muted-foreground">Your wellness companion</p>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Display Name</label>
          <input
            type="text"
            value={prefs.name}
            onChange={e => updatePrefs({ name: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground"
            placeholder="What should I call you?"
          />
        </div>
      </section>

      {/* Appearance & Comfort */}
      <section className="space-y-2 mb-5">
        <h3 className="font-display font-semibold text-sm mb-2 text-foreground">Appearance & Comfort</h3>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => updatePrefs({ darkMode: !prefs.darkMode })}
          className="w-full glass-strong rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
        >
          {prefs.darkMode ? <MoonIcon className="w-5 h-5 text-secondary" /> : <Sun className="w-5 h-5 text-ovulation" />}
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-foreground">Dark Mode</p>
            <p className="text-xs text-muted-foreground">{prefs.darkMode ? 'On — Easier on the eyes' : 'Off — Light and bright'}</p>
          </div>
          <div className={`w-12 h-7 rounded-full transition-colors flex items-center px-1 ${prefs.darkMode ? 'bg-primary' : 'bg-muted'}`}>
            <motion.div
              layout
              className="w-5 h-5 rounded-full bg-primary-foreground shadow-sm"
              style={{ marginLeft: prefs.darkMode ? 'auto' : 0 }}
            />
          </div>
        </button>

        {/* Comfort Mode Toggle */}
        <button
          onClick={() => updatePrefs({ comfortMode: !prefs.comfortMode })}
          className="w-full glass-strong rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
        >
          <Heart className={`w-5 h-5 ${prefs.comfortMode ? 'text-primary' : 'text-muted-foreground'}`} />
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-foreground">Comfort Mode</p>
            <p className="text-xs text-muted-foreground">{prefs.comfortMode ? 'On — Extra gentle experience' : 'Off — Standard experience'}</p>
          </div>
          <div className={`w-12 h-7 rounded-full transition-colors flex items-center px-1 ${prefs.comfortMode ? 'bg-primary' : 'bg-muted'}`}>
            <motion.div
              layout
              className="w-5 h-5 rounded-full bg-primary-foreground shadow-sm"
              style={{ marginLeft: prefs.comfortMode ? 'auto' : 0 }}
            />
          </div>
        </button>

        {/* Privacy Mode Toggle */}
        <button
          onClick={() => updatePrefs({ privacyMode: !prefs.privacyMode })}
          className="w-full glass-strong rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
        >
          {prefs.privacyMode ? <EyeOff className="w-5 h-5 text-primary" /> : <Eye className="w-5 h-5 text-muted-foreground" />}
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-foreground">🔒 Privacy Mode</p>
            <p className="text-xs text-muted-foreground">{prefs.privacyMode ? 'On — Sensitive data blurred' : 'Off — All data visible'}</p>
          </div>
          <div className={`w-12 h-7 rounded-full transition-colors flex items-center px-1 ${prefs.privacyMode ? 'bg-primary' : 'bg-muted'}`}>
            <motion.div layout className="w-5 h-5 rounded-full bg-primary-foreground shadow-sm" style={{ marginLeft: prefs.privacyMode ? 'auto' : 0 }} />
          </div>
        </button>

        {/* Reminders Toggle */}
        <button
          onClick={() => updatePrefs({ remindersEnabled: !prefs.remindersEnabled })}
          className="w-full glass-strong rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
        >
          {prefs.remindersEnabled ? <Bell className="w-5 h-5 text-accent" /> : <BellOff className="w-5 h-5 text-muted-foreground" />}
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-foreground">Gentle Reminders</p>
            <p className="text-xs text-muted-foreground">{prefs.remindersEnabled ? 'On — Caring check-ins' : 'Off — No notifications'}</p>
          </div>
          <div className={`w-12 h-7 rounded-full transition-colors flex items-center px-1 ${prefs.remindersEnabled ? 'bg-primary' : 'bg-muted'}`}>
            <motion.div
              layout
              className="w-5 h-5 rounded-full bg-primary-foreground shadow-sm"
              style={{ marginLeft: prefs.remindersEnabled ? 'auto' : 0 }}
            />
          </div>
        </button>
      </section>

      {/* Privacy Badge */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-5 mb-5 glass-strong"
        style={{ borderLeft: '3px solid hsl(var(--accent))' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="font-display font-bold text-foreground">Privacy First</h2>
            <p className="text-xs text-muted-foreground">Your data never leaves your device</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-accent/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-accent-foreground">100%</p>
            <p className="text-xs text-muted-foreground">On Device</p>
          </div>
          <div className="bg-accent/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-accent-foreground">0%</p>
            <p className="text-xs text-muted-foreground">In Cloud</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
          <Lock className="w-3 h-3" />
          <span>Encrypted local storage • No tracking</span>
        </div>
      </motion.div>

      {/* Data Management */}
      <section className="space-y-2 mb-5">
        <h3 className="font-display font-semibold text-sm mb-2 text-foreground">Data Management</h3>
        <div className="glass-strong rounded-2xl p-4 flex items-center gap-3">
          <Database className="w-5 h-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Storage Used</p>
            <p className="text-xs text-muted-foreground">{dataSize} KB on device</p>
          </div>
        </div>
        <button onClick={exportData} className="w-full glass-strong rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
          <Download className="w-5 h-5 text-primary" />
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-foreground">Export Data</p>
            <p className="text-xs text-muted-foreground">Download as JSON file</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
        <button onClick={deleteAllData}
          className={`w-full rounded-2xl p-4 flex items-center gap-3 transition-colors ${confirmDelete ? 'bg-destructive/10 border border-destructive/30' : 'glass-strong hover:shadow-md'}`}
        >
          <Trash2 className={`w-5 h-5 ${confirmDelete ? 'text-destructive' : 'text-destructive/60'}`} />
          <div className="flex-1 text-left">
            <p className={`text-sm font-medium ${confirmDelete ? 'text-destructive' : 'text-foreground'}`}>
              {confirmDelete ? 'Tap again to confirm' : 'Delete All Data'}
            </p>
            <p className="text-xs text-muted-foreground">Permanently remove everything</p>
          </div>
        </button>
      </section>

      {/* Privacy & Disclaimer */}
      <section className="space-y-2 mb-5">
        <button onClick={() => setShowPrivacy(!showPrivacy)} className="w-full glass-strong rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
          {showPrivacy ? <EyeOff className="w-5 h-5 text-muted-foreground" /> : <Eye className="w-5 h-5 text-muted-foreground" />}
          <div className="flex-1 text-left"><p className="text-sm font-medium text-foreground">Privacy Policy</p></div>
          <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${showPrivacy ? 'rotate-90' : ''}`} />
        </button>
        {showPrivacy && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-strong rounded-2xl p-4 text-xs text-muted-foreground leading-relaxed space-y-2">
            <p><strong className="text-foreground">FemNexa Privacy Policy</strong></p>
            <p>FemNexa stores ALL your health data exclusively on your device. We never collect, transmit, or sell your personal information.</p>
            <p><strong className="text-foreground">Your rights:</strong> Export all data (JSON), edit any logged info, or permanently delete everything with one tap.</p>
          </motion.div>
        )}
      </section>

      <section>
        <button onClick={() => setShowDisclaimer(!showDisclaimer)} className="w-full glass-strong rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
          <Info className="w-5 h-5 text-ovulation" />
          <div className="flex-1 text-left"><p className="text-sm font-medium text-foreground">Medical Disclaimer</p></div>
          <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${showDisclaimer ? 'rotate-90' : ''}`} />
        </button>
        {showDisclaimer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-strong rounded-2xl p-4 mt-2 text-xs text-muted-foreground leading-relaxed" style={{ borderLeft: '3px solid hsl(var(--ovulation))' }}>
            <p className="font-semibold text-foreground mb-2">⚠️ Important</p>
            <p>FemNexa is a wellness tracking tool, NOT a medical device. Always consult qualified healthcare professionals for medical advice.</p>
          </motion.div>
        )}
      </section>

      <div className="text-center mt-8 space-y-1">
        <p className="text-sm font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-display">FemNexa</p>
        <p className="text-[10px] text-muted-foreground">v3.0.0 • AI-Powered Emotional Wellness</p>
        <p className="text-[10px] text-muted-foreground italic">"Your caring AI companion for body & mind"</p>
      </div>
    </div>
  );
}
