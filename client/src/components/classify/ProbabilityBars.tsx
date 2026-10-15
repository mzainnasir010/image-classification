import { formatPercent } from "../../lib/format";
import { capitalizeLabel } from "../../lib/format";
import type { ClassScore } from "../../api/types";

interface ProbabilityBarsProps {
  predictions: ClassScore[];
  topClass: string;
  /** Whether to show all 6 classes or just the top 3 */
  all?: boolean;
}

export function ProbabilityBars({
  predictions,
  topClass,
  all = false,
}: ProbabilityBarsProps) {
  const displayed = all ? predictions : predictions.slice(0, 3);
  const max = displayed[0]?.probability ?? 1;

  return (
    <ul className="space-y-2" aria-label="Class probability bars">
      {displayed.map(({ label, probability }, i) => {
        const isTop = label === topClass;
        const pct = (probability / max) * 100;

        return (
          <li key={label} className="grid grid-cols-[6rem_1fr_3.5rem] items-center gap-2">
            <span
              className={`truncate text-sm font-medium ${
                isTop ? "text-[var(--color-text)]" : "text-[var(--color-muted)]"
              }`}
            >
              {capitalizeLabel(label)}
            </span>

            <div
              className="h-2 overflow-hidden rounded-full bg-[var(--color-border)]"
              role="presentation"
            >
              <div
                className={`h-full rounded-full bar-animated ${
                  isTop ? "bg-[var(--color-accent)]" : "bg-[var(--color-muted)]/50"
                }`}
                style={{
                  width: `${pct}%`,
                  animationDelay: `${i * 60}ms`,
                }}
                aria-hidden="true"
              />
            </div>

            <span
              className={`text-right text-xs tabular-nums ${
                isTop ? "font-semibold text-[var(--color-text)]" : "text-[var(--color-muted)]"
              }`}
            >
              {formatPercent(probability)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
