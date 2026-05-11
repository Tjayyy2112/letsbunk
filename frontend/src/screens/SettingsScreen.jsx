import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Target, Bell, Download, Trash2, Info, Moon, RefreshCcw, Lock, ChevronRight } from 'lucide-react';

function SettingsRow({ icon: Icon, label, description, right, onClick, color = 'var(--accent)' }) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 12, background: color + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={18} color={color} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
        {description && <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>{description}</div>}
      </div>
      {right || (onClick && <ChevronRight size={16} color="var(--text-muted)" />)}
    </motion.div>
  );
}

function SettingsSection({ title, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, padding: '0 20px', marginBottom: 6 }}>
        {title}
      </div>
      <div style={{ background: 'var(--card)', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden' }}>
        {React.Children.map(children, (child, i) => (
          <>
            {i > 0 && <div style={{ height: 1, background: 'var(--border)', margin: '0 18px' }} />}
            {child}
          </>
        ))}
      </div>
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <motion.div
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 26, borderRadius: 13,
        background: value ? 'var(--accent)' : 'var(--border-strong)',
        position: 'relative', cursor: 'pointer',
        transition: 'background 0.2s', flexShrink: 0,
        border: `1px solid ${value ? 'var(--accent)' : 'var(--border-strong)'}`,
      }}
    >
      <motion.div
        animate={{ x: value ? 20 : 2 }}
        transition={{ type: 'spring', damping: 20, stiffness: 400 }}
        style={{
          position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%',
          background: value ? '#07110F' : 'var(--text-muted)',
        }}
      />
    </motion.div>
  );
}

export default function SettingsScreen() {
  const { settings, updateSettings, subjects, theme, setTheme, clearAllData } = useStore();
  const [showReset, setShowReset] = useState(false);
  const [showClearAll, setShowClearAll] = useState(false);

  const exportCSV = () => {
    const rows = [['Subject', 'Faculty', 'Attended', 'Absent', 'OD', 'Off', 'Total', 'Attendance %']];
    subjects.forEach(s => {
      const pct = s.total === 0 ? 0 : Math.round(((s.attended + s.od) / s.total) * 100);
      rows.push([s.name, s.faculty, s.attended, s.absent, s.od, s.off, s.total, `${pct}%`]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'letsbunk-attendance.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 100 }}>
      <div style={{ padding: '56px 20px 0' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>Customize your experience</p>

        <SettingsSection title="Attendance">
          <SettingsRow
            icon={Target}
            label="Target Attendance"
            description={`Currently ${settings.target_attendance}%`}
            right={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <motion.button whileTap={{ scale: 0.85 }} onClick={() => updateSettings({ ...settings, target_attendance: Math.max(50, settings.target_attendance - 5) })}
                  style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--danger-dim)', border: '1px solid rgba(216,92,99,0.2)', color: 'var(--danger)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>−</motion.button>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)', minWidth: 40, textAlign: 'center' }}>{settings.target_attendance}%</span>
                <motion.button whileTap={{ scale: 0.85 }} onClick={() => updateSettings({ ...settings, target_attendance: Math.min(100, settings.target_attendance + 5) })}
                  style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent-dim)', border: '1px solid rgba(142,216,204,0.2)', color: 'var(--accent)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>+</motion.button>
              </div>
            }
          />
        </SettingsSection>

        <SettingsSection title="Preferences">
          <SettingsRow
            icon={Bell}
            label="Notifications"
            description="Attendance reminders & alerts"
            right={<Toggle value={settings.notifications} onChange={v => updateSettings({ ...settings, notifications: v })} />}
          />
          <SettingsRow
            icon={Moon}
            label="Theme"
            description={theme === 'dark' ? "AMOLED Dark" : "Light Mode"}
            right={<Toggle value={theme === 'dark'} onChange={v => setTheme(v ? 'dark' : 'light')} />}
          />
          <SettingsRow
            icon={Lock}
            label="App Lock"
            description="Biometric authentication"
            right={<Toggle value={false} onChange={() => {}} />}
          />
        </SettingsSection>

        <SettingsSection title="Data">
          <SettingsRow icon={Download} label="Export CSV" description="Download attendance report" onClick={exportCSV} color="var(--blue)" />
          <SettingsRow icon={RefreshCcw} label="Semester Reset" description="Clear all attendance data" onClick={() => setShowReset(true)} color="var(--warning)" />
          <SettingsRow icon={Trash2} label="Clear All Data" description="Remove all subjects & logs" onClick={() => setShowClearAll(true)} color="var(--danger)" />
        </SettingsSection>

        <SettingsSection title="About">
          <SettingsRow icon={Info} label="Let'sBunk" description="Track smart. Bunk smarter. v1.0.0" color="var(--accent)" />
        </SettingsSection>

        {showReset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
              zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                background: 'var(--card)', borderRadius: 24, padding: 24,
                border: '1px solid rgba(232,168,56,0.2)', maxWidth: 320, width: '100%',
              }}
            >
              <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 12 }}>⚠️</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', marginBottom: 8 }}>Semester Reset</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 24, lineHeight: 1.6 }}>
                This will clear all attendance logs. Subjects will remain. This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowReset(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: 14, background: 'var(--card)', color: 'var(--text-secondary)', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                  Cancel
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={async () => { await useStore.getState().resetSemester(); setShowReset(false); }}
                  style={{ flex: 1, padding: '12px', borderRadius: 14, background: 'var(--warning)', color: '#07110F', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                  Reset
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showClearAll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
              zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                background: 'var(--card)', borderRadius: 24, padding: 24,
                border: '1px solid rgba(216,92,99,0.2)', maxWidth: 320, width: '100%',
              }}
            >
              <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 12 }}>🧨</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--danger)', textAlign: 'center', marginBottom: 8 }}>Clear All Data</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 24, lineHeight: 1.6 }}>
                This will delete everything: subjects, logs, and timetable. This action is permanent and cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowClearAll(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: 14, background: 'var(--card)', color: 'var(--text-secondary)', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                  Cancel
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={async () => { await clearAllData(); setShowClearAll(false); }}
                  style={{ flex: 1, padding: '12px', borderRadius: 14, background: 'var(--danger)', color: '#FFFFFF', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                  Clear All
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
