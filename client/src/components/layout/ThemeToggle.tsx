import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type Theme } from "../../hooks/useTheme";
import { useState, useRef, useEffect } from "react";

const options: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const current = options.find((o) => o.value === theme) ?? options[2];
  const Icon = current.icon;

  return (
    <div ref={ref} className="relative">
      <button
        id="theme-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Theme: ${current.label}. Click to change`}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
      >
        <Icon size={16} strokeWidth={2} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Theme options"
          className="absolute right-0 top-10 z-50 min-w-[120px] rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-lg"
        >
          {options.map(({ value, label, icon: OptionIcon }) => (
            <button
              key={value}
              role="menuitem"
              onClick={() => {
                setTheme(value);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors
                ${
                  theme === value
                    ? "bg-[var(--color-accent)] text-[var(--color-accent-fg)]"
                    : "text-[var(--color-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
                }`}
              aria-current={theme === value ? "true" : undefined}
            >
              <OptionIcon size={14} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
