import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dropzone } from "../components/classify/Dropzone";
import { ImagePreview } from "../components/classify/ImagePreview";
import { ResultPanel } from "../components/classify/ResultPanel";
import { usePredict } from "../hooks/usePredict";
import { useHealth } from "../hooks/useHealth";
import { useHistory } from "../hooks/useHistory";
import { ApiError } from "../api/errors";
import { createThumbnail } from "../lib/image";
import type { PredictionResponse } from "../api/types";

type PanelState =
  | { kind: "empty" }
  | { kind: "loading" }
  | { kind: "success"; result: PredictionResponse; durationMs: number; objectUrl?: string }
  | { kind: "error"; error: ApiError | Error };

export function ClassifyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [panelState, setPanelState] = useState<PanelState>({ kind: "empty" });

  const abortRef = useRef<AbortController | null>(null);
  const { mutateAsync: predict, isPending } = usePredict();
  const { status } = useHealth();
  const { addEntry } = useHistory();

  // Create/revoke object URL when file changes
  useEffect(() => {
    if (!file) {
      setObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleFileSelected(f: File) {
    setFile(f);
    setPanelState({ kind: "empty" });
  }

  function handleRemove() {
    setFile(null);
    setObjectUrl(null);
    setPanelState({ kind: "empty" });
  }

  async function handleClassify() {
    if (!file) return;

    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setPanelState({ kind: "loading" });

    try {
      const { response, durationMs } = await predict({ file, signal: controller.signal });

      setPanelState({
        kind: "success",
        result: response,
        durationMs,
        objectUrl: objectUrl ?? undefined,
      });

      // Persist to history
      try {
        const thumbnail = await createThumbnail(file, 96);
        addEntry({
          filename: file.name,
          thumbnail,
          prediction: response,
          durationMs,
          timestamp: Date.now(),
        });
      } catch {
        // Thumbnail failure should not break the flow
      }
    } catch (err) {
      if (err instanceof ApiError && err.kind === "cancelled") return;
      setPanelState({ kind: "error", error: err instanceof Error ? err : new Error(String(err)) });
    }
  }

  function handleClassifyAnother() {
    setFile(null);
    setObjectUrl(null);
    setPanelState({ kind: "empty" });
  }

  const classifyDisabled = !file || isPending || status === "offline";

  return (
    <div>
      <h1 className="text-xl font-semibold text-[var(--color-text)] mb-1">Classify</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">
        Upload an image to identify its scene category.
      </p>

      {status === "offline" && (
        <div
          role="alert"
          className="mb-4 rounded-[var(--radius-card)] border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/8 px-4 py-3 text-sm text-[var(--color-warning)]"
        >
          The backend is offline. Classification is unavailable until the server is reachable.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: input */}
        <section aria-label="Image upload">
          <div className="space-y-4">
            {file && objectUrl ? (
              <ImagePreview
                file={file}
                objectUrl={objectUrl}
                onReplace={handleRemove}
                onRemove={handleRemove}
                disabled={isPending}
              />
            ) : (
              <Dropzone onFileSelected={handleFileSelected} disabled={isPending} />
            )}

            <button
              id="classify-btn"
              onClick={handleClassify}
              disabled={classifyDisabled}
              aria-label={isPending ? "Classifying image..." : "Classify image"}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--color-accent-fg)] transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  Classifying...
                </>
              ) : (
                "Classify"
              )}
            </button>

            {isPending && (
              <button
                onClick={() => abortRef.current?.abort()}
                className="w-full text-center text-xs text-[var(--color-muted)] hover:text-[var(--color-danger)] transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </section>

        {/* Right: result */}
        <section aria-label="Classification result">
          <ResultPanel
            state={panelState}
            onClassifyAnother={handleClassifyAnother}
            onRetry={handleClassify}
          />
        </section>
      </div>
    </div>
  );
}
