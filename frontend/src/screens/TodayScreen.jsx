import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import AttendanceRing from '../components/AttendanceRing';
import LectureCard from '../components/LectureCard';
import { calcAttendance, canBunk } from '../utils/attendance';
import { format } from 'date-fns';
import { Flame, Check, X, Zap, Coffee } from 'lucide-react';
import ModalSheet from '../components/ModalSheet';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const MARK_ALL_OPTIONS = [
  { status: 'PRESENT', label: 'All Present', color: 'var(--accent)',  bg: 'var(--accent-dim)',  Icon: Check   },
  { status: 'ABSENT',  label: 'All Absent',  color: 'var(--danger)',  bg: 'var(--danger-dim)',  Icon: X       },
  { status: 'OD',      label: 'All OD',      color: 'var(--blue)',    bg: 'var(--blue-dim)',    Icon: Zap     },
  { status: 'OFF',     label: 'All Holiday', color: 'var(--warning)', bg: 'var(--warning-dim)', Icon: Coffee  },
];

export default function TodayScreen() {
  const { subjects, settings, streak, getTodayLectures, markAttendance, clearAttendance, getLogForDate } = useStore();
  const lectures   = getTodayLectures();
  const today      = format(new Date(), 'yyyy-MM-dd');

  const [confirmAll, setConfirmAll] = useState(null); // holds the chosen option while confirming

  /* ── overall stats ── */
  const totalAttended = subjects.reduce((s, sub) => s + sub.attended + sub.od, 0);
  const totalClasses  = subjects.reduce((s, sub) => s + sub.total, 0);
  const overallPct    = totalClasses === 0 ? 0 : Math.round((totalAttended / totalClasses) * 100);
  const target        = settings.target_attendance;
  const totalBunkable = subjects.reduce(
    (sum, s) => sum + canBunk(s.attended, s.od, s.total, target), 0
  );

  /* ── mark-all handler ── */
  const handleMarkAll = (option) => {
    // For OD we just skip the reason modal and mark with empty reason
    lectures.forEach(({ subject }, i) => {
      markAttendance(subject.id, today, option.status, '', i + 1);
    });
    setConfirmAll(null);
  };

  const handleClearAll = () => {
    lectures.forEach((_, i) => clearAttendance(today, i + 1));
  };

  const allMarked = lectures.length > 0 &&
    lectures.every((_, i) => !!getLogForDate(today, i + 1));

  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const now      = new Date();

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 110 }}>
      <div style={{ padding: '52px 18px 0' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 3 }}>
              {dayNames[now.getDay()]}, {format(now, 'MMM d')}
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {getGreeting()} 👋
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Track smart. Bunk smarter.
            </p>
          </div>
          <motion.div
            whileTap={{ scale: 0.9 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 11px',
              background: 'rgba(232,168,56,0.12)',
              borderRadius: 14,
              border: '1px solid rgba(232,168,56,0.2)',
            }}
          >
            <Flame size={13} color="var(--warning)" />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--warning)' }}>{streak}</span>
          </motion.div>
        </div>

        {/* ── Attendance Overview ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'var(--card)', borderRadius: 22, padding: '20px',
            border: '1px solid var(--border)', marginBottom: 18,
            position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', top: -40, right: -40, width: 140, height: 140,
            background: 'radial-gradient(circle, rgba(142,216,204,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <AttendanceRing percentage={overallPct} target={target} size={128} />
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Overall Status</div>
                <div style={{
                  fontSize: 12, fontWeight: 700,
                  color: overallPct >= target ? 'var(--accent)' : 'var(--danger)',
                  padding: '3px 9px', borderRadius: 8, display: 'inline-block',
                  background: overallPct >= target ? 'var(--accent-dim)' : 'var(--danger-dim)',
                }}>
                  {overallPct >= target ? '✓ Safe Zone' : '⚠ Low'}
                </div>
              </div>
              {[
                { label: 'Target',    value: `${target}%` },
                { label: 'Can bunk',  value: `${totalBunkable} classes`, accent: true },
                { label: 'Attended',  value: `${totalAttended}/${totalClasses}` },
              ].map(({ label, value, accent }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: accent ? 'var(--accent)' : 'var(--text-primary)' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Mark Whole Day Bar ── */}
        {lectures.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'var(--card)',
              borderRadius: 18,
              border: '1px solid var(--border)',
              padding: '14px 16px',
              marginBottom: 18,
            }}
          >
            <div style={{
              fontSize: 11, fontWeight: 700,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginBottom: 10,
            }}>
              Mark Whole Day
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {MARK_ALL_OPTIONS.map(({ status, label, color, bg, Icon }) => (
                <motion.button
                  key={status}
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setConfirmAll({ status, label, color, bg, Icon })}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 5,
                    padding: '10px 4px',
                    borderRadius: 14,
                    background: bg,
                    border: `1px solid ${color}30`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <Icon size={15} color={color} />
                  <span style={{ fontSize: 9, fontWeight: 700, color, textAlign: 'center', lineHeight: 1.2 }}>
                    {status === 'PRESENT' ? 'Present' : status === 'ABSENT' ? 'Absent' : status === 'OD' ? 'OD' : 'Holiday'}
                  </span>
                </motion.button>
              ))}

              {/* Clear all */}
              {allMarked && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileTap={{ scale: 0.88 }}
                  onClick={handleClearAll}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 5,
                    padding: '10px 4px',
                    borderRadius: 14,
                    background: 'rgba(90,107,104,0.12)',
                    border: '1px solid rgba(90,107,104,0.2)',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 13 }}>🗑</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'center' }}>
                    Clear
                  </span>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Confirm Mark-All mini-modal ── */}
        <ModalSheet isOpen={!!confirmAll} onClose={() => setConfirmAll(null)} title={confirmAll ? `Mark all as ${confirmAll.status === 'PRESENT' ? 'Present' : confirmAll.status === 'ABSENT' ? 'Absent' : confirmAll.status === 'OD' ? 'On Duty' : 'Holiday'}?` : ''}>
          {confirmAll && (
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 16,
                background: confirmAll.bg,
                border: `1px solid ${confirmAll.color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
              }}>
                <confirmAll.Icon size={22} color={confirmAll.color} />
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 24 }}>
                This will update all {lectures.length} lecture{lectures.length !== 1 ? 's' : ''} for today.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMarkAll(confirmAll)}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 14,
                    background: confirmAll.color,
                    color: '#07110F',
                    border: 'none',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Yes, Mark All
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setConfirmAll(null)}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 14,
                    background: 'rgba(90,107,104,0.15)',
                    color: 'var(--text-secondary)',
                    border: '1px solid rgba(90,107,104,0.2)',
                    fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          )}
        </ModalSheet>

        {/* ── Lecture Cards ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Today's Classes</h2>
          <span style={{
            fontSize: 11, color: 'var(--text-secondary)',
            background: 'var(--card)', padding: '3px 9px',
            borderRadius: 10, border: '1px solid var(--border)',
          }}>
            {lectures.length} lectures
          </span>
        </div>

        {lectures.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center', padding: '44px 20px',
              background: 'var(--card)', borderRadius: 20,
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 10 }}>🎉</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              No classes today!
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Enjoy your free day — you've earned it.
            </div>
          </motion.div>
        ) : (
          lectures.map((lecture, i) => (
            <motion.div
              key={lecture.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <LectureCard lecture={lecture} periodIndex={i + 1} />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
