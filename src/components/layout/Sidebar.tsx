"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard",  icon: "▦" },
  { href: "/contracts", label: "Contracts",  icon: "⊡" },
  { href: "/alerts",    label: "Alerts",     icon: "◎" },
  { href: "/team",      label: "Team",       icon: "⊕" },
  { href: "/settings",  label: "Settings",   icon: "⊙" },
];

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const path = usePathname();

  return (
    <div className="flex flex-col h-full bg-[#0A0F1E] border-r border-slate-800/50">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-800/40">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ boxShadow: "0 0 14px rgb(79 70 229 / 0.45)" }}
          >
            C
          </div>
          <span className="text-white font-semibold tracking-tight text-[15px]">
            scriviq
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active =
            path === href || (href !== "/dashboard" && path.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/20"
                  : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
              }`}
            >
              <span className="text-base w-5 text-center shrink-0">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-950/80 border border-indigo-800/50 flex items-center justify-center text-indigo-400 text-xs font-semibold shrink-0">
            GK
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">
              Gagan Karthik
            </p>
            <p className="text-xs text-slate-500 truncate">Pro Plan · 14d trial</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { isOpen, close } = useSidebar();

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-64 shrink-0 flex-col h-screen sticky top-0">
        <SidebarContent />
      </div>

      {/* Mobile drawer backdrop */}
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
        <SidebarContent onNavClick={close} />
      </div>
    </>
  );
}
