import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, MapPin, User, Check, X, Zap, Coffee,
  RotateCcw, ChevronDown,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import ODModal from './ODModal';
import AbsentModal from './AbsentModal';
import { calcAttendance, getAttendanceColor } from '../utils/attendance';

const STATUS_CONFIG = {
  PRESENT: { label: 'Present',  color: 'var(--accent)',   bg: 'var(--accent-dim)',  icon: Check  },
  ABSENT:  { label: 'Absent',   color: 'var(--danger)',   bg: 'var(--danger-dim)',  icon: X      },
  OD:      { label: 'On Duty',  color: 'var(--blue)',     bg: 'var(--blue-dim)',    icon: Zap    },
  OFF:     { label: 'Holiday',  color: 'var(--warning)',  bg: 'var(--warning-dim)', icon: Coffee },
};

const ACTION_BTNS = [
  { s: 'PRESENT', label: 'Present', color: 'var(--accent)',  bg: 'var(--accent-dim)'  },
  { s: 'ABSENT',  label: 'Absent',  color: 'var(--danger)',  bg: 'var(--danger-dim)'  },
  { s: 'OFF',     label: 'Holiday', color: 'var(--warning)', bg: 'var(--warning-dim)' },
  { s: 'OD',      label: 'OD',      color: 'var(--blue)',    bg: 'var(--blue-dim)'    },
];

export default function LectureCard({ lecture }) {
  const { time, room, faculty } = lecture;
  const today = format(new Date(), 'yyyy-MM-dd');

  // ── always read live from store so % updates instantly ──
  const subjects        = useStore(s => s.subjects);
  const getLogForDate   = useStore(s => s.getLogForDate);
  const markAttendance  = useStore(s => s.markAttendance);
  const clearAttendance = useStore(s => s.clearAttendance);

  // find the subject fresh from store every render
  const subject = subjects.find(s => s.id === lecture.subject?.id) || lecture.subject;

  const log    = getLogForDate(subject?.id, today);
  const status = log?.status || null;
  const cfg    = status ? STATUS_CONFIG[status] : null;

  const [showOD,     setShowOD]     = useState(false);
  const [showAbsent, setShowAbsent] = useState(false);
  const [expanded,   setExpanded]   = useState(false);

  if (!subject) return null;

  /* ── live attendance % for this subject ── */
  const pct       = calcAttendance(subject.attended, subject.od, subject.total);
  const pctColor  = getAttendanceColor(pct, subject.target);

  const handleMark = (s) => {
    if (s === 'OD')     { setShowOD(true);     return; }
    if (s === 'ABSENT') { setShowAbsent(true); return; }
    markAttendance(subject.id, today, s);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.985 }}
        style={{
          background: cfg ? cfg.bg : 'var(--card)',
          border: `1px solid ${cfg ? cfg.color + '30' : 'var(--border)'}`,
          borderRadius: 20, marginBottom: 12, overflow: 'hidden',
          transition: 'background 0.3s, border 0.3s',
          boxShadow: cfg ? `0 0 18px ${cfg.color}12` : 'none',
        }}
      >
        {/* ── Card header ── */}
        <div onClick={() => setExpanded(e => !e)} style={{ padding: '14px 16px', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>

            {/* Left: name + meta */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5, flexWrap: 'wrap' }}>
                <div style={{
                  width: 9, height: 9, borderRadius: '50%',
                  background: subject.color, flexShrink: 0,
                  boxShadow: `0 0 7px ${subject.color}80`,
                }} />
                <span style={{
                  fontSize: 15, fontWeight: 700, color: 'var(--text-primary)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {subject.name}
                </span>

                {/* ── Live % badge ── */}
                <motion.div
                  key={pct}                          // re-animate on change
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1,   opacity: 1 }}
                  transition={{ type: 'spring', damping: 16, stiffness: 300 }}
                  style={{
                    padding: '2px 8px', borderRadius: 7,
                    background: pctColor + '18',
                    border: `1px solid ${pctColor}30`,
                    fontSize: 11, fontWeight: 700, color: pctColor,
                    flexShrink: 0,
                  }}
                >
                  {pct}%
                </motion.div>
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {[
                  { Icon: Clock,  val: time           },
                  { Icon: MapPin, val: room            },
                  { Icon: User,   val: faculty         },
                ].map(({ Icon, val }) => (
                  <span key={val} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--text-secondary)' }}>
                    <Icon size={11} /> {val}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: status chip + chevron */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 8 }}>
              {cfg && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{
                    background: cfg.color + '1A',
                    border: `1px solid ${cfg.color}40`,
                    borderRadius: 9, padding: '3px 9px',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  <cfg.icon size={11} color={cfg.color} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
                </motion.div>
              )}
              <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={15} color="var(--text-muted)" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* ── Expanded action buttons ── */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                padding: '0 16px 14px',
                borderTop: '1px solid rgba(142,216,204,0.06)',
                paddingTop: 12,
              }}>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  {ACTION_BTNS.map(({ s, label, color, bg }) => (
                    <motion.button
                      key={s}
                      whileTap={{ scale: 0.88 }}
                      onClick={() => handleMark(s)}
                      style={{
                        flex: 1, minWidth: 60,
                        padding: '8px 6px', borderRadius: 12,
                        fontSize: 11, fontWeight: 700,
                        background: status === s ? color : bg,
                        color:      status === s ? '#07110F' : color,
                        border: `1px solid ${color}40`,
                        cursor: 'pointer', transition: 'all 0.18s',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {label}
                    </motion.button>
                  ))}

                  {status && (
                    <motion.button
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileTap={{ scale: 0.88 }}
                      onClick={() => clearAttendance(subject.id, today)}
                      style={{
                        padding: '8px 10px', borderRadius: 12,
                        fontSize: 11, fontWeight: 700,
                        background: 'rgba(90,107,104,0.14)',
                        color: 'var(--text-secondary)',
                        border: '1px solid rgba(90,107,104,0.18)',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 4,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <RotateCcw size={11} /> Clear
                    </motion.button>
                  )}
                </div>

                {/* Attendance mini-stats */}
                <div style={{
                  display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap',
                }}>
                  {[
                    { l: 'P', v: subject.attended, c: 'var(--accent)'  },
                    { l: 'A', v: subject.absent,   c: 'var(--danger)'  },
                    { l: 'OD',v: subject.od,       c: 'var(--blue)'    },
                    { l: 'Off',v: subject.off,      c: 'var(--warning)' },
                    { l: `/${subject.total}`, v: '', c: 'var(--text-muted)' },
                  ].map(({ l, v, c }) => (
                    <span key={l} style={{ fontSize: 11, color: c, fontWeight: 600 }}>
                      {v !== '' ? `${l}:${v}` : l}
                    </span>
                  ))}
                </div>

                {log?.reason && (
                  <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
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
        onSave={(reason) => { markAttendance(subject.id, today, 'OD', reason); setShowOD(false); }}
        subjectName={subject.name}
        date={today}
      />
      <AbsentModal
        isOpen={showAbsent}
        onClose={() => setShowAbsent(false)}
        onSave={(reason) => { markAttendance(subject.id, today, 'ABSENT', reason); setShowAbsent(false); }}
        subjectName={subject.name}
        date={today}
      />
    </>
  );
}
