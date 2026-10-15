import { AlertCircle, WifiOff, RefreshCw } from "lucide-react";
import { ApiError, apiErrorMessage } from "../../api/errors";
import { env } from "../../config/env";

interface ErrorAlertProps {
  error: ApiError | Error;
  onRetry?: () => void;
}

export function ErrorAlert({ error, onRetry }: ErrorAlertProps) {
  const isApiError = error instanceof ApiError;
  const message = isApiError
    ? apiErrorMessage(error, env.VITE_MAX_UPLOAD_MB)
    : "An unexpected error occurred.";
  const isNetwork = isApiError && error.kind === "network";

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/8 px-4 py-3"
    >
      <span
        className="mt-0.5 shrink-0 text-[var(--color-danger)]"
        aria-hidden="true"
      >
        {isNetwork ? <WifiOff size={18} /> : <AlertCircle size={18} />}
      </span>
      <div className="flex-1">
        <p className="font-semibold text-[var(--color-danger)]">Classification failed</p>
        <p className="mt-0.5 text-sm text-[var(--color-muted)]">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent)] hover:underline"
          >
            <RefreshCw size={13} aria-hidden="true" />
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
