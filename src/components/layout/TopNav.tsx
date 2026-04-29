"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/contracts": "Contracts",
  "/contracts/upload": "Upload Contract",
  "/alerts": "Alerts",
  "/team": "Team",
  "/settings": "Settings",
};

function getPageTitle(path: string): string {
  if (PAGE_TITLES[path]) return PAGE_TITLES[path];
  if (path.startsWith("/contracts/")) return "Contract Detail";
  return "scriviq";
}

interface TopNavProps {
  pendingAlertCount?: number;
}

export function TopNav({ pendingAlertCount = 0 }: TopNavProps) {
  const { toggle } = useSidebar();
  const path = usePathname();

  return (
    <header
      className="h-16 flex items-center gap-4 px-4 sm:px-6 border-b border-slate-800/50 shrink-0"
      style={{ backgroundColor: "rgba(7, 12, 24, 0.95)", backdropFilter: "blur(12px)" }}
    >
      {/* Mobile hamburger */}
      <button
        onClick={toggle}
        className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
        aria-label="Open menu"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-[15px] font-semibold text-slate-100 truncate">
          {getPageTitle(path)}
        </h1>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Alerts bell */}
        <Link
          href="/alerts"
          className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          aria-label="Alerts"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M9 2a5.5 5.5 0 00-5.5 5.5c0 2.5-.8 3.5-1.5 4.5h14c-.7-1-1.5-2-1.5-4.5A5.5 5.5 0 009 2z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path d="M7 14a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {pendingAlertCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
          )}
        </Link>

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full bg-indigo-950/80 border border-indigo-800/50 flex items-center justify-center text-indigo-400 text-xs font-semibold cursor-pointer hover:bg-indigo-950 transition-colors">
          GK
        </div>
      </div>
    </header>
  );
}
