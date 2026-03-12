export default function ModernTable({ rows }: any) {
  if (!rows || rows.length === 0) return null;

  return (
    <div className="dark-card" style={{ padding: '24px', overflowX: 'auto', marginBottom: 0 }}>
      <h2>Derniers articles publiés</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font)' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th style={{ padding: '0 16px 12px 0', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Titre</th>
            <th style={{ padding: '0 16px 12px 16px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Auteur</th>
            <th style={{ padding: '0 16px 12px 16px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
            <th style={{ padding: '0 16px 12px 16px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Statut</th>
            <th style={{ padding: '0 0 12px 16px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Catégorie</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row: any, idx: number) => {
            const isLast = idx === rows.length - 1;
            const isPublished = row.statut?.toLowerCase() === 'publié' || row.statut?.toLowerCase() === 'published';
            
            return (
              <tr 
                key={row.id || idx} 
                style={{ 
                  borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.03)',
                  transition: 'background 0.2s',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '16px 16px 16px 0', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {row.titre}
                </td>
                <td style={{ padding: '16px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {row.auteur || '-'}
                </td>
                <td style={{ padding: '16px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {row.date_publication ? new Date(row.date_publication).toLocaleDateString() : '-'}
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    background: isPublished ? 'rgba(34,197,94,0.15)' : 'rgba(148,163,184,0.15)',
                    color: isPublished ? '#22c55e' : '#94a3b8',
                    textTransform: 'capitalize'
                  }}>
                    {row.statut || 'Brouillon'}
                  </span>
                </td>
                <td style={{ padding: '16px 0 16px 16px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {row.categorie || '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}