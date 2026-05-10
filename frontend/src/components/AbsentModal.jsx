import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, FileText, Save, Heart } from 'lucide-react';
import ModalSheet from './ModalSheet';
import { format } from 'date-fns';

export default function AbsentModal({ isOpen, onClose, onSave, subjectName, date }) {
  const [reason, setReason] = useState('');
  const [isMedical, setIsMedical] = useState(false);
  const [selectedDate, setSelectedDate] = useState(date || format(new Date(), 'yyyy-MM-dd'));

  const handleSave = () => {
    onSave(isMedical ? `[Medical] ${reason}` : reason);
    setReason('');
    setIsMedical(false);
  };

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} title="Mark Absent">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
        padding: '10px 14px', background: 'var(--danger-dim)', borderRadius: 14,
        border: '1px solid rgba(216,92,99,0.2)' }}>
        <X size={16} color="var(--danger)" />
        <span style={{ fontSize: 13, color: 'var(--danger)', fontWeight: 500 }}>{subjectName}</span>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
          <FileText size={12} style={{ display: 'inline', marginRight: 4 }} /> Reason (optional)
        </label>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Why were you absent? (optional)"
          rows={3}
          style={{
            width: '100%', background: 'var(--card)', border: '1px solid var(--border-strong)',
            borderRadius: 14, padding: '12px 14px', color: 'var(--text-primary)', fontSize: 14,
            resize: 'none', lineHeight: 1.5,
          }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
          <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} /> Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          style={{
            width: '100%', background: 'var(--card)', border: '1px solid var(--border-strong)',
            borderRadius: 14, padding: '12px 14px', color: 'var(--text-primary)', fontSize: 14,
            colorScheme: 'dark',
          }}
        />
      </div>

      <motion.button
        onClick={() => setIsMedical(m => !m)}
        whileTap={{ scale: 0.96 }}
        style={{
          width: '100%', padding: '12px 14px', borderRadius: 14, marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 10,
          background: isMedical ? 'rgba(216,92,99,0.12)' : 'var(--card)',
          border: `1px solid ${isMedical ? 'rgba(216,92,99,0.3)' : 'var(--border)'}`,
          transition: 'all 0.2s', cursor: 'pointer',
        }}
      >
        <div style={{
          width: 20, height: 20, borderRadius: 6,
          background: isMedical ? 'var(--danger)' : 'transparent',
          border: `2px solid ${isMedical ? 'var(--danger)' : 'var(--border-strong)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s', flexShrink: 0,
        }}>
          {isMedical && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <span style={{ color: '#fff', fontSize: 12 }}>✓</span>
          </motion.div>}
        </div>
        <Heart size={14} color={isMedical ? 'var(--danger)' : 'var(--text-secondary)'} />
        <span style={{ fontSize: 13, color: isMedical ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: 500 }}>
          Medical leave
        </span>
      </motion.button>

      <div style={{ display: 'flex', gap: 10 }}>
        <motion.button whileTap={{ scale: 0.95 }} onClick={onClose}
          style={{
            flex: 1, padding: '14px', borderRadius: 16, fontSize: 14, fontWeight: 600,
            background: 'rgba(90,107,104,0.15)', color: 'var(--text-secondary)',
            border: '1px solid rgba(90,107,104,0.2)',
          }}>
          Cancel
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave}
          style={{
            flex: 2, padding: '14px', borderRadius: 16, fontSize: 14, fontWeight: 700,
            background: 'var(--danger)', color: '#fff', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
          <Save size={16} /> Save Absent
        </motion.button>
      </div>
    </ModalSheet>
  );
}
