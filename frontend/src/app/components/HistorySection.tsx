import { EntryFrequencyChart } from './analytics/EntryFrequencyChart';
import { DetectionHistoryTable } from './tables/DetectionHistoryTable';

export function HistorySection() {
  return (
    <div className="space-y-6">
      {/* Entry frequency chart */}
      <EntryFrequencyChart />

      {/* Detection history table */}
      <DetectionHistoryTable />
    </div>
  );
}
