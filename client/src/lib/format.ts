/**
 * Format helpers used across the app.
 * All display transformations live here so components stay clean.
 */

/** Format a 0..1 probability as "94.3%" */
export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/** Format bytes as "2.4 MB" or "512 KB" */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Capitalise first letter: "glacier" → "Glacier" */
export function capitalizeLabel(label: string): string {
  if (!label) return label;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Format milliseconds duration: "1,243 ms" */
export function formatMs(ms: number): string {
  return `${ms.toLocaleString()} ms`;
}

/** Format a Date to a short time string: "14:03:22" */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
