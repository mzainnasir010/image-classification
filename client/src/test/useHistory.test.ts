/**
 * Tests for the useHistory hook
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHistory } from '../hooks/useHistory';
import type { PredictionResponse } from '../api/types';

const STORAGE_KEY = 'scenesense:history';
const MAX_ENTRIES = 20;

const mockPrediction: PredictionResponse = {
  filename: 'test.jpg',
  predicted_class: 'forest',
  confidence: 0.96,
  is_uncertain: false,
  outcome: 'forest',
  threshold: 0.7,
  top_predictions: [{ label: 'forest', probability: 0.96 }],
  probabilities: {
    buildings: 0.01,
    forest: 0.96,
    glacier: 0.01,
    mountain: 0.01,
    sea: 0.005,
    street: 0.005,
  },
};

function makeEntry(filename: string) {
  return {
    filename,
    thumbnail: null,
    prediction: mockPrediction,
    durationMs: 300,
    timestamp: Date.now(),
  };
}

describe('useHistory', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with an empty list when localStorage is empty', () => {
    const { result } = renderHook(() => useHistory());
    expect(result.current.entries).toHaveLength(0);
  });

  it('adds an entry to the list', () => {
    const { result } = renderHook(() => useHistory());
    act(() => {
      result.current.addEntry(makeEntry('photo.jpg'));
    });
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].filename).toBe('photo.jpg');
  });

  it('orders newest entries first', () => {
    const { result } = renderHook(() => useHistory());
    act(() => {
      result.current.addEntry(makeEntry('first.jpg'));
    });
    act(() => {
      result.current.addEntry(makeEntry('second.jpg'));
    });
    expect(result.current.entries[0].filename).toBe('second.jpg');
    expect(result.current.entries[1].filename).toBe('first.jpg');
  });

  it(`caps at ${MAX_ENTRIES} entries`, () => {
    const { result } = renderHook(() => useHistory());
    act(() => {
      for (let i = 0; i < MAX_ENTRIES + 5; i++) {
        result.current.addEntry(makeEntry(`img-${i}.jpg`));
      }
    });
    expect(result.current.entries).toHaveLength(MAX_ENTRIES);
  });

  it('persists entries to localStorage', () => {
    const { result } = renderHook(() => useHistory());
    act(() => {
      result.current.addEntry(makeEntry('stored.jpg'));
    });
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    expect(stored).toHaveLength(1);
  });

  it('clears all entries and removes from localStorage', () => {
    const { result } = renderHook(() => useHistory());
    act(() => {
      result.current.addEntry(makeEntry('a.jpg'));
      result.current.addEntry(makeEntry('b.jpg'));
    });
    act(() => {
      result.current.clearHistory();
    });
    expect(result.current.entries).toHaveLength(0);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('survives a corrupted localStorage value', () => {
    localStorage.setItem(STORAGE_KEY, 'NOT_VALID_JSON{{{');
    const { result } = renderHook(() => useHistory());
    expect(result.current.entries).toHaveLength(0);
    // Can still add entries without throwing
    act(() => {
      result.current.addEntry(makeEntry('after-corrupt.jpg'));
    });
    expect(result.current.entries).toHaveLength(1);
  });
});
