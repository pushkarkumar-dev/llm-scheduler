const CONFIG = {
  active:    { label: 'Active',    bg: 'rgba(16,185,129,0.12)', text: 'var(--success-fg)', border: 'rgba(16,185,129,0.28)', dot: '#10b981' },
  paused:    { label: 'Paused',    bg: 'rgba(100,116,139,0.12)', text: '#94a3b8', border: 'rgba(100,116,139,0.22)', dot: '#64748b' },
  completed: { label: 'Completed', bg: 'rgba(99,102,241,0.12)', text: 'var(--accent-soft)', border: 'rgba(99,102,241,0.28)', dot: '#6366f1' },
  success:   { label: 'Success',   bg: 'rgba(16,185,129,0.12)', text: 'var(--success-fg)', border: 'rgba(16,185,129,0.28)', dot: '#10b981' },
  failed:    { label: 'Failed',    bg: 'rgba(239,68,68,0.12)',  text: 'var(--danger-fg)',  border: 'rgba(239,68,68,0.28)',  dot: '#ef4444' },
  running:   { label: 'Running',   bg: 'rgba(56,189,248,0.12)', text: 'var(--info-fg)', border: 'rgba(56,189,248,0.28)', dot: '#38bdf8', pulse: true },
  pending:   { label: 'Pending',   bg: 'rgba(100,116,139,0.1)', text: '#94a3b8', border: 'rgba(100,116,139,0.22)', dot: '#64748b' },
};

export default function StatusBadge({ status }) {
  const c = CONFIG[status] ?? { label: status, bg: 'rgba(30,45,71,0.8)', text: 'var(--text-secondary)', border: 'var(--border)', dot: '#586a8c' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 10px', borderRadius: 99,
      fontSize: 11.5, fontWeight: 600, letterSpacing: '0.005em',
      backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}`,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', backgroundColor: c.dot, flexShrink: 0,
        boxShadow: `0 0 6px ${c.dot}`,
        animation: c.pulse ? 'pulse-dot 1.4s ease-in-out infinite' : 'none',
      }} />
      {c.label}
    </span>
  );
}
