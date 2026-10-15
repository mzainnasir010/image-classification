import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z
    .string()
    .min(1, "VITE_API_BASE_URL is required")
    .url("VITE_API_BASE_URL must be a valid URL")
    .refine((v) => !v.endsWith("/"), "VITE_API_BASE_URL must not end with a slash"),

  VITE_API_PREFIX: z
    .string()
    .min(1, "VITE_API_PREFIX is required")
    .startsWith("/", "VITE_API_PREFIX must start with /"),

  VITE_REQUEST_TIMEOUT_MS: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive("VITE_REQUEST_TIMEOUT_MS must be a positive integer")),

  VITE_MAX_UPLOAD_MB: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive("VITE_MAX_UPLOAD_MB must be a positive integer")),

  VITE_ALLOWED_MIME: z
    .string()
    .min(1, "VITE_ALLOWED_MIME is required")
    .transform((v) => v.split(",").map((s) => s.trim())),

  VITE_APP_NAME: z.string().min(1, "VITE_APP_NAME is required"),

  VITE_GITHUB_URL: z.string().optional().default(""),

  VITE_HEALTH_POLL_MS: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive("VITE_HEALTH_POLL_MS must be a positive integer")),
});

function validateEnv() {
  const result = envSchema.safeParse({
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_API_PREFIX: import.meta.env.VITE_API_PREFIX,
    VITE_REQUEST_TIMEOUT_MS: import.meta.env.VITE_REQUEST_TIMEOUT_MS,
    VITE_MAX_UPLOAD_MB: import.meta.env.VITE_MAX_UPLOAD_MB,
    VITE_ALLOWED_MIME: import.meta.env.VITE_ALLOWED_MIME,
    VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
    VITE_GITHUB_URL: import.meta.env.VITE_GITHUB_URL,
    VITE_HEALTH_POLL_MS: import.meta.env.VITE_HEALTH_POLL_MS,
  });

  if (!result.success) {
    const errors = result.error.issues
      .map((e) => `  \u2022 ${e.path.map(String).join(".")}: ${e.message}`)
      .join("\n");
    throw new Error(
      `\n\n[SceneSense] Environment configuration is invalid:\n${errors}\n\n` +
        `Copy .env.example to .env.local and fill in the required values.\n`
    );
  }

  return result.data;
}

export const env = validateEnv();

export type Env = typeof env;
