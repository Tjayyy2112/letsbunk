import React from 'react';
import { motion } from 'framer-motion';
import { calcAttendance, canBunk, classesNeeded, getAttendanceColor, getAttendanceBg } from '../utils/attendance';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function SubjectCard({ subject, onClick, onLongPress }) {
  const { name, faculty, color, icon, target, attended, absent, od, off, total } = subject;
  const pct = calcAttendance(attended, od, total);
  const accentColor = getAttendanceColor(pct, target);
  const bunkable = canBunk(attended, od, total, target);
  const needed = classesNeeded(attended, od, total, target);

  const progressWidth = Math.min(100, pct);
  let longPressTimer = null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onPointerDown={() => { longPressTimer = setTimeout(() => onLongPress?.(), 600); }}
      onPointerUp={() => clearTimeout(longPressTimer)}
      onPointerLeave={() => clearTimeout(longPressTimer)}
      style={{
        background: 'var(--card)', borderRadius: 20, padding: '18px',
        marginBottom: 12, cursor: 'pointer',
        border: `1px solid ${accentColor}20`,
        boxShadow: `0 0 20px ${accentColor}08`,
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 100, height: 100,
        background: `radial-gradient(circle at 80% 20%, ${accentColor}08, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{name}</span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{faculty}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: accentColor, lineHeight: 1 }}>{pct}%</div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>attendance</div>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{
          height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3,
          overflow: 'hidden', position: 'relative',
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressWidth}%` }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            style={{
              height: '100%', background: accentColor, borderRadius: 3,
              boxShadow: `0 0 8px ${accentColor}60`,
            }}
          />
          <div style={{
            position: 'absolute', top: 0, bottom: 0, borderLeft: '2px dashed rgba(255,255,255,0.2)',
            left: `${target}%`,
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Target: {target}%</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{attended + od}/{total} classes</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {[
          { label: 'Present', value: attended, color: 'var(--accent)' },
          { label: 'Absent', value: absent, color: 'var(--danger)' },
          { label: 'OD', value: od, color: 'var(--blue)' },
          { label: 'Off', value: off, color: 'var(--warning)' },
        ].map(({ label, value, color: c }) => (
          <div key={label} style={{
            flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '8px 4px',
            textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: c }}>{value}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{
        padding: '10px 12px', borderRadius: 12,
        background: pct >= target ? 'var(--accent-dim)' : 'var(--danger-dim)',
        border: `1px solid ${pct >= target ? 'rgba(142,216,204,0.15)' : 'rgba(216,92,99,0.15)'}`,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        {pct >= target
          ? <TrendingUp size={14} color="var(--accent)" />
          : <TrendingDown size={14} color="var(--danger)" />}
        <span style={{ fontSize: 12, color: pct >= target ? 'var(--accent)' : 'var(--danger)', fontWeight: 500 }}>
          {pct >= target
            ? `Can bunk ${bunkable} more class${bunkable !== 1 ? 'es' : ''}`
            : `Need ${needed} more class${needed !== 1 ? 'es' : ''} to reach ${target}%`}
        </span>
      </div>
    </motion.div>
  );
}
