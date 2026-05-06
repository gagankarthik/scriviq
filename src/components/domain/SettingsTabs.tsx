"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2, CreditCard, User, Bell, Shield,
  FileText, AlertTriangle, TrendingUp, Clock,
  LayoutDashboard, FolderOpen, Upload, ArrowRight, Building2,
  ShieldAlert, DollarSign, FileCheck2,
} from "lucide-react";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { ComplianceRulesPanel } from "./ComplianceRulesPanel";

type Tab = "workspace" | "profile" | "notifications" | "billing" | "compliance";

export interface SettingsUser  { name: string; email: string }
export interface SettingsStats {
  totalValue: number; activeContracts: number;
  highRiskClauseCount: number; upcomingDeadlineCount: number;
  processingCount: number; pendingAlertCount: number;
}

function Toggle({ label, sub, checked, onChange }: {
  label: string; sub?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-[var(--border-subtle)] last:border-0">
      <div>
        <p className="text-sm font-medium text-[var(--fg-primary)]">{label}</p>
        {sub && <p className="text-xs text-[var(--fg-muted)] mt-0.5">{sub}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative inline-flex h-6 w-10 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0072E5]/30"
      >
        <span className="absolute inset-0 rounded-full transition-colors duration-200"
          style={{ backgroundColor: checked ? "#0072E5" : "rgb(148 163 184 / 0.3)" }} />
        <span className={`relative inline-block w-4 h-4 rounded-full bg-white shadow transform transition-transform duration-200 mt-1 z-10 ${checked ? "translate-x-5" : "translate-x-1"}`} />
      </button>
    </div>
  );
}

// ── Workspace panel ───────────────────────────────────────────────────────────

