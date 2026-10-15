import { Upload, Cpu, FileCheck } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Upload an image",
    description: "Drop a JPEG, PNG or WebP image. The file is processed in your browser before being sent.",
    icon: Upload,
  },
  {
    number: "02",
    title: "The model analyses it",
    description: "A fine-tuned ResNet50 backbone resizes the image to 224×224 and produces class probabilities with temperature-scaled calibration.",
    icon: Cpu,
  },
  {
    number: "03",
    title: "Read the class",
    description: "You get the predicted scene, a calibrated confidence score, and the top-3 classes. If confidence is below 70%, the result is flagged as uncertain.",
    icon: FileCheck,
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-[var(--color-surface)] border-y border-[var(--color-border)] py-16"
      aria-labelledby="how-heading"
    >
      <div className="w-full px-10">
        <h2
          id="how-heading"
          className="text-2xl font-semibold tracking-tight text-[var(--color-text)] mb-10 animate-fade-up"
        >
          How it works
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map(({ number, title, description, icon: Icon }) => (
            <div key={number} className={`flex gap-4 animate-fade-up delay-${['150','225','300'][steps.indexOf(steps.find(s => s.number === number)!)]}`}>
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                aria-hidden="true"
              >
                <Icon size={18} />
              </div>
              <div className="space-y-1.5">
                <p className="font-semibold text-[var(--color-text)]">
                  <span className="font-mono text-xs text-[var(--color-muted)] mr-2">{number}</span>
                  {title}
                </p>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
