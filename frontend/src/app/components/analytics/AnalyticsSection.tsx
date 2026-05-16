import { KpiCards } from './KpiCards';
import { AccessDonutChart } from './AccessDonutChart';
import { ParkingDurationChart } from './ParkingDurationChart';
import { WeeklyHeatmap } from './WeeklyHeatmap';

export function AnalyticsSection() {
  return (
    <div className="space-y-6">
      {/* Chart 5 — KPI cards row */}
      <KpiCards />

      {/* Charts 2+3 — Donut + Duration side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AccessDonutChart />
        <ParkingDurationChart />
      </div>

      {/* Chart 4 — Weekly heatmap */}
      <WeeklyHeatmap />
    </div>
  );
}
