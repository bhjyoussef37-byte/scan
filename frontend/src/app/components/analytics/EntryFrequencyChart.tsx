import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { AlertTriangle } from 'lucide-react';

type BarType = 'offpeak' | 'normal' | 'peak' | 'highest';

interface HourData {
  hour: string;
  count: number;
  type: BarType;
}

const data: HourData[] = [
  { hour: '06h', count: 8,  type: 'offpeak' },
  { hour: '07h', count: 12, type: 'offpeak' },
  { hour: '08h', count: 28, type: 'peak' },
  { hour: '09h', count: 20, type: 'normal' },
  { hour: '10h', count: 17, type: 'normal' },
  { hour: '11h', count: 21, type: 'normal' },
  { hour: '12h', count: 30, type: 'peak' },
  { hour: '13h', count: 18, type: 'normal' },
  { hour: '14h', count: 15, type: 'normal' },
  { hour: '15h', count: 16, type: 'normal' },
  { hour: '16h', count: 20, type: 'normal' },
  { hour: '17h', count: 32, type: 'peak' },
  { hour: '18h', count: 38, type: 'highest' },
  { hour: '19h', count: 22, type: 'normal' },
  { hour: '20h', count: 10, type: 'offpeak' },
  { hour: '21h', count: 7,  type: 'offpeak' },
  { hour: '22h', count: 5,  type: 'offpeak' },
];

const getBarFill = (type: BarType) => {
  switch (type) {
    case 'offpeak': return 'rgba(30,58,110,0.8)';
    case 'normal':  return 'rgba(59,130,246,0.5)';
    case 'peak':    return '#3B82F6';
    case 'highest': return '#60A5FA';
  }
};

/* Custom bar shape: top-rounded corners only + amber accent for highest bar */
const RoundedBar = (props: any) => {
  const { x, y, width, height, fill } = props;
  const type: BarType = props.payload?.type;
  if (!height || height <= 0) return null;
  const r = Math.min(3, height / 2);

  return (
    <g>
      <path
        d={`M${x},${y + height} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + width - r},${y} Q${x + width},${y} ${x + width},${y + r} L${x + width},${y + height} Z`}
        fill={fill}
      />
      {type === 'highest' && height > 3 && (
        <rect x={x} y={y} width={width} height={3} rx={1.5} fill="#FBBF24" />
      )}
    </g>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
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
      <p style={{ color: '#475569', marginBottom: '3px', fontSize: '11px' }}>{label}</p>
      <p>
        <span style={{ color: '#60A5FA', fontWeight: 500, fontSize: '13px' }}>
          {payload[0].value}
        </span>{' '}
        véhicules
      </p>
    </div>
  );
};

export function EntryFrequencyChart() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div
      className="rounded-xl p-5"
      style={{ backgroundColor: '#0F2044', border: '1px solid #1E3A6E' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <span
          style={{
            fontSize: '11px',
            color: '#475569',
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
          }}
        >
          Fréquence d'entrées par heure
        </span>
        <span
          className="px-3 py-1 rounded-full"
          style={{
            backgroundColor: 'rgba(59,130,246,0.12)',
            color: '#60A5FA',
            fontSize: '11px',
            fontWeight: 400,
          }}
        >
          Aujourd'hui
        </span>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={data}
          barCategoryGap="20%"
          margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <CartesianGrid
            vertical={false}
            stroke="#1E3A6E"
            strokeWidth={1}
          />
          <XAxis
            dataKey="hour"
            tick={{ fill: '#475569', fontSize: 11, fontFamily: 'IBM Plex Sans, sans-serif' }}
            axisLine={{ stroke: '#1E3A6E' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 40]}
            ticks={[0, 10, 20, 30, 40]}
            tick={{ fill: '#475569', fontSize: 11, fontFamily: 'IBM Plex Sans, sans-serif' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          />
          <Bar
            dataKey="count"
            shape={<RoundedBar />}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-out"
            onMouseEnter={(_: any, index: number) => setActiveIndex(index)}
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={getBarFill(entry.type)}
                opacity={activeIndex !== null && activeIndex !== index ? 0.7 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Peak info row */}
      <div className="flex justify-end mt-3">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            backgroundColor: 'rgba(251,191,36,0.12)',
            border: '1px solid rgba(251,191,36,0.20)',
          }}
        >
          <AlertTriangle style={{ width: '11px', height: '11px', color: '#FBBF24' }} />
          <span style={{ color: '#FBBF24', fontSize: '11px' }}>
            Heure de pointe: 18h00 — 38 véhicules
          </span>
        </div>
      </div>
    </div>
  );
}
