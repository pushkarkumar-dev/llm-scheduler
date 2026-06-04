const CONFIG = {
  active:    { label: 'Active',    bg: 'rgba(16,185,129,0.12)', text: '#34d399', border: 'rgba(16,185,129,0.25)', dot: '#10b981' },
  paused:    { label: 'Paused',    bg: 'rgba(100,116,139,0.12)', text: '#94a3b8', border: 'rgba(100,116,139,0.2)', dot: '#64748b' },
  completed: { label: 'Completed', bg: 'rgba(99,102,241,0.12)', text: '#a5b4fc', border: 'rgba(99,102,241,0.25)', dot: '#6366f1' },
  success:   { label: 'Success',   bg: 'rgba(16,185,129,0.12)', text: '#34d399', border: 'rgba(16,185,129,0.25)', dot: '#10b981' },
  failed:    { label: 'Failed',    bg: 'rgba(239,68,68,0.12)',  text: '#f87171', border: 'rgba(239,68,68,0.25)',  dot: '#ef4444' },
  running:   { label: 'Running',   bg: 'rgba(56,189,248,0.12)', text: '#7dd3fc', border: 'rgba(56,189,248,0.25)', dot: '#38bdf8', pulse: true },
  pending:   { label: 'Pending',   bg: 'rgba(100,116,139,0.1)', text: '#94a3b8', border: 'rgba(100,116,139,0.2)', dot: '#64748b' },
};

export default function StatusBadge({ status }) {
  const c = CONFIG[status] ?? { label: status, bg: 'rgba(30,45,71,0.8)', text: '#8b9fc4', border: 'var(--border)', dot: '#4d6080' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 9px',
      borderRadius: '99px',
      fontSize: '11.5px',
      fontWeight: 600,
      letterSpacing: '0.01em',
      backgroundColor: c.bg,
      color: c.text,
      border: `1px solid ${c.border}`,
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: '50%', backgroundColor: c.dot, flexShrink: 0,
        animation: c.pulse ? 'pulse 1.5s ease-in-out infinite' : 'none',
      }} />
      {c.label}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </span>
  );
}
