// The single HTTP client. All network calls go through here.
// Components and hooks NEVER call fetch() directly or build URLs.

import { env } from "../config/env";
import { ApiError, type ApiErrorKind } from "./errors";

function buildUrl(path: string): string {
  return `${env.VITE_API_BASE_URL}${env.VITE_API_PREFIX}${path}`;
}

interface RequestOptions {
  signal?: AbortSignal;
  timeout?: number;
}

async function parseErrorResponse(response: Response): Promise<ApiError> {
  let detail = response.statusText;
  try {
    const body = await response.json();
    if (typeof body?.detail === "string") detail = body.detail;
  } catch {
    // non-JSON body — keep statusText
  }

  let kind: ApiErrorKind;
  switch (response.status) {
    case 400:
      kind = "validation";
      break;
    case 413:
      kind = "tooLarge";
      break;
    case 415:
      kind = "unsupported";
      break;
    case 503:
      kind = "server";
      break;
    default:
      kind = "network";
  }
  return new ApiError(kind, detail, response.status);
}

export async function get<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const timeout = options.timeout ?? env.VITE_REQUEST_TIMEOUT_MS;
  const controller = new AbortController();

  // Chain user signal with our timeout signal
  const timeoutId = setTimeout(() => controller.abort("timeout"), timeout);
  options.signal?.addEventListener("abort", () => controller.abort(options.signal?.reason));

  try {
    const response = await fetch(buildUrl(path), {
      method: "GET",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) throw await parseErrorResponse(response);
    return response.json() as Promise<T>;
  } catch (err) {
    if (err instanceof ApiError) throw err;

    if (err instanceof DOMException && err.name === "AbortError") {
      const reason = controller.signal.reason;
      if (reason === "timeout") throw new ApiError("timeout", "Request timed out");
      throw new ApiError("cancelled", "Request cancelled");
    }

    throw new ApiError("network", "Cannot reach the server");
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function postForm<T>(
  path: string,
  formData: FormData,
  options: RequestOptions = {}
): Promise<T> {
  const timeout = options.timeout ?? env.VITE_REQUEST_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort("timeout"), timeout);
  options.signal?.addEventListener("abort", () => controller.abort(options.signal?.reason));

  try {
    const response = await fetch(buildUrl(path), {
      method: "POST",
      signal: controller.signal,
      body: formData,
      // Do NOT set Content-Type — browser sets multipart/form-data with boundary
      headers: { Accept: "application/json" },
    });

    if (!response.ok) throw await parseErrorResponse(response);
    return response.json() as Promise<T>;
  } catch (err) {
    if (err instanceof ApiError) throw err;

    if (err instanceof DOMException && err.name === "AbortError") {
      const reason = controller.signal.reason;
      if (reason === "timeout") throw new ApiError("timeout", "Request timed out");
      throw new ApiError("cancelled", "Request cancelled");
    }

    throw new ApiError("network", "Cannot reach the server");
  } finally {
    clearTimeout(timeoutId);
  }
}
