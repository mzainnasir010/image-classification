/**
 * Tests for src/lib/validateFile.ts
 *
 * We mock import.meta.env because validateFile reads from the env module,
 * which reads from import.meta.env. Vitest supports vi.stubEnv for this.
 */
import { describe, it, expect, vi } from 'vitest';

// We mock the env module so validateFile uses our test values
vi.mock('../config/env', () => ({
  env: {
    VITE_ALLOWED_MIME: ['image/jpeg', 'image/png', 'image/webp'],
    VITE_MAX_UPLOAD_MB: 10,
  },
}));

// Import after mock is set up
const { validateFile } = await import('../lib/validateFile');

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function makeFile(name: string, type: string, size: number): File {
  // Create a fake File object without actual content
  const file = new File(['x'.repeat(Math.min(size, 100))], name, { type });
  // Override the size property (jsdom allows property definition on instances)
  Object.defineProperty(file, 'size', { value: size, writable: false });
  return file;
}

describe('validateFile', () => {
  describe('MIME type validation', () => {
    it('accepts image/jpeg', () => {
      const file = makeFile('photo.jpg', 'image/jpeg', 1024);
      expect(validateFile(file).valid).toBe(true);
    });

    it('accepts image/png', () => {
      const file = makeFile('photo.png', 'image/png', 1024);
      expect(validateFile(file).valid).toBe(true);
    });

    it('accepts image/webp', () => {
      const file = makeFile('photo.webp', 'image/webp', 1024);
      expect(validateFile(file).valid).toBe(true);
    });

    it('rejects image/gif', () => {
      const file = makeFile('anim.gif', 'image/gif', 1024);
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/JPEG, PNG and WebP/i);
    });

    it('rejects application/pdf', () => {
      const file = makeFile('doc.pdf', 'application/pdf', 1024);
      expect(validateFile(file).valid).toBe(false);
    });

    it('rejects empty MIME type', () => {
      const file = makeFile('noext', '', 1024);
      expect(validateFile(file).valid).toBe(false);
    });
  });

  describe('size validation', () => {
    it('accepts a file exactly at the limit', () => {
      const file = makeFile('big.jpg', 'image/jpeg', MAX_BYTES);
      expect(validateFile(file).valid).toBe(true);
    });

    it('rejects a file one byte over the limit', () => {
      const file = makeFile('toobig.jpg', 'image/jpeg', MAX_BYTES + 1);
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/10 MB/);
    });

    it('rejects an extremely large file', () => {
      const file = makeFile('huge.jpg', 'image/jpeg', 100 * 1024 * 1024);
      expect(validateFile(file).valid).toBe(false);
    });
  });
});
