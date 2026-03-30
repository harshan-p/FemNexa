import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReminderNotificationProps {
  userName: string;
  enabled: boolean;
}

const REMINDERS = [
  "Just checking in 💜 How are you today?",
  "Remember to hydrate! Your body will thank you 💧",
  "A gentle stretch might feel nice right now 🧘",
  "Have you had a nutritious meal today? 🍎",
  "Take a moment to breathe deeply 🌿",
];

export default function ReminderNotification({ userName, enabled }: ReminderNotificationProps) {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!enabled) return;
    const lastReminder = sessionStorage.getItem('last_reminder');
    const now = Date.now();
    if (lastReminder && now - parseInt(lastReminder) < 3600000) return;

    const timer = setTimeout(() => {
      const msg = REMINDERS[Math.floor(Math.random() * REMINDERS.length)];
      setMessage(`Hey ${userName || 'friend'} 💜 ${msg}`);
      setShow(true);
      sessionStorage.setItem('last_reminder', now.toString());
      setTimeout(() => setShow(false), 4000);
    }, 30000);

    return () => clearTimeout(timer);
  }, [enabled, userName]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          onClick={() => setShow(false)}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl glass-strong shadow-xl max-w-xs cursor-pointer"
        >
          <p className="text-sm font-medium text-foreground">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
