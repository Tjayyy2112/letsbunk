import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import SubjectCard from '../components/SubjectCard';
import AddSubjectScreen from './AddSubjectScreen';
import { Plus, Search, X, Trash2, Edit3 } from 'lucide-react';
import ModalSheet from '../components/ModalSheet';
import { calcAttendance, getAttendanceColor } from '../utils/attendance';

export default function SubjectsScreen() {
  const { subjects, deleteSubject } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [detailSubject, setDetailSubject] = useState(null);
  const [editSubject, setEditSubject] = useState(null);
  const [actionSubject, setActionSubject] = useState(null);

  const filtered = subjects.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.faculty.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 100 }}>
      <div style={{ padding: '56px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>Subjects</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{subjects.length} enrolled</p>
          </div>
        </div>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--card)', borderRadius: 16, padding: '0 16px',
          border: '1px solid var(--border)', marginBottom: 20,
        }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search subjects..."
            style={{
              flex: 1, background: 'none', border: 'none', padding: '14px 0',
              color: 'var(--text-primary)', fontSize: 14,
            }}
          />
          {search && (
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSearch('')}>
              <X size={14} color="var(--text-muted)" />
            </motion.button>
          )}
        </div>

        {/* Overall summary */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20,
        }}>
          {[
            { label: 'Total', value: subjects.length, color: 'var(--accent)' },
            {
              label: 'Healthy',
              value: subjects.filter(s => calcAttendance(s.attended, s.od, s.total) >= s.target).length,
              color: 'var(--success)'
            },
            {
              label: 'At Risk',
              value: subjects.filter(s => calcAttendance(s.attended, s.od, s.total) < s.target).length,
              color: 'var(--danger)'
            },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              background: 'var(--card)', borderRadius: 16, padding: '14px',
              border: '1px solid var(--border)', textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
            <div style={{ color: 'var(--text-secondary)' }}>
              {search ? 'No subjects found' : 'No subjects yet'}
            </div>
          </div>
        )}

        {filtered.map((subject, i) => (
          <motion.div key={subject.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <SubjectCard
              subject={subject}
              onClick={() => setDetailSubject(subject)}
              onLongPress={() => setActionSubject(subject)}
            />
          </motion.div>
        ))}
      </div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAdd(true)}
        style={{
          position: 'fixed', bottom: 100, right: 24,
          width: 56, height: 56, borderRadius: 20,
          background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(142,216,204,0.35)',
          border: 'none', cursor: 'pointer', zIndex: 50,
        }}
      >
        <Plus size={24} color="#07110F" strokeWidth={2.5} />
      </motion.button>

      {/* Detail Sheet */}
      <ModalSheet isOpen={!!detailSubject} onClose={() => setDetailSubject(null)} title={detailSubject?.name}>
        {detailSubject && <SubjectDetail subject={detailSubject} onEdit={(sub) => { setEditSubject(sub); setDetailSubject(null); }} onDelete={(id) => { deleteSubject(id); setDetailSubject(null); }} />}
      </ModalSheet>

      {/* Long press actions */}
      <ModalSheet isOpen={!!actionSubject} onClose={() => setActionSubject(null)} title="Subject Actions">
        {actionSubject && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setEditSubject(actionSubject); setActionSubject(null); }}
              style={{
                padding: '14px', borderRadius: 16, background: 'var(--accent-dim)',
                border: '1px solid rgba(142,216,204,0.2)', color: 'var(--accent)',
                fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10,
              }}>
              <Edit3 size={16} /> Edit Subject
            </motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => { deleteSubject(actionSubject.id); setActionSubject(null); }}
              style={{
                padding: '14px', borderRadius: 16, background: 'var(--danger-dim)',
                border: '1px solid rgba(216,92,99,0.2)', color: 'var(--danger)',
                fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10,
              }}>
              <Trash2 size={16} /> Delete Subject
            </motion.button>
          </div>
        )}
      </ModalSheet>

      <AddSubjectScreen isOpen={showAdd || !!editSubject} onClose={() => { setShowAdd(false); setEditSubject(null); }} editSubject={editSubject} />
    </div>
  );
}

function SubjectDetail({ subject, onEdit, onDelete }) {
  const pct = calcAttendance(subject.attended, subject.od, subject.total);
  const color = getAttendanceColor(pct, subject.target);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ fontSize: 36 }}>{subject.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{subject.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{subject.faculty}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 36, fontWeight: 800, color }}>{pct}%</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
            <button 
              onClick={() => onEdit(subject)}
              style={{ 
                background: 'var(--accent-dim)', color: 'var(--accent)', border: 'none', 
                padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 700, 
                cursor: 'pointer'
              }}
            >
              Edit
            </button>
            <button 
              onClick={() => {
                if (window.confirm('Delete this subject entirely? All history will be lost.')) {
                  onDelete(subject.id);
                }
              }}
              style={{ 
                background: 'var(--danger-dim)', color: 'var(--danger)', border: 'none', 
                padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 700, 
                cursor: 'pointer'
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {[
          { l: 'Attended', v: subject.attended, c: 'var(--accent)' },
          { l: 'Absent', v: subject.absent, c: 'var(--danger)' },
          { l: 'On Duty', v: subject.od, c: 'var(--blue)' },
          { l: 'Holiday', v: subject.off, c: 'var(--warning)' },
          { l: 'Total', v: subject.total, c: 'var(--text-primary)' },
          { l: 'Target', v: `${subject.target}%`, c: 'var(--text-primary)' },
        ].map(({ l, v, c }) => (
          <div key={l} style={{
            background: 'var(--border)', borderRadius: 14, padding: '14px',
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: c }}>{v}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
