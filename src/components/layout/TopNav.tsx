"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Bell, Sun, Moon, Search, LogOut } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { useSidebar } from "./SidebarContext";
import { useTheme } from "./ThemeProvider";
import { SearchPanel } from "./SearchPanel";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":         "Overview",
  "/contracts":         "Contracts",
  "/contracts/upload":  "Upload",
  "/templates":         "Templates",
  "/alerts":            "Alerts",
  "/audit":             "Audit Log",
  "/team":              "Team",
  "/settings":          "Settings",
};

function getPageTitle(path: string): string {
  if (PAGE_TITLES[path]) return PAGE_TITLES[path];
  if (path.startsWith("/contracts/projects/")) return "Project";
  if (path.startsWith("/contracts/"))           return "Contract";
  return "Scriviq";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface TopNavProps {
  pendingAlertCount?: number;
  user: { name: string; email: string };
}

export function TopNav({ pendingAlertCount = 0, user }: TopNavProps) {
  const { toggle: toggleSidebar } = useSidebar();
  const { theme, toggle: toggleTheme } = useTheme();
  const path = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const initials = getInitials(user.name || "U");

  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
    }
  }

  return (
    <>
      <header
        className="h-16 flex items-center gap-4 px-4 sm:px-6 border-b border-[var(--border-subtle)] shrink-0 backdrop-blur-md"
        style={{ backgroundColor: "var(--surface-overlay)" }}
      >
        {/* Mobile hamburger */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--surface-subtle)] transition-colors"
          aria-label="Open menu"
        >
          <Menu size={18} strokeWidth={1.75} />
        </button>

        {/* Page title */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <h1 className="text-[15px] font-semibold text-[var(--fg-primary)] truncate tracking-tight">
            {getPageTitle(path)}
          </h1>
        </div>

        {/* Inline search trigger */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden md:flex items-center gap-2 w-72 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-elevated)] text-[var(--fg-muted)] hover:border-[rgba(41,98,255,0.3)] transition-all"
        >
          <Search size={12} strokeWidth={1.75} />
          <span className="text-xs flex-1 text-left">Search…</span>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-[var(--fg-muted)]">
            ⌘K
          </kbd>
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          {/* Search (mobile only) */}
          <button
            onClick={() => setSearchOpen(true)}
            className="md:hidden p-2 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--surface-subtle)] transition-colors"
            aria-label="Search"
          >
            <Search size={16} strokeWidth={1.75} />
          </button>

          {/* Alerts */}
          <Link
            href="/alerts"
            className="relative p-2 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--surface-subtle)] transition-colors"
            aria-label="Alerts"
          >
            <Bell size={16} strokeWidth={1.75} />
            {pendingAlertCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-[var(--surface-base)]" />
            )}
          </Link>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--surface-subtle)] transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun size={16} strokeWidth={1.75} />
            ) : (
              <Moon size={16} strokeWidth={1.75} />
            )}
          </button>

          {/* User menu */}
          <div className="relative ml-1">
            <button
              onClick={() => setShowUserMenu((v) => !v)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold cursor-pointer transition-colors text-[#0072E5] dark:text-[#75D8FC]"
              style={{ backgroundColor: "rgba(0,114,229,0.12)", border: "1px solid rgba(0,114,229,0.25)" }}
              aria-label="User menu"
            >
              {initials}
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-10 z-20 w-56 rounded-xl border border-[var(--border-color)] bg-[var(--surface-elevated)] shadow-xl py-1.5">
                  <div className="px-3 py-2 border-b border-[var(--border-subtle)]">
                    <p className="text-xs font-semibold text-[var(--fg-primary)] truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-[var(--fg-muted)] truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>
                  <Link
                    href="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--surface-subtle)] transition-colors"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    <LogOut size={14} strokeWidth={1.75} />
                    {loggingOut ? "Signing out…" : "Sign out"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <SearchPanel open={searchOpen} onClose={closeSearch} />
    </>
  );
}
