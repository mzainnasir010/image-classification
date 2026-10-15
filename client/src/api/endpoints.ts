// All endpoint wrappers. Components never call client.ts directly.

import { get, postForm } from "./client";
import type { HealthResponse, ModelInfoResponse, PredictionResponse } from "./types";

export function fetchHealth(signal?: AbortSignal): Promise<HealthResponse> {
  return get<HealthResponse>("/health", { signal });
}

export function fetchModelInfo(signal?: AbortSignal): Promise<ModelInfoResponse> {
  return get<ModelInfoResponse>("/model-info", { signal });
}

export async function predict(
  file: File,
  signal?: AbortSignal
): Promise<PredictionResponse> {
  const form = new FormData();
  form.append("file", file);
  return postForm<PredictionResponse>("/predict", form, { signal });
}
