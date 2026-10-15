/**
 * Integration tests for the Classify page flow using MSW.
 *
 * Tests cover: confident result, uncertain result, 400/413/415/503 errors,
 * and network failure.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

// Mock the env module so env.ts validation doesn't fail in test environment
vi.mock('../config/env', () => ({
  env: {
    VITE_API_BASE_URL: 'http://localhost:8000',
    VITE_API_PREFIX: '/api/v1',
    VITE_REQUEST_TIMEOUT_MS: 30000,
    VITE_MAX_UPLOAD_MB: 10,
    VITE_ALLOWED_MIME: ['image/jpeg', 'image/png', 'image/webp'],
    VITE_APP_NAME: 'SceneSense',
    VITE_GITHUB_URL: '',
    VITE_HEALTH_POLL_MS: 30000,
  },
}));

// Import pages AFTER mock is set up
const { ClassifyPage } = await import('../pages/Classify');
import { server } from './handlers';
import { mockUncertainPrediction } from './handlers';

const BASE = 'http://localhost:8000/api/v1';

function makeFile(name = 'test.jpg', type = 'image/jpeg', size = 1024): File {
  const file = new File(['x'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

async function uploadAndClassify(file: File) {
  const user = userEvent.setup();
  render(<ClassifyPage />, { wrapper: Wrapper });

  // Find the hidden file input inside the dropzone
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  if (!input) throw new Error('File input not found');
  await user.upload(input, file);

  // Wait for the button to be enabled (health check might disable it initially)
  await waitFor(() => {
    const btn = screen.getByRole('button', { name: /classify/i });
    expect((btn as HTMLButtonElement).disabled).toBe(false);
  }, { timeout: 5000 });

  const btn = screen.getByRole('button', { name: /classify/i });
  await user.click(btn);
  return { user };
}

describe('Classify page — confident result', () => {
  it('shows the predicted class after classification', async () => {
    await uploadAndClassify(makeFile());
    await waitFor(() => {
      // ResultPanel shows capitalizeLabel('forest') = 'Forest' as a large heading
      // Use getAllByText to find any matching element
      const matches = screen.queryAllByText(/Forest/i);
      expect(matches.length).toBeGreaterThan(0);
    }, { timeout: 10000 });
    const chips = screen.queryAllByText(/Confident/i);
    expect(chips.length).toBeGreaterThan(0);
  }, 15000);
});

describe('Classify page — uncertain result', () => {
  it('shows the uncertain warning with the correct threshold from the response', async () => {
    server.use(
      http.post(`${BASE}/predict`, () => HttpResponse.json(mockUncertainPrediction))
    );

    await uploadAndClassify(makeFile());

    await waitFor(() => {
      // UncertainAlert shows "below the 70.0% threshold"
      expect(screen.getByText(/70\.0%/i)).toBeDefined();
    }, { timeout: 5000 });
    expect(screen.getByText('Uncertain')).toBeDefined();
  });
});

describe('Classify page — error states', () => {
  it('shows a 400 error message', async () => {
    server.use(
      http.post(`${BASE}/predict`, () =>
        HttpResponse.json({ detail: 'bad file' }, { status: 400 })
      )
    );
    await uploadAndClassify(makeFile());
    await waitFor(() => {
      expect(screen.getByText(/could not be read as an image/i)).toBeDefined();
    }, { timeout: 5000 });
  });

  it('shows a 413 error message', async () => {
    server.use(
      http.post(`${BASE}/predict`, () =>
        HttpResponse.json({ detail: 'too large' }, { status: 413 })
      )
    );
    await uploadAndClassify(makeFile());
    await waitFor(() => {
      expect(screen.getByText(/larger than/i)).toBeDefined();
    }, { timeout: 5000 });
  });

  it('shows a 415 error message', async () => {
    server.use(
      http.post(`${BASE}/predict`, () =>
        HttpResponse.json({ detail: 'bad type' }, { status: 415 })
      )
    );
    await uploadAndClassify(makeFile());
    await waitFor(() => {
      expect(screen.getByText(/JPEG, PNG and WebP/i)).toBeDefined();
    }, { timeout: 5000 });
  });

  it('shows a 503 error message', async () => {
    server.use(
      http.post(`${BASE}/predict`, () =>
        HttpResponse.json({ detail: 'model not ready' }, { status: 503 })
      )
    );
    await uploadAndClassify(makeFile());
    await waitFor(() => {
      expect(screen.getByText(/starting up/i)).toBeDefined();
    }, { timeout: 5000 });
  });

  it('shows a network error message with retry button', async () => {
    server.use(
      http.post(`${BASE}/predict`, () => {
        return HttpResponse.error();
      })
    );
    await uploadAndClassify(makeFile());
    await waitFor(() => {
      expect(screen.getByText(/cannot reach the server/i)).toBeDefined();
    }, { timeout: 5000 });
    expect(screen.getByRole('button', { name: /try again/i })).toBeDefined();
  });
});
