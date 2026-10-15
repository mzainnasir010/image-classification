import { features } from "../../data/features";

export function FeatureGrid() {
  return (
    <section
      id="features"
      className="w-full px-10 py-16"
      aria-labelledby="features-heading"
    >
      <h2
        id="features-heading"
        className="text-2xl font-semibold tracking-tight text-[var(--color-text)] mb-2 animate-fade-up"
      >
        What makes it different
      </h2>
      <p className="text-[var(--color-muted)] mb-10 animate-fade-up delay-75">
        Built to be honest about what it knows and transparent about uncertainty.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ id, title, description, icon: Icon }) => (
          <div
            key={id}
            className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-3 card-hover animate-fade-up delay-150"
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
              aria-hidden="true"
            >
              <Icon size={18} strokeWidth={2} />
            </div>
            <div>
              <p className="font-semibold text-[var(--color-text)]">{title}</p>
              <p className="mt-1 text-sm text-[var(--color-muted)] leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
