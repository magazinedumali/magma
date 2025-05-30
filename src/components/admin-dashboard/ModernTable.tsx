export default function ModernTable({ rows }) {
  if (!rows) return null;
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 mb-8 overflow-x-auto">
      <h2 className="text-lg font-bold mb-4 text-[#232b46]">Derniers articles publiés</h2>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500">
            <th className="py-2 px-3">Titre</th>
            <th className="py-2 px-3">Auteur</th>
            <th className="py-2 px-3">Date</th>
            <th className="py-2 px-3">Statut</th>
            <th className="py-2 px-3">Catégorie</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id || idx} className="border-b last:border-none hover:bg-gray-50 transition">
              <td className="py-2 px-3 font-medium text-[#232b46]">{row.titre}</td>
              <td className="py-2 px-3">{row.auteur || '-'}</td>
              <td className="py-2 px-3">{row.date_publication ? new Date(row.date_publication).toLocaleDateString() : '-'}</td>
              <td className="py-2 px-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">{row.statut || 'Brouillon'}</span>
              </td>
              <td className="py-2 px-3">{row.categorie || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 