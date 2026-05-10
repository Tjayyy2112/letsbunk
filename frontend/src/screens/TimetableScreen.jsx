import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Plus, Trash2, Clock, MapPin, User, ChevronLeft, ChevronRight } from 'lucide-react';
import ModalSheet from '../components/ModalSheet';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_FULL = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };
const TODAY_IDX = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];

export default function TimetableScreen() {
  const { timetable, subjects, addTimetableEntry, deleteTimetableEntry, updateTimetableEntry } = useStore();

  const initDay = DAYS.includes(TODAY_IDX) ? TODAY_IDX : 'Mon';
  const [activeDayIdx, setActiveDayIdx] = useState(DAYS.indexOf(initDay));
  const [showAdd, setShowAdd] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [form, setForm] = useState({ subjectId: '', time: '', room: '', faculty: '' });
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, day }

  const activeDay = DAYS[activeDayIdx];
  const entries = timetable[activeDay] || [];

  const goLeft  = () => setActiveDayIdx(i => Math.max(0, i - 1));
  const goRight = () => setActiveDayIdx(i => Math.min(DAYS.length - 1, i + 1));

  const openAdd = () => {
    setForm({ subjectId: subjects[0]?.id || '', time: '9:00 AM', room: '', faculty: '' });
    setEditEntry(null);
    setShowAdd(true);
  };

  const openEdit = (entry) => {
    setForm({ subjectId: entry.subjectId, time: entry.time, room: entry.room, faculty: entry.faculty });
    setEditEntry(entry);
    setShowAdd(true);
  };

  const handleSave = () => {
    if (!form.subjectId || !form.time) return;
    if (editEntry) updateTimetableEntry(activeDay, editEntry.id, form);
    else addTimetableEntry(activeDay, form);
    setShowAdd(false);
    setEditEntry(null);
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 110 }}>
      <div style={{ padding: '56px 0 0' }}>

        {/* Header */}
        <div style={{ padding: '0 20px', marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>Timetable</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Weekly schedule</p>
        </div>

        {/* ── Day Navigator with arrows ── */}
        <div style={{ padding: '0 20px', marginBottom: 24 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--card)', borderRadius: 20,
            border: '1px solid var(--border)', padding: '10px 14px',
          }}>
            {/* Left arrow */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={goLeft}
              disabled={activeDayIdx === 0}
              style={{
                width: 36, height: 36, borderRadius: 12, flexShrink: 0,
                background: activeDayIdx === 0 ? 'rgba(255,255,255,0.03)' : 'var(--accent-dim)',
                border: `1px solid ${activeDayIdx === 0 ? 'var(--border)' : 'rgba(142,216,204,0.25)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: activeDayIdx === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <ChevronLeft size={18} color={activeDayIdx === 0 ? 'var(--text-muted)' : 'var(--accent)'} />
            </motion.button>

            {/* Center: current day + dot strip */}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <motion.div
                key={activeDay}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.18 }}
              >
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {DAY_FULL[activeDay]}
                  {activeDay === TODAY_IDX && (
                    <span style={{
                      marginLeft: 8, fontSize: 10, fontWeight: 600,
                      color: 'var(--accent)', background: 'var(--accent-dim)',
                      padding: '2px 7px', borderRadius: 6,
                      verticalAlign: 'middle',
                    }}>TODAY</span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3 }}>
                  {entries.length} class{entries.length !== 1 ? 'es' : ''}
                </div>
              </motion.div>
            </div>

            {/* Right arrow */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={goRight}
              disabled={activeDayIdx === DAYS.length - 1}
              style={{
                width: 36, height: 36, borderRadius: 12, flexShrink: 0,
                background: activeDayIdx === DAYS.length - 1 ? 'rgba(255,255,255,0.03)' : 'var(--accent-dim)',
                border: `1px solid ${activeDayIdx === DAYS.length - 1 ? 'var(--border)' : 'rgba(142,216,204,0.25)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: activeDayIdx === DAYS.length - 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <ChevronRight size={18} color={activeDayIdx === DAYS.length - 1 ? 'var(--text-muted)' : 'var(--accent)'} />
            </motion.button>
          </div>

          {/* Dot strip showing all 7 days */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10 }}>
            {DAYS.map((d, i) => (
              <motion.button
                key={d}
                onClick={() => setActiveDayIdx(i)}
                whileTap={{ scale: 0.8 }}
                style={{ background: 'none', border: 'none', padding: '4px 2px', cursor: 'pointer' }}
              >
                <motion.div
                  animate={{
                    width: i === activeDayIdx ? 20 : 6,
                    background: i === activeDayIdx
                      ? 'var(--accent)'
                      : d === TODAY_IDX
                        ? 'rgba(142,216,204,0.35)'
                        : 'rgba(255,255,255,0.1)',
                  }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  style={{ height: 6, borderRadius: 3 }}
                />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Entries */}
        <div style={{ padding: '0 20px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDay}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18 }}
            >
              {entries.length === 0 ? (
                <motion.div
                  style={{
                    textAlign: 'center', padding: '48px 24px',
                    background: 'var(--card)', borderRadius: 20,
                    border: '2px dashed var(--border)',
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
                    No classes on {DAY_FULL[activeDay]}
                  </div>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={openAdd}
                    style={{
                      padding: '10px 22px', borderRadius: 14, fontSize: 13, fontWeight: 600,
                      background: 'var(--accent-dim)', color: 'var(--accent)',
                      border: '1px solid rgba(142,216,204,0.2)', cursor: 'pointer',
                    }}>
                    + Add Class
                  </motion.button>
                </motion.div>
              ) : (
                entries.map((entry, i) => {
                  const subject = subjects.find(s => s.id === entry.subjectId);
                  if (!subject) return null;
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: i * 0.05 }}
                      style={{
                        background: 'var(--card)', borderRadius: 20, marginBottom: 12,
                        border: `1px solid ${subject.color}20`, overflow: 'hidden',
                      }}
                    >
                      <div style={{ display: 'flex' }}>
                        <div style={{ width: 4, background: subject.color, flexShrink: 0 }} />
                        <div style={{ flex: 1, padding: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                                {subject.icon} {subject.name}
                              </div>
                              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                {[
                                  { Icon: Clock,  val: entry.time },
                                  { Icon: MapPin, val: entry.room || 'TBD' },
                                  { Icon: User,   val: entry.faculty },
                                ].map(({ Icon, val }) => (
                                  <span key={val} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                                    <Icon size={11} /> {val}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <motion.button whileTap={{ scale: 0.85 }} onClick={() => openEdit(entry)}
                                style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--accent-dim)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: 13 }}>✏️</span>
                              </motion.button>
                              <motion.button whileTap={{ scale: 0.85 }} onClick={() => setDeleteTarget({ id: entry.id, day: activeDay })}
                                style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--danger-dim)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Trash2 size={13} color="var(--danger)" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* FAB */}
      {entries.length > 0 && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={openAdd}
          style={{
            position: 'fixed', bottom: 100, right: 24,
            width: 56, height: 56, borderRadius: 20,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(142,216,204,0.35)',
            border: 'none', cursor: 'pointer', zIndex: 50,
          }}>
          <Plus size={24} color="#07110F" strokeWidth={2.5} />
        </motion.button>
      )}

      {/* ── Add/Edit modal ── */}
      <ModalSheet isOpen={showAdd} onClose={() => setShowAdd(false)} title={editEntry ? 'Edit Class' : 'Add Class'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Subject picker */}
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Subject</label>
            <select
              value={form.subjectId}
              onChange={e => {
                const sub = subjects.find(s => s.id === e.target.value);
                setForm(f => ({ ...f, subjectId: e.target.value, faculty: sub?.faculty || f.faculty }));
              }}
              style={{
                width: '100%', background: '#0D1C19',
                border: '1px solid var(--border-strong)',
                borderRadius: 14, padding: '13px 14px',
                color: 'var(--text-primary)', fontSize: 14,
                colorScheme: 'dark', appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23A8A8A8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
              }}>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
            </select>
          </div>

          {[
            { key: 'time',    label: 'Time',    placeholder: '9:00 AM' },
            { key: 'room',    label: 'Room',    placeholder: 'A101'    },
            { key: 'faculty', label: 'Faculty', placeholder: 'Dr. Name'},
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{label}</label>
              <input
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                style={{
                  width: '100%', background: '#0D1C19',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 14, padding: '13px 14px',
                  color: 'var(--text-primary)', fontSize: 14,
                }}
              />
            </div>
          ))}

          {/* Save — extra bottom margin so it clears the nav bar */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleSave}
            style={{
              width: '100%', padding: '16px', borderRadius: 16,
              fontSize: 15, fontWeight: 700,
              background: 'var(--accent)', color: '#07110F',
              border: 'none', cursor: 'pointer',
              marginTop: 4,
            }}
          >
            {editEntry ? 'Update Class' : 'Add Class'}
          </motion.button>
        </div>
      </ModalSheet>

      {/* ── Safe Delete Modal ── */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
            />
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 24, stiffness: 340 }}
              style={{
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                zIndex: 301, width: 'calc(100% - 48px)', maxWidth: 320,
                background: '#0D1C19', border: '1px solid rgba(216,92,99,0.2)',
                borderRadius: 22, padding: '24px 20px',
                boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🗑️</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                  Delete this class?
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--accent)' }}>Safe Delete</strong> — removes the class from timetable but keeps all attendance history.<br/><br/>
                  <strong style={{ color: 'var(--danger)' }}>Delete</strong> — removes everything including all past attendance records for this class.
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <motion.button whileTap={{ scale: 0.96 }}
                  onClick={async () => { await deleteTimetableEntry(deleteTarget.day, deleteTarget.id); setDeleteTarget(null); }}
                  style={{ width: '100%', padding: '13px', borderRadius: 14, background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(142,216,204,0.2)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  🛡️ Safe Delete (keep history)
                </motion.button>
                <motion.button whileTap={{ scale: 0.96 }}
                  onClick={async () => { await deleteTimetableEntry(deleteTarget.day, deleteTarget.id); setDeleteTarget(null); }}
                  style={{ width: '100%', padding: '13px', borderRadius: 14, background: 'var(--danger)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  🗑️ Delete Everything
                </motion.button>
                <motion.button whileTap={{ scale: 0.96 }}
                  onClick={() => setDeleteTarget(null)}
                  style={{ width: '100%', padding: '13px', borderRadius: 14, background: 'rgba(90,107,104,0.15)', color: 'var(--text-secondary)', border: '1px solid rgba(90,107,104,0.2)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
