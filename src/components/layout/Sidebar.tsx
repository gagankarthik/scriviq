"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Bell,
  Users,
  Settings2,
} from "lucide-react";
import { useSidebar } from "./SidebarContext";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard",  Icon: LayoutDashboard },
  { href: "/contracts", label: "Contracts",  Icon: FileText },
  { href: "/alerts",    label: "Alerts",     Icon: Bell },
  { href: "/team",      label: "Team",       Icon: Users },
  { href: "/settings",  label: "Settings",   Icon: Settings2 },
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
  user,
  onNavClick,
}: {
  user: SidebarUser;
  onNavClick?: () => void;
}) {
  const path = usePathname();
  const initials = getInitials(user.name || "U");

  return (
    <div className="flex flex-col h-full bg-[var(--surface-base)] border-r border-[var(--border-subtle)]">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 border-b border-[var(--border-subtle)]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Image
            src="/logo-icon.svg"
            alt="scriviq"
            width={30}
            height={30}
            className="shrink-0"
          />
          <span className="text-[var(--fg-primary)] font-bold tracking-tight text-[15px]">
            scriviq
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active =
            path === href || (href !== "/dashboard" && path.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? "border border-[rgba(0,114,229,0.2)] text-[#75D8FC]"
                  : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--surface-subtle)] border border-transparent"
              }`}
              style={active ? { backgroundColor: "rgba(0,114,229,0.12)" } : {}}
            >
              <Icon size={16} strokeWidth={1.75} className="shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Workspace badge */}
      <div className="px-4 pt-3 pb-2">
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-subtle)] px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--fg-muted)] mb-0.5">
            Workspace
          </p>
          <p className="text-xs font-medium text-[var(--fg-secondary)] truncate">
            scriviq Agency
          </p>
          <span
            className="inline-flex items-center gap-1 mt-1.5 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full border"
            style={{ backgroundColor: "rgba(0,114,229,0.12)", color: "#75D8FC", borderColor: "rgba(0,114,229,0.25)" }}
          >
            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: "#0072E5" }} />
            Pro Plan
          </span>
        </div>
      </div>

      {/* User */}
      <div className="px-4 py-4 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
            style={{ backgroundColor: "rgba(0,114,229,0.12)", border: "1px solid rgba(0,114,229,0.25)", color: "#75D8FC" }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--fg-primary)] truncate">
              {user.name}
            </p>
            <p className="text-xs text-[var(--fg-muted)] truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ user }: { user: SidebarUser }) {
  const { isOpen, close } = useSidebar();

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-64 shrink-0 flex-col h-screen sticky top-0">
        <SidebarContent user={user} />
      </div>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          style={{ backdropFilter: "blur(4px)" }}
          onClick={close}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 lg:hidden transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent user={user} onNavClick={close} />
      </div>
    </>
  );
}
