import { useHealth, type ApiStatus } from "../../hooks/useHealth";
import { env } from "../../config/env";
import { cn } from "../../lib/utils";

const statusConfig: Record<
  ApiStatus,
  { label: string; dotClass: string; textClass: string }
> = {
  online: {
    label: "Online",
    dotClass: "bg-[var(--color-success)]",
    textClass: "text-[var(--color-success)]",
  },
  starting: {
    label: "Starting",
    dotClass: "bg-[var(--color-warning)] animate-pulse",
    textClass: "text-[var(--color-warning)]",
  },
  offline: {
    label: "Offline",
    dotClass: "bg-[var(--color-danger)]",
    textClass: "text-[var(--color-danger)]",
  },
};

interface StatusBadgeProps {
  compact?: boolean;
  className?: string;
}

export function StatusBadge({ compact = false, className }: StatusBadgeProps) {
  const { status } = useHealth();
  const config = statusConfig[status];

  // Extract hostname for tooltip
  let host = "";
  try {
    host = new URL(env.VITE_API_BASE_URL).hostname;
  } catch {
    host = env.VITE_API_BASE_URL;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium",
        className
      )}
      title={`Backend: ${host}`}
      role="status"
      aria-label={`API status: ${config.label}`}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", config.dotClass)}
        aria-hidden="true"
      />
      {!compact && (
        <span className={config.textClass}>{config.label}</span>
      )}
    </span>
  );
}
