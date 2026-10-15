import { Link } from "react-router-dom";
import { env } from "../../config/env";
import { links } from "../../config/links";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t border-[var(--color-border)] bg-[var(--color-surface)]"
      role="contentinfo"
    >
      <div className="w-full px-10 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand column */}
          <div className="md:col-span-2 space-y-3">
            <p className="font-semibold text-[var(--color-text)]">{env.VITE_APP_NAME}</p>
            <p className="text-sm text-[var(--color-muted)] max-w-xs leading-relaxed">
              Scene classification powered by a fine-tuned ResNet50. Six classes, calibrated
              confidence, honest uncertainty.
            </p>
            <p className="text-xs text-[var(--color-muted)]">
              Built with FastAPI, TensorFlow and React
            </p>
          </div>

          {/* Product links */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              Product
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/app"
                  className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/app/model"
                  className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  Model
                </Link>
              </li>
              <li>
                <Link
                  to="/app/api"
                  className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  API Reference
                </Link>
              </li>
            </ul>
          </div>

          {/* Project links */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              Project
            </p>
            <ul className="space-y-2">
              {links.github && (
                <li>
                  <a
                    href={links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                  >
                    GitHub
                  </a>
                </li>
              )}
              {links.notebook && (
                <li>
                  <a
                    href={links.notebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                  >
                    Notebook
                  </a>
                </li>
              )}
              <li>
                <a
                  href={links.datasetSource}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  Dataset source
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[var(--color-border)] pt-6 text-xs text-[var(--color-muted)]">
          &copy; {year} {env.VITE_APP_NAME}. Open source project.
        </div>
      </div>
    </footer>
  );
}
