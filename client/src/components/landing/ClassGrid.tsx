import { sceneClasses } from "../../data/classes";

export function ClassGrid() {
  return (
    <section
      id="classes"
      className="w-full px-10 py-16"
      aria-labelledby="classes-heading"
    >
      <h2
        id="classes-heading"
        className="text-2xl font-semibold tracking-tight text-[var(--color-text)] mb-2 animate-fade-up"
      >
        Six scene categories
      </h2>
      <p className="text-[var(--color-muted)] mb-10">
        The model was trained on images from the Intel Image Classification dataset.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {sceneClasses.map(({ id, label, description, icon: Icon }) => (
          <div
            key={id}
            className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3 text-center card-hover animate-fade-up delay-150"
          >
            <div
              className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-background)] text-[var(--color-muted)]"
              aria-hidden="true"
            >
              <Icon size={20} strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-semibold text-sm text-[var(--color-text)]">{label}</p>
              <p className="mt-1 text-xs text-[var(--color-muted)] leading-relaxed line-clamp-3">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
