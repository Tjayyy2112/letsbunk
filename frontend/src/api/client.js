import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 8000,
});

// ── Subjects ──────────────────────────────────────────
export const getSubjects    = ()        => api.get('/subjects').then(r => r.data);
export const createSubject  = (data)    => api.post('/subjects', data).then(r => r.data);
export const updateSubject  = (id,data) => api.put(`/subjects/${id}`, data).then(r => r.data);
export const deleteSubject  = (id, safe=false) =>
  api.delete(`/subjects/${id}?safe=${safe}`).then(r => r.data);

// ── Attendance ────────────────────────────────────────
export const getLogs        = (params={}) => api.get('/attendance', { params }).then(r => r.data);
export const markAttendance = (data)      => api.post('/attendance', data).then(r => r.data);
export const clearAttendance= (date, periodIndex) =>
  api.delete('/attendance', { params: { date, periodIndex } }).then(r => r.data);
export const resetSemester  = ()          => api.delete('/attendance/reset').then(r => r.data);
export const clearAllData   = ()          => api.delete('/attendance/clear-all').then(r => r.data);

// ── Timetable ─────────────────────────────────────────
export const getTimetable   = ()        => api.get('/timetable').then(r => r.data);
export const createEntry    = (data)    => api.post('/timetable', data).then(r => r.data);
export const updateEntry    = (id,data) => api.put(`/timetable/${id}`, data).then(r => r.data);
export const deleteEntry    = (id)      => api.delete(`/timetable/${id}`).then(r => r.data);

// ── Settings ──────────────────────────────────────────
export const getSettings    = ()     => api.get('/settings').then(r => r.data);
export const updateSettings = (data) => api.put('/settings', data).then(r => r.data);
