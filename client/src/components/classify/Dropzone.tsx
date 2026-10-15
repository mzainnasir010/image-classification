import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon, AlertCircle } from "lucide-react";
import { env } from "../../config/env";
import { validateFile } from "../../lib/validateFile";
import { formatBytes } from "../../lib/format";
import { cn } from "../../lib/utils";

interface DropzoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export function Dropzone({ onFileSelected, disabled = false }: DropzoneProps) {
  const [error, setError] = useState<string | null>(null);

  // Handle paste from clipboard
  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      const item = Array.from(e.clipboardData?.items ?? []).find(
        (i) => i.kind === "file"
      );
      if (!item) return;
      const file = item.getAsFile();
      if (!file) return;
      handleFile(file);
    }
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFile(file: File) {
    const result = validateFile(file);
    if (!result.valid) {
      setError(result.error ?? "Invalid file.");
      return;
    }
    setError(null);
    onFileSelected(file);
  }

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) handleFile(accepted[0]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: Object.fromEntries(env.VITE_ALLOWED_MIME.map((m) => [m, []])),
    maxFiles: 1,
    disabled,
    noClick: disabled,
  });

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border-2 border-dashed p-10 text-center transition-all duration-200 cursor-pointer",
          isDragActive
            ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5"
            : "border-[var(--color-border)] hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-accent)]/3",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        aria-label="Drop zone: upload an image to classify"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            (e.currentTarget.querySelector("input") as HTMLInputElement | null)?.click();
          }
        }}
      >
        <input {...getInputProps()} aria-label="File input" />

        <div
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full transition-all duration-200",
            isDragActive
              ? "bg-[var(--color-accent)] text-[var(--color-accent-fg)]"
              : "bg-[var(--color-border)] text-[var(--color-muted)]"
          )}
          aria-hidden="true"
        >
          {isDragActive ? <ImageIcon size={24} /> : <Upload size={24} />}
        </div>

        <div>
          <p className="font-medium text-[var(--color-text)]">
            {isDragActive ? "Drop it here" : "Drag and drop, click to browse, or paste"}
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {env.VITE_ALLOWED_MIME.map((m) => m.split("/")[1].toUpperCase()).join(", ")}
            {" "}&mdash; up to {env.VITE_MAX_UPLOAD_MB} MB
          </p>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="flex items-center gap-1.5 text-sm text-[var(--color-danger)]"
        >
          <AlertCircle size={14} aria-hidden="true" />
          {error}
        </p>
      )}

      <p className="text-xs text-[var(--color-muted)]">
        You can also paste an image from your clipboard ({formatBytes(env.VITE_MAX_UPLOAD_MB * 1024 * 1024)} max).
      </p>
    </div>
  );
}
