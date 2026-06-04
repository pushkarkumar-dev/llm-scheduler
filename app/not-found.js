import Button from '@/components/Button';

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '90px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-soft)', marginBottom: 22, padding: '5px 14px', borderRadius: 99, backgroundColor: 'var(--accent-muted)', border: '1px solid rgba(99,102,241,0.3)', boxShadow: 'var(--shadow-glow)' }}>
        Error 404
      </div>
      <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.035em', marginBottom: 10 }}>Page not found</h1>
      <p style={{ fontSize: 14.5, color: 'var(--text-muted)', marginBottom: 32, maxWidth: 340, lineHeight: 1.55 }}>
        This page doesn&apos;t exist or the resource was deleted.
      </p>
      <Button href="/" variant="primary" size="md" icon="arrowL">Back to Tasks</Button>
    </div>
  );
}
