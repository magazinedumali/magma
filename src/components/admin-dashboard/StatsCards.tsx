import { FaNewspaper, FaComment, FaUser, FaChartLine } from 'react-icons/fa';
import { useArticlesCount } from './useArticlesCount';
import { useCommentsCount } from './useCommentsCount';
import { useUsersCount } from './useUsersCount';
import { useActiveAuthorsCount } from './useActiveAuthorsCount';

const STATS_CONFIG = [
  {
    key: 'articles',
    label: 'Articles',
    Icon: FaNewspaper,
    iconColor: '#4f8cff',
    iconBg: 'rgba(79,140,255,0.15)',
    iconShadow: 'rgba(79,140,255,0.3)',
    variation: '+12%',
    up: true,
  },
  {
    key: 'comments',
    label: 'Commentaires',
    Icon: FaComment,
    iconColor: '#ff184e',
    iconBg: 'rgba(255,24,78,0.15)',
    iconShadow: 'rgba(255,24,78,0.3)',
    variation: '-3%',
    up: false,
  },
  {
    key: 'users',
    label: 'Utilisateurs',
    Icon: FaUser,
    iconColor: '#22c55e',
    iconBg: 'rgba(34,197,94,0.15)',
    iconShadow: 'rgba(34,197,94,0.3)',
    variation: '+5%',
    up: true,
  },
  {
    key: 'authors',
    label: 'Auteurs actifs',
    Icon: FaChartLine,
    iconColor: '#f59e0b',
    iconBg: 'rgba(245,158,11,0.15)',
    iconShadow: 'rgba(245,158,11,0.3)',
    variation: '+1%',
    up: true,
  },
];

export default function StatsCards() {
  const { count: articlesCount, loading: loadingArticles } = useArticlesCount();
  const { count: commentsCount, loading: loadingComments } = useCommentsCount();
  const { count: usersCount, loading: loadingUsers } = useUsersCount();
  const { count: authorsCount, loading: loadingAuthors } = useActiveAuthorsCount();

  const values: Record<string, any> = {
    articles: loadingArticles ? '...' : articlesCount,
    comments: loadingComments ? '...' : commentsCount,
    users: loadingUsers ? '...' : usersCount,
    authors: loadingAuthors ? '...' : authorsCount,
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
      {STATS_CONFIG.map((s) => (
        <div
          key={s.key}
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: '20px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            transition: 'background 0.2s, transform 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
        >
          {/* Icon */}
          <div style={{
            width: 46, height: 46, borderRadius: '50%',
            background: s.iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 16px ${s.iconShadow}`,
            flexShrink: 0,
          }}>
            <s.Icon size={20} color={s.iconColor} />
          </div>

          {/* Text */}
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 4, whiteSpace: 'nowrap' }}>
              {s.label}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#e2e8f0', lineHeight: 1, marginBottom: 6 }}>
              {values[s.key]}
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '2px 8px',
              borderRadius: 20,
              fontSize: '0.7rem',
              fontWeight: 700,
              background: s.up ? 'rgba(34,197,94,0.15)' : 'rgba(255,24,78,0.15)',
              color: s.up ? '#22c55e' : '#ff184e',
            }}>
              {s.variation}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}