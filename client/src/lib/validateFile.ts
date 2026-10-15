import { env } from "../config/env";

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(file: File): FileValidationResult {
  const allowedTypes = env.VITE_ALLOWED_MIME;
  const maxBytes = env.VITE_MAX_UPLOAD_MB * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Only JPEG, PNG and WebP images are supported.",
    };
  }

  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `The image must be smaller than ${env.VITE_MAX_UPLOAD_MB} MB.`,
    };
  }

  return { valid: true };
}
