"use client";

import { useState } from "react";
import { type TeamMember, type TeamRole, relativeTime } from "@/lib/mock-data";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const ROLE_COLORS: Record<TeamRole, string> = {
  owner: "bg-indigo-950/60 text-indigo-400 border-indigo-800/50",
  admin: "bg-amber-950/60 text-amber-400 border-amber-800/50",
  member: "bg-slate-800/60 text-slate-400 border-slate-700/50",
};

interface TeamTableProps {
  members: TeamMember[];
}

export function TeamTable({ members }: TeamTableProps) {
  const [showInvite, setShowInvite] = useState(false);
  const [invite, setInvite] = useState({ email: "", role: "member" as TeamRole });
  const [inviting, setInviting] = useState(false);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    await new Promise((r) => setTimeout(r, 800));
    setInviting(false);
    setShowInvite(false);
    setInvite({ email: "", role: "member" });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-slate-500">
          {members.length} member{members.length !== 1 ? "s" : ""} in your workspace
        </p>
        <Button variant="primary" size="sm" glow onClick={() => setShowInvite(true)}>
          ⊕ Invite member
        </Button>
      </div>

      {/* Invite form */}
      {showInvite && (
        <div className="rounded-2xl border border-indigo-800/30 bg-indigo-950/20 p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">
            Invite a team member
          </h3>
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
        </div>
      )}

      {/* Members list */}
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/20 overflow-hidden">
        {/* Desktop header */}
        <div className="hidden sm:grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-slate-800/40 text-[10px] uppercase tracking-wider font-medium text-slate-600">
          <span>Member</span>
          <span>Email</span>
          <span>Role</span>
          <span>Last active</span>
          <span />
        </div>

        <div className="divide-y divide-slate-800/30">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex flex-col sm:grid sm:grid-cols-[1fr_1fr_auto_auto_auto] sm:items-center gap-3 sm:gap-4 px-5 py-4 hover:bg-slate-900/30 transition-colors"
            >
              {/* Avatar + name */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-950/80 border border-indigo-800/50 flex items-center justify-center text-indigo-400 text-xs font-semibold shrink-0">
                  {member.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-100">{member.name}</p>
                  <p className="text-[10px] text-slate-600 sm:hidden">{member.email}</p>
                </div>
              </div>

              {/* Email — desktop */}
              <p className="hidden sm:block text-sm text-slate-500 truncate">
                {member.email}
              </p>

              {/* Role badge */}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider border w-fit ${ROLE_COLORS[member.role]}`}
              >
                {member.role}
              </span>

              {/* Last active */}
              <p className="text-xs text-slate-600 font-mono">
                {relativeTime(member.lastActiveAt)}
              </p>

              {/* Actions — only for non-owners */}
              {member.role !== "owner" ? (
                <button className="text-xs text-slate-600 hover:text-red-400 transition-colors text-left sm:text-right">
                  Remove
                </button>
              ) : (
                <span />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
