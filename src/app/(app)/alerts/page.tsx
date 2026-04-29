import { ALERTS } from "@/lib/mock-data";
import { dbListAlerts } from "@/lib/aws/contracts";
import { getSession } from "@/lib/auth/session";
import { AlertsManager } from "@/components/domain/AlertsManager";

async function getAlerts(workspace: string) {
  try {
    const alerts = await dbListAlerts(workspace);
    return alerts;
  } catch {
    return ALERTS;
  }
}

export default async function AlertsPage() {
  const session = await getSession();
  const alerts = await getAlerts(session?.workspace ?? "");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--fg-primary)] tracking-tight">
          Alerts
        </h1>
        <p className="text-sm text-[var(--fg-muted)] mt-1">
          Deadline alerts for all active contracts — sent 7 days, 1 day, and when overdue.
        </p>
      </div>

      <AlertsManager initialAlerts={alerts} />
    </div>
  );
}
