export default function LocationUsersStatusBar({ locations = [], total }) {
  const totalValue = total || locations.reduce((s, v) => s + v.value, 0);
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 mb-8">
      <h2 className="text-lg font-bold mb-4 text-[#232b46]">Utilisateurs par localisation</h2>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-3xl font-bold text-[#232b46]">{totalValue}</span>
        <span className="text-gray-400 ml-2">Utilisateurs</span>
      </div>
      <div className="flex h-4 w-full rounded-full overflow-hidden mb-4">
        {locations.map((loc, i) => (
          <div
            key={loc.label}
            style={{ width: `${(loc.value / totalValue) * 100}%`, background: loc.color }}
            className="h-full"
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {locations.map((loc, i) => (
          <div key={loc.label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: loc.color }} />
            <span className="text-sm text-gray-600">{loc.label}</span>
            <span className="text-xs text-gray-400 ml-1">+{loc.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 