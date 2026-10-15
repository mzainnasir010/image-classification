import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, ExternalLink } from "lucide-react";
import { links } from "../../config/links";
import { sceneClasses } from "../../data/classes";

// Duplicate chips for seamless infinite scroll
const chips = [...sceneClasses, ...sceneClasses];

const stats = [
  { value: "94.3%", label: "Test accuracy" },
  { value: "6",     label: "Scene classes" },
  { value: "17K",   label: "Training images" },
  { value: "53%",   label: "Calibration improvement" },
];

export function Hero() {
  return (
    <section
      className="relative w-full overflow-hidden px-10 pb-20 pt-24 md:pt-32 md:pb-28"
      aria-label="Hero"
    >
      {/* ── Ambient background blobs ─────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        {/* Top-left glow */}
        <div
          className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-accent), transparent 70%)" }}
        />
        {/* Bottom-right glow */}
        <div
          className="absolute -bottom-24 -right-24 h-[400px] w-[400px] rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-accent), transparent 70%)" }}
        />
        {/* Subtle grid lines */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-text) 1px, transparent 1px), linear-gradient(90deg, var(--color-text) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* ── Badge ─────────────────────────────────────────────── */}
      <div className="flex justify-center animate-fade-up">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/8 px-3.5 py-1.5 text-xs font-semibold text-[var(--color-accent)] tracking-wide uppercase">
          <Sparkles size={11} aria-hidden="true" />
          AI-Powered Scene Classification
        </span>
      </div>

      {/* ── Headline ──────────────────────────────────────────── */}
      <div className="mx-auto mt-8 max-w-4xl text-center animate-fade-up delay-75">
        <h1 className="text-5xl font-bold tracking-tight text-[var(--color-text)] leading-[1.1] md:text-7xl">
          Identify the{" "}
          <span
            className="relative inline-block"
            style={{
              background: "linear-gradient(135deg, var(--color-accent), color-mix(in srgb, var(--color-accent) 60%, var(--color-text)))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            scene
          </span>
          <br />
          in any photo
        </h1>
      </div>

      {/* ── Subheading ────────────────────────────────────────── */}
      <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-[var(--color-muted)] leading-relaxed animate-fade-up delay-150">
        SceneSense uses a fine-tuned ResNet50 with temperature-scaled calibration to classify
        images across six natural and urban scenes — and honestly flags when it's uncertain.
      </p>

      {/* ── CTAs ──────────────────────────────────────────────── */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3 animate-fade-up delay-225">
        <Link
          to="/app"
          className="group inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--color-accent-fg)] btn-glow"
        >
          Try it now
          <ArrowRight
            size={15}
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>

        {links.github && (
          <a
            href={links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium text-[var(--color-muted)] transition-all hover:text-[var(--color-text)] hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/5"
          >
            <ExternalLink size={14} aria-hidden="true" />
            View on GitHub
          </a>
        )}
      </div>

      {/* ── Scene class chip marquee ───────────────────────────── */}
      <div
        className="relative mt-14 -mx-10 overflow-hidden animate-fade-up delay-300"
        aria-label="Supported scene classes"
      >
        {/* Left fade mask */}
        <div
          className="pointer-events-none absolute left-0 top-0 h-full w-24 z-10"
          style={{ background: "linear-gradient(to right, var(--color-background), transparent)" }}
          aria-hidden="true"
        />
        {/* Right fade mask */}
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-24 z-10"
          style={{ background: "linear-gradient(to left, var(--color-background), transparent)" }}
          aria-hidden="true"
        />

        <div className="flex gap-3 py-2 marquee-track" style={{ animationDelay: '-16s' }}>
          {chips.map(({ id, label, icon: Icon }, i) => (
            <span
              key={`${id}-${i}`}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-muted)] shadow-sm"
            >
              <Icon size={14} aria-hidden="true" className="text-[var(--color-accent)]" />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Stats bar ─────────────────────────────────────────── */}
      <div className="mx-auto mt-14 flex flex-wrap justify-center gap-x-10 gap-y-6 animate-fade-up delay-400">
        {stats.map(({ value, label }, i) => (
          <div key={label} className="flex flex-col items-center gap-1">
            {i > 0 && (
              <span
                className="absolute -left-5 top-1/2 hidden h-4 w-px -translate-y-1/2 bg-[var(--color-border)] md:block"
                aria-hidden="true"
              />
            )}
            <p className="text-2xl font-bold text-[var(--color-text)] tabular-nums">{value}</p>
            <p className="text-xs text-[var(--color-muted)]">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
