import { create } from 'zustand';
import * as api from '../api/client';
import { format } from 'date-fns';

export const useStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────
  subjects:       [],
  timetable:      { Mon:[], Tue:[], Wed:[], Thu:[], Fri:[], Sat:[], Sun:[] },
  attendanceLogs: {},   // key: `${subjectId}-${date}`
  settings:       { target_attendance: 75, notifications: true },
  loading:        true,
  error:          null,
  streak:         0,

  // ── Bootstrap: load everything on app start ────────
  bootstrap: async () => {
    try {
      const [subjects, timetable, logs, settings] = await Promise.all([
        api.getSubjects(),
        api.getTimetable(),
        api.getLogs(),
        api.getSettings(),
      ]);
      // Build log map
      const logMap = {};
      logs.forEach(l => { logMap[`${l.subjectId}-${l.date}`] = l; });
      set({ subjects, timetable, attendanceLogs: logMap, settings, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // ── Subjects ───────────────────────────────────────
  addSubject: async (data) => {
    const subject = await api.createSubject(data);
    set(s => ({ subjects: [...s.subjects, subject] }));
    return subject;
  },

  updateSubjectMeta: async (id, data) => {
    const updated = await api.updateSubject(id, data);
    set(s => ({ subjects: s.subjects.map(sub => sub.id === id ? updated : sub) }));
  },

  deleteSubject: async (id, safe = false) => {
    await api.deleteSubject(id, safe);
    if (!safe) {
      // Hard delete: remove from UI entirely
      set(s => ({
        subjects: s.subjects.filter(sub => sub.id !== id),
        timetable: Object.fromEntries(
          Object.entries(s.timetable).map(([day, entries]) => [
            day, entries.filter(e => e.subjectId !== id)
          ])
        ),
      }));
    } else {
      // Safe delete: remove only from timetable, keep subject stats visible
      set(s => ({
        timetable: Object.fromEntries(
          Object.entries(s.timetable).map(([day, entries]) => [
            day, entries.filter(e => e.subjectId !== id)
          ])
        ),
      }));
    }
  },

  // ── Attendance ────────────────────────────────────
  markAttendance: async (subjectId, date, status, reason = '') => {
    try {
      // Optimistic update for instant UI response
      const key = `${subjectId}-${date}`;
      const existing = get().attendanceLogs[key];

      // Server call — returns { log, subject } with recalculated counters
      const { log, subject } = await api.markAttendance({ subjectId, date, status, reason });

      set(s => ({
        // Replace the subject with server-calculated values (source of truth)
        subjects: s.subjects.map(sub => sub.id === subjectId ? subject : sub),
        attendanceLogs: { ...s.attendanceLogs, [key]: log },
      }));
    } catch (err) {
      console.error('Mark attendance failed:', err);
    }
  },

  clearAttendance: async (subjectId, date) => {
    try {
      const { subject } = await api.clearAttendance(subjectId, date);
      const key = `${subjectId}-${date}`;
      set(s => {
        const logs = { ...s.attendanceLogs };
        delete logs[key];
        return {
          subjects: s.subjects.map(sub => sub.id === subjectId ? subject : sub),
          attendanceLogs: logs,
        };
      });
    } catch (err) {
      console.error('Clear attendance failed:', err);
    }
  },

  // ── Timetable ─────────────────────────────────────
  addTimetableEntry: async (day, data) => {
    const entry = await api.createEntry({ ...data, day });
    set(s => ({
      timetable: { ...s.timetable, [day]: [...(s.timetable[day] || []), entry] }
    }));
  },

  updateTimetableEntry: async (day, id, data) => {
    const updated = await api.updateEntry(id, { ...data, day });
    set(s => ({
      timetable: {
        ...s.timetable,
        [day]: s.timetable[day].map(e => e.id === id ? updated : e),
      }
    }));
  },

  deleteTimetableEntry: async (day, id) => {
    await api.deleteEntry(id);
    set(s => ({
      timetable: { ...s.timetable, [day]: s.timetable[day].filter(e => e.id !== id) }
    }));
  },

  // ── Settings ──────────────────────────────────────
  updateSettings: async (data) => {
    const updated = await api.updateSettings(data);
    set({ settings: updated });
  },

  // ── Helpers ───────────────────────────────────────
  getLogForDate: (subjectId, date) => {
    return get().attendanceLogs[`${subjectId}-${date}`] || null;
  },

  getTodayLectures: () => {
    const { timetable, subjects } = get();
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const day = dayNames[new Date().getDay()];
    return (timetable[day] || []).map(slot => ({
      ...slot,
      subject: subjects.find(s => s.id === slot.subjectId),
    })).filter(l => l.subject);
  },

  resetSemester: async () => {
    await api.resetSemester();
    const subjects = await api.getSubjects();
    set({ subjects, attendanceLogs: {} });
  },
}));
