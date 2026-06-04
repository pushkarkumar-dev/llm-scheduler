import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 20, padding: '4px 12px', borderRadius: 99, backgroundColor: 'var(--accent-muted)', border: '1px solid rgba(99,102,241,0.3)' }}>
        404
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 10 }}>Page not found</h1>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 32, maxWidth: 320 }}>
        This page doesn't exist or the resource was deleted.
      </p>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 9, fontSize: 13.5, fontWeight: 600, background: 'linear-gradient(135deg, #6366f1, #7c3aed)', color: 'white', textDecoration: 'none', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
        Back to Tasks
      </Link>
    </div>
  );
}
