import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

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

export default function DashboardAreaChart({ data = sampleData, title = 'Évolution des articles publiés' }) {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 mb-8">
      <h2 className="text-lg font-bold mb-4 text-[#232b46]">{title}</h2>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ left: -20, right: 10 }}>
          <defs>
            <linearGradient id="colorArt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f8cff" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#4f8cff" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="month" className="text-xs" />
          <YAxis allowDecimals={false} className="text-xs" />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Area type="monotone" dataKey="count" stroke="#4f8cff" fillOpacity={1} fill="url(#colorArt)" />
          <Legend />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
} 