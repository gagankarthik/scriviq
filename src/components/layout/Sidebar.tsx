"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, Bell, Users, Settings2, LayoutTemplate,
  ScrollText, ShieldCheck, ChevronUp, Plus,
} from "lucide-react";
import { useSidebar } from "./SidebarContext";

type NavItem = {
  href:  string;
  label: string;
  Icon:  React.ElementType;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Workspace",
    items: [
      { href: "/dashboard", label: "Overview",  Icon: LayoutDashboard },
    ],
  },
  {
    title: "Documents",
    items: [
      { href: "/contracts", label: "Contracts",  Icon: FileText       },
      { href: "/templates", label: "Templates",  Icon: LayoutTemplate },
    ],
  },
  {
    title: "Compliance",
    items: [
      { href: "/audit",   label: "Audit Log", Icon: ScrollText },
      { href: "/alerts",  label: "Alerts",    Icon: Bell       },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/team",     label: "Team",     Icon: Users     },
      { href: "/settings", label: "Settings", Icon: Settings2 },
    ],
  },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface SidebarUser {
  name:  string;
  email: string;
}

function SidebarContent({
  user, onNavClick,
}: {
  user: SidebarUser;
  onNavClick?: () => void;
}) {
  const path = usePathname();
  const initials = getInitials(user.name || "U");

  return (
    <div className="flex flex-col h-full bg-[var(--surface-base)] border-r border-[var(--border-subtle)]">
      {/* Wordmark */}
      <div className="flex items-center px-5 h-16 border-b border-[var(--border-subtle)]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Scriviq" width={120} height={28} priority className="shrink-0" />
        </Link>
      </div>

      {/* Workspace card — fintech style with primary action */}
      <div className="px-3 pt-4 pb-2">
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-3">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-semibold shrink-0"
              style={{
                background: "var(--grad-brand)",
                color: "#fff",
                boxShadow: "0 0 0 1px rgba(41,98,255,0.3), 0 4px 12px rgba(41,98,255,0.18)",
              }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-[var(--fg-primary)] truncate leading-tight">
                {user.name ? `${user.name.split(" ")[0]}'s workspace` : "Workspace"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1 h-1 rounded-full bg-emerald-500" />
                <p className="text-[10px] text-[var(--fg-muted)] font-mono uppercase tracking-wider">Pro · Active</p>
              </div>
            </div>
          </div>
          <Link
            href="/contracts/upload"
            onClick={onNavClick}
            className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-[12px] font-medium text-white transition-all"
            style={{ background: "var(--grad-brand)" }}
          >
            <Plus size={11} strokeWidth={2.5} />
            New upload
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-4 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="px-3 mb-1 eyebrow text-[var(--fg-muted)]" style={{ fontSize: 9 }}>
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map(({ href, label, Icon }) => {
                const active = path === href || (href !== "/dashboard" && path.startsWith(href));
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onNavClick}
                      className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all"
                      style={{
                        backgroundColor: active ? "var(--tint-brand)" : "transparent",
                        color:           active ? "var(--color-brand-light)" : "var(--fg-secondary)",
                      }}
                    >
                      <Icon
                        size={14}
                        strokeWidth={1.75}
                        className="shrink-0"
                      />
                      <span className="flex-1 truncate">{label}</span>
                      {active && (
                        <span className="w-1 h-1 rounded-full bg-current" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Compliance row — minimal trust strip */}
      <div className="mx-3 mb-3 rounded-lg border border-[var(--border-color)] bg-[var(--surface-elevated)] px-3 py-2 flex items-center gap-2">
        <ShieldCheck size={11} className="text-emerald-500 shrink-0" />
        <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-muted)] flex-1">
          Audit · GDPR · Encrypted
        </p>
      </div>

      {/* User card */}
      <div className="px-3 py-3 border-t border-[var(--border-subtle)]">
        <Link
          href="/settings"
          onClick={onNavClick}
          className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-[var(--surface-elevated)] transition-colors group"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 text-white"
            style={{ background: "var(--grad-brand)" }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-[var(--fg-primary)] truncate leading-tight">
              {user.name}
            </p>
            <p className="text-[10px] text-[var(--fg-muted)] truncate">{user.email}</p>
          </div>
          <ChevronUp size={11} className="text-[var(--fg-muted)] group-hover:text-[var(--fg-primary)] transition-colors" />
        </Link>
      </div>
    </div>
  );
}

export function Sidebar({ user }: { user: SidebarUser }) {
  const { isOpen, close } = useSidebar();

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex w-60 shrink-0 flex-col h-screen sticky top-0">
        <SidebarContent user={user} />
      </div>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          style={{ backdropFilter: "blur(4px)" }}
          onClick={close}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-60 lg:hidden transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent user={user} onNavClick={close} />
      </div>
    </>
  );
}
