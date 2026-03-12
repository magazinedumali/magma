export default function LocationUsersStatusBar({ locations = [], total }: any) {
  const totalValue = total || locations.reduce((s: number, v: any) => s + v.value, 0);

  return (
    <div className="dark-card" style={{ marginBottom: 0 }}>
      <h2>Utilisateurs par localisation</h2>
      
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 20 }}>
        <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
          {totalValue}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, paddingBottom: 4 }}>
          Utilisateurs
        </span>
      </div>

      <div style={{ 
        display: 'flex', 
        width: '100%', 
        height: 8, 
        borderRadius: 4, 
        overflow: 'hidden', 
        marginBottom: 20,
        background: 'rgba(255,255,255,0.05)'
      }}>
        {locations.map((loc: any) => (
          <div
            key={loc.label}
            style={{ 
              width: `${(loc.value / totalValue) * 100}%`, 
              background: loc.color 
            }}
          />
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 20px' }}>
        {locations.map((loc: any) => (
          <div key={loc.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ 
              width: 10, 
              height: 10, 
              borderRadius: '50%', 
              background: loc.color,
              boxShadow: `0 0 8px ${loc.color}80`
            }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {loc.label}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {loc.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}