import { Link } from 'react-router-dom';
import { useAdminContext } from '@/hooks/use-admin-context';
import type { DashboardArticleRow } from './useRecentArticles';

function isPublishedStatut(statut?: string | null): boolean {
  const s = String(statut ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  return s === 'publie' || s === 'published' || s === 'public';
}

export default function ModernTable({ rows }: { rows: DashboardArticleRow[] }) {
  const { getArticleEditPath, getArticlesPath } = useAdminContext();

  if (!rows || rows.length === 0) {
    return (
      <div className="dark-card" style={{ padding: '24px', marginBottom: 0 }}>
        <h2 style={{ marginTop: 0, marginBottom: 12 }}>Articles</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 16 }}>
          Aucun article pour le moment.
        </p>
        <Link
          to={getArticlesPath()}
          style={{
            color: 'var(--accent)',
            fontWeight: 600,
            fontSize: '0.875rem',
            textDecoration: 'none',
          }}
        >
          Gérer les articles
        </Link>
      </div>
    );
  }

  return (
    <div className="dark-card" style={{ padding: '24px', overflowX: 'auto', marginBottom: 0 }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <h2 style={{ margin: 0 }}>Articles</h2>
        <Link
          to={getArticlesPath()}
          style={{
            color: 'var(--accent)',
            fontWeight: 600,
            fontSize: '0.8125rem',
            textDecoration: 'none',
          }}
        >
          Voir tout
        </Link>
      </div>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontFamily: 'var(--font)',
        }}
      >
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th
              style={{
                padding: '0 16px 12px 0',
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Titre
            </th>
            <th
              style={{
                padding: '0 16px 12px 16px',
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Auteur
            </th>
            <th
              style={{
                padding: '0 16px 12px 16px',
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Date
            </th>
            <th
              style={{
                padding: '0 16px 12px 16px',
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Statut
            </th>
            <th
              style={{
                padding: '0 0 12px 16px',
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Catégorie
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const isLast = idx === rows.length - 1;
            const published = isPublishedStatut(row.statut);
            const dateRaw = row.date_publication || row.created_at;
            const dateLabel = dateRaw ? new Date(dateRaw).toLocaleDateString() : '-';

            return (
              <tr
                key={row.id || idx}
                style={{
                  borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.03)',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <td style={{ padding: '16px 16px 16px 0', fontSize: '0.875rem', fontWeight: 500 }}>
                  <Link
                    to={getArticleEditPath(row.id)}
                    style={{
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--accent)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                  >
                    {row.titre}
                  </Link>
                </td>
                <td style={{ padding: '16px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {row.auteur || '-'}
                </td>
                <td style={{ padding: '16px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {dateLabel}
                </td>
                <td style={{ padding: '16px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      background: published ? 'rgba(34,197,94,0.15)' : 'rgba(148,163,184,0.15)',
                      color: published ? '#22c55e' : '#94a3b8',
                      textTransform: 'capitalize',
                    }}
                  >
                    {published ? 'Publié' : 'Brouillon'}
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
