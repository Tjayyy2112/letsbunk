import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from './store/useStore';
import BottomNav from './components/BottomNav';
import TodayScreen      from './screens/TodayScreen';
import TimetableScreen  from './screens/TimetableScreen';
import CalendarScreen   from './screens/CalendarScreen';
import SubjectsScreen   from './screens/SubjectsScreen';
import SettingsScreen   from './screens/SettingsScreen';

const SCREENS = {
  today:     TodayScreen,
  timetable: TimetableScreen,
  calendar:  CalendarScreen,
  subjects:  SubjectsScreen,
  settings:  SettingsScreen,
};

export default function App() {
  const { activeTab, loading, error, bootstrap, theme } = useStore();
  const Screen = SCREENS[activeTab] || TodayScreen;

  useEffect(() => { 
    bootstrap(); 
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  if (loading) return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', gap: 16,
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        style={{
          width: 44, height: 44, borderRadius: '50%',
          border: '3px solid rgba(142,216,204,0.15)',
          borderTop: '3px solid var(--accent)',
        }}
      />
      <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Loading Let'sBunk…</div>
    </div>
  );

  if (error) return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', gap: 12, padding: 24,
    }}>
      <div style={{ fontSize: 40 }}>⚠️</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--danger)' }}>Backend not reachable</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center' }}>
        Make sure the backend is running on port 8765 and PostgreSQL is connected.
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace',
        background: 'var(--card)', padding: '8px 14px', borderRadius: 10 }}>
        {error}
      </div>
      <motion.button whileTap={{ scale: 0.95 }} onClick={() => { useStore.setState({ loading: true, error: null }); bootstrap(); }}
        style={{ padding: '12px 24px', borderRadius: 14, background: 'var(--accent)', color: '#07110F', fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: 8 }}>
        Retry
      </motion.button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'fixed', top: -100, left: '50%', transform: 'translateX(-50%)', width: 300, height: 300, background: 'radial-gradient(circle, rgba(142,216,204,0.04) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 1 }}
        >
          <Screen />
        </motion.div>
      </AnimatePresence>
      <BottomNav />
    </div>
  );
}
