import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isSameMonth, isToday } from 'date-fns';
import ModalSheet from '../components/ModalSheet';

const STATUS_COLORS = {
  PRESENT: '#8ED8CC',
  ABSENT: '#D85C63',
  OD: '#5B9BD5',
  OFF: '#E8A838',
};

export default function CalendarScreen() {
  const { attendanceLogs, subjects } = useStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startOffset = (getDay(monthStart) + 6) % 7; // Mon-start

  const getDotsForDay = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const logs = Object.values(attendanceLogs).filter(l => l.date === dateStr);
    const statuses = [...new Set(logs.map(l => l.status))];
    return statuses;
  };

  const getLogsForDay = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return Object.values(attendanceLogs)
      .filter(l => l.date === dateStr)
      .map(l => ({ ...l, subject: subjects.find(s => s.id === l.subjectId) }));
  };

  const dayLogs = selectedDay ? getLogsForDay(selectedDay) : [];

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 100 }}>
      <div style={{ padding: '56px 20px 0' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Calendar</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Attendance history</p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'var(--card)', borderRadius: 24, padding: '20px',
            border: '1px solid var(--border)', marginBottom: 20,
          }}
        >
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <motion.button whileTap={{ scale: 0.85 }} onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
              style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeft size={16} color="var(--text-secondary)" />
            </motion.button>
            <motion.h2
              key={format(currentMonth, 'yyyy-MM')}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}
            >
              {format(currentMonth, 'MMMM yyyy')}
            </motion.h2>
            <motion.button whileTap={{ scale: 0.85 }} onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
              style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight size={16} color="var(--text-secondary)" />
            </motion.button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', padding: '4px 0' }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {Array.from({ length: startOffset }, (_, i) => <div key={`empty-${i}`} />)}
            {days.map((day) => {
              const dots = getDotsForDay(day);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const todayDay = isToday(day);
              return (
                <motion.button
                  key={day.toISOString()}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setSelectedDay(isSameDay(day, selectedDay) ? null : day)}
                  style={{
                    padding: '6px 2px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: isSelected ? 'var(--accent-dim)' : todayDay ? 'rgba(142,216,204,0.06)' : 'transparent',
                    outline: isSelected ? '1px solid var(--accent)' : todayDay ? '1px solid rgba(142,216,204,0.2)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    fontSize: 13, fontWeight: todayDay ? 700 : 400,
                    color: isSelected ? 'var(--accent)' : todayDay ? 'var(--accent)' : 'var(--text-primary)',
                    marginBottom: 3,
                  }}>
                    {format(day, 'd')}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', minHeight: 8 }}>
                    {dots.slice(0, 3).map((status, i) => (
                      <div key={i} style={{
                        width: 5, height: 5, borderRadius: '50%',
                        background: STATUS_COLORS[status] || 'var(--text-muted)',
                      }} />
                    ))}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
            {Object.entries(STATUS_COLORS).map(([s, c]) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{s}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Monthly stats */}
        <MonthStats month={currentMonth} logs={attendanceLogs} />
      </div>

      {/* Day detail sheet */}
      <ModalSheet
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        title={selectedDay ? format(selectedDay, 'MMMM d, yyyy') : ''}
      >
        {dayLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)' }}>
            No attendance recorded for this day.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {dayLogs.map((log, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)',
              }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: STATUS_COLORS[log.status] || 'var(--text-muted)', flexShrink: 0,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {log.subject?.icon} {log.subject?.name}
                  </div>
                  {log.reason && (
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {log.reason}
                    </div>
                  )}
                </div>
                <div style={{
                  padding: '3px 8px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                  background: (STATUS_COLORS[log.status] || 'gray') + '20',
                  color: STATUS_COLORS[log.status] || 'var(--text-secondary)',
                }}>
                  {log.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </ModalSheet>
    </div>
  );
}

function MonthStats({ month, logs }) {
  const monthStr = format(month, 'yyyy-MM');
  const monthLogs = Object.values(logs).filter(l => l.date.startsWith(monthStr));
  const counts = { PRESENT: 0, ABSENT: 0, OD: 0, OFF: 0 };
  monthLogs.forEach(l => { if (counts[l.status] !== undefined) counts[l.status]++; });
  const total = counts.PRESENT + counts.ABSENT + counts.OD;
  const pct = total === 0 ? 0 : Math.round(((counts.PRESENT + counts.OD) / total) * 100);

  return (
    <div style={{ background: 'var(--card)', borderRadius: 20, padding: '18px', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
        {format(month, 'MMMM')} Summary
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {[
          { label: 'Present', value: counts.PRESENT, color: 'var(--accent)' },
          { label: 'Absent', value: counts.ABSENT, color: 'var(--danger)' },
          { label: 'On Duty', value: counts.OD, color: 'var(--blue)' },
          { label: 'Month %', value: `${pct}%`, color: pct >= 75 ? 'var(--accent)' : 'var(--danger)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '12px',
            border: '1px solid rgba(255,255,255,0.04)',
          }}>
            <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
