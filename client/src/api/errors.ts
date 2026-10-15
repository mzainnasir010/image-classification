// ApiError: structured error class for all API failures.
// The `kind` discriminant is used by UI components to map to user messages.

export type ApiErrorKind =
  | "validation"  // 400 — invalid file content
  | "server"      // 503 — model not loaded
  | "tooLarge"    // 413 — file too big
  | "unsupported" // 415 — wrong file type
  | "network"     // could not reach server
  | "timeout"     // request timed out
  | "cancelled";  // aborted by user / component unmount

export class ApiError extends Error {
  readonly status: number | null;
  readonly detail: string;
  readonly kind: ApiErrorKind;

  constructor(kind: ApiErrorKind, detail: string, status: number | null = null) {
    super(detail);
    this.name = "ApiError";
    this.kind = kind;
    this.detail = detail;
    this.status = status;
  }
}

/**
 * Maps an ApiError to a human-readable message shown in the UI.
 * Never expose raw backend detail strings to the user.
 */
export function apiErrorMessage(error: ApiError, maxUploadMb?: number): string {
  switch (error.kind) {
    case "validation":
      return "That file could not be read as an image.";
    case "tooLarge":
      return `The image is larger than ${maxUploadMb ?? "the allowed"} MB.`;
    case "unsupported":
      return "Only JPEG, PNG and WebP images are supported.";
    case "server":
      return "The model is starting up. Try again in a moment.";
    case "timeout":
      return "The request timed out. Check your connection and try again.";
    case "cancelled":
      return "The request was cancelled.";
    case "network":
    default:
      return "Cannot reach the server.";
  }
}
