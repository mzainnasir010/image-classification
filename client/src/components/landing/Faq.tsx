import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { faqItems } from '../../data/faq';

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[var(--color-border)] last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:text-[var(--color-text)]"
      >
        <span className="font-medium text-sm text-[var(--color-text)]">{question}</span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`shrink-0 text-[var(--color-muted)] transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="pb-4 text-sm text-[var(--color-muted)] leading-relaxed pr-8">
          {answer}
        </div>
      )}
    </div>
  );
}

export function Faq() {
  return (
    <section
      id="faq"
      className="w-full px-10 py-16"
      aria-labelledby="faq-heading"
    >
      <h2
        id="faq-heading"
        className="text-2xl font-semibold tracking-tight text-[var(--color-text)] mb-2 animate-fade-up"
      >
        Frequently asked questions
      </h2>
      <p className="text-[var(--color-muted)] mb-8">
        Everything you need to know about SceneSense.
      </p>

      <div className="w-full divide-y divide-[var(--color-border)] rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 card-hover animate-fade-up delay-150">
        {faqItems.map((item) => (
          <FaqItem key={item.question} {...item} />
        ))}
      </div>
    </section>
  );
}
