import { TEAM_MEMBERS } from "@/lib/mock-data";
import { TeamTable } from "@/components/domain/TeamTable";

export default function TeamPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          Team
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage team members and their access levels.
        </p>
      </div>

      {/* Plan note */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-950/20 border border-indigo-800/25">
        <span className="text-indigo-400 mt-0.5 shrink-0">◈</span>
        <div>
          <p className="text-sm font-medium text-slate-200">Pro Plan · 14-day trial</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Your plan includes unlimited team members.{" "}
            <a href="/settings" className="text-indigo-400 hover:underline">
              Manage billing →
            </a>
          </p>
        </div>
      </div>

      <TeamTable members={TEAM_MEMBERS} />
    </div>
  );
}
