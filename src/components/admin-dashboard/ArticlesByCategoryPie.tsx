import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { useArticlesByCategory } from './useArticlesByCategory';

const COLORS = ['#4f8cff', '#ff184e', '#f59e0b', '#22c55e', '#a855f7', '#06b6d4', '#f472b6', '#facc15'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15,17,30,0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 10,
        padding: '10px 16px',
        fontFamily: 'var(--font)',
        fontSize: '0.85rem',
      }}>
        <div style={{ color: '#94a3b8', marginBottom: 4 }}>{payload[0].name}</div>
        <div style={{ color: payload[0].fill, fontWeight: 700 }}>{payload[0].value} articles</div>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: 12 }}>
    {payload?.map((entry: any, idx: number) => (
      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color, display: 'inline-block', flexShrink: 0 }} />
        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'var(--font)' }}>{entry.value}</span>
      </div>
    ))}
  </div>
);

export default function ArticlesByCategoryPie() {
  const { data, loading } = useArticlesByCategory();

  return (
    <div className="dark-card" style={{ marginBottom: 0 }}>
      <h2>Articles par catégorie</h2>
      {loading ? (
        <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font)' }}>Chargement…</div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={78}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}