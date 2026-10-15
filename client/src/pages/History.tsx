import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useHistory, type HistoryEntry } from "../hooks/useHistory";
import { capitalizeLabel, formatPercent, formatTime, formatBytes } from "../lib/format";
import { ProbabilityBars } from "../components/classify/ProbabilityBars";

function HistoryDialog({
  entry,
  onClose,
}: {
  entry: HistoryEntry;
  onClose: () => void;
}) {
  const { prediction: r } = entry;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Classification detail"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-lg text-[var(--color-text)]">
              {capitalizeLabel(r.predicted_class)}
            </p>
            <p className="text-xs text-[var(--color-muted)]">
              {entry.filename} &bull; {formatTime(new Date(entry.timestamp))}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            &times;
          </button>
        </div>

        {entry.thumbnail && (
          <img
            src={entry.thumbnail}
            alt={entry.filename ?? ""}
            className="w-full rounded-lg object-cover"
            width={96}
            height={96}
          />
        )}

        <ProbabilityBars
          predictions={r.top_predictions}
          topClass={r.predicted_class}
        />

        <p className="text-xs text-[var(--color-muted)]">
          Duration: {entry.durationMs} ms
        </p>
      </div>
    </div>
  );
}

export function HistoryPage() {
  const { entries, clearHistory } = useHistory();
  const [selected, setSelected] = useState<HistoryEntry | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  if (entries.length === 0) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-[var(--color-text)] mb-1">History</h1>
        <p className="text-sm text-[var(--color-muted)] mb-6">
          Your classification results this session.
        </p>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-[var(--color-muted)]">No classifications yet.</p>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Upload and classify an image to see results here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text)]">History</h1>
          <p className="text-sm text-[var(--color-muted)]">
            {entries.length} result{entries.length !== 1 ? "s" : ""} this session
          </p>
        </div>
        <button
          onClick={() => setConfirmClear(true)}
          className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-danger)] hover:border-[var(--color-danger)]/30 transition-colors"
          aria-label="Clear history"
        >
          <Trash2 size={14} />
          Clear
        </button>
      </div>

      {/* Confirm clear dialog */}
      {confirmClear && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm clear history"
        >
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmClear(false)} aria-hidden="true" />
          <div className="relative z-10 max-w-sm w-full rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4 shadow-xl">
            <p className="font-semibold text-[var(--color-text)]">Clear all history?</p>
            <p className="text-sm text-[var(--color-muted)]">This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmClear(false)}
                className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-muted)]"
              >
                Cancel
              </button>
              <button
                onClick={() => { clearHistory(); setConfirmClear(false); }}
                className="rounded-lg bg-[var(--color-danger)] px-3 py-1.5 text-sm font-medium text-white"
              >
                Clear all
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)]">
        <table className="w-full text-sm" role="grid" aria-label="Classification history">
          <thead className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Image</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Class</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Confidence</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide hidden sm:table-cell">Outcome</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide hidden md:table-cell">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)]">
            {entries.map((entry) => (
              <tr
                key={entry.id}
                onClick={() => setSelected(entry)}
                className="cursor-pointer hover:bg-[var(--color-background)] transition-colors"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") setSelected(entry); }}
                role="row"
                aria-label={`${entry.filename}: ${capitalizeLabel(entry.prediction.predicted_class)}`}
              >
                <td className="px-4 py-3">
                  {entry.thumbnail ? (
                    <img
                      src={entry.thumbnail}
                      alt={entry.filename ?? ""}
                      className="h-10 w-10 rounded object-cover"
                      width={40}
                      height={40}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded bg-[var(--color-border)]" />
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-[var(--color-text)] truncate max-w-[140px]">
                    {capitalizeLabel(entry.prediction.predicted_class)}
                  </p>
                  <p className="text-xs text-[var(--color-muted)] truncate max-w-[140px]">
                    {entry.filename}
                  </p>
                </td>
                <td className="px-4 py-3 tabular-nums text-[var(--color-text)]">
                  {formatPercent(entry.prediction.confidence)}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      entry.prediction.is_uncertain
                        ? "text-[var(--color-warning)] bg-[var(--color-warning)]/10"
                        : "text-[var(--color-success)] bg-[var(--color-success)]/10"
                    }`}
                  >
                    {entry.prediction.is_uncertain ? "Uncertain" : "Confident"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-[var(--color-muted)] hidden md:table-cell">
                  {formatTime(new Date(entry.timestamp))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <HistoryDialog entry={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

// Helper to suppress unused import
function _unused() { return formatBytes(0); }
void _unused;
