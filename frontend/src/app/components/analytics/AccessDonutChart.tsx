import { PieChart, Pie, Cell, Tooltip, Label } from 'recharts';

const segments = [
  { name: 'Autorisés',   value: 74, count: 312, color: '#10B981' },
  { name: 'Refusés',     value: 18, count:  76, color: '#EF4444' },
  { name: 'Blacklistés', value:  8, count:  34, color: '#F59E0B' },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        backgroundColor: '#0F2044',
        border: '1px solid #1E3A6E',
        borderRadius: '12px',
        padding: '8px 14px',
        fontSize: '12px',
        color: '#E2E8F0',
        fontFamily: 'IBM Plex Sans, sans-serif',
      }}
    >
      <p style={{ color: '#94A3B8', marginBottom: '3px', fontSize: '11px' }}>{d.name}</p>
      <p>
        <span style={{ color: '#E2E8F0', fontWeight: 500 }}>{d.value}%</span>
        {' · '}
        <span style={{ color: '#94A3B8' }}>{d.count} véhicules</span>
      </p>
    </div>
  );
};

const CenterLabel = ({ viewBox }: any) => {
  const { cx, cy } = viewBox ?? {};
  return (
    <g>
      <text
        x={cx}
        y={(cy ?? 0) - 7}
        textAnchor="middle"
        fill="#34D399"
        fontSize={26}
        fontWeight={500}
        fontFamily="IBM Plex Sans, sans-serif"
      >
        74%
      </text>
      <text
        x={cx}
        y={(cy ?? 0) + 13}
        textAnchor="middle"
        fill="#475569"
        fontSize={11}
        fontFamily="IBM Plex Sans, sans-serif"
      >
        autorisés
      </text>
    </g>
  );
};

export function AccessDonutChart() {
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
        Taux d'autorisation d'accès
      </span>

      {/* Chart + Legend */}
      <div className="flex items-center gap-6">
        {/* Donut */}
        <div style={{ flexShrink: 0 }}>
          <PieChart width={180} height={180}>
            <Pie
              data={segments}
              cx={90}
              cy={90}
              innerRadius={52}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              isAnimationActive={true}
              animationBegin={0}
              animationDuration={1200}
              animationEasing="ease-out"
              startAngle={90}
              endAngle={-270}
            >
              {segments.map((seg, i) => (
                <Cell key={i} fill={seg.color} />
              ))}
              <Label content={<CenterLabel />} position="center" />
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-4 flex-1 min-w-0">
          {segments.map((seg, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div
                  className="rounded-full flex-shrink-0"
                  style={{ width: '10px', height: '10px', backgroundColor: seg.color }}
                />
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>{seg.name}</span>
              </div>
              <div style={{ paddingLeft: '18px' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#E2E8F0' }}>
                  {seg.value}% · {seg.count} véhicules
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
