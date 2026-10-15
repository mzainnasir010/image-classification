import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, X, Menu } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { dashboardNav } from "../../config/nav";
import { StatusBadge } from "./StatusBadge";
import { cn } from "../../lib/utils";

export function Sidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navContent = (
    <nav aria-label="Dashboard navigation">
      <ul className="space-y-0.5">
        {dashboardNav.map(({ label, path, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <li key={path}>
              <Link
                to={path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-[var(--color-accent)] text-[var(--color-accent-fg)]"
                    : "text-[var(--color-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)] hover:translate-x-0.5"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={16} strokeWidth={2} aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  const bottomContent = (
    <div className="space-y-3">
      <StatusBadge />
      <Link
        to="/"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
        onClick={() => setMobileOpen(false)}
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Back to website
      </Link>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-56 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] h-full fixed left-0 top-0 bottom-0 animate-slide-left"
        aria-label="Dashboard sidebar"
      >
        <div className="flex h-14 items-center px-4 border-b border-[var(--color-border)]">
          <Logo size="sm" />
        </div>
        <div className="flex flex-col flex-1 justify-between p-3 overflow-y-auto">
          {navContent}
          {bottomContent}
        </div>
      </aside>

      {/* Mobile hamburger button */}
      <button
        className="md:hidden fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-accent-fg)] shadow-lg btn-glow transition-transform hover:scale-105 active:scale-95"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile sheet overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="w-64 bg-[var(--color-surface)] border-l border-[var(--color-border)] flex flex-col h-full animate-slide-right"
            aria-label="Mobile navigation"
          >
            <div className="flex h-14 items-center justify-between px-4 border-b border-[var(--color-border)]">
              <Logo size="sm" />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="text-[var(--color-muted)]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col flex-1 justify-between p-3 overflow-y-auto">
              {navContent}
              {bottomContent}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
