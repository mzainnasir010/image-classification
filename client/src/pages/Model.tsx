import { useModelInfo } from "../hooks/useModelInfo";
import {
  perClassF1,
  confusionMatrix,
  CLASSES,
  coverageAccuracy,
  calibration,
  trainingConfig,
} from "../data/modelMetrics";
import { capitalizeLabel, formatPercent } from "../lib/format";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine,
  Legend,
} from "recharts";

function KpiCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-1">
      <p className="text-xs text-[var(--color-muted)]">{label}</p>
      <p className="text-2xl font-semibold tabular-nums text-[var(--color-text)]">{value}</p>
      {sub && <p className="text-xs text-[var(--color-muted)]">{sub}</p>}
    </div>
  );
}

function KpiSkeleton() {
  return <div className="skeleton h-24 rounded-[var(--radius-card)]" />;
}

export function ModelPage() {
  const { data: modelInfo, isLoading, isError } = useModelInfo();

  const f1ChartData = perClassF1.map((d) => ({
    name: d.label,
    F1: d.f1,
    fill: d.highlight ? "var(--color-warning)" : "var(--color-accent)",
  }));

  const coverageData = coverageAccuracy.map((d) => ({
    threshold: d.threshold.toFixed(2),
    Coverage: +(d.coverage * 100).toFixed(1),
    Accuracy: +(d.accuracy * 100).toFixed(1),
  }));

  // Heatmap cell colour: scale 0–500
  function heatmapColor(value: number, rowSum: number) {
    const ratio = rowSum > 0 ? value / rowSum : 0;
    if (ratio > 0.8) return "bg-[var(--color-accent)]/80 text-[var(--color-accent-fg)]";
    if (ratio > 0.4) return "bg-[var(--color-accent)]/40";
    if (ratio > 0.1) return "bg-[var(--color-accent)]/15";
    return "";
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-[var(--color-text)] mb-1">Model</h1>
        <p className="text-sm text-[var(--color-muted)]">
          ResNet50 fine-tuned on the Intel Image Classification dataset.
        </p>
      </div>

      {/* KPI cards */}
      <section aria-label="Model KPIs">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {isLoading ? (
            <>
              <KpiSkeleton /><KpiSkeleton /><KpiSkeleton /><KpiSkeleton />
            </>
          ) : isError || !modelInfo ? (
            <p className="col-span-4 text-sm text-[var(--color-danger)]">
              Could not load live model metrics.
            </p>
          ) : (
            <>
              <KpiCard
                label="Test accuracy"
                value={modelInfo.test_accuracy != null ? formatPercent(modelInfo.test_accuracy) : "N/A"}
                sub="Held-out test set"
              />
              <KpiCard
                label="Macro F1"
                value={modelInfo.test_macro_f1 != null ? modelInfo.test_macro_f1.toFixed(4) : "N/A"}
                sub="All 6 classes"
              />
              <KpiCard
                label="Temperature"
                value={modelInfo.temperature.toFixed(3)}
                sub="Calibration scaling"
              />
              <KpiCard
                label="Uncertain threshold"
                value={formatPercent(modelInfo.uncertain_threshold)}
                sub="Below = uncertain"
              />
            </>
          )}
        </div>
      </section>

      {/* Per-class F1 chart */}
      <section aria-label="Per-class F1 scores">
        <h2 className="text-base font-semibold text-[var(--color-text)] mb-3">Per-class F1</h2>
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div
            role="img"
            aria-label="Bar chart: per-class F1 scores. Forest 0.985, Sea 0.970, Street 0.952, Buildings 0.949, Mountain 0.907 (weak), Glacier 0.898 (weak)"
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={f1ChartData} layout="vertical" margin={{ left: 8, right: 24 }}>
                <CartesianGrid
                  horizontal={false}
                  stroke="var(--color-border)"
                  strokeDasharray="3 3"
                />
                <XAxis
                  type="number"
                  domain={[0.85, 1]}
                  tickFormatter={(v: number) => v.toFixed(2)}
                  tick={{ fontSize: 11, fill: "var(--color-muted)" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={72}
                  tick={{ fontSize: 12, fill: "var(--color-text)" }}
                />
                <Tooltip
                  formatter={(v) => [typeof v === 'number' ? v.toFixed(4) : v, "F1"]}
                  contentStyle={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="F1" radius={[0, 4, 4, 0]}>
                  {f1ChartData.map((entry, i) => (
                    <rect key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Orange bars indicate the two weakest classes (Mountain 0.907, Glacier 0.898).
          </p>
        </div>
      </section>

      {/* Confusion matrix */}
      <section aria-label="Confusion matrix">
        <h2 className="text-base font-semibold text-[var(--color-text)] mb-3">Confusion matrix (test set)</h2>
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border)]">
          <table
            className="w-full text-xs border-collapse"
            aria-label="Confusion matrix: rows are actual class, columns are predicted class"
          >
            <thead>
              <tr className="bg-[var(--color-surface)]">
                <th scope="col" className="p-2 text-left text-[var(--color-muted)] font-medium">Actual ↓ / Pred →</th>
                {CLASSES.map((c) => (
                  <th key={c} scope="col" className="p-2 text-center font-medium text-[var(--color-text)]">
                    {capitalizeLabel(c).slice(0, 4)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {confusionMatrix.map((row, i) => {
                const rowSum = row.reduce((a, b) => a + b, 0);
                return (
                  <tr key={CLASSES[i]} className="border-t border-[var(--color-border)]">
                    <th scope="row" className="p-2 text-left font-medium text-[var(--color-text)] bg-[var(--color-surface)] whitespace-nowrap">
                      {capitalizeLabel(CLASSES[i])}
                    </th>
                    {row.map((val, j) => (
                      <td
                        key={j}
                        className={`p-2 text-center tabular-nums ${heatmapColor(val, rowSum)}`}
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Coverage vs Accuracy chart */}
      <section aria-label="Coverage vs accuracy tradeoff">
        <h2 className="text-base font-semibold text-[var(--color-text)] mb-3">
          Coverage vs accuracy by threshold
        </h2>
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div
            role="img"
            aria-label="Line chart: as confidence threshold rises from 0.50 to 0.95, coverage drops from 99% to 75% while accuracy on answered samples rises from 94.7% to 98.8%. The app uses the 0.70 threshold."
          >
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={coverageData} margin={{ right: 8 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                <XAxis dataKey="threshold" tick={{ fontSize: 11, fill: "var(--color-muted)" }} label={{ value: "Threshold", position: "insideBottom", offset: -2, fontSize: 11, fill: "var(--color-muted)" }} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: "var(--color-muted)" }} unit="%" />
                <Tooltip
                  formatter={(v, name) => [typeof v === 'number' ? `${v}%` : `${v}%`, name]}
                  contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine x="0.70" stroke="var(--color-accent)" strokeDasharray="4 2" label={{ value: "Used", position: "top", fontSize: 11, fill: "var(--color-accent)" }} />
                <Line type="monotone" dataKey="Coverage" stroke="var(--color-muted)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Accuracy" stroke="var(--color-accent)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Calibration card */}
      <section aria-label="Calibration metrics">
        <h2 className="text-base font-semibold text-[var(--color-text)] mb-3">Calibration (temperature scaling)</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiCard label="ECE before" value={calibration.eceBefore.toFixed(4)} sub="Expected calibration error" />
          <KpiCard label="ECE after" value={calibration.eceAfter.toFixed(4)} sub="53% reduction" />
          <KpiCard label="NLL before" value={calibration.nllBefore.toFixed(4)} sub="Negative log-likelihood" />
          <KpiCard label="NLL after" value={calibration.nllAfter.toFixed(4)} sub="18% reduction" />
        </div>
      </section>

      {/* Training summary */}
      <section aria-label="Training configuration">
        <h2 className="text-base font-semibold text-[var(--color-text)] mb-3">Training summary</h2>
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)]">
          <table className="w-full text-sm" aria-label="Training configuration table">
            <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)]">
              {[
                ["Backbone", trainingConfig.backbone],
                ["Fine-tuned layers", trainingConfig.fineTunedLayers],
                ["Optimizer", trainingConfig.optimizer],
                ["Learning rates", trainingConfig.learningRates.join(" → ")],
                ["Batch size", String(trainingConfig.batchSize)],
                ["Early stopping", `On ${trainingConfig.earlyStopping}`],
                ["Best epoch", String(trainingConfig.bestEpoch)],
                ["Dataset size", `${trainingConfig.datasetSize.toLocaleString()} images (after cleaning)`],
              ].map(([key, val]) => (
                <tr key={key}>
                  <td className="px-4 py-2.5 text-xs font-medium text-[var(--color-muted)] w-40">{key}</td>
                  <td className="px-4 py-2.5 text-sm text-[var(--color-text)]">{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Limitations */}
      <section aria-label="Model limitations">
        <h2 className="text-base font-semibold text-[var(--color-text)] mb-3">Limitations</h2>
        <div className="rounded-[var(--radius-card)] border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5 px-4 py-3">
          <ul className="space-y-1.5 text-sm text-[var(--color-muted)]">
            <li>Glacier and mountain are frequently confused with each other (see confusion matrix).</li>
            <li>Buildings and street scenes overlap, especially in dense urban images.</li>
            <li>Small or low-resolution images reduce accuracy.</li>
            <li>Images containing multiple scenes (e.g. a mountain by the sea) may produce uncertain results.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
