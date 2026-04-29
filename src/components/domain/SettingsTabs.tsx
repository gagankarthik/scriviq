"use client";

import { useState } from "react";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Tab = "profile" | "notifications" | "billing";

function Toggle({
  label,
  sub,
  checked,
  onChange,
}: {
  label: string;
  sub?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-slate-800/40 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-200">{label}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-10 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
          checked ? "bg-indigo-600" : "bg-slate-700/60"
        }`}
      >
        <span
          className={`inline-block w-4 h-4 rounded-full bg-white shadow transform transition-transform duration-200 mt-1 ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function ProfilePanel() {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "Gagan Karthik",
    email: "gagan@scriviq.com",
    company: "scriviq",
    timezone: "UTC+5:30",
  });

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
  }

  return (
    <form onSubmit={save} className="space-y-4 max-w-lg">
      <Input label="Full name" id="name" value={form.name} onChange={set("name")} />
      <Input label="Email address" id="email" type="email" value={form.email} onChange={set("email")} />
      <Input label="Company / Agency" id="company" value={form.company} onChange={set("company")} />
      <Select label="Timezone" id="timezone" value={form.timezone} onChange={(e) => setForm((p) => ({ ...p, timezone: e.target.value }))}>
        <option>UTC−8:00 Pacific</option>
        <option>UTC−5:00 Eastern</option>
        <option>UTC+0:00 London</option>
        <option>UTC+1:00 Amsterdam</option>
        <option>UTC+5:30 Mumbai</option>
        <option>UTC+8:00 Singapore</option>
      </Select>
      <div className="pt-2">
        <Button type="submit" loading={saving} glow>Save changes</Button>
      </div>
    </form>
  );
}

function NotificationsPanel() {
  const [settings, setSettings] = useState({
    alert7d: true,
    alert1d: true,
    alertOverdue: true,
    weeklyDigest: false,
    teamActivity: true,
  });

  function toggle(k: keyof typeof settings) {
    return (v: boolean) => setSettings((p) => ({ ...p, [k]: v }));
  }

  return (
    <div className="max-w-lg space-y-2">
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/20 px-5 divide-y divide-slate-800/40">
        <div className="py-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Deadline Alerts
          </p>
        </div>
        <Toggle
          label="7-day reminders"
          sub="Email when a clause deadline is 7 days away"
          checked={settings.alert7d}
          onChange={toggle("alert7d")}
        />
        <Toggle
          label="1-day reminders"
          sub="Email the day before a clause deadline"
          checked={settings.alert1d}
          onChange={toggle("alert1d")}
        />
        <Toggle
          label="Overdue alerts"
          sub="Email when a deadline has passed"
          checked={settings.alertOverdue}
          onChange={toggle("alertOverdue")}
        />
      </div>

      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/20 px-5 divide-y divide-slate-800/40">
        <div className="py-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Digest & Activity
          </p>
        </div>
        <Toggle
          label="Weekly digest"
          sub="Summary of all upcoming deadlines every Monday"
          checked={settings.weeklyDigest}
          onChange={toggle("weeklyDigest")}
        />
        <Toggle
          label="Team activity"
          sub="Notify when teammates upload or action clauses"
          checked={settings.teamActivity}
          onChange={toggle("teamActivity")}
        />
      </div>
    </div>
  );
}

function BillingPanel() {
  return (
    <div className="max-w-lg space-y-4">
      {/* Current plan */}
      <div className="rounded-2xl border border-indigo-800/25 bg-indigo-950/20 p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-indigo-400 mb-1">
              Pro Team
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold text-white font-mono">$49</span>
              <span className="text-slate-500 text-sm">/ month</span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Trial ends May 12, 2026 · No credit card on file
            </p>
          </div>
          <Button variant="primary" size="sm" glow>Add payment method</Button>
        </div>
        <div className="mt-4 pt-4 border-t border-indigo-800/20 grid grid-cols-2 gap-3 text-xs">
          {[
            "Unlimited contracts",
            "AI clause extraction",
            "Deadline alerts",
            "Team workspace",
          ].map((f) => (
            <div key={f} className="flex items-center gap-1.5 text-slate-400">
              <span className="text-indigo-400">✓</span>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Enterprise upsell */}
      <div className="rounded-2xl border border-slate-800/50 bg-slate-900/20 p-5">
        <p className="text-sm font-semibold text-slate-200 mb-1">
          Need Enterprise?
        </p>
        <p className="text-xs text-slate-500 mb-3 leading-relaxed">
          SSO, white-label branding, audit logs, webhook integrations, read-only
          API, and custom clause types.
        </p>
        <Button variant="ghost" size="sm">Talk to sales →</Button>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border border-red-900/25 bg-red-950/10 p-5">
        <p className="text-sm font-semibold text-red-400 mb-1">Danger Zone</p>
        <p className="text-xs text-slate-500 mb-3">
          Cancel your subscription. Your data will be retained for 30 days.
        </p>
        <Button variant="danger" size="sm">Cancel subscription</Button>
      </div>
    </div>
  );
}

export function SettingsTabs() {
  const [tab, setTab] = useState<Tab>("profile");

  const TABS: { value: Tab; label: string }[] = [
    { value: "profile",       label: "Profile" },
    { value: "notifications", label: "Notifications" },
    { value: "billing",       label: "Billing" },
  ];

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex items-center gap-1 rounded-xl bg-slate-900/50 border border-slate-800/50 p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              tab === t.value
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Panel */}
      {tab === "profile"       && <ProfilePanel />}
      {tab === "notifications" && <NotificationsPanel />}
      {tab === "billing"       && <BillingPanel />}
    </div>
  );
}
