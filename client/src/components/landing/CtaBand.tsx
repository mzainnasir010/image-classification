import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function CtaBand() {
  return (
    <section
      className="border-t border-[var(--color-border)] bg-[var(--color-surface)]"
      aria-labelledby="cta-heading"
    >
      <div className="w-full px-10 py-16">
        <div className="flex flex-col items-center gap-6 text-center animate-fade-up">
          <h2
            id="cta-heading"
            className="text-2xl font-semibold tracking-tight text-[var(--color-text)]"
          >
            Ready to identify your first scene?
          </h2>
          <p className="text-[var(--color-muted)] leading-relaxed">
            Upload any photo and get a calibrated classification in seconds, no account required.
          </p>
          <Link
            to="/app"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--color-accent-fg)] transition-opacity hover:opacity-90 btn-glow"
          >
            Open dashboard
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
