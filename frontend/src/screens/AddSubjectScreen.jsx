import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import ModalSheet from '../components/ModalSheet';
import { Check } from 'lucide-react';

const ICONS = ['📚', '💻', '🧩', '🗄️', '🌐', '⚙️', '🧮', '🔬', '📐', '🎯', '📊', '🧠'];
const COLORS = ['#8ED8CC', '#5B9BD5', '#E8A838', '#D85C63', '#5CBF8A', '#A78BFA', '#F472B6', '#FB923C'];

export default function AddSubjectScreen({ isOpen, onClose, editSubject }) {
  const { addSubject, updateSubject, subjects } = useStore();
  const [form, setForm] = useState({ name: '', faculty: '', target: 75, color: '#8ED8CC', icon: '📚', attended: 0, absent: 0, od: 0 });
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (editSubject) {
      setForm({ 
        name: editSubject.name, faculty: editSubject.faculty, target: editSubject.target, 
        color: editSubject.color, icon: editSubject.icon,
        attended: editSubject.attended || 0, absent: editSubject.absent || 0, od: editSubject.od || 0 
      });
    } else {
      setForm({ name: '', faculty: '', target: 75, color: '#8ED8CC', icon: '📚', attended: 0, absent: 0, od: 0 });
    }
    setError('');
    setSaved(false);
  }, [editSubject, isOpen]);

  const handleSave = () => {
    if (!form.name.trim()) { setError('Subject name is required'); return; }
    if (!editSubject && subjects.some(s => s.name.toLowerCase() === form.name.toLowerCase())) {
      setError('Subject already exists'); return;
    }
    if (editSubject) updateSubject(editSubject.id, form);
    else addSubject(form);
    setSaved(true);
    setTimeout(() => { onClose(); setSaved(false); }, 800);
  };

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} title={editSubject ? 'Edit Subject' : 'Add Subject'}>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Subject Name *</label>
        <input
          value={form.name}
          onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setError(''); }}
          placeholder="e.g. Data Structures"
          style={{
            width: '100%', background: 'var(--card)', border: `1px solid ${error ? 'var(--danger)' : 'var(--border-strong)'}`,
            borderRadius: 14, padding: '12px 14px', color: 'var(--text-primary)', fontSize: 14,
          }}
        />
        {error && <p style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>{error}</p>}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Faculty</label>
        <input
          value={form.faculty}
          onChange={e => setForm(f => ({ ...f, faculty: e.target.value }))}
          placeholder="e.g. Dr. Mehta"
          style={{
            width: '100%', background: 'var(--card)', border: '1px solid var(--border-strong)',
            borderRadius: 14, padding: '12px 14px', color: 'var(--text-primary)', fontSize: 14,
          }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
          Target Attendance: <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{form.target}%</span>
        </label>
        <input
          type="range" min={50} max={100} step={5}
          value={form.target}
          onChange={e => setForm(f => ({ ...f, target: +e.target.value }))}
          style={{ width: '100%', accentColor: 'var(--accent)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>50%</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>100%</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Attended</label>
          <input
            type="number" min={0} value={form.attended}
            onFocus={e => e.target.select()}
            onChange={e => setForm(f => ({ ...f, attended: e.target.value === '' ? '' : Math.max(0, +e.target.value) }))}
            style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--border-strong)', borderRadius: 14, padding: '12px', color: 'var(--accent)', fontSize: 14, fontWeight: 700, textAlign: 'center' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Absent</label>
          <input
            type="number" min={0} value={form.absent}
            onFocus={e => e.target.select()}
            onChange={e => setForm(f => ({ ...f, absent: e.target.value === '' ? '' : Math.max(0, +e.target.value) }))}
            style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--border-strong)', borderRadius: 14, padding: '12px', color: 'var(--danger)', fontSize: 14, fontWeight: 700, textAlign: 'center' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>OD/Leave</label>
          <input
            type="number" min={0} value={form.od}
            onFocus={e => e.target.select()}
            onChange={e => setForm(f => ({ ...f, od: e.target.value === '' ? '' : Math.max(0, +e.target.value) }))}
            style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--border-strong)', borderRadius: 14, padding: '12px', color: 'var(--blue)', fontSize: 14, fontWeight: 700, textAlign: 'center' }}
          />
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Icon</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ICONS.map(icon => (
            <motion.button key={icon} whileTap={{ scale: 0.85 }} onClick={() => setForm(f => ({ ...f, icon }))}
              style={{
                width: 40, height: 40, borderRadius: 12, fontSize: 20,
                background: form.icon === icon ? 'var(--accent-dim)' : 'var(--card)',
                border: `1px solid ${form.icon === icon ? 'var(--accent)' : 'var(--border)'}`,
                cursor: 'pointer',
              }}>
              {icon}
            </motion.button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Color</label>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {COLORS.map(color => (
            <motion.button key={color} whileTap={{ scale: 0.85 }} onClick={() => setForm(f => ({ ...f, color }))}
              style={{
                width: 32, height: 32, borderRadius: 10, background: color,
                border: form.color === color ? '3px solid white' : '3px solid transparent',
                cursor: 'pointer', boxShadow: form.color === color ? `0 0 12px ${color}80` : 'none',
                transition: 'all 0.2s',
              }} />
          ))}
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={handleSave}
        style={{
          width: '100%', padding: '16px', borderRadius: 18, fontSize: 15, fontWeight: 700,
          background: saved ? 'var(--success)' : 'var(--accent)',
          color: '#07110F', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'background 0.3s',
        }}
      >
        {saved ? <><Check size={18} /> Saved!</> : editSubject ? 'Update Subject' : 'Add Subject'}
      </motion.button>
    </ModalSheet>
  );
}
