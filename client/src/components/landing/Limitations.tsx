import { AlertTriangle } from "lucide-react";

export function Limitations() {
  return (
    <section
      className="w-full px-10 py-16"
      aria-labelledby="limitations-heading"
    >
      <div className="rounded-[var(--radius-card)] border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle
            size={18}
            className="text-[var(--color-warning)] shrink-0"
            aria-hidden="true"
          />
          <h2
            id="limitations-heading"
            className="font-semibold text-[var(--color-text)]"
          >
            Honest limitations
          </h2>
        </div>
        <ul className="space-y-2 text-sm text-[var(--color-muted)]">
          <li>
            <strong className="text-[var(--color-text)]">Glacier vs mountain confusion.</strong>{" "}
            These two classes share visual features. 37 glacier images were misclassified as
            mountain and 32 mountain images as glacier on the test set.
          </li>
          <li>
            <strong className="text-[var(--color-text)]">Buildings vs street overlap.</strong>{" "}
            Dense urban scenes with both road and buildings can confuse the classifier.
          </li>
          <li>
            <strong className="text-[var(--color-text)]">Small or low-resolution images.</strong>{" "}
            Images are resized to 224×224. Very small or heavily compressed input reduces accuracy.
          </li>
          <li>
            <strong className="text-[var(--color-text)]">Multi-scene images.</strong>{" "}
            A single photo containing a mountain reflected in the sea will produce uncertain or
            inconsistent results.
          </li>
        </ul>
      </div>
    </section>
  );
}
