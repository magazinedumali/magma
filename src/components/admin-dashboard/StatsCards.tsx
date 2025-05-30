import { FaNewspaper, FaComment, FaUser, FaChartLine } from 'react-icons/fa';
import { useArticlesCount } from './useArticlesCount';
import { useCommentsCount } from './useCommentsCount';
import { useUsersCount } from './useUsersCount';
import { useActiveAuthorsCount } from './useActiveAuthorsCount';

export default function StatsCards() {
  const { count: articlesCount, loading: loadingArticles } = useArticlesCount();
  const { count: commentsCount, loading: loadingComments } = useCommentsCount();
  const { count: usersCount, loading: loadingUsers } = useUsersCount();
  const { count: authorsCount, loading: loadingAuthors } = useActiveAuthorsCount();

  const stats = [
    {
      icon: <FaNewspaper size={28} color="#4f8cff" />, label: 'Articles', value: loadingArticles ? '...' : articlesCount, variation: '+12%', variationColor: 'green',
    },
    {
      icon: <FaComment size={28} color="#ff184e" />, label: 'Commentaires', value: loadingComments ? '...' : commentsCount, variation: '-3%', variationColor: 'red',
    },
    {
      icon: <FaUser size={28} color="#22c55e" />, label: 'Utilisateurs', value: loadingUsers ? '...' : usersCount, variation: '+5%', variationColor: 'green',
    },
    {
      icon: <FaChartLine size={28} color="#ffc107" />, label: 'Auteurs actifs', value: loadingAuthors ? '...' : authorsCount, variation: '+1%', variationColor: 'green',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      {stats.map((s, idx) => (
        <div
          key={idx}
          className="flex bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 items-center gap-4 min-w-[180px]"
        >
          <div className="rounded-full bg-[#f5f7fa] p-3 shadow flex items-center justify-center min-w-[48px] min-h-[48px]">
            {s.icon}
          </div>
          <div>
            <div className="text-gray-500 text-sm font-medium">{s.label}</div>
            <div className="text-2xl font-bold text-[#232b46]">{s.value}</div>
            <div className={`text-xs font-bold ${s.variationColor === 'green' ? 'text-green-500' : 'text-red-500'}`}>{s.variation}</div>
          </div>
        </div>
      ))}
    </div>
  );
} 