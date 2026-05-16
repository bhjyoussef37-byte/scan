interface DurationRow {
  label: string;
  pct: number;
  fill: string;
}

const rows: DurationRow[] = [
  { label: 'Moins de 30 min', pct: 22, fill: 'rgba(59,130,246,0.6)' },
  { label: '30 min – 1h',     pct: 35, fill: '#3B82F6' },
  { label: '1h – 2h',         pct: 28, fill: 'rgba(59,130,246,0.6)' },
  { label: '2h – 4h',         pct: 10, fill: 'rgba(30,58,110,0.8)' },
  { label: 'Plus de 4h',      pct:  5, fill: 'rgba(30,58,110,0.6)' },
];

export function ParkingDurationChart() {
  return (
    <div
      className="rounded-xl p-5 flex flex-col"
      style={{ backgroundColor: '#0F2044', border: '1px solid #1E3A6E' }}
    >
      {/* Header */}
      <span
        style={{
          fontSize: '11px',
          color: '#475569',
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          marginBottom: '20px',
        }}
      >
        Durée moyenne de stationnement
      </span>

      {/* Bars */}
      <div className="flex flex-col" style={{ gap: '14px' }}>
        {rows.map((row, i) => (
          <div key={i}>
            {/* Row header */}
            <div className="flex items-center justify-between mb-1.5">
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>{row.label}</span>
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#60A5FA' }}>
                {row.pct}%
              </span>
            </div>

            {/* Track + fill */}
            <div
              className="w-full overflow-hidden"
              style={{
                height: '10px',
                borderRadius: '5px',
                backgroundColor: '#1E3A6E',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${row.pct}%`,
                  borderRadius: '5px',
                  backgroundColor: row.fill,
                  transition: 'width 0.8s ease',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
