import { useState } from 'react';

const DAYS  = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const HOURS = ['06h','07h','08h','09h','10h','11h','12h','13h','14h','15h','16h','17h','18h','19h','20h','21h','22h'];

/* Pre-built realistic data: rows = days (0=Mon…6=Sun), cols = hours (0=06h…16=22h) */
const heatData: number[][] = [
  // Lun
  [ 4,  8, 25, 18, 15, 19, 27, 16, 13, 15, 18, 28, 33, 19,  8,  5,  3],
  // Mar
  [ 3,  7, 22, 17, 16, 20, 25, 15, 14, 16, 19, 29, 35, 20,  9,  4,  2],
  // Mer  (hot: 17h = index 11 → 34)
  [ 5,  9, 24, 19, 16, 22, 28, 17, 15, 17, 21, 34, 32, 21, 10,  6,  3],
  // Jeu  (hot: 18h = index 12 → 36)
  [ 4,  8, 26, 20, 17, 21, 29, 18, 15, 18, 22, 30, 36, 22, 11,  5,  3],
  // Ven  (hottest: 18h = index 12 → 38)
  [ 5, 10, 27, 21, 18, 23, 31, 19, 16, 19, 24, 32, 38, 23, 12,  7,  4],
  // Sam  (weekend — cooler)
  [ 2,  3,  8, 12, 14, 10, 15, 12, 10,  8,  6,  5,  4,  6,  5,  3,  2],
  // Dim  (weekend — coolest)
  [ 1,  2,  5,  9, 11,  8, 12, 10,  8,  6,  5,  4,  3,  4,  3,  2,  1],
];

const isHottest = (d: number, h: number) =>
  (d === 4 && h === 12) || // Ven 18h
  (d === 3 && h === 12) || // Jeu 18h
  (d === 2 && h === 11);   // Mer 17h

const getCellStyle = (value: number, d: number, h: number) => {
  if (isHottest(d, h)) {
    return { backgroundColor: '#60A5FA', border: '1px solid #7DD3FC' };
  }
  if (value <= 5)  return { backgroundColor: '#0F2044',               border: '1px solid transparent' };
  if (value <= 12) return { backgroundColor: 'rgba(59,130,246,0.15)', border: '1px solid transparent' };
  if (value <= 20) return { backgroundColor: 'rgba(59,130,246,0.35)', border: '1px solid transparent' };
  if (value <= 30) return { backgroundColor: 'rgba(59,130,246,0.65)', border: '1px solid transparent' };
  return             { backgroundColor: '#3B82F6',                   border: '1px solid transparent' };
};

export function WeeklyHeatmap() {
  const [tooltip, setTooltip] = useState<{
    visible: boolean; text: string; x: number; y: number;
  }>({ visible: false, text: '', x: 0, y: 0 });

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
          Carte de chaleur hebdomadaire — occupation par heure
        </span>
        <span
          className="px-3 py-1 rounded-full"
          style={{
            backgroundColor: 'rgba(16,185,129,0.12)',
            color: '#34D399',
            fontSize: '11px',
          }}
        >
          7 derniers jours
        </span>
      </div>

      {/* Hour labels */}
      <div className="flex mb-1" style={{ paddingLeft: '36px', gap: '4px' }}>
        {HOURS.map((h) => (
          <div
            key={h}
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: '10px',
              color: '#334155',
              fontFamily: 'IBM Plex Sans, sans-serif',
            }}
          >
            {h}
          </div>
        ))}
      </div>

      {/* Grid rows */}
      <div className="relative" style={{ position: 'relative' }}>
        {DAYS.map((day, d) => (
          <div
            key={d}
            className="flex items-center"
            style={{
              gap: '4px',
              marginBottom: d < DAYS.length - 1 ? '4px' : '0',
              opacity: 0,
              animation: `heatRowIn 0.4s ease both`,
              animationDelay: `${d * 60}ms`,
            }}
          >
            {/* Day label */}
            <div
              style={{
                width: '32px',
                flexShrink: 0,
                fontSize: '11px',
                color: '#475569',
                textAlign: 'right',
                paddingRight: '6px',
                fontFamily: 'IBM Plex Sans, sans-serif',
              }}
            >
              {day}
            </div>

            {/* Cells */}
            {HOURS.map((_, h) => {
              const val = heatData[d][h];
              const cs = getCellStyle(val, d, h);
              return (
                <div
                  key={h}
                  style={{
                    flex: 1,
                    height: '28px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease',
                    ...cs,
                  }}
                  onMouseEnter={(e) => {
                    const rect = (e.target as HTMLElement).getBoundingClientRect();
                    setTooltip({
                      visible: true,
                      text: `${day} ${HOURS[h]} — ${val} véhicules`,
                      x: rect.left + rect.width / 2,
                      y: rect.top - 8,
                    });
                    (e.target as HTMLElement).style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    setTooltip((t) => ({ ...t, visible: false }));
                    (e.target as HTMLElement).style.transform = 'scale(1)';
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Color legend */}
      <div className="flex items-center gap-3 mt-5">
        <span style={{ fontSize: '11px', color: '#475569' }}>Faible</span>
        <div
          style={{
            flex: 1,
            height: '8px',
            borderRadius: '4px',
            background: 'linear-gradient(to right, #0F2044, rgba(59,130,246,0.15), rgba(59,130,246,0.35), rgba(59,130,246,0.65), #3B82F6, #60A5FA)',
          }}
        />
        <span style={{ fontSize: '11px', color: '#475569' }}>Élevé</span>
      </div>

      {/* Floating tooltip */}
      {tooltip.visible && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            backgroundColor: '#0F2044',
            border: '1px solid #1E3A6E',
            borderRadius: '12px',
            padding: '6px 12px',
            fontSize: '12px',
            color: '#E2E8F0',
            fontFamily: 'IBM Plex Sans, sans-serif',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 50,
          }}
        >
          {tooltip.text}
        </div>
      )}

      <style>{`
        @keyframes heatRowIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
