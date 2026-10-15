import { useEffect, useState, useCallback } from "react";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "scenesense:theme";
const DEFAULT_THEME: Theme = "system";

function getSystemPreference(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme): void {
  const resolved = theme === "system" ? getSystemPreference() : theme;
  const html = document.documentElement;
  html.classList.toggle("dark", resolved === "dark");
  html.style.colorScheme = resolved;
}

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {
    // localStorage disabled
  }
  return DEFAULT_THEME;
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readStoredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Listen for system preference changes while in System mode
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setAndPersist = useCallback((next: Theme) => {
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  return { theme, setTheme: setAndPersist };
}
