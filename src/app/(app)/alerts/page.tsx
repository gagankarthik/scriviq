import { ALERTS } from "@/lib/mock-data";
import { AlertsManager } from "@/components/domain/AlertsManager";

export default function AlertsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          Alerts
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Deadline alerts for all active contracts. Sent 7 days, 1 day, and
          when overdue.
        </p>
      </div>

      <AlertsManager initialAlerts={ALERTS} />
    </div>
  );
}
