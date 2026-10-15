/**
 * Tests for the useTheme hook
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../hooks/useTheme';

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset html class
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = '';
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('defaults to system theme when nothing is stored', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('system');
  });

  it('reads a stored light theme', () => {
    localStorage.setItem('scenesense:theme', 'light');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
  });

  it('reads a stored dark theme', () => {
    localStorage.setItem('scenesense:theme', 'dark');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
  });

  it('persists the theme selection to localStorage', () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.setTheme('dark');
    });
    expect(localStorage.getItem('scenesense:theme')).toBe('dark');
  });

  it('applies the dark class to <html> when switching to dark', () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.setTheme('dark');
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes the dark class from <html> when switching to light', () => {
    document.documentElement.classList.add('dark');
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.setTheme('light');
    });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('persists across hook re-mounts', () => {
    const { result: r1 } = renderHook(() => useTheme());
    act(() => {
      r1.current.setTheme('dark');
    });

    const { result: r2 } = renderHook(() => useTheme());
    expect(r2.current.theme).toBe('dark');
  });
});
