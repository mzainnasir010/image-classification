import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--color-background)] px-4 text-center">
      <div className="space-y-6 max-w-md">
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)]"
          aria-hidden="true"
        >
          <span className="text-2xl font-mono font-bold text-[var(--color-text)]">404</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">Page not found</h1>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-opacity hover:opacity-90"
          >
            <Home size={15} aria-hidden="true" />
            Go to home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
