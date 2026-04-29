"use client";

import { useState } from "react";
import { UserPlus, Mail } from "lucide-react";
import { type TeamMember, type TeamRole } from "@/lib/mock-data";
import { relativeTime } from "@/lib/utils";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const ROLE_STYLES: Record<TeamRole, { bg: string; color: string; border: string }> = {
  owner:  { bg: "rgba(0,114,229,0.08)",     color: "#0072E5",  border: "rgba(0,114,229,0.25)"  },
  admin:  { bg: "rgba(245,158,11,0.08)",    color: "#d97706",  border: "rgba(245,158,11,0.25)" },
  member: { bg: "var(--surface-subtle)",    color: "var(--fg-secondary)", border: "var(--border-color)" },
};

interface TeamTableProps {
  members: TeamMember[];
}

export function TeamTable({ members }: TeamTableProps) {
  const [showInvite, setShowInvite] = useState(false);
  const [invite,     setInvite]     = useState({ email: "", role: "member" as TeamRole });
  const [inviting,   setInviting]   = useState(false);
  const [success,    setSuccess]    = useState(false);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    await new Promise((r) => setTimeout(r, 800));
    setInviting(false);
    setSuccess(true);
    setTimeout(() => {
      setShowInvite(false);
      setSuccess(false);
      setInvite({ email: "", role: "member" });
    }, 1500);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-[var(--fg-muted)]">
          {members.length} member{members.length !== 1 ? "s" : ""} in your workspace
        </p>
        <Button variant="primary" size="sm" glow onClick={() => setShowInvite(true)}>
          <UserPlus size={13} strokeWidth={2} />
          Invite member
        </Button>
      </div>

      {/* Invite form */}
      {showInvite && (
        <div
          className="rounded-2xl p-5"
          style={{
            background: "rgba(0,114,229,0.04)",
            border: "1px solid rgba(0,114,229,0.2)",
          }}
        >
          <h3 className="text-sm font-semibold text-[var(--fg-primary)] mb-4">
            Invite a team member
          </h3>
          {success ? (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
              <Mail size={16} />
              Invite sent successfully!
            </div>
          ) : (
            <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="colleague@company.com"
                  type="email"
                  value={invite.email}
                  onChange={(e) => setInvite((p) => ({ ...p, email: e.target.value }))}
                  required
                />
              </div>
              <div className="sm:w-36">
                <Select
                  value={invite.role}
                  onChange={(e) => setInvite((p) => ({ ...p, role: e.target.value as TeamRole }))}
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                </Select>
              </div>
              <Button type="submit" loading={inviting} glow>
                Send invite
              </Button>
              <Button variant="ghost" onClick={() => setShowInvite(false)}>
                Cancel
              </Button>
            </form>
          )}
        </div>
      )}

      {/* Table */}
      {members.length > 0 ? (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] overflow-hidden">
          <div className="hidden sm:grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-[var(--border-subtle)] text-[10px] uppercase tracking-wider font-semibold text-[var(--fg-muted)]">
            <span>Member</span>
            <span>Email</span>
            <span>Role</span>
            <span>Last active</span>
            <span />
          </div>

          <div className="divide-y divide-[var(--border-subtle)]">
            {members.map((member) => {
              const rs = ROLE_STYLES[member.role];
              return (
                <div
                  key={member.id}
                  className="flex flex-col sm:grid sm:grid-cols-[1fr_1fr_auto_auto_auto] sm:items-center gap-3 sm:gap-4 px-5 py-4 hover:bg-[var(--surface-subtle)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: "rgba(0,114,229,0.1)", color: "#0072E5", border: "1px solid rgba(0,114,229,0.2)" }}
                    >
                      {member.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--fg-primary)]">{member.name}</p>
                      <p className="text-[10px] text-[var(--fg-muted)] sm:hidden">{member.email}</p>
                    </div>
                  </div>

                  <p className="hidden sm:block text-sm text-[var(--fg-secondary)] truncate">
                    {member.email}
                  </p>

                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider border w-fit"
                    style={{ background: rs.bg, color: rs.color, borderColor: rs.border }}
                  >
                    {member.role}
                  </span>

                  <p className="text-xs text-[var(--fg-muted)] font-mono">
                    {relativeTime(member.lastActiveAt)}
                  </p>

                  {member.role !== "owner" ? (
                    <button className="text-xs text-[var(--fg-muted)] hover:text-red-500 dark:hover:text-red-400 transition-colors text-left sm:text-right">
                      Remove
                    </button>
                  ) : (
                    <span />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] py-12 text-center">
          <p className="text-sm text-[var(--fg-muted)]">No team members yet. Invite someone to get started.</p>
        </div>
      )}
    </div>
  );
}
