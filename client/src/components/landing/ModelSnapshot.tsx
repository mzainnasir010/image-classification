import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { trainingConfig } from "../../data/modelMetrics";

export function ModelSnapshot() {
  return (
    <section
      id="model-snapshot"
      className="bg-[var(--color-surface)] border-y border-[var(--color-border)] py-16"
      aria-labelledby="model-snapshot-heading"
    >
      <div className="w-full px-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3 animate-slide-left">
            <h2
              id="model-snapshot-heading"
              className="text-2xl font-semibold tracking-tight text-[var(--color-text)]"
            >
              ResNet50, calibrated for honesty
            </h2>
            <p className="text-[var(--color-muted)] leading-relaxed">
              Fine-tuned on{" "}
              <strong className="text-[var(--color-text)]">
                {trainingConfig.datasetSize.toLocaleString()} images
              </strong>{" "}
              from the Intel Image Classification dataset. Temperature scaling (T=1.677) reduces
              the expected calibration error from 0.0284 to 0.0135.
            </p>
            <Link
              to="/app/model"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent)] hover:underline"
            >
              Full model details
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0 animate-slide-right">
            {[
              { value: "94.28%", label: "Test accuracy" },
              { value: "0.9437", label: "Macro F1" },
              { value: "53% less", label: "Calibration error" },
              { value: "17K", label: "Training images" },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-4 space-y-1 text-center card-hover"
              >
                <p className="text-xl font-semibold text-[var(--color-text)]">{value}</p>
                <p className="text-xs text-[var(--color-muted)]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
