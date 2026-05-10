import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Calendar, FileText, Save } from 'lucide-react';
import ModalSheet from './ModalSheet';
import { format } from 'date-fns';

export default function ODModal({ isOpen, onClose, onSave, subjectName, date }) {
  const [reason, setReason] = useState('');
  const [selectedDate, setSelectedDate] = useState(date || format(new Date(), 'yyyy-MM-dd'));

  const handleSave = () => {
    if (!reason.trim()) return;
    onSave(reason);
    setReason('');
  };

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} title="OD Entry">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
        padding: '10px 14px', background: 'var(--blue-dim)', borderRadius: 14,
        border: '1px solid rgba(91,155,213,0.2)' }}>
        <Zap size={16} color="var(--blue)" />
        <span style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 500 }}>{subjectName}</span>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
          <FileText size={12} style={{ display: 'inline', marginRight: 4 }} />
          Reason / Note <span style={{ color: 'var(--danger)' }}>*</span>
        </label>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. Hackathon participation, Industrial visit..."
          rows={3}
          style={{
            width: '100%', background: 'var(--card)', border: '1px solid var(--border-strong)',
            borderRadius: 14, padding: '12px 14px', color: 'var(--text-primary)', fontSize: 14,
            resize: 'none', lineHeight: 1.5,
          }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
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

      <div style={{ display: 'flex', gap: 10 }}>
        <motion.button whileTap={{ scale: 0.95 }} onClick={onClose}
          style={{
            flex: 1, padding: '14px', borderRadius: 16, fontSize: 14, fontWeight: 600,
            background: 'rgba(90,107,104,0.15)', color: 'var(--text-secondary)',
            border: '1px solid rgba(90,107,104,0.2)',
          }}>
          Cancel
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={!reason.trim()}
          style={{
            flex: 2, padding: '14px', borderRadius: 16, fontSize: 14, fontWeight: 700,
            background: reason.trim() ? 'var(--blue)' : 'rgba(91,155,213,0.2)',
            color: reason.trim() ? '#fff' : 'rgba(91,155,213,0.5)',
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.2s',
          }}
        >
          <Save size={16} /> Save OD
        </motion.button>
      </div>
    </ModalSheet>
  );
}
