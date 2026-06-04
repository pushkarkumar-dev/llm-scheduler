'use client';

export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 14, padding: '24px 28px', width: '100%', maxWidth: 400, boxShadow: '0 24px 60px rgba(0,0,0,0.5)', animation: 'dialogIn 0.15s ease' }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 3l6.5 12H2.5L9 3z" stroke="#f87171" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M9 8v3.5M9 13.5v.5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>{message}</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{ padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', cursor: 'pointer' }}>
            Delete
          </button>
        </div>
        <style>{`@keyframes dialogIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }`}</style>
      </div>
    </div>
  );
}
