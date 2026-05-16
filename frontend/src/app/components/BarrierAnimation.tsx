import { useEffect, useState } from 'react';

type BarrierState = 'closed' | 'opening' | 'open' | 'closing';

interface BarrierAnimationProps {
  state: BarrierState;
  onStateChange?: (state: BarrierState) => void;
}

export function BarrierAnimation({ state, onStateChange }: BarrierAnimationProps) {
  const [currentState, setCurrentState] = useState<BarrierState>(state);

  useEffect(() => {
    setCurrentState(state);
  }, [state]);

  const getConfig = () => {
    switch (currentState) {
      case 'closed':
        return {
          rotation: 0,
          armColor: '#EF4444',
          stripeColor: 'rgba(0,0,0,0.28)',
          tipColor: '#EF4444',
          label: 'Barrière fermée',
          labelColor: '#F87171',
          pillBg: 'rgba(239,68,68,0.10)',
          pillBorder: 'rgba(239,68,68,0.25)',
          pillText: '#F87171',
          glow: false,
        };
      case 'opening':
        return {
          rotation: -45,
          armColor: '#FBBF24',
          stripeColor: 'rgba(0,0,0,0.28)',
          tipColor: '#FBBF24',
          label: 'Ouverture en cours...',
          labelColor: '#FBBF24',
          pillBg: 'rgba(251,191,36,0.10)',
          pillBorder: 'rgba(251,191,36,0.25)',
          pillText: '#FBBF24',
          glow: false,
        };
      case 'open':
        return {
          rotation: -90,
          armColor: '#10B981',
          stripeColor: 'rgba(0,0,0,0.20)',
          tipColor: '#10B981',
          label: 'Barrière ouverte',
          labelColor: '#34D399',
          pillBg: 'rgba(16,185,129,0.10)',
          pillBorder: 'rgba(16,185,129,0.25)',
          pillText: '#34D399',
          glow: true,
        };
      case 'closing':
        return {
          rotation: -30,
          armColor: '#FBBF24',
          stripeColor: 'rgba(0,0,0,0.28)',
          tipColor: '#FBBF24',
          label: 'Fermeture en cours...',
          labelColor: '#F87171',
          pillBg: 'rgba(239,68,68,0.10)',
          pillBorder: 'rgba(239,68,68,0.25)',
          pillText: '#F87171',
          glow: false,
        };
    }
  };

  const cfg = getConfig();

  // Layout constants — everything fits inside 160 × 150 viewBox
  // Pivot: (32, 98)  Arm length: 108px  → tip at (140, 98) when closed
  // When open (−90°): tip at (32, 98−108) = (32, −10) → clipped at y=0 by overflow:hidden
  // So arm length should be ≤ 98 to stay in view: we use 92px → tip at (32, 6) ✓
  const PX = 32;   // pivot x
  const PY = 98;   // pivot y
  const ARM = 92;  // arm length → tip at (PX + ARM, PY) = (124, 98) closed ✓
                   //             → tip at (PX, PY - ARM) = (32,  6) open  ✓

  return (
    <div
      className="rounded-lg p-5"
      style={{ backgroundColor: '#0F2044', border: '1px solid #1E3A6E' }}
    >
      {/* Section label */}
      <div
        className="mb-5"
        style={{
          color: '#475569',
          fontSize: '11px',
          fontWeight: 400,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
        }}
      >
        STATUT BARRIÈRE
      </div>

      {/* Icon container — fixed size, overflow hidden to clip any edge case */}
      <div
        className="flex items-center justify-center rounded-lg"
        style={{ backgroundColor: '#060D1A', height: '200px', overflow: 'hidden' }}
      >
        <svg
          width="160"
          height="150"
          viewBox="0 0 160 150"
          style={{ overflow: 'hidden', display: 'block' }}
        >
          <defs>
            {/* Diagonal stripe pattern recolored per state */}
            <pattern
              id="barrierStripes"
              patternUnits="userSpaceOnUse"
              width="14"
              height="14"
              patternTransform="rotate(45)"
            >
              <rect width="14" height="14" fill={cfg.armColor} />
              <rect width="7" height="14" fill={cfg.stripeColor} />
            </pattern>

            {/* Glow filter for open state */}
            <filter id="tipGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── Ground ── */}
          <rect x="0" y="136" width="160" height="4" rx="2" fill="#0D1B2E" />

          {/* Road dash markings (start after the post) */}
          <line
            x1="55"
            y1="138"
            x2="160"
            y2="138"
            stroke="#FBBF24"
            strokeWidth="1.5"
            strokeDasharray="14 14"
            opacity="0.45"
          />

          {/* ── Post ── */}
          {/* Body */}
          <rect x={PX - 12} y={PY} width="24" height="40" rx="3" fill="#1A3560" />
          {/* Highlight stripe */}
          <rect x={PX - 4} y={PY + 4} width="4" height="32" rx="1" fill="rgba(255,255,255,0.07)" />
          {/* Cap */}
          <rect x={PX - 14} y={PY - 6} width="28" height="9" rx="3" fill="#1E3A6E" />

          {/* ── Pivot bolt ── */}
          <circle cx={PX} cy={PY} r="5.5" fill="#0F2044" stroke="#2D5099" strokeWidth="1.5" />
          <circle cx={PX} cy={PY} r="2" fill="#2D5099" />

          {/* ── Barrier arm — rotates around pivot ── */}
          <g
            style={{
              transform: `rotate(${cfg.rotation}deg)`,
              transformOrigin: `${PX}px ${PY}px`,
              transformBox: 'view-box',
              transition: 'transform 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          >
            {/* Arm body */}
            <rect
              x={PX}
              y={PY - 5}
              width={ARM}
              height="10"
              rx="3"
              fill="url(#barrierStripes)"
              style={{ transition: 'fill 0.4s ease' }}
            />

            {/* Arm root reinforcement */}
            <rect
              x={PX}
              y={PY - 6}
              width="14"
              height="12"
              rx="2"
              fill={cfg.armColor}
              opacity="0.6"
              style={{ transition: 'fill 0.4s ease' }}
            />

            {/* Tip cap */}
            <rect
              x={PX + ARM - 4}
              y={PY - 5}
              width="8"
              height="10"
              rx="2"
              fill={cfg.tipColor}
              style={{ transition: 'fill 0.4s ease' }}
            />

            {/* Tip dot */}
            <circle
              cx={PX + ARM + 4}
              cy={PY}
              r="5"
              fill={cfg.tipColor}
              filter={cfg.glow ? 'url(#tipGlow)' : undefined}
              style={{ transition: 'fill 0.4s ease' }}
            />

            {/* Tip pulse ring when open */}
            {cfg.glow && (
              <circle
                cx={PX + ARM + 4}
                cy={PY}
                r="9"
                fill="none"
                stroke="rgba(16,185,129,0.45)"
                strokeWidth="1.5"
                className="barrier-tip-pulse"
              />
            )}
          </g>

          {/* ── Pivot drawn on top of arm root ── */}
          <circle cx={PX} cy={PY} r="5.5" fill="#0F2044" stroke="#2D5099" strokeWidth="1.5" />
          <circle cx={PX} cy={PY} r="2" fill="#4A72B0" />
        </svg>

        <style>{`
          @keyframes barrier-tip-ring {
            0%   { r: 9;  opacity: 0.7; }
            100% { r: 15; opacity: 0; }
          }
          .barrier-tip-pulse {
            animation: barrier-tip-ring 1.4s ease-out infinite;
          }
        `}</style>
      </div>

      {/* Status label */}
      <div
        className="text-center mt-4"
        style={{ color: cfg.labelColor, fontSize: '12px', fontWeight: 500 }}
      >
        {cfg.label}
      </div>

      {/* Status pill */}
      <div className="flex justify-center mt-3">
        <div
          className="px-4 py-1.5 rounded-full"
          style={{
            backgroundColor: cfg.pillBg,
            border: `1px solid ${cfg.pillBorder}`,
            color: cfg.pillText,
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.04em',
          }}
        >
          {cfg.label.toUpperCase()}
        </div>
      </div>
    </div>
  );
}
