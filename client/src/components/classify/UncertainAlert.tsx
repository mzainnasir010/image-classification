import { AlertTriangle, Info } from "lucide-react";
import { formatPercent } from "../../lib/format";

interface UncertainAlertProps {
  threshold: number;
  confidence: number;
}

export function UncertainAlert({ threshold, confidence }: UncertainAlertProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/8 px-4 py-3"
    >
      <AlertTriangle
        size={18}
        className="mt-0.5 shrink-0 text-[var(--color-warning)]"
        aria-hidden="true"
      />
      <div>
        <p className="font-semibold text-[var(--color-warning)]">Uncertain: please review</p>
        <p className="mt-0.5 text-sm text-[var(--color-muted)]">
          Confidence is{" "}
          <strong className="text-[var(--color-text)]">{formatPercent(confidence)}</strong>,
          below the {formatPercent(threshold)} threshold.
        </p>
        <p className="mt-1.5 flex items-center gap-1 text-xs text-[var(--color-muted)]">
          <Info size={12} aria-hidden="true" />
          The best guess is shown below. Verify before using this result.
        </p>
      </div>
    </div>
  );
}
