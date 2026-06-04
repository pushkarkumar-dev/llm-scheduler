export function SkeletonRow({ cols = 6 }) {
  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '16px' }}>
          <div className="skeleton" style={{ height: 12, width: `${55 + (i * 23) % 40}%` }} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div className="skeleton" style={{ height: 10, width: 90, marginBottom: 14 }} />
      <div className="skeleton" style={{ height: 30, width: 56, borderRadius: 8 }} />
    </div>
  );
}
