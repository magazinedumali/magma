import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const sampleData = [
  { month: 'Jan', count: 120 },
  { month: 'Fév', count: 200 },
  { month: 'Mar', count: 300 },
  { month: 'Avr', count: 400 },
  { month: 'Mai', count: 350 },
  { month: 'Juin', count: 500 },
  { month: 'Juil', count: 600 },
  { month: 'Août', count: 700 },
  { month: 'Sep', count: 800 },
  { month: 'Oct', count: 900 },
  { month: 'Nov', count: 950 },
  { month: 'Déc', count: 1000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
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
        <div style={{ color: '#94a3b8', marginBottom: 4 }}>{label}</div>
        <div style={{ color: '#4f8cff', fontWeight: 700 }}>{payload[0].value} articles</div>
      </div>
    );
  }
  return null;
};

export default function DashboardAreaChart({ data = sampleData, title = 'Évolution des articles publiés' }) {
  return (
    <div className="dark-card" style={{ marginBottom: 0 }}>
      <h2>{title}</h2>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ left: -20, right: 10, top: 4 }}>
          <defs>
            <linearGradient id="colorArt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f8cff" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#4f8cff" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
            tick={{ fill: '#4e5d78', fontSize: 11, fontFamily: 'Inter' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: '#4e5d78', fontSize: 11, fontFamily: 'Inter' }}
            axisLine={false}
            tickLine={false}
          />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#4f8cff"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorArt)"
            dot={false}
            activeDot={{ r: 5, fill: '#4f8cff', stroke: '#0d1021', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}