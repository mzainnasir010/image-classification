import { ScanSearch } from "lucide-react";
import { env } from "../../config/env";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { icon: 16, text: "text-sm" },
  md: { icon: 20, text: "text-base" },
  lg: { icon: 24, text: "text-xl" },
};

export function Logo({ className = "", size = "md" }: LogoProps) {
  const { icon: iconSize, text } = sizes[size];

  return (
    <span
      className={`inline-flex items-center gap-2 font-semibold tracking-tight ${className}`}
      aria-label={env.VITE_APP_NAME}
    >
      <span
        className="flex items-center justify-center rounded-lg bg-[var(--color-accent)] text-[var(--color-accent-fg)]"
        style={{ width: iconSize + 10, height: iconSize + 10 }}
        aria-hidden="true"
      >
        <ScanSearch size={iconSize} strokeWidth={2} />
      </span>
      <span className={`${text} text-[var(--color-text)]`}>{env.VITE_APP_NAME}</span>
    </span>
  );
}
