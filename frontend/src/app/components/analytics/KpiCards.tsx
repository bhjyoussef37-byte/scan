import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface KpiCardData {
  value: string;
  label: string;
  trend: string;
  trendDir: 'up' | 'down' | 'neutral';
  valueColor: string;
  trendColor: string;
}

const cards: KpiCardData[] = [
  {
    value: '147',
    label: 'entrées aujourd\'hui',
    trend: '+12% vs hier',
    trendDir: 'up',
    valueColor: '#60A5FA',
    trendColor: '#34D399',
  },
  {
    value: '74%',
    label: 'véhicules autorisés',
    trend: '-3% vs hier',
    trendDir: 'down',
    valueColor: '#34D399',
    trendColor: '#F87171',
  },
  {
    value: '18h00',
    label: 'heure la plus chargée',
    trend: '38 véhicules',
    trendDir: 'neutral',
    valueColor: '#FBBF24',
    trendColor: '#94A3B8',
  },
  {
    value: '47 min',
    label: 'durée de stationnement',
    trend: '+5 min vs hier',
    trendDir: 'up',
    valueColor: '#E2E8F0',
    trendColor: '#F87171',
  },
];

export function KpiCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          whileHover={{ scale: 1.05, translateY: -5 }}
          className="rounded-xl p-6 section-card cursor-default"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontSize: '28px',
              fontWeight: 600,
              color: card.valueColor,
              fontFamily: 'IBM Plex Sans, sans-serif',
              lineHeight: 1.1,
              marginBottom: '6px',
            }}
          >
            {card.value}
          </motion.div>
          <div
            style={{
              fontSize: '11px',
              color: '#475569',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '10px',
            }}
          >
            {card.label}
          </div>
          <div className="flex items-center gap-1">
            {card.trendDir === 'up' && (
              <TrendingUp style={{ width: '11px', height: '11px', color: card.trendColor }} />
            )}
            {card.trendDir === 'down' && (
              <TrendingDown style={{ width: '11px', height: '11px', color: card.trendColor }} />
            )}
            {card.trendDir === 'neutral' && (
              <Minus style={{ width: '11px', height: '11px', color: card.trendColor }} />
            )}
            <span style={{ fontSize: '11px', color: card.trendColor }}>
              {card.trend}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
