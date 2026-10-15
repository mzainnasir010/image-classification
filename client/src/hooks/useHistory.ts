import { useState, useCallback } from "react";
import type { PredictionResponse } from "../api/types";

const STORAGE_KEY = "scenesense:history";
const MAX_ENTRIES = 20;

export interface HistoryEntry {
  id: string;
  filename: string | null;
  thumbnail: string | null; // base64 data URL, ~96px wide
  prediction: PredictionResponse;
  durationMs: number;
  timestamp: number; // Date.now()
}

function readStorage(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

function writeStorage(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage quota or disabled — fail silently
  }
}

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>(readStorage);

  const addEntry = useCallback((entry: Omit<HistoryEntry, "id">) => {
    setEntries((prev) => {
      const next = [
        { ...entry, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` },
        ...prev,
      ].slice(0, MAX_ENTRIES);
      writeStorage(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setEntries([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { entries, addEntry, clearHistory };
}
