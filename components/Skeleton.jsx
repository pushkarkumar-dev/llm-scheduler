export function SkeletonRow({ cols = 6 }) {
  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-3 rounded-full animate-pulse" style={{ backgroundColor: 'var(--bg-elevated)', width: `${60 + (i * 17) % 40}%` }} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl p-5 animate-pulse" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
      <div className="h-2.5 w-24 rounded-full mb-3" style={{ backgroundColor: 'var(--bg-elevated)' }} />
      <div className="h-8 w-16 rounded-lg" style={{ backgroundColor: 'var(--bg-elevated)' }} />
    </div>
  );
}
