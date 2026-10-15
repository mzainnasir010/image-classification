import { useEffect, useRef, useState } from "react";
import { X, RefreshCw } from "lucide-react";
import { formatBytes } from "../../lib/format";
import { getImageDimensions } from "../../lib/image";

interface ImagePreviewProps {
  file: File;
  objectUrl: string;
  onReplace: () => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function ImagePreview({
  file,
  objectUrl,
  onReplace,
  onRemove,
  disabled,
}: ImagePreviewProps) {
  const [dims, setDims] = useState<{ width: number; height: number } | null>(null);
  const prevUrl = useRef<string>("");

  useEffect(() => {
    getImageDimensions(file)
      .then(setDims)
      .catch(() => setDims(null));
  }, [file]);

  // Revoke previous object URL to avoid memory leaks
  useEffect(() => {
    const prev = prevUrl.current;
    prevUrl.current = objectUrl;
    return () => {
      if (prev && prev !== objectUrl) URL.revokeObjectURL(prev);
    };
  }, [objectUrl]);

  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* Image */}
      <div className="relative aspect-video bg-[var(--color-background)]">
        <img
          src={objectUrl}
          alt={`Preview of ${file.name}`}
          className="h-full w-full object-contain"
          width={640}
          height={360}
        />
      </div>

      {/* Metadata + actions */}
      <div className="flex items-center justify-between gap-3 px-3 py-2 border-t border-[var(--color-border)]">
        <div className="min-w-0">
          <p
            className="truncate text-sm font-medium text-[var(--color-text)]"
            title={file.name}
          >
            {file.name}
          </p>
          <p className="text-xs text-[var(--color-muted)]">
            {formatBytes(file.size)}
            {dims && ` · ${dims.width}×${dims.height}px`}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={onReplace}
            disabled={disabled}
            aria-label="Replace image"
            title="Replace"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--color-border)] text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)] disabled:opacity-50"
          >
            <RefreshCw size={13} />
          </button>
          <button
            onClick={onRemove}
            disabled={disabled}
            aria-label="Remove image"
            title="Remove"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--color-border)] text-[var(--color-muted)] transition-colors hover:text-[var(--color-danger)] disabled:opacity-50"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
