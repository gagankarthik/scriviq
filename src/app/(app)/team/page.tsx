import { Shield } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { type TeamMember } from "@/lib/mock-data";
import { TeamTable } from "@/components/domain/TeamTable";

export default async function TeamPage() {
  const session = await getSession();

  const members: TeamMember[] = session
    ? [
        {
          id:           session.userId ?? "me",
          name:         session.name,
          email:        session.email,
          role:         "owner",
          initials:     session.name
            .split(" ")
            .map((p: string) => p[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
          joinedAt:     new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
        },
      ]
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--fg-primary)] tracking-tight">Team</h1>
        <p className="text-sm text-[var(--fg-muted)] mt-1">
          Manage team members and their access levels.
        </p>
      </div>

      <div
        className="flex items-start gap-3 p-4 rounded-xl"
        style={{
          background: "rgba(0,114,229,0.04)",
          border: "1px solid rgba(0,114,229,0.2)",
        }}
      >
        <Shield size={16} className="text-[#0072E5] dark:text-[#75D8FC] mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-[var(--fg-primary)]">Pro Plan · 14-day trial</p>
          <p className="text-xs text-[var(--fg-muted)] mt-0.5">
            Your plan includes unlimited team members.{" "}
            <Link href="/settings" className="text-[#0072E5] dark:text-[#75D8FC] hover:underline">
              Manage billing →
            </Link>
          </p>
        </div>
      </div>

      <TeamTable members={members} />
    </div>
  );
}
