import { Link, useLocation } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { dashboardNav } from "../../config/nav";
import { links } from "../../config/links";

export function DashboardHeader() {
  const location = useLocation();

  // Resolve page title from nav
  const navItem = dashboardNav.find((n) => n.path === location.pathname);
  const pageTitle = navItem?.label ?? "Dashboard";

  return (
    <header
      className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 md:px-10"
      role="banner"
    >
      <div className="flex items-center gap-2 text-sm">
        <Link
          to="/app"
          className="text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          Dashboard
        </Link>
        {pageTitle !== "Classify" && (
          <>
            <span className="text-[var(--color-border)]">/</span>
            <span className="font-medium text-[var(--color-text)]">{pageTitle}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {links.github && (
          <a
            href={links.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View on GitHub"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
          >
            <ExternalLink size={16} />
          </a>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
