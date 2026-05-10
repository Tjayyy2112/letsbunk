import express from 'express';
import pool from '../db/index.js';

const router = express.Router();

// GET all logs (optional ?date=YYYY-MM-DD or ?subjectId=x)
router.get('/', async (req, res) => {
  try {
    const { date, subjectId } = req.query;
    let q = `SELECT al.id, al.subject_id AS "subjectId", al.date, al.status, al.reason, al.created_at
             FROM attendance_logs al`;
    const params = [];
    const wheres = [];
    if (date)      { params.push(date);      wheres.push(`al.date=$${params.length}`); }
    if (subjectId) { params.push(subjectId); wheres.push(`al.subject_id=$${params.length}`); }
    if (wheres.length) q += ' WHERE ' + wheres.join(' AND ');
    q += ' ORDER BY al.date DESC, al.created_at DESC';
    const { rows } = await pool.query(q, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST mark attendance (creates or replaces for that subject+date)
router.post('/', async (req, res) => {
  const { subjectId, date, status, reason } = req.body;
  if (!subjectId || !date || !status) return res.status(400).json({ error: 'subjectId, date, status required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check existing log for this subject+date
    const existing = await client.query(
      `SELECT status FROM attendance_logs WHERE subject_id=$1 AND date=$2`,
      [subjectId, date]
    );
    const oldStatus = existing.rows[0]?.status || null;

    // Build counter delta
    const delta = (s, sign) => {
      if (!s) return {};
      const map = {
        PRESENT: { attended: sign },
        ABSENT:  { absent:    sign },
        OD:      { od:        sign },
        OFF:     { off_count: sign },
      };
      return map[s] || {};
    };

    // Rollback old
    const rollback = delta(oldStatus, -1);
    // Apply new
    const apply    = delta(status, +1);

    // Merge changes
    const changes = {};
    for (const [k, v] of Object.entries(rollback)) changes[k] = (changes[k] || 0) + v;
    for (const [k, v] of Object.entries(apply))    changes[k] = (changes[k] || 0) + v;

    // Total classes change: only non-OFF affects total
    const oldAffectsTotal = oldStatus && oldStatus !== 'OFF';
    const newAffectsTotal = status !== 'OFF';
    if (!oldStatus && newAffectsTotal)          changes.total = 1;
    if (oldStatus && oldAffectsTotal && !newAffectsTotal) changes.total = -1;
    if (!oldStatus && !newAffectsTotal)         {} // OFF added, no total change
    if (oldAffectsTotal && newAffectsTotal)     {} // swapping within totals, no change
    if (oldStatus && !oldAffectsTotal && newAffectsTotal) changes.total = 1;

    // Apply to subject
    const setClauses = Object.entries(changes)
      .filter(([, v]) => v !== 0)
      .map(([col], i) => `${col} = GREATEST(0, ${col} + $${i + 2})`)
      .join(', ');

    if (setClauses) {
      const vals = [subjectId, ...Object.values(changes).filter(v => v !== 0)];
      await client.query(
        `UPDATE subjects SET ${setClauses}, updated_at=NOW() WHERE id=$1`,
        vals
      );
    }

    // Upsert log
    const { rows } = await client.query(
      `INSERT INTO attendance_logs (subject_id, date, status, reason)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (subject_id, date)
       DO UPDATE SET status=$3, reason=$4, updated_at=NOW()
       RETURNING *`,
      [subjectId, date, status, reason || '']
    );

    // Return updated subject
    const subRes = await client.query(
      `SELECT id, name, faculty, color, icon, target,
              attended, absent, od, off_count AS "off", total
       FROM subjects WHERE id=$1`,
      [subjectId]
    );

    await client.query('COMMIT');
    res.json({ log: rows[0], subject: subRes.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// DELETE clear a log for subject+date
router.delete('/', async (req, res) => {
  const { subjectId, date } = req.query;
  if (!subjectId || !date) return res.status(400).json({ error: 'subjectId and date required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existing = await client.query(
      `SELECT status FROM attendance_logs WHERE subject_id=$1 AND date=$2`,
      [subjectId, date]
    );
    if (!existing.rows.length) { await client.query('COMMIT'); return res.json({ ok: true }); }

    const { status } = existing.rows[0];
    await client.query(
      `DELETE FROM attendance_logs WHERE subject_id=$1 AND date=$2`,
      [subjectId, date]
    );

    // Rollback counters
    const colMap = { PRESENT: 'attended', ABSENT: 'absent', OD: 'od', OFF: 'off_count' };
    const col = colMap[status];
    await client.query(
      `UPDATE subjects SET ${col}=GREATEST(0,${col}-1),
       total=GREATEST(0, total - $2), updated_at=NOW()
       WHERE id=$3`,
      [subjectId, status !== 'OFF' ? 1 : 0, subjectId]
    );

    const subRes = await client.query(
      `SELECT id, name, faculty, color, icon, target,
              attended, absent, od, off_count AS "off", total
       FROM subjects WHERE id=$1`,
      [subjectId]
    );

    await client.query('COMMIT');
    res.json({ ok: true, subject: subRes.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// DELETE semester reset — clears all logs and resets subject counters
router.delete('/reset', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM attendance_logs');
    await client.query('UPDATE subjects SET attended=0, absent=0, od=0, off_count=0, total=0, updated_at=NOW()');
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

export default router;
