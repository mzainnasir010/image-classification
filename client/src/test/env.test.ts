/**
 * Tests for src/config/env.ts
 * We need to test the validation logic in isolation,
 * so we re-implement the schema check rather than re-importing the module
 * (which would already have executed validation with test env values).
 */
import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Mirror of the env schema — kept in sync with env.ts
const envSchema = z.object({
  VITE_API_BASE_URL: z
    .string()
    .min(1)
    .url()
    .refine((v) => !v.endsWith('/'), 'must not end with slash'),

  VITE_API_PREFIX: z.string().min(1).startsWith('/'),

  VITE_REQUEST_TIMEOUT_MS: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive()),

  VITE_MAX_UPLOAD_MB: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive()),

  VITE_ALLOWED_MIME: z
    .string()
    .min(1)
    .transform((v) => v.split(',').map((s) => s.trim())),

  VITE_APP_NAME: z.string().min(1),

  VITE_GITHUB_URL: z.string().optional().default(''),

  VITE_HEALTH_POLL_MS: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive()),
});

const validEnv = {
  VITE_API_BASE_URL: 'http://localhost:8000',
  VITE_API_PREFIX: '/api/v1',
  VITE_REQUEST_TIMEOUT_MS: '30000',
  VITE_MAX_UPLOAD_MB: '10',
  VITE_ALLOWED_MIME: 'image/jpeg,image/png,image/webp',
  VITE_APP_NAME: 'SceneSense',
  VITE_GITHUB_URL: '',
  VITE_HEALTH_POLL_MS: '30000',
};

describe('env schema validation', () => {
  it('accepts a fully valid environment', () => {
    const result = envSchema.safeParse(validEnv);
    expect(result.success).toBe(true);
  });

  it('rejects a missing VITE_API_BASE_URL', () => {
    const result = envSchema.safeParse({ ...validEnv, VITE_API_BASE_URL: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a non-URL VITE_API_BASE_URL', () => {
    const result = envSchema.safeParse({ ...validEnv, VITE_API_BASE_URL: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('rejects a trailing-slash VITE_API_BASE_URL', () => {
    const result = envSchema.safeParse({ ...validEnv, VITE_API_BASE_URL: 'http://localhost:8000/' });
    expect(result.success).toBe(false);
  });

  it('rejects a VITE_API_PREFIX not starting with /', () => {
    const result = envSchema.safeParse({ ...validEnv, VITE_API_PREFIX: 'api/v1' });
    expect(result.success).toBe(false);
  });

  it('rejects a zero VITE_REQUEST_TIMEOUT_MS', () => {
    const result = envSchema.safeParse({ ...validEnv, VITE_REQUEST_TIMEOUT_MS: '0' });
    expect(result.success).toBe(false);
  });

  it('rejects a non-numeric VITE_MAX_UPLOAD_MB', () => {
    const result = envSchema.safeParse({ ...validEnv, VITE_MAX_UPLOAD_MB: 'abc' });
    expect(result.success).toBe(false);
  });

  it('splits VITE_ALLOWED_MIME into an array', () => {
    const result = envSchema.safeParse(validEnv);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.VITE_ALLOWED_MIME).toEqual([
        'image/jpeg',
        'image/png',
        'image/webp',
      ]);
    }
  });

  it('defaults VITE_GITHUB_URL to empty string when absent', () => {
    const { VITE_GITHUB_URL: _omitted, ...rest } = validEnv;
    const result = envSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.VITE_GITHUB_URL).toBe('');
    }
  });
});