function WorkspacePanel({ stats }: { stats: SettingsStats }) {
  const statCards = [
    {
      label: "Active Contracts",
      value: String(stats.activeContracts),
      Icon: FileText,
      color: "#0072E5",
      href: "/contracts?status=ready",
      description: "View all active contracts",
    },
    {
      label: "Portfolio Value",
      value: formatCurrency(stats.totalValue),
      Icon: DollarSign,
      color: "#10b981",
      href: "/contracts?status=ready",
      description: "Total contract value",
    },
    {
      label: "High-Risk Clauses",
      value: String(stats.highRiskClauseCount),
      Icon: ShieldAlert,
      color: "#ef4444",
      href: "/contracts?risk=high",
      description: "Contracts with high-risk clauses",
    },
    {
      label: "Upcoming Deadlines",
      value: String(stats.upcomingDeadlineCount),
      Icon: Clock,
      color: "#f59e0b",
      href: "/alerts",
      description: "Deadlines in the next 30 days",
    },
    {
      label: "Processing",
      value: String(stats.processingCount),
      Icon: TrendingUp,
      color: "#8b5cf6",
      href: "/contracts?status=processing",
      description: "Contracts being analysed",
    },
    {
      label: "Pending Alerts",
      value: String(stats.pendingAlertCount),
      Icon: AlertTriangle,
      color: "#f59e0b",
      href: "/alerts",
      description: "Unacknowledged alerts",
    },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Quick-access stat cards */}
      <div>
        <p className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-3">
          Workspace Overview
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {statCards.map(({ label, value, Icon, color, href, description }) => (
            <Link
              key={label}
              href={href}
              className="group rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-4 hover:border-[rgba(0,114,229,0.3)] transition-all duration-150"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${color}1a` }}>
                  <Icon size={14} style={{ color }} />
                </div>
                <ArrowRight size={13} className="text-[var(--fg-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-bold font-mono mb-0.5" style={{ color }}>{value}</p>
              <p className="text-xs font-medium text-[var(--fg-secondary)]">{label}</p>
              <p className="text-[10px] text-[var(--fg-muted)] mt-0.5">{description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] divide-y divide-[var(--border-subtle)]">
        <div className="px-5 py-3">
          <p className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider">Quick Actions</p>
        </div>
        {[
          { label: "Go to Dashboard",      sub: "View analytics and recent activity",    href: "/dashboard",          Icon: LayoutDashboard },
          { label: "Browse Contracts",     sub: "View all projects and uploaded SOWs",   href: "/contracts",          Icon: FolderOpen      },
          { label: "Upload a Contract",    sub: "Add a new SOW or agreement",            href: "/contracts/upload",   Icon: Upload          },
          { label: "View Compliance Rules",sub: "Edit your clause monitoring rules",     href: "#compliance",         Icon: FileCheck2      },
        ].map(({ label, sub, href, Icon }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--surface-subtle)] transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg border border-[var(--border-color)] flex items-center justify-center shrink-0">
              <Icon size={14} className="text-[var(--fg-muted)] group-hover:text-[#0072E5] transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--fg-primary)]">{label}</p>
              <p className="text-xs text-[var(--fg-muted)]">{sub}</p>
            </div>
            <ArrowRight size={13} className="text-[var(--fg-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Usage stats band ──────────────────────────────────────────────────────────

function UsageStats({ stats }: { stats: SettingsStats }) {
  const items = [
    { label: "Active Contracts",  value: String(stats.activeContracts),      Icon: FileText,     color: "#0072E5", href: "/contracts?status=ready" },
    { label: "Portfolio Value",   value: formatCurrency(stats.totalValue),   Icon: TrendingUp,   color: "#10b981", href: "/contracts?status=ready" },
    { label: "High-Risk Clauses", value: String(stats.highRiskClauseCount),  Icon: AlertTriangle, color: "#ef4444", href: "/contracts?risk=high" },
    { label: "Upcoming Deadlines",value: String(stats.upcomingDeadlineCount), Icon: Clock,        color: "#f59e0b", href: "/alerts" },
  ];

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] mb-4">
        Workspace Overview
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map(({ label, value, Icon, color, href }) => (
          <Link key={label} href={href} className="group flex flex-col gap-1 cursor-pointer">
            <div className="flex items-center gap-1.5">
              <Icon size={12} style={{ color }} />
              <p className="text-[10px] uppercase tracking-wider text-[var(--fg-muted)] font-semibold">{label}</p>
            </div>
            <p className="text-xl font-bold font-mono group-hover:underline" style={{ color }}>{value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Profile panel ─────────────────────────────────────────────────────────────

function ProfilePanel({ user }: { user: SettingsUser }) {
  const [saving, setSaving]  = useState(false);
  const [saved,  setSaved]   = useState(false);
  const [error,  setError]   = useState("");
  const [form,   setForm]    = useState({
    name:     user.name,
    email:    user.email,
    timezone: "UTC+5:30",
  });

  function field(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/auth/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name: form.name }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Save failed");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-4 max-w-lg">
      <Input label="Full name" id="name" value={form.name} onChange={field("name")} />
      <Input label="Email address" id="email" type="email" value={form.email} onChange={field("email")}
        disabled />
      <p className="text-xs text-[var(--fg-muted)] -mt-2">
        Email cannot be changed here — contact support if needed.
      </p>
      <Select label="Timezone" id="timezone" value={form.timezone}
        onChange={(e) => setForm((p) => ({ ...p, timezone: e.target.value }))}>
        <option value="UTC-8:00">UTC−8:00 Pacific</option>
        <option value="UTC-5:00">UTC−5:00 Eastern</option>
        <option value="UTC+0:00">UTC+0:00 London</option>
        <option value="UTC+1:00">UTC+1:00 Amsterdam</option>
        <option value="UTC+5:30">UTC+5:30 Mumbai</option>
        <option value="UTC+8:00">UTC+8:00 Singapore</option>
      </Select>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="pt-2 flex items-center gap-3">
        <Button type="submit" loading={saving} glow>Save changes</Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 animate-fade-in">
            <CheckCircle2 size={15} />Saved
          </span>
        )}
      </div>
    </form>
  );
}

// ── Notifications panel ───────────────────────────────────────────────────────

function NotificationsPanel() {
  const [settings, setSettings] = useState({
    alert7d:      true,
    alert1d:      true,
    alertOverdue: true,
    weeklyDigest: false,
    teamActivity: true,
    slackWebhook: false,
  });
  const toggle = (k: keyof typeof settings) => (v: boolean) => setSettings((p) => ({ ...p, [k]: v }));

  return (
    <div className="max-w-lg space-y-4">
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] px-5 divide-y divide-[var(--border-subtle)]">
        <div className="py-3">
          <p className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider">Deadline Alerts</p>
        </div>
        <Toggle label="7-day reminders"  sub="Email when a clause deadline is 7 days away"  checked={settings.alert7d}      onChange={toggle("alert7d")} />
        <Toggle label="1-day reminders"  sub="Email the day before a clause deadline"        checked={settings.alert1d}      onChange={toggle("alert1d")} />
        <Toggle label="Overdue alerts"   sub="Email when a deadline has passed"              checked={settings.alertOverdue} onChange={toggle("alertOverdue")} />
      </div>

      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] px-5 divide-y divide-[var(--border-subtle)]">
        <div className="py-3">
          <p className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider">Digest &amp; Integrations</p>
        </div>
        <Toggle label="Weekly digest"     sub="Summary of all upcoming deadlines every Monday"         checked={settings.weeklyDigest} onChange={toggle("weeklyDigest")} />
        <Toggle label="Team activity"     sub="Notify when teammates upload or action clauses"         checked={settings.teamActivity} onChange={toggle("teamActivity")} />
        <Toggle label="Slack integration" sub="Post critical alerts to a Slack channel via webhook"   checked={settings.slackWebhook} onChange={toggle("slackWebhook")} />
      </div>

      {settings.slackWebhook && (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5">
          <Input label="Slack Webhook URL" placeholder="https://hooks.slack.com/services/..." />
          <div className="mt-3"><Button size="sm" glow>Save webhook</Button></div>
        </div>
      )}
    </div>
  );
}

// ── Billing panel ─────────────────────────────────────────────────────────────

function BillingPanel() {
  return (
    <div className="max-w-lg space-y-4">
      <div className="rounded-2xl p-5"
        style={{ border: "1px solid rgba(0,114,229,0.2)", background: "rgba(0,114,229,0.05)" }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: "#0072E5" }}>Pro Team</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-[var(--fg-primary)] font-mono">$49</span>
              <span className="text-[var(--fg-muted)] text-sm">/ month</span>
            </div>
            <p className="text-xs text-[var(--fg-muted)] mt-1.5">Trial ends May 12, 2026 · No credit card on file</p>
          </div>
          <Button variant="primary" size="sm" glow>
            <CreditCard size={13} />
            Add payment method
          </Button>
        </div>
        <div className="mt-4 pt-4 grid grid-cols-2 gap-3 text-xs"
          style={{ borderTop: "1px solid rgba(0,114,229,0.15)" }}>
          {["Unlimited contracts", "AI clause extraction", "Deadline alerts", "Team workspace", "Amendment tracking", "Priority support"].map((f) => (
            <div key={f} className="flex items-center gap-1.5 text-[var(--fg-secondary)]">
              <CheckCircle2 size={12} className="shrink-0" style={{ color: "#0072E5" }} />
              {f}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5">
        <p className="text-sm font-semibold text-[var(--fg-primary)] mb-1">Need Enterprise?</p>
        <p className="text-xs text-[var(--fg-muted)] mb-3 leading-relaxed">
          SSO, white-label branding, audit logs, Slack/Teams webhooks, read-only API, custom clause types, multi-workspace, and dedicated support.
        </p>
        <Button variant="ghost" size="sm">Talk to sales →</Button>
      </div>

      <div className="rounded-2xl border border-red-200 dark:border-red-900/25 bg-red-50 dark:bg-red-950/10 p-5">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={13} className="text-red-600 dark:text-red-400" />
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">Danger Zone</p>
        </div>
        <p className="text-xs text-[var(--fg-muted)] mb-3">Cancel your subscription. Your data is retained for 30 days.</p>
        <Button variant="danger" size="sm">Cancel subscription</Button>
      </div>
    </div>
  );
}

// ── Tabs shell ────────────────────────────────────────────────────────────────

export function SettingsTabs({ user, stats }: { user: SettingsUser; stats: SettingsStats }) {
  const [tab, setTab] = useState<Tab>("workspace");

  const TABS: { value: Tab; label: string; Icon: React.ElementType }[] = [
    { value: "workspace",     label: "Workspace",     Icon: Building2  },
    { value: "profile",       label: "Profile",       Icon: User       },
    { value: "notifications", label: "Notifications", Icon: Bell       },
    { value: "billing",       label: "Billing",       Icon: CreditCard },
    { value: "compliance",    label: "Compliance",    Icon: Shield     },
  ];

  return (
    <div className="space-y-6">
      {/* Live usage stats */}
      <UsageStats stats={stats} />

      {/* Tab selector */}
      <div className="flex items-center gap-1 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)] p-1 w-fit">
        {TABS.map(({ value, label, Icon }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
            style={
              tab === value
                ? { backgroundColor: "#0072E5", color: "#ffffff" }
                : { color: "var(--fg-muted)" }
            }
          >
            <Icon size={13} strokeWidth={1.75} />
            {label}
          </button>
        ))}
      </div>

      {tab === "workspace"     && <WorkspacePanel stats={stats} />}
      {tab === "profile"       && <ProfilePanel user={user} />}
      {tab === "notifications" && <NotificationsPanel />}
      {tab === "billing"       && <BillingPanel />}
      {tab === "compliance"    && <ComplianceRulesPanel />}
    </div>
  );
}
