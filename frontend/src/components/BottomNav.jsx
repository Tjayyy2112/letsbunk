import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Home, Grid, Calendar, BookOpen, Settings } from 'lucide-react';

const TABS = [
  { id: 'today', label: 'Today', Icon: Home },
  { id: 'timetable', label: 'Timetable', Icon: Grid },
  { id: 'calendar', label: 'Calendar', Icon: Calendar },
  { id: 'subjects', label: 'Subjects', Icon: BookOpen },
  { id: 'settings', label: 'Settings', Icon: Settings },
];

export default function BottomNav() {
  const { activeTab, setActiveTab } = useStore();

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430, padding: '0 16px 12px', zIndex: 100,
      pointerEvents: 'none',
    }}>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0.2 }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          background: 'rgba(16, 25, 23, 0.92)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(142, 216, 204, 0.1)',
          borderRadius: 32,
          padding: '8px 8px',
          pointerEvents: 'auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(142,216,204,0.05)',
        }}
      >
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <motion.button
              key={id}
              onClick={() => setActiveTab(id)}
              whileTap={{ scale: 0.88 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 3, padding: '8px 14px', borderRadius: 24, position: 'relative',
                background: 'transparent', border: 'none', cursor: 'pointer',
                minWidth: 56,
              }}
            >
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="navPill"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                    style={{
                      position: 'absolute', inset: 0, borderRadius: 24,
                      background: 'rgba(142, 216, 204, 0.12)',
                      border: '1px solid rgba(142, 216, 204, 0.2)',
                      boxShadow: '0 0 16px rgba(142, 216, 204, 0.15)',
                    }}
                  />
                )}
              </AnimatePresence>
              <motion.div
                animate={{ color: isActive ? '#8ED8CC' : '#5A6B68' }}
                transition={{ duration: 0.2 }}
                style={{ position: 'relative', zIndex: 1 }}
              >
                <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              </motion.div>
              <motion.span
                animate={{
                  color: isActive ? '#8ED8CC' : '#5A6B68',
                  fontWeight: isActive ? 600 : 400,
                }}
                transition={{ duration: 0.2 }}
                style={{ fontSize: 10, position: 'relative', zIndex: 1 }}
              >
                {label}
              </motion.span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
