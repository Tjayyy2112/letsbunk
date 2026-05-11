import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { ChevronLeft, ChevronRight, RotateCcw, ChevronDown, Check, X, Zap, Coffee } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isSameMonth, isToday } from 'date-fns';
import ModalSheet from '../components/ModalSheet';
import ODModal from '../components/ODModal';
import AbsentModal from '../components/AbsentModal';

const STATUS_CONFIG = {
  PRESENT: { label: 'Present',  color: '#8ED8CC', bg: 'rgba(142,216,204,0.15)', icon: Check  },
  ABSENT:  { label: 'Absent',   color: '#D85C63', bg: 'rgba(216,92,99,0.15)',   icon: X      },
  OD:      { label: 'On Duty',  color: '#5B9BD5', bg: 'rgba(91,155,213,0.15)',  icon: Zap    },
  OFF:     { label: 'Holiday',  color: '#E8A838', bg: 'rgba(232,168,56,0.15)',  icon: Coffee },
};

const ACTION_BTNS = [
  { s: 'PRESENT', label: 'Present', color: '#8ED8CC', bg: 'rgba(142,216,204,0.15)' },
  { s: 'ABSENT',  label: 'Absent',  color: '#D85C63', bg: 'rgba(216,92,99,0.15)'   },
  { s: 'OFF',     label: 'Holiday', color: '#E8A838', bg: 'rgba(232,168,56,0.15)'  },
  { s: 'OD',      label: 'OD',      color: '#5B9BD5', bg: 'rgba(91,155,213,0.15)'  },
];

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
  const [showAddClass, setShowAddClass] = useState(false);

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
      .map(l => ({ ...l, subject: subjects.find(s => s.id === l.subjectId) }))
      .sort((a, b) => a.period_index - b.period_index);
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
              style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--border)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
              style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--border)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
            {dayLogs.map((log) => (
              <CalendarLogItem key={log.id} log={log} dateStr={format(selectedDay, 'yyyy-MM-dd')} />
            ))}
          </div>
        )}

        {!showAddClass ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddClass(true)}
            style={{
              width: '100%', padding: '14px', borderRadius: 14,
              background: 'rgba(142,216,204,0.1)', color: 'var(--accent)',
              border: '1px dashed rgba(142,216,204,0.3)',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              marginTop: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6,
            }}
          >
            + Add Class to {format(selectedDay || new Date(), 'MMM d')}
          </motion.button>
        ) : (
          <AddClassForm
            dateStr={format(selectedDay, 'yyyy-MM-dd')}
            dayLogs={dayLogs}
            onClose={() => setShowAddClass(false)}
          />
        )}
      </ModalSheet>
    </div>
  );
}

