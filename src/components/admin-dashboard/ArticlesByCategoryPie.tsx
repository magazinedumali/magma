import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { useArticlesByCategory } from './useArticlesByCategory';

const COLORS = ['#4f8cff', '#ff184e', '#ffc107', '#22c55e', '#a855f7', '#f59e42', '#6ee7b7', '#818cf8', '#f472b6', '#facc15'];

export default function ArticlesByCategoryPie() {
  const { data, loading } = useArticlesByCategory();

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 mb-8">
      <h2 className="text-lg font-bold mb-4 text-[#232b46]">Articles par catégorie</h2>
      {loading ? (
        <div className="text-gray-400">Chargement…</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={70}
              fill="#8884d8"
              label
            >
              {data.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
} 