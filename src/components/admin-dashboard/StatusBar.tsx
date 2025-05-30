const STATUS = [
  { label: 'On Going', value: 12, color: '#4f8cff' },
  { label: 'On Hold', value: 7, color: '#ff184e' },
  { label: 'Finished', value: 18, color: '#22c55e' },
];

export default function StatusBar({ status = STATUS, total = 37 }) {
  const totalValue = total || status.reduce((s, v) => s + v.value, 0);
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 mb-8">
      <h2 className="text-lg font-bold mb-4 text-[#232b46]">Tasks Status</h2>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-3xl font-bold text-[#232b46]">{totalValue}</span>
        <span className="text-gray-400 ml-2">Tâches ce mois</span>
      </div>
      <div className="flex w-full h-4 rounded-full overflow-hidden mb-4 shadow-inner">
        {status.map((s, idx) => (
          <div
            key={s.label}
            style={{ width: `${(s.value / totalValue) * 100}%`, background: s.color }}
            className="h-full transition-all"
          />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {status.map((s, idx) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: s.color }}></span>
            <span className="text-sm font-medium text-[#232b46]">{s.label}</span>
            <span className="ml-auto text-xs font-bold text-gray-500">+{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 