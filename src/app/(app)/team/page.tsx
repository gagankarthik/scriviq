import { Users, Shield } from "lucide-react";
import Link from "next/link";
import { TEAM_MEMBERS } from "@/lib/mock-data";
import { TeamTable } from "@/components/domain/TeamTable";

export default function TeamPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--fg-primary)] tracking-tight">Team</h1>
        <p className="text-sm text-[var(--fg-muted)] mt-1">
          Manage team members and their access levels.
        </p>
      </div>

      {/* Plan badge */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-[rgba(0,114,229,0.04)] dark:bg-[rgba(0,114,229,0.08)] border border-[rgba(0,114,229,0.2)] dark:border-[rgba(0,114,229,0.2)]">
        <Shield size={16} className="text-[#0072E5] dark:text-[#75D8FC] mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-[var(--fg-primary)]">Pro Plan Â· 14-day trial</p>
          <p className="text-xs text-[var(--fg-muted)] mt-0.5">
            Your plan includes unlimited team members.{" "}
            <Link href="/settings" className="text-[#0072E5] dark:text-[#75D8FC] hover:underline">
              Manage billing â†’
            </Link>
          </p>
        </div>
      </div>

      <TeamTable members={TEAM_MEMBERS} />
    </div>
  );
}

