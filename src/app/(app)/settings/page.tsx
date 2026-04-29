import { getSession } from "@/lib/auth/session";
import { SettingsTabs } from "@/components/domain/SettingsTabs";

export default async function SettingsPage() {
  const session = await getSession();
  const user = {
    name:  session?.name  ?? "User",
    email: session?.email ?? "",
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--fg-primary)] tracking-tight">Settings</h1>
        <p className="text-sm text-[var(--fg-muted)] mt-1">
          Manage your profile, notifications, and billing.
        </p>
      </div>
      <SettingsTabs user={user} />
    </div>
  );
}
