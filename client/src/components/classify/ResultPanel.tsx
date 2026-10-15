import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp, Clock, RotateCcw } from "lucide-react";
import type { PredictionResponse } from "../../api/types";
import type { ApiError } from "../../api/errors";
import { capitalizeLabel, formatMs, formatPercent } from "../../lib/format";
import { sceneClasses } from "../../data/classes";
import { ConfidenceMeter } from "./ConfidenceMeter";
import { ProbabilityBars } from "./ProbabilityBars";
import { UncertainAlert } from "./UncertainAlert";
import { ErrorAlert } from "./ErrorAlert";

type ResultPanelState =
  | { kind: "empty" }
  | { kind: "loading" }
  | { kind: "success"; result: PredictionResponse; durationMs: number; objectUrl?: string }
  | { kind: "error"; error: ApiError | Error };

interface ResultPanelProps {
  state: ResultPanelState;
  onClassifyAnother?: () => void;
  onRetry?: () => void;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="text-4xl text-[var(--color-border)]" aria-hidden="true">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="40" height="40" rx="4" />
          <circle cx="16" cy="18" r="4" />
          <path d="M4 34l12-10 8 7 6-5 14 12" />
        </svg>
      </div>
      <p className="text-[var(--color-muted)] text-sm max-w-xs">
        Upload an image to see the classification result here. The model can identify these
        scenes:
      </p>
      <ul className="flex flex-wrap justify-center gap-1.5" aria-label="Supported scene classes">
        {sceneClasses.map(({ id, label }) => (
          <li
            key={id}
            className="rounded-full border border-[var(--color-border)] px-2.5 py-1 text-xs text-[var(--color-muted)]"
          >
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading result" aria-busy="true">
      <div className="skeleton h-48 w-full rounded-[var(--radius-card)]" />
      <div className="skeleton h-6 w-1/3" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-5/6" />
      <div className="skeleton h-4 w-4/6" />
    </div>
  );
}

export function ResultPanel({ state, onClassifyAnother, onRetry }: ResultPanelProps) {
  const [showAll, setShowAll] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyJson(result: PredictionResponse) {
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  }

  if (state.kind === "empty") return <EmptyState />;
  if (state.kind === "loading") return <LoadingSkeleton />;
  if (state.kind === "error")
    return <ErrorAlert error={state.error} onRetry={onRetry} />;

  const { result, durationMs, objectUrl } = state;

  // Convert all probabilities to ClassScore array for the "all" view
  const allScores = Object.entries(result.probabilities)
    .map(([label, probability]) => ({ label, probability }))
    .sort((a, b) => b.probability - a.probability);

  return (
    <div
      className="space-y-4 animate-scale-in"
      aria-live="polite"
      aria-label={`Classification result: ${capitalizeLabel(result.predicted_class)}`}
    >
      {/* Image preview in result */}
      {objectUrl && (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)]">
          <img
            src={objectUrl}
            alt={`Classified image: ${result.filename ?? "uploaded image"}`}
            className="aspect-video w-full object-contain bg-[var(--color-background)]"
            width={640}
            height={360}
          />
        </div>
      )}

      {/* Uncertain warning */}
      {result.is_uncertain && (
        <UncertainAlert threshold={result.threshold} confidence={result.confidence} />
      )}

      {/* Main result card */}
      <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-4 card-hover">
        {/* Class label + status chip */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-[var(--color-muted)]">
              {result.is_uncertain ? "Best guess" : "Predicted class"}
            </p>
            <p className="text-2xl font-semibold text-[var(--color-text)]">
              {capitalizeLabel(result.predicted_class)}
            </p>
          </div>
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold shrink-0
              ${
                result.is_uncertain
                  ? "border-[var(--color-warning)]/30 text-[var(--color-warning)]"
                  : "border-[var(--color-success)]/30 text-[var(--color-success)]"
              }`}
            aria-label={result.is_uncertain ? "Uncertain result" : "Confident result"}
          >
            {result.is_uncertain ? "Uncertain" : "Confident"}
          </span>
        </div>

        {/* Confidence bar */}
        <ConfidenceMeter value={result.confidence} isUncertain={result.is_uncertain} />

        {/* Top 3 bars */}
        <div>
          <p className="mb-2 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">
            {result.is_uncertain ? "Best guesses" : "Top predictions"}
          </p>
          <ProbabilityBars
            predictions={result.top_predictions}
            topClass={result.predicted_class}
          />
        </div>

        {/* Expandable all probabilities */}
        <button
          onClick={() => setShowAll((v) => !v)}
          aria-expanded={showAll}
          className="flex w-full items-center justify-between text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors pt-1 border-t border-[var(--color-border)]"
        >
          <span>All class probabilities</span>
          {showAll ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showAll && (
          <ProbabilityBars
            predictions={allScores}
            topClass={result.predicted_class}
            all
          />
        )}
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="flex items-center gap-1 text-xs text-[var(--color-muted)]">
          <Clock size={12} aria-hidden="true" />
          {formatMs(durationMs)}
        </span>

        <div className="flex gap-2">
          <button
            onClick={() => copyJson(result)}
            aria-label="Copy result as JSON"
            className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-2.5 py-1.5 text-xs text-[var(--color-muted)] transition-all hover:text-[var(--color-text)] hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-accent)]/5"
          >
            {copied ? (
              <Check size={12} className="text-[var(--color-success)]" />
            ) : (
              <Copy size={12} />
            )}
            {copied ? "Copied!" : "Copy JSON"}
          </button>

          {onClassifyAnother && (
            <button
              onClick={onClassifyAnother}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-2.5 py-1.5 text-xs text-[var(--color-muted)] transition-all hover:text-[var(--color-text)] hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-accent)]/5 icon-spin-hover"
            >
              <RotateCcw size={12} aria-hidden="true" />
              Classify another
            </button>
          )}
        </div>
      </div>

      {/* Calibrated confidence tooltip note */}
      <p className="text-xs text-[var(--color-muted)] leading-relaxed">
        <strong>Calibrated confidence:</strong> Scores are adjusted by temperature scaling (T={formatPercent(1/1.677, 0)} correction). A{" "}
        {formatPercent(result.confidence)} confidence means the model is correct roughly that
        often on similar images.
      </p>
    </div>
  );
}