function AddClassForm({ dateStr, dayLogs, onClose }) {
  const { subjects, markAttendance } = useStore();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [periodIndex, setPeriodIndex] = useState(dayLogs.length + 1);

  const handleSubmit = async () => {
    if (!selectedSubject) return;
    const finalIndex = periodIndex === '' ? 1 : periodIndex;
    await markAttendance(selectedSubject, dateStr, 'PRESENT', '', finalIndex, true);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--card)', borderRadius: 16, padding: '16px',
        border: '1px solid var(--border)', marginTop: 16,
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
        Add Class
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        <select
          value={selectedSubject}
          onChange={e => setSelectedSubject(e.target.value)}
          style={{
            padding: '12px 14px', borderRadius: 10, background: 'var(--border)',
            border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 13,
            outline: 'none',
          }}
        >
          <option value="" disabled style={{ background: 'var(--card)', color: 'var(--text-primary)' }}>Select Subject</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id} style={{ background: 'var(--card)', color: 'var(--text-primary)' }}>{s.name}</option>
          ))}
        </select>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Period:</span>
          <input
            type="number"
            min="1"
            value={periodIndex}
            onChange={e => setPeriodIndex(e.target.value === '' ? '' : parseInt(e.target.value) || 1)}
            style={{
              padding: '10px 14px', borderRadius: 10, background: 'var(--border)',
              border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 13,
              width: 80, outline: 'none',
            }}
          />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Inserting into an existing period will shift subsequent classes forward.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          style={{
            flex: 1, padding: '12px', borderRadius: 10, background: 'transparent',
            color: 'var(--text-secondary)', border: '1px solid var(--border)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Cancel
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={!selectedSubject}
          style={{
            flex: 2, padding: '12px', borderRadius: 10, background: 'var(--accent)',
            color: '#07110F', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            opacity: !selectedSubject ? 0.5 : 1,
          }}
        >
          Add as Present
        </motion.button>
      </div>
    </motion.div>
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
            background: 'var(--border)', borderRadius: 12, padding: '12px',
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarLogItem({ log, dateStr }) {
  const { markAttendance, clearAttendance } = useStore();
  const [expanded, setExpanded] = useState(false);
  const [showOD, setShowOD] = useState(false);
  const [showAbsent, setShowAbsent] = useState(false);

  const subject = log.subject;
  const status = log.status;
  const cfg = STATUS_CONFIG[status];
  
  if (!subject) return null;

  const handleMark = (s) => {
    if (s === 'OD')     { setShowOD(true);     return; }
    if (s === 'ABSENT') { setShowAbsent(true); return; }
    markAttendance(subject.id, dateStr, s, '', log.period_index);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: cfg ? cfg.bg : 'var(--card)',
          border: `1px solid ${cfg ? cfg.color + '30' : 'var(--border)'}`,
          borderRadius: 16, overflow: 'hidden',
          transition: 'background 0.3s, border 0.3s',
        }}
      >
        <div onClick={() => setExpanded(!expanded)} style={{ padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: cfg ? cfg.color : 'var(--text-muted)', flexShrink: 0,
            boxShadow: cfg ? `0 0 6px ${cfg.color}80` : 'none',
          }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              <span style={{ color: 'var(--text-muted)', marginRight: 6, fontSize: 12 }}>
                {log.period_index}{['st','nd','rd'][((log.period_index+90)%100-10)%10-1]||'th'}
              </span>
              {subject.icon} {subject.name}
            </div>
            {log.reason && !expanded && (
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                {log.reason}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {cfg && (
              <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
            )}
            <motion.div animate={{ rotate: expanded ? 180 : 0 }}>
              <ChevronDown size={14} color="var(--text-muted)" />
            </motion.div>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {ACTION_BTNS.map(({ s, label, color, bg }) => (
                    <motion.button
                      key={s}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleMark(s)}
                      style={{
                        flex: 1, minWidth: 50, padding: '8px 4px', borderRadius: 10,
                        fontSize: 11, fontWeight: 700,
                        background: status === s ? color : bg,
                        color: status === s ? '#07110F' : color,
                        border: `1px solid ${color}40`,
                        cursor: 'pointer', whiteSpace: 'nowrap',
                      }}
                    >
                      {label}
                    </motion.button>
                  ))}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => clearAttendance(dateStr, log.period_index)}
                    style={{
                      padding: '8px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                      background: 'rgba(90,107,104,0.15)', color: 'var(--text-secondary)',
                      border: '1px solid rgba(90,107,104,0.2)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    <RotateCcw size={11} /> Remove
                  </motion.button>
                </div>
                {log.reason && (
                  <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    Note: {log.reason}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <ODModal
        isOpen={showOD}
        onClose={() => setShowOD(false)}
        onSave={(reason) => { markAttendance(subject.id, dateStr, 'OD', reason, log.period_index); setShowOD(false); }}
        subjectName={subject.name}
        date={dateStr}
      />
      <AbsentModal
        isOpen={showAbsent}
        onClose={() => setShowAbsent(false)}
        onSave={(reason) => { markAttendance(subject.id, dateStr, 'ABSENT', reason, log.period_index); setShowAbsent(false); }}
        subjectName={subject.name}
        date={dateStr}
      />
    </>
  );
}
