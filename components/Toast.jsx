'use client';

import { useEffect } from 'react';
import Icon from './Icon';

const STYLES = {
  success: { accent: 'var(--success)', fg: 'var(--success-fg)', icon: 'circleCheck' },
  error:   { accent: 'var(--danger)',  fg: 'var(--danger-fg)',  icon: 'warning' },
  info:    { accent: 'var(--accent)',  fg: 'var(--accent-soft)', icon: 'info' },
};

export default function Toast({ message, type = 'info', onClose }) {
  const s = STYLES[type] ?? STYLES.info;

  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 100,
      display: 'flex', alignItems: 'center', gap: 11,
      padding: '13px 16px', borderRadius: 'var(--r-lg)',
      backgroundColor: 'var(--bg-elevated)',
      border: '1px solid var(--border-light)',
      boxShadow: 'var(--shadow-lg)',
      fontSize: 13.5, maxWidth: 360,
      backdropFilter: 'blur(12px)',
      animation: 'slide-up 0.22s var(--ease-out)',
    }}>
      <span style={{ display: 'flex', flexShrink: 0, width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 7, backgroundColor: `${s.accent}1f`, color: s.fg }}>
        <Icon name={s.icon} size={15} />
      </span>
      <span style={{ flex: 1, color: 'var(--text-primary)', lineHeight: 1.4 }}>{message}</span>
      <button onClick={onClose} style={{ display: 'flex', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0, padding: 2 }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
        <Icon name="x" size={14} />
      </button>
    </div>
  );
}
