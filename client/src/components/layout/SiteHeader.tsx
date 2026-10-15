import { Link } from "react-router-dom";
import { useState } from "react";
import { ExternalLink, Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { StatusBadge } from "./StatusBadge";
import { ThemeToggle } from "./ThemeToggle";
import { links } from "../../config/links";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Model", href: "/#model-snapshot" },
  { label: "FAQ", href: "/#faq" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-surface)]"
      role="banner"
    >
      <div className="flex h-14 w-full items-center justify-between px-10">
        {/* Left: logo */}
        <Link to="/" aria-label="SceneSense home">
          <Logo size="md" />
        </Link>

        {/* Center: nav (hidden on mobile) */}
        <nav
          className="hidden md:flex items-center gap-6"
          aria-label="Site navigation"
        >
          {navLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Right: badge, theme, github, CTA */}
        <div className="flex items-center gap-2">
          <StatusBadge className="hidden sm:inline-flex" />
          <ThemeToggle />
          {links.github && (
            <a
              href={links.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View on GitHub"
              className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              <ExternalLink size={16} />
            </a>
          )}
          <Link
            to="/app"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-sm font-medium text-[var(--color-accent-fg)] transition-opacity hover:opacity-90"
          >
            Open dashboard
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-muted)]"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)] px-10 pb-4">
          <nav aria-label="Mobile site navigation">
            <ul className="mt-3 space-y-1">
              {navLinks.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-[var(--color-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
                  >
                    {label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  to="/app"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-accent)]"
                >
                  Open dashboard
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
