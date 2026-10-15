import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { env } from "../config/env";
import { useHealth } from "../hooks/useHealth";
import { fetchHealth } from "../api/endpoints";
import { capitalizeLabel } from "../lib/format";

const BASE = `${env.VITE_API_BASE_URL}${env.VITE_API_PREFIX}`;

interface Endpoint {
  method: "GET" | "POST";
  path: string;
  description: string;
  requestNote?: string;
  responseExample: string;
  errorTable: Array<{ status: string; meaning: string }>;
}

const endpoints: Endpoint[] = [
  {
    method: "GET",
    path: "/health",
    description: "Liveness and model-loaded check. Safe to call frequently.",
    responseExample: JSON.stringify({ status: "ok", model_loaded: true }, null, 2),
    errorTable: [],
  },
  {
    method: "GET",
    path: "/model-info",
    description: "Returns classes, image size, temperature, threshold, and test metrics. Returns 503 if the model is not yet loaded.",
    responseExample: JSON.stringify({
      classes: ["buildings", "forest", "glacier", "mountain", "sea", "street"],
      image_size: 224,
      temperature: 1.677,
      uncertain_threshold: 0.7,
      test_accuracy: 0.9428,
      test_macro_f1: 0.9437,
    }, null, 2),
    errorTable: [
      { status: "503", meaning: "Model is still loading" },
    ],
  },
  {
    method: "POST",
    path: "/predict",
    description: "Classify a single image. Body is multipart/form-data with one field named 'file'.",
    requestNote: "Content-Type: multipart/form-data\nField: file (JPEG, PNG or WebP, max 10 MB)",
    responseExample: JSON.stringify({
      filename: "photo.jpg",
      predicted_class: "forest",
      confidence: 0.9621,
      is_uncertain: false,
      outcome: "forest",
      threshold: 0.7,
      top_predictions: [
        { label: "forest", probability: 0.9621 },
        { label: "mountain", probability: 0.023 },
        { label: "glacier", probability: 0.011 },
      ],
      probabilities: {
        buildings: 0.001,
        forest: 0.9621,
        glacier: 0.011,
        mountain: 0.023,
        sea: 0.002,
        street: 0.001,
      },
    }, null, 2),
    errorTable: [
      { status: "400", meaning: "Empty file or unreadable image" },
      { status: "413", meaning: "File larger than 10 MB" },
      { status: "415", meaning: "Not JPEG, PNG or WebP" },
      { status: "503", meaning: "Model not loaded yet" },
    ],
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* */ }
  }
  return (
    <button
      onClick={copy}
      aria-label="Copy to clipboard"
      className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
    >
      {copied ? <Check size={13} className="text-[var(--color-success)]" /> : <Copy size={13} />}
    </button>
  );
}

function CodeBlock({ children, lang = "" }: { children: string; lang?: string }) {
  return (
    <div className="relative">
      <pre
        className="overflow-x-auto rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] p-3 text-xs font-mono text-[var(--color-text)]"
        aria-label={lang ? `${lang} code` : "Code"}
      >
        <code>{children}</code>
      </pre>
      <CopyButton text={children} />
    </div>
  );
}

export function ApiDocsPage() {
  const { status } = useHealth();
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  async function testConnection() {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await fetchHealth();
      setTestResult(`Status: ${result.status}, model_loaded: ${result.model_loaded}`);
    } catch {
      setTestResult("Connection failed. Backend is not reachable.");
    } finally {
      setTesting(false);
    }
  }

  const curlExample = `curl -X POST ${BASE}/predict \\
  -F "file=@/path/to/your/image.jpg"`;

  const fetchExample = `const form = new FormData();
form.append("file", imageFile);

const res = await fetch("${BASE}/predict", {
  method: "POST",
  body: form,
});
const data = await res.json();
console.log(data.predicted_class, data.confidence);`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-[var(--color-text)] mb-1">API Reference</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Base URL: <code className="font-mono text-[var(--color-accent)]">{BASE}</code>
        </p>
      </div>

      {/* Test connection */}
      <section aria-label="Connection test">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            id="test-connection-btn"
            onClick={testConnection}
            disabled={testing}
            className="flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-sm font-medium text-[var(--color-accent-fg)] transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {testing ? "Testing..." : "Test connection"}
            <ExternalLink size={13} aria-hidden="true" />
          </button>
          {testResult && (
            <span
              role="status"
              className={`text-sm ${
                testResult.includes("failed")
                  ? "text-[var(--color-danger)]"
                  : "text-[var(--color-success)]"
              }`}
            >
              {testResult}
            </span>
          )}
          <span className="text-xs text-[var(--color-muted)]">
            Current status: <strong>{capitalizeLabel(status)}</strong>
          </span>
        </div>
      </section>

      {/* Endpoints */}
      {endpoints.map((ep) => (
        <section
          key={ep.path}
          className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden"
          aria-label={`${ep.method} ${ep.path}`}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
            <span
              className={`rounded px-2 py-0.5 text-xs font-bold ${
                ep.method === "POST"
                  ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)]"
                  : "bg-[var(--color-success)]/15 text-[var(--color-success)]"
              }`}
            >
              {ep.method}
            </span>
            <code className="font-mono text-sm text-[var(--color-text)]">
              {BASE}{ep.path}
            </code>
          </div>

          <div className="p-4 space-y-4">
            <p className="text-sm text-[var(--color-muted)]">{ep.description}</p>

            {ep.requestNote && (
              <div>
                <p className="mb-1 text-xs font-medium text-[var(--color-muted)]">Request</p>
                <CodeBlock lang="text">{ep.requestNote}</CodeBlock>
              </div>
            )}

            <div>
              <p className="mb-1 text-xs font-medium text-[var(--color-muted)]">Response (200 OK)</p>
              <CodeBlock lang="json">{ep.responseExample}</CodeBlock>
            </div>

            {ep.errorTable.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-[var(--color-muted)]">Errors</p>
                <table className="w-full text-xs" aria-label="Error codes">
                  <thead>
                    <tr className="text-left text-[var(--color-muted)]">
                      <th scope="col" className="pb-1 pr-4 font-medium">Status</th>
                      <th scope="col" className="pb-1 font-medium">Meaning</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {ep.errorTable.map(({ status, meaning }) => (
                      <tr key={status}>
                        <td className="py-1 pr-4 font-mono text-[var(--color-danger)]">{status}</td>
                        <td className="py-1 text-[var(--color-muted)]">{meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      ))}

      {/* Code snippets */}
      <section aria-label="Code examples">
        <h2 className="text-base font-semibold text-[var(--color-text)] mb-3">Examples</h2>
        <div className="space-y-4">
          <div>
            <p className="mb-1 text-xs font-medium text-[var(--color-muted)]">curl</p>
            <CodeBlock lang="bash">{curlExample}</CodeBlock>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-[var(--color-muted)]">fetch (browser)</p>
            <CodeBlock lang="javascript">{fetchExample}</CodeBlock>
          </div>
        </div>
      </section>

      {/* Docs link */}
      <p className="text-sm text-[var(--color-muted)]">
        Interactive Swagger UI is available at{" "}
        <a
          href={`${env.VITE_API_BASE_URL}/docs`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-accent)] hover:underline"
        >
          {env.VITE_API_BASE_URL}/docs
        </a>
        .
      </p>
    </div>
  );
}
