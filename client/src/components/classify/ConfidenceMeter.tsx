import { formatPercent } from "../../lib/format";

interface ConfidenceMeterProps {
  value: number; // 0..1
  isUncertain: boolean;
}

export function ConfidenceMeter({ value, isUncertain }: ConfidenceMeterProps) {
  const pct = value * 100;
  const color = isUncertain ? "var(--color-warning)" : "var(--color-success)";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--color-muted)]">Confidence</span>
        <span
          className="text-sm font-semibold tabular-nums"
          style={{ color }}
        >
          {formatPercent(value)}
        </span>
      </div>

      {/* Progress track */}
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Confidence: ${formatPercent(value)}`}
        className="h-2 overflow-hidden rounded-full bg-[var(--color-border)]"
      >
        <div
          className="h-full rounded-full bar-animated transition-[width]"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
