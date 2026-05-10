export function calcAttendance(attended, od, total) {
  if (total === 0) return 0;
  return Math.round(((attended + od) / total) * 100);
}

export function classesNeeded(attended, od, total, target) {
  const t = target / 100;
  const needed = Math.ceil((t * total - attended - od) / (1 - t));
  return Math.max(0, needed);
}

export function canBunk(attended, od, total, target) {
  const t = target / 100;
  const safe = Math.floor((attended + od - t * total) / t);
  return Math.max(0, safe);
}

export function getAttendanceColor(pct, target) {
  if (pct >= target) return 'var(--accent)';
  if (pct >= target - 10) return 'var(--warning)';
  return 'var(--danger)';
}

export function getAttendanceBg(pct, target) {
  if (pct >= target) return 'var(--accent-dim)';
  if (pct >= target - 10) return 'var(--warning-dim)';
  return 'var(--danger-dim)';
}
