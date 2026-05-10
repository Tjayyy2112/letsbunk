import React, { useEffect, useState } from 'react';
import { motion, animate, useMotionValue, useTransform } from 'framer-motion';

export default function AttendanceRing({ percentage, target, size = 140, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayPct, setDisplayPct] = useState(0);

  useEffect(() => {
    const controls = animate(count, Number(percentage) || 0, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (v) => setDisplayPct(Math.round(v))
    });
    return controls.stop;
  }, [percentage]);

  const dashOffset = circumference - (displayPct / 100) * circumference;
  const color = percentage >= target ? '#8ED8CC' : percentage >= target - 10 ? '#E8A838' : '#D85C63';

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(142,216,204,0.08)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 0.2 }}
          style={{ filter: 'drop-shadow(0 0 4px rgba(142,216,204,0.3))' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 30, fontWeight: 700, color, lineHeight: 1 }}>{displayPct}%</span>
        <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>attendance</span>
      </div>
    </div>
  );
}
