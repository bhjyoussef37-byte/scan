import { AuthorizedVehiclesTable } from './AuthorizedVehiclesTable';
import { DetectionHistoryTable } from './DetectionHistoryTable';

export function TablesSection() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 p-6">
      <AuthorizedVehiclesTable />
      <DetectionHistoryTable />
    </div>
  );
}
