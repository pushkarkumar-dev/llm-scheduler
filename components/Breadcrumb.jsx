import Link from 'next/link';
import Icon from './Icon';

export default function Breadcrumb({ items }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 22, fontSize: 12.5 }}>
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
            {item.href && !last ? (
              <Link href={item.href} style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                /* hover handled by parent color */>
                {i === 0 && <Icon name="arrowL" size={13} />}
                {item.label}
              </Link>
            ) : (
              <span style={{ color: last ? 'var(--text-secondary)' : 'var(--text-muted)', fontWeight: last ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 320 }}>
                {item.label}
              </span>
            )}
            {!last && <Icon name="chevronR" size={12} style={{ color: 'var(--text-muted)', opacity: 0.6 }} />}
          </span>
        );
      })}
    </div>
  );
}
